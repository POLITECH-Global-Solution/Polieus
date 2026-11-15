import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

type Prioridade = 'Alta' | 'Média' | 'Baixa';
type Status = 'Pendente' | 'Em análise' | 'Em andamento' | 'Resolvida';

interface Ocorrencia {
    id: string;
    protocolo: string;
    categoria: string;
    descricao: string;
    bairro: string;
    cidade: string;
    status: Status;
    prioridade: Prioridade | null;
    dataCriacao: string;
    latitude: number;
    longitude: number;
}

interface Filtros {
    categoria: string;
    status: string;
    prioridade: string;
    periodo: string;
}

const centroSaoPaulo: [number, number] = [-23.5505, -46.6333];

// Limites aproximados da região do estado de São Paulo
const limitesSaoPaulo = L.latLngBounds(
    L.latLng(-25.4, -53.2),
    L.latLng(-19.7, -44.0)
);

const filtrosIniciais: Filtros = {
    categoria: '',
    status: '',
    prioridade: '',
    periodo: '',
};

const categorias = [
    'Iluminação pública',
    'Saneamento',
    'Transporte público',
    'Infraestrutura',
    'Limpeza urbana',
    'Segurança',
    'Meio ambiente',
    'Acessibilidade',
    'Outros',
];

const statusDisponiveis: Status[] = [
    'Pendente',
    'Em análise',
    'Em andamento',
    'Resolvida',
];

const prioridades: Prioridade[] = ['Alta', 'Média', 'Baixa'];

const campoClasse =
    'w-full rounded-lg border border-[#dec3b2] bg-[#fffaf6] px-3 py-2.5 text-sm text-texto outline-none transition-colors focus:border-primaria focus:ring-2 focus:ring-primaria/15';

function Icone({ nome, classe = '' }: { nome: string; classe?: string }) {
    return (
        <span className={`material-icons ${classe}`} aria-hidden="true">
            {nome}
        </span>
    );
}

function criarIcone(prioridade: Prioridade | null) {
    const cores: Record<Prioridade, string> = {
        Alta: '#b3261e',
        Média: '#e99a3e',
        Baixa: '#4f7b43',
    };

    const cor = prioridade ? cores[prioridade] : '#8d8276';

    return L.divIcon({
        className: '',
        html: `
            <div style="
                width: 32px;
                height: 32px;
                background: ${cor};
                border: 3px solid white;
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                box-shadow: 0 3px 9px rgba(0,0,0,0.25);
                display: flex;
                align-items: center;
                justify-content: center;
            ">
                <div style="
                    width: 10px;
                    height: 10px;
                    background: white;
                    border-radius: 50%;
                "></div>
            </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -30],
    });
}

function estaNoPeriodo(data: string, periodo: string) {
    if (!periodo) return true;

    const criacao = new Date(data);

    if (Number.isNaN(criacao.getTime())) return false;

    const hoje = new Date();
    const inicio = new Date(hoje);

    inicio.setDate(hoje.getDate() - Number(periodo));

    return criacao >= inicio && criacao <= hoje;
}

function AjustarMapa() {
    const mapa = useMap();

    useEffect(() => {
        mapa.fitBounds(limitesSaoPaulo, {
            padding: [20, 20],
        });

        const atualizar = window.setTimeout(() => {
            mapa.invalidateSize();
        }, 150);

        return () => window.clearTimeout(atualizar);
    }, [mapa]);

    return null;
}

async function consultarOcorrencias(): Promise<Ocorrencia[]> {
    // Integração futura com a API Java.
    // A API deverá fornecer as ocorrências reais com coordenadas.
    // Nenhuma ocorrência demonstrativa será utilizada.

    return [];
}

export default function MapaOcorrenciasAdmin() {
    const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
    const [filtros, setFiltros] = useState<Filtros>(filtrosIniciais);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');

    useEffect(() => {
        let ativo = true;

        const carregar = async () => {
            try {
                const registros = await consultarOcorrencias();

                if (ativo) {
                    setOcorrencias(registros);
                    setErro('');
                }
            } catch {
                if (ativo) {
                    setErro('Não foi possível carregar as ocorrências.');
                }
            } finally {
                if (ativo) {
                    setCarregando(false);
                }
            }
        };

        void carregar();

        return () => {
            ativo = false;
        };
    }, []);

    const ocorrenciasFiltradas = useMemo(() => {
        return ocorrencias.filter((ocorrencia) =>
            (!filtros.categoria || ocorrencia.categoria === filtros.categoria) &&
            (!filtros.status || ocorrencia.status === filtros.status) &&
            (!filtros.prioridade || ocorrencia.prioridade === filtros.prioridade) &&
            estaNoPeriodo(ocorrencia.dataCriacao, filtros.periodo) &&
            Number.isFinite(ocorrencia.latitude) &&
            Number.isFinite(ocorrencia.longitude) &&
            limitesSaoPaulo.contains([
                ocorrencia.latitude,
                ocorrencia.longitude,
            ])
        );
    }, [ocorrencias, filtros]);

    const indicadores = useMemo(() => ({
        total: ocorrenciasFiltradas.length,
        alta: ocorrenciasFiltradas.filter(
            (item) => item.prioridade === 'Alta'
        ).length,
        media: ocorrenciasFiltradas.filter(
            (item) => item.prioridade === 'Média'
        ).length,
        baixa: ocorrenciasFiltradas.filter(
            (item) => item.prioridade === 'Baixa'
        ).length,
    }), [ocorrenciasFiltradas]);

    return (
        <main className="min-h-screen w-full bg-fundo font-corpo text-texto">
            <div className="mx-auto max-w-400 px-5 py-7 sm:px-8 lg:px-10">
                <header className="border-b border-[#cda998] pb-5">
                    <div className="flex items-center gap-2 text-primaria">
                        <Icone nome="account_balance" classe="text-2xl" />

                        <span className="font-titulo text-lg font-bold">
                            Área Administrativa
                        </span>
                    </div>

                    <h1 className="mt-5 font-titulo text-3xl font-bold text-[#75211b] sm:text-4xl">
                        Mapa de Ocorrências
                    </h1>

                    <p className="mt-2 text-sm text-texto-suave">
                        Visualize as ocorrências no mapa, filtre por categoria,
                        status e prioridade.
                    </p>
                </header>

                <section className="mt-5 rounded-xl border border-[#dfc2ae] bg-[#fffaf6] p-4 shadow-sm">
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <div>
                            <label
                                htmlFor="mapa-categoria"
                                className="mb-2 block text-xs font-semibold text-[#75211b]"
                            >
                                Categoria
                            </label>

                            <select
                                id="mapa-categoria"
                                value={filtros.categoria}
                                onChange={(evento) =>
                                    setFiltros((atual) => ({
                                        ...atual,
                                        categoria: evento.target.value,
                                    }))
                                }
                                className={campoClasse}
                            >
                                <option value="">Todas</option>

                                {categorias.map((categoria) => (
                                    <option key={categoria} value={categoria}>
                                        {categoria}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label
                                htmlFor="mapa-status"
                                className="mb-2 block text-xs font-semibold text-[#75211b]"
                            >
                                Status
                            </label>

                            <select
                                id="mapa-status"
                                value={filtros.status}
                                onChange={(evento) =>
                                    setFiltros((atual) => ({
                                        ...atual,
                                        status: evento.target.value,
                                    }))
                                }
                                className={campoClasse}
                            >
                                <option value="">Todos</option>

                                {statusDisponiveis.map((status) => (
                                    <option key={status} value={status}>
                                        {status}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label
                                htmlFor="mapa-prioridade"
                                className="mb-2 block text-xs font-semibold text-[#75211b]"
                            >
                                Prioridade
                            </label>

                            <select
                                id="mapa-prioridade"
                                value={filtros.prioridade}
                                onChange={(evento) =>
                                    setFiltros((atual) => ({
                                        ...atual,
                                        prioridade: evento.target.value,
                                    }))
                                }
                                className={campoClasse}
                            >
                                <option value="">Todas</option>

                                {prioridades.map((prioridade) => (
                                    <option key={prioridade} value={prioridade}>
                                        {prioridade}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label
                                htmlFor="mapa-periodo"
                                className="mb-2 block text-xs font-semibold text-[#75211b]"
                            >
                                Período
                            </label>

                            <select
                                id="mapa-periodo"
                                value={filtros.periodo}
                                onChange={(evento) =>
                                    setFiltros((atual) => ({
                                        ...atual,
                                        periodo: evento.target.value,
                                    }))
                                }
                                className={campoClasse}
                            >
                                <option value="">Todo o período</option>
                                <option value="7">Últimos 7 dias</option>
                                <option value="30">Últimos 30 dias</option>
                                <option value="90">Últimos 90 dias</option>
                            </select>
                        </div>
                    </div>
                </section>

                <div className="mt-5 grid items-stretch gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(280px,0.7fr)]">
                    <section className="min-w-0 overflow-hidden rounded-xl border border-[#dfc2ae] bg-[#fffaf6] shadow-sm">
                        <div className="relative h-125 w-full sm:h-145">
                            <MapContainer
                                center={centroSaoPaulo}
                                zoom={7}
                                minZoom={6}
                                maxZoom={18}
                                maxBounds={limitesSaoPaulo}
                                maxBoundsViscosity={1}
                                scrollWheelZoom={true}
                                className="h-full w-full"
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />

                                <AjustarMapa />

                                {ocorrenciasFiltradas.map((ocorrencia) => (
                                    <Marker
                                        key={ocorrencia.id}
                                        position={[
                                            ocorrencia.latitude,
                                            ocorrencia.longitude,
                                        ]}
                                        icon={criarIcone(ocorrencia.prioridade)}
                                    >
                                        <Popup>
                                            <div className="min-w-45 font-corpo">
                                                <p className="font-bold text-[#75211b]">
                                                    Ocorrência {ocorrencia.protocolo}
                                                </p>

                                                <p className="mt-2 text-sm">
                                                    {ocorrencia.categoria}
                                                </p>

                                                <p className="text-sm">
                                                    {ocorrencia.bairro} — {ocorrencia.cidade}
                                                </p>

                                                <p className="mt-1 text-sm">
                                                    Prioridade: {ocorrencia.prioridade ?? 'Não definida'}
                                                </p>

                                                <p className="text-sm">
                                                    Status: {ocorrencia.status}
                                                </p>
                                            </div>
                                        </Popup>
                                    </Marker>
                                ))}
                            </MapContainer>
                        </div>
                    </section>

                    <aside className="flex flex-col rounded-xl border border-[#dfc2ae] bg-[#fffaf6] p-5 shadow-sm">
                        <h2 className="flex items-center gap-2 border-b border-[#ead5c7] pb-4 font-titulo text-lg font-bold text-[#78221b]">
                            <Icone nome="location_on" classe="text-2xl" />
                            Ocorrências no mapa
                        </h2>

                        <p className="border-b border-[#ead5c7] py-4 text-4xl font-bold text-[#78221b]">
                            {indicadores.total.toLocaleString('pt-BR')}
                        </p>

                        <div className="mt-5 space-y-5">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <Icone
                                        nome="location_on"
                                        classe="text-2xl text-red-700"
                                    />
                                    <span className="text-sm">
                                        Alta prioridade
                                    </span>
                                </div>

                                <strong>{indicadores.alta}</strong>
                            </div>

                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <Icone
                                        nome="location_on"
                                        classe="text-2xl text-orange-400"
                                    />
                                    <span className="text-sm">
                                        Média prioridade
                                    </span>
                                </div>

                                <strong>{indicadores.media}</strong>
                            </div>

                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <Icone
                                        nome="location_on"
                                        classe="text-2xl text-green-700"
                                    />
                                    <span className="text-sm">
                                        Baixa prioridade
                                    </span>
                                </div>

                                <strong>{indicadores.baixa}</strong>
                            </div>
                        </div>

                        <div className="mt-auto pt-8">
                            {carregando && (
                                <p className="mb-4 text-center text-xs text-texto-suave">
                                    Carregando ocorrências...
                                </p>
                            )}

                            {erro && (
                                <p
                                    role="alert"
                                    className="mb-4 text-center text-xs text-red-700"
                                >
                                    {erro}
                                </p>
                            )}

                            {!carregando && !erro && indicadores.total === 0 && (
                                <p className="mb-4 text-center text-xs leading-relaxed text-texto-suave">
                                    Nenhuma ocorrência disponível para os filtros selecionados.
                                </p>
                            )}

                            <Link
                                to="/admin/gerenciar-ocorrencias"
                                className="flex items-center justify-center gap-2 rounded-lg bg-primaria px-5 py-3 text-sm font-semibold transition-colors hover:bg-primaria-hover"
                                style={{ color: '#ffffff' }}
                            >
                                <Icone nome="list" classe="text-xl" />
                                Visualizar em lista
                            </Link>
                        </div>
                    </aside>
                </div>
            </div>
        </main>
    );
}
