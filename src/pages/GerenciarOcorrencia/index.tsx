import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import fundoGerenciar from '../../img/fundo_gerenciarocorrencias.png';

import { listarOcorrencias } from '../../services/ocorrenciaService';

import {
    listarHistoricosPorOcorrencia,
    ordenarHistoricos,
    obterHistoricoInicial,
    obterHistoricoAtual,
    atualizarStatusOcorrencia,
    cadastrarHistoricoInicial,
    formatarDataHistorico,
    gerarProtocolo,
} from '../../services/historicoService';

import {
    listarAnalises,
    obterAnalisePorProtocolo,
    normalizarPrioridade,
    salvarPrioridadeOcorrencia,
    type Analise,
} from '../../services/analiseService';

// TIPAGENS

type StatusOcorrencia = 'Pendente' | 'Em análise' | 'Em andamento' | 'Concluído' | 'Não informado';

type PrioridadeOcorrencia = 'Alta' | 'Média' | 'Baixa';

interface HistoricoOcorrencia {
    data: string;
    descricao: string;
}

interface Ocorrencia {
    id: number;
    idUsuario: number;
    protocolo: string;
    categoria: string;
    descricao: string;
    cep: string;
    endereco: string;
    numero: string;
    status: StatusOcorrencia;
    prioridade: PrioridadeOcorrencia | null;
    dataCriacao: string;
    historico: HistoricoOcorrencia[];
    historicoDisponivel: boolean;
    analiseDisponivel: boolean;
    possuiAnalise: boolean;
}

interface Filtros {
    busca: string;
    categoria: string;
    status: string;
    prioridade: string;
    periodo: string;
}

// CONSTANTES

const itensPorPagina = 5;

const filtrosIniciais: Filtros = {
    busca: '',
    categoria: '',
    status: '',
    prioridade: '',
    periodo: '',
};

const statusDisponiveis: StatusOcorrencia[] = [
    'Pendente',
    'Em análise',
    'Em andamento',
    'Concluído',
];

const prioridades: PrioridadeOcorrencia[] = [
    'Alta',
    'Média',
    'Baixa',
];

const campoClasse = 'w-full min-w-0 rounded-lg border border-[#dec3b2] bg-[#fffaf6] px-3 py-2.5 text-sm text-texto outline-none transition-colors focus:border-primaria focus:ring-2 focus:ring-primaria/15';

const botaoClasse = 'inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#b67b6b] px-4 py-2.5 text-sm font-semibold text-primaria transition-colors hover:bg-[#f7e8de] disabled:cursor-not-allowed disabled:opacity-50';

const botaoPrimario = 'flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-primaria px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primaria-hover disabled:cursor-not-allowed disabled:opacity-50';

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

function normalizarTexto(texto: string) {
    return texto.normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .toLowerCase();
}

function normalizarStatus(valor?: string): StatusOcorrencia {
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

function iconeCategoria(categoria: string) {
    const icones: Record<string, string> = {
        iluminacao: 'lightbulb_outline',
        'iluminacao publica': 'lightbulb_outline',
        saneamento: 'water_drop',
        sanitario: 'water_drop',
        transporte: 'directions_bus',
        'transporte publico': 'directions_bus',
        infraestrutura: 'construction',
        estrada: 'construction',
        buraco: 'construction',
        limpeza: 'delete_outline',
        'limpeza urbana': 'delete_outline',
        seguranca: 'security',
        'meio ambiente': 'park',
        acessibilidade: 'accessible',
        outros: 'description',
    };

    return icones[normalizarTexto(categoria)] ?? 'description';
}

function converterData(data: string): Date | null {
    if (!data) return null;

    const partes = data.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/);

    if (partes) {
        const dia = Number(partes[1]);
        const mes = Number(partes[2]);
        const ano = Number(partes[3]);

        const valor = new Date(ano, mes - 1, dia);

        return valor.getFullYear() === ano &&
            valor.getMonth() === mes - 1 &&
            valor.getDate() === dia
            ? valor
            : null;
    }

    const partesISO = data.match(/^(\d{4})-(\d{2})-(\d{2})$/);

    if (partesISO) {
        const ano = Number(partesISO[1]);
        const mes = Number(partesISO[2]);
        const dia = Number(partesISO[3]);

        const valor = new Date(ano, mes - 1, dia);

        return valor.getFullYear() === ano &&
            valor.getMonth() === mes - 1 &&
            valor.getDate() === dia
            ? valor
            : null;
    }

    const valor = new Date(data);

    return Number.isNaN(valor.getTime()) ? null : valor;
}

function formatarData(data: string) {
    return converterData(data)?.toLocaleDateString('pt-BR')
        ?? 'Data indisponível';
}

function corStatus(status: StatusOcorrencia) {
    const cores: Record<StatusOcorrencia, string> = {
        Pendente: 'bg-[#f8d8d0] text-[#84261f]',
        'Em análise': 'bg-[#ffe0a5] text-[#704312]',
        'Em andamento': 'bg-[#d7e6f1] text-[#28546d]',
        'Concluído': 'bg-[#dce9d1] text-[#41642d]',
        'Não informado': 'bg-[#e5ded8] text-[#74645a]',
    };

    return cores[status];
}

function corPrioridade(prioridade: PrioridadeOcorrencia | null) {
    if (prioridade === 'Alta') return 'bg-[#b3261e]';

    if (prioridade === 'Média') return 'bg-[#e99a3e]';

    if (prioridade === 'Baixa') return 'bg-[#4f7b43]';

    return 'bg-[#8d8276]';
}

function textoPrioridade(ocorrencia: Ocorrencia): string {
    if (!ocorrencia.analiseDisponivel) {
        return 'Indisponível';
    }

    return ocorrencia.prioridade ?? 'Não definida';
}

function estaNoPeriodo(data: string, periodo: string, referencia: number) {
    if (!periodo) return true;

    const criacao = converterData(data);

    if (!criacao) return false;

    const inicio = new Date(referencia);

    inicio.setHours(0, 0, 0, 0);

    inicio.setDate(inicio.getDate() - Number(periodo) + 1);

    return criacao.getTime() >= inicio.getTime() &&
        criacao.getTime() <= referencia;
}

// INDICADORES

function Indicador({ icone, titulo, valor, cor }: {
    icone: string;
    titulo: string;
    valor: number | null;
    cor?: string;
}) {
    return (
        <article className="flex items-center gap-4 rounded-xl border border-[#e2c5b5] bg-[#fffaf6]/90 px-5 py-4 shadow-sm">
            <div className={`flex h-13 w-13 shrink-0 items-center justify-center rounded-full ${cor ?? 'bg-primaria'} text-white`}>
                <Icone nome={icone} classe="text-3xl" />
            </div>

            <div>
                <p className="font-titulo text-3xl font-bold text-[#75211b]">
                    {valor === null ? '—' : valor.toLocaleString('pt-BR')}
                </p>

                <p className="text-sm text-texto-suave">
                    {titulo}
                </p>
            </div>
        </article>
    );
}

// PÁGINA ADMINISTRATIVA

export default function GerenciarOcorrencias() {

    const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);

    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');
    const [aviso, setAviso] = useState('');

    const [filtros, setFiltros] = useState<Filtros>(filtrosIniciais);
    const [filtrosAplicados, setFiltrosAplicados] = useState<Filtros>(filtrosIniciais);

    const [ordenacao, setOrdenacao] = useState('recentes');
    const [pagina, setPagina] = useState(1);

    const [selecionadaId, setSelecionadaId] = useState<number | null>(null);

    const [novoStatus, setNovoStatus] = useState<StatusOcorrencia>('Não informado');

    const [novaPrioridade, setNovaPrioridade] = useState<PrioridadeOcorrencia | ''>('');

    const [salvando, setSalvando] = useState(false);
    const [mensagem, setMensagem] = useState('');

    const [tipoMensagem, setTipoMensagem] = useState<'sucesso' | 'erro'>('sucesso');

    const [dataReferencia, setDataReferencia] = useState(() => Date.now());

    const bloqueioSalvamento = useRef(false);
    const consultaAtual = useRef(0);

    // CONSULTAR OCORRÊNCIAS NA API JAVA

    const carregarOcorrencias = useCallback(async (): Promise<Ocorrencia[] | null> => {

        const consulta = ++consultaAtual.current;

        setCarregando(true);
        setErro('');
        setAviso('');

        try {
            const registros = await listarOcorrencias();

            if (consulta !== consultaAtual.current) return null;

            let analises: Analise[] = [];
            let analisesDisponiveis = true;

            try {
                analises = await listarAnalises();
            } catch (erro) {
                analisesDisponiveis = false;

                console.error('Erro ao consultar análises:', erro);
            }

            if (consulta !== consultaAtual.current) return null;

            const ocorrenciasFormatadas = await Promise.all(
                registros.map(async (registro): Promise<Ocorrencia | null> => {

                    const id = registro.idOcorrencia;

                    if (typeof id !== 'number' || !Number.isInteger(id) || id <= 0) {
                        return null;
                    }

                    let historicosOcorrencia: Awaited<ReturnType<typeof listarHistoricosPorOcorrencia>> = [];

                    let historicoDisponivel = true;

                    try {
                        historicosOcorrencia = ordenarHistoricos(
                            await listarHistoricosPorOcorrencia(id)
                        );
                    } catch (erro) {
                        historicoDisponivel = false;

                        console.error(`Erro ao consultar histórico da ocorrência ${id}:`, erro);
                    }

                    const historicoInicial = obterHistoricoInicial(historicosOcorrencia);

                    const historicoAtual = obterHistoricoAtual(historicosOcorrencia);

                    const protocolo = historicoInicial?.protocolo ||
                        historicoAtual?.protocolo ||
                        gerarProtocolo(id);

                    let analise: Analise | null = null;

                    let analiseDisponivel = analisesDisponiveis && historicoDisponivel;

                    if (analiseDisponivel) {
                        try {
                            analise = obterAnalisePorProtocolo(analises, protocolo);
                        } catch (erro) {
                            analiseDisponivel = false;

                            console.error(`Erro ao consultar análise de ${protocolo}:`, erro);
                        }
                    }

                    return {
                        id,
                        idUsuario: registro.idUsuario,
                        protocolo,
                        categoria: registro.categoria || 'Não informada',
                        descricao: registro.descricao || '',
                        cep: registro.cep || '',
                        endereco: registro.endereco || '',
                        numero: registro.departamento || '',
                        prioridade: normalizarPrioridade(analise?.prioridade),
                        status: normalizarStatus(historicoAtual?.status),
                        dataCriacao: historicoInicial?.data || '',
                        historicoDisponivel,
                        analiseDisponivel,
                        possuiAnalise: analise !== null,

                        historico: historicosOcorrencia.map((historico, indice) => ({
                            data: historico.data,
                            descricao: indice === 0
                                ? `Histórico registrado com status: ${normalizarStatus(historico.status)}.`
                                : `Status atualizado para "${normalizarStatus(historico.status)}".`,
                        })),
                    };
                })
            );

            if (consulta !== consultaAtual.current) return null;

            const registrosValidos = ocorrenciasFormatadas.filter(
                (item): item is Ocorrencia => item !== null
            );

            const falhasHistorico = registrosValidos.filter(
                item => !item.historicoDisponivel
            ).length;

            const falhasAnalise = registrosValidos.filter(
                item => !item.analiseDisponivel
            ).length;

            const statusNaoInformados = registrosValidos.filter(
                item => item.status === 'Não informado'
            ).length;

            const avisos: string[] = [];

            if (falhasHistorico > 0) {
                avisos.push(`Não foi possível consultar o histórico de ${falhasHistorico} ocorrência(s).`);
            }

            if (falhasAnalise > 0) {
                avisos.push(`Não foi possível consultar a prioridade de ${falhasAnalise} ocorrência(s).`);
            }

            if (statusNaoInformados > 0) {
                avisos.push(`${statusNaoInformados} ocorrência(s) sem status identificado. Os indicadores consideram os status conhecidos.`);
            }

            setOcorrencias(registrosValidos);
            setDataReferencia(Date.now());
            setAviso(avisos.join(' '));

            return registrosValidos;

        } catch (erro) {

            if (consulta !== consultaAtual.current) return null;

            console.error('Erro ao consultar ocorrências:', erro);

            setOcorrencias([]);

            setErro('Não foi possível conectar à API Java. Tente novamente.');

            return null;

        } finally {

            if (consulta === consultaAtual.current) {
                setCarregando(false);
            }
        }

    }, []);

        useEffect(() => {
            const iniciar = window.setTimeout(() => {
                void carregarOcorrencias();
            }, 0);

            return () => {
                window.clearTimeout(iniciar);
                consultaAtual.current += 1;
            };
        }, [carregarOcorrencias]);

    // CATEGORIAS

    const categorias = useMemo(() => {

        const registros = new Map<string, string>();

        ocorrencias.forEach(ocorrencia => {
            const chave = normalizarTexto(ocorrencia.categoria);

            if (!registros.has(chave)) {
                registros.set(chave, ocorrencia.categoria);
            }
        });

        return [...registros.values()].sort(
            (a, b) => a.localeCompare(b, 'pt-BR')
        );

    }, [ocorrencias]);

    // INDICADORES

    const indicadores = useMemo(() => ({

        total: ocorrencias.length,

        concluidas: ocorrencias.filter(
            item => item.status === 'Concluído'
        ).length,

        analise: ocorrencias.filter(
            item => item.status === 'Em análise'
        ).length,

        pendentes: ocorrencias.filter(
            item => item.status === 'Pendente'
        ).length,

    }), [ocorrencias]);

    const dadosDisponiveis = !carregando && !erro;

    // FILTROS E ORDENAÇÃO

    const ocorrenciasFiltradas = useMemo(() => {

        const busca = normalizarTexto(filtrosAplicados.busca);

        const resultado = ocorrencias.filter(item => {

            const texto = normalizarTexto([
                item.protocolo,
                item.descricao,
                item.endereco,
                item.numero,
                item.cep,
                item.categoria,
            ].filter(Boolean).join(' '));

            return (
                (!busca || texto.includes(busca)) &&

                (!filtrosAplicados.categoria ||
                    normalizarTexto(item.categoria) === normalizarTexto(filtrosAplicados.categoria)) &&

                (!filtrosAplicados.status ||
                    item.status === filtrosAplicados.status) &&

                (!filtrosAplicados.prioridade || (

                    filtrosAplicados.prioridade === 'nao-definida'
                        ? item.analiseDisponivel && item.prioridade === null

                        : filtrosAplicados.prioridade === 'indisponivel'
                            ? !item.analiseDisponivel

                            : item.prioridade === filtrosAplicados.prioridade

                )) &&

                estaNoPeriodo(
                    item.dataCriacao,
                    filtrosAplicados.periodo,
                    dataReferencia
                )
            );
        });

        return resultado.sort((a, b) => {

            const dataA = converterData(a.dataCriacao)?.getTime();

            const dataB = converterData(b.dataCriacao)?.getTime();

            if (ordenacao === 'prioridade') {

                const pesos: Record<PrioridadeOcorrencia, number> = {
                    Alta: 3,
                    Média: 2,
                    Baixa: 1,
                };

                const diferenca =
                    (b.prioridade ? pesos[b.prioridade] : 0) -
                    (a.prioridade ? pesos[a.prioridade] : 0);

                if (diferenca !== 0) return diferenca;
            }

            if (dataA === undefined && dataB !== undefined) return 1;

            if (dataA !== undefined && dataB === undefined) return -1;

            if (ordenacao === 'antigas') {
                return (dataA ?? 0) - (dataB ?? 0) || a.id - b.id;
            }

            return (dataB ?? 0) - (dataA ?? 0) || b.id - a.id;
        });

    }, [ocorrencias, filtrosAplicados, ordenacao, dataReferencia]);

    // PAGINAÇÃO

    const totalPaginas = Math.max(
        1,
        Math.ceil(ocorrenciasFiltradas.length / itensPorPagina)
    );

    const paginaAtual = Math.min(pagina, totalPaginas);

    const ocorrenciasPagina = ocorrenciasFiltradas.slice(
        (paginaAtual - 1) * itensPorPagina,
        paginaAtual * itensPorPagina
    );

    // SELEÇÃO

    const selecionada = ocorrencias.find(
        item => item.id === selecionadaId
    ) ?? null;

    const bloquearAtualizacao = salvando ||
        carregando ||
        !!erro ||
        !selecionada?.historicoDisponivel;

    const bloquearPrioridade = bloquearAtualizacao ||
        !selecionada?.analiseDisponivel ||
        !selecionada?.dataCriacao ||
        selecionada?.status === 'Não informado';

    const atualizarFiltro = (campo: keyof Filtros, valor: string) => {
        setFiltros(anterior => ({
            ...anterior,
            [campo]: valor,
        }));
    };

    const fecharDetalhes = () => {

        if (salvando) return;

        setSelecionadaId(null);
        setNovoStatus('Não informado');
        setNovaPrioridade('');
        setMensagem('');
    };

    const aplicarFiltros = () => {

        if (salvando) return;

        setFiltrosAplicados({ ...filtros });
        setDataReferencia(Date.now());
        setPagina(1);

        fecharDetalhes();
    };

    const limparFiltros = () => {

        if (salvando) return;

        setFiltros({ ...filtrosIniciais });
        setFiltrosAplicados({ ...filtrosIniciais });
        setPagina(1);

        fecharDetalhes();
    };

    const selecionarOcorrencia = (ocorrencia: Ocorrencia) => {

        if (salvando) return;

        setSelecionadaId(ocorrencia.id);
        setNovoStatus(ocorrencia.status);
        setNovaPrioridade(ocorrencia.prioridade ?? '');
        setMensagem('');
    };

    // ATUALIZAR STATUS NA API JAVA

    const salvarStatus = async (status: StatusOcorrencia) => {

        if (!selecionada || bloqueioSalvamento.current || bloquearAtualizacao) {
            return;
        }

        if (!statusDisponiveis.includes(status)) {

            setTipoMensagem('erro');
            setMensagem('Selecione um status válido.');

            return;
        }

        if (selecionada.status === status) {

            setTipoMensagem('sucesso');
            setMensagem('O status da ocorrência já está atualizado.');

            return;
        }

        const id = selecionada.id;

        bloqueioSalvamento.current = true;

        setSalvando(true);
        setMensagem('');

        try {

            let protocolo = selecionada.protocolo;

            let statusAtual = selecionada.status;

            if (selecionada.historico.length === 0) {

                const inicial = await cadastrarHistoricoInicial(
                    id,
                    selecionada.categoria
                );

                protocolo = inicial.protocolo;
                statusAtual = normalizarStatus(inicial.status);
            }

            if (statusAtual !== status) {

                await atualizarStatusOcorrencia(id, {
                    idOcorrencia: id,
                    protocolo,
                    categoria: selecionada.categoria,
                    data: formatarDataHistorico(),
                    status,
                });
            }

            const registros = await carregarOcorrencias();

            const atualizada = registros?.find(item => item.id === id);

            setNovoStatus(atualizada?.status ?? 'Não informado');

            setNovaPrioridade(atualizada?.prioridade ?? '');

            if (atualizada?.historicoDisponivel && atualizada.status === status) {

                setTipoMensagem('sucesso');

                setMensagem(
                    status === 'Concluído'
                        ? 'Ocorrência concluída com sucesso.'
                        : 'Status atualizado com sucesso.'
                );

            } else {

                setTipoMensagem('erro');

                setMensagem('Não foi possível confirmar o novo status na API Java.');
            }

        } catch (erro) {

            console.error('Erro ao atualizar status:', erro);

            const registros = await carregarOcorrencias();

            const atualizada = registros?.find(item => item.id === id);

            setNovoStatus(atualizada?.status ?? 'Não informado');

            setNovaPrioridade(atualizada?.prioridade ?? '');

            const confirmada = atualizada?.historicoDisponivel &&
                atualizada.status === status;

            setTipoMensagem(confirmada ? 'sucesso' : 'erro');

            setMensagem(
                confirmada
                    ? 'Status atualizado com sucesso.'
                    : 'Não foi possível confirmar a alteração do status.'
            );

        } finally {

            bloqueioSalvamento.current = false;

            setSalvando(false);
        }
    };

    // ATUALIZAR PRIORIDADE NA API JAVA

    const salvarPrioridade = async () => {

        if (
            !selecionada ||
            !novaPrioridade ||
            bloquearPrioridade ||
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
                ].filter(Boolean).join(', '),

                prioridade,

                status: selecionada.status,

                data: selecionada.dataCriacao,
            });

            // CONSULTAR NOVAMENTE OS DADOS DA API

            const registros = await carregarOcorrencias();

            const atualizada = registros?.find(item => item.id === id);

            if (!atualizada?.analiseDisponivel || atualizada.prioridade !== prioridade) {

                throw new Error('Prioridade não confirmada pela API Java.');
            }

            setNovaPrioridade(prioridade);

            setNovoStatus(atualizada.status);

            setTipoMensagem('sucesso');

            setMensagem('Prioridade atualizada com sucesso!');

        } catch (erro) {

            console.error('Erro ao atualizar prioridade:', erro);

            const registros = await carregarOcorrencias();

            const atualizada = registros?.find(item => item.id === id);

            setNovaPrioridade(atualizada?.prioridade ?? '');

            setNovoStatus(atualizada?.status ?? 'Não informado');

            const confirmada = atualizada?.analiseDisponivel &&
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

    // ATUALIZAR LISTAGEM

    const atualizarLista = () => {

        if (salvando || carregando) return;

        fecharDetalhes();

        void carregarOcorrencias();
    };

    // INTERFACE

    return (

        <main className="min-h-screen w-full bg-fundo font-corpo text-texto">

            {/* CABEÇALHO */}

            <div className="relative border-b border-[#e3c8b7] bg-cover bg-top bg-no-repeat" style={{
                backgroundImage: `linear-gradient(90deg, rgba(255,249,242,0.96) 0%, rgba(255,249,242,0.80) 45%, rgba(255,249,242,0.22) 100%), url(${fundoGerenciar})`,
            }}>

                <div className="mx-auto max-w-400 px-5 pt-7 pb-10 sm:px-8 lg:px-10">

                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#b97867] pb-4">

                        <div className="flex items-center gap-3">

                            <Icone nome="account_balance" classe="text-3xl text-primaria" />

                            <span className="font-titulo text-xl font-bold text-[#75211b] sm:text-2xl">
                                Área Administrativa
                            </span>

                        </div>

                        <div className="flex items-center gap-3 text-[#75211b]">

                            <Icone nome="admin_panel_settings" classe="text-2xl" />

                            <span className="text-sm font-semibold">
                                Administrador
                            </span>

                        </div>

                    </div>

                    <div className="mt-7">

                        <h1 className="font-titulo text-3xl font-bold text-[#75211b] sm:text-4xl lg:text-5xl">
                            Gerenciar Ocorrências
                        </h1>

                        <p className="mt-2 max-w-3xl text-sm text-texto sm:text-base">
                            Consulte, analise, atualize e acompanhe as ocorrências registradas na plataforma.
                        </p>

                    </div>

                    {/* INDICADORES */}

                    <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">

                        <Indicador icone="description" titulo="Total de ocorrências" valor={dadosDisponiveis ? indicadores.total : null} />

                        <Indicador icone="check_circle" titulo="Concluídas" valor={dadosDisponiveis ? indicadores.concluidas : null} cor="bg-[#507443]" />

                        <Indicador icone="schedule" titulo="Em análise" valor={dadosDisponiveis ? indicadores.analise : null} />

                        <Indicador icone="warning" titulo="Pendentes" valor={dadosDisponiveis ? indicadores.pendentes : null} />

                    </div>

                </div>

            </div>

            <div className="mx-auto max-w-400 space-y-4 px-5 py-6 sm:px-8 lg:px-10">

                {/* FILTROS */}

                <section className="rounded-xl border border-[#dfc2ae] bg-[#fffaf6] p-5 shadow-sm">

                    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">

                        <h2 className="flex items-center gap-2 font-titulo text-xl font-bold text-[#78221b]">

                            <Icone nome="filter_alt" classe="text-2xl" />

                            Filtrar Ocorrências

                        </h2>

                        <button type="button" onClick={limparFiltros} disabled={salvando} className="flex cursor-pointer items-center gap-1 text-sm font-semibold text-primaria hover:underline disabled:opacity-50">

                            <Icone nome="restart_alt" classe="text-xl" />

                            Limpar filtros

                        </button>

                    </div>

                    <form onSubmit={evento => {
                        evento.preventDefault();
                        aplicarFiltros();
                    }} className="grid gap-4 md:grid-cols-2 xl:grid-cols-[2fr_1fr_1fr_1fr_1.2fr_auto]">

                        {/* BUSCA */}

                        <div>

                            <label htmlFor="busca-ocorrencia" className="mb-2 block text-xs font-semibold text-[#75211b]">
                                Buscar ocorrência
                            </label>

                            <input id="busca-ocorrencia" type="search" value={filtros.busca} onChange={evento => atualizarFiltro('busca', evento.target.value)} placeholder="Protocolo, descrição ou local..." className={campoClasse} />

                        </div>

                        {/* CATEGORIA */}

                        <div>

                            <label htmlFor="categoria-filtro" className="mb-2 block text-xs font-semibold text-[#75211b]">
                                Categoria
                            </label>

                            <select id="categoria-filtro" value={filtros.categoria} onChange={evento => atualizarFiltro('categoria', evento.target.value)} className={campoClasse}>

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

                            <label htmlFor="status-filtro" className="mb-2 block text-xs font-semibold text-[#75211b]">
                                Status
                            </label>

                            <select id="status-filtro" value={filtros.status} onChange={evento => atualizarFiltro('status', evento.target.value)} className={campoClasse}>

                                <option value="">Todos</option>

                                {statusDisponiveis.map(status => (

                                    <option key={status} value={status}>
                                        {status}
                                    </option>

                                ))}

                                <option value="Não informado">
                                    Não informado
                                </option>

                            </select>

                        </div>

                        {/* PRIORIDADE */}

                        <div>

                            <label htmlFor="prioridade-filtro" className="mb-2 block text-xs font-semibold text-[#75211b]">
                                Prioridade
                            </label>

                            <select id="prioridade-filtro" value={filtros.prioridade} onChange={evento => atualizarFiltro('prioridade', evento.target.value)} className={campoClasse}>

                                <option value="">Todas</option>

                                {prioridades.map(prioridade => (

                                    <option key={prioridade} value={prioridade}>
                                        {prioridade}
                                    </option>

                                ))}

                                <option value="nao-definida">
                                    Não definida
                                </option>

                                <option value="indisponivel">
                                    Indisponível
                                </option>

                            </select>

                        </div>

                        {/* PERÍODO */}

                        <div>

                            <label htmlFor="periodo-filtro" className="mb-2 block text-xs font-semibold text-[#75211b]">
                                Período
                            </label>

                            <select id="periodo-filtro" value={filtros.periodo} onChange={evento => atualizarFiltro('periodo', evento.target.value)} className={campoClasse}>

                                <option value="">Todo o período</option>

                                <option value="7">Últimos 7 dias</option>

                                <option value="30">Últimos 30 dias</option>

                                <option value="90">Últimos 90 dias</option>

                            </select>

                        </div>

                        <button type="submit" disabled={salvando} className={`${botaoPrimario} self-end`}>

                            <Icone nome="filter_alt" classe="text-xl text-white" />

                            <span className="text-white">Filtrar</span>

                        </button>

                    </form>

                </section>

                {/* MENSAGENS DA API */}

                {erro && (

                    <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-800">

                        <span>{erro}</span>

                        <button type="button" onClick={atualizarLista} disabled={salvando || carregando} className={botaoClasse}>

                            Tentar novamente

                        </button>

                    </div>

                )}

                {aviso && !erro && (

                    <div role="status" className="flex items-center gap-2 rounded-lg border border-[#dfc2ae] bg-[#f5e9e0] p-4 text-sm text-primaria">

                        <Icone nome="info" classe="text-xl" />

                        {aviso}

                    </div>

                )}

                {/* TABELA E DETALHES */}

                <div className="grid items-start gap-4 2xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">

                    {/* TABELA */}

                    <section className="min-w-0 rounded-xl border border-[#dfc2ae] bg-[#fffaf6] p-4 shadow-sm sm:p-5">

                        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">

                            <h2 className="flex items-center gap-2 font-titulo text-xl font-bold text-[#78221b]">

                                <Icone nome="format_list_bulleted" classe="text-2xl" />

                                Ocorrências ({dadosDisponiveis ? ocorrenciasFiltradas.length.toLocaleString('pt-BR') : '—'})

                            </h2>

                            <div className="flex items-center gap-2">

                                <label htmlFor="ordenacao" className="text-xs text-texto-suave">
                                    Ordenar por:
                                </label>

                                <select id="ordenacao" value={ordenacao} onChange={evento => {
                                    setOrdenacao(evento.target.value);
                                    setPagina(1);
                                }} className="rounded-lg border border-[#dec3b2] bg-[#fffaf6] px-2 py-2 text-xs outline-none focus:border-primaria">

                                    <option value="recentes">
                                        Data mais recente
                                    </option>

                                    <option value="antigas">
                                        Data mais antiga
                                    </option>

                                    <option value="prioridade">
                                        Maior prioridade
                                    </option>

                                </select>

                            </div>

                        </div>

                        <div className="overflow-x-auto">

                            <table className="w-full text-left text-xs">

                                <thead className="bg-[#f5e9e0] text-[#75211b]">

                                    <tr>

                                        <th scope="col" className="rounded-l-lg px-2 py-3">Protocolo</th>

                                        <th scope="col" className="px-2 py-3">Categoria</th>

                                        <th scope="col" className="px-2 py-3">Localização</th>

                                        <th scope="col" className="px-2 py-3">Prioridade</th>

                                        <th scope="col" className="px-2 py-3">Status</th>

                                        <th scope="col" className="px-2 py-3">Data</th>

                                        <th scope="col" className="rounded-r-lg px-2 py-3 text-center">Ações</th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {!carregando && !erro && ocorrenciasPagina.map(ocorrencia => (

                                        <tr key={ocorrencia.id} className={`border-b border-[#ead8ca] ${selecionadaId === ocorrencia.id ? 'bg-[#f1d6cb]' : 'hover:bg-[#fbf1e9]'}`}>

                                            <td className="px-2 py-3 font-bold">
                                                {ocorrencia.protocolo}
                                            </td>

                                            <td className="px-2 py-3">

                                                <div className="flex items-center gap-1.5">

                                                    <Icone nome={iconeCategoria(ocorrencia.categoria)} classe="text-xl text-primaria" />

                                                    {ocorrencia.categoria}

                                                </div>

                                            </td>

                                            <td className="px-2 py-3">

                                                {[ocorrencia.endereco, ocorrencia.numero].filter(Boolean).join(', ') || 'Não informada'}

                                            </td>

                                            <td className="px-2 py-3">

                                                <div className="flex items-center gap-1.5">

                                                    <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${corPrioridade(ocorrencia.prioridade)}`} />

                                                    {textoPrioridade(ocorrencia)}

                                                </div>

                                            </td>

                                            <td className="px-2 py-3">

                                                <span className={`inline-block rounded-full px-2 py-1 text-center text-xs font-medium ${corStatus(ocorrencia.status)}`}>

                                                    {ocorrencia.status}

                                                </span>

                                            </td>

                                            <td className="px-2 py-3">

                                                {formatarData(ocorrencia.dataCriacao)}

                                            </td>

                                            <td className="px-2 py-3 text-center">

                                                <button type="button" onClick={() => selecionarOcorrencia(ocorrencia)} disabled={salvando} aria-label={`Visualizar ocorrência ${ocorrencia.protocolo}`} className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-[#cda998] px-2 py-1 text-primaria hover:bg-[#f4e2d6] disabled:opacity-50">

                                                    <Icone nome="visibility" classe="text-xl" />

                                                </button>

                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                            {/* NENHUMA OCORRÊNCIA */}

                            {!carregando && !erro && ocorrenciasFiltradas.length === 0 && (

                                <div className="flex flex-col items-center px-5 py-14 text-center">

                                    <Icone nome="inbox" classe="text-5xl text-[#b88e7a]" />

                                    <h3 className="mt-3 font-titulo text-lg font-bold text-[#78221b]">

                                        Nenhuma ocorrência encontrada

                                    </h3>

                                    <p className="mt-2 max-w-md text-sm leading-relaxed text-texto-suave">

                                        Ainda não existem ocorrências disponíveis ou nenhuma corresponde aos filtros selecionados.

                                    </p>

                                </div>

                            )}

                            {/* CARREGAMENTO */}

                            {carregando && (

                                <div role="status" className="flex flex-col items-center gap-3 py-12 text-center">

                                    <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#e2c5b5] border-t-primaria" />

                                    <p className="text-sm font-semibold text-primaria">

                                        Carregando ocorrências...

                                    </p>

                                    <p className="max-w-sm text-xs leading-relaxed text-texto-suave">

                                        Conectando ao servidor. A primeira consulta pode levar alguns instantes.

                                    </p>

                                </div>

                            )}

                            {erro && !carregando && (

                                <p className="py-12 text-center text-sm text-texto-suave">

                                    Não foi possível carregar os registros.

                                </p>

                            )}

                        </div>

                        {/* PAGINAÇÃO */}

                        {!carregando && !erro && ocorrenciasFiltradas.length > itensPorPagina && (

                            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">

                                <button type="button" disabled={paginaAtual === 1} onClick={() => setPagina(paginaAtual - 1)} className={botaoClasse} aria-label="Página anterior">

                                    <Icone nome="chevron_left" />

                                </button>

                                {Array.from({ length: totalPaginas }, (_, indice) => indice + 1).map(numeroPagina => (

                                    <button key={numeroPagina} type="button" onClick={() => setPagina(numeroPagina)} aria-label={`Página ${numeroPagina}`} aria-current={paginaAtual === numeroPagina ? 'page' : undefined} className={`h-10 min-w-10 cursor-pointer rounded-lg border px-2 text-sm font-semibold ${paginaAtual === numeroPagina ? 'border-primaria bg-primaria text-white' : 'border-[#dec3b2] text-[#78221b] hover:bg-[#f5e9e0]'}`}>

                                        <span className={paginaAtual === numeroPagina ? 'text-white' : 'text-primaria'}>
                                            {numeroPagina}
                                        </span>

                                    </button>

                                ))}

                                <button type="button" disabled={paginaAtual === totalPaginas} onClick={() => setPagina(paginaAtual + 1)} className={botaoClasse} aria-label="Próxima página">

                                    <Icone nome="chevron_right" />

                                </button>

                            </div>

                        )}

                    </section>

                    {/* PAINEL DE DETALHES */}

                    <aside className="min-w-0 rounded-xl border border-[#dfc2ae] bg-[#fffaf6] p-4 shadow-sm sm:p-5">

                        {!selecionada ? (

                            <div className="flex min-h-85 flex-col items-center justify-center text-center">

                                <Icone nome="assignment" classe="text-5xl text-[#b88e7a]" />

                                <h2 className="mt-4 font-titulo text-xl font-bold text-[#78221b]">

                                    Detalhes da Ocorrência

                                </h2>

                                <p className="mt-3 max-w-sm text-sm leading-relaxed text-texto-suave">

                                    Selecione uma ocorrência na tabela para visualizar suas informações e acompanhar o andamento.

                                </p>

                            </div>

                        ) : (

                            <div>

                                {/* CABEÇALHO DOS DETALHES */}

                                <div className="flex items-start justify-between gap-3 border-b border-[#e5cdbd] pb-4">

                                    <h2 className="flex items-center gap-2 font-titulo text-xl font-bold text-[#78221b]">

                                        <Icone nome="description" classe="text-2xl" />

                                        Ocorrência {selecionada.protocolo}

                                    </h2>

                                    <button type="button" disabled={salvando} onClick={fecharDetalhes} aria-label="Fechar detalhes" className="cursor-pointer text-primaria hover:opacity-70 disabled:opacity-50">

                                        <Icone nome="close" />

                                    </button>

                                </div>

                                {/* INFORMAÇÕES PRINCIPAIS */}

                                <div className="mt-4 grid gap-4 border-b border-[#e5cdbd] pb-4 sm:grid-cols-3">

                                    <div>

                                        <p className="text-xs font-bold text-[#78221b]">
                                            Categoria
                                        </p>

                                        <p className="mt-1 text-sm">
                                            {selecionada.categoria}
                                        </p>

                                    </div>

                                    <div>

                                        <p className="text-xs font-bold text-[#78221b]">
                                            Localização
                                        </p>

                                        <p className="mt-1 text-sm">
                                            {selecionada.endereco || 'Não informada'}
                                        </p>

                                    </div>

                                    <div>

                                        <p className="text-xs font-bold text-[#78221b]">
                                            Prioridade
                                        </p>

                                        <div className="mt-1 flex items-center gap-2 text-sm">

                                            <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${corPrioridade(selecionada.prioridade)}`} />

                                            {textoPrioridade(selecionada)}

                                        </div>

                                    </div>

                                </div>

                                {/* DESCRIÇÃO */}

                                <section className="mt-4 rounded-lg border border-[#ead5c7] p-4">

                                    <h3 className="flex items-center gap-2 text-sm font-bold text-[#78221b]">

                                        <Icone nome="description" classe="text-xl" />

                                        Descrição

                                    </h3>

                                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-texto">

                                        {selecionada.descricao || 'Descrição não informada.'}

                                    </p>

                                </section>

                                {/* ENDEREÇO */}

                                <section className="mt-4 rounded-lg border border-[#ead5c7] p-4">

                                    <h3 className="flex items-center gap-2 text-sm font-bold text-[#78221b]">

                                        <Icone nome="location_on" classe="text-xl" />

                                        Endereço

                                    </h3>

                                    <p className="mt-2 text-sm leading-relaxed">

                                        {[selecionada.endereco, selecionada.numero].filter(Boolean).join(', ') || 'Endereço não informado'}

                                        {selecionada.cep && (

                                            <span className="block">

                                                CEP: {selecionada.cep}

                                            </span>

                                        )}

                                    </p>

                                </section>

                                {/* ANEXOS */}

                                <section className="mt-4">

                                    <h3 className="flex items-center gap-2 text-sm font-bold text-[#78221b]">

                                        <Icone nome="attach_file" classe="text-xl" />

                                        Anexos

                                    </h3>

                                    <p className="mt-2 rounded-lg border border-dashed border-[#dec3b2] p-3 text-xs text-texto-suave">

                                        Anexos indisponíveis na integração atual.

                                    </p>

                                </section>

                                {/* HISTÓRICO */}

                                <section className="mt-5 border-t border-[#e5cdbd] pt-4">

                                    <h3 className="flex items-center gap-2 font-titulo text-lg font-bold text-[#78221b]">

                                        <Icone nome="history" classe="text-xl" />

                                        Histórico da Ocorrência

                                    </h3>

                                    {!selecionada.historicoDisponivel ? (

                                        <p className="mt-3 text-sm text-texto-suave">

                                            Não foi possível consultar o histórico da ocorrência.

                                        </p>

                                    ) : selecionada.historico.length === 0 ? (

                                        <p className="mt-3 text-sm text-texto-suave">

                                            Nenhum histórico registrado.

                                        </p>

                                    ) : (

                                        <div className="mt-4 space-y-4">

                                            {selecionada.historico.map((historico, indice) => (

                                                <div key={`${historico.data}-${indice}`} className="relative ml-2 border-l-2 border-[#dfc2ae] pl-5 pb-3">

                                                    <span className="absolute -left-1.5 top-1 h-3 w-3 rounded-full bg-primaria" />

                                                    <p className="text-xs font-semibold text-primaria">

                                                        {formatarData(historico.data)}

                                                    </p>

                                                    <p className="mt-1 text-sm text-texto">

                                                        {historico.descricao}

                                                    </p>

                                                </div>

                                            ))}

                                        </div>

                                    )}

                                </section>

                                {/* ALTERAR STATUS */}

                                <section className="mt-5 border-t border-[#e5cdbd] pt-4">

                                    <h3 className="flex items-center gap-2 font-titulo text-lg font-bold text-[#78221b]">

                                        <Icone nome="published_with_changes" classe="text-xl" />

                                        Alterar Status

                                    </h3>

                                    <div className="mt-3 flex items-center justify-between gap-3">

                                        <span className="text-sm text-texto-suave">

                                            Status atual:

                                        </span>

                                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${corStatus(selecionada.status)}`}>

                                            {selecionada.status}

                                        </span>

                                    </div>

                                    <label htmlFor="novo-status" className="mt-4 mb-2 block text-xs font-semibold text-[#78221b]">

                                        Selecione o novo status

                                    </label>

                                    <select id="novo-status" value={novoStatus} disabled={bloquearAtualizacao} onChange={evento => setNovoStatus(evento.target.value as StatusOcorrencia)} className={campoClasse}>

                                        <option value="Não informado" disabled>

                                            Selecione um status

                                        </option>

                                        {statusDisponiveis.map(status => (

                                            <option key={status} value={status}>

                                                {status}

                                            </option>

                                        ))}

                                    </select>

                                    <div className="mt-4 grid gap-3 sm:grid-cols-2">

                                        <button type="button" onClick={() => void salvarStatus(novoStatus)} disabled={bloquearAtualizacao || novoStatus === 'Não informado' || novoStatus === selecionada.status} className={botaoPrimario}>

                                            <Icone nome="save" classe="text-xl text-white" />

                                            <span className="text-white">

                                                Salvar status

                                            </span>

                                        </button>

                                        <button type="button" onClick={() => void salvarStatus('Concluído')} disabled={bloquearAtualizacao || selecionada.status === 'Concluído'} className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#507443] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#41642d] disabled:cursor-not-allowed disabled:opacity-50">

                                            <Icone nome="check_circle" classe="text-xl text-white" />

                                            <span className="text-white">

                                                Concluir ocorrência

                                            </span>

                                        </button>

                                    </div>

                                </section>

                                {/* ALTERAR PRIORIDADE */}

                                <section className="mt-5 border-t border-[#e5cdbd] pt-4">

                                    <h3 className="flex items-center gap-2 font-titulo text-lg font-bold text-[#78221b]">

                                        <Icone nome="flag" classe="text-xl" />

                                        Alterar Prioridade

                                    </h3>

                                    <p className="mt-2 text-sm text-texto-suave">

                                        Classifique a ocorrência de acordo com sua urgência.

                                    </p>

                                    <div className="mt-4 space-y-3">

                                        {prioridades.map(prioridade => (

                                            <label key={prioridade} className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${bloquearPrioridade ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'} ${novaPrioridade === prioridade ? 'border-primaria bg-[#f5e9e0]' : 'border-[#dec3b2] hover:bg-[#fbf1e9]'}`}>

                                                <input type="radio" name="prioridade-ocorrencia" value={prioridade} checked={novaPrioridade === prioridade} disabled={bloquearPrioridade} onChange={() => setNovaPrioridade(prioridade)} className="h-4 w-4 shrink-0 accent-primaria" />

                                                <span className={`h-3 w-3 shrink-0 rounded-full ${corPrioridade(prioridade)}`} />

                                                <div>

                                                    <p className="text-sm font-bold text-[#78221b]">

                                                        {prioridade}

                                                    </p>

                                                    <p className="mt-1 text-xs text-texto-suave">

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

                                    <button type="button" onClick={() => void salvarPrioridade()} disabled={bloquearPrioridade || !novaPrioridade || novaPrioridade === selecionada.prioridade} className={`${botaoPrimario} mt-4 w-full`}>

                                        <Icone nome="save" classe="text-xl text-white" />

                                        <span className="text-white">

                                            Salvar prioridade

                                        </span>

                                    </button>

                                    {bloquearPrioridade && !carregando && !salvando && (

                                        <p className="mt-3 text-xs text-texto-suave">

                                            É necessário possuir um histórico válido e consultar os dados da análise para classificar a ocorrência.

                                        </p>

                                    )}

                                </section>

                                {/* MENSAGENS DE ATUALIZAÇÃO */}

                                {salvando && (

                                    <div role="status" className="mt-4 flex items-center gap-2 rounded-lg bg-[#f5e9e0] p-3 text-sm text-primaria">

                                        <Icone nome="sync" classe="animate-spin" />

                                        Atualizando dados na plataforma...

                                    </div>

                                )}

                                {mensagem && (

                                    <p role="status" className={`mt-4 rounded-lg p-3 text-sm font-semibold ${tipoMensagem === 'sucesso' ? 'bg-[#e5efdc] text-[#41642d]' : 'bg-red-50 text-red-700'}`}>

                                        {mensagem}

                                    </p>

                                )}

                            </div>

                        )}

                    </aside>

                </div>

                {/* RODAPÉ DA LISTAGEM */}

                <div className="flex flex-wrap items-center justify-between gap-3 px-1 py-3 text-sm text-texto-suave">

                    <p>

                        {dadosDisponiveis
                            ? `Exibindo ${ocorrenciasFiltradas.length === 0 ? 0 : (paginaAtual - 1) * itensPorPagina + 1} a ${Math.min(paginaAtual * itensPorPagina, ocorrenciasFiltradas.length)} de ${ocorrenciasFiltradas.length} ocorrências`
                            : 'Registros temporariamente indisponíveis'}

                    </p>

                    <button type="button" onClick={atualizarLista} disabled={carregando || salvando} className="flex cursor-pointer items-center gap-2 font-semibold text-primaria hover:underline disabled:opacity-50">

                        <Icone nome="refresh" classe={`text-lg ${carregando ? 'animate-spin' : ''}`} />

                        {carregando ? 'Atualizando lista...' : 'Atualizar lista'}

                    </button>

                </div>

            </div>

        </main>
    );
}