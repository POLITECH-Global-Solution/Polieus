import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { listarOcorrencias } from '../../services/ocorrenciaService';

import {
    listarHistoricos,
    obterHistoricoInicial,
    obterHistoricoAtual,
    gerarProtocolo,
} from '../../services/historicoService';

import {
    listarAnalises,
    obterAnalisePorProtocolo,
    normalizarPrioridade,
} from '../../services/analiseService';

// TIPAGENS

type Prioridade = 'Alta' | 'Média' | 'Baixa';

type Status = 'Pendente' | 'Em análise' | 'Em andamento' | 'Concluído' | 'Não informado';

interface Ocorrencia {
    id: number;
    protocolo: string;
    categoria: string;
    descricao: string;
    endereco: string;
    cep: string;
    status: Status;
    prioridade: Prioridade | null;
    analiseDisponivel: boolean;
    dataCriacao: string | null;
    latitude?: number;
    longitude?: number;
}

// CONSTANTES

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
    'Concluído': 'bg-[#d8e4c8] text-[#35562d]',
    'Não informado': 'bg-[#e5ded8] text-[#74645a]',
};

const statusDisponiveis: { nome: Status; cor: string }[] = [
    { nome: 'Pendente', cor: '#b3261e' },
    { nome: 'Em análise', cor: '#e99a3e' },
    { nome: 'Em andamento', cor: '#668fa5' },
    { nome: 'Concluído', cor: '#4f7b43' },
    { nome: 'Não informado', cor: '#9c897c' },
];

// FUNÇÕES AUXILIARES

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

function normalizarTexto(valor: string) {
    return valor.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
}

function normalizarStatus(valor?: string): Status {

    switch (normalizarTexto(valor ?? '')) {

        case 'pendente':
            return 'Pendente';

        case 'em analise':
            return 'Em análise';

        case 'em andamento':
            return 'Em andamento';

        case 'resolvida':
        case 'resolvido':
        case 'concluida':
        case 'concluido':
            return 'Concluído';

        default:
            return 'Não informado';
    }
}

function converterData(valor?: string | null): Date | null {

    if (!valor) return null;

    const partes = valor.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/);

    if (partes) {

        const dia = Number(partes[1]);
        const mes = Number(partes[2]);
        const ano = Number(partes[3]);

        const data = new Date(ano, mes - 1, dia);

        return data.getDate() === dia &&
            data.getMonth() === mes - 1 &&
            data.getFullYear() === ano ? data : null;
    }

    const partesISO = valor.match(/^(\d{4})-(\d{2})-(\d{2})$/);

    if (partesISO) {

        const ano = Number(partesISO[1]);
        const mes = Number(partesISO[2]);
        const dia = Number(partesISO[3]);

        const data = new Date(ano, mes - 1, dia);

        return data.getFullYear() === ano &&
            data.getMonth() === mes - 1 &&
            data.getDate() === dia ? data : null;
    }

    const data = new Date(valor);

    return Number.isNaN(data.getTime()) ? null : data;
}

function textoPrioridade(ocorrencia: Ocorrencia) {

    if (!ocorrencia.analiseDisponivel) {
        return 'Indisponível';
    }

    return ocorrencia.prioridade ?? 'Não definida';
}

// LOCALIZAÇÃO APROXIMADA PELO CEP

const municipios: {
    inicio: number;
    fim: number;
    latitude: number;
    longitude: number;
}[] = [
    { inicio: 1000000, fim: 5999999, latitude: -23.5505, longitude: -46.6333 },
    { inicio: 6000000, fim: 6299999, latitude: -23.5329, longitude: -46.7917 },
    { inicio: 7000000, fim: 7399999, latitude: -23.4543, longitude: -46.5337 },
    { inicio: 8000000, fim: 8499999, latitude: -23.5505, longitude: -46.6333 },
    { inicio: 9000000, fim: 9299999, latitude: -23.6639, longitude: -46.5383 },
    { inicio: 9300000, fim: 9399999, latitude: -23.6677, longitude: -46.4613 },
    { inicio: 9400000, fim: 9449999, latitude: -23.7108, longitude: -46.4138 },
    { inicio: 9450000, fim: 9499999, latitude: -23.7443, longitude: -46.3983 },
    { inicio: 9500000, fim: 9599999, latitude: -23.6229, longitude: -46.5548 },
    { inicio: 9600000, fim: 9899999, latitude: -23.6914, longitude: -46.5646 },
    { inicio: 9900000, fim: 9999999, latitude: -23.6813, longitude: -46.6205 },
];

function obterCoordenadas(cep: string) {

    const cepLimpo = cep.replace(/\D/g, '');

    if (cepLimpo.length !== 8) return null;

    const valor = Number(cepLimpo);

    const municipio = municipios.find(
        item => valor >= item.inicio && valor <= item.fim
    );

    if (!municipio) return null;

    return {
        latitude: municipio.latitude,
        longitude: municipio.longitude,
    };
}

// MARCADORES DO MAPA

function criarIcone(prioridade: Prioridade | null, quantidade = 1) {

    const cor = prioridade ? coresPrioridade[prioridade] : '#9c897c';

    if (quantidade > 1) {

        return L.divIcon({
            className: '',
            html: `
                <div style="
                    width:34px;
                    height:34px;
                    background:${cor};
                    border:3px solid white;
                    border-radius:50%;
                    color:white;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    font-size:12px;
                    font-weight:bold;
                    box-shadow:0 3px 8px rgba(0,0,0,0.25);
                ">${quantidade}</div>
            `,
            iconSize: [34, 34],
            iconAnchor: [17, 17],
            popupAnchor: [0, -17],
        });
    }

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

// COMPONENTE DOS INDICADORES

function CartaoIndicador({ icone, valor, descricao, cor = 'bg-primaria' }: {
    icone: string;
    valor: number | null;
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
                    {valor === null ? '—' : numero(valor)}
                </strong>

                <p className="text-sm text-texto">{descricao}</p>

            </div>

        </div>
    );
}

// DASHBOARD ADMINISTRATIVO

export default function AdminDashboard() {

    const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
    const [periodo, setPeriodo] = useState('30');

    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');
    const [aviso, setAviso] = useState('');

    const [historicosDisponiveis, setHistoricosDisponiveis] = useState(false);
    const [analisesDisponiveis, setAnalisesDisponiveis] = useState(false);

    const [atualizacao, setAtualizacao] = useState(0);
    const [dataReferencia, setDataReferencia] = useState(() => Date.now());

    // INTEGRAÇÃO COM A API JAVA

    useEffect(() => {

        let ativo = true;

        async function carregar() {

            setCarregando(true);
            setErro('');
            setAviso('');
            setHistoricosDisponiveis(false);
            setAnalisesDisponiveis(false);

            try {

                const registros = await listarOcorrencias();

                if (!ativo) return;

                const [resultadoHistoricos, resultadoAnalises] = await Promise.allSettled([
                    listarHistoricos(),
                    listarAnalises(),
                ]);

                if (!ativo) return;

                const historicos = resultadoHistoricos.status === 'fulfilled' &&
                    Array.isArray(resultadoHistoricos.value)
                    ? resultadoHistoricos.value
                    : [];

                const analises = resultadoAnalises.status === 'fulfilled' &&
                    Array.isArray(resultadoAnalises.value)
                    ? resultadoAnalises.value
                    : [];

                const consultaHistoricos = resultadoHistoricos.status === 'fulfilled' &&
                    Array.isArray(resultadoHistoricos.value);

                const consultaAnalises = resultadoAnalises.status === 'fulfilled' &&
                    Array.isArray(resultadoAnalises.value);

                const avisos: string[] = [];

                if (!consultaHistoricos) {
                    avisos.push('Não foi possível consultar os históricos das ocorrências.');
                }

                if (!consultaAnalises) {
                    avisos.push('Não foi possível consultar as prioridades das ocorrências.');
                }

                const ocorrenciasFormatadas: Ocorrencia[] = [];

                for (const ocorrencia of registros) {

                    const id = ocorrencia.idOcorrencia;

                    if (typeof id !== 'number' || !Number.isInteger(id) || id <= 0) {
                        continue;
                    }

                    const historicosOcorrencia = historicos.filter(
                        historico => Number(historico.idOcorrencia) === id
                    );

                    const historicoInicial = obterHistoricoInicial(historicosOcorrencia);

                    const historicoAtual = obterHistoricoAtual(historicosOcorrencia);

                    const protocolo = historicoInicial?.protocolo ||
                        historicoAtual?.protocolo ||
                        gerarProtocolo(id);

                    let prioridade: Prioridade | null = null;

                    let analiseDisponivel = consultaAnalises && consultaHistoricos;

                    if (analiseDisponivel) {

                        try {

                            const analise = obterAnalisePorProtocolo(analises, protocolo);

                            prioridade = normalizarPrioridade(analise?.prioridade);

                        } catch (erro) {

                            analiseDisponivel = false;

                            console.error(`Erro ao consultar análise de ${protocolo}:`, erro);
                        }
                    }

                    const coordenadas = obterCoordenadas(ocorrencia.cep || '');

                    ocorrenciasFormatadas.push({
                        id,
                        protocolo,
                        categoria: ocorrencia.categoria || 'Não informada',
                        descricao: ocorrencia.descricao || '',
                        endereco: [ocorrencia.endereco, ocorrencia.departamento].filter(Boolean).join(', ') || 'Não informado',
                        cep: ocorrencia.cep || '',
                        status: normalizarStatus(historicoAtual?.status),
                        prioridade,
                        analiseDisponivel,
                        dataCriacao: historicoInicial?.data || null,
                        latitude: coordenadas?.latitude,
                        longitude: coordenadas?.longitude,
                    });
                }

                const semStatus = ocorrenciasFormatadas.filter(
                    item => item.status === 'Não informado'
                ).length;

                const falhasPrioridade = ocorrenciasFormatadas.filter(
                    item => !item.analiseDisponivel
                ).length;

                if (consultaHistoricos && semStatus > 0) {

                    avisos.push(`${numero(semStatus)} ocorrência(s) sem status informado.`);
                }

                if (consultaAnalises && consultaHistoricos && falhasPrioridade > 0) {

                    avisos.push(`${numero(falhasPrioridade)} ocorrência(s) com prioridade indisponível.`);
                }

                setHistoricosDisponiveis(consultaHistoricos);
                setAnalisesDisponiveis(consultaAnalises);
                setOcorrencias(ocorrenciasFormatadas);
                setDataReferencia(Date.now());
                setAviso(avisos.join(' '));

            } catch (erro) {

                if (!ativo) return;

                console.error('Erro ao carregar dashboard:', erro);

                setOcorrencias([]);
                setErro('Não foi possível carregar os dados do painel administrativo.');

            } finally {

                if (ativo) {
                    setCarregando(false);
                }
            }
        }

        void carregar();

        return () => {
            ativo = false;
        };

    }, [atualizacao]);

    const atualizarDados = () => {

        if (carregando) return;

        setAtualizacao(valor => valor + 1);
    };

    // INDICADORES PRINCIPAIS

    const indicadores = useMemo(() => ({

        total: ocorrencias.length,

        concluidas: ocorrencias.filter(
            o => o.status === 'Concluído'
        ).length,

        analise: ocorrencias.filter(
            o => o.status === 'Em análise'
        ).length,

        pendentes: ocorrencias.filter(
            o => o.status === 'Pendente'
        ).length,

        andamento: ocorrencias.filter(
            o => o.status === 'Em andamento'
        ).length,

        semStatus: ocorrencias.filter(
            o => o.status === 'Não informado'
        ).length,

        altaPrioridade: ocorrencias.filter(
            o => o.prioridade === 'Alta'
        ).length,

        mediaPrioridade: ocorrencias.filter(
            o => o.prioridade === 'Média'
        ).length,

        baixaPrioridade: ocorrencias.filter(
            o => o.prioridade === 'Baixa'
        ).length,

        altaPrioridadeNaoConcluida: ocorrencias.filter(
            o => o.prioridade === 'Alta' &&
                o.status !== 'Concluído' &&
                o.status !== 'Não informado'
        ).length,

        semPrioridade: ocorrencias.filter(
            o => o.analiseDisponivel && o.prioridade === null
        ).length,

        prioridadeIndisponivel: ocorrencias.filter(
            o => !o.analiseDisponivel
        ).length,

        semData: ocorrencias.filter(
            o => !converterData(o.dataCriacao)
        ).length,

    }), [ocorrencias]);

    const dadosDisponiveis = !carregando && !erro;

    const statusDisponivel = dadosDisponiveis && historicosDisponiveis;

    const prioridadeDisponivel = dadosDisponiveis &&
        analisesDisponiveis && historicosDisponiveis;

    const taxaResolucaoDisponivel = statusDisponivel &&
        indicadores.semStatus === 0 && indicadores.total > 0;

    const taxaResolucao = indicadores.total > 0
        ? (indicadores.concluidas / indicadores.total) * 100
        : 0;

    // OCORRÊNCIAS RECENTES

    const ocorrenciasRecentes = useMemo(() => {

        return [...ocorrencias]
            .sort((a, b) => {

                const dataA = converterData(a.dataCriacao)?.getTime() ?? 0;

                const dataB = converterData(b.dataCriacao)?.getTime() ?? 0;

                return dataB - dataA || b.id - a.id;
            })
            .slice(0, 4);

    }, [ocorrencias]);

    // FILTRO POR PERÍODO

    const ocorrenciasPeriodo = useMemo(() => {

        if (periodo === 'todos') return ocorrencias;

        const limite = new Date(dataReferencia);

        limite.setHours(0, 0, 0, 0);
        limite.setDate(limite.getDate() - Number(periodo) + 1);

        const fim = new Date(dataReferencia);

        fim.setHours(23, 59, 59, 999);

        return ocorrencias.filter(ocorrencia => {

            const data = converterData(ocorrencia.dataCriacao);

            return data !== null && data >= limite && data <= fim;
        });

    }, [ocorrencias, periodo, dataReferencia]);

    // OCORRÊNCIAS POR CATEGORIA

    const categorias = useMemo(() => {

        const contagem = new Map<string, {
            nome: string;
            quantidade: number;
        }>();

        ocorrenciasPeriodo.forEach(ocorrencia => {

            const nome = ocorrencia.categoria.trim() || 'Outros';

            const chave = normalizarTexto(nome);

            const existente = contagem.get(chave);

            contagem.set(chave, {
                nome: existente?.nome ?? nome,
                quantidade: (existente?.quantidade ?? 0) + 1,
            });
        });

        return [...contagem.values()]
            .sort((a, b) => b.quantidade - a.quantidade)
            .slice(0, 6);

    }, [ocorrenciasPeriodo]);

    const maiorCategoria = Math.max(
        1,
        ...categorias.map(categoria => categoria.quantidade)
    );

    // MAPA DE OCORRÊNCIAS

    const ocorrenciasMapa = useMemo(() => {

        return ocorrencias.filter(ocorrencia =>
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

    // AGRUPAMENTO DE MARCADORES

    const gruposMapa = useMemo(() => {

        const grupos = new Map<string, {
            latitude: number;
            longitude: number;
            ocorrencias: Ocorrencia[];
            prioridade: Prioridade | null;
        }>();

        ocorrenciasMapa.forEach(ocorrencia => {

            const latitude = ocorrencia.latitude;
            const longitude = ocorrencia.longitude;

            if (latitude === undefined || longitude === undefined) return;

            const chave = `${latitude},${longitude}`;

            const grupo = grupos.get(chave);

            if (grupo) {

                grupo.ocorrencias.push(ocorrencia);

                grupo.prioridade = grupo.ocorrencias.some(o => o.prioridade === 'Alta')
                    ? 'Alta'
                    : grupo.ocorrencias.some(o => o.prioridade === 'Média')
                        ? 'Média'
                        : grupo.ocorrencias.some(o => o.prioridade === 'Baixa')
                            ? 'Baixa'
                            : null;

            } else {

                grupos.set(chave, {
                    latitude,
                    longitude,
                    ocorrencias: [ocorrencia],
                    prioridade: ocorrencia.prioridade,
                });
            }
        });

        return [...grupos.values()];

    }, [ocorrenciasMapa]);

    // RESUMO DOS ÚLTIMOS SETE DIAS

    const ultimosSeteDias = useMemo(() => {

        const hoje = new Date(dataReferencia);

        hoje.setHours(0, 0, 0, 0);

        return Array.from({ length: 7 }, (_, indice) => {

            const dia = new Date(hoje);

            dia.setDate(hoje.getDate() - (6 - indice));

            const proximoDia = new Date(dia);

            proximoDia.setDate(dia.getDate() + 1);

            const quantidade = ocorrencias.filter(ocorrencia => {

                const data = converterData(ocorrencia.dataCriacao);

                return data !== null && data >= dia && data < proximoDia;

            }).length;

            return {
                data: dia.toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                }),
                quantidade,
            };
        });

    }, [ocorrencias, dataReferencia]);

    const maiorDia = Math.max(
        1,
        ...ultimosSeteDias.map(dia => dia.quantidade)
    );

    // INTERFACE

    return (

        <main className="min-h-screen w-full bg-fundo font-corpo text-texto">

            <div className="mx-auto max-w-400 px-5 py-7 sm:px-8 lg:px-10">

                {/* CABEÇALHO */}

                <header className="border-b border-[#d4b19e] pb-5">

                    <div className="flex flex-wrap items-center justify-between gap-3">

                        <div className="flex items-center gap-2 text-primaria">

                            <Icone nome="account_balance" classe="text-3xl" />

                            <span className="font-titulo text-xl font-bold">
                                Área Administrativa
                            </span>

                        </div>

                        <button type="button" onClick={atualizarDados} disabled={carregando} className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#d4b19e] px-3 py-2 text-xs font-semibold text-primaria transition-colors hover:bg-[#f5e5d9] disabled:cursor-not-allowed disabled:opacity-50">

                            <Icone nome="refresh" classe={carregando ? 'animate-spin text-lg' : 'text-lg'} />

                            {carregando ? 'Atualizando...' : 'Atualizar dados'}

                        </button>

                    </div>

                    <h1 className="mt-5 font-titulo text-4xl font-bold text-[#79221b]">
                        Olá, Administrador!
                    </h1>

                    <p className="mt-2 text-sm text-texto-suave sm:text-base">
                        Gerencie as ocorrências, acompanhe os indicadores e coordene as demandas da cidade.
                    </p>

                </header>

                {/* CARREGAMENTO */}

                {carregando && (

                    <div role="status" className="mt-5 flex items-center gap-3 rounded-xl border border-[#dfbba9] bg-[#fff9f4] p-4">

                        <div className="h-6 w-6 animate-spin rounded-full border-3 border-[#dfbba9] border-t-primaria" />

                        <p className="text-sm text-texto-suave">
                            Carregando dados da plataforma...
                        </p>

                    </div>

                )}

                {/* ERROS */}

                {erro && (

                    <div role="alert" className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#dfbba9] bg-[#f5e5d9] p-4">

                        <div className="flex items-center gap-2 text-primaria">

                            <Icone nome="error_outline" classe="text-2xl" />

                            <p className="text-sm">{erro}</p>

                        </div>

                        <button type="button" onClick={atualizarDados} className="cursor-pointer rounded-lg bg-primaria px-4 py-2 text-xs font-semibold text-white">

                            <span className="text-white">Tentar novamente</span>

                        </button>

                    </div>

                )}

                {aviso && !erro && (

                    <div role="status" className="mt-5 flex items-center gap-3 rounded-xl border border-[#dfbba9] bg-[#f5e5d9] p-4">

                        <Icone nome="info" classe="text-2xl text-primaria" />

                        <p className="text-sm">{aviso}</p>

                    </div>

                )}

                {/* INDICADORES PRINCIPAIS */}

                <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">

                    <CartaoIndicador icone="campaign" valor={dadosDisponiveis ? indicadores.total : null} descricao="Ocorrências registradas" />

                    <CartaoIndicador icone="check" valor={statusDisponivel ? indicadores.concluidas : null} descricao="Concluídas" cor="bg-green-700" />

                    <CartaoIndicador icone="schedule" valor={statusDisponivel ? indicadores.analise : null} descricao="Em análise" />

                    <CartaoIndicador icone="warning" valor={statusDisponivel ? indicadores.pendentes : null} descricao="Pendentes" />

                </section>

                {/* MAPA E CATEGORIAS */}

                <div className="mt-5 grid gap-4 xl:grid-cols-2">

                    <section className="min-w-0 overflow-hidden rounded-2xl border border-[#dfbba9] bg-[#fff9f4]/80 p-4 shadow-sm">

                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ead3c5] pb-3">

                            <h2 className="flex items-center gap-2 font-titulo text-xl font-bold text-[#79221b]">

                                <Icone nome="location_on" classe="text-3xl" />

                                Mapa de Ocorrências

                            </h2>

                            <Link to="/admin/mapa-ocorrencias" className="flex items-center gap-1 text-sm font-semibold underline">

                                <span className="text-primaria">Ver mapa completo</span>

                                <Icone nome="arrow_forward" classe="text-lg text-primaria" />

                            </Link>

                        </div>

                        <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_150px]">

                            <div className="relative isolate h-65 overflow-hidden rounded-xl border border-[#ead3c5]">

                                <MapContainer center={centroSaoPaulo} zoom={7} minZoom={6} maxZoom={18} maxBounds={limitesSaoPaulo} maxBoundsViscosity={1} scrollWheelZoom={false} className="h-full w-full">

                                    <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                                    <AjustarMapa />

                                    {dadosDisponiveis && gruposMapa.map(grupo => (

                                        <Marker key={`${grupo.latitude}-${grupo.longitude}`} position={[grupo.latitude, grupo.longitude]} icon={criarIcone(grupo.prioridade, grupo.ocorrencias.length)}>

                                            <Popup>

                                                <div className="max-h-65 overflow-y-auto font-corpo">

                                                    <strong className="text-primaria">
                                                        {grupo.ocorrencias.length} ocorrência(s)
                                                    </strong>

                                                    <p className="text-xs text-texto-suave">
                                                        Localização aproximada
                                                    </p>

                                                    {grupo.ocorrencias.map(ocorrencia => (

                                                        <div key={ocorrencia.id} className="border-t border-[#ead3c5] py-2">

                                                            <strong>
                                                                {ocorrencia.protocolo}
                                                            </strong>

                                                            <div className="mt-1 text-xs">
                                                                {ocorrencia.categoria}
                                                            </div>

                                                            <div className="mt-1 text-xs">
                                                                {ocorrencia.endereco}
                                                            </div>

                                                            <div className="mt-1 flex items-center gap-2 text-xs">

                                                                <span className="h-2.5 w-2.5 rounded-full" style={{
                                                                    backgroundColor: ocorrencia.prioridade
                                                                        ? coresPrioridade[ocorrencia.prioridade]
                                                                        : '#9c897c',
                                                                }} />

                                                                {textoPrioridade(ocorrencia)}

                                                            </div>

                                                            <div className="mt-1 text-xs">
                                                                {ocorrencia.status}
                                                            </div>

                                                        </div>

                                                    ))}

                                                </div>

                                            </Popup>

                                        </Marker>

                                    ))}

                                </MapContainer>

                            </div>

                            {/* LEGENDA DO MAPA */}

                            <div className="flex flex-col justify-center gap-4">

                                {([
                                    ['Alta prioridade', '#b3261e', indicadores.altaPrioridade],
                                    ['Média prioridade', '#e99a3e', indicadores.mediaPrioridade],
                                    ['Baixa prioridade', '#4f7b43', indicadores.baixaPrioridade],
                                    ['Não definida', '#9c897c', indicadores.semPrioridade],
                                ] as const).map(([prioridade, cor, quantidade]) => (

                                    <div key={prioridade} className="flex items-center justify-between gap-2">

                                        <div className="flex items-center gap-2">

                                            <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: cor }} />

                                            <span className="text-xs">
                                                {prioridade}
                                            </span>

                                        </div>

                                        <strong className="text-xs text-primaria">
                                            {prioridadeDisponivel ? quantidade : '—'}
                                        </strong>

                                    </div>

                                ))}

                                <p className="text-xs leading-relaxed text-texto-suave">

                                    {carregando
                                        ? 'Consultando ocorrências...'
                                        : erro
                                            ? 'Dados indisponíveis.'
                                            : `${numero(ocorrenciasMapa.length)} de ${numero(indicadores.total)} ocorrências localizadas.`}

                                </p>

                            </div>

                        </div>

                        <p className="mt-3 text-xs leading-relaxed text-texto-suave">
                            Localizações aproximadas pelo CEP. Marcadores agrupados utilizam a maior prioridade identificada. Os totais da legenda consideram todas as ocorrências.
                        </p>

                        {dadosDisponiveis && ocorrenciasMapa.length < indicadores.total && (

                            <p className="mt-2 text-xs text-texto-suave">
                                {indicadores.total - ocorrenciasMapa.length} ocorrência(s) sem localização disponível no mapa.
                            </p>

                        )}

                    </section>

                    {/* GRÁFICO POR CATEGORIA */}

                    <section className="min-w-0 rounded-2xl border border-[#dfbba9] bg-[#fff9f4]/80 p-4 shadow-sm">

                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ead3c5] pb-3">

                            <h2 className="flex items-center gap-2 font-titulo text-xl font-bold text-[#79221b]">

                                <Icone nome="bar_chart" classe="text-3xl" />

                                Ocorrências por Categoria

                            </h2>

                            <select aria-label="Período do gráfico" value={periodo} onChange={evento => setPeriodo(evento.target.value)} className="rounded-lg border border-[#d8b9a7] bg-white/60 px-3 py-2 text-xs outline-none focus:border-primaria">

                                <option value="7">Últimos 7 dias</option>
                                <option value="30">Últimos 30 dias</option>
                                <option value="90">Últimos 90 dias</option>
                                <option value="todos">Todo o período</option>

                            </select>

                        </div>

                        {!dadosDisponiveis || (periodo !== 'todos' && !historicosDisponiveis) || categorias.length === 0 ? (

                            <div className="flex h-65 items-center justify-center text-center text-sm text-texto-suave">

                                {carregando
                                    ? 'Carregando categorias...'
                                    : erro || (periodo !== 'todos' && !historicosDisponiveis)
                                        ? 'Dados indisponíveis.'
                                        : 'Nenhuma ocorrência disponível no período selecionado.'}

                            </div>

                        ) : (

                            <div className="mt-5 flex h-65 items-end gap-3 border-b border-[#d8b9a7] pb-7">

                                {categorias.map(categoria => (

                                    <div key={categoria.nome} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2">

                                        <span className="text-xs font-semibold">
                                            {categoria.quantidade}
                                        </span>

                                        <div className="w-full max-w-18 rounded-t-md bg-linear-to-t from-primaria to-[#d28c7c]" style={{
                                            height: `${Math.max(5, (categoria.quantidade / maiorCategoria) * 85)}%`,
                                        }} />

                                        <span title={categoria.nome} className="w-full truncate text-center text-[10px]">
                                            {categoria.nome}
                                        </span>

                                    </div>

                                ))}

                            </div>

                        )}

                        {dadosDisponiveis && periodo !== 'todos' && indicadores.semData > 0 && (

                            <p className="mt-3 text-xs text-texto-suave">
                                {indicadores.semData} ocorrência(s) sem data de histórico não foram incluídas neste período.
                            </p>

                        )}

                    </section>

                </div>

                {/* OCORRÊNCIAS RECENTES E AÇÕES RÁPIDAS */}

                <div className="mt-5 grid gap-4 xl:grid-cols-2">

                    <section className="min-w-0 rounded-2xl border border-[#dfbba9] bg-[#fff9f4]/80 p-4 shadow-sm">

                        <div className="flex items-center justify-between gap-3 border-b border-[#ead3c5] pb-3">

                            <h2 className="flex items-center gap-2 font-titulo text-xl font-bold text-[#79221b]">

                                <Icone nome="format_list_bulleted" classe="text-3xl" />

                                Ocorrências Recentes

                            </h2>

                            <Link to="/admin/gerenciar-ocorrencias" className="flex items-center gap-1 text-sm font-semibold underline">

                                <span className="text-primaria">Ver todas</span>

                                <Icone nome="arrow_forward" classe="text-lg text-primaria" />

                            </Link>

                        </div>

                        {!dadosDisponiveis || ocorrenciasRecentes.length === 0 ? (

                            <p className="py-14 text-center text-sm text-texto-suave">

                                {carregando
                                    ? 'Carregando ocorrências...'
                                    : erro
                                        ? 'Não foi possível consultar as ocorrências.'
                                        : 'Nenhuma ocorrência registrada até o momento.'}

                            </p>

                        ) : (

                            <div className="mt-4 overflow-x-auto">

                                <table className="w-full text-left text-xs">

                                    <thead className="bg-[#f5e5d9] text-primaria">

                                        <tr>

                                            <th scope="col" className="rounded-l-lg px-2 py-3">Protocolo</th>

                                            <th scope="col" className="px-2 py-3">Categoria</th>

                                            <th scope="col" className="px-2 py-3">Localização</th>

                                            <th scope="col" className="px-2 py-3">Prioridade</th>

                                            <th scope="col" className="px-2 py-3">Status</th>

                                            <th scope="col" className="rounded-r-lg px-2 py-3">Ações</th>

                                        </tr>

                                    </thead>

                                    <tbody>

                                        {ocorrenciasRecentes.map(ocorrencia => (

                                            <tr key={ocorrencia.id} className="border-b border-[#ead3c5]">

                                                <td className="px-2 py-3 font-semibold">
                                                    {ocorrencia.protocolo}
                                                </td>

                                                <td className="px-2 py-3">
                                                    {ocorrencia.categoria}
                                                </td>

                                                <td className="px-2 py-3">
                                                    {ocorrencia.endereco}
                                                </td>

                                                <td className="px-2 py-3">

                                                    <div className="flex items-center gap-1.5">

                                                        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{
                                                            backgroundColor: ocorrencia.prioridade
                                                                ? coresPrioridade[ocorrencia.prioridade]
                                                                : '#9c897c',
                                                        }} />

                                                        {textoPrioridade(ocorrencia)}

                                                    </div>

                                                </td>

                                                <td className="px-2 py-3">

                                                    <span className={`inline-block rounded-full px-2 py-1 text-center text-[11px] font-semibold ${coresStatus[ocorrencia.status]}`}>
                                                        {ocorrencia.status}
                                                    </span>

                                                </td>

                                                <td className="px-2 py-3">

                                                    <Link to="/admin/gerenciar-ocorrencias" aria-label={`Acessar gerenciamento da ocorrência ${ocorrencia.protocolo}`} className="inline-flex rounded-lg border border-[#c9a697] px-2 py-1 hover:bg-[#f5e5d9]">

                                                        <Icone nome="visibility" classe="text-xl text-primaria" />

                                                    </Link>

                                                </td>

                                            </tr>

                                        ))}

                                    </tbody>

                                </table>

                            </div>

                        )}

                    </section>

                    {/* AÇÕES RÁPIDAS */}

                    <section className="rounded-2xl border border-[#dfbba9] bg-[#fff9f4]/80 p-4 shadow-sm">

                        <h2 className="flex items-center gap-2 border-b border-[#ead3c5] pb-3 font-titulo text-xl font-bold text-[#79221b]">

                            <Icone nome="bolt" classe="text-3xl" />

                            Ações Rápidas

                        </h2>

                        <div className="mt-4 grid gap-4 sm:grid-cols-2">

                            <Link to="/admin/gerenciar-ocorrencias" className="flex items-start gap-3 rounded-xl border border-[#dfbba9] p-4 transition-colors hover:bg-[#f5e5d9]">

                                <Icone nome="description" classe="text-4xl text-primaria" />

                                <div>

                                    <h3 className="font-titulo text-base font-bold text-primaria">
                                        Gerenciar Ocorrências
                                    </h3>

                                    <p className="mt-1 text-xs leading-relaxed text-texto">
                                        Consultar e atualizar o status das solicitações.
                                    </p>

                                </div>

                            </Link>

                            <Link to="/admin/relatorios" className="flex items-start gap-3 rounded-xl border border-[#dfbba9] p-4 transition-colors hover:bg-[#f5e5d9]">

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

                            <Link to="/admin/mapa-ocorrencias" className="flex items-start gap-3 rounded-xl border border-[#dfbba9] p-4 transition-colors hover:bg-[#f5e5d9] sm:col-span-2">

                                <Icone nome="location_on" classe="text-4xl text-primaria" />

                                <div>

                                    <h3 className="font-titulo text-base font-bold text-primaria">
                                        Visualizar no Mapa
                                    </h3>

                                    <p className="mt-1 text-xs leading-relaxed text-texto">
                                        Acompanhar a distribuição das ocorrências e definir suas prioridades.
                                    </p>

                                </div>

                            </Link>

                        </div>

                    </section>

                </div>

                {/* ÚLTIMOS SETE DIAS E STATUS */}

                <div className="mt-5 grid gap-4 xl:grid-cols-2">

                    <section className="rounded-2xl border border-[#dfbba9] bg-[#fff9f4]/80 p-5 shadow-sm">

                        <h2 className="flex items-center gap-2 border-b border-[#ead3c5] pb-3 font-titulo text-xl font-bold text-[#79221b]">

                            <Icone nome="insights" classe="text-3xl" />

                            Resumo dos Últimos 7 Dias

                        </h2>

                        <p className="mt-3 text-xs text-texto-suave">
                            Quantidade de ocorrências pela data do primeiro histórico registrado.
                        </p>

                        {statusDisponivel ? (

                            <div className="mt-6 flex h-50 items-end justify-between gap-3 border-b border-[#d8b9a7] pb-3">

                                {ultimosSeteDias.map(dia => (

                                    <div key={dia.data} className="flex h-full flex-1 flex-col items-center justify-end gap-2">

                                        <span className="text-xs font-semibold">
                                            {dia.quantidade}
                                        </span>

                                        <div className="w-full max-w-12 rounded-t-md bg-linear-to-t from-primaria to-[#d28c7c]" style={{
                                            height: `${dia.quantidade === 0 ? 0 : Math.max(8, (dia.quantidade / maiorDia) * 85)}%`,
                                        }} />

                                        <span className="text-[10px] text-texto-suave">
                                            {dia.data}
                                        </span>

                                    </div>

                                ))}

                            </div>

                        ) : (

                            <p className="py-15 text-center text-sm text-texto-suave">
                                {carregando ? 'Carregando indicadores...' : 'Dados indisponíveis.'}
                            </p>

                        )}

                        {statusDisponivel && indicadores.semData > 0 && (

                            <p className="mt-3 text-xs text-texto-suave">
                                Ocorrências sem data de histórico não foram contabilizadas.
                            </p>

                        )}

                    </section>

                    {/* DISTRIBUIÇÃO POR STATUS */}

                    <section className="rounded-2xl border border-[#dfbba9] bg-[#fff9f4]/80 p-5 shadow-sm">

                        <h2 className="flex items-center gap-2 border-b border-[#ead3c5] pb-3 font-titulo text-xl font-bold text-[#79221b]">

                            <Icone nome="donut_large" classe="text-3xl" />

                            Distribuição por Status

                        </h2>

                        <div className="mt-6 space-y-5">

                            {statusDisponiveis.map(status => {

                                const quantidade = ocorrencias.filter(
                                    ocorrencia => ocorrencia.status === status.nome
                                ).length;

                                const percentual = indicadores.total > 0
                                    ? (quantidade / indicadores.total) * 100
                                    : 0;

                                return (

                                    <div key={status.nome}>

                                        <div className="mb-2 flex items-center justify-between text-sm">

                                            <span>{status.nome}</span>

                                            <strong>
                                                {statusDisponivel ? `${numero(quantidade)} (${percentual.toFixed(1)}%)` : '—'}
                                            </strong>

                                        </div>

                                        <div className="h-3 overflow-hidden rounded-full bg-[#eadbd0]">

                                            <div className="h-full rounded-full transition-all duration-500" style={{
                                                width: `${statusDisponivel ? percentual : 0}%`,
                                                backgroundColor: status.cor,
                                            }} />

                                        </div>

                                    </div>
                                );
                            })}

                        </div>

                    </section>

                </div>

                {/* TAXA DE RESOLUÇÃO, ATENÇÃO E ORÇAMENTOS */}

                <div className="mt-5 grid gap-4 xl:grid-cols-3">

                    {/* TAXA DE RESOLUÇÃO */}

                    <section className="rounded-2xl border border-[#dfbba9] bg-[#fff9f4]/80 p-5 shadow-sm">

                        <h2 className="flex items-center gap-2 font-titulo text-lg font-bold text-[#79221b]">

                            <Icone nome="task_alt" classe="text-2xl" />

                            Taxa de Resolução

                        </h2>

                        <div className="mt-6 flex items-center justify-center">

                            <div className="flex h-38 w-38 items-center justify-center rounded-full" style={{
                                background: taxaResolucaoDisponivel
                                    ? `conic-gradient(#4f7b43 ${taxaResolucao}%, #eadbd0 ${taxaResolucao}% 100%)`
                                    : '#eadbd0',
                            }}>

                                <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-[#fff9f4]">

                                    <strong className="font-titulo text-3xl text-primaria">
                                        {taxaResolucaoDisponivel ? `${taxaResolucao.toFixed(1)}%` : '—'}
                                    </strong>

                                    <span className="text-xs text-texto-suave">
                                        Concluídas
                                    </span>

                                </div>

                            </div>

                        </div>

                        <p className="mt-5 text-center text-sm text-texto-suave">

                            {statusDisponivel
                                ? `${numero(indicadores.concluidas)} de ${numero(indicadores.total)} ocorrências confirmadas como concluídas.`
                                : 'Indicador indisponível.'}

                        </p>

                        {statusDisponivel && indicadores.semStatus > 0 && (

                            <p className="mt-2 text-center text-xs text-texto-suave">
                                Taxa completa indisponível: existem ocorrências sem status informado.
                            </p>

                        )}

                    </section>

                    {/* PAINEL DE ATENÇÃO */}

                    <section className="rounded-2xl border border-[#dfbba9] bg-[#fff9f4]/80 p-5 shadow-sm">

                        <h2 className="flex items-center gap-2 font-titulo text-lg font-bold text-[#79221b]">

                            <Icone nome="priority_high" classe="text-2xl" />

                            Painel de Atenção

                        </h2>

                        <div className="mt-5 space-y-3">

                            <div className="flex items-center justify-between rounded-lg bg-[#f5e5d9] p-3">

                                <span className="text-sm">
                                    Alta prioridade não concluída
                                </span>

                                <strong className="text-xl text-red-700">

                                    {prioridadeDisponivel
                                        ? indicadores.altaPrioridadeNaoConcluida
                                        : '—'}

                                </strong>

                            </div>

                            <div className="flex items-center justify-between rounded-lg bg-[#f5e5d9] p-3">

                                <span className="text-sm">Pendentes</span>

                                <strong className="text-xl text-primaria">
                                    {statusDisponivel ? indicadores.pendentes : '—'}
                                </strong>

                            </div>

                            <div className="flex items-center justify-between rounded-lg bg-[#f5e5d9] p-3">

                                <span className="text-sm">Em análise</span>

                                <strong className="text-xl text-primaria">
                                    {statusDisponivel ? indicadores.analise : '—'}
                                </strong>

                            </div>

                            <div className="flex items-center justify-between rounded-lg bg-[#f5e5d9] p-3">

                                <span className="text-sm">Em andamento</span>

                                <strong className="text-xl text-primaria">
                                    {statusDisponivel ? indicadores.andamento : '—'}
                                </strong>

                            </div>

                            <div className="flex items-center justify-between rounded-lg bg-[#f5e5d9] p-3">

                                <span className="text-sm">Prioridade não definida</span>

                                <strong className="text-xl text-primaria">
                                    {prioridadeDisponivel ? indicadores.semPrioridade : '—'}
                                </strong>

                            </div>

                        </div>

                        {prioridadeDisponivel && (indicadores.semStatus > 0 || indicadores.prioridadeIndisponivel > 0) && (

                            <p className="mt-3 text-xs text-texto-suave">
                                Os indicadores consideram apenas os dados identificados.
                            </p>

                        )}

                        <Link to="/admin/mapa-ocorrencias" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold underline">

                            <span className="text-primaria">Classificar ocorrências</span>

                            <Icone nome="arrow_forward" classe="text-lg text-primaria" />

                        </Link>

                    </section>

                    {/* ORÇAMENTOS INSTITUCIONAIS */}

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
                                —
                            </strong>

                        </div>

                        <div className="mt-3 rounded-lg bg-[#f5e5d9] p-4">

                            <p className="text-sm text-texto-suave">
                                Valor total estimado
                            </p>

                            <strong className="mt-2 block font-titulo text-2xl text-primaria">
                                —
                            </strong>

                        </div>

                        <p className="mt-3 text-xs text-texto-suave">
                            Dados orçamentários ainda não integrados.
                        </p>

                        <Link to="/admin/relatorios" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold underline">

                            <span className="text-primaria">Acessar orçamentos</span>

                            <Icone nome="arrow_forward" classe="text-lg text-primaria" />

                        </Link>

                    </section>

                </div>

                {/* PANORAMA DA GESTÃO */}

                <section className="mt-5 rounded-2xl border border-[#dfbba9] bg-[#fff9f4]/80 p-5 shadow-sm">

                    <h2 className="flex items-center gap-2 font-titulo text-xl font-bold text-[#79221b]">

                        <Icone nome="tips_and_updates" classe="text-3xl" />

                        Panorama da Gestão

                    </h2>

                    <p className="mt-4 text-sm leading-7 text-texto-suave">
                        Acompanhe as demandas da população, estabeleça prioridades e utilize os indicadores da plataforma para orientar decisões e promover uma gestão pública mais eficiente, transparente e participativa.
                    </p>

                    <div className="mt-5 flex flex-wrap gap-3">

                        <Link to="/admin/gerenciar-ocorrencias" className="inline-flex min-h-12 items-center justify-center rounded-lg bg-primaria px-6 py-3 text-sm font-semibold transition-colors duration-200 hover:bg-primaria-hover">

                            <span className="text-white">
                                Gerenciar demandas
                            </span>

                        </Link>

                        <Link to="/admin/relatorios" className="inline-flex min-h-12 items-center justify-center rounded-lg border border-primaria bg-white px-6 py-3 text-sm font-semibold transition-colors duration-200 hover:bg-[#f5e5d9]">

                            <span className="text-primaria">
                                Consultar indicadores
                            </span>

                        </Link>

                    </div>

                </section>

            </div>

        </main>
    );
}