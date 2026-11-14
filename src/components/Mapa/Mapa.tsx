import { useEffect, useMemo, useState } from 'react';
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    ZoomControl,
    useMap,
} from 'react-leaflet';
import L, { type LatLngBoundsExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';

export type PrioridadeOcorrencia = 'alta' | 'media' | 'baixa';

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
    baixa: '#d8bfa9',
};

const NOMES_PRIORIDADE: Record<PrioridadeOcorrencia, string> = {
    alta: 'Alta',
    media: 'Média',
    baixa: 'Baixa',
};

function criarIconePrioridade(
    prioridade: PrioridadeOcorrencia,
    selecionado: boolean
) {
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
                <svg
                    width="${tamanho}"
                    height="${tamanho}"
                    viewBox="0 0 36 36"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                >
                    <path
                        d="M18 2C10.3 2 4 8.3 4 16c0 10 14 18 14 18s14-8 14-18C32 8.3 25.7 2 18 2Z"
                        fill="${cor}"
                        stroke="#ffffff"
                        stroke-width="2"
                    />
                    <circle
                        cx="18"
                        cy="16"
                        r="5"
                        fill="#ffffff"
                    />
                </svg>
            </div>
        `,
        iconSize: [tamanho, tamanho],
        iconAnchor: [tamanho / 2, tamanho],
        popupAnchor: [0, -tamanho + 6],
    });
}

function AjustarVisualizacao({
    ocorrenciaSelecionada,
}: {
    ocorrenciaSelecionada?: OcorrenciaMapa;
}) {
    const mapa = useMap();

    useEffect(() => {
        if (!ocorrenciaSelecionada) return;

        mapa.flyTo(
            [
                ocorrenciaSelecionada.latitude,
                ocorrenciaSelecionada.longitude,
            ],
            Math.max(mapa.getZoom(), 15),
            {
                animate: true,
                duration: 1.2,
            }
        );
    }, [mapa, ocorrenciaSelecionada]);

    return null;
}

export default function Mapa({
    ocorrencias = [],
    ocorrenciaSelecionadaId = null,
    aoSelecionarOcorrencia,
    altura = '520px',
}: MapaProps) {
    const [mapaPronto, setMapaPronto] = useState(false);

    const ocorrenciasValidas = useMemo(
        () =>
            ocorrencias.filter(
                (ocorrencia) =>
                    Number.isFinite(ocorrencia.latitude) &&
                    Number.isFinite(ocorrencia.longitude) &&
                    ocorrencia.latitude >= -25.35 &&
                    ocorrencia.latitude <= -19.75 &&
                    ocorrencia.longitude >= -53.15 &&
                    ocorrencia.longitude <= -44.05
            ),
        [ocorrencias]
    );

    const ocorrenciaSelecionada = ocorrenciasValidas.find(
        (ocorrencia) => ocorrencia.id === ocorrenciaSelecionadaId
    );

    return (
        <div
            className="relative w-full overflow-hidden rounded-xl border border-secundaria bg-fundo shadow-sm"
            style={{ height: altura }}
        >
            <MapContainer
                center={CENTRO_SAO_PAULO}
                zoom={7}
                minZoom={6}
                maxZoom={19}
                maxBounds={LIMITES_NAVEGACAO}
                maxBoundsViscosity={1}
                zoomControl={false}
                scrollWheelZoom={true}
                className="h-full w-full"
                whenReady={() => setMapaPronto(true)}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    maxZoom={19}
                />

                <ZoomControl position="bottomleft" />

                <AjustarVisualizacao
                    ocorrenciaSelecionada={ocorrenciaSelecionada}
                />

                {ocorrenciasValidas.map((ocorrencia) => {
                    const selecionado =
                        ocorrencia.id === ocorrenciaSelecionadaId;

                    return (
                        <Marker
                            key={ocorrencia.id}
                            position={[
                                ocorrencia.latitude,
                                ocorrencia.longitude,
                            ]}
                            icon={criarIconePrioridade(
                                ocorrencia.prioridade,
                                selecionado
                            )}
                            eventHandlers={{
                                click: () => {
                                    aoSelecionarOcorrencia?.(ocorrencia);
                                },
                            }}
                        >
                            <Popup>
                                <div className="min-w-48 font-corpo">
                                    <p className="mb-1 text-base font-bold text-primaria">
                                        {ocorrencia.categoria}
                                    </p>

                                    <p className="mb-2 text-sm text-texto">
                                        {ocorrencia.descricao}
                                    </p>

                                    <div className="space-y-1 text-xs text-texto-suave">
                                        <p>
                                            <strong>Endereço:</strong>{' '}
                                            {ocorrencia.endereco}
                                        </p>

                                        <p>
                                            <strong>Cidade:</strong>{' '}
                                            {ocorrencia.cidade}
                                        </p>

                                        <p>
                                            <strong>Prioridade:</strong>{' '}
                                            {NOMES_PRIORIDADE[
                                                ocorrencia.prioridade
                                            ]}
                                        </p>

                                        <p>
                                            <strong>Status:</strong>{' '}
                                            {ocorrencia.status}
                                        </p>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>

            {mapaPronto && ocorrenciasValidas.length === 0 && (
                <div className="pointer-events-none absolute bottom-5 left-1/2 z-400 w-[calc(100%-32px)] max-w-sm -translate-x-1/2 rounded-xl border border-secundaria bg-fundo px-4 py-3 text-center shadow-md">
                    <span
                        className="material-icons mb-1 text-2xl text-primaria"
                        aria-hidden="true"
                    >
                        location_off
                    </span>

                    <p className="font-corpo text-sm font-semibold text-texto">
                        Nenhuma ocorrência localizada no mapa.
                    </p>

                    <p className="mt-1 font-corpo text-xs text-texto-suave">
                        Os marcadores aparecerão conforme as ocorrências
                        forem disponibilizadas.
                    </p>
                </div>
            )}

            <div className="pointer-events-none absolute right-4 top-4 z-400 rounded-lg border border-secundaria bg-fundo px-3 py-2 shadow-sm">
                <p className="font-corpo text-xs font-semibold text-primaria">
                    Estado de São Paulo
                </p>
            </div>
        </div>
    );
}

export { LIMITES_SAO_PAULO };
