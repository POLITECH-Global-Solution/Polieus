import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { listarOcorrencias, type Ocorrencia } from '../../services/ocorrenciaService';
import { listarHistoricos, type Historico } from '../../services/historicoService';

type Periodo = '3' | '6' | '12';
type Aba = 'indicadores' | 'orcamento';

type StatusOcorrencia =
    | 'Pendente'
    | 'Em análise'
    | 'Em andamento'
    | 'Concluído'
    | 'Não informado';

interface OcorrenciaTransparencia extends Ocorrencia {
    status?: StatusOcorrencia;
    data?: string;
    dataConclusao?: string;
}

interface DadosMensais {
    mes: string;
    registradas: number;
    concluidas: number;
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

// CONSTANTES

const CORES_CATEGORIAS = [
    '#638c98',
    '#b3261e',
    '#f2a34a',
    '#c88b6c',
    '#82945a',
    '#9879a4',
    '#b77965',
    '#84756a',
];

const STATUS_NAO_CONCLUIDOS: StatusOcorrencia[] = [
    'Pendente',
    'Em análise',
    'Em andamento',
];

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

// ==================================================
// FUNÇÕES AUXILIARES
// ==================================================

const formatarMoeda = (valor: number) =>
    new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(valor);

function normalizarTexto(valor?: string) {
    return (valor ?? '')
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
}

// PADRONIZAÇÃO DOS STATUS

function normalizarStatus(status?: string): StatusOcorrencia {
    const valor = normalizarTexto(status)
        .replace(/_/g, ' ')
        .trim();

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

// CONVERTER DATA

function converterData(valor?: string): Date | null {
    if (!valor) return null;

    const brasileira = valor.match(/^(\d{2})[/-](\d{2})[/-](\d{4})$/);
    const iso = valor.match(/^(\d{4})-(\d{2})-(\d{2})(?:T.*)?$/);

    if (!brasileira && !iso) return null;

    const ano = Number(brasileira ? brasileira[3] : iso![1]);
    const mes = Number(brasileira ? brasileira[2] : iso![2]);
    const dia = Number(brasileira ? brasileira[1] : iso![3]);

    const data = new Date(ano, mes - 1, dia);

    if (
        data.getFullYear() !== ano ||
        data.getMonth() !== mes - 1 ||
        data.getDate() !== dia
    ) return null;

    return data;
}

// INTEGRAÇÃO DOS HISTÓRICOS

function integrarHistoricos(
    ocorrencias: Ocorrencia[],
    historicos: Historico[]
): OcorrenciaTransparencia[] {

    const agrupamento = new Map<number, Historico[]>();

    historicos.forEach(historico => {
        const id = Number(historico.idOcorrencia);

        if (!Number.isInteger(id) || id <= 0) return;

        const registros = agrupamento.get(id) ?? [];

        registros.push(historico);

        agrupamento.set(id, registros);
    });

    return ocorrencias.map(ocorrencia => {
        if (ocorrencia.idOcorrencia === null) {
            return {
                ...ocorrencia,
                status: 'Não informado',
            };
        }

        const registros = agrupamento.get(ocorrencia.idOcorrencia) ?? [];

        if (registros.length === 0) {
            return {
                ...ocorrencia,
                status: 'Não informado',
            };
        }

        // NÃO DETERMINAR A ORDEM QUANDO EXISTEM DATAS INVÁLIDAS

        if (registros.some(item => converterData(item.data) === null)) {
            return {
                ...ocorrencia,
                status: 'Não informado',
            };
        }

        const ordenados = [...registros].sort((a, b) => {
            const dataA = converterData(a.data)?.getTime() ?? 0;
            const dataB = converterData(b.data)?.getTime() ?? 0;

            return dataA - dataB ||
                (a.idHistorico ?? 0) - (b.idHistorico ?? 0);
        });

        const primeiroHistorico = ordenados[0];
        const ultimoHistorico = ordenados[ordenados.length - 1];

        const statusAtual = normalizarStatus(ultimoHistorico.status);

        let dataConclusao: string | undefined;

        // IDENTIFICAR A DATA DA ÚLTIMA TRANSIÇÃO PARA CONCLUÍDO

        if (statusAtual === 'Concluído') {
            for (let indice = ordenados.length - 1; indice >= 0; indice--) {
                const registro = ordenados[indice];

                if (normalizarStatus(registro.status) !== 'Concluído') {
                    break;
                }

                dataConclusao = registro.data;
            }
        }

        return {
            ...ocorrencia,
            status: statusAtual,
            data: primeiroHistorico.data,
            dataConclusao,
        };
    });
}

// ==================================================
// DIVISOR GREGO
// ==================================================

function DivisorGrego() {
    return (
        <div className="mt-6 flex max-w-xl items-center gap-4" aria-hidden="true">
            <div className="h-px flex-1 bg-[#b77965]" />
            <div className="h-2.5 w-2.5 rotate-45 bg-[#78221b]" />
            <div className="h-px flex-1 bg-[#d8b9a8]" />
        </div>
    );
}

// ==================================================
// ESTADO DOS GRÁFICOS
// ==================================================

function EstadoGrafico({ mensagem, icone = 'bar_chart' }: {
    mensagem: string;
    icone?: string;
}) {
    return (
        <div className="flex min-h-60 min-w-0 flex-col items-center justify-center px-4 py-8 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#f3e5d9]">
                <span className="material-icons text-3xl text-primaria" aria-hidden="true">
                    {icone}
                </span>
            </div>

            <p className="max-w-xs text-sm leading-relaxed text-[#51453e]">
                {mensagem}
            </p>
        </div>
    );
}

// ==================================================
// GRÁFICO DE CATEGORIAS
// ==================================================

function GraficoCategorias({ categorias }: { categorias: Categoria[] }) {

    const total = categorias.reduce(
        (soma, categoria) => soma + categoria.quantidade, 0
    );

    if (total === 0) {
        return <EstadoGrafico mensagem="Nenhuma ocorrência disponível para apresentar a distribuição por categoria." icone="donut_large" />;
    }

    const partes = categorias.map((categoria, indice) => {
        const acumuladoAnterior = categorias
            .slice(0, indice)
            .reduce((soma, item) => soma + item.quantidade, 0);

        const inicio = (acumuladoAnterior / total) * 100;
        const fim = ((acumuladoAnterior + categoria.quantidade) / total) * 100;

        return `${categoria.cor} ${inicio}% ${fim}%`;
    });

    return (
        <div className="flex w-full min-w-0 flex-col items-center gap-6 2xl:flex-row">

            <div className="relative aspect-square w-44 max-w-full shrink-0 rounded-full sm:w-48" style={{ background: `conic-gradient(${partes.join(', ')})` }} role="img" aria-label="Distribuição de ocorrências por categoria">

                <div className="absolute inset-[19%] flex flex-col items-center justify-center rounded-full bg-[#fffaf4]">

                    <span className="font-titulo text-2xl font-bold text-[#78221b]">
                        {total.toLocaleString('pt-BR')}
                    </span>

                    <span className="text-xs text-[#51453e]">
                        Ocorrências
                    </span>

                </div>

            </div>

            <div className="w-full min-w-0 flex-1 space-y-4">

                {categorias.map(categoria => {

                    const percentual = (
                        (categoria.quantidade / total) * 100
                    ).toLocaleString('pt-BR', {
                        maximumFractionDigits: 1,
                    });

                    return (
                        <div key={categoria.nome} className="flex min-w-0 items-center justify-between gap-3">

                            <div className="flex min-w-0 items-center gap-2">

                                <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: categoria.cor }} aria-hidden="true" />

                                <span className="wrap-break-word text-sm text-texto">
                                    {categoria.nome}
                                </span>

                            </div>

                            <span className="shrink-0 text-sm font-semibold text-[#78221b]">
                                {percentual}%
                            </span>

                        </div>
                    );
                })}

            </div>

        </div>
    );
}

// ==================================================
// GRÁFICO DE EVOLUÇÃO
// ==================================================

function GraficoEvolucao({ dados, exibirConcluidas }: {
    dados: DadosMensais[];
    exibirConcluidas: boolean;
}) {

    if (dados.length === 0) {
        return <EstadoGrafico mensagem="A evolução mensal estará disponível quando os históricos das ocorrências possuírem datas válidas." icone="show_chart" />;
    }

    const largura = 600;
    const altura = 250;

    const margemEsquerda = 42;
    const margemDireita = 18;
    const margemSuperior = 20;
    const margemInferior = 35;

    const larguraUtil = largura - margemEsquerda - margemDireita;
    const alturaUtil = altura - margemSuperior - margemInferior;

    const maiorValor = Math.max(
        1,
        ...dados.flatMap(item => [
            item.registradas,
            exibirConcluidas ? item.concluidas : 0,
        ])
    );

    const limite = Math.ceil(maiorValor / 4) * 4;

    function coordenadaX(indice: number) {
        return margemEsquerda +
            (indice / Math.max(dados.length - 1, 1)) * larguraUtil;
    }

    function coordenadaY(valor: number) {
        return margemSuperior + alturaUtil -
            (valor / limite) * alturaUtil;
    }

    function gerarPontos(campo: 'registradas' | 'concluidas') {
        return dados.map((item, indice) =>
            `${coordenadaX(indice)},${coordenadaY(item[campo])}`
        ).join(' ');
    }

    const marcacoes = [0, 0.25, 0.5, 0.75, 1];

    return (
        <div className="w-full min-w-0">

            <div className="mb-5 flex flex-wrap gap-x-5 gap-y-3 text-xs text-[#51453e]">

                <div className="flex items-center gap-2">

                    <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-primaria" aria-hidden="true" />

                    <span>Primeiros registros</span>

                </div>

                {exibirConcluidas && (
                    <div className="flex items-center gap-2">

                        <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#d7a17e]" aria-hidden="true" />

                        <span>Concluídas</span>

                    </div>
                )}

            </div>

            <div className="w-full min-w-0 max-w-full overflow-x-auto">

                <svg viewBox={`0 0 ${largura} ${altura}`} className={`block h-auto w-full ${dados.length > 6 ? 'min-w-120' : 'min-w-0'}`} role="img" aria-label="Evolução mensal das ocorrências">

                    {marcacoes.map(marcacao => {

                        const valor = limite * marcacao;
                        const y = coordenadaY(valor);

                        return (
                            <g key={marcacao}>

                                <line x1={margemEsquerda} x2={largura - margemDireita} y1={y} y2={y} stroke="#ead8ca" strokeDasharray="4 5" />

                                <text x={margemEsquerda - 10} y={y + 4} textAnchor="end" fontSize="16" fill="#77655d">
                                    {Math.round(valor)}
                                </text>

                            </g>
                        );
                    })}

                    <polyline points={gerarPontos('registradas')} fill="none" stroke="#b3261e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

                    {exibirConcluidas && (
                        <polyline points={gerarPontos('concluidas')} fill="none" stroke="#d7a17e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    )}

                    {dados.map((item, indice) => (
                        <g key={`${item.mes}-${indice}`}>

                            <circle cx={coordenadaX(indice)} cy={coordenadaY(item.registradas)} r="4" fill="#b3261e">

                                <title>
                                    {`${item.mes}: ${item.registradas} primeiros registros`}
                                </title>

                            </circle>

                            {exibirConcluidas && (
                                <circle cx={coordenadaX(indice)} cy={coordenadaY(item.concluidas)} r="4" fill="#d7a17e">

                                    <title>
                                        {`${item.mes}: ${item.concluidas} concluídas`}
                                    </title>

                                </circle>
                            )}

                            <text x={coordenadaX(indice)} y={altura - 10} textAnchor="middle" fontSize="16" fill="#77655d">
                                {item.mes}
                            </text>

                        </g>
                    ))}

                </svg>

            </div>

            <p className="mt-3 wrap-break-word text-xs leading-relaxed text-[#51453e]">
                A evolução considera as datas dos primeiros históricos disponíveis e das ocorrências atualmente concluídas.
            </p>

            {!exibirConcluidas && (
                <p className="mt-3 text-xs text-[#51453e]">
                    A evolução das conclusões depende da disponibilidade das respectivas datas.
                </p>
            )}

        </div>
    );
}

// ==================================================
// ESTIMATIVA ORÇAMENTÁRIA
// ==================================================

function EstimativaOrcamentaria() {

    const [intervencaoId, setIntervencaoId] = useState('calcada');
    const [quantidade, setQuantidade] = useState(10);

    const intervencao =
        intervencoes.find(item => item.id === intervencaoId) ??
        intervencoes[0];

    const quantidadeValida =
        Number.isFinite(quantidade) && quantidade > 0 ? quantidade : 0;

    const custos = useMemo(() => {

        const materiais = intervencao.materiais * quantidadeValida;
        const maoDeObra = intervencao.maoDeObra * quantidadeValida;
        const equipamentos = intervencao.equipamentos * quantidadeValida;
        const adicionais = intervencao.adicionais * quantidadeValida;

        return {
            materiais,
            maoDeObra,
            equipamentos,
            adicionais,
            total: materiais + maoDeObra + equipamentos + adicionais,
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
        <section className="relative w-full min-w-0 space-y-6" aria-label="Estimativa orçamentária">

            <div className="min-w-0 rounded-2xl border border-[#dfc2ae] bg-[#fffaf4] p-4 shadow-sm sm:p-8">

                <div className="mb-6 flex items-start gap-3 sm:gap-4">

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#f3e5d9] text-primaria sm:h-14 sm:w-14">

                        <span className="material-icons text-3xl" aria-hidden="true">
                            calculate
                        </span>

                    </div>

                    <div className="min-w-0">

                        <h3 className="font-titulo text-xl font-bold text-[#78221b] sm:text-2xl">
                            Simulador de Custos
                        </h3>

                        <p className="mt-2 text-sm leading-relaxed text-[#51453e]">
                            Selecione uma intervenção urbana e informe a quantidade desejada para visualizar uma estimativa de seus custos.
                        </p>

                    </div>

                </div>

                <div className="grid min-w-0 grid-cols-1 gap-5 md:grid-cols-2">

                    <div className="min-w-0">

                        <label htmlFor="tipoIntervencao" className="mb-2 block text-sm font-semibold text-texto">
                            Tipo de intervenção
                        </label>

                        <select id="tipoIntervencao" value={intervencaoId} onChange={event => setIntervencaoId(event.target.value)} className="w-full min-w-0 max-w-full rounded-xl border border-[#dfc2ae] bg-[#fffaf4] px-4 py-3 text-sm text-texto outline-none transition-colors focus:border-primaria">

                            {intervencoes.map(item => (
                                <option key={item.id} value={item.id}>
                                    {item.nome}
                                </option>
                            ))}

                        </select>

                    </div>

                    <div className="min-w-0">

                        <label htmlFor="quantidadeIntervencao" className="mb-2 block text-sm font-semibold text-texto">
                            Quantidade ({intervencao.unidade})
                        </label>

                        <input id="quantidadeIntervencao" type="number" min="1" max="100000" step="1" value={quantidade || ''} onChange={event => {

                            const valor = Number(event.target.value);

                            setQuantidade(
                                Number.isFinite(valor)
                                    ? Math.min(100000, Math.max(0, Math.trunc(valor)))
                                    : 0
                            );

                        }} className="w-full min-w-0 rounded-xl border border-[#dfc2ae] bg-[#fffaf4] px-4 py-3 text-sm text-texto outline-none transition-colors focus:border-primaria" />

                    </div>

                </div>

                <div className="mt-5 flex items-start gap-3 rounded-xl bg-fundo p-4">

                    <span className="material-icons shrink-0 text-xl text-primaria" aria-hidden="true">
                        info
                    </span>

                    <p className="min-w-0 text-sm leading-relaxed text-[#51453e]">
                        {intervencao.descricao} Os valores utilizados nesta simulação são fictícios e servem apenas para demonstrar o funcionamento do cálculo.
                    </p>

                </div>

            </div>

            <div className="grid min-w-0 grid-cols-1 gap-5 sm:grid-cols-2">

                {componentes.map(componente => (
                    <article key={componente.nome} className="min-w-0 rounded-2xl border border-[#dfc2ae] bg-[#fffaf4] p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6">

                        <div className="mb-4 flex items-center gap-3">

                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#f3e5d9] text-primaria">

                                <span className="material-icons text-2xl" aria-hidden="true">
                                    {componente.icone}
                                </span>

                            </div>

                            <h4 className="min-w-0 font-titulo text-lg font-bold text-[#78221b]">
                                {componente.nome}
                            </h4>

                        </div>

                        <p className="wrap-break-word font-titulo text-xl font-bold text-texto sm:text-2xl">
                            {formatarMoeda(componente.valor)}
                        </p>

                        <p className="mt-2 text-sm text-[#51453e]">
                            {componente.descricao}
                        </p>

                    </article>
                ))}

            </div>

            <div className="min-w-0 rounded-2xl border border-[#b77965] bg-[#f3e5d9] p-5 shadow-sm sm:p-8">

                <div className="flex min-w-0 flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                    <div className="min-w-0">

                        <div className="mb-2 flex items-center gap-2">

                            <span className="material-icons shrink-0 text-2xl text-primaria" aria-hidden="true">
                                account_balance_wallet
                            </span>

                            <h3 className="font-titulo text-xl font-bold text-[#78221b]">
                                Custo Total Estimado
                            </h3>

                        </div>

                        <p className="text-sm text-[#51453e]">
                            {intervencao.nome} — {quantidadeValida} {intervencao.unidade}
                        </p>

                    </div>

                    <div className="min-w-0 lg:text-right">

                        <p className="wrap-break-word font-titulo text-2xl font-bold text-[#78221b] sm:text-4xl" aria-live="polite">
                            {formatarMoeda(custos.total)}
                        </p>

                        <p className="mt-2 text-xs text-[#51453e]">
                            Valor demonstrativo
                        </p>

                    </div>

                </div>

                <div className="mt-6 border-t border-[#d8b9a8] pt-5">

                    <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">

                        {componentes.map(componente => (
                            <div key={componente.nome} className="flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-1 text-sm">

                                <span className="text-[#51453e]">
                                    {componente.nome}
                                </span>

                                <span className="min-w-0 wrap-break-word font-semibold text-texto">
                                    {formatarMoeda(componente.valor)}
                                </span>

                            </div>
                        ))}

                    </div>

                </div>

            </div>

            <div className="min-w-0 rounded-2xl border border-[#dfc2ae] bg-[#fffaf4] p-5 sm:p-8">

                <div className="flex items-start gap-3 sm:gap-4">

                    <span className="material-icons shrink-0 text-3xl text-primaria" aria-hidden="true">
                        verified_user
                    </span>

                    <div className="min-w-0">

                        <h3 className="font-titulo text-lg font-bold text-[#78221b]">
                            Transparência e Responsabilidade
                        </h3>

                        <p className="mt-3 text-sm leading-relaxed text-[#51453e]">
                            O Polieus busca tornar as informações sobre intervenções urbanas mais acessíveis, contribuindo para que os cidadãos compreendam os possíveis custos das melhorias solicitadas.
                        </p>

                        <p className="mt-3 text-sm leading-relaxed text-[#51453e]">
                            Este simulador não representa um orçamento oficial, cotação de fornecedores, disponibilidade de recursos públicos ou compromisso de execução. Os valores reais dependerão das características da intervenção e das informações fornecidas pelos órgãos responsáveis.
                        </p>

                    </div>

                </div>

            </div>

        </section>
    );
}

// ==================================================
// PÁGINA DE TRANSPARÊNCIA
// ==================================================

export default function Transparencia() {

    const [periodo, setPeriodo] = useState<Periodo>('6');
    const [abaAtiva, setAbaAtiva] = useState<Aba>('indicadores');
    const [hoje] = useState(() => new Date());

    const [ocorrencias, setOcorrencias] = useState<OcorrenciaTransparencia[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');
    const [aviso, setAviso] = useState('');
    const [tentativa, setTentativa] = useState(0);

    // ==================================================
    // INTEGRAÇÃO COM A API JAVA
    // ==================================================

    useEffect(() => {

        let ativo = true;

        async function carregarDados() {

            setCarregando(true);
            setErro('');
            setAviso('');

            try {

                const registros = await listarOcorrencias();

                if (!ativo) return;

                if (!Array.isArray(registros)) {
                    throw new Error('Resposta inválida ao consultar ocorrências.');
                }

                if (registros.length === 0) {
                    setOcorrencias([]);
                    return;
                }

                let historicos: Historico[] = [];

                try {

                    historicos = await listarHistoricos();

                    if (!Array.isArray(historicos)) {

                        historicos = [];

                        throw new Error('Resposta inválida ao consultar históricos.');
                    }

                } catch (erroHistorico) {

                    console.error('Erro ao consultar históricos:', erroHistorico);

                    if (ativo) {
                        setAviso('Não foi possível consultar os históricos. Os indicadores de conclusão e evolução podem estar indisponíveis.');
                    }
                }

                if (!ativo) return;

                const dadosIntegrados = integrarHistoricos(
                    registros,
                    historicos
                );

                setOcorrencias(dadosIntegrados);

            } catch (erro) {

                console.error('Erro ao carregar transparência:', erro);

                if (ativo) {

                    setOcorrencias([]);
                    setErro('Não foi possível consultar os indicadores da plataforma.');
                }

            } finally {

                if (ativo) {
                    setCarregando(false);
                }
            }
        }

        void carregarDados();

        return () => {
            ativo = false;
        };

    }, [tentativa]);

    // ==================================================
    // INDICADORES GERAIS
    // ==================================================

    const total = ocorrencias.length;

    const statusDisponiveis = total > 0 && ocorrencias.every(item => {

        const status = normalizarStatus(item.status);

        return status === 'Concluído' ||
            STATUS_NAO_CONCLUIDOS.includes(status);
    });

    const totalConcluidas = ocorrencias.filter(item =>
        normalizarStatus(item.status) === 'Concluído'
    ).length;

    const totalNaoConcluidas = ocorrencias.filter(item =>
        STATUS_NAO_CONCLUIDOS.includes(normalizarStatus(item.status))
    ).length;

    const taxaConclusao = total > 0
        ? Math.round((totalConcluidas / total) * 100)
        : 0;

    const dadosDisponiveis = !carregando && !erro;

    const indicadores = [
        {
            titulo: 'Total de ocorrências',
            valor: dadosDisponiveis
                ? total.toLocaleString('pt-BR') : '—',
            icone: 'assignment',
            cor: '#87221b',
        },
        {
            titulo: 'Concluídas',
            valor: dadosDisponiveis && (statusDisponiveis || total === 0)
                ? totalConcluidas.toLocaleString('pt-BR') : '—',
            icone: 'check_circle',
            cor: '#82945a',
        },
        {
            titulo: 'Não concluídas',
            valor: dadosDisponiveis && (statusDisponiveis || total === 0)
                ? totalNaoConcluidas.toLocaleString('pt-BR') : '—',
            icone: 'schedule',
            cor: '#a33a26',
        },
        {
            titulo: 'Taxa de conclusão',
            valor: dadosDisponiveis && statusDisponiveis
                ? `${taxaConclusao}%` : '—',
            icone: 'timer',
            cor: '#87221b',
        },
    ];

    // ==================================================
    // DISTRIBUIÇÃO POR CATEGORIA
    // ==================================================

    const categorias = useMemo<Categoria[]>(() => {

        const agrupamento = new Map<string, {
            nome: string;
            quantidade: number;
        }>();

        ocorrencias.forEach(item => {

            const nome = item.categoria?.trim() || 'Não informada';
            const chave = normalizarTexto(nome);
            const existente = agrupamento.get(chave);

            agrupamento.set(chave, {
                nome: existente?.nome ?? nome,
                quantidade: (existente?.quantidade ?? 0) + 1,
            });

        });

        return Array.from(agrupamento.values())
            .sort((a, b) =>
                b.quantidade - a.quantidade ||
                a.nome.localeCompare(b.nome, 'pt-BR')
            )
            .map((item, indice) => ({
                ...item,
                cor: CORES_CATEGORIAS[indice % CORES_CATEGORIAS.length],
            }));

    }, [ocorrencias]);

    // ==================================================
    // DISPONIBILIDADE DAS DATAS
    // ==================================================

    const datasDisponiveis = ocorrencias.length > 0 &&
        ocorrencias.every(item => converterData(item.data) !== null);

    const datasConclusaoDisponiveis = statusDisponiveis &&
        ocorrencias
            .filter(item =>
                normalizarStatus(item.status) === 'Concluído'
            )
            .every(item => converterData(item.dataConclusao) !== null);

    // ==================================================
    // EVOLUÇÃO MENSAL
    // ==================================================

    const dadosFiltrados = useMemo<DadosMensais[]>(() => {

        if (!datasDisponiveis) return [];

        const quantidadeMeses = Number(periodo);

        return Array.from({ length: quantidadeMeses }, (_, indice) => {

            const referencia = new Date(
                hoje.getFullYear(),
                hoje.getMonth() - quantidadeMeses + indice + 1,
                1
            );

            const mesmoMes = (valor?: string) => {

                const data = converterData(valor);

                return data !== null &&
                    data <= hoje &&
                    data.getFullYear() === referencia.getFullYear() &&
                    data.getMonth() === referencia.getMonth();
            };

            const mes = referencia.toLocaleDateString('pt-BR', {
                month: 'short',
            }).replace('.', '');

            return {

                mes: mes.charAt(0).toUpperCase() + mes.slice(1),

                registradas: ocorrencias.filter(item =>
                    mesmoMes(item.data)
                ).length,

                concluidas: datasConclusaoDisponiveis
                    ? ocorrencias.filter(item =>
                        normalizarStatus(item.status) === 'Concluído' &&
                        mesmoMes(item.dataConclusao)
                    ).length
                    : 0,
            };

        });

    }, [periodo, ocorrencias, datasDisponiveis, datasConclusaoDisponiveis, hoje]);

    return (
        <main className="min-h-screen w-full min-w-0 flex-1 bg-fundo font-corpo text-texto">

            {/* CABEÇALHO */}

            <header className="border-b border-[#d8b9a5] bg-[#fffaf4] py-5 pr-5 pl-20 sm:pr-8 sm:pl-20 lg:px-10">

                <h1 className="font-titulo text-3xl font-bold text-[#78221b] sm:text-4xl">
                    Transparência
                </h1>

                <nav aria-label="Navegação estrutural" className="mt-1 flex flex-wrap items-center gap-2 text-sm text-[#6b4438]">

                    <Link to="/inicio" className="text-[#6b4438] transition-colors hover:text-primaria hover:underline">
                        Início
                    </Link>

                    <span className="material-icons text-base text-[#6b4438]" aria-hidden="true">
                        chevron_right
                    </span>

                    <span aria-current="page" className="font-semibold text-[#78221b]">
                        Transparência
                    </span>

                </nav>

            </header>

            <div className="relative mx-auto w-full min-w-0 max-w-7xl overflow-hidden px-4 py-8 sm:px-8 lg:px-10">

                <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-12 h-72 w-72 rounded-full border border-[#dfc2ae] opacity-40" />

                <div aria-hidden="true" className="pointer-events-none absolute -right-14 top-22 h-56 w-56 rounded-full border border-[#dfc2ae] opacity-30" />

                {/* APRESENTAÇÃO */}

                <section className="relative mb-8 min-w-0">

                    <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#a34c3a]">
                        Dados abertos da plataforma
                    </p>

                    <h2 className="font-titulo text-3xl font-bold text-[#78221b] sm:text-4xl">
                        Transparência
                    </h2>

                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#51453e] sm:text-base">
                        Acompanhe os indicadores gerais do Polieus e explore estimativas orçamentárias de intervenções urbanas.
                    </p>

                    <DivisorGrego />

                </section>

                {/* ABAS */}

                <div className="relative mb-8 flex min-w-0 flex-wrap gap-3" aria-label="Seções de transparência">

                    <button type="button" aria-pressed={abaAtiva === 'indicadores'} onClick={() => setAbaAtiva('indicadores')} className={`flex max-w-full cursor-pointer items-center gap-2 rounded-full border px-4 py-3 text-sm font-semibold transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria sm:px-5 ${
                        abaAtiva === 'indicadores'
                            ? 'border-primaria bg-primaria text-white shadow-md'
                            : 'border-[#dfc2ae] bg-[#fffaf4] text-primaria hover:bg-[#f3e5d9]'
                    }`}>

                        <span className={`material-icons shrink-0 text-xl ${abaAtiva === 'indicadores' ? 'text-white' : 'text-primaria'}`} aria-hidden="true">
                            bar_chart
                        </span>

                        <span className={abaAtiva === 'indicadores' ? 'text-white' : 'text-primaria'}>
                            Indicadores Gerais
                        </span>

                    </button>

                    <button type="button" aria-pressed={abaAtiva === 'orcamento'} onClick={() => setAbaAtiva('orcamento')} className={`flex max-w-full cursor-pointer items-center gap-2 rounded-full border px-4 py-3 text-sm font-semibold transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria sm:px-5 ${
                        abaAtiva === 'orcamento'
                            ? 'border-primaria bg-primaria text-white shadow-md'
                            : 'border-[#dfc2ae] bg-[#fffaf4] text-primaria hover:bg-[#f3e5d9]'
                    }`}>

                        <span className={`material-icons shrink-0 text-xl ${abaAtiva === 'orcamento' ? 'text-white' : 'text-primaria'}`} aria-hidden="true">
                            account_balance
                        </span>

                        <span className={abaAtiva === 'orcamento' ? 'text-white' : 'text-primaria'}>
                            Estimativa Orçamentária
                        </span>

                    </button>

                </div>

                {/* INDICADORES GERAIS */}

                {abaAtiva === 'indicadores' && (

                    <section className="w-full min-w-0" aria-label="Indicadores gerais" aria-busy={carregando}>

                        <div className="mb-7 flex min-w-0 flex-wrap items-center justify-between gap-4">

                            <div className="min-w-0">

                                <h3 className="font-titulo text-2xl font-bold text-[#78221b] sm:text-3xl">
                                    Visão Geral das Ocorrências
                                </h3>

                                <p className="mt-1 text-sm text-[#51453e]">
                                    Indicadores gerais dos registros da plataforma.
                                </p>

                            </div>

                            <div className="flex items-center gap-2">

                                <button type="button" disabled={carregando} onClick={() => setTentativa(atual => atual + 1)} className="flex cursor-pointer items-center gap-2 rounded-xl border border-[#dfc2ae] bg-[#fffaf4] px-4 py-3 text-sm font-semibold text-primaria transition-colors hover:bg-[#f3e5d9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria disabled:cursor-not-allowed disabled:opacity-50">

                                    <span className={`material-icons text-xl ${carregando ? 'animate-spin' : ''}`} aria-hidden="true">
                                        refresh
                                    </span>

                                    Atualizar

                                </button>

                            </div>

                        </div>

                        {/* CARREGAMENTO */}

                        {carregando && (

                            <div role="status" className="mb-6 flex items-center gap-3 rounded-xl border border-[#dfc2ae] bg-[#fffaf4] p-4 text-sm text-[#51453e]">

                                <div className="h-6 w-6 shrink-0 animate-spin rounded-full border-2 border-[#dfc2ae] border-t-primaria" aria-hidden="true" />

                                Consultando os dados da plataforma...

                            </div>

                        )}

                        {/* ERRO */}

                        {erro && (

                            <div role="alert" className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 p-4">

                                <div className="flex min-w-0 items-center gap-3 text-sm text-red-800">

                                    <span className="material-icons shrink-0" aria-hidden="true">
                                        error_outline
                                    </span>

                                    {erro}

                                </div>

                                <button type="button" onClick={() => setTentativa(atual => atual + 1)} className="cursor-pointer rounded-lg bg-primaria px-4 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria">

                                    <span className="text-white">
                                        Tentar novamente
                                    </span>

                                </button>

                            </div>

                        )}

                        {/* AVISO SOBRE HISTÓRICOS */}

                        {!carregando && aviso && (

                            <div role="alert" className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#dfc2ae] bg-[#fffaf4] p-4">

                                <div className="flex min-w-0 flex-1 items-start gap-3">

                                    <span className="material-icons shrink-0 text-xl text-primaria" aria-hidden="true">
                                        info
                                    </span>

                                    <p className="text-sm leading-relaxed text-[#51453e]">
                                        {aviso}
                                    </p>

                                </div>

                                <button type="button" onClick={() => setTentativa(atual => atual + 1)} className="cursor-pointer text-sm font-semibold text-primaria hover:underline">
                                    Tentar novamente
                                </button>

                            </div>

                        )}

                        {/* CARDS */}

                        <section className="mb-7 grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Indicadores gerais">

                            {indicadores.map(indicador => (

                                <article key={indicador.titulo} className="flex min-w-0 items-center gap-4 rounded-xl border border-[#dfc2ae] bg-[#fffaf4] p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">

                                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#f3e5d9]" style={{ color: indicador.cor }}>

                                        <span className="material-icons text-3xl" aria-hidden="true">
                                            {indicador.icone}
                                        </span>

                                    </div>

                                    <div className="min-w-0">

                                        <p className="wrap-break-word font-titulo text-3xl font-bold text-[#78221b]">
                                            {indicador.valor}
                                        </p>

                                        <p className="mt-1 text-xs text-[#51453e] sm:text-sm">
                                            {indicador.titulo}
                                        </p>

                                    </div>

                                </article>

                            ))}

                        </section>

                        {dadosDisponiveis && total > 0 && !statusDisponiveis && !aviso && (

                            <div className="mb-6 flex items-start gap-3 rounded-xl border border-[#dfc2ae] bg-[#fffaf4] p-4">

                                <span className="material-icons shrink-0 text-xl text-primaria" aria-hidden="true">
                                    info
                                </span>

                                <p className="min-w-0 text-sm leading-relaxed text-[#51453e]">
                                    Os indicadores de conclusão serão apresentados quando os status de todas as ocorrências estiverem disponíveis.
                                </p>

                            </div>

                        )}

                        {/* GRÁFICOS */}

                        <section className="grid w-full min-w-0 grid-cols-1 items-stretch gap-6 xl:grid-cols-2" aria-label="Gráficos de transparência">

                            <article className="w-full min-w-0 rounded-2xl border border-[#dfc2ae] bg-[#fffaf4] p-4 shadow-sm sm:p-7">

                                <div className="mb-7 flex min-w-0 items-center gap-3">

                                    <span className="material-icons shrink-0 text-2xl text-primaria" aria-hidden="true">
                                        donut_large
                                    </span>

                                    <h3 className="min-w-0 font-titulo text-lg font-bold text-[#78221b] sm:text-xl">
                                        Ocorrências por Categoria
                                    </h3>

                                </div>

                                {carregando ? (

                                    <EstadoGrafico mensagem="Carregando informações..." icone="hourglass_empty" />

                                ) : erro ? (

                                    <EstadoGrafico mensagem="Não foi possível consultar as categorias." icone="error_outline" />

                                ) : (

                                    <GraficoCategorias categorias={categorias} />

                                )}

                            </article>

                            <article className="w-full min-w-0 rounded-2xl border border-[#dfc2ae] bg-[#fffaf4] p-4 shadow-sm sm:p-7">

                                <div className="mb-5 flex min-w-0 flex-wrap items-center justify-between gap-3">

                                    <div className="flex min-w-0 items-center gap-3">

                                        <span className="material-icons shrink-0 text-2xl text-primaria" aria-hidden="true">
                                            show_chart
                                        </span>

                                        <h3 className="min-w-0 font-titulo text-lg font-bold text-[#78221b] sm:text-xl">
                                            Evolução no Período
                                        </h3>

                                    </div>

                                    <label htmlFor="periodo" className="sr-only">
                                        Período do gráfico
                                    </label>

                                    <select id="periodo" value={periodo} disabled={!dadosDisponiveis || !datasDisponiveis} onChange={event => setPeriodo(event.target.value as Periodo)} className="max-w-full rounded-lg border border-[#dfc2ae] bg-[#fffaf4] px-3 py-2 text-sm font-semibold text-[#78221b] outline-none focus:border-primaria disabled:opacity-50">

                                        <option value="3">Últimos 3 meses</option>
                                        <option value="6">Últimos 6 meses</option>
                                        <option value="12">Últimos 12 meses</option>

                                    </select>

                                </div>

                                {carregando ? (

                                    <EstadoGrafico mensagem="Carregando informações..." icone="hourglass_empty" />

                                ) : erro ? (

                                    <EstadoGrafico mensagem="Não foi possível consultar a evolução das ocorrências." icone="error_outline" />

                                ) : total === 0 ? (

                                    <EstadoGrafico mensagem="Nenhuma ocorrência registrada na plataforma." icone="show_chart" />

                                ) : (

                                    <GraficoEvolucao dados={dadosFiltrados} exibirConcluidas={datasConclusaoDisponiveis} />

                                )}

                            </article>

                        </section>

                        {/* INFORMAÇÕES ADICIONAIS */}

                        <section className="mt-7 min-w-0 rounded-2xl border border-[#dfc2ae] bg-[#fffaf4] p-5 shadow-sm sm:p-8">

                            <div className="flex flex-col items-start gap-4 sm:flex-row">

                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#f3e5d9]">

                                    <span className="material-icons text-2xl text-primaria" aria-hidden="true">
                                        info
                                    </span>

                                </div>

                                <div className="min-w-0">

                                    <h3 className="font-titulo text-lg font-bold text-[#78221b]">
                                        Sobre os dados apresentados
                                    </h3>

                                    <p className="mt-2 text-sm leading-relaxed text-[#51453e]">
                                        Esta página reúne indicadores sobre as ocorrências registradas na plataforma, permitindo acompanhar categorias, volumes de solicitações e índices de conclusão.
                                    </p>

                                    <p className="mt-3 text-sm leading-relaxed text-[#51453e]">
                                        Os indicadores são calculados com base nos registros disponibilizados pelo sistema Polieus. Informações indisponíveis não são substituídas por valores fictícios.
                                    </p>

                                    <p className="mt-3 text-sm leading-relaxed text-[#51453e]">
                                        As datas são obtidas dos históricos associados às ocorrências. O primeiro histórico representa o primeiro registro disponível para acompanhamento.
                                    </p>

                                    <p className="mt-3 text-sm leading-relaxed text-[#51453e]">
                                        Os indicadores apresentados nesta página são agregados e não exibem informações pessoais dos cidadãos.
                                    </p>

                                </div>

                            </div>

                        </section>

                    </section>

                )}

                {/* ESTIMATIVA ORÇAMENTÁRIA */}

                {abaAtiva === 'orcamento' && (

                    <section className="w-full min-w-0" aria-label="Estimativa orçamentária">

                        <div className="mb-7">

                            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#a34c3a]">
                                Planejamento e transparência
                            </p>

                            <h3 className="font-titulo text-2xl font-bold text-[#78221b] sm:text-3xl">
                                Estimativa de Custos das Intervenções
                            </h3>

                            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#51453e] sm:text-base">
                                Entenda como diferentes componentes podem influenciar o custo de uma intervenção urbana. Faça uma simulação e acompanhe o resultado detalhado.
                            </p>

                        </div>

                        <EstimativaOrcamentaria />

                    </section>

                )}

            </div>

        </main>
    );
}