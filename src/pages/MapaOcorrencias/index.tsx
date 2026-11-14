import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import Mapa, {
    type OcorrenciaMapa,
    type PrioridadeOcorrencia,
} from '../../components/Mapa/Mapa';

type FiltroPrioridade = 'todas' | PrioridadeOcorrencia;

const NOMES_PRIORIDADE: Record<PrioridadeOcorrencia, string> = {
    alta: 'Alta',
    media: 'Média',
    baixa: 'Baixa',
};

const CORES_PRIORIDADE: Record<PrioridadeOcorrencia, string> = {
    alta: '#b3261e',
    media: '#e99a3e',
    baixa: '#4caf50',
};

const ESTILOS_PRIORIDADE: Record<PrioridadeOcorrencia, string> = {
    alta: 'bg-[#f8d7d2] text-[#922c1d]',
    media: 'bg-[#ffebcf] text-[#96500c]',
    baixa: 'bg-[#4caf50] text-[#675143]',
};

export default function MapaOcorrencias() {
    // Inicialmente vazio.
    // Futuramente, receberá os registros da API Java.
    const [ocorrencias] = useState<OcorrenciaMapa[]>([]);

    const [busca, setBusca] = useState('');
    const [mostrarFiltros, setMostrarFiltros] = useState(false);
    const [filtroPrioridade, setFiltroPrioridade] =
        useState<FiltroPrioridade>('todas');
    const [filtroCategoria, setFiltroCategoria] = useState('todas');

    const [ocorrenciaSelecionada, setOcorrenciaSelecionada] =
        useState<OcorrenciaMapa | null>(null);

    const categorias = useMemo(() => {
        return [...new Set(
            ocorrencias.map((ocorrencia) => ocorrencia.categoria)
        )].sort((a, b) => a.localeCompare(b, 'pt-BR'));
    }, [ocorrencias]);

    const ocorrenciasFiltradas = useMemo(() => {
        const termo = busca.trim().toLocaleLowerCase('pt-BR');

        return ocorrencias.filter((ocorrencia) => {
            const correspondeBusca =
                termo === '' ||
                ocorrencia.categoria
                    .toLocaleLowerCase('pt-BR')
                    .includes(termo) ||
                ocorrencia.descricao
                    .toLocaleLowerCase('pt-BR')
                    .includes(termo) ||
                ocorrencia.endereco
                    .toLocaleLowerCase('pt-BR')
                    .includes(termo) ||
                ocorrencia.cidade
                    .toLocaleLowerCase('pt-BR')
                    .includes(termo) ||
                (ocorrencia.cep ?? '').includes(termo);

            const correspondePrioridade =
                filtroPrioridade === 'todas' ||
                ocorrencia.prioridade === filtroPrioridade;

            const correspondeCategoria =
                filtroCategoria === 'todas' ||
                ocorrencia.categoria === filtroCategoria;

            return (
                correspondeBusca &&
                correspondePrioridade &&
                correspondeCategoria
            );
        });
    }, [
        ocorrencias,
        busca,
        filtroPrioridade,
        filtroCategoria,
    ]);

    const ocorrenciaVisivel =
        ocorrenciaSelecionada &&
        ocorrenciasFiltradas.some(
            (ocorrencia) =>
                ocorrencia.id === ocorrenciaSelecionada.id
        )
            ? ocorrenciaSelecionada
            : null;

    function limparFiltros() {
        setBusca('');
        setFiltroPrioridade('todas');
        setFiltroCategoria('todas');
    }

    function selecionarOcorrencia(ocorrencia: OcorrenciaMapa) {
        setOcorrenciaSelecionada(ocorrencia);
    }

    return (
        <main className="min-h-screen w-full flex-1 bg-fundo font-corpo text-texto">
            {/* Cabeçalho */}
            <header className="border-b border-[#d8b9a8] bg-[#fffaf4] px-5 py-5 sm:px-8 lg:px-10">
                <h1 className="font-titulo text-3xl font-bold text-primaria sm:text-4xl">
                    Mapa de Ocorrências
                </h1>

                <nav
                    aria-label="Navegação estrutural"
                    className="mt-2 flex items-center gap-2 text-sm"
                >
                    <Link
                        to="/inicio"
                        className="text-[#6b4438] transition-colors hover:text-primaria"
                    >
                        Início
                    </Link>

                    <span
                        className="material-icons text-base text-primaria"
                        aria-hidden="true"
                    >
                        chevron_right
                    </span>

                    <span className="font-semibold text-primaria">
                        Mapa de Ocorrências
                    </span>
                </nav>
            </header>

            {/* Conteúdo */}
            <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-8 lg:px-10">
                {/* Apresentação */}
                <section className="mb-8">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#a34a37]">
                        Participação cidadã
                    </p>

                    <h2 className="font-titulo text-3xl font-bold text-primaria sm:text-4xl">
                        Explore as Ocorrências
                    </h2>

                    <p className="mt-2 max-w-3xl text-sm leading-relaxed text-texto-suave sm:text-base">
                        Visualize a distribuição das ocorrências urbanas
                        no estado de São Paulo, consulte suas prioridades
                        e acompanhe as solicitações registradas na
                        plataforma Polieus.
                    </p>

                    <div
                        className="mt-6 flex max-w-xl items-center gap-4"
                        aria-hidden="true"
                    >
                        <div className="h-px flex-1 bg-[#b77965]" />
                        <div className="h-2.5 w-2.5 rotate-45 bg-[#78221b]" />
                        <div className="h-px flex-1 bg-[#d8b9a8]" />
                    </div>
                </section>

                {/* Busca e filtros */}
                <section
                    className="mb-6"
                    aria-label="Busca e filtros do mapa"
                >
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <div className="relative min-w-0 flex-1">
                            <span
                                className="material-icons pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl text-primaria"
                                aria-hidden="true"
                            >
                                search
                            </span>

                            <input
                                type="search"
                                value={busca}
                                onChange={(event) =>
                                    setBusca(event.target.value)
                                }
                                placeholder="Buscar por cidade, endereço ou categoria..."
                                aria-label="Buscar ocorrências no mapa"
                                className="w-full rounded-xl border border-[#dfc2ae] bg-[#fffaf4] py-3.5 pl-12 pr-4 text-sm text-texto shadow-sm outline-none transition-colors placeholder:text-[#8d8179] focus:border-primaria focus:ring-2 focus:ring-primaria/15"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                setMostrarFiltros((atual) => !atual)
                            }
                            aria-expanded={mostrarFiltros}
                            aria-controls="filtros-mapa"
                            className={`flex items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold transition-colors ${
                                mostrarFiltros
                                    ? 'border-primaria bg-[#f0dfd4] text-primaria'
                                    : 'border-[#dfc2ae] bg-[#fffaf4] text-primaria hover:bg-[#f3e5d9]'
                            }`}
                        >
                            <span
                                className="material-icons text-xl"
                                aria-hidden="true"
                            >
                                filter_alt
                            </span>

                            Filtros

                            <span
                                className={`material-icons text-lg transition-transform duration-300 ${
                                    mostrarFiltros ? 'rotate-180' : ''
                                }`}
                                aria-hidden="true"
                            >
                                expand_more
                            </span>
                        </button>
                    </div>

                    {mostrarFiltros && (
                        <div
                            id="filtros-mapa"
                            className="mt-3 grid gap-4 rounded-xl border border-[#dfc2ae] bg-[#fffaf4] p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto]"
                        >
                            <div>
                                <label
                                    htmlFor="filtro-prioridade-mapa"
                                    className="mb-2 block text-sm font-semibold text-primaria"
                                >
                                    Prioridade
                                </label>

                                <select
                                    id="filtro-prioridade-mapa"
                                    value={filtroPrioridade}
                                    onChange={(event) =>
                                        setFiltroPrioridade(
                                            event.target.value as FiltroPrioridade
                                        )
                                    }
                                    className="w-full rounded-lg border border-[#dfc2ae] bg-white px-3 py-3 text-sm text-texto outline-none focus:border-primaria"
                                >
                                    <option value="todas">
                                        Todas as prioridades
                                    </option>
                                    <option value="alta">Alta</option>
                                    <option value="media">Média</option>
                                    <option value="baixa">Baixa</option>
                                </select>
                            </div>

                            <div>
                                <label
                                    htmlFor="filtro-categoria-mapa"
                                    className="mb-2 block text-sm font-semibold text-primaria"
                                >
                                    Categoria
                                </label>

                                <select
                                    id="filtro-categoria-mapa"
                                    value={filtroCategoria}
                                    onChange={(event) =>
                                        setFiltroCategoria(event.target.value)
                                    }
                                    className="w-full rounded-lg border border-[#dfc2ae] bg-white px-3 py-3 text-sm text-texto outline-none focus:border-primaria"
                                >
                                    <option value="todas">
                                        Todas as categorias
                                    </option>

                                    {categorias.map((categoria) => (
                                        <option
                                            key={categoria}
                                            value={categoria}
                                        >
                                            {categoria}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-end">
                                <button
                                    type="button"
                                    onClick={limparFiltros}
                                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#b77965] px-4 py-3 text-sm font-semibold text-primaria transition-colors hover:bg-[#f0dfd4]"
                                >
                                    <span
                                        className="material-icons text-lg"
                                        aria-hidden="true"
                                    >
                                        restart_alt
                                    </span>

                                    Limpar filtros
                                </button>
                            </div>
                        </div>
                    )}
                </section>

                {/* Legenda */}
                <section
                    className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#dfc2ae] bg-[#fffaf4] px-5 py-4 shadow-sm"
                    aria-label="Legenda das prioridades"
                >
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                        <span className="text-sm font-semibold text-primaria">
                            Prioridade:
                        </span>

                        {(
                            ['alta', 'media', 'baixa'] as const
                        ).map((prioridade) => (
                            <div
                                key={prioridade}
                                className="flex items-center gap-2"
                            >
                                <span
                                    className="h-3.5 w-3.5 rounded-full border border-white shadow-sm"
                                    style={{
                                        backgroundColor:
                                            CORES_PRIORIDADE[prioridade],
                                    }}
                                />

                                <span className="text-sm text-texto-suave">
                                    {NOMES_PRIORIDADE[prioridade]}
                                </span>
                            </div>
                        ))}
                    </div>

                    <p
                        className="text-sm font-semibold text-primaria"
                        role="status"
                    >
                        {ocorrenciasFiltradas.length}{' '}
                        {ocorrenciasFiltradas.length === 1
                            ? 'ocorrência encontrada'
                            : 'ocorrências encontradas'}
                    </p>
                </section>

                {/* Mapa e painel lateral */}
                <section
                    className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]"
                    aria-label="Visualização das ocorrências"
                >
                    {/* Mapa */}
                    <div className="min-w-0">
                        <Mapa
                            ocorrencias={ocorrenciasFiltradas}
                            ocorrenciaSelecionadaId={
                                ocorrenciaVisivel?.id ?? null
                            }
                            aoSelecionarOcorrencia={selecionarOcorrencia}
                            altura="600px"
                        />
                    </div>

                    {/* Painel lateral */}
                    <aside className="flex min-h-100 flex-col overflow-hidden rounded-2xl border border-[#dfc2ae] bg-[#fffaf4] shadow-sm lg:min-h-150">
                        <div className="border-b border-[#dfc2ae] bg-[#f0dfd4] px-5 py-5">
                            <div className="flex items-center gap-3">
                                <span
                                    className="material-icons text-2xl text-primaria"
                                    aria-hidden="true"
                                >
                                    location_on
                                </span>

                                <h3 className="font-titulo text-lg font-bold text-primaria">
                                    Detalhes da Ocorrência
                                </h3>
                            </div>

                            <p className="mt-2 text-xs text-texto-suave">
                                Selecione um marcador para consultar
                                as informações.
                            </p>
                        </div>

                        {ocorrenciaVisivel ? (
                            <div className="flex flex-1 flex-col gap-5 p-5">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <h4 className="font-titulo text-lg font-bold text-primaria">
                                        {ocorrenciaVisivel.categoria}
                                    </h4>

                                    <span
                                        className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                                            ESTILOS_PRIORIDADE[
                                                ocorrenciaVisivel.prioridade
                                            ]
                                        }`}
                                    >
                                        Prioridade{' '}
                                        {
                                            NOMES_PRIORIDADE[
                                                ocorrenciaVisivel.prioridade
                                            ]
                                        }
                                    </span>
                                </div>

                                <div>
                                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-texto-suave">
                                        Descrição
                                    </p>

                                    <p className="text-sm leading-relaxed text-texto">
                                        {ocorrenciaVisivel.descricao}
                                    </p>
                                </div>

                                <div className="border-t border-[#ead7c9] pt-4">
                                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-texto-suave">
                                        Endereço
                                    </p>

                                    <div className="flex items-start gap-2">
                                        <span
                                            className="material-icons text-lg text-primaria"
                                            aria-hidden="true"
                                        >
                                            place
                                        </span>

                                        <p className="text-sm leading-relaxed text-texto">
                                            {ocorrenciaVisivel.endereco}
                                            <br />
                                            {ocorrenciaVisivel.cidade} - SP
                                            {ocorrenciaVisivel.cep && (
                                                <>
                                                    <br />
                                                    CEP:{' '}
                                                    {ocorrenciaVisivel.cep}
                                                </>
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <div className="border-t border-[#ead7c9] pt-4">
                                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-texto-suave">
                                        Status
                                    </p>

                                    <div className="flex items-center gap-2">
                                        <span
                                            className="material-icons text-xl text-primaria"
                                            aria-hidden="true"
                                        >
                                            info
                                        </span>

                                        <span className="text-sm font-semibold text-texto">
                                            {ocorrenciaVisivel.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-auto border-t border-[#ead7c9] pt-4">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setOcorrenciaSelecionada(null)
                                        }
                                        className="w-full rounded-xl border border-primaria px-4 py-3 text-sm font-semibold text-primaria transition-colors hover:bg-[#f3e5d9]"
                                    >
                                        Fechar detalhes
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
                                <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#f3e5d9]">
                                    <span
                                        className="material-icons text-4xl text-primaria"
                                        aria-hidden="true"
                                    >
                                        map
                                    </span>
                                </div>

                                <h4 className="font-titulo text-lg font-semibold text-primaria">
                                    {ocorrencias.length === 0
                                        ? 'Nenhuma ocorrência registrada'
                                        : ocorrenciasFiltradas.length === 0
                                          ? 'Nenhum resultado encontrado'
                                          : 'Selecione uma ocorrência'}
                                </h4>

                                <p className="mt-3 max-w-xs text-sm leading-relaxed text-texto-suave">
                                    {ocorrencias.length === 0
                                        ? 'As ocorrências registradas na plataforma aparecerão aqui quando estiverem disponíveis.'
                                        : ocorrenciasFiltradas.length === 0
                                          ? 'Não encontramos ocorrências com os filtros selecionados.'
                                          : 'Clique em um dos marcadores do mapa para visualizar os detalhes da ocorrência.'}
                                </p>

                                {ocorrenciasFiltradas.length === 0 &&
                                    ocorrencias.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={limparFiltros}
                                            className="mt-5 rounded-full border border-primaria px-5 py-2.5 text-sm font-semibold text-primaria transition-colors hover:bg-[#f3e5d9]"
                                        >
                                            Limpar filtros
                                        </button>
                                    )}
                            </div>
                        )}
                    </aside>
                </section>

                {/* Informações adicionais */}
                <section className="mt-7 rounded-2xl border border-[#dfc2ae] bg-[#fffaf4] p-6 shadow-sm sm:p-8">
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#f3e5d9]">
                            <span
                                className="material-icons text-2xl text-primaria"
                                aria-hidden="true"
                            >
                                info
                            </span>
                        </div>

                        <div>
                            <h3 className="font-titulo text-lg font-bold text-primaria">
                                Sobre o Mapa de Ocorrências
                            </h3>

                            <p className="mt-2 text-sm leading-relaxed text-texto-suave">
                                O mapa permite visualizar a localização
                                das ocorrências urbanas registradas
                                no Polieus, contribuindo para o
                                acompanhamento das demandas da população
                                e para a transparência da gestão pública.
                            </p>

                            <p className="mt-3 text-sm leading-relaxed text-texto-suave">
                                Os marcadores são identificados por
                                prioridade e podem ser filtrados por
                                categoria ou localização. Ao selecionar
                                uma ocorrência, suas informações são
                                apresentadas no painel lateral.
                            </p>

                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}
