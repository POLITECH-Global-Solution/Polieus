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
    bairro?: string;
    cidade?: string;
    localizacao?: string;
    status: Status;
    prioridade: Prioridade | null;
    dataCriacao: string;
    latitude?: number;
    longitude?: number;
}

interface Orcamento {
    id: string;
    ocorrenciaId: string;
    total: number;
    situacao: string;
}

const CHAVE_OCORRENCIAS = 'polieus_ocorrencias';
const CHAVE_ORCAMENTOS = 'polieus_orcamentos';

const centroSaoPaulo: [number, number] = [-23.5505, -46.6333];

const limitesSaoPaulo = L.latLngBounds(
    L.latLng(-25.4, -53.2),
    L.latLng(-19.7, -44.0)
);

const coresPrioridade: Record<Prioridade, string> = {
    Alta: '#b3261e',
    Média: '#e99a3e',
    Baixa: '#4f7b43',
};

const coresStatus: Record<Status, string> = {
    Pendente: 'bg-[#f5c5bc] text-[#7d211b]',
    'Em análise': 'bg-[#ffdda4] text-[#75420a]',
    'Em andamento': 'bg-[#d3e3ee] text-[#214e68]',
    Resolvida: 'bg-[#d8e4c8] text-[#35562d]',
};

const statusDisponiveis: { nome: Status; cor: string }[] = [
    { nome: 'Pendente', cor: '#b3261e' },
    { nome: 'Em análise', cor: '#e99a3e' },
    { nome: 'Em andamento', cor: '#668fa5' },
    { nome: 'Resolvida', cor: '#4f7b43' },
];

function Icone({ nome, classe = '' }: { nome: string; classe?: string }) {
    return (
        <span className={`material-icons ${classe}`} aria-hidden="true">
            {nome}
        </span>
    );
}

function numero(valor: number) {
    return valor.toLocaleString('pt-BR');
}

function moeda(valor: number) {
    return valor.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    });
}

function lerLista<T>(chave: string): T[] {
    try {
        const conteudo = localStorage.getItem(chave);
        const dados: unknown = conteudo ? JSON.parse(conteudo) : [];
        return Array.isArray(dados) ? dados as T[] : [];
    } catch {
        return [];
    }
}

function criarIcone(prioridade: Prioridade | null) {
    const cor = prioridade ? coresPrioridade[prioridade] : '#9c897c';

    return L.divIcon({
        className: '',
        html: `
            <div style="
                width:26px;
                height:26px;
                background:${cor};
                border:3px solid white;
                border-radius:50% 50% 50% 0;
                transform:rotate(-45deg);
                box-shadow:0 3px 8px rgba(0,0,0,0.2);
                display:flex;
                align-items:center;
                justify-content:center;
            ">
                <div style="
                    width:8px;
                    height:8px;
                    border-radius:50%;
                    background:white;
                "></div>
            </div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 26],
        popupAnchor: [0, -25],
    });
}

function AjustarMapa() {
    const mapa = useMap();

    useEffect(() => {
        mapa.fitBounds(limitesSaoPaulo, { padding: [15, 15] });

        const tempo = window.setTimeout(() => mapa.invalidateSize(), 150);

        return () => window.clearTimeout(tempo);
    }, [mapa]);

    return null;
}

function CartaoIndicador({
    icone,
    valor,
    descricao,
    cor = 'bg-primaria',
}: {
    icone: string;
    valor: number;
    descricao: string;
    cor?: string;
}) {
    return (
        <div className="flex items-center gap-4 rounded-2xl border border-[#dfbba9] bg-[#fff9f4]/80 px-5 py-5 shadow-sm">
            <div className={`flex h-15 w-15 shrink-0 items-center justify-center rounded-full ${cor}`}>
                <Icone nome={icone} classe="text-4xl text-white" />
            </div>

            <div className="min-w-0">
                <strong className="font-titulo text-3xl font-bold text-[#72211b]">
                    {numero(valor)}
                </strong>
                <p className="text-sm text-texto">{descricao}</p>
            </div>
        </div>
    );
}

export default function AdminDashboard() {
    const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
    const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
    const [periodo, setPeriodo] = useState('30');

    useEffect(() => {
        const carregar = () => {
            setOcorrencias(lerLista<Ocorrencia>(CHAVE_OCORRENCIAS));
            setOrcamentos(lerLista<Orcamento>(CHAVE_ORCAMENTOS));
        };

        carregar();

        window.addEventListener('storage', carregar);
        window.addEventListener('polieus:ocorrencias-atualizadas', carregar);
        window.addEventListener('polieus:orcamentos-atualizados', carregar);

        return () => {
            window.removeEventListener('storage', carregar);
            window.removeEventListener('polieus:ocorrencias-atualizadas', carregar);
            window.removeEventListener('polieus:orcamentos-atualizados', carregar);
        };
    }, []);

    const indicadores = useMemo(() => ({
        total: ocorrencias.length,
        resolvidas: ocorrencias.filter((o) => o.status === 'Resolvida').length,
        analise: ocorrencias.filter((o) => o.status === 'Em análise').length,
        pendentes: ocorrencias.filter((o) => o.status === 'Pendente').length,
        andamento: ocorrencias.filter((o) => o.status === 'Em andamento').length,
        altaPrioridade: ocorrencias.filter(
            (o) => o.prioridade === 'Alta' && o.status !== 'Resolvida'
        ).length,
    }), [ocorrencias]);

    const taxaResolucao = indicadores.total > 0
        ? (indicadores.resolvidas / indicadores.total) * 100
        : 0;

    const ocorrenciasRecentes = useMemo(() => {
        return [...ocorrencias]
            .sort((a, b) =>
                new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime()
            )
            .slice(0, 4);
    }, [ocorrencias]);

    const ocorrenciasPeriodo = useMemo(() => {
        if (periodo === 'todos') return ocorrencias;

        const limite = new Date();
        limite.setDate(limite.getDate() - Number(periodo));

        return ocorrencias.filter((ocorrencia) => {
            const data = new Date(ocorrencia.dataCriacao);
            return !Number.isNaN(data.getTime()) && data >= limite;
        });
    }, [ocorrencias, periodo]);

    const categorias = useMemo(() => {
        const contagem = new Map<string, number>();

        ocorrenciasPeriodo.forEach((ocorrencia) => {
            const nome = ocorrencia.categoria || 'Outros';
            contagem.set(nome, (contagem.get(nome) ?? 0) + 1);
        });

        return [...contagem.entries()]
            .map(([nome, quantidade]) => ({ nome, quantidade }))
            .sort((a, b) => b.quantidade - a.quantidade)
            .slice(0, 6);
    }, [ocorrenciasPeriodo]);

    const maiorCategoria = Math.max(
        1,
        ...categorias.map((categoria) => categoria.quantidade)
    );

    const ocorrenciasMapa = useMemo(() => {
        return ocorrencias.filter((ocorrencia) =>
            typeof ocorrencia.latitude === 'number' &&
            typeof ocorrencia.longitude === 'number' &&
            Number.isFinite(ocorrencia.latitude) &&
            Number.isFinite(ocorrencia.longitude) &&
            limitesSaoPaulo.contains([
                ocorrencia.latitude,
                ocorrencia.longitude,
            ])
        );
    }, [ocorrencias]);

    const ultimosSeteDias = useMemo(() => {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        return Array.from({ length: 7 }, (_, indice) => {
            const dia = new Date(hoje);
            dia.setDate(hoje.getDate() - (6 - indice));

            const proximoDia = new Date(dia);
            proximoDia.setDate(dia.getDate() + 1);

            const quantidade = ocorrencias.filter((ocorrencia) => {
                const data = new Date(ocorrencia.dataCriacao);
                return data >= dia && data < proximoDia;
            }).length;

            return {
                data: dia.toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                }),
                quantidade,
            };
        });
    }, [ocorrencias]);

    const maiorDia = Math.max(
        1,
        ...ultimosSeteDias.map((dia) => dia.quantidade)
    );

    const orcamentosConfirmados = useMemo(
        () => orcamentos.filter(
            (orcamento) => orcamento.situacao === 'Confirmado'
        ),
        [orcamentos]
    );

    const valorTotalOrcamentos = orcamentosConfirmados.reduce(
        (total, orcamento) => {
            const valor = Number(orcamento.total);
            return total + (Number.isFinite(valor) ? valor : 0);
        },
        0
    );

    const mensagemGestao = indicadores.total === 0
        ? 'A plataforma ainda não possui ocorrências disponíveis. Assim que os registros forem recebidos, os indicadores serão atualizados.'
        : indicadores.altaPrioridade > 0
            ? `Existem ${numero(indicadores.altaPrioridade)} ocorrências de alta prioridade ainda não resolvidas. Recomenda-se acompanhar essas demandas com atenção.`
            : indicadores.pendentes > 0
                ? `Existem ${numero(indicadores.pendentes)} ocorrências pendentes aguardando atendimento ou encaminhamento.`
                : 'Não há ocorrências pendentes ou de alta prioridade não resolvidas nos registros disponíveis. Continue acompanhando os indicadores.';

    return (
        <main className="min-h-screen w-full bg-fundo font-corpo text-texto">
            <div className="mx-auto max-w-400 px-5 py-7 sm:px-8 lg:px-10">

                <header className="border-b border-[#d4b19e] pb-5">
                    <div className="flex items-center gap-2 text-primaria">
                        <Icone nome="account_balance" classe="text-3xl" />
                        <span className="font-titulo text-xl font-bold">
                            Área Administrativa
                        </span>
                    </div>

                    <h1 className="mt-5 font-titulo text-4xl font-bold text-[#79221b]">
                        Olá, Administrador!
                    </h1>

                    <p className="mt-2 text-sm text-texto-suave sm:text-base">
                        Gerencie as ocorrências, acompanhe os indicadores e coordene as demandas da cidade.
                    </p>
                </header>

                <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <CartaoIndicador
                        icone="campaign"
                        valor={indicadores.total}
                        descricao="Ocorrências registradas"
                    />

                    <CartaoIndicador
                        icone="check"
                        valor={indicadores.resolvidas}
                        descricao="Resolvidas"
                        cor="bg-green-700"
                    />

                    <CartaoIndicador
                        icone="schedule"
                        valor={indicadores.analise}
                        descricao="Em análise"
                    />

                    <CartaoIndicador
                        icone="warning"
                        valor={indicadores.pendentes}
                        descricao="Pendentes"
                    />
                </section>

                <div className="mt-5 grid gap-4 xl:grid-cols-2">

                    <section className="min-w-0 overflow-hidden rounded-2xl border border-[#dfbba9] bg-[#fff9f4]/80 p-4 shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ead3c5] pb-3">
                            <h2 className="flex items-center gap-2 font-titulo text-xl font-bold text-[#79221b]">
                                <Icone nome="location_on" classe="text-3xl" />
                                Mapa de Ocorrências
                            </h2>

                            <Link
                                to="/admin/mapa-ocorrencias"
                                className="flex items-center gap-1 text-sm font-semibold text-primaria underline"
                            >
                                Ver mapa completo
                                <Icone nome="arrow_forward" classe="text-lg" />
                            </Link>
                        </div>

                        <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_150px]">
                            <div className="relative h-65 overflow-hidden rounded-xl border border-[#ead3c5]">
                                <MapContainer
                                    center={centroSaoPaulo}
                                    zoom={7}
                                    minZoom={6}
                                    maxZoom={18}
                                    maxBounds={limitesSaoPaulo}
                                    maxBoundsViscosity={1}
                                    scrollWheelZoom={false}
                                    className="h-full w-full"
                                >
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />

                                    <AjustarMapa />

                                    {ocorrenciasMapa.map((ocorrencia) => (
                                        <Marker
                                            key={ocorrencia.id}
                                            position={[
                                                ocorrencia.latitude!,
                                                ocorrencia.longitude!,
                                            ]}
                                            icon={criarIcone(ocorrencia.prioridade)}
                                        >
                                            <Popup>
                                                <strong>{ocorrencia.protocolo}</strong>
                                                <p>{ocorrencia.categoria}</p>
                                                <p>{ocorrencia.status}</p>
                                            </Popup>
                                        </Marker>
                                    ))}
                                </MapContainer>
                            </div>

                            <div className="flex flex-col justify-center gap-5">
                                {([
                                    ['Alta', '#b3261e'],
                                    ['Média', '#e99a3e'],
                                    ['Baixa', '#4f7b43'],
                                ] as const).map(([prioridade, cor]) => (
                                    <div key={prioridade} className="flex items-center gap-2">
                                        <span
                                            className="h-3 w-3 shrink-0 rounded-full"
                                            style={{ backgroundColor: cor }}
                                        />
                                        <span className="text-xs">
                                            {prioridade} prioridade
                                        </span>
                                    </div>
                                ))}

                                {ocorrenciasMapa.length === 0 && (
                                    <p className="text-xs leading-relaxed text-texto-suave">
                                        Nenhuma ocorrência com localização disponível.
                                    </p>
                                )}
                            </div>
                        </div>
                    </section>

                    <section className="min-w-0 rounded-2xl border border-[#dfbba9] bg-[#fff9f4]/80 p-4 shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ead3c5] pb-3">
                            <h2 className="flex items-center gap-2 font-titulo text-xl font-bold text-[#79221b]">
                                <Icone nome="bar_chart" classe="text-3xl" />
                                Ocorrências por Categoria
                            </h2>

                            <select
                                aria-label="Período do gráfico"
                                value={periodo}
                                onChange={(evento) => setPeriodo(evento.target.value)}
                                className="rounded-lg border border-[#d8b9a7] bg-white/60 px-3 py-2 text-xs outline-none focus:border-primaria"
                            >
                                <option value="7">Últimos 7 dias</option>
                                <option value="30">Últimos 30 dias</option>
                                <option value="90">Últimos 90 dias</option>
                                <option value="todos">Todo o período</option>
                            </select>
                        </div>

                        {categorias.length === 0 ? (
                            <div className="flex h-65 items-center justify-center text-center text-sm text-texto-suave">
                                Nenhuma ocorrência disponível no período selecionado.
                            </div>
                        ) : (
                            <div className="mt-5 flex h-65 items-end gap-3 border-b border-[#d8b9a7] pb-7">
                                {categorias.map((categoria) => (
                                    <div
                                        key={categoria.nome}
                                        className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
                                    >
                                        <span className="text-xs font-semibold">
                                            {categoria.quantidade}
                                        </span>

                                        <div
                                            className="w-full max-w-18 rounded-t-md bg-linear-to-t from-primaria to-[#d28c7c]"
                                            style={{
                                                height: `${Math.max(
                                                    5,
                                                    (categoria.quantidade / maiorCategoria) * 85
                                                )}%`,
                                            }}
                                        />

                                        <span
                                            title={categoria.nome}
                                            className="w-full truncate text-center text-[10px]"
                                        >
                                            {categoria.nome}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>

                <div className="mt-5 grid gap-4 xl:grid-cols-2">

                    <section className="min-w-0 rounded-2xl border border-[#dfbba9] bg-[#fff9f4]/80 p-4 shadow-sm">
                        <div className="flex items-center justify-between gap-3 border-b border-[#ead3c5] pb-3">
                            <h2 className="flex items-center gap-2 font-titulo text-xl font-bold text-[#79221b]">
                                <Icone nome="format_list_bulleted" classe="text-3xl" />
                                Ocorrências Recentes
                            </h2>

                            <Link
                                to="/admin/gerenciar-ocorrencias"
                                className="flex items-center gap-1 text-sm font-semibold text-primaria underline"
                            >
                                Ver todas
                                <Icone nome="arrow_forward" classe="text-lg" />
                            </Link>
                        </div>

                        {ocorrenciasRecentes.length === 0 ? (
                            <p className="py-14 text-center text-sm text-texto-suave">
                                Nenhuma ocorrência registrada até o momento.
                            </p>
                        ) : (
                            <div className="mt-4 overflow-x-auto">
                                <table className="w-full min-w-125 text-left text-xs">
                                    <thead className="bg-[#f5e5d9] text-primaria">
                                        <tr>
                                            <th className="rounded-l-lg px-3 py-3">Protocolo</th>
                                            <th className="px-3 py-3">Categoria</th>
                                            <th className="px-3 py-3">Localização</th>
                                            <th className="px-3 py-3">Status</th>
                                            <th className="rounded-r-lg px-3 py-3">Ações</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {ocorrenciasRecentes.map((ocorrencia) => (
                                            <tr
                                                key={ocorrencia.id}
                                                className="border-b border-[#ead3c5]"
                                            >
                                                <td className="px-3 py-3 font-semibold">
                                                    {ocorrencia.protocolo}
                                                </td>

                                                <td className="px-3 py-3">
                                                    {ocorrencia.categoria}
                                                </td>

                                                <td className="px-3 py-3">
                                                    {ocorrencia.bairro ||
                                                        ocorrencia.localizacao ||
                                                        ocorrencia.cidade ||
                                                        'Não informada'}
                                                </td>

                                                <td className="px-3 py-3">
                                                    <span
                                                        className={`inline-block whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-semibold ${
                                                            coresStatus[ocorrencia.status] ??
                                                            'bg-secundaria text-texto'
                                                        }`}
                                                    >
                                                        {ocorrencia.status}
                                                    </span>
                                                </td>

                                                <td className="px-3 py-3">
                                                    <Link
                                                        to="/admin/gerenciar-ocorrencias"
                                                        aria-label={`Visualizar ocorrência ${ocorrencia.protocolo}`}
                                                        className="inline-flex rounded-lg border border-[#c9a697] px-2 py-1 text-primaria hover:bg-[#f5e5d9]"
                                                    >
                                                        <Icone nome="visibility" classe="text-xl" />
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>

                    <section className="rounded-2xl border border-[#dfbba9] bg-[#fff9f4]/80 p-4 shadow-sm">
                        <h2 className="flex items-center gap-2 border-b border-[#ead3c5] pb-3 font-titulo text-xl font-bold text-[#79221b]">
                            <Icone nome="bolt" classe="text-3xl" />
                            Ações Rápidas
                        </h2>

                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                            <Link
                                to="/admin/gerenciar-ocorrencias"
                                className="flex items-start gap-3 rounded-xl border border-[#dfbba9] p-4 transition-colors hover:bg-[#f5e5d9]"
                            >
                                <Icone nome="description" classe="text-4xl text-primaria" />

                                <div>
                                    <h3 className="font-titulo text-base font-bold text-primaria">
                                        Gerenciar Ocorrências
                                    </h3>

                                    <p className="mt-1 text-xs leading-relaxed text-texto">
                                        Consultar, atualizar status e encaminhar solicitações.
                                    </p>
                                </div>
                            </Link>

                            <Link
                                to="/admin/relatorios"
                                className="flex items-start gap-3 rounded-xl border border-[#dfbba9] p-4 transition-colors hover:bg-[#f5e5d9]"
                            >
                                <Icone nome="bar_chart" classe="text-4xl text-primaria" />

                                <div>
                                    <h3 className="font-titulo text-base font-bold text-primaria">
                                        Gerar Relatório
                                    </h3>

                                    <p className="mt-1 text-xs leading-relaxed text-texto">
                                        Emitir relatórios e analisar indicadores da cidade.
                                    </p>
                                </div>
                            </Link>

                            <Link
                                to="/admin/mapa-ocorrencias"
                                className="flex items-start gap-3 rounded-xl border border-[#dfbba9] p-4 transition-colors hover:bg-[#f5e5d9] sm:col-span-2"
                            >
                                <Icone nome="location_on" classe="text-4xl text-primaria" />

                                <div>
                                    <h3 className="font-titulo text-base font-bold text-primaria">
                                        Visualizar no Mapa
                                    </h3>

                                    <p className="mt-1 text-xs leading-relaxed text-texto">
                                        Acompanhar a distribuição das ocorrências no estado de São Paulo.
                                    </p>
                                </div>
                            </Link>
                        </div>
                    </section>
                </div>

                <div className="mt-5 grid gap-4 xl:grid-cols-2">

                    <section className="rounded-2xl border border-[#dfbba9] bg-[#fff9f4]/80 p-5 shadow-sm">
                        <h2 className="flex items-center gap-2 border-b border-[#ead3c5] pb-3 font-titulo text-xl font-bold text-[#79221b]">
                            <Icone nome="insights" classe="text-3xl" />
                            Resumo dos Últimos 7 Dias
                        </h2>

                        <p className="mt-3 text-xs text-texto-suave">
                            Quantidade de novas ocorrências registradas por dia.
                        </p>

                        <div className="mt-6 flex h-50 items-end justify-between gap-3 border-b border-[#d8b9a7] pb-3">
                            {ultimosSeteDias.map((dia) => (
                                <div
                                    key={dia.data}
                                    className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                                >
                                    <span className="text-xs font-semibold">
                                        {dia.quantidade}
                                    </span>

                                    <div
                                        className="w-full max-w-12 rounded-t-md bg-linear-to-t from-primaria to-[#d28c7c]"
                                        style={{
                                            height: `${
                                                dia.quantidade === 0
                                                    ? 2
                                                    : Math.max(
                                                        8,
                                                        (dia.quantidade / maiorDia) * 85
                                                    )
                                            }%`,
                                        }}
                                    />

                                    <span className="text-[10px] text-texto-suave">
                                        {dia.data}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="rounded-2xl border border-[#dfbba9] bg-[#fff9f4]/80 p-5 shadow-sm">
                        <h2 className="flex items-center gap-2 border-b border-[#ead3c5] pb-3 font-titulo text-xl font-bold text-[#79221b]">
                            <Icone nome="donut_large" classe="text-3xl" />
                            Distribuição por Status
                        </h2>

                        <div className="mt-6 space-y-5">
                            {statusDisponiveis.map((status) => {
                                const quantidade = ocorrencias.filter(
                                    (ocorrencia) => ocorrencia.status === status.nome
                                ).length;

                                const percentual = indicadores.total > 0
                                    ? (quantidade / indicadores.total) * 100
                                    : 0;

                                return (
                                    <div key={status.nome}>
                                        <div className="mb-2 flex items-center justify-between text-sm">
                                            <span>{status.nome}</span>

                                            <strong>
                                                {numero(quantidade)} ({percentual.toFixed(1)}%)
                                            </strong>
                                        </div>

                                        <div className="h-3 overflow-hidden rounded-full bg-[#eadbd0]">
                                            <div
                                                className="h-full rounded-full"
                                                style={{
                                                    width: `${percentual}%`,
                                                    backgroundColor: status.cor,
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                </div>

                <div className="mt-5 grid gap-4 xl:grid-cols-3">

                    <section className="rounded-2xl border border-[#dfbba9] bg-[#fff9f4]/80 p-5 shadow-sm">
                        <h2 className="flex items-center gap-2 font-titulo text-lg font-bold text-[#79221b]">
                            <Icone nome="task_alt" classe="text-2xl" />
                            Taxa de Resolução
                        </h2>

                        <div className="mt-6 flex items-center justify-center">
                            <div
                                className="flex h-38 w-38 items-center justify-center rounded-full"
                                style={{
                                    background: `conic-gradient(#4f7b43 ${taxaResolucao}%, #eadbd0 ${taxaResolucao}% 100%)`,
                                }}
                            >
                                <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-[#fff9f4]">
                                    <strong className="font-titulo text-3xl text-primaria">
                                        {taxaResolucao.toFixed(1)}%
                                    </strong>

                                    <span className="text-xs text-texto-suave">
                                        Resolvidas
                                    </span>
                                </div>
                            </div>
                        </div>

                        <p className="mt-5 text-center text-sm text-texto-suave">
                            {numero(indicadores.resolvidas)} de {numero(indicadores.total)} ocorrências resolvidas.
                        </p>
                    </section>

                    <section className="rounded-2xl border border-[#dfbba9] bg-[#fff9f4]/80 p-5 shadow-sm">
                        <h2 className="flex items-center gap-2 font-titulo text-lg font-bold text-[#79221b]">
                            <Icone nome="priority_high" classe="text-2xl" />
                            Painel de Atenção
                        </h2>

                        <div className="mt-5 space-y-3">
                            <div className="flex items-center justify-between rounded-lg bg-[#f5e5d9] p-3">
                                <span className="text-sm">
                                    Alta prioridade não resolvida
                                </span>

                                <strong className="text-xl text-primaria">
                                    {indicadores.altaPrioridade}
                                </strong>
                            </div>

                            <div className="flex items-center justify-between rounded-lg bg-[#f5e5d9] p-3">
                                <span className="text-sm">Pendentes</span>

                                <strong className="text-xl text-primaria">
                                    {indicadores.pendentes}
                                </strong>
                            </div>

                            <div className="flex items-center justify-between rounded-lg bg-[#f5e5d9] p-3">
                                <span className="text-sm">Em análise</span>

                                <strong className="text-xl text-primaria">
                                    {indicadores.analise}
                                </strong>
                            </div>

                            <div className="flex items-center justify-between rounded-lg bg-[#f5e5d9] p-3">
                                <span className="text-sm">Em andamento</span>

                                <strong className="text-xl text-primaria">
                                    {indicadores.andamento}
                                </strong>
                            </div>
                        </div>
                    </section>

                    <section className="rounded-2xl border border-[#dfbba9] bg-[#fff9f4]/80 p-5 shadow-sm">
                        <h2 className="flex items-center gap-2 font-titulo text-lg font-bold text-[#79221b]">
                            <Icone nome="account_balance_wallet" classe="text-2xl" />
                            Orçamentos Institucionais
                        </h2>

                        <div className="mt-6 rounded-lg bg-[#f5e5d9] p-4">
                            <p className="text-sm text-texto-suave">
                                Orçamentos confirmados
                            </p>

                            <strong className="mt-2 block font-titulo text-3xl text-primaria">
                                {numero(orcamentosConfirmados.length)}
                            </strong>
                        </div>

                        <div className="mt-3 rounded-lg bg-[#f5e5d9] p-4">
                            <p className="text-sm text-texto-suave">
                                Valor total estimado
                            </p>

                            <strong className="mt-2 block font-titulo text-2xl text-primaria">
                                {moeda(valorTotalOrcamentos)}
                            </strong>
                        </div>

                        <Link
                            to="/admin/relatorios"
                            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primaria underline"
                        >
                            Acessar orçamentos
                            <Icone nome="arrow_forward" classe="text-lg" />
                        </Link>
                    </section>
                </div>

                <section className="mt-5 rounded-2xl border border-[#dfbba9] bg-[#fff9f4]/80 p-5 shadow-sm">
                    <h2 className="flex items-center gap-2 font-titulo text-xl font-bold text-[#79221b]">
                        <Icone nome="tips_and_updates" classe="text-3xl" />
                        Panorama da Gestão
                    </h2>

                    <p className="mt-4 text-sm leading-7 text-texto-suave">
                        {mensagemGestao}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-3">
                        <Link
                            to="/admin/gerenciar-ocorrencias"
                            className="inline-flex min-h-12 items-center justify-center rounded-lg bg-primaria px-6 py-3 text-sm font-semibold transition-colors duration-200 hover:bg-primaria-hover"
                            style={{ color: '#ffffff' }}
                        >
                            Gerenciar demandas
                        </Link>

                        <Link
                            to="/admin/relatorios"
                            className="inline-flex min-h-12 items-center justify-center rounded-lg border border-primaria bg-white px-6 py-3 text-sm font-semibold transition-colors duration-200 hover:bg-[#f5e5d9]"
                            style={{ color: '#b3261e' }}
                        >
                            Consultar indicadores
                        </Link>
                    </div>
                </section>
            </div>
        </main>
    );
}
