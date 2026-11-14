import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

type Periodo = '3' | '6' | '12';
type Aba = 'indicadores' | 'orcamento';

interface DadosMensais {
  mes: string;
  registradas: number;
  resolvidas: number;
}

interface Categoria {
  nome: string;
  quantidade: number;
  cor: string;
}

interface Intervencao {
  id: string;
  nome: string;
  unidade: string;
  materiais: number;
  maoDeObra: number;
  equipamentos: number;
  adicionais: number;
  descricao: string;
}

const dadosMensais: DadosMensais[] = [
  { mes: 'Dez', registradas: 115, resolvidas: 72 },
  { mes: 'Jan', registradas: 145, resolvidas: 90 },
  { mes: 'Fev', registradas: 172, resolvidas: 115 },
  { mes: 'Mar', registradas: 188, resolvidas: 132 },
  { mes: 'Abr', registradas: 210, resolvidas: 149 },
  { mes: 'Mai', registradas: 247, resolvidas: 177 },
  { mes: 'Jun', registradas: 283, resolvidas: 198 },
  { mes: 'Jul', registradas: 261, resolvidas: 204 },
  { mes: 'Ago', registradas: 296, resolvidas: 218 },
  { mes: 'Set', registradas: 310, resolvidas: 235 },
  { mes: 'Out', registradas: 324, resolvidas: 251 },
  { mes: 'Nov', registradas: 345, resolvidas: 274 },
];

const categorias: Categoria[] = [
  { nome: 'Iluminação', quantidade: 349, cor: '#638c98' },
  { nome: 'Saneamento', quantidade: 299, cor: '#b3261e' },
  { nome: 'Transporte', quantidade: 249, cor: '#f2a34a' },
  { nome: 'Infraestrutura', quantidade: 348, cor: '#c88b6c' },
];

const indicadores = [
  {
    titulo: 'Total de ocorrências',
    valor: '1.245',
    icone: 'assignment',
    cor: '#87221b',
  },
  {
    titulo: 'Resolvidas',
    valor: '872',
    icone: 'check_circle',
    cor: '#82945a',
  },
  {
    titulo: 'Não resolvidas',
    valor: '373',
    icone: 'schedule',
    cor: '#a33a26',
  },
  {
    titulo: 'Taxa de resolução',
    valor: '70%',
    icone: 'timer',
    cor: '#87221b',
  },
];

// Valores fictícios utilizados exclusivamente na demonstração.
const intervencoes: Intervencao[] = [
  {
    id: 'calcada',
    nome: 'Reparo de calçada',
    unidade: 'm²',
    materiais: 120,
    maoDeObra: 80,
    equipamentos: 30,
    adicionais: 20,
    descricao: 'Recuperação de calçadas danificadas.',
  },
  {
    id: 'iluminacao',
    nome: 'Manutenção de iluminação pública',
    unidade: 'ponto de iluminação',
    materiais: 350,
    maoDeObra: 180,
    equipamentos: 120,
    adicionais: 50,
    descricao: 'Substituição ou manutenção de componentes de iluminação.',
  },
  {
    id: 'buraco',
    nome: 'Reparo de buracos na via',
    unidade: 'm²',
    materiais: 160,
    maoDeObra: 95,
    equipamentos: 65,
    adicionais: 30,
    descricao: 'Recuperação pontual do pavimento urbano.',
  },
  {
    id: 'saneamento',
    nome: 'Manutenção de tubulação',
    unidade: 'metro linear',
    materiais: 280,
    maoDeObra: 190,
    equipamentos: 110,
    adicionais: 70,
    descricao: 'Manutenção de trechos de tubulações urbanas.',
  },
  {
    id: 'sinalizacao',
    nome: 'Manutenção de sinalização',
    unidade: 'unidade',
    materiais: 240,
    maoDeObra: 130,
    equipamentos: 60,
    adicionais: 20,
    descricao: 'Instalação ou recuperação de sinalização viária.',
  },
];

const formatarMoeda = (valor: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);

function DivisorGrego() {
  return (
    <div
      className="mt-6 flex max-w-xl items-center gap-4"
      aria-hidden="true"
    >
      <div className="h-px flex-1 bg-[#b77965]" />
      <div className="h-2.5 w-2.5 rotate-45 bg-[#78221b]" />
      <div className="h-px flex-1 bg-[#d8b9a8]" />
    </div>
  );
}

function GraficoCategorias() {
  const total = categorias.reduce(
    (soma, categoria) => soma + categoria.quantidade,
    0
  );

  let percentualAcumulado = 0;

  const partes = categorias.map((categoria) => {
    const inicio = percentualAcumulado;
    const percentual = (categoria.quantidade / total) * 100;

    percentualAcumulado += percentual;

    return `${categoria.cor} ${inicio}% ${percentualAcumulado}%`;
  });

  return (
    <div className="flex flex-col items-center gap-8 sm:flex-row">
      <div
        className="relative h-48 w-48 shrink-0 rounded-full"
        style={{
          background: `conic-gradient(${partes.join(', ')})`,
        }}
        role="img"
        aria-label="Distribuição demonstrativa de ocorrências por categoria"
      >
        <div className="absolute inset-9 flex flex-col items-center justify-center rounded-full bg-[#fffaf4]">
          <span className="font-titulo text-2xl font-bold text-primaria">
            1.245
          </span>

          <span className="text-xs text-texto-suave">
            Ocorrências
          </span>
        </div>
      </div>

      <div className="w-full space-y-4">
        {categorias.map((categoria) => {
          const percentual = Math.round(
            (categoria.quantidade / total) * 100
          );

          return (
            <div
              key={categoria.nome}
              className="flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: categoria.cor }}
                />

                <span className="text-sm text-texto">
                  {categoria.nome}
                </span>
              </div>

              <span className="text-sm font-semibold text-primaria">
                {percentual}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function GraficoEvolucao({
  dados,
}: {
  dados: DadosMensais[];
}) {
  const largura = 600;
  const altura = 250;
  const margemEsquerda = 42;
  const margemDireita = 18;
  const margemSuperior = 20;
  const margemInferior = 35;

  const larguraUtil =
    largura - margemEsquerda - margemDireita;

  const alturaUtil =
    altura - margemSuperior - margemInferior;

  const maiorValor = Math.max(
    100,
    ...dados.flatMap((item) => [
      item.registradas,
      item.resolvidas,
    ])
  );

  const limite = Math.ceil(maiorValor / 100) * 100;

  function coordenadaX(indice: number) {
    return (
      margemEsquerda +
      (indice / Math.max(dados.length - 1, 1)) * larguraUtil
    );
  }

  function coordenadaY(valor: number) {
    return (
      margemSuperior +
      alturaUtil -
      (valor / limite) * alturaUtil
    );
  }

  function gerarPontos(
    campo: 'registradas' | 'resolvidas'
  ) {
    return dados
      .map(
        (item, indice) =>
          `${coordenadaX(indice)},${coordenadaY(item[campo])}`
      )
      .join(' ');
  }

  const marcacoes = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-5 text-xs">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-primaria" />
          <span>Registradas</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#d7a17e]" />
          <span>Resolvidas</span>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${largura} ${altura}`}
          className="h-auto w-full min-w-100"
          role="img"
          aria-label="Gráfico demonstrativo da evolução mensal das ocorrências"
        >
          {marcacoes.map((marcacao) => {
            const valor = limite * marcacao;
            const y = coordenadaY(valor);

            return (
              <g key={marcacao}>
                <line
                  x1={margemEsquerda}
                  x2={largura - margemDireita}
                  y1={y}
                  y2={y}
                  stroke="#ead8ca"
                  strokeDasharray="4 5"
                />

                <text
                  x={margemEsquerda - 10}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="11"
                  fill="#77655d"
                >
                  {Math.round(valor)}
                </text>
              </g>
            );
          })}

          <polyline
            points={gerarPontos('registradas')}
            fill="none"
            stroke="#b3261e"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <polyline
            points={gerarPontos('resolvidas')}
            fill="none"
            stroke="#d7a17e"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {dados.map((item, indice) => (
            <g key={`${item.mes}-${indice}`}>
              <circle
                cx={coordenadaX(indice)}
                cy={coordenadaY(item.registradas)}
                r="4"
                fill="#b3261e"
              >
                <title>
                  {`${item.mes}: ${item.registradas} registradas`}
                </title>
              </circle>

              <circle
                cx={coordenadaX(indice)}
                cy={coordenadaY(item.resolvidas)}
                r="4"
                fill="#d7a17e"
              >
                <title>
                  {`${item.mes}: ${item.resolvidas} resolvidas`}
                </title>
              </circle>

              <text
                x={coordenadaX(indice)}
                y={altura - 10}
                textAnchor="middle"
                fontSize="11"
                fill="#77655d"
              >
                {item.mes}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

function EstimativaOrcamentaria() {
  const [intervencaoId, setIntervencaoId] =
    useState('calcada');

  const [quantidade, setQuantidade] = useState(10);

  const intervencao =
    intervencoes.find((item) => item.id === intervencaoId) ??
    intervencoes[0];

  const quantidadeValida =
    Number.isFinite(quantidade) && quantidade > 0
      ? quantidade
      : 0;

  const custos = useMemo(() => {
    const materiais =
      intervencao.materiais * quantidadeValida;

    const maoDeObra =
      intervencao.maoDeObra * quantidadeValida;

    const equipamentos =
      intervencao.equipamentos * quantidadeValida;

    const adicionais =
      intervencao.adicionais * quantidadeValida;

    return {
      materiais,
      maoDeObra,
      equipamentos,
      adicionais,
      total:
        materiais +
        maoDeObra +
        equipamentos +
        adicionais,
    };
  }, [intervencao, quantidadeValida]);

  const componentes = [
    {
      nome: 'Materiais',
      valor: custos.materiais,
      icone: 'inventory_2',
      descricao: 'Insumos necessários para a intervenção.',
    },
    {
      nome: 'Mão de obra',
      valor: custos.maoDeObra,
      icone: 'engineering',
      descricao: 'Estimativa dos serviços profissionais.',
    },
    {
      nome: 'Equipamentos',
      valor: custos.equipamentos,
      icone: 'construction',
      descricao: 'Máquinas e ferramentas utilizadas.',
    },
    {
      nome: 'Custos adicionais',
      valor: custos.adicionais,
      icone: 'receipt_long',
      descricao: 'Outras despesas previstas na simulação.',
    },
  ];

  return (
    <section
      className="relative space-y-6"
      aria-label="Estimativa orçamentária"
    >
      <div className="rounded-2xl border border-[#dfc2ae] bg-[#fffaf4] p-5 shadow-sm sm:p-8">
        <div className="mb-6 flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#f3e5d9] text-primaria">
            <span
              className="material-icons text-3xl"
              aria-hidden="true"
            >
              calculate
            </span>
          </div>

          <div>
            <h3 className="font-titulo text-xl font-bold text-primaria sm:text-2xl">
              Simulador de Custos
            </h3>

            <p className="mt-2 text-sm leading-relaxed text-texto-suave">
              Selecione uma intervenção urbana e informe a
              quantidade desejada para visualizar uma estimativa
              de seus custos.
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label
              htmlFor="tipoIntervencao"
              className="mb-2 block text-sm font-semibold text-texto"
            >
              Tipo de intervenção
            </label>

            <select
              id="tipoIntervencao"
              value={intervencaoId}
              onChange={(event) =>
                setIntervencaoId(event.target.value)
              }
              className="w-full rounded-xl border border-[#dfc2ae] bg-[#fffaf4] px-4 py-3 text-sm text-texto outline-none transition-colors focus:border-primaria"
            >
              {intervencoes.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="quantidadeIntervencao"
              className="mb-2 block text-sm font-semibold text-texto"
            >
              Quantidade ({intervencao.unidade})
            </label>

            <input
              id="quantidadeIntervencao"
              type="number"
              min="1"
              max="100000"
              step="1"
              value={quantidade}
              onChange={(event) => {
                const valor = Number(event.target.value);

                setQuantidade(
                  Number.isFinite(valor)
                    ? Math.min(
                        100000,
                        Math.max(0, Math.trunc(valor))
                      )
                    : 0
                );
              }}
              className="w-full rounded-xl border border-[#dfc2ae] bg-[#fffaf4] px-4 py-3 text-sm text-texto outline-none transition-colors focus:border-primaria"
            />
          </div>
        </div>

        <div className="mt-5 flex items-start gap-3 rounded-xl bg-fundo p-4">
          <span
            className="material-icons text-xl text-primaria"
            aria-hidden="true"
          >
            info
          </span>

          <p className="text-sm leading-relaxed text-texto-suave">
            {intervencao.descricao} Os valores utilizados
            nesta simulação são fictícios e servem apenas
            para demonstrar o funcionamento do cálculo.
          </p>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {componentes.map((componente) => (
          <article
            key={componente.nome}
            className="rounded-2xl border border-[#dfc2ae] bg-[#fffaf4] p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f3e5d9] text-primaria">
                <span
                  className="material-icons text-2xl"
                  aria-hidden="true"
                >
                  {componente.icone}
                </span>
              </div>

              <h4 className="font-titulo text-lg font-bold text-primaria">
                {componente.nome}
              </h4>
            </div>

            <p className="font-titulo text-2xl font-bold text-texto">
              {formatarMoeda(componente.valor)}
            </p>

            <p className="mt-2 text-sm text-texto-suave">
              {componente.descricao}
            </p>
          </article>
        ))}
      </div>

      <div className="rounded-2xl border border-[#b77965] bg-[#f3e5d9] p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span
                className="material-icons text-2xl text-primaria"
                aria-hidden="true"
              >
                account_balance_wallet
              </span>

              <h3 className="font-titulo text-xl font-bold text-primaria">
                Custo Total Estimado
              </h3>
            </div>

            <p className="text-sm text-texto-suave">
              {intervencao.nome} — {quantidadeValida}{' '}
              {intervencao.unidade}
            </p>
          </div>

          <div className="sm:text-right">
            <p
              className="font-titulo text-3xl font-bold text-primaria sm:text-4xl"
              aria-live="polite"
            >
              {formatarMoeda(custos.total)}
            </p>

            <p className="mt-2 text-xs text-texto-suave">
              Valor demonstrativo
            </p>
          </div>
        </div>

        <div className="mt-6 border-t border-[#d8b9a8] pt-5">
          <div className="grid gap-3 sm:grid-cols-2">
            {componentes.map((componente) => (
              <div
                key={componente.nome}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span className="text-texto-suave">
                  {componente.nome}
                </span>

                <span className="font-semibold text-texto">
                  {formatarMoeda(componente.valor)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#dfc2ae] bg-[#fffaf4] p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <span
            className="material-icons text-3xl text-primaria"
            aria-hidden="true"
          >
            verified_user
          </span>

          <div>
            <h3 className="font-titulo text-lg font-bold text-primaria">
              Transparência e Responsabilidade
            </h3>

            <p className="mt-3 text-sm leading-relaxed text-texto-suave">
              O Polieus busca tornar as informações sobre
              intervenções urbanas mais acessíveis,
              contribuindo para que os cidadãos compreendam
              os possíveis custos das melhorias solicitadas.
            </p>

            <p className="mt-3 text-sm leading-relaxed text-texto-suave">
              Este simulador não representa um orçamento
              oficial, cotação de fornecedores, disponibilidade
              de recursos públicos ou compromisso de execução.
              Os valores reais dependerão das características
              da intervenção e das informações fornecidas
              pelos órgãos responsáveis.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Transparencia() {
  const [periodo, setPeriodo] = useState<Periodo>('6');

  const [abaAtiva, setAbaAtiva] =
    useState<Aba>('indicadores');

  const dadosFiltrados = useMemo(() => {
    return dadosMensais.slice(-Number(periodo));
  }, [periodo]);

  return (
    <main className="min-h-screen w-full flex-1 bg-fundo font-corpo text-texto">
      <header className="border-b border-[#d8b9a8] bg-[#fffaf4] px-5 py-5 sm:px-8 lg:px-10">
        <h1 className="font-titulo text-3xl font-bold text-primaria sm:text-4xl">
          Transparência
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
            Transparência
          </span>
        </nav>
      </header>

      <div className="relative mx-auto w-full max-w-7xl overflow-hidden px-4 py-8 sm:px-8 lg:px-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 top-12 h-72 w-72 rounded-full border border-[#dfc2ae] opacity-40"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-14 top-22 h-56 w-56 rounded-full border border-[#dfc2ae] opacity-30"
        />

        <section className="relative mb-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#a34a37]">
            Dados abertos da plataforma
          </p>

          <h2 className="font-titulo text-3xl font-bold text-primaria sm:text-4xl">
            Transparência
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-texto-suave sm:text-base">
            Acompanhe os indicadores gerais do Polieus e
            explore estimativas orçamentárias de intervenções
            urbanas.
          </p>

          <DivisorGrego />
        </section>

        {/* Abas */}
        <div
          className="relative mb-8 flex flex-wrap gap-3"
          role="tablist"
          aria-label="Seções de transparência"
        >
          <button
            id="aba-indicadores"
            type="button"
            role="tab"
            aria-selected={abaAtiva === 'indicadores'}
            aria-controls="painel-indicadores"
            onClick={() => setAbaAtiva('indicadores')}
            className={`flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold transition-all duration-300 ${
              abaAtiva === 'indicadores'
                ? 'border-primaria bg-primaria text-white shadow-md'
                : 'border-[#dfc2ae] bg-[#fffaf4] text-primaria hover:bg-[#f3e5d9]'
            }`}
          >
            <span
              className="material-icons text-xl"
              aria-hidden="true"
            >
              bar_chart
            </span>
            Indicadores Gerais
          </button>

          <button
            id="aba-orcamento"
            type="button"
            role="tab"
            aria-selected={abaAtiva === 'orcamento'}
            aria-controls="painel-orcamento"
            onClick={() => setAbaAtiva('orcamento')}
            className={`flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold transition-all duration-300 ${
              abaAtiva === 'orcamento'
                ? 'border-primaria bg-primaria text-white shadow-md'
                : 'border-[#dfc2ae] bg-[#fffaf4] text-primaria hover:bg-[#f3e5d9]'
            }`}
          >
            <span
              className="material-icons text-xl"
              aria-hidden="true"
            >
              account_balance
            </span>
            Estimativa Orçamentária
          </button>
        </div>

        {/* Indicadores gerais */}
        <div
          id="painel-indicadores"
          role="tabpanel"
          aria-labelledby="aba-indicadores"
          hidden={abaAtiva !== 'indicadores'}
        >
          <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-titulo text-2xl font-bold text-primaria">
                Visão Geral das Ocorrências
              </h3>

              <p className="mt-1 text-sm text-texto-suave">
                Indicadores demonstrativos da plataforma.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span
                className="material-icons text-xl text-primaria"
                aria-hidden="true"
              >
                date_range
              </span>

              <label htmlFor="periodo" className="sr-only">
                Período do gráfico
              </label>

              <select
                id="periodo"
                value={periodo}
                onChange={(event) =>
                  setPeriodo(event.target.value as Periodo)
                }
                className="rounded-xl border border-[#dfc2ae] bg-[#fffaf4] px-4 py-3 text-sm font-semibold text-primaria outline-none focus:border-primaria"
              >
                <option value="3">Últimos 3 meses</option>
                <option value="6">Últimos 6 meses</option>
                <option value="12">Últimos 12 meses</option>
              </select>
            </div>
          </div>

          <section
            className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
            aria-label="Indicadores gerais"
          >
            {indicadores.map((indicador) => (
              <article
                key={indicador.titulo}
                className="flex items-center gap-4 rounded-xl border border-[#dfc2ae] bg-[#fffaf4] p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <div
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#f3e5d9]"
                  style={{ color: indicador.cor }}
                >
                  <span
                    className="material-icons text-3xl"
                    aria-hidden="true"
                  >
                    {indicador.icone}
                  </span>
                </div>

                <div>
                  <p className="font-titulo text-3xl font-bold text-primaria">
                    {indicador.valor}
                  </p>

                  <p className="mt-1 text-xs text-texto-suave sm:text-sm">
                    {indicador.titulo}
                  </p>
                </div>
              </article>
            ))}
          </section>

          <section
            className="grid items-stretch gap-6 xl:grid-cols-2"
            aria-label="Gráficos de transparência"
          >
            <article className="rounded-2xl border border-[#dfc2ae] bg-[#fffaf4] p-5 shadow-sm sm:p-7">
              <div className="mb-7 flex items-center gap-3">
                <span
                  className="material-icons text-2xl text-primaria"
                  aria-hidden="true"
                >
                  donut_large
                </span>

                <h3 className="font-titulo text-xl font-bold text-primaria">
                  Ocorrências por Categoria
                </h3>
              </div>

              <GraficoCategorias />
            </article>

            <article className="rounded-2xl border border-[#dfc2ae] bg-[#fffaf4] p-5 shadow-sm sm:p-7">
              <div className="mb-5 flex items-center gap-3">
                <span
                  className="material-icons text-2xl text-primaria"
                  aria-hidden="true"
                >
                  show_chart
                </span>

                <h3 className="font-titulo text-xl font-bold text-primaria">
                  Evolução no Período
                </h3>
              </div>

              <GraficoEvolucao dados={dadosFiltrados} />
            </article>
          </section>

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
                  Sobre os dados apresentados
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-texto-suave">
                  Esta página reúne indicadores sobre as
                  ocorrências registradas na plataforma,
                  permitindo acompanhar categorias, volumes
                  de solicitações e índices de resolução.
                </p>

                <p className="mt-3 text-sm leading-relaxed text-texto-suave">
                  Atualmente, os indicadores utilizam dados
                  demonstrativos. Após a integração com o
                  sistema de ocorrências, as informações
                  poderão ser atualizadas com base nos
                  registros reais do Polieus.
                </p>

                <p className="mt-3 text-sm leading-relaxed text-texto-suave">
                  Os dados apresentados são agregados e não
                  exibem informações pessoais dos cidadãos.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Estimativa orçamentária */}
        <div
          id="painel-orcamento"
          role="tabpanel"
          aria-labelledby="aba-orcamento"
          hidden={abaAtiva !== 'orcamento'}
        >
          <div className="mb-7">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#a34a37]">
              Planejamento e transparência
            </p>

            <h3 className="font-titulo text-2xl font-bold text-primaria sm:text-3xl">
              Estimativa de Custos das Intervenções
            </h3>

            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-texto-suave sm:text-base">
              Entenda como diferentes componentes podem
              influenciar o custo de uma intervenção urbana.
              Faça uma simulação e acompanhe o resultado
              detalhado.
            </p>
          </div>

          <EstimativaOrcamentaria />
        </div>
      </div>
    </main>
  );
}
