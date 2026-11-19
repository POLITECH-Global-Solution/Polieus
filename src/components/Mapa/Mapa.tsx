import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap } from 'react-leaflet';
import L, { type LatLngBoundsExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';

export type PrioridadeOcorrencia = 'alta' | 'media' | 'baixa' | 'nao-informada';
export interface OcorrenciaMapa {
    id: number;
    categoria: string;
    descricao: string;
    endereco: string;
    cidade: string;
    cep?: string;
    prioridade: PrioridadeOcorrencia;
    status: string;
    latitude: number;
    longitude: number;
}
interface MapaProps {
    ocorrencias?: OcorrenciaMapa[];
    ocorrenciaSelecionadaId?: number | null;
    aoSelecionarOcorrencia?: (ocorrencia: OcorrenciaMapa) => void;
    altura?: string;
    carregando?: boolean;
}
interface GrupoOcorrencias {
    chave: string;
    latitude: number;
    longitude: number;
    ocorrencias: OcorrenciaMapa[];
}

const CENTRO_SAO_PAULO: [number, number] = [-22.6, -48.5];

const LIMITES_SAO_PAULO: LatLngBoundsExpression = [
    [-25.35, -53.15],
    [-19.75, -44.05],
];

const LIMITES_NAVEGACAO: LatLngBoundsExpression = [
    [-26.2, -54.0],
    [-18.9, -43.2],
];

const CORES_PRIORIDADE: Record<PrioridadeOcorrencia, string> = {
    alta: '#b3261e',
    media: '#e99a3e',
    baixa: '#4caf50',
    'nao-informada': '#808080',
};

const NOMES_PRIORIDADE: Record<PrioridadeOcorrencia, string> = {
    alta: 'Alta',
    media: 'Média',
    baixa: 'Baixa',
    'nao-informada': 'Não informada',
};

//CRIAÇÃO DO MARCADOR DE OCORRÊNCIAS
function criarIconePrioridade(prioridade: PrioridadeOcorrencia, selecionado: boolean) {
    const cor = CORES_PRIORIDADE[prioridade];
    const tamanho = selecionado ? 42 : 36;

    return L.divIcon({
        className: '',
        html: `
            <div style="
                position: relative;
                width: ${tamanho}px;
                height: ${tamanho}px;
                display: flex;
                align-items: center;
                justify-content: center;
                filter: drop-shadow(0 3px 4px rgba(0,0,0,0.25));
            ">
                <svg width="${tamanho}" height="${tamanho}" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M18 2C10.3 2 4 8.3 4 16c0 10 14 18 14 18s14-8 14-18C32 8.3 25.7 2 18 2Z" fill="${cor}" stroke="#ffffff" stroke-width="2" />
                    <circle cx="18" cy="16" r="5" fill="#ffffff" />
                </svg>
            </div>
        `,
        iconSize: [tamanho, tamanho],
        iconAnchor: [tamanho / 2, tamanho],
        popupAnchor: [0, -tamanho + 6],
    });
}

function criarIconeGrupo(quantidade: number, selecionado: boolean) {
    const tamanho = selecionado ? 52 : 46;

    return L.divIcon({
        className: '',
        html: `
            <div style="
                width: ${tamanho}px;
                height: ${tamanho}px;
                display: flex;
                align-items: center;
                justify-content: center;
                background-color: #78221b;
                border: 3px solid #ffffff;
                border-radius: 50%;
                color: #ffffff;
                font-size: 17px;
                font-weight: bold;
                box-shadow: 0 3px 8px rgba(0,0,0,0.25);
            ">
                ${quantidade}
            </div>
        `,
        iconSize: [tamanho, tamanho],
        iconAnchor: [tamanho / 2, tamanho / 2],
        popupAnchor: [0, -tamanho / 2],
    });
}

// AGRUPAR OCORRÊNCIAS COM AS MESMAS COORDENADAS
function agruparOcorrencias(ocorrencias: OcorrenciaMapa[]): GrupoOcorrencias[] {
    const grupos = new Map<string, GrupoOcorrencias>();

    for (const ocorrencia of ocorrencias) {
        const chave = `${ocorrencia.latitude},${ocorrencia.longitude}`;
        const grupo = grupos.get(chave);

        if (grupo) {
            grupo.ocorrencias.push(ocorrencia);
        } else {
            grupos.set(chave, {
                chave,
                latitude: ocorrencia.latitude,
                longitude: ocorrencia.longitude,
                ocorrencias: [ocorrencia],
            });
        }
    }

    return Array.from(grupos.values());
}

function AjustarVisualizacao({ grupos, ocorrenciaSelecionada }: {
    grupos: GrupoOcorrencias[];
    ocorrenciaSelecionada?: OcorrenciaMapa;
}) {
    const mapa = useMap();

    useEffect(() => {
        if (grupos.length === 0) {
            mapa.setView(CENTRO_SAO_PAULO, 7);
            return;
        }

        if (grupos.length === 1) {
            mapa.setView(
                [grupos[0].latitude, grupos[0].longitude],
                11
            );

            return;
        }

        const limites = L.latLngBounds(
            grupos.map(grupo =>
                L.latLng(grupo.latitude, grupo.longitude)
            )
        );

        mapa.fitBounds(limites, {
            padding: [50, 50],
            maxZoom: 12,
        });

    }, [mapa, grupos]);

    useEffect(() => {
        if (!ocorrenciaSelecionada) return;

        mapa.flyTo(
            [ocorrenciaSelecionada.latitude, ocorrenciaSelecionada.longitude],
            Math.max(mapa.getZoom(), 12),
            { animate: true, duration: 1.2 }
        );

    }, [mapa, ocorrenciaSelecionada]);

    return null;
}

export default function Mapa({
    ocorrencias = [],
    ocorrenciaSelecionadaId = null,
    aoSelecionarOcorrencia,
    altura = '520px',
    carregando = false,
}: MapaProps) {
    const [mapaPronto, setMapaPronto] = useState(false);

    // VALIDAR COORDENADAS
    const ocorrenciasValidas = useMemo(
        () => ocorrencias.filter(ocorrencia =>
            Number.isFinite(ocorrencia.latitude) &&
            Number.isFinite(ocorrencia.longitude) &&
            ocorrencia.latitude >= -25.35 &&
            ocorrencia.latitude <= -19.75 &&
            ocorrencia.longitude >= -53.15 &&
            ocorrencia.longitude <= -44.05
        ),
        [ocorrencias]
    );

    // AGRUPAR MARCADORES
    const grupos = useMemo(
        () => agruparOcorrencias(ocorrenciasValidas),
        [ocorrenciasValidas]
    );

    const ocorrenciaSelecionada = ocorrenciasValidas.find(
        ocorrencia => ocorrencia.id === ocorrenciaSelecionadaId
    );

    return (
        <div className="relative isolate w-full overflow-hidden rounded-xl border border-secundaria bg-fundo shadow-sm" style={{ height: altura }}>
            <MapContainer center={CENTRO_SAO_PAULO} zoom={7} minZoom={6} maxZoom={19} maxBounds={LIMITES_NAVEGACAO} maxBoundsViscosity={1} zoomControl={false} scrollWheelZoom={true} className="h-full w-full" whenReady={() => setMapaPronto(true)}>
                <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" maxZoom={19} />
                <ZoomControl position="bottomleft" />
                <AjustarVisualizacao grupos={grupos} ocorrenciaSelecionada={ocorrenciaSelecionada} />

                {/* MARCADORES */}
                {grupos.map(grupo => {
                    const agrupado = grupo.ocorrencias.length > 1;

                    const selecionado = grupo.ocorrencias.some(
                        ocorrencia => ocorrencia.id === ocorrenciaSelecionadaId
                    );

                    const primeiraOcorrencia = grupo.ocorrencias[0];

                    const icone = agrupado
                        ? criarIconeGrupo(grupo.ocorrencias.length, selecionado)
                        : criarIconePrioridade(primeiraOcorrencia.prioridade, selecionado);

                    return (
                        <Marker key={grupo.chave} position={[grupo.latitude, grupo.longitude]} icon={icone} eventHandlers={{
                            click: () => {
                                if (!agrupado) {
                                    aoSelecionarOcorrencia?.(primeiraOcorrencia);
                                }
                            },
                        }}>

                            <Popup maxWidth={320}>
                                {agrupado ? (

                                    <div className="min-w-52 font-corpo">
                                        <h3 className="mb-1 font-titulo text-lg font-bold text-primaria">
                                            {primeiraOcorrencia.cidade}
                                        </h3>
                                        <p className="text-sm text-texto-suave">
                                            {grupo.ocorrencias.length} ocorrências registradas
                                        </p>
                                        <p className="text-xs text-texto-suave">
                                            Localização aproximada por município.
                                        </p>
                                        <div className="my-3 h-px bg-secundaria" />

                                        <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                                            {grupo.ocorrencias.map(ocorrencia => (
                                                <button key={ocorrencia.id} type="button" onClick={() => aoSelecionarOcorrencia?.(ocorrencia)} aria-pressed={ocorrencia.id === ocorrenciaSelecionadaId} className={`w-full cursor-pointer rounded-lg border p-3 text-left transition-colors ${ocorrencia.id === ocorrenciaSelecionadaId ? 'border-primaria bg-[#f0dfd4]' : 'border-[#dfc2ae] bg-[#fffaf5] hover:bg-[#f3e5d9]'}`}>
                                                    <div className="flex items-center gap-2">
                                                        <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: CORES_PRIORIDADE[ocorrencia.prioridade] }} />
                                                        <span className="text-sm font-bold text-primaria">
                                                            {ocorrencia.categoria}
                                                        </span>
                                                    </div>

                                                    <div className="mt-2 text-xs leading-relaxed text-texto">
                                                        {ocorrencia.descricao}
                                                    </div>

                                                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2">

                                                        <span className="text-xs text-texto-suave">
                                                            {ocorrencia.status}
                                                        </span>

                                                        <span className="text-xs font-semibold text-primaria">
                                                            Ver detalhes
                                                        </span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ) : (


                                    <div className="min-w-48 font-corpo">
                                        <h3 className="mb-1 text-base font-bold text-primaria">
                                            {primeiraOcorrencia.categoria}
                                        </h3>
                                        <p className="mb-2 text-sm text-texto">
                                            {primeiraOcorrencia.descricao}
                                        </p>
                                        <div className="space-y-1 text-xs text-texto-suave">
                                            <p>
                                                <strong>Endereço:</strong> {primeiraOcorrencia.endereco}
                                            </p>
                                            {primeiraOcorrencia.cep && (
                                                <p>
                                                    <strong>CEP:</strong> {primeiraOcorrencia.cep}
                                                </p>
                                            )}
                                            <p>
                                                <strong>Cidade:</strong> {primeiraOcorrencia.cidade}
                                            </p>

                                            <p>
                                                <strong>Prioridade:</strong> {NOMES_PRIORIDADE[primeiraOcorrencia.prioridade]}
                                            </p>

                                            <p>
                                                <strong>Status:</strong> {primeiraOcorrencia.status}
                                            </p>

                                        </div>
                                        <div className="mt-3 border-t border-secundaria pt-3 text-xs text-texto-suave">
                                            Localização aproximada por município.
                                        </div>
                                        <button type="button" onClick={() => aoSelecionarOcorrencia?.(primeiraOcorrencia)} className="mt-3 w-full cursor-pointer rounded-lg bg-primaria px-3 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90">
                                            Ver detalhes
                                        </button>
                                    </div>
                                )}
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>

            {/* CARREGAMENTO */}
            {carregando && (
                <div role="status" className="pointer-events-none absolute bottom-5 left-1/2 z-1000 w-[calc(100%-32px)] max-w-sm -translate-x-1/2 rounded-xl border border-secundaria bg-fundo px-4 py-4 text-center shadow-md">
                    <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-secundaria border-t-primaria" />
                    <p className="font-corpo text-sm font-semibold text-texto">
                        Carregando ocorrências...
                    </p>
                </div>
            )}

            {mapaPronto && !carregando && ocorrenciasValidas.length === 0 && (
                <div role="status" className="pointer-events-none absolute bottom-5 left-1/2 z-1000 w-[calc(100%-32px)] max-w-sm -translate-x-1/2 rounded-xl border border-secundaria bg-fundo px-4 py-3 text-center shadow-md">

                    <span className="material-icons mb-1 text-2xl text-primaria" aria-hidden="true">
                        location_off
                    </span>

                    <p className="font-corpo text-sm font-semibold text-texto">
                        Nenhuma ocorrência localizada no mapa.
                    </p>

                    <p className="mt-1 font-corpo text-xs text-texto-suave">
                        Os marcadores aparecerão conforme as localizações forem disponibilizadas.
                    </p>
                </div>
            )}

            {/* IDENTIFICAÇÃO DO ESTADO */}
            <div className="pointer-events-none absolute right-4 top-4 z-1000 rounded-lg border border-secundaria bg-fundo px-3 py-2 shadow-sm">
                <p className="font-corpo text-xs font-semibold text-primaria">
                    Estado de São Paulo
                </p>
            </div>

            {/* LEGENDA DOS MARCADORES */}
            {!carregando && grupos.some(grupo => grupo.ocorrencias.length > 1) && (
                <div className="pinter-events-none absolute bottom-8 right-3 z-1000 flex max-w-[65%] items-center gap-2 rounded-lg border border-secundaria bg-fundo px-3 py-2 shadow-sm">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#78221b] text-xs font-bold text-white">
                        #
                    </span>
                    <p className="font-corpo text-xs text-texto-suave">
                        Ocorrências agrupadas
                    </p>
                </div>
            )}
        </div>
    );
}

export { LIMITES_SAO_PAULO };
