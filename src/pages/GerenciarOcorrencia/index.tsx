import { useCallback, useEffect, useMemo, useState } from 'react';
import fundoGerenciar from '../../img/fundo_gerenciarocorrencias.png';

type StatusOcorrencia = 'Pendente' | 'Em análise' | 'Em andamento' | 'Resolvida';
type PrioridadeOcorrencia = 'Alta' | 'Média' | 'Baixa';

interface HistoricoOcorrencia {
    data: string;
    descricao: string;
}

interface Ocorrencia {
    id: string;
    protocolo: string;
    categoria: string;
    descricao: string;
    cep: string;
    endereco: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
    departamento: string;
    status: StatusOcorrencia;
    prioridade: PrioridadeOcorrencia | null;
    dataCriacao: string;
    anexos: string[];
    historico: HistoricoOcorrencia[];
}

interface Filtros {
    busca: string;
    categoria: string;
    status: string;
    prioridade: string;
    periodo: string;
}

const filtrosIniciais: Filtros = {
    busca: '',
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

const statusDisponiveis: StatusOcorrencia[] = [
    'Pendente',
    'Em análise',
    'Em andamento',
    'Resolvida',
];

const prioridades: PrioridadeOcorrencia[] = ['Alta', 'Média', 'Baixa'];

const itensPorPagina = 5;

const campoClasse =
    'w-full min-w-0 rounded-lg border border-[#dec3b2] bg-[#fffaf6] px-3 py-2.5 text-sm text-texto outline-none transition-colors focus:border-primaria focus:ring-2 focus:ring-primaria/15';

const botaoClasse =
    'inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#b67b6b] px-4 py-2.5 text-sm font-semibold text-primaria transition-colors hover:bg-[#f7e8de] disabled:cursor-not-allowed disabled:opacity-50';

function Icone({ nome, classe = '' }: { nome: string; classe?: string }) {
    return <span className={`material-icons ${classe}`} aria-hidden="true">{nome}</span>;
}

function iconeCategoria(categoria: string) {
    const icones: Record<string, string> = {
        'Iluminação pública': 'lightbulb_outline',
        Saneamento: 'water_drop',
        'Transporte público': 'directions_bus',
        Infraestrutura: 'construction',
        'Limpeza urbana': 'delete_outline',
        Segurança: 'security',
        'Meio ambiente': 'park',
        Acessibilidade: 'accessible',
        Outros: 'description',
    };

    return icones[categoria] ?? 'description';
}

function formatarData(data: string) {
    const valor = new Date(data);
    return Number.isNaN(valor.getTime())
        ? 'Data indisponível'
        : valor.toLocaleDateString('pt-BR');
}

function formatarDataHora(data: string) {
    const valor = new Date(data);
    return Number.isNaN(valor.getTime())
        ? 'Data indisponível'
        : valor.toLocaleString('pt-BR', {
            dateStyle: 'short',
            timeStyle: 'short',
        });
}

function corStatus(status: StatusOcorrencia) {
    const cores: Record<StatusOcorrencia, string> = {
        Pendente: 'bg-[#f8d8d0] text-[#84261f]',
        'Em análise': 'bg-[#ffe0a5] text-[#704312]',
        'Em andamento': 'bg-[#d7e6f1] text-[#28546d]',
        Resolvida: 'bg-[#dce9d1] text-[#41642d]',
    };

    return cores[status];
}

function corPrioridade(prioridade: PrioridadeOcorrencia | null) {
    if (prioridade === 'Alta') return 'bg-red-600';
    if (prioridade === 'Média') return 'bg-orange-400';
    if (prioridade === 'Baixa') return 'bg-green-600';
    return 'bg-gray-400';
}

function estaNoPeriodo(data: string, periodo: string) {
    if (!periodo) return true;

    const criacao = new Date(data);
    if (Number.isNaN(criacao.getTime())) return false;

    const hoje = new Date();
    const inicio = new Date(hoje);

    if (periodo === '7') inicio.setDate(hoje.getDate() - 7);
    if (periodo === '30') inicio.setDate(hoje.getDate() - 30);
    if (periodo === '90') inicio.setDate(hoje.getDate() - 90);

    return criacao >= inicio && criacao <= hoje;
}

async function consultarOcorrencias(): Promise<Ocorrencia[]> {
    return [];
}

async function atualizarOcorrencia(
    _id: string,
    _alteracoes: Partial<Pick<Ocorrencia, 'status' | 'prioridade' | 'departamento'>>
): Promise<boolean> {
    return false;
}

function Indicador({
    icone,
    titulo,
    valor,
    cor,
}: {
    icone: string;
    titulo: string;
    valor: number;
    cor?: string;
}) {
    return (
        <article className="flex items-center gap-4 rounded-xl border border-[#e2c5b5] bg-[#fffaf6]/90 px-5 py-4 shadow-sm">
            <div className={`flex h-13 w-13 shrink-0 items-center justify-center rounded-full ${cor ?? 'bg-primaria'} text-white`}>
                <Icone nome={icone} classe="text-3xl" />
            </div>

            <div>
                <p className="font-titulo text-3xl font-bold text-[#75211b]">
                    {valor.toLocaleString('pt-BR')}
                </p>
                <p className="text-sm text-texto-suave">{titulo}</p>
            </div>
        </article>
    );
}

export default function GerenciarOcorrencias() {
    const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');
    const [filtros, setFiltros] = useState<Filtros>(filtrosIniciais);
    const [filtrosAplicados, setFiltrosAplicados] = useState<Filtros>(filtrosIniciais);
    const [ordenacao, setOrdenacao] = useState('recentes');
    const [pagina, setPagina] = useState(1);
    const [selecionadaId, setSelecionadaId] = useState<string | null>(null);
    const [novoStatus, setNovoStatus] = useState<StatusOcorrencia>('Pendente');
    const [salvando, setSalvando] = useState(false);
    const [mensagem, setMensagem] = useState('');

    const carregarOcorrencias = useCallback(async () => {
        try {
            const registros = await consultarOcorrencias();
            setOcorrencias(registros);
            setErro('');
        } catch {
            setErro('Não foi possível consultar as ocorrências.');
        } finally {
            setCarregando(false);
        }
    }, []);

    useEffect(() => {
        void carregarOcorrencias();
    }, [carregarOcorrencias]);

    const indicadores = useMemo(() => ({
        total: ocorrencias.length,
        resolvidas: ocorrencias.filter((item) => item.status === 'Resolvida').length,
        analise: ocorrencias.filter((item) => item.status === 'Em análise').length,
        pendentes: ocorrencias.filter((item) => item.status === 'Pendente').length,
    }), [ocorrencias]);

    const ocorrenciasFiltradas = useMemo(() => {
        const busca = filtrosAplicados.busca.trim().toLocaleLowerCase('pt-BR');

        const resultado = ocorrencias.filter((item) => {
            const texto = [
                item.protocolo,
                item.descricao,
                item.endereco,
                item.bairro,
                item.cidade,
                item.categoria,
            ].join(' ').toLocaleLowerCase('pt-BR');

            return (
                (!busca || texto.includes(busca)) &&
                (!filtrosAplicados.categoria || item.categoria === filtrosAplicados.categoria) &&
                (!filtrosAplicados.status || item.status === filtrosAplicados.status) &&
                (!filtrosAplicados.prioridade || item.prioridade === filtrosAplicados.prioridade) &&
                estaNoPeriodo(item.dataCriacao, filtrosAplicados.periodo)
            );
        });

        return resultado.sort((a, b) => {
            if (ordenacao === 'antigas') {
                return new Date(a.dataCriacao).getTime() - new Date(b.dataCriacao).getTime();
            }

            if (ordenacao === 'prioridade') {
                const pesos: Record<PrioridadeOcorrencia, number> = {
                    Alta: 3,
                    Média: 2,
                    Baixa: 1,
                };

                return (b.prioridade ? pesos[b.prioridade] : 0) -
                    (a.prioridade ? pesos[a.prioridade] : 0);
            }

            return new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime();
        });
    }, [ocorrencias, filtrosAplicados, ordenacao]);

    const totalPaginas = Math.max(1, Math.ceil(ocorrenciasFiltradas.length / itensPorPagina));

    const ocorrenciasPagina = ocorrenciasFiltradas.slice(
        (pagina - 1) * itensPorPagina,
        pagina * itensPorPagina
    );

    const selecionada = ocorrencias.find((item) => item.id === selecionadaId) ?? null;

    const atualizarFiltro = (campo: keyof Filtros, valor: string) => {
        setFiltros((anterior) => ({ ...anterior, [campo]: valor }));
    };

    const aplicarFiltros = () => {
        setFiltrosAplicados({ ...filtros });
        setPagina(1);
        setSelecionadaId(null);
    };

    const limparFiltros = () => {
        setFiltros(filtrosIniciais);
        setFiltrosAplicados(filtrosIniciais);
        setPagina(1);
        setSelecionadaId(null);
    };

    const selecionarOcorrencia = (ocorrencia: Ocorrencia) => {
        setSelecionadaId(ocorrencia.id);
        setNovoStatus(ocorrencia.status);
        setMensagem('');
    };

    const salvarStatus = async (status: StatusOcorrencia) => {
        if (!selecionada) return;

        setSalvando(true);
        setMensagem('');

        try {
            const atualizado = await atualizarOcorrencia(selecionada.id, { status });

            if (!atualizado) {
                return;
            }

            await carregarOcorrencias();
            setMensagem('Status atualizado com sucesso.');
        } catch {
            setMensagem('Não foi possível atualizar a ocorrência.');
        } finally {
            setSalvando(false);
        }
    };

    return (
        <main className="min-h-screen w-full bg-fundo font-corpo text-texto">
            <div
                className="relative border-b border-[#e3c8b7] bg-cover bg-top bg-no-repeat"
                style={{ backgroundImage: `linear-gradient(90deg, rgba(255,249,242,0.96) 0%, rgba(255,249,242,0.80) 45%, rgba(255,249,242,0.22) 100%), url(${fundoGerenciar})` }}
            >
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
                            <span className="text-sm font-semibold">Administrador</span>
                        </div>
                    </div>

                    <div className="mt-7">
                        <h1 className="font-titulo text-3xl font-bold text-[#75211b] sm:text-4xl lg:text-5xl">
                            Gerenciar Ocorrências
                        </h1>
                        <p className="mt-2 max-w-3xl text-sm text-texto sm:text-base">
                            Consulte, analise, atualize e encaminhe as ocorrências registradas na plataforma.
                        </p>
                    </div>

                    <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <Indicador icone="description" titulo="Total de ocorrências" valor={indicadores.total} />
                        <Indicador icone="check_circle" titulo="Resolvidas" valor={indicadores.resolvidas} cor="bg-[#507443]" />
                        <Indicador icone="schedule" titulo="Em análise" valor={indicadores.analise} />
                        <Indicador icone="warning" titulo="Pendentes" valor={indicadores.pendentes} />
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-400 space-y-4 px-5 py-6 sm:px-8 lg:px-10">
                <section className="rounded-xl border border-[#dfc2ae] bg-[#fffaf6] p-5 shadow-sm">
                    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                        <h2 className="flex items-center gap-2 font-titulo text-xl font-bold text-[#78221b]">
                            <Icone nome="filter_alt" classe="text-2xl" />
                            Filtrar Ocorrências
                        </h2>

                        <button
                            type="button"
                            onClick={limparFiltros}
                            className="flex cursor-pointer items-center gap-1 text-sm font-semibold text-primaria hover:underline"
                        >
                            <Icone nome="restart_alt" classe="text-xl" />
                            Limpar filtros
                        </button>
                    </div>

                    <form
                        onSubmit={(evento) => {
                            evento.preventDefault();
                            aplicarFiltros();
                        }}
                        className="grid gap-4 md:grid-cols-2 xl:grid-cols-[2fr_1fr_1fr_1fr_1.2fr_auto]"
                    >
                        <div>
                            <label htmlFor="busca-ocorrencia" className="mb-2 block text-xs font-semibold text-[#75211b]">
                                Buscar ocorrência
                            </label>
                            <input
                                id="busca-ocorrencia"
                                type="search"
                                value={filtros.busca}
                                onChange={(evento) => atualizarFiltro('busca', evento.target.value)}
                                placeholder="Protocolo, descrição ou local..."
                                className={campoClasse}
                            />
                        </div>

                        <div>
                            <label htmlFor="categoria-filtro" className="mb-2 block text-xs font-semibold text-[#75211b]">
                                Categoria
                            </label>
                            <select id="categoria-filtro" value={filtros.categoria} onChange={(evento) => atualizarFiltro('categoria', evento.target.value)} className={campoClasse}>
                                <option value="">Todas</option>
                                {categorias.map((categoria) => (
                                    <option key={categoria} value={categoria}>{categoria}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="status-filtro" className="mb-2 block text-xs font-semibold text-[#75211b]">
                                Status
                            </label>
                            <select id="status-filtro" value={filtros.status} onChange={(evento) => atualizarFiltro('status', evento.target.value)} className={campoClasse}>
                                <option value="">Todos</option>
                                {statusDisponiveis.map((status) => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="prioridade-filtro" className="mb-2 block text-xs font-semibold text-[#75211b]">
                                Prioridade
                            </label>
                            <select id="prioridade-filtro" value={filtros.prioridade} onChange={(evento) => atualizarFiltro('prioridade', evento.target.value)} className={campoClasse}>
                                <option value="">Todas</option>
                                {prioridades.map((prioridade) => (
                                    <option key={prioridade} value={prioridade}>{prioridade}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="periodo-filtro" className="mb-2 block text-xs font-semibold text-[#75211b]">
                                Período
                            </label>
                            <select id="periodo-filtro" value={filtros.periodo} onChange={(evento) => atualizarFiltro('periodo', evento.target.value)} className={campoClasse}>
                                <option value="">Todo o período</option>
                                <option value="7">Últimos 7 dias</option>
                                <option value="30">Últimos 30 dias</option>
                                <option value="90">Últimos 90 dias</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            className="flex cursor-pointer items-center justify-center gap-2 self-end rounded-lg bg-primaria px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primaria-hover"
                        >
                            <Icone nome="filter_alt" classe="text-xl" />
                            Filtrar
                        </button>
                    </form>
                </section>

                {erro && (
                    <div role="alert" className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-800">
                        {erro}
                    </div>
                )}

                <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
                    <section className="min-w-0 rounded-xl border border-[#dfc2ae] bg-[#fffaf6] p-4 shadow-sm sm:p-5">
                        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                            <h2 className="flex items-center gap-2 font-titulo text-xl font-bold text-[#78221b]">
                                <Icone nome="format_list_bulleted" classe="text-2xl" />
                                Ocorrências ({ocorrenciasFiltradas.length.toLocaleString('pt-BR')})
                            </h2>

                            <div className="flex items-center gap-2">
                                <label htmlFor="ordenacao" className="text-xs text-texto-suave">
                                    Ordenar por:
                                </label>
                                <select
                                    id="ordenacao"
                                    value={ordenacao}
                                    onChange={(evento) => {
                                        setOrdenacao(evento.target.value);
                                        setPagina(1);
                                    }}
                                    className="rounded-lg border border-[#dec3b2] bg-[#fffaf6] px-2 py-2 text-xs outline-none focus:border-primaria"
                                >
                                    <option value="recentes">Data mais recente</option>
                                    <option value="antigas">Data mais antiga</option>
                                    <option value="prioridade">Maior prioridade</option>
                                </select>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-160 text-left text-xs">
                                <thead className="bg-[#f5e9e0] text-[#75211b]">
                                    <tr>
                                        <th scope="col" className="rounded-l-lg px-3 py-3">Protocolo</th>
                                        <th scope="col" className="px-3 py-3">Categoria</th>
                                        <th scope="col" className="px-3 py-3">Localização</th>
                                        <th scope="col" className="px-3 py-3">Prioridade</th>
                                        <th scope="col" className="px-3 py-3">Status</th>
                                        <th scope="col" className="px-3 py-3">Data</th>
                                        <th scope="col" className="rounded-r-lg px-3 py-3 text-center">Ações</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {ocorrenciasPagina.map((ocorrencia) => (
                                        <tr
                                            key={ocorrencia.id}
                                            className={`border-b border-[#ead8ca] ${selecionadaId === ocorrencia.id ? 'bg-[#f1d6cb]' : 'hover:bg-[#fbf1e9]'}`}
                                        >
                                            <td className="px-3 py-3 font-bold">{ocorrencia.protocolo}</td>
                                            <td className="px-3 py-3">
                                                <div className="flex items-center gap-2">
                                                    <Icone nome={iconeCategoria(ocorrencia.categoria)} classe="text-xl text-primaria" />
                                                    {ocorrencia.categoria}
                                                </div>
                                            </td>
                                            <td className="px-3 py-3">{ocorrencia.bairro}</td>
                                            <td className="px-3 py-3">
                                                <div className="flex items-center gap-2">
                                                    <span className={`h-2.5 w-2.5 rounded-full ${corPrioridade(ocorrencia.prioridade)}`} />
                                                    {ocorrencia.prioridade ?? 'Não definida'}
                                                </div>
                                            </td>
                                            <td className="px-3 py-3">
                                                <span className={`inline-block whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${corStatus(ocorrencia.status)}`}>
                                                    {ocorrencia.status}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3 whitespace-nowrap">{formatarData(ocorrencia.dataCriacao)}</td>
                                            <td className="px-3 py-3 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => selecionarOcorrencia(ocorrencia)}
                                                    aria-label={`Visualizar ocorrência ${ocorrencia.protocolo}`}
                                                    className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-[#cda998] px-2 py-1 text-primaria hover:bg-[#f4e2d6]"
                                                >
                                                    <Icone nome="visibility" classe="text-xl" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {!carregando && ocorrenciasFiltradas.length === 0 && (
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

                            {carregando && (
                                <p className="py-12 text-center text-sm text-texto-suave">
                                    Carregando ocorrências...
                                </p>
                            )}
                        </div>

                        {ocorrenciasFiltradas.length > itensPorPagina && (
                            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                                <button type="button" disabled={pagina === 1} onClick={() => setPagina((atual) => atual - 1)} className={botaoClasse} aria-label="Página anterior">
                                    <Icone nome="chevron_left" />
                                </button>

                                {Array.from({ length: totalPaginas }, (_, indice) => indice + 1).map((numero) => (
                                    <button
                                        key={numero}
                                        type="button"
                                        onClick={() => setPagina(numero)}
                                        aria-label={`Página ${numero}`}
                                        aria-current={pagina === numero ? 'page' : undefined}
                                        className={`h-10 min-w-10 cursor-pointer rounded-lg border px-2 text-sm font-semibold ${pagina === numero ? 'border-primaria bg-primaria text-white' : 'border-[#dec3b2] text-[#78221b] hover:bg-[#f5e9e0]'}`}
                                    >
                                        {numero}
                                    </button>
                                ))}

                                <button type="button" disabled={pagina === totalPaginas} onClick={() => setPagina((atual) => atual + 1)} className={botaoClasse} aria-label="Próxima página">
                                    <Icone nome="chevron_right" />
                                </button>
                            </div>
                        )}
                    </section>

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
                                <div className="flex items-start justify-between gap-3 border-b border-[#e5cdbd] pb-4">
                                    <h2 className="flex items-center gap-2 font-titulo text-xl font-bold text-[#78221b]">
                                        <Icone nome="description" classe="text-2xl" />
                                        Ocorrência {selecionada.protocolo}
                                    </h2>

                                    <button type="button" onClick={() => setSelecionadaId(null)} aria-label="Fechar detalhes" className="cursor-pointer text-primaria hover:opacity-70">
                                        <Icone nome="close" />
                                    </button>
                                </div>

                                <div className="mt-4 grid gap-4 border-b border-[#e5cdbd] pb-4 sm:grid-cols-3">
                                    <div>
                                        <p className="text-xs font-bold text-[#78221b]">Categoria</p>
                                        <p className="mt-1 text-sm">{selecionada.categoria}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-[#78221b]">Localização</p>
                                        <p className="mt-1 text-sm">{selecionada.bairro}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-[#78221b]">Prioridade</p>
                                        <p className="mt-1 text-sm">{selecionada.prioridade ?? 'Não definida'}</p>
                                    </div>
                                </div>

                                <section className="mt-4 rounded-lg border border-[#ead5c7] p-4">
                                    <h3 className="flex items-center gap-2 text-sm font-bold text-[#78221b]">
                                        <Icone nome="description" classe="text-xl" />
                                        Descrição
                                    </h3>
                                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-texto">
                                        {selecionada.descricao}
                                    </p>
                                </section>

                                <section className="mt-4 rounded-lg border border-[#ead5c7] p-4">
                                    <h3 className="flex items-center gap-2 text-sm font-bold text-[#78221b]">
                                        <Icone nome="location_on" classe="text-xl" />
                                        Endereço
                                    </h3>
                                    <p className="mt-2 text-sm leading-relaxed">
                                        {selecionada.endereco}, {selecionada.numero}
                                        {selecionada.complemento ? ` — ${selecionada.complemento}` : ''}
                                        <br />
                                        {selecionada.bairro} — {selecionada.cidade}/{selecionada.estado}
                                        <br />
                                        CEP: {selecionada.cep}
                                    </p>
                                </section>

                                <section className="mt-4">
                                    <h3 className="flex items-center gap-2 text-sm font-bold text-[#78221b]">
                                        <Icone nome="attach_file" classe="text-xl" />
                                        Anexos ({selecionada.anexos.length})
                                    </h3>

                                    {selecionada.anexos.length === 0 ? (
                                        <p className="mt-2 text-xs text-texto-suave">
                                            Nenhum anexo disponível.
                                        </p>
                                    ) : (
                                        <div className="mt-3 grid grid-cols-2 gap-3">
                                            {selecionada.anexos.map((anexo, indice) => (
                                                <a key={`${anexo}-${indice}`} href={anexo} target="_blank" rel="noreferrer" className="overflow-hidden rounded-lg border border-[#ead5c7]">
                                                    <img src={anexo} alt={`Anexo ${indice + 1} da ocorrência`} className="h-28 w-full object-cover" />
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </section>

                                <section className="mt-5">
                                    <h3 className="flex items-center gap-2 text-sm font-bold text-[#78221b]">
                                        <Icone nome="history" classe="text-xl" />
                                        Histórico de Atualizações
                                    </h3>

                                    {selecionada.historico.length === 0 ? (
                                        <p className="mt-2 text-xs text-texto-suave">
                                            Nenhuma atualização registrada.
                                        </p>
                                    ) : (
                                        <ol className="mt-3 space-y-3 border-l-2 border-[#d7b4a3] pl-4">
                                            {selecionada.historico.map((registro, indice) => (
                                                <li key={`${registro.data}-${indice}`} className="relative text-xs leading-relaxed">
                                                    <span className="absolute -left-5.75 top-1 h-3 w-3 rounded-full bg-primaria" />
                                                    <strong>{formatarDataHora(registro.data)}</strong>
                                                    <span> — {registro.descricao}</span>
                                                </li>
                                            ))}
                                        </ol>
                                    )}
                                </section>

                                <section className="mt-5 rounded-lg border border-[#ead5c7] p-4">
                                    <label htmlFor="novo-status" className="mb-2 block text-sm font-bold text-[#78221b]">
                                        Atualizar Status
                                    </label>

                                    <select
                                        id="novo-status"
                                        value={novoStatus}
                                        onChange={(evento) => setNovoStatus(evento.target.value as StatusOcorrencia)}
                                        className={campoClasse}
                                    >
                                        {statusDisponiveis.map((status) => (
                                            <option key={status} value={status}>{status}</option>
                                        ))}
                                    </select>

                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            disabled={salvando}
                                            onClick={() => void salvarStatus(novoStatus)}
                                            className={botaoClasse}
                                        >
                                            <Icone nome="edit" classe="text-lg" />
                                            Atualizar Status
                                        </button>

                                        <button
                                            type="button"
                                            disabled={salvando}
                                            onClick={() => void salvarStatus('Resolvida')}
                                            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-primaria px-4 py-2.5 text-sm font-semibold text-white hover:bg-primaria-hover disabled:opacity-50"
                                        >
                                            <Icone nome="check" classe="text-lg" />
                                            Resolver Ocorrência
                                        </button>
                                    </div>

                                    <p className="mt-3 text-xs text-texto-suave">
                                        Departamento: {selecionada.departamento}
                                    </p>

                                    {mensagem && (
                                        <p role="status" className="mt-3 text-xs font-semibold text-[#78221b]">
                                            {mensagem}
                                        </p>
                                    )}
                                </section>
                            </div>
                        )}
                    </aside>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 text-xs text-texto-suave">
                    <p>
                        Exibindo {ocorrenciasFiltradas.length === 0 ? 0 : (pagina - 1) * itensPorPagina + 1}
                        {' '}a {Math.min(pagina * itensPorPagina, ocorrenciasFiltradas.length)}
                        {' '}de {ocorrenciasFiltradas.length} ocorrências
                    </p>

                    <button
                        type="button"
                        onClick={() => {
                            setCarregando(true);
                            void carregarOcorrencias();
                        }}
                        className="flex cursor-pointer items-center gap-2 font-semibold text-primaria hover:underline"
                    >
                        <Icone nome="refresh" classe="text-lg" />
                        Atualizar lista
                    </button>
                </div>
            </div>
        </main>
    );
}
