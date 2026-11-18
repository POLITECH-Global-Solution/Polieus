import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { listarOcorrencias } from '../../services/ocorrenciaService';

import {
    listarHistoricosPorOcorrencia,
    obterHistoricoInicial,
    obterHistoricoAtual,
    gerarProtocolo,
} from '../../services/historicoService';

import {
    listarAnalises,
    obterAnalisePorProtocolo,
    normalizarPrioridade,
    salvarPrioridadeOcorrencia,
    type Prioridade,
    type Analise,
} from '../../services/analiseService';

// TIPAGENS

type Status = 'Pendente' | 'Em análise' | 'Em andamento' | 'Resolvida' | 'Não informado';

interface Ocorrencia {
    id: number;
    protocolo: string;
    categoria: string;
    descricao: string;
    endereco: string;
    numero: string;
    cep: string;
    cidade: string;
    status: Status;
    prioridade: Prioridade | null;
    dataCriacao: string;
    latitude: number | null;
    longitude: number | null;
    historicoDisponivel: boolean;
    analiseDisponivel: boolean;
    possuiAnalise: boolean;
}

interface Filtros {
    categoria: string;
    status: string;
    prioridade: string;
    periodo: string;
}

// CONSTANTES

const centroSaoPaulo: [number, number] = [-23.5505, -46.6333];

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

const statusDisponiveis: Status[] = [
    'Pendente',
    'Em análise',
    'Em andamento',
    'Resolvida',
    'Não informado',
];

const prioridades: Prioridade[] = ['Alta', 'Média', 'Baixa'];

const coresPrioridade: Record<Prioridade, string> = {
    Alta: '#b3261e',
    Média: '#e99a3e',
    Baixa: '#4f7b43',
};

const campoClasse = 'w-full rounded-lg border border-[#dec3b2] bg-[#fffaf6] px-3 py-2.5 text-sm text-texto outline-none transition-colors focus:border-primaria focus:ring-2 focus:ring-primaria/15';

const painelClasse = 'rounded-xl border border-[#dfc2ae] bg-[#fffaf6] p-5 shadow-sm';

// FUNÇÕES AUXILIARES

function Icone({ nome, classe = '' }: {
    nome: string;
    classe?: string;
}) {

    return (
        <span className={`material-icons ${classe}`} aria-hidden="true">
            {nome}
        </span>
    );
}

function normalizarTexto(texto: string): string {

    return texto.normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .toLowerCase();
}

function normalizarStatus(status?: string): Status {

    switch (normalizarTexto(status ?? '')) {

        case 'pendente':
            return 'Pendente';

        case 'em analise':
            return 'Em análise';

        case 'em andamento':
            return 'Em andamento';

        case 'resolvida':
        case 'resolvido':
            return 'Resolvida';

        default:
            return 'Não informado';
    }
}

function corPrioridade(prioridade: Prioridade | null) {

    return prioridade
        ? coresPrioridade[prioridade]
        : '#8d8276';
}

function corStatus(status: Status) {

    const cores: Record<Status, string> = {
        Pendente: 'bg-[#f8d8d0] text-[#84261f]',
        'Em análise': 'bg-[#ffe0a5] text-[#704312]',
        'Em andamento': 'bg-[#d7e6f1] text-[#28546d]',
        Resolvida: 'bg-[#dce9d1] text-[#41642d]',
        'Não informado': 'bg-[#e5ded8] text-[#74645a]',
    };

    return cores[status];
}

function converterData(data: string): Date | null {

    if (!data) return null;

    const partes = data.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/);

    if (partes) {

        const dia = Number(partes[1]);
        const mes = Number(partes[2]);
        const ano = Number(partes[3]);

        const resultado = new Date(ano, mes - 1, dia);

        if (
            resultado.getFullYear() !== ano ||
            resultado.getMonth() !== mes - 1 ||
            resultado.getDate() !== dia
        ) {
            return null;
        }

        return resultado;
    }

    const resultado = new Date(data);

    return Number.isNaN(resultado.getTime())
        ? null
        : resultado;
}

function formatarData(data: string) {

    return converterData(data)?.toLocaleDateString('pt-BR')
        ?? 'Data indisponível';
}

function estaNoPeriodo(data: string, periodo: string) {

    if (!periodo) return true;

    const criacao = converterData(data);

    if (!criacao) return false;

    const hoje = new Date();
    const inicio = new Date(hoje);

    inicio.setHours(0, 0, 0, 0);

    inicio.setDate(hoje.getDate() - Number(periodo) + 1);

    return criacao >= inicio && criacao <= hoje;
}

// LOCALIZAÇÃO APROXIMADA PELO CEP

function obterLocalizacaoPorCep(cep: string): {
    cidade: string;
    latitude: number | null;
    longitude: number | null;
} {

    const codigo = cep.replace(/\D/g, '');

    if (codigo.length !== 8) {

        return {
            cidade: '',
            latitude: null,
            longitude: null,
        };
    }

    const prefixo = Number(codigo.substring(0, 5));

    const regioes = [
        {
            inicio: 9400,
            fim: 9499,
            cidade: 'Ribeirão Pires',
            latitude: -23.7119,
            longitude: -46.4133,
        },
    ];

    const regiao = regioes.find(
        item => prefixo >= item.inicio && prefixo <= item.fim
    );

    if (!regiao) {

        return {
            cidade: '',
            latitude: null,
            longitude: null,
        };
    }

    return {
        cidade: regiao.cidade,
        latitude: regiao.latitude,
        longitude: regiao.longitude,
    };
}

function possuiLocalizacao(ocorrencia: Ocorrencia): boolean {

    return ocorrencia.latitude !== null &&
        ocorrencia.longitude !== null &&
        Number.isFinite(ocorrencia.latitude) &&
        Number.isFinite(ocorrencia.longitude) &&
        limitesSaoPaulo.contains([
            ocorrencia.latitude,
            ocorrencia.longitude,
        ]);
}

// MARCADORES DO MAPA

function criarIcone(prioridade: Prioridade | null, quantidade = 1) {

    const cor = corPrioridade(prioridade);

    if (quantidade > 1) {

        return L.divIcon({

            className: '',

            html: `
                <div style="
                    width: 42px;
                    height: 42px;
                    background: #80271e;
                    border: 3px solid white;
                    border-radius: 50%;
                    box-shadow: 0 3px 9px rgba(0,0,0,0.25);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 16px;
                    font-weight: bold;
                ">
                    ${quantidade}
                </div>
            `,

            iconSize: [42, 42],
            iconAnchor: [21, 21],
            popupAnchor: [0, -21],
        });
    }

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

// AJUSTE AUTOMÁTICO DO MAPA

function AjustarMapa({ coordenadas }: {
    coordenadas: [number, number][];
}) {

    const mapa = useMap();

    useEffect(() => {

        mapa.invalidateSize();

        if (coordenadas.length === 0) {

            mapa.fitBounds(limitesSaoPaulo, {
                padding: [20, 20],
            });

        } else if (coordenadas.length === 1) {

            mapa.setView(coordenadas[0], 11);

        } else {

            mapa.fitBounds(L.latLngBounds(coordenadas), {
                padding: [40, 40],
                maxZoom: 12,
            });
        }

        const atualizar = window.setTimeout(() => {

            mapa.invalidateSize();

        }, 150);

        return () => window.clearTimeout(atualizar);

    }, [mapa, coordenadas]);

    return null;
}

function CentralizarOcorrencia({ ocorrencia }: {
    ocorrencia: Ocorrencia | null;
}) {

    const mapa = useMap();

    const latitude = ocorrencia?.latitude;
    const longitude = ocorrencia?.longitude;

    useEffect(() => {

        if (
            latitude === null ||
            latitude === undefined ||
            longitude === null ||
            longitude === undefined
        ) {
            return;
        }

        mapa.flyTo(
            [latitude, longitude],
            Math.max(mapa.getZoom(), 12),
            { duration: 0.8 }
        );

    }, [mapa, latitude, longitude]);

    return null;
}

// CONSULTAR OCORRÊNCIAS NA API JAVA

async function consultarOcorrencias(): Promise<Ocorrencia[]> {

    const registros = await listarOcorrencias();

    let analises: Analise[] = [];
    let analisesDisponiveis = true;

    try {

        analises = await listarAnalises();

    } catch (erro) {

        analisesDisponiveis = false;

        console.error('Erro ao consultar análises:', erro);
    }

    const ocorrencias = await Promise.all(

        registros.map(async (registro): Promise<Ocorrencia | null> => {

            const id = registro.idOcorrencia;

            if (
                typeof id !== 'number' ||
                !Number.isInteger(id) ||
                id <= 0
            ) {
                return null;
            }

            let historicos: Awaited<
                ReturnType<typeof listarHistoricosPorOcorrencia>
            > = [];

            let historicoDisponivel = true;

            try {

                historicos = await listarHistoricosPorOcorrencia(id);

            } catch (erro) {

                historicoDisponivel = false;

                console.error(
                    `Erro ao consultar histórico da ocorrência ${id}:`,
                    erro
                );
            }

            const historicoInicial = obterHistoricoInicial(historicos);

            const historicoAtual = obterHistoricoAtual(historicos);

            const protocolo = historicoInicial?.protocolo ||
                historicoAtual?.protocolo ||
                gerarProtocolo(id);

            let analise: Analise | null = null;

            let analiseDisponivel =
                analisesDisponiveis && historicoDisponivel;

            if (analiseDisponivel) {

                try {

                    analise = obterAnalisePorProtocolo(
                        analises,
                        protocolo
                    );

                } catch (erro) {

                    analiseDisponivel = false;

                    console.error(
                        `Erro ao identificar análise de ${protocolo}:`,
                        erro
                    );
                }
            }

            const localizacao = obterLocalizacaoPorCep(
                registro.cep ?? ''
            );

            return {
                id,
                protocolo,
                categoria: registro.categoria || 'Não informada',
                descricao: registro.descricao || '',
                endereco: registro.endereco || '',
                numero: registro.departamento || '',
                cep: registro.cep || '',
                cidade: localizacao.cidade,
                latitude: localizacao.latitude,
                longitude: localizacao.longitude,
                status: normalizarStatus(historicoAtual?.status),
                prioridade: normalizarPrioridade(analise?.prioridade),
                dataCriacao: historicoInicial?.data || '',
                historicoDisponivel,
                analiseDisponivel,
                possuiAnalise: analise !== null,
            };
        })
    );

    return ocorrencias.filter(
        (item): item is Ocorrencia => item !== null
    );
}

// PÁGINA ADMINISTRATIVA

export default function MapaOcorrenciasAdmin() {

    const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
    const [filtros, setFiltros] = useState<Filtros>(filtrosIniciais);

    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);

    const [erro, setErro] = useState('');
    const [mensagem, setMensagem] = useState('');

    const [tipoMensagem, setTipoMensagem] = useState<'sucesso' | 'erro'>('sucesso');

    const [selecionadaId, setSelecionadaId] = useState<number | null>(null);

    const [novaPrioridade, setNovaPrioridade] = useState<Prioridade | ''>('');

    const consultaAtual = useRef(0);
    const bloqueioSalvamento = useRef(false);

    // CARREGAMENTO

    const carregarOcorrencias = useCallback(async (): Promise<Ocorrencia[] | null> => {

        const consulta = ++consultaAtual.current;

        setCarregando(true);
        setErro('');

        try {

            const registros = await consultarOcorrencias();

            if (consulta !== consultaAtual.current) return null;

            setOcorrencias(registros);

            return registros;

        } catch (erro) {

            if (consulta !== consultaAtual.current) return null;

            console.error('Erro ao carregar mapa:', erro);

            setErro(
                'Não foi possível consultar as ocorrências na API Java.'
            );

            return null;

        } finally {

            if (consulta === consultaAtual.current) {
                setCarregando(false);
            }
        }

    }, []);

    useEffect(() => {

        void carregarOcorrencias();

        return () => {
            consultaAtual.current += 1;
        };

    }, [carregarOcorrencias]);

    // CATEGORIAS E FILTROS

    const categorias = useMemo(() => {

        const registros = new Map<string, string>();

        ocorrencias.forEach(item => {

            const chave = normalizarTexto(item.categoria);

            if (!registros.has(chave)) {
                registros.set(chave, item.categoria);
            }
        });

        return [...registros.values()].sort(
            (a, b) => a.localeCompare(b, 'pt-BR')
        );

    }, [ocorrencias]);

    const ocorrenciasFiltradas = useMemo(() => {

        return ocorrencias.filter(ocorrencia =>

            (!filtros.categoria ||
                normalizarTexto(ocorrencia.categoria) ===
                normalizarTexto(filtros.categoria)) &&

            (!filtros.status ||
                ocorrencia.status === filtros.status) &&

            (!filtros.prioridade ||
                (
                    filtros.prioridade === 'nao-definida'
                        ? ocorrencia.analiseDisponivel &&
                            ocorrencia.prioridade === null
                        : ocorrencia.prioridade === filtros.prioridade
                )
            ) &&

            estaNoPeriodo(
                ocorrencia.dataCriacao,
                filtros.periodo
            )
        );

    }, [ocorrencias, filtros]);

    const ocorrenciasLocalizadas = useMemo(() => {

        return ocorrenciasFiltradas.filter(possuiLocalizacao);

    }, [ocorrenciasFiltradas]);

    // AGRUPAMENTO DOS MARCADORES

    const grupos = useMemo(() => {

        const registros = new Map<string, Ocorrencia[]>();

        ocorrenciasLocalizadas.forEach(ocorrencia => {

            const chave = `${ocorrencia.latitude},${ocorrencia.longitude}`;

            const grupo = registros.get(chave) ?? [];

            grupo.push(ocorrencia);

            registros.set(chave, grupo);
        });

        return [...registros.entries()];

    }, [ocorrenciasLocalizadas]);

    const coordenadas = useMemo(() => {

        return grupos.map(
            ([, grupo]): [number, number] => [
                grupo[0].latitude as number,
                grupo[0].longitude as number,
            ]
        );

    }, [grupos]);

    // INDICADORES

    const indicadores = useMemo(() => ({

        total: ocorrenciasFiltradas.length,

        localizadas: ocorrenciasLocalizadas.length,

        alta: ocorrenciasFiltradas.filter(
            item => item.prioridade === 'Alta'
        ).length,

        media: ocorrenciasFiltradas.filter(
            item => item.prioridade === 'Média'
        ).length,

        baixa: ocorrenciasFiltradas.filter(
            item => item.prioridade === 'Baixa'
        ).length,

        semPrioridade: ocorrenciasFiltradas.filter(
            item => item.analiseDisponivel &&
                item.prioridade === null
        ).length,

        indisponiveis: ocorrenciasFiltradas.filter(
            item => !item.analiseDisponivel
        ).length,

        semLocalizacao: ocorrenciasFiltradas.length -
            ocorrenciasLocalizadas.length,

    }), [ocorrenciasFiltradas, ocorrenciasLocalizadas]);

    const selecionada = ocorrencias.find(
        item => item.id === selecionadaId
    ) ?? null;

    // ATUALIZAÇÃO DOS FILTROS

    const atualizarFiltro = (
        campo: keyof Filtros,
        valor: string
    ) => {

        if (salvando) return;

        setFiltros(atual => ({
            ...atual,
            [campo]: valor,
        }));
    };

    const selecionarOcorrencia = (ocorrencia: Ocorrencia) => {

        if (salvando) return;

        setSelecionadaId(ocorrencia.id);
        setNovaPrioridade(ocorrencia.prioridade ?? '');
        setMensagem('');
    };

    const limparFiltros = () => {

        if (salvando) return;

        setFiltros({ ...filtrosIniciais });
    };

    // SALVAR PRIORIDADE NA API JAVA

    const podeClassificar = selecionada !== null &&
        selecionada.historicoDisponivel &&
        selecionada.analiseDisponivel &&
        (
            selecionada.possuiAnalise ||
            (
                selecionada.status !== 'Não informado' &&
                !!selecionada.dataCriacao
            )
        ) &&
        !carregando &&
        !salvando &&
        !erro;

    const salvarPrioridade = async () => {

        if (
            !selecionada ||
            !novaPrioridade ||
            !podeClassificar ||
            bloqueioSalvamento.current ||
            selecionada.prioridade === novaPrioridade
        ) {
            return;
        }

        const id = selecionada.id;
        const prioridade = novaPrioridade;

        bloqueioSalvamento.current = true;

        setSalvando(true);
        setMensagem('');

        try {

            await salvarPrioridadeOcorrencia({

                protocolo: selecionada.protocolo,

                categoria: selecionada.categoria,

                localizacao: [
                    selecionada.endereco,
                    selecionada.numero,
                    selecionada.cidade,
                ].filter(Boolean).join(', '),

                prioridade,

                status: selecionada.status,

                data: selecionada.dataCriacao,
            });

            // CONSULTAR NOVAMENTE A API JAVA

            const registros = await carregarOcorrencias();

            const atualizada = registros?.find(
                item => item.id === id
            );

            // CONFIRMAR A PRIORIDADE ARMAZENADA

            if (
                !atualizada?.analiseDisponivel ||
                atualizada.prioridade !== prioridade
            ) {

                throw new Error(
                    'Prioridade não confirmada pela API Java.'
                );
            }

            setNovaPrioridade(prioridade);

            setTipoMensagem('sucesso');

            setMensagem(
                'Prioridade atualizada com sucesso!'
            );

        } catch (erro) {

            console.error('Erro ao atualizar prioridade:', erro);

            const registros = await carregarOcorrencias();

            const atualizada = registros?.find(
                item => item.id === id
            );

            setNovaPrioridade(atualizada?.prioridade ?? '');

            const confirmada =
                atualizada?.analiseDisponivel &&
                atualizada.prioridade === prioridade;

            setTipoMensagem(confirmada ? 'sucesso' : 'erro');

            setMensagem(
                confirmada
                    ? 'Prioridade atualizada com sucesso!'
                    : 'Não foi possível confirmar o armazenamento da prioridade na API Java.'
            );

        } finally {

            bloqueioSalvamento.current = false;

            setSalvando(false);
        }
    };

    // INTERFACE

    return (

        <main className="min-h-screen w-full bg-fundo font-corpo text-texto">

            <div className="mx-auto max-w-400 px-5 py-7 sm:px-8 lg:px-10">

                {/* CABEÇALHO */}

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
                        Visualize as ocorrências no mapa, acompanhe seus status e gerencie suas prioridades.
                    </p>

                </header>

                {/* FILTROS */}

                <section className={`${painelClasse} mt-5`}>

                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">

                        <h2 className="flex items-center gap-2 font-titulo text-xl font-bold text-primaria">

                            <Icone nome="filter_alt" classe="text-2xl" />

                            Filtrar Ocorrências

                        </h2>

                        <button type="button" onClick={limparFiltros} disabled={salvando} className="flex cursor-pointer items-center gap-1 text-sm font-semibold text-primaria hover:underline disabled:opacity-50">

                            <Icone nome="restart_alt" classe="text-xl" />

                            Limpar filtros

                        </button>

                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                        {/* CATEGORIA */}

                        <div>

                            <label htmlFor="mapa-categoria" className="mb-2 block text-xs font-semibold text-[#75211b]">
                                Categoria
                            </label>

                            <select id="mapa-categoria" value={filtros.categoria} onChange={evento => atualizarFiltro('categoria', evento.target.value)} disabled={salvando} className={campoClasse}>

                                <option value="">Todas</option>

                                {categorias.map(categoria => (

                                    <option key={categoria} value={categoria}>
                                        {categoria}
                                    </option>

                                ))}

                            </select>

                        </div>

                        {/* STATUS */}

                        <div>

                            <label htmlFor="mapa-status" className="mb-2 block text-xs font-semibold text-[#75211b]">
                                Status
                            </label>

                            <select id="mapa-status" value={filtros.status} onChange={evento => atualizarFiltro('status', evento.target.value)} disabled={salvando} className={campoClasse}>

                                <option value="">Todos</option>

                                {statusDisponiveis.map(status => (

                                    <option key={status} value={status}>
                                        {status}
                                    </option>

                                ))}

                            </select>

                        </div>

                        {/* PRIORIDADE */}

                        <div>

                            <label htmlFor="mapa-prioridade" className="mb-2 block text-xs font-semibold text-[#75211b]">
                                Prioridade
                            </label>

                            <select id="mapa-prioridade" value={filtros.prioridade} onChange={evento => atualizarFiltro('prioridade', evento.target.value)} disabled={salvando} className={campoClasse}>

                                <option value="">Todas</option>

                                {prioridades.map(prioridade => (

                                    <option key={prioridade} value={prioridade}>
                                        {prioridade}
                                    </option>

                                ))}

                                <option value="nao-definida">
                                    Não definida
                                </option>

                            </select>

                        </div>

                        {/* PERÍODO */}

                        <div>

                            <label htmlFor="mapa-periodo" className="mb-2 block text-xs font-semibold text-[#75211b]">
                                Período
                            </label>

                            <select id="mapa-periodo" value={filtros.periodo} onChange={evento => atualizarFiltro('periodo', evento.target.value)} disabled={salvando} className={campoClasse}>

                                <option value="">Todo o período</option>

                                <option value="7">Últimos 7 dias</option>

                                <option value="30">Últimos 30 dias</option>

                                <option value="90">Últimos 90 dias</option>

                            </select>

                        </div>

                    </div>

                </section>

                {/* CARREGAMENTO */}

                {carregando && (

                    <div role="status" className="mt-5 flex items-center gap-3 rounded-lg border border-[#dfc2ae] bg-[#fffaf6] p-4">

                        <div className="h-6 w-6 shrink-0 animate-spin rounded-full border-3 border-[#ead5c7] border-t-primaria" />

                        <p className="text-sm text-texto-suave">
                            Consultando as ocorrências na plataforma...
                        </p>

                    </div>

                )}

                {/* TRATAMENTO DE ERROS */}

                {erro && (

                    <div role="alert" className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-4">

                        <div className="flex items-center gap-2 text-red-700">

                            <Icone nome="error_outline" />

                            <p className="text-sm">
                                {erro}
                            </p>

                        </div>

                        <button type="button" onClick={() => void carregarOcorrencias()} disabled={carregando || salvando} className="cursor-pointer rounded-lg bg-primaria px-4 py-2 text-sm font-semibold hover:bg-primaria-hover disabled:opacity-50">

                            <span className="text-white">
                                Tentar novamente
                            </span>

                        </button>

                    </div>

                )}

                {/* MAPA E PAINEL LATERAL */}

                <div className="mt-5 grid items-start gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">

                    {/* MAPA */}

                    <section className="min-w-0 overflow-hidden rounded-xl border border-[#dfc2ae] bg-[#fffaf6] shadow-sm">

                        <div className="relative z-0 h-125 w-full sm:h-145">

                            <MapContainer center={centroSaoPaulo} zoom={7} minZoom={6} maxZoom={18} maxBounds={limitesSaoPaulo} maxBoundsViscosity={1} scrollWheelZoom className="h-full w-full">

                                <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                                <AjustarMapa coordenadas={coordenadas} />

                                <CentralizarOcorrencia ocorrencia={selecionada} />

                                {!erro && grupos.map(([chave, grupo]) => (

                                    <Marker key={chave} position={[
                                        grupo[0].latitude as number,
                                        grupo[0].longitude as number,
                                    ]} icon={criarIcone(
                                        grupo.length === 1
                                            ? grupo[0].prioridade
                                            : null,
                                        grupo.length
                                    )} eventHandlers={{
                                        click: () => {

                                            if (grupo.length === 1) {
                                                selecionarOcorrencia(grupo[0]);
                                            }
                                        },
                                    }}>

                                        <Popup>

                                            <div className="min-w-50 max-w-70 font-corpo">

                                                <h3 className="border-b border-[#ead5c7] pb-2 text-sm font-bold text-primaria">

                                                    {grupo.length === 1
                                                        ? 'Ocorrência registrada'
                                                        : `${grupo.length} ocorrências registradas`}

                                                </h3>

                                                <div className="max-h-65 space-y-3 overflow-y-auto">

                                                    {grupo.map(ocorrencia => (

                                                        <div key={ocorrencia.id} className="border-b border-[#ead5c7] pb-3 last:border-b-0">

                                                            <p className="font-semibold text-primaria">
                                                                {ocorrencia.protocolo}
                                                            </p>

                                                            <p className="text-xs">
                                                                {ocorrencia.categoria}
                                                            </p>

                                                            <p className="text-xs text-texto-suave">

                                                                {[
                                                                    ocorrencia.endereco,
                                                                    ocorrencia.numero,
                                                                    ocorrencia.cidade,
                                                                ].filter(Boolean).join(', ')}

                                                            </p>

                                                            <div className="flex items-center gap-2 text-xs">

                                                                <span className="h-2.5 w-2.5 rounded-full" style={{
                                                                    backgroundColor: corPrioridade(ocorrencia.prioridade),
                                                                }} />

                                                                {ocorrencia.analiseDisponivel
                                                                    ? ocorrencia.prioridade ?? 'Não definida'
                                                                    : 'Indisponível'}

                                                            </div>

                                                            <p className="text-xs">
                                                                Status: {ocorrencia.status}
                                                            </p>

                                                            <button type="button" disabled={salvando} onClick={() => selecionarOcorrencia(ocorrencia)} className="w-full cursor-pointer rounded-lg bg-primaria px-3 py-2 text-xs font-semibold hover:bg-primaria-hover disabled:opacity-50">

                                                                <span className="text-white">
                                                                    Visualizar detalhes
                                                                </span>

                                                            </button>

                                                        </div>

                                                    ))}

                                                </div>

                                            </div>

                                        </Popup>

                                    </Marker>

                                ))}

                            </MapContainer>

                        </div>

                        {/* LEGENDA DO MAPA */}

                        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-3 border-t border-[#ead5c7] px-4 py-4 text-xs">

                            {prioridades.map(prioridade => (

                                <div key={prioridade} className="flex items-center gap-2">

                                    <span className="h-3 w-3 rounded-full" style={{
                                        backgroundColor: corPrioridade(prioridade),
                                    }} />

                                    <span>{prioridade}</span>

                                </div>

                            ))}

                            <div className="flex items-center gap-2">

                                <span className="h-3 w-3 rounded-full bg-[#8d8276]" />

                                Não definida ou indisponível

                            </div>

                            <div className="flex items-center gap-2">

                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primaria text-xs font-bold text-white">
                                    2+
                                </span>

                                Ocorrências agrupadas

                            </div>

                        </div>

                        <div className="border-t border-[#ead5c7] px-4 py-3 text-center text-xs text-texto-suave">
                            Os marcadores representam localizações aproximadas por município, identificadas pelo CEP.
                        </div>

                    </section>

                    {/* PAINEL LATERAL */}

                    <div className="min-w-0 space-y-4">

                        {/* INDICADORES */}

                        <aside className={painelClasse}>

                            <h2 className="flex items-center gap-2 border-b border-[#ead5c7] pb-5 font-titulo text-xl font-bold text-[#75211b]">

                                <Icone nome="location_on" classe="text-2xl" />

                                Ocorrências no Mapa

                            </h2>

                            <div className="border-b border-[#ead5c7] py-4">

                                <strong className="font-titulo text-4xl font-bold text-[#75211b]">

                                    {carregando || erro
                                        ? '—'
                                        : indicadores.localizadas}

                                </strong>

                            </div>

                            <div className="space-y-4 py-5">

                                {[
                                    {
                                        titulo: 'Alta prioridade',
                                        cor: '#b3261e',
                                        icone: 'location_on',
                                        valor: indicadores.alta,
                                    },
                                    {
                                        titulo: 'Média prioridade',
                                        cor: '#e99a3e',
                                        icone: 'location_on',
                                        valor: indicadores.media,
                                    },
                                    {
                                        titulo: 'Baixa prioridade',
                                        cor: '#4f7b43',
                                        icone: 'location_on',
                                        valor: indicadores.baixa,
                                    },
                                    {
                                        titulo: 'Não classificadas',
                                        cor: '#8d8276',
                                        icone: 'location_on',
                                        valor: indicadores.semPrioridade,
                                    },
                                    {
                                        titulo: 'Sem localização',
                                        cor: '#74645a',
                                        icone: 'location_off',
                                        valor: indicadores.semLocalizacao,
                                    },

                                ].map(indicador => (

                                    <div key={indicador.titulo} className="flex items-center justify-between gap-3 text-sm">

                                        <div className="flex items-center gap-2">

                                            <span className="material-icons text-2xl" style={{
                                                color: indicador.cor,
                                            }} aria-hidden="true">

                                                {indicador.icone}

                                            </span>

                                            <span>
                                                {indicador.titulo}
                                            </span>

                                        </div>

                                        <strong>

                                            {carregando || erro
                                                ? '—'
                                                : indicador.valor}

                                        </strong>

                                    </div>

                                ))}

                                {!carregando && !erro && indicadores.indisponiveis > 0 && (

                                    <div className="flex items-center justify-between gap-3 text-sm">

                                        <div className="flex items-center gap-2">

                                            <Icone nome="info_outline" classe="text-[#8d8276]" />

                                            Prioridade indisponível

                                        </div>

                                        <strong>
                                            {indicadores.indisponiveis}
                                        </strong>

                                    </div>

                                )}

                            </div>

                            <div className="border-t border-[#ead5c7] pt-4">

                                <div className="flex items-center justify-between text-sm font-semibold">

                                    <span>Total de ocorrências</span>

                                    <span>

                                        {carregando || erro
                                            ? '—'
                                            : indicadores.total}

                                    </span>

                                </div>

                                <p className="mt-2 text-xs leading-relaxed text-texto-suave">
                                    As prioridades incluem as ocorrências com e sem localização.
                                </p>

                            </div>

                        </aside>

                        {/* DETALHES DA OCORRÊNCIA */}

                        <aside className={painelClasse}>

                            {!selecionada ? (

                                <div className="flex flex-col items-center py-5 text-center">

                                    <Icone nome="assignment" classe="text-3xl text-[#b88e7a]" />

                                    <h2 className="mt-3 font-titulo text-lg font-bold text-primaria">
                                        Detalhes da Ocorrência
                                    </h2>

                                    <p className="mt-3 text-sm leading-relaxed text-texto-suave">
                                        Selecione uma ocorrência no mapa ou na lista abaixo para gerenciar sua prioridade.
                                    </p>

                                </div>

                            ) : (

                                <>

                                    <div className="flex items-start justify-between gap-3 border-b border-[#ead5c7] pb-4">

                                        <div>

                                            <h2 className="flex items-center gap-2 font-titulo text-lg font-bold text-primaria">

                                                <Icone nome="assignment" />

                                                Detalhes da Ocorrência

                                            </h2>

                                            <p className="mt-2 text-sm font-semibold text-primaria">
                                                {selecionada.protocolo}
                                            </p>

                                        </div>

                                        <button type="button" aria-label="Fechar detalhes" disabled={salvando} onClick={() => {

                                            setSelecionadaId(null);
                                            setNovaPrioridade('');
                                            setMensagem('');

                                        }} className="cursor-pointer text-primaria disabled:opacity-50">

                                            <Icone nome="close" />

                                        </button>

                                    </div>

                                    <div className="mt-5 space-y-4">

                                        {/* CATEGORIA */}

                                        <div>

                                            <p className="text-xs font-semibold text-primaria">
                                                Categoria
                                            </p>

                                            <p className="mt-1 text-sm">
                                                {selecionada.categoria}
                                            </p>

                                        </div>

                                        {/* DESCRIÇÃO */}

                                        <div>

                                            <p className="text-xs font-semibold text-primaria">
                                                Descrição
                                            </p>

                                            <p className="mt-1 wrap-break-word text-sm">
                                                {selecionada.descricao || 'Descrição não informada'}
                                            </p>

                                        </div>

                                        {/* LOCALIZAÇÃO */}

                                        <div>

                                            <p className="text-xs font-semibold text-primaria">
                                                Localização
                                            </p>

                                            <p className="mt-1 text-sm">

                                                {[
                                                    selecionada.endereco,
                                                    selecionada.numero,
                                                    selecionada.cidade,
                                                ].filter(Boolean).join(', ') || 'Localização não informada'}

                                            </p>

                                            <p className="mt-1 text-xs text-texto-suave">
                                                CEP: {selecionada.cep || 'Não informado'}
                                            </p>

                                        </div>

                                        {/* DATA */}

                                        <div>

                                            <p className="text-xs font-semibold text-primaria">
                                                Data de registro
                                            </p>

                                            <p className="mt-1 text-sm">
                                                {formatarData(selecionada.dataCriacao)}
                                            </p>

                                        </div>

                                        {/* STATUS */}

                                        <div className="flex items-center justify-between gap-3">

                                            <span className="text-xs font-semibold text-primaria">
                                                Status atual
                                            </span>

                                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${corStatus(selecionada.status)}`}>
                                                {selecionada.status}
                                            </span>

                                        </div>

                                        {/* PRIORIDADE ATUAL */}

                                        <div className="flex items-center justify-between gap-3">

                                            <span className="text-xs font-semibold text-primaria">
                                                Prioridade atual
                                            </span>

                                            <div className="flex items-center gap-2 text-sm font-semibold">

                                                <span className="h-3 w-3 rounded-full" style={{
                                                    backgroundColor: corPrioridade(selecionada.prioridade),
                                                }} />

                                                {selecionada.analiseDisponivel
                                                    ? selecionada.prioridade ?? 'Não definida'
                                                    : 'Indisponível'}

                                            </div>

                                        </div>

                                    </div>

                                    {/* ALTERAR PRIORIDADE */}

                                    <section className="mt-5 border-t border-[#ead5c7] pt-5">

                                        <h3 className="flex items-center gap-2 font-titulo text-lg font-bold text-primaria">

                                            <Icone nome="flag" classe="text-xl" />

                                            Alterar Prioridade

                                        </h3>

                                        <p className="mt-2 text-xs leading-relaxed text-texto-suave">
                                            Classifique a ocorrência de acordo com sua urgência.
                                        </p>

                                        <div className="mt-4 space-y-2">

                                            {prioridades.map(prioridade => (

                                                <label key={prioridade} className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${novaPrioridade === prioridade ? 'border-primaria bg-[#f5e9e0]' : 'border-[#ead5c7] hover:bg-[#fbf1e9]'} ${!podeClassificar ? 'opacity-60' : ''}`}>

                                                    <input type="radio" name="prioridade-ocorrencia" value={prioridade} checked={novaPrioridade === prioridade} onChange={() => setNovaPrioridade(prioridade)} disabled={!podeClassificar} className="h-4 w-4 accent-primaria" />

                                                    <span className="h-3 w-3 shrink-0 rounded-full" style={{
                                                        backgroundColor: corPrioridade(prioridade),
                                                    }} />

                                                    <div>

                                                        <p className="text-sm font-semibold">
                                                            {prioridade}
                                                        </p>

                                                        <p className="mt-0.5 text-xs text-texto-suave">

                                                            {prioridade === 'Alta'
                                                                ? 'Necessita de atenção urgente.'
                                                                : prioridade === 'Média'
                                                                    ? 'Necessita de atenção, sem risco imediato.'
                                                                    : 'Ocorrência de menor urgência.'}

                                                        </p>

                                                    </div>

                                                </label>

                                            ))}

                                        </div>

                                        {/* SALVAR PRIORIDADE */}

                                        <button type="button" onClick={() => void salvarPrioridade()} disabled={!podeClassificar || !novaPrioridade || novaPrioridade === selecionada.prioridade} className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primaria px-4 py-3 text-sm font-semibold transition-colors hover:bg-primaria-hover disabled:cursor-not-allowed disabled:opacity-50">

                                            <Icone nome={salvando ? 'sync' : 'save'} classe={`text-xl text-white ${salvando ? 'animate-spin' : ''}`} />

                                            <span className="text-white">

                                                {salvando
                                                    ? 'Salvando...'
                                                    : 'Salvar prioridade'}

                                            </span>

                                        </button>

                                        {!podeClassificar && !carregando && !salvando && (

                                            <p className="mt-3 text-xs text-primaria">
                                                É necessário consultar os dados da análise e possuir um histórico válido para realizar a classificação inicial.
                                            </p>

                                        )}

                                        {mensagem && (

                                            <p role="status" className={`mt-3 rounded-lg p-3 text-xs font-semibold ${tipoMensagem === 'sucesso' ? 'bg-[#e5efdc] text-[#41642d]' : 'bg-red-50 text-red-700]'}`}>

                                                {mensagem}

                                            </p>

                                        )}

                                    </section>

                                </>

                            )}

                        </aside>

                    </div>

                </div>

                {/* LISTA DE OCORRÊNCIAS */}

                <section className={`${painelClasse} mt-5`}>

                    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">

                        <h2 className="flex items-center gap-2 font-titulo text-xl font-bold text-primaria">

                            <Icone nome="format_list_bulleted" classe="text-2xl" />

                            Ocorrências registradas

                        </h2>

                        <button type="button" onClick={() => {

                            setSelecionadaId(null);
                            setNovaPrioridade('');
                            setMensagem('');

                            void carregarOcorrencias();

                        }} disabled={carregando || salvando} className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-primaria hover:underline disabled:opacity-50">

                            <Icone nome="refresh" classe={`text-xl ${carregando ? 'animate-spin' : ''}`} />

                            Atualizar lista

                        </button>

                    </div>

                    <p className="mb-4 text-xs text-texto-suave">
                        Selecione uma ocorrência para consultar seus detalhes ou alterar sua prioridade, mesmo que ela não esteja localizada no mapa.
                    </p>

                    <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">

                        {!carregando && !erro && ocorrenciasFiltradas.map(ocorrencia => (

                            <button key={ocorrencia.id} type="button" disabled={salvando} onClick={() => selecionarOcorrencia(ocorrencia)} className={`cursor-pointer rounded-xl border p-4 text-left transition-colors disabled:opacity-50 ${selecionadaId === ocorrencia.id ? 'border-primaria bg-[#f5e9e0]' : 'border-[#ead5c7] hover:bg-[#fbf1e9]'}`}>

                                <div className="flex items-center justify-between gap-3">

                                    <strong className="text-sm text-primaria">
                                        {ocorrencia.protocolo}
                                    </strong>

                                    <Icone nome="visibility" classe="text-xl text-primaria" />

                                </div>

                                <p className="mt-2 text-sm font-semibold">
                                    {ocorrencia.categoria}
                                </p>

                                <p className="mt-1 truncate text-xs text-texto-suave">
                                    {ocorrencia.endereco || 'Endereço não informado'}
                                </p>

                                <div className="mt-3 flex flex-wrap items-center gap-3">

                                    <span className="flex items-center gap-1.5 text-xs">

                                        <span className="h-2.5 w-2.5 rounded-full" style={{
                                            backgroundColor: corPrioridade(ocorrencia.prioridade),
                                        }} />

                                        {ocorrencia.analiseDisponivel
                                            ? ocorrencia.prioridade ?? 'Não definida'
                                            : 'Indisponível'}

                                    </span>

                                    <span className={`rounded-full px-2 py-1 text-xs ${corStatus(ocorrencia.status)}`}>
                                        {ocorrencia.status}
                                    </span>

                                </div>

                                <div className="mt-3 flex items-center gap-1 text-xs text-texto-suave">

                                    <Icone nome={possuiLocalizacao(ocorrencia) ? 'location_on' : 'location_off'} classe="text-lg" />

                                    {possuiLocalizacao(ocorrencia)
                                        ? ocorrencia.cidade
                                        : 'Sem localização no mapa'}

                                </div>

                            </button>

                        ))}

                    </div>

                    {/* NENHUMA OCORRÊNCIA */}

                    {!carregando && !erro && ocorrenciasFiltradas.length === 0 && (

                        <div className="flex flex-col items-center py-10 text-center">

                            <Icone nome="inbox" classe="text-5xl text-[#b88e7a]" />

                            <p className="mt-3 font-titulo text-lg font-bold text-primaria">
                                Nenhuma ocorrência encontrada
                            </p>

                            <p className="mt-2 text-sm text-texto-suave">
                                Não existem ocorrências disponíveis para os filtros selecionados.
                            </p>

                        </div>

                    )}

                    {/* GERENCIAR OCORRÊNCIAS */}

                    <div className="mt-5 flex justify-end">

                        <Link to="/admin/gerenciar-ocorrencias" className="flex items-center justify-center gap-2 rounded-lg bg-primaria px-5 py-3 text-sm font-semibold transition-colors hover:bg-primaria-hover">

                            <Icone nome="list" classe="text-xl text-white" />

                            <span className="text-white">
                                Gerenciar Ocorrências
                            </span>

                        </Link>

                    </div>

                </section>

            </div>

        </main>
    );
}