import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

type StatusOcorrencia =
  | 'Pendente'
  | 'Em análise'
  | 'Em andamento'
  | 'Resolvida';

interface Ocorrencia {
  id: number;
  protocolo: string;
  categoria: string;
  descricao: string;
  data: string;
  status: StatusOcorrencia;
  endereco: string;
  departamento: string;
}

const itensPorPagina = 5;

const estilosStatus: Record<StatusOcorrencia, string> = {
  Pendente: 'bg-[#e8ded5] text-[#554238]',
  'Em análise': 'bg-[#ffe0b2] text-[#9b510c]',
  'Em andamento': 'bg-[#f8c9bd] text-[#922c1d]',
  Resolvida: 'bg-[#dfe8c5] text-[#3e6029]',
};

const iconesCategoria: Record<string, string> = {
  Iluminação: 'lightbulb',
  Saneamento: 'water_drop',
  Transporte: 'directions_bus',
  Infraestrutura: 'construction',
  'Meio ambiente': 'eco',
};

function formatarData(data: string) {
  const [dia, mes, ano] = data.split('/');

  return new Date(
    Number(ano),
    Number(mes) - 1,
    Number(dia)
  ).getTime();
}

export default function MinhasOcorrencias() {
  // Inicialmente vazio.
  // Na integração com Java, será preenchido apenas
  // com as ocorrências do usuário autenticado.
  const [ocorrencias] = useState<Ocorrencia[]>([]);

  const [busca, setBusca] = useState('');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState('Todos');
  const [filtroCategoria, setFiltroCategoria] = useState('Todas');
  const [paginaAtual, setPaginaAtual] = useState(1);

  const [ocorrenciaSelecionada, setOcorrenciaSelecionada] =
    useState<Ocorrencia | null>(null);

  const categorias = useMemo(
    () => [...new Set(ocorrencias.map((item) => item.categoria))],
    [ocorrencias]
  );

  const ocorrenciasFiltradas = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase('pt-BR');

    return ocorrencias
      .filter((item) => {
        const correspondeBusca =
          !termo ||
          item.protocolo.toLocaleLowerCase('pt-BR').includes(termo) ||
          item.categoria.toLocaleLowerCase('pt-BR').includes(termo) ||
          item.descricao.toLocaleLowerCase('pt-BR').includes(termo);

        const correspondeStatus =
          filtroStatus === 'Todos' || item.status === filtroStatus;

        const correspondeCategoria =
          filtroCategoria === 'Todas' ||
          item.categoria === filtroCategoria;

        return (
          correspondeBusca &&
          correspondeStatus &&
          correspondeCategoria
        );
      })
      .sort((a, b) => formatarData(b.data) - formatarData(a.data));
  }, [ocorrencias, busca, filtroStatus, filtroCategoria]);

  const totalPaginas = Math.ceil(
    ocorrenciasFiltradas.length / itensPorPagina
  );

  const ocorrenciasPagina = ocorrenciasFiltradas.slice(
    (paginaAtual - 1) * itensPorPagina,
    paginaAtual * itensPorPagina
  );

  const inicio =
    ocorrenciasFiltradas.length === 0
      ? 0
      : (paginaAtual - 1) * itensPorPagina + 1;

  const fim = Math.min(
    paginaAtual * itensPorPagina,
    ocorrenciasFiltradas.length
  );

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

  function atualizarBusca(valor: string) {
    setBusca(valor);
    setPaginaAtual(1);
  }

  function atualizarStatus(valor: string) {
    setFiltroStatus(valor);
    setPaginaAtual(1);
  }

  function atualizarCategoria(valor: string) {
    setFiltroCategoria(valor);
    setPaginaAtual(1);
  }

  function limparFiltros() {
    setBusca('');
    setFiltroStatus('Todos');
    setFiltroCategoria('Todas');
    setPaginaAtual(1);
  }

  return (
    <main className="min-h-screen w-full flex-1 bg-fundo font-corpo text-texto">
      {/* Cabeçalho da página */}
      <header className="border-b border-[#d8b9a8] bg-[#fffaf4] px-5 py-5 sm:px-8 lg:px-10">
        <h1 className="font-titulo text-3xl font-bold text-[#78221b] sm:text-4xl">
          Minhas Ocorrências
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
            className="material-icons text-base text-[#78221b]"
            aria-hidden="true"
          >
            chevron_right
          </span>

          <span className="font-semibold text-[#78221b]">
            Minhas Ocorrências
          </span>
        </nav>
      </header>

      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-8 lg:px-10">
        {/* Título e descrição */}
        <section className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#a34a37]">
                Histórico de participação
              </p>

              <h2 className="font-titulo text-3xl font-bold text-[#78221b] sm:text-4xl">
                Minhas Ocorrências
              </h2>

              <p className="mt-2 text-sm text-texto-suave sm:text-base">
                Acompanhe o status das suas solicitações e consulte
                os registros realizados.
              </p>
            </div>

            <Link
              to="/registrar-ocorrencia"
              className="inline-flex items-center gap-2 rounded-full bg-primaria px-5 py-3 text-sm font-semibold transition-colors hover:bg-primaria-hover"
              style={{ color: '#ffffff' }}
            >
              <span
                className="material-icons text-xl"
                aria-hidden="true"
              >
                add_circle
              </span>
              Nova ocorrência
            </Link>
          </div>

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
          className="mb-7"
          aria-label="Busca e filtros de ocorrências"
        >
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative min-w-0 flex-1">
              <span
                className="material-icons pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl text-[#78221b]"
                aria-hidden="true"
              >
                search
              </span>

              <input
                type="search"
                value={busca}
                onChange={(event) => atualizarBusca(event.target.value)}
                placeholder="Buscar por protocolo, categoria ou descrição..."
                aria-label="Buscar minhas ocorrências"
                className="w-full rounded-xl border border-[#dfc2ae] bg-[#fffaf4] py-3.5 pl-12 pr-4 text-sm text-texto shadow-sm outline-none transition-colors placeholder:text-[#8d8179] focus:border-primaria focus:ring-2 focus:ring-primaria/15"
              />
            </div>

            <button
              type="button"
              onClick={() => setMostrarFiltros((atual) => !atual)}
              aria-expanded={mostrarFiltros}
              aria-controls="painel-filtros-ocorrencias"
              className={`flex items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold transition-all ${
                mostrarFiltros
                  ? 'border-primaria bg-[#f0dfd4] text-[#78221b]'
                  : 'border-[#dfc2ae] bg-[#fffaf4] text-[#78221b] hover:bg-[#f3e5d9]'
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
              id="painel-filtros-ocorrencias"
              className="mt-3 grid gap-4 rounded-xl border border-[#dfc2ae] bg-[#fffaf4] p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto]"
            >
              <div>
                <label
                  htmlFor="filtro-status"
                  className="mb-2 block text-sm font-semibold text-[#78221b]"
                >
                  Status
                </label>

                <select
                  id="filtro-status"
                  value={filtroStatus}
                  onChange={(event) =>
                    atualizarStatus(event.target.value)
                  }
                  className="w-full rounded-lg border border-[#dfc2ae] bg-white px-3 py-3 text-sm text-texto outline-none focus:border-primaria"
                >
                  <option value="Todos">Todos os status</option>
                  <option value="Pendente">Pendente</option>
                  <option value="Em análise">Em análise</option>
                  <option value="Em andamento">Em andamento</option>
                  <option value="Resolvida">Resolvida</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="filtro-categoria"
                  className="mb-2 block text-sm font-semibold text-[#78221b]"
                >
                  Categoria
                </label>

                <select
                  id="filtro-categoria"
                  value={filtroCategoria}
                  onChange={(event) =>
                    atualizarCategoria(event.target.value)
                  }
                  className="w-full rounded-lg border border-[#dfc2ae] bg-white px-3 py-3 text-sm text-texto outline-none focus:border-primaria"
                >
                  <option value="Todas">Todas as categorias</option>

                  {categorias.map((categoria) => (
                    <option key={categoria} value={categoria}>
                      {categoria}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={limparFiltros}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#b77965] px-4 py-3 text-sm font-semibold text-[#78221b] transition-colors hover:bg-[#f0dfd4]"
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

        {/* Histórico de ocorrências */}
        <section aria-label="Histórico das minhas ocorrências">
          <div className="overflow-hidden rounded-2xl border border-[#dfc2ae] bg-[#fffaf4] shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-195 border-collapse text-left">
                <thead className="bg-[#f0dfd4]">
                  <tr className="font-corpo text-sm font-bold text-[#54251e]">
                    <th scope="col" className="px-5 py-4">
                      Protocolo
                    </th>
                    <th scope="col" className="px-5 py-4">
                      Categoria
                    </th>
                    <th scope="col" className="px-5 py-4">
                      Descrição
                    </th>
                    <th scope="col" className="px-5 py-4">
                      Data do registro
                    </th>
                    <th scope="col" className="px-5 py-4">
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-5 py-4 text-center"
                    >
                      Ações
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {ocorrenciasPagina.map((ocorrencia) => (
                    <tr
                      key={ocorrencia.id}
                      className="border-t border-[#ead7c9] transition-colors hover:bg-[#f9eee5]"
                    >
                      <td className="whitespace-nowrap px-5 py-5 text-sm font-semibold text-[#78221b]">
                        {ocorrencia.protocolo}
                      </td>

                      <td className="px-5 py-5">
                        <div className="flex items-center gap-2 text-sm">
                          <span
                            className="material-icons text-xl text-[#78221b]"
                            aria-hidden="true"
                          >
                            {iconesCategoria[ocorrencia.categoria] ||
                              'assignment'}
                          </span>

                          <span>{ocorrencia.categoria}</span>
                        </div>
                      </td>

                      <td className="max-w-70 px-5 py-5 text-sm leading-relaxed text-texto">
                        {ocorrencia.descricao}
                      </td>

                      <td className="whitespace-nowrap px-5 py-5 text-sm text-texto">
                        {ocorrencia.data}
                      </td>

                      <td className="px-5 py-5">
                        <span
                          className={`inline-flex min-w-28 items-center justify-center rounded-full px-3 py-2 text-center text-xs font-semibold ${
                            estilosStatus[ocorrencia.status]
                          }`}
                        >
                          {ocorrencia.status}
                        </span>
                      </td>

                      <td className="px-5 py-5 text-center">
                        <button
                          type="button"
                          onClick={() =>
                            setOcorrenciaSelecionada(ocorrencia)
                          }
                          aria-label={`Visualizar ocorrência ${ocorrencia.protocolo}`}
                          title="Ver detalhes"
                          className="inline-flex h-10 w-12 items-center justify-center rounded-full border border-[#dfc2ae] text-[#78221b] transition-all hover:border-primaria hover:bg-[#f0dfd4]"
                        >
                          <span
                            className="material-icons text-xl"
                            aria-hidden="true"
                          >
                            visibility
                          </span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Estado vazio */}
            {ocorrenciasFiltradas.length === 0 && (
              <div className="flex flex-col items-center px-5 py-14 text-center">
                <span
                  className="material-icons mb-4 text-6xl text-primaria"
                  aria-hidden="true"
                >
                  assignment
                </span>

                <h3 className="font-titulo text-xl font-semibold text-primaria">
                  {ocorrencias.length === 0
                    ? 'Você ainda não registrou nenhuma ocorrência'
                    : 'Nenhuma ocorrência encontrada'}
                </h3>

                <p className="mt-3 max-w-md font-corpo text-sm text-texto-suave">
                  {ocorrencias.length === 0
                    ? 'Quando você registrar uma ocorrência, ela aparecerá aqui para que possa acompanhar seu andamento.'
                    : 'Nenhuma ocorrência corresponde à sua busca. Tente alterar os filtros.'}
                </p>

                {ocorrencias.length === 0 ? (
                  <Link
                    to="/registrar-ocorrencia"
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-primaria px-6 py-3 font-corpo text-sm font-semibold transition-colors hover:bg-primaria-hover"
                    style={{ color: '#ffffff' }}
                  >
                    <span
                      className="material-icons text-xl"
                      aria-hidden="true"
                    >
                      add_circle
                    </span>
                    Registrar primeira ocorrência
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={limparFiltros}
                    className="mt-6 rounded-full border border-primaria px-6 py-3 font-corpo text-sm font-semibold text-primaria transition-colors hover:bg-secundaria"
                  >
                    Limpar filtros
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Paginação */}
          {ocorrenciasFiltradas.length > 0 && (
            <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
              <p
                className="text-sm text-texto-suave"
                role="status"
              >
                Mostrando {inicio}–{fim} de{' '}
                {ocorrenciasFiltradas.length} ocorrências
              </p>

              <nav
                className="flex items-center gap-2"
                aria-label="Paginação de ocorrências"
              >
                <button
                  type="button"
                  onClick={() =>
                    setPaginaAtual((pagina) =>
                      Math.max(1, pagina - 1)
                    )
                  }
                  disabled={paginaAtual === 1}
                  aria-label="Página anterior"
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#dfc2ae] text-[#78221b] transition-colors hover:bg-[#f0dfd4] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span
                    className="material-icons"
                    aria-hidden="true"
                  >
                    chevron_left
                  </span>
                </button>

                {Array.from(
                  { length: totalPaginas },
                  (_, indice) => indice + 1
                ).map((pagina) => (
                  <button
                    key={pagina}
                    type="button"
                    onClick={() => setPaginaAtual(pagina)}
                    aria-label={`Ir para a página ${pagina}`}
                    aria-current={
                      paginaAtual === pagina ? 'page' : undefined
                    }
                    className={`flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-semibold transition-colors ${
                      paginaAtual === pagina
                        ? 'border-[#78221b] bg-[#78221b] text-white'
                        : 'border-[#dfc2ae] bg-[#fffaf4] text-[#78221b] hover:bg-[#f0dfd4]'
                    }`}
                  >
                    {pagina}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() =>
                    setPaginaAtual((pagina) =>
                      Math.min(totalPaginas, pagina + 1)
                    )
                  }
                  disabled={paginaAtual === totalPaginas}
                  aria-label="Próxima página"
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#dfc2ae] text-[#78221b] transition-colors hover:bg-[#f0dfd4] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span
                    className="material-icons"
                    aria-hidden="true"
                  >
                    chevron_right
                  </span>
                </button>
              </nav>
            </div>
          )}
        </section>
      </div>

      {/* Modal de detalhes */}
      {ocorrenciaSelecionada && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setOcorrenciaSelecionada(null);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-detalhes-ocorrencia"
            className="w-full max-w-xl overflow-hidden rounded-2xl border border-[#dfc2ae] bg-[#fffaf4] shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 bg-[#78221b] px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#f0cbb9]">
                  Detalhes da solicitação
                </p>

                <h2
                  id="titulo-detalhes-ocorrencia"
                  className="mt-1 font-titulo text-2xl font-bold text-white"
                >
                  Ocorrência {ocorrenciaSelecionada.protocolo}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setOcorrenciaSelecionada(null)}
                aria-label="Fechar detalhes"
                autoFocus
                className="flex h-9 w-9 items-center justify-center rounded-full text-white transition-colors hover:bg-white/15"
              >
                <span
                  className="material-icons"
                  aria-hidden="true"
                >
                  close
                </span>
              </button>
            </div>

            <div className="max-h-[70vh] space-y-5 overflow-y-auto p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="font-titulo text-lg font-semibold text-[#78221b]">
                  Informações do registro
                </span>

                <span
                  className={`rounded-full px-4 py-2 text-xs font-semibold ${
                    estilosStatus[ocorrenciaSelecionada.status]
                  }`}
                >
                  {ocorrenciaSelecionada.status}
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase text-texto-suave">
                    Protocolo
                  </p>
                  <p className="mt-1 text-sm font-semibold">
                    {ocorrenciaSelecionada.protocolo}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase text-texto-suave">
                    Data do registro
                  </p>
                  <p className="mt-1 text-sm">
                    {ocorrenciaSelecionada.data}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase text-texto-suave">
                    Categoria
                  </p>
                  <p className="mt-1 text-sm">
                    {ocorrenciaSelecionada.categoria}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase text-texto-suave">
                    Departamento
                  </p>
                  <p className="mt-1 text-sm">
                    {ocorrenciaSelecionada.departamento}
                  </p>
                </div>
              </div>

              <div className="border-t border-[#ead7c9] pt-4">
                <p className="text-xs font-semibold uppercase text-texto-suave">
                  Descrição
                </p>
                <p className="mt-2 text-sm leading-relaxed">
                  {ocorrenciaSelecionada.descricao}
                </p>
              </div>

              <div className="border-t border-[#ead7c9] pt-4">
                <p className="text-xs font-semibold uppercase text-texto-suave">
                  Localização
                </p>

                <p className="mt-2 flex items-start gap-2 text-sm">
                  <span
                    className="material-icons text-lg text-[#78221b]"
                    aria-hidden="true"
                  >
                    location_on
                  </span>

                  {ocorrenciaSelecionada.endereco}
                </p>
              </div>
            </div>

            <div className="flex justify-end border-t border-[#ead7c9] px-6 py-4">
              <button
                type="button"
                onClick={() => setOcorrenciaSelecionada(null)}
                className="rounded-full bg-primaria px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primaria-hover"
              >
                Fechar
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
