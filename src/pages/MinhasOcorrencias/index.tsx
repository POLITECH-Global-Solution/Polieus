import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { listarMinhasOcorrencias, obterUsuarioId } from '../../services/ocorrenciaService';

import {
    listarHistoricosPorOcorrencia,
    obterHistoricoInicial,
    obterHistoricoAtual,
    ordenarHistoricos,
    gerarProtocolo,
    type Historico,
} from '../../services/historicoService';

import {
    listarAnalises,
    obterAnalisePorProtocolo,
    normalizarPrioridade,
    type Analise,
} from '../../services/analiseService';

// TIPAGENS

type StatusOcorrencia =
    | 'Pendente'
    | 'Em análise'
    | 'Em andamento'
    | 'Concluído'
    | 'Não informado';

type PrioridadeOcorrencia = 'Alta' | 'Média' | 'Baixa';

interface Ocorrencia {
    id: number;
    protocolo: string;
    categoria: string;
    descricao: string;
    data: string;
    status: StatusOcorrencia;
    prioridade: PrioridadeOcorrencia | null;
    endereco: string;
    departamento: string;
    cep: string;
    historicos: Historico[];
    erroHistorico: boolean;
    erroPrioridade: boolean;
}

// CONSTANTES

const itensPorPagina = 5;

const estilosStatus: Record<StatusOcorrencia, string> = {
    Pendente: 'bg-[#e8ded5] text-[#554238]',
    'Em análise': 'bg-[#ffe0b2] text-[#9b510c]',
    'Em andamento': 'bg-[#f8c9bd] text-[#922c1d]',
    'Concluído': 'bg-[#dfe8c5] text-[#3e6029]',
    'Não informado': 'bg-[#e8ded5] text-[#554238]',
};

const iconesStatus: Record<StatusOcorrencia, string> = {
    Pendente: 'schedule',
    'Em análise': 'search',
    'Em andamento': 'construction',
    'Concluído': 'check_circle',
    'Não informado': 'info',
};

const iconesCategoria: Record<string, string> = {
    Iluminação: 'lightbulb',
    'Iluminação pública': 'lightbulb',
    Saneamento: 'water_drop',
    Transporte: 'directions_bus',
    'Transporte público': 'directions_bus',
    Infraestrutura: 'construction',
    'Meio ambiente': 'eco',
    'Limpeza urbana': 'cleaning_services',
    Segurança: 'security',
    Acessibilidade: 'accessible',
    Outros: 'assignment',
};

const estilosPrioridade: Record<PrioridadeOcorrencia, string> = {
    Alta: 'bg-[#f8d8d0] text-[#84261f]',
    Média: 'bg-[#ffe0b2] text-[#9b510c]',
    Baixa: 'bg-[#dce9d1] text-[#41642d]',
};

const coresPrioridade: Record<PrioridadeOcorrencia, string> = {
    Alta: 'bg-[#b3261e]',
    Média: 'bg-[#e99a3e]',
    Baixa: 'bg-[#4f7b43]',
};

// COMPONENTES AUXILIARES

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

function Prioridade({ prioridade, indisponivel = false }: {
    prioridade: PrioridadeOcorrencia | null;
    indisponivel?: boolean;
}) {

    return (

        <span className={`inline-flex max-w-full items-center justify-center gap-2 whitespace-nowrap rounded-full px-3 py-2 text-xs font-semibold ${
            prioridade && !indisponivel
                ? estilosPrioridade[prioridade]
                : 'bg-[#e8ded5] text-[#554238]'
        }`}>

            <span aria-hidden="true" className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                prioridade && !indisponivel
                    ? coresPrioridade[prioridade]
                    : 'bg-[#8d8276]'
            }`} />

            {indisponivel
                ? 'Indisponível'
                : prioridade ?? 'Não definida'}

        </span>
    );
}

// PADRONIZAR STATUS RETORNADO PELO JAVA

function normalizarStatus(status?: string): StatusOcorrencia {

    const valor = (status ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/_/g, ' ')
        .trim()
        .toLowerCase();

    switch (valor) {

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

// FORMATAR DATA RETORNADA PELA API

function formatarData(data?: string): string {

    if (!data?.trim()) return 'Não informada';

    if (/^\d{2}-\d{2}-\d{4}$/.test(data)) {
        return data.replace(/-/g, '/');
    }

    if (/^\d{4}-\d{2}-\d{2}/.test(data)) {

        const [ano, mes, dia] = data.slice(0, 10).split('-');

        return `${dia}/${mes}/${ano}`;
    }

    return data;
}

// PÁGINA MINHAS OCORRÊNCIAS

export default function MinhasOcorrencias() {

    const navigate = useNavigate();

    const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');
    const [tentativa, setTentativa] = useState(0);

    const [busca, setBusca] = useState('');
    const [mostrarFiltros, setMostrarFiltros] = useState(false);

    const [filtroStatus, setFiltroStatus] = useState('Todos');
    const [filtroCategoria, setFiltroCategoria] = useState('Todas');
    const [filtroPrioridade, setFiltroPrioridade] = useState('Todas');

    const [paginaAtual, setPaginaAtual] = useState(1);

    const [ocorrenciaSelecionada, setOcorrenciaSelecionada] = useState<Ocorrencia | null>(null);

    // ==================================================
    // CARREGAR OCORRÊNCIAS, HISTÓRICOS E PRIORIDADES
    // ==================================================

    useEffect(() => {

        const idUsuario = obterUsuarioId();

        if (!idUsuario) {

            navigate('/login-usuario', { replace: true });

            return;
        }

        let ativo = true;

        async function carregarOcorrencias(id: number) {

            setCarregando(true);
            setErro('');
            setOcorrencias([]);
            setOcorrenciaSelecionada(null);

            try {

                // CONSULTAR SOMENTE AS OCORRÊNCIAS DO USUÁRIO

                const dadosOcorrencias = await listarMinhasOcorrencias(id);

                if (!ativo) return;

                const ocorrenciasValidas = dadosOcorrencias.filter(
                    item =>
                        typeof item.idOcorrencia === 'number' &&
                        Number.isInteger(item.idOcorrencia) &&
                        item.idOcorrencia > 0 &&
                        item.idUsuario === id
                );

                // CONSULTAR PRIORIDADES NA API JAVA

                let analises: Analise[] = [];

                let erroAnalises = false;

                if (ocorrenciasValidas.length > 0) {

                    try {

                        analises = await listarAnalises();

                        if (!Array.isArray(analises)) {
                            throw new Error('Resposta inválida ao consultar análises.');
                        }

                    } catch (erro) {

                        console.error('Erro ao consultar prioridades:', erro);

                        erroAnalises = true;
                    }
                }

                if (!ativo) return;

                // CONSULTAR HISTÓRICOS DAS OCORRÊNCIAS

                const ocorrenciasFormatadas = await Promise.all(

                    ocorrenciasValidas.map(async (item): Promise<Ocorrencia | null> => {

                        const idOcorrencia = item.idOcorrencia;

                        if (idOcorrencia === null) return null;

                        let historicos: Historico[] = [];

                        let erroHistorico = false;

                        let erroPrioridade = erroAnalises;

                        let prioridade: PrioridadeOcorrencia | null = null;

                        try {

                            const dadosHistoricos = await listarHistoricosPorOcorrencia(idOcorrencia);

                            historicos = ordenarHistoricos(dadosHistoricos);

                        } catch (erro) {

                            console.error(`Erro ao consultar histórico da ocorrência ${idOcorrencia}:`, erro);

                            erroHistorico = true;
                        }

                        // PRIMEIRO HISTÓRICO: PROTOCOLO E DATA INICIAL

                        const historicoInicial = obterHistoricoInicial(historicos);

                        // ÚLTIMO HISTÓRICO: STATUS ATUAL

                        const historicoAtual = obterHistoricoAtual(historicos);

                        const protocolo = String(
                            historicoInicial?.protocolo ||
                            historicoAtual?.protocolo ||
                            gerarProtocolo(idOcorrencia)
                        );

                        // VINCULAR PRIORIDADE PELO PROTOCOLO

                        if (!erroAnalises && !erroHistorico) {

                            try {

                                const analise = obterAnalisePorProtocolo(
                                    analises,
                                    protocolo
                                );

                                prioridade = normalizarPrioridade(analise?.prioridade);

                            } catch (erro) {

                                console.error(`Erro ao consultar prioridade de ${protocolo}:`, erro);

                                erroPrioridade = true;
                            }

                        } else {

                            erroPrioridade = true;
                        }

                        return {
                            id: idOcorrencia,
                            protocolo,
                            categoria: item.categoria ?? 'Outros',
                            descricao: item.descricao ?? '',
                            data: formatarData(historicoInicial?.data),
                            status: normalizarStatus(historicoAtual?.status),
                            prioridade,
                            endereco: item.endereco ?? 'Não informado',
                            departamento: item.departamento ?? 'Não informado',
                            cep: item.cep ?? '',
                            historicos,
                            erroHistorico,
                            erroPrioridade,
                        };
                    })
                );

                if (ativo) {

                    setOcorrencias(
                        ocorrenciasFormatadas.filter(
                            (item): item is Ocorrencia => item !== null
                        )
                    );
                }

            } catch (erro) {

                console.error('Erro ao carregar ocorrências:', erro);

                if (ativo) {

                    setErro(
                        erro instanceof Error
                            ? erro.message
                            : 'Não foi possível carregar suas ocorrências.'
                    );
                }

            } finally {

                if (ativo) {
                    setCarregando(false);
                }
            }
        }

        void carregarOcorrencias(idUsuario);

        return () => {
            ativo = false;
        };

    }, [navigate, tentativa]);

    // CATEGORIAS DISPONÍVEIS

    const categorias = useMemo(
        () => [...new Set(ocorrencias.map(item => item.categoria))].sort(),
        [ocorrencias]
    );

    // VERIFICAR FALHAS NAS CONSULTAS

    const possuiErroHistorico = ocorrencias.some(item => item.erroHistorico);

    const possuiErroPrioridade = ocorrencias.some(item => item.erroPrioridade);

    // BUSCA, FILTROS E ORDENAÇÃO

    const ocorrenciasFiltradas = useMemo(() => {

        const termo = busca.trim().toLocaleLowerCase('pt-BR');

        return ocorrencias

            .filter(item => {

                const correspondeBusca =
                    !termo ||
                    item.protocolo.toLocaleLowerCase('pt-BR').includes(termo) ||
                    item.categoria.toLocaleLowerCase('pt-BR').includes(termo) ||
                    item.descricao.toLocaleLowerCase('pt-BR').includes(termo) ||
                    String(item.id).includes(termo);

                const correspondeStatus =
                    filtroStatus === 'Todos' ||
                    item.status === filtroStatus;

                const correspondeCategoria =
                    filtroCategoria === 'Todas' ||
                    item.categoria === filtroCategoria;

                const correspondePrioridade =
                    filtroPrioridade === 'Todas' ||
                    (
                        filtroPrioridade === 'Não definida'
                            ? !item.erroPrioridade && item.prioridade === null
                            : filtroPrioridade === 'Indisponível'
                                ? item.erroPrioridade
                                : item.prioridade === filtroPrioridade
                    );

                return correspondeBusca &&
                    correspondeStatus &&
                    correspondeCategoria &&
                    correspondePrioridade;
            })

            .sort((a, b) => b.id - a.id);

    }, [ocorrencias, busca, filtroStatus, filtroCategoria, filtroPrioridade]);

    // PAGINAÇÃO

    const totalPaginas = Math.max(
        1,
        Math.ceil(ocorrenciasFiltradas.length / itensPorPagina)
    );

    const pagina = Math.min(paginaAtual, totalPaginas);

    const ocorrenciasPagina = ocorrenciasFiltradas.slice(
        (pagina - 1) * itensPorPagina,
        pagina * itensPorPagina
    );

    const inicio =
        ocorrenciasFiltradas.length === 0
            ? 0
            : (pagina - 1) * itensPorPagina + 1;

    const fim = Math.min(
        pagina * itensPorPagina,
        ocorrenciasFiltradas.length
    );

    // FECHAR MODAL COM ESC

    useEffect(() => {

        if (!ocorrenciaSelecionada) return;

        const fecharComEscape = (event: KeyboardEvent) => {

            if (event.key === 'Escape') {
                setOcorrenciaSelecionada(null);
            }
        };

        document.addEventListener('keydown', fecharComEscape);

        return () => {
            document.removeEventListener('keydown', fecharComEscape);
        };

    }, [ocorrenciaSelecionada]);

    // ATUALIZAR BUSCA

    function atualizarBusca(valor: string) {

        setBusca(valor);
        setPaginaAtual(1);
    }

    // FILTRAR STATUS

    function atualizarStatus(valor: string) {

        setFiltroStatus(valor);
        setPaginaAtual(1);
    }

    // FILTRAR CATEGORIA

    function atualizarCategoria(valor: string) {

        setFiltroCategoria(valor);
        setPaginaAtual(1);
    }

    // FILTRAR PRIORIDADE

    function atualizarPrioridade(valor: string) {

        setFiltroPrioridade(valor);
        setPaginaAtual(1);
    }

    // LIMPAR FILTROS

    function limparFiltros() {

        setBusca('');
        setFiltroStatus('Todos');
        setFiltroCategoria('Todas');
        setFiltroPrioridade('Todas');
        setPaginaAtual(1);
    }

    // ATUALIZAR OCORRÊNCIAS

    function tentarNovamente() {

        limparFiltros();

        setTentativa(atual => atual + 1);
    }

    const focoClasse = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria';

    const campoClasse = 'w-full min-w-0 max-w-full rounded-lg border border-[#dfc2ae] bg-[#fffaf4] px-3 py-3 text-sm text-texto outline-none transition-colors focus:border-primaria focus:ring-2 focus:ring-primaria/20';

    return (

        <main className="min-h-screen w-full min-w-0 flex-1 bg-fundo font-corpo text-texto">

            {/* CABEÇALHO DA PÁGINA */}

            <header className="border-b border-[#d8b9a5] bg-[#fffaf4] py-5 pr-5 pl-20 sm:pr-8 sm:pl-20 lg:px-10">

                <h1 className="font-titulo text-3xl font-bold text-[#78221b] sm:text-4xl">
                    Minhas Ocorrências
                </h1>

                <nav aria-label="Navegação estrutural" className="mt-1 flex flex-wrap items-center gap-2 text-sm text-[#6b4438]">

                    <Link to="/inicio" className={`text-[#6b4438] transition-colors hover:text-primaria hover:underline ${focoClasse}`}>
                        Início
                    </Link>

                    <Icone nome="chevron_right" classe="text-base text-[#6b4438]" />

                    <span aria-current="page" className="font-semibold text-[#78221b]">
                        Minhas Ocorrências
                    </span>

                </nav>

            </header>

            <div className="mx-auto w-full min-w-0 max-w-7xl px-4 py-8 sm:px-8 sm:py-10 lg:px-10">

                {/* TÍTULO E DESCRIÇÃO */}

                <section className="mb-8 min-w-0">

                    <div className="flex min-w-0 flex-col items-start justify-between gap-4 sm:flex-row sm:flex-wrap sm:items-center">

                        <div className="min-w-0 flex-1">

                            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#a34a37]">
                                Histórico de participação
                            </p>

                            <h2 className="font-titulo text-3xl font-bold text-[#78221b] sm:text-4xl">
                                Minhas Ocorrências
                            </h2>

                            <p className="mt-2 text-sm leading-relaxed text-[#51453e] sm:text-base">
                                Acompanhe o andamento das suas solicitações e consulte os registros realizados.
                            </p>

                        </div>

                        <Link to="/registrar-ocorrencia" className={`inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-full bg-primaria px-5 py-3 text-center text-sm font-semibold transition-colors hover:bg-primaria-hover sm:w-auto ${focoClasse}`}>

                            <Icone nome="add_circle" classe="shrink-0 text-xl text-white" />

                            <span className="text-white">
                                Nova ocorrência
                            </span>

                        </Link>

                    </div>

                    <div className="mt-6 flex max-w-xl items-center gap-4" aria-hidden="true">

                        <div className="h-px flex-1 bg-[#b77965]" />

                        <div className="h-2.5 w-2.5 shrink-0 rotate-45 bg-[#78221b]" />

                        <div className="h-px flex-1 bg-[#d8b9a8]" />

                    </div>

                </section>

                {/* BUSCA E FILTROS */}

                <section className="mb-7 min-w-0" aria-label="Busca e filtros de ocorrências">

                    <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap">

                        <div className="relative w-full min-w-0 flex-1">

                            <Icone nome="search" classe="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-xl text-[#78221b]" />

                            <input type="search" value={busca} onChange={event => atualizarBusca(event.target.value)} placeholder="Buscar por protocolo, categoria ou descrição..." aria-label="Buscar minhas ocorrências" className="w-full min-w-0 rounded-xl border border-[#dfc2ae] bg-[#fffaf4] py-3.5 pr-4 pl-12 text-sm text-texto shadow-sm outline-none transition-colors placeholder:text-[#807167] focus:border-primaria focus:ring-2 focus:ring-primaria/20" />

                        </div>

                        <button type="button" onClick={() => setMostrarFiltros(atual => !atual)} aria-expanded={mostrarFiltros} aria-controls="painel-filtros-ocorrencias" className={`flex w-full shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold transition-all sm:w-auto ${focoClasse} ${
                            mostrarFiltros
                                ? 'border-primaria bg-[#f0dfd4] text-[#78221b]'
                                : 'border-[#dfc2ae] bg-[#fffaf4] text-[#78221b] hover:bg-[#f3e5d9]'
                        }`}>

                            <Icone nome="filter_alt" classe="text-xl" />

                            Filtros

                            <Icone nome="expand_more" classe={`text-lg transition-transform duration-300 motion-reduce:transition-none ${mostrarFiltros ? 'rotate-180' : ''}`} />

                        </button>

                        {/* ATUALIZAR DADOS */}

                        <button type="button" onClick={tentarNovamente} disabled={carregando} aria-label="Atualizar ocorrências" title="Atualizar ocorrências" className={`flex w-full shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#dfc2ae] bg-[#fffaf4] px-4 py-3 text-sm font-semibold text-[#78221b] transition-colors hover:bg-[#f3e5d9] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto ${focoClasse}`}>

                            <Icone nome="refresh" classe={`text-xl ${carregando ? 'animate-spin motion-reduce:animate-none' : ''}`} />

                        </button>

                    </div>

                    <div id="painel-filtros-ocorrencias" hidden={!mostrarFiltros}>

                        {mostrarFiltros && (

                            <div className="mt-3 grid min-w-0 grid-cols-1 gap-4 rounded-xl border border-[#dfc2ae] bg-[#fffaf4] p-4 shadow-sm sm:grid-cols-2 sm:p-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">

                                {/* FILTRO STATUS */}

                                <div className="min-w-0">

                                    <label htmlFor="filtro-status" className="mb-2 block text-sm font-semibold text-[#78221b]">
                                        Status
                                    </label>

                                    <select id="filtro-status" value={filtroStatus} onChange={event => atualizarStatus(event.target.value)} className={campoClasse}>

                                        <option value="Todos">Todos os status</option>
                                        <option value="Pendente">Pendente</option>
                                        <option value="Em análise">Em análise</option>
                                        <option value="Em andamento">Em andamento</option>
                                        <option value="Concluído">Concluído</option>
                                        <option value="Não informado">Não informado</option>

                                    </select>

                                </div>

                                {/* FILTRO CATEGORIA */}

                                <div className="min-w-0">

                                    <label htmlFor="filtro-categoria" className="mb-2 block text-sm font-semibold text-[#78221b]">
                                        Categoria
                                    </label>

                                    <select id="filtro-categoria" value={filtroCategoria} onChange={event => atualizarCategoria(event.target.value)} className={campoClasse}>

                                        <option value="Todas">Todas as categorias</option>

                                        {categorias.map(categoria => (

                                            <option key={categoria} value={categoria}>
                                                {categoria}
                                            </option>

                                        ))}

                                    </select>

                                </div>

                                {/* FILTRO PRIORIDADE */}

                                <div className="min-w-0">

                                    <label htmlFor="filtro-prioridade" className="mb-2 block text-sm font-semibold text-[#78221b]">
                                        Prioridade
                                    </label>

                                    <select id="filtro-prioridade" value={filtroPrioridade} onChange={event => atualizarPrioridade(event.target.value)} className={campoClasse}>

                                        <option value="Todas">Todas as prioridades</option>
                                        <option value="Alta">Alta</option>
                                        <option value="Média">Média</option>
                                        <option value="Baixa">Baixa</option>
                                        <option value="Não definida">Não definida</option>
                                        <option value="Indisponível">Indisponível</option>

                                    </select>

                                </div>

                                <div className="flex min-w-0 items-end">

                                    <button type="button" onClick={limparFiltros} className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#b77965] px-4 py-3 text-sm font-semibold text-[#78221b] transition-colors hover:bg-[#f0dfd4] ${focoClasse}`}>

                                        <Icone nome="restart_alt" classe="shrink-0 text-lg" />

                                        Limpar filtros

                                    </button>

                                </div>

                            </div>

                        )}

                    </div>

                </section>

                {/* AVISO DE DADOS INDISPONÍVEIS */}

                {!carregando && !erro && (possuiErroHistorico || possuiErroPrioridade) && (

                    <div role="alert" className="mb-5 flex min-w-0 flex-col items-start justify-between gap-3 rounded-xl border border-[#dfc2ae] bg-[#fff7ee] p-4 sm:flex-row sm:flex-wrap sm:items-center">

                        <div className="flex min-w-0 flex-1 items-start gap-3">

                            <Icone nome="info" classe="shrink-0 text-xl text-primaria" />

                            <p className="min-w-0 text-sm leading-relaxed text-[#51453e]">
                                Algumas informações das suas ocorrências estão temporariamente indisponíveis.
                            </p>

                        </div>

                        <button type="button" onClick={tentarNovamente} className={`cursor-pointer text-sm font-semibold text-primaria hover:underline ${focoClasse}`}>
                            Tentar novamente
                        </button>

                    </div>

                )}

                {/* HISTÓRICO DE OCORRÊNCIAS */}

                <section className="w-full min-w-0" aria-label="Histórico das minhas ocorrências" aria-busy={carregando}>

                    <div className="w-full min-w-0 overflow-hidden rounded-2xl border border-[#dfc2ae] bg-[#fffaf4] shadow-sm">

                        <div role="region" aria-label="Tabela de ocorrências com rolagem horizontal" tabIndex={0} className="w-full max-w-full overflow-x-auto focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primaria">

                            <table className="w-full min-w-215 border-collapse text-left">

                                <thead className="bg-[#f0dfd4]">

                                    <tr className="font-corpo text-sm font-bold text-[#54251e]">

                                        <th scope="col" className="px-4 py-4">Protocolo</th>

                                        <th scope="col" className="px-4 py-4">Categoria</th>

                                        <th scope="col" className="px-4 py-4">Descrição</th>

                                        <th scope="col" className="px-4 py-4">Data do registro</th>

                                        <th scope="col" className="px-4 py-4">Prioridade</th>

                                        <th scope="col" className="px-4 py-4">Status</th>

                                        <th scope="col" className="px-4 py-4 text-center">Ações</th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {!carregando && !erro && ocorrenciasPagina.map(ocorrencia => (

                                        <tr key={ocorrencia.id} className="border-t border-[#ead7c9] transition-colors hover:bg-[#f9eee5]">

                                            {/* PROTOCOLO */}

                                            <td className="whitespace-nowrap px-4 py-5 text-sm font-semibold text-[#78221b]">

                                                {ocorrencia.protocolo}

                                            </td>

                                            {/* CATEGORIA */}

                                            <td className="px-4 py-5">

                                                <div className="flex min-w-0 items-center gap-2 text-sm">

                                                    <Icone nome={iconesCategoria[ocorrencia.categoria] || 'assignment'} classe="shrink-0 text-xl text-[#78221b]" />

                                                    <span className="wrap-break-word">

                                                        {ocorrencia.categoria}

                                                    </span>

                                                </div>

                                            </td>

                                            {/* DESCRIÇÃO */}

                                            <td className="max-w-70 px-4 py-5 text-sm leading-relaxed text-[#51453e]">

                                                <p className="line-clamp-3 wrap-break-word">

                                                    {ocorrencia.descricao}

                                                </p>

                                            </td>

                                            {/* DATA */}

                                            <td className="whitespace-nowrap px-4 py-5 text-sm text-texto">

                                                {ocorrencia.data}

                                            </td>

                                            {/* PRIORIDADE */}

                                            <td className="px-4 py-5">

                                                <Prioridade prioridade={ocorrencia.prioridade} indisponivel={ocorrencia.erroPrioridade} />

                                            </td>

                                            {/* STATUS */}

                                            <td className="px-4 py-5">

                                                <span className={`inline-flex min-w-28 items-center justify-center rounded-full px-3 py-2 text-center text-xs font-semibold ${estilosStatus[ocorrencia.status]}`}>

                                                    {ocorrencia.status}

                                                </span>

                                            </td>

                                            {/* AÇÕES */}

                                            <td className="px-4 py-5 text-center">

                                                <button type="button" onClick={() => setOcorrenciaSelecionada(ocorrencia)} aria-label={`Visualizar ocorrência ${ocorrencia.protocolo}`} title="Ver detalhes" className={`inline-flex h-11 w-12 cursor-pointer items-center justify-center rounded-full border border-[#dfc2ae] text-[#78221b] transition-all hover:border-primaria hover:bg-[#f0dfd4] ${focoClasse}`}>

                                                    <Icone nome="visibility" classe="text-xl" />

                                                </button>

                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        </div>

                        {/* CARREGAMENTO */}

                        {carregando && (

                            <div role="status" className="flex min-w-0 flex-col items-center justify-center px-4 py-12 text-center sm:px-5 sm:py-16">

                                <div aria-hidden="true" className="mb-5 h-12 w-12 animate-spin rounded-full border-4 border-[#ead7c9] border-t-primaria motion-reduce:animate-none" />

                                <h3 className="font-titulo text-xl font-semibold text-[#78221b]">

                                    Carregando suas ocorrências

                                </h3>

                                <p className="mt-3 text-sm text-[#51453e]">

                                    Aguarde enquanto recuperamos seus registros.

                                </p>

                            </div>

                        )}

                        {/* ERRO NA CONSULTA */}

                        {!carregando && erro && (

                            <div role="alert" className="flex min-w-0 flex-col items-center px-4 py-12 text-center sm:px-5 sm:py-14">

                                <Icone nome="error_outline" classe="mb-4 text-5xl text-primaria sm:text-6xl" />

                                <h3 className="font-titulo text-xl font-semibold text-[#78221b]">

                                    Não foi possível carregar as ocorrências

                                </h3>

                                <p className="mt-3 w-full max-w-md wrap-break-word text-sm text-[#51453e]">

                                    {erro}

                                </p>

                                <button type="button" onClick={tentarNovamente} className={`mt-6 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-primaria px-6 py-3 text-sm font-semibold transition-colors hover:bg-primaria-hover sm:w-auto ${focoClasse}`}>

                                    <Icone nome="refresh" classe="shrink-0 text-xl text-white" />

                                    <span className="text-white">
                                        Tentar novamente
                                    </span>

                                </button>

                            </div>

                        )}

                        {/* ESTADO VAZIO */}

                        {!carregando && !erro && ocorrenciasFiltradas.length === 0 && (

                            <div role="status" className="flex min-w-0 flex-col items-center px-4 py-12 text-center sm:px-5 sm:py-14">

                                <Icone nome="assignment" classe="mb-4 text-5xl text-primaria sm:text-6xl" />

                                <h3 className="font-titulo text-xl font-semibold text-[#78221b]">

                                    {ocorrencias.length === 0
                                        ? 'Nenhuma ocorrência registrada neste histórico'
                                        : 'Nenhuma ocorrência encontrada'}

                                </h3>

                                <p className="mt-3 max-w-md font-corpo text-sm leading-relaxed text-[#51453e]">

                                    {ocorrencias.length === 0
                                        ? 'Registre sua primeira ocorrência e contribua para uma cidade mais organizada e participativa.'
                                        : 'Nenhuma ocorrência corresponde à sua busca. Tente alterar os filtros.'}

                                </p>

                                {ocorrencias.length === 0 ? (

                                    <Link to="/registrar-ocorrencia" className={`mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primaria px-6 py-3 font-corpo text-sm font-semibold transition-colors hover:bg-primaria-hover sm:w-auto ${focoClasse}`}>

                                        <Icone nome="add_circle" classe="shrink-0 text-xl text-white" />

                                        <span className="text-white">
                                            Registrar ocorrência
                                        </span>

                                    </Link>

                                ) : (

                                    <button type="button" onClick={limparFiltros} className={`mt-6 w-full cursor-pointer rounded-full border border-primaria px-6 py-3 font-corpo text-sm font-semibold text-primaria transition-colors hover:bg-secundaria sm:w-auto ${focoClasse}`}>

                                        Limpar filtros

                                    </button>

                                )}

                            </div>

                        )}

                    </div>

                    {/* PAGINAÇÃO */}

                    {!carregando && !erro && ocorrenciasFiltradas.length > 0 && (

                        <div className="mt-6 flex min-w-0 flex-col items-center justify-between gap-4 sm:flex-row sm:flex-wrap">

                            <p className="text-center text-sm text-[#51453e] sm:text-left" role="status">

                                Mostrando {inicio}–{fim} de{' '}
                                {ocorrenciasFiltradas.length} ocorrências

                            </p>

                            <nav className="flex max-w-full flex-wrap items-center justify-center gap-2" aria-label="Paginação de ocorrências">

                                <button type="button" onClick={() => setPaginaAtual(Math.max(1, pagina - 1))} disabled={pagina === 1} aria-label="Página anterior" className={`flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-[#dfc2ae] text-[#78221b] transition-colors hover:bg-[#f0dfd4] disabled:cursor-not-allowed disabled:opacity-40 ${focoClasse}`}>

                                    <Icone nome="chevron_left" />

                                </button>

                                {Array.from({ length: totalPaginas }, (_, indice) => indice + 1).map(numeroPagina => (

                                    <button key={numeroPagina} type="button" onClick={() => setPaginaAtual(numeroPagina)} aria-label={`Ir para a página ${numeroPagina}`} aria-current={pagina === numeroPagina ? 'page' : undefined} className={`flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-lg border text-sm font-semibold transition-colors ${focoClasse} ${
                                        pagina === numeroPagina
                                            ? 'border-[#78221b] bg-[#78221b] text-white'
                                            : 'border-[#dfc2ae] bg-[#fffaf4] text-[#78221b] hover:bg-[#f0dfd4]'
                                    }`}>

                                        <span className={pagina === numeroPagina ? 'text-white' : 'text-[#78221b]'}>
                                            {numeroPagina}
                                        </span>

                                    </button>

                                ))}

                                <button type="button" onClick={() => setPaginaAtual(Math.min(totalPaginas, pagina + 1))} disabled={pagina === totalPaginas} aria-label="Próxima página" className={`flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-[#dfc2ae] text-[#78221b] transition-colors hover:bg-[#f0dfd4] disabled:cursor-not-allowed disabled:opacity-40 ${focoClasse}`}>

                                    <Icone nome="chevron_right" />

                                </button>

                            </nav>

                        </div>

                    )}

                </section>

            </div>

            {/* MODAL DE DETALHES */}

            {ocorrenciaSelecionada && (

                <div className="fixed inset-0 z-1000 flex items-center justify-center bg-black/60 p-3 sm:p-4" onMouseDown={event => {

                    if (event.target === event.currentTarget) {

                        setOcorrenciaSelecionada(null);
                    }

                }}>

                    <section role="dialog" aria-modal="true" aria-labelledby="titulo-detalhes-ocorrencia" className="flex max-h-[calc(100dvh-24px)] w-full min-w-0 max-w-xl flex-col overflow-hidden rounded-2xl border border-[#dfc2ae] bg-[#fffaf4] shadow-2xl sm:max-h-[calc(100dvh-32px)]">

                        {/* CABEÇALHO DO MODAL */}

                        <div className="flex min-w-0 shrink-0 items-start justify-between gap-3 bg-[#78221b] px-4 py-4 sm:gap-4 sm:px-6 sm:py-5">

                            <div className="min-w-0">

                                <p className="text-xs font-semibold uppercase tracking-wider text-[#f0cbb9]">

                                    Detalhes da solicitação

                                </p>

                                <h2 id="titulo-detalhes-ocorrencia" className="mt-1 wrap-break-word font-titulo text-xl font-bold sm:text-2xl">

                                    <span className="text-white">
                                        Ocorrência #{String(ocorrenciaSelecionada.id).padStart(6, '0')}
                                    </span>

                                </h2>

                            </div>

                            <button type="button" onClick={() => setOcorrenciaSelecionada(null)} aria-label="Fechar detalhes" autoFocus className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-white transition-colors hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">

                                <Icone nome="close" classe="text-white" />

                            </button>

                        </div>

                        <div className="min-h-0 min-w-0 flex-1 space-y-5 overflow-y-auto overscroll-contain p-4 sm:p-6">

                            {/* INFORMAÇÕES DO REGISTRO */}

                            <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">

                                <span className="font-titulo text-lg font-semibold text-[#78221b]">

                                    Informações do registro

                                </span>

                                <span className={`rounded-full px-4 py-2 text-xs font-semibold ${estilosStatus[ocorrenciaSelecionada.status]}`}>

                                    {ocorrenciaSelecionada.status}

                                </span>

                            </div>

                            <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">

                                <div className="min-w-0">

                                    <p className="text-xs font-semibold uppercase text-[#51453e]">

                                        Protocolo

                                    </p>

                                    <p className="mt-1 wrap-break-word text-sm font-semibold">

                                        {ocorrenciaSelecionada.protocolo}

                                    </p>

                                </div>

                                <div className="min-w-0">

                                    <p className="text-xs font-semibold uppercase text-[#51453e]">

                                        Data do registro

                                    </p>

                                    <p className="mt-1 text-sm">

                                        {ocorrenciaSelecionada.data}

                                    </p>

                                </div>

                                <div className="min-w-0">

                                    <p className="text-xs font-semibold uppercase text-[#51453e]">

                                        Categoria

                                    </p>

                                    <p className="mt-1 wrap-break-word text-sm">

                                        {ocorrenciaSelecionada.categoria}

                                    </p>

                                </div>

                                {/* NÚMERO DO ENDEREÇO */}

                                <div className="min-w-0">

                                    <p className="text-xs font-semibold uppercase text-[#51453e]">

                                        Número

                                    </p>

                                    <p className="mt-1 wrap-break-word text-sm">

                                        {ocorrenciaSelecionada.departamento}

                                    </p>

                                </div>

                                {/* PRIORIDADE DA OCORRÊNCIA */}

                                <div className="min-w-0 sm:col-span-2">

                                    <p className="mb-2 text-xs font-semibold uppercase text-[#51453e]">

                                        Prioridade

                                    </p>

                                    <Prioridade prioridade={ocorrenciaSelecionada.prioridade} indisponivel={ocorrenciaSelecionada.erroPrioridade} />

                                    {!ocorrenciaSelecionada.erroPrioridade && (

                                        <p className="mt-2 text-xs leading-relaxed text-[#51453e]">

                                            {ocorrenciaSelecionada.prioridade
                                                ? 'Classificação atribuída pela equipe responsável pelo atendimento.'
                                                : 'Esta ocorrência ainda não recebeu uma classificação de prioridade.'}

                                        </p>

                                    )}

                                </div>

                            </div>

                            {/* DESCRIÇÃO */}

                            <div className="min-w-0 border-t border-[#ead7c9] pt-4">

                                <p className="text-xs font-semibold uppercase text-[#51453e]">

                                    Descrição

                                </p>

                                <p className="mt-2 wrap-break-word whitespace-pre-wrap text-sm leading-relaxed">

                                    {ocorrenciaSelecionada.descricao}

                                </p>

                            </div>

                            {/* LOCALIZAÇÃO */}

                            <div className="min-w-0 border-t border-[#ead7c9] pt-4">

                                <p className="text-xs font-semibold uppercase text-[#51453e]">

                                    Localização

                                </p>

                                <p className="mt-2 flex min-w-0 items-start gap-2 text-sm">

                                    <Icone nome="location_on" classe="shrink-0 text-lg text-[#78221b]" />

                                    <span className="min-w-0 wrap-break-word">

                                        {ocorrenciaSelecionada.endereco}

                                    </span>

                                </p>

                                <p className="mt-2 wrap-break-word pl-7 text-sm text-[#51453e]">

                                    CEP: {ocorrenciaSelecionada.cep
                                        ? ocorrenciaSelecionada.cep.replace(/^(\d{5})(\d{3})$/, '$1-$2')
                                        : 'Não informado'}

                                </p>

                            </div>

                            {/* HISTÓRICO DE ACOMPANHAMENTO */}

                            <section className="min-w-0 border-t border-[#ead7c9] pt-5">

                                <div className="flex min-w-0 items-center gap-2">

                                    <Icone nome="history" classe="shrink-0 text-2xl text-[#78221b]" />

                                    <h3 className="min-w-0 font-titulo text-lg font-bold text-[#78221b] sm:text-xl">

                                        Histórico de acompanhamento

                                    </h3>

                                </div>

                                <p className="mt-2 text-xs leading-relaxed text-[#51453e]">

                                    Acompanhe as atualizações registradas para esta ocorrência.

                                </p>

                                {/* ERRO NO HISTÓRICO */}

                                {ocorrenciaSelecionada.erroHistorico ? (

                                    <div role="alert" className="mt-4 rounded-xl border border-[#dfc2ae] bg-[#f9f0e7] p-4 text-center">

                                        <Icone nome="error_outline" classe="text-3xl text-primaria" />

                                        <p className="mt-2 text-sm text-[#51453e]">

                                            Não foi possível consultar o histórico desta ocorrência.

                                        </p>

                                        <button type="button" onClick={tentarNovamente} className={`mt-3 cursor-pointer text-sm font-semibold text-primaria hover:underline ${focoClasse}`}>

                                            Tentar novamente

                                        </button>

                                    </div>

                                ) : ocorrenciaSelecionada.historicos.length === 0 ? (

                                    /* HISTÓRICO VAZIO */

                                    <div className="mt-4 rounded-xl border border-[#dfc2ae] bg-[#f9f0e7] p-4 text-center sm:p-5">

                                        <Icone nome="history" classe="text-3xl text-primaria" />

                                        <p className="mt-2 text-sm text-[#51453e]">

                                            Nenhuma atualização disponível no histórico.

                                        </p>

                                    </div>

                                ) : (

                                    /* LINHA DO TEMPO */

                                    <div className="mt-5 min-w-0 rounded-xl border border-[#dfc2ae] bg-[#f9f0e7] p-3 sm:p-5">

                                        <ol>

                                            {ocorrenciaSelecionada.historicos.map((historico, indice) => {

                                                const status = normalizarStatus(historico.status);

                                                const ultimo = indice === ocorrenciaSelecionada.historicos.length - 1;

                                                return (

                                                    <li key={`${historico.idHistorico ?? 'historico'}-${indice}`} className="relative flex min-w-0 gap-3 sm:gap-4">

                                                        {/* LINHA VERTICAL */}

                                                        {!ultimo && (

                                                            <div className="absolute top-10 bottom-0 left-5 w-px -translate-x-1/2 bg-[#c9a28d]" aria-hidden="true" />

                                                        )}

                                                        {/* ÍCONE DO STATUS */}

                                                        <div className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${estilosStatus[status]}`}>

                                                            <Icone nome={iconesStatus[status]} classe="text-xl" />

                                                        </div>

                                                        {/* INFORMAÇÕES DO HISTÓRICO */}

                                                        <div className={`min-w-0 flex-1 ${ultimo ? '' : 'pb-6'}`}>

                                                            <div className="flex min-w-0 flex-wrap items-center gap-2">

                                                                <h4 className="wrap-break-word text-sm font-bold text-[#78221b]">

                                                                    {status === 'Não informado'
                                                                        ? historico.status || 'Não informado'
                                                                        : status}

                                                                </h4>

                                                                {ultimo && (

                                                                    <span className="rounded-full bg-[#78221b] px-2.5 py-1 text-[10px] font-semibold text-white">

                                                                        Status atual

                                                                    </span>

                                                                )}

                                                            </div>

                                                            <p className="mt-1 text-xs text-[#51453e]">

                                                                {formatarData(historico.data)}

                                                            </p>

                                                            <p className="mt-2 wrap-break-word text-xs leading-relaxed text-[#51453e]">

                                                                Protocolo: {historico.protocolo || 'Não informado'}

                                                            </p>

                                                        </div>

                                                    </li>

                                                );

                                            })}

                                        </ol>

                                    </div>

                                )}

                            </section>

                        </div>

                        {/* RODAPÉ DO MODAL */}

                        <div className="flex shrink-0 justify-end border-t border-[#ead7c9] bg-[#fffaf4] px-4 py-4 sm:px-6">

                            <button type="button" onClick={() => setOcorrenciaSelecionada(null)} className={`w-full cursor-pointer rounded-full bg-primaria px-6 py-3 text-sm font-semibold transition-colors hover:bg-primaria-hover sm:w-auto ${focoClasse}`}>

                                <span className="text-white">
                                    Fechar
                                </span>

                            </button>

                        </div>

                    </section>

                </div>

            )}

        </main>
    );
}