import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

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

import {
    listarRelatorios,
    type Relatorio,
} from '../../services/relatorioService';

// TIPAGENS

type Aba = 'geral' | 'categoria' | 'prioridade' | 'orcamento';

type Prioridade = 'Alta' | 'Média' | 'Baixa';

type Status = 'Pendente' | 'Em análise' | 'Em andamento' | 'Concluído' | 'Não informado';

type TipoCusto = 'Material' | 'Mão de obra' | 'Serviço' | 'Outros';

interface Ocorrencia {
    id: string;
    protocolo: string;
    categoria: string;
    status: Status;
    prioridade: Prioridade | null;
    analiseDisponivel: boolean;
    dataCriacao: string;
}

interface ItemOrcamento {
    id: string;
    descricao: string;
    tipo: TipoCusto;
    quantidade: number;
    valorUnitario: number;
}

interface OrcamentoSalvo {
    id: string;
    ocorrenciaId: string;
    protocolo: string;
    categoria: string;
    itens: ItemOrcamento[];
    observacoes: string;
    valorTotal: number;
    dataCriacao: string;
    dataAtualizacao: string;
}

// CONSTANTES

const CHAVE_ORCAMENTOS = 'polieus_orcamentos_institucionais';

const prioridades: Prioridade[] = ['Alta', 'Média', 'Baixa'];

const tiposCusto: TipoCusto[] = [
    'Material',
    'Mão de obra',
    'Serviço',
    'Outros',
];

const coresPrioridade: Record<Prioridade, string> = {
    Alta: '#b3261e',
    Média: '#e99a3e',
    Baixa: '#4f7b43',
};

const campoClasse = 'w-full min-w-0 rounded-lg border border-[#dcc4b5] bg-white/70 px-3 py-2.5 text-sm text-texto outline-none focus:border-primaria focus:ring-2 focus:ring-primaria/10 disabled:cursor-not-allowed disabled:opacity-60';

const botaoPrimario = 'inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-primaria px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-primaria-hover disabled:cursor-not-allowed disabled:opacity-50';

const botaoSecundario = 'inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-primaria px-4 py-2.5 text-sm font-semibold text-primaria transition-colors hover:bg-primaria/5 disabled:cursor-not-allowed disabled:opacity-50';

const painelClasse = 'min-w-0 rounded-xl border border-[#dfc4b4] bg-white/55 p-4 sm:p-5';

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

function moeda(valor: number) {
    return valor.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    });
}

function numero(valor: number) {
    return valor.toLocaleString('pt-BR');
}

function porcentagem(parte: number, total: number) {
    if (total === 0) return '0,0';

    return (parte / total * 100).toLocaleString('pt-BR', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
    });
}

function normalizarTexto(valor: string) {
    return valor.normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .toLowerCase();
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

function converterData(valor: string): Date | null {
    if (!valor) return null;

    const partes = valor.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/);

    if (partes) {
        const dia = Number(partes[1]);
        const mes = Number(partes[2]);
        const ano = Number(partes[3]);

        const data = new Date(ano, mes - 1, dia);

        return data.getDate() === dia &&
            data.getMonth() === mes - 1 &&
            data.getFullYear() === ano
            ? data
            : null;
    }

    const data = new Date(valor);

    return Number.isNaN(data.getTime()) ? null : data;
}

function formatarData(valor: string) {
    const data = converterData(valor);

    return data ? data.toLocaleDateString('pt-BR') : 'Data indisponível';
}

function textoPrioridade(ocorrencia: Ocorrencia) {
    if (!ocorrencia.analiseDisponivel) {
        return 'Indisponível';
    }

    return ocorrencia.prioridade ?? 'Não definida';
}

function novaLinha(): ItemOrcamento {
    return {
        id: crypto.randomUUID(),
        descricao: '',
        tipo: 'Material',
        quantidade: 1,
        valorUnitario: 0,
    };
}

function subtotalItem(item: ItemOrcamento) {
    const valor = item.quantidade * item.valorUnitario;

    return Number.isFinite(valor)
        ? Math.round(valor * 100) / 100
        : 0;
}

// ARMAZENAMENTO DOS ORÇAMENTOS

function carregarOrcamentosSalvos(): {
    registros: OrcamentoSalvo[];
    erro: string;
} {
    try {
        const dados = localStorage.getItem(CHAVE_ORCAMENTOS);

        if (!dados) {
            return {
                registros: [],
                erro: '',
            };
        }

        const registros = JSON.parse(dados);

        if (!Array.isArray(registros)) {
            throw new Error('Formato de armazenamento inválido.');
        }

        const validos = registros.every(registro =>
            registro &&
            typeof registro.id === 'string' &&
            typeof registro.ocorrenciaId === 'string' &&
            typeof registro.protocolo === 'string' &&
            typeof registro.categoria === 'string' &&
            typeof registro.observacoes === 'string' &&
            typeof registro.dataCriacao === 'string' &&
            typeof registro.dataAtualizacao === 'string' &&
            Number.isFinite(registro.valorTotal) &&
            Array.isArray(registro.itens) &&
            registro.itens.every((item: ItemOrcamento) =>
                item &&
                typeof item.id === 'string' &&
                typeof item.descricao === 'string' &&
                tiposCusto.includes(item.tipo) &&
                Number.isFinite(item.quantidade) &&
                item.quantidade > 0 &&
                Number.isFinite(item.valorUnitario) &&
                item.valorUnitario >= 0
            )
        );

        if (!validos) {
            throw new Error('Orçamentos armazenados inválidos.');
        }

        return {
            registros: registros as OrcamentoSalvo[],
            erro: '',
        };
    } catch (erro) {
        console.error('Erro ao carregar orçamentos:', erro);

        return {
            registros: [],
            erro: 'Não foi possível acessar os orçamentos armazenados neste navegador.',
        };
    }
}

// COMPONENTE DOS INDICADORES

function CartaoIndicador({ icone, valor, legenda, cor = 'bg-primaria' }: {
    icone: string;
    valor: number | null;
    legenda: string;
    cor?: string;
}) {
    return (
        <article className="flex min-w-0 items-center gap-4 rounded-xl border border-[#e0c5b5] bg-white/55 p-4 shadow-sm">

            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${cor}`}>
                <Icone nome={icone} classe="text-2xl text-white" />
            </div>

            <div className="min-w-0">
                <strong className="font-titulo text-2xl text-[#76221c]">
                    {valor === null ? '—' : numero(valor)}
                </strong>

                <p className="text-xs text-texto-suave">
                    {legenda}
                </p>
            </div>

        </article>
    );
}

// PÁGINA PRINCIPAL

export default function RelatoriosAdmin() {

    const [aba, setAba] = useState<Aba>('geral');
    const [periodo, setPeriodo] = useState('30');

    const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
    const [relatorios, setRelatorios] = useState<Relatorio[]>([]);

    const [carregando, setCarregando] = useState(true);
    const [erroAPI, setErroAPI] = useState('');
    const [aviso, setAviso] = useState('');

    const [historicosDisponiveis, setHistoricosDisponiveis] = useState(false);
    const [analisesDisponiveis, setAnalisesDisponiveis] = useState(false);
    const [relatoriosDisponiveis, setRelatoriosDisponiveis] = useState(false);

    const [atualizacao, setAtualizacao] = useState(0);
    const [dataReferencia, setDataReferencia] = useState(() => Date.now());

    // ORÇAMENTO INSTITUCIONAL

    const [ocorrenciaId, setOcorrenciaId] = useState('');
    const [itens, setItens] = useState<ItemOrcamento[]>([]);
    const [observacoes, setObservacoes] = useState('');

    const [mensagem, setMensagem] = useState('');
    const [erro, setErro] = useState('');

    const [armazenamentoInicial] = useState(carregarOrcamentosSalvos);

    const [orcamentosSalvos, setOrcamentosSalvos] = useState<OrcamentoSalvo[]>(
        armazenamentoInicial.registros
    );

    const [erroArmazenamento] = useState(armazenamentoInicial.erro);

    const [orcamentoEditandoId, setOrcamentoEditandoId] = useState<string | null>(null);

    const [orcamentoVisualizadoId, setOrcamentoVisualizadoId] = useState<string | null>(null);

    const [mensagemOrcamentos, setMensagemOrcamentos] = useState('');

    const [erroOrcamentos, setErroOrcamentos] = useState('');

    // INTEGRAÇÃO COM A API JAVA

    useEffect(() => {

        let ativo = true;

        async function carregar() {

            setCarregando(true);
            setErroAPI('');
            setAviso('');

            setHistoricosDisponiveis(false);
            setAnalisesDisponiveis(false);
            setRelatoriosDisponiveis(false);

            try {

                const registros = await listarOcorrencias();

                if (!ativo) return;

                const [
                    resultadoHistoricos,
                    resultadoAnalises,
                    resultadoRelatorios,
                ] = await Promise.allSettled([
                    listarHistoricos(),
                    listarAnalises(),
                    listarRelatorios(),
                ]);

                if (!ativo) return;

                const consultaHistoricos =
                    resultadoHistoricos.status === 'fulfilled' &&
                    Array.isArray(resultadoHistoricos.value);

                const consultaAnalises =
                    resultadoAnalises.status === 'fulfilled' &&
                    Array.isArray(resultadoAnalises.value);

                const consultaRelatorios =
                    resultadoRelatorios.status === 'fulfilled' &&
                    Array.isArray(resultadoRelatorios.value);

                const historicos =
                    resultadoHistoricos.status === 'fulfilled' &&
                    Array.isArray(resultadoHistoricos.value)
                        ? resultadoHistoricos.value
                        : [];

                const analises =
                    resultadoAnalises.status === 'fulfilled' &&
                    Array.isArray(resultadoAnalises.value)
                        ? resultadoAnalises.value
                        : [];

                const relatoriosAPI =
                    resultadoRelatorios.status === 'fulfilled' &&
                    Array.isArray(resultadoRelatorios.value)
                        ? resultadoRelatorios.value
                        : [];

                const avisos: string[] = [];

                if (!consultaHistoricos) {
                    avisos.push('Não foi possível consultar os históricos.');
                }

                if (!consultaAnalises) {
                    avisos.push('Não foi possível consultar as prioridades.');
                }

                if (!consultaRelatorios) {
                    avisos.push('Não foi possível consultar os relatórios cadastrados.');
                }

                const formatadas: Ocorrencia[] = [];

                for (const registro of registros) {

                    const id = registro.idOcorrencia;

                    if (typeof id !== 'number' || !Number.isInteger(id) || id <= 0) {
                        continue;
                    }

                    const historicosOcorrencia = historicos.filter(
                        historico => Number(historico.idOcorrencia) === id
                    );

                    const inicial = obterHistoricoInicial(historicosOcorrencia);
                    const atual = obterHistoricoAtual(historicosOcorrencia);

                    const protocolo = inicial?.protocolo ||
                        atual?.protocolo ||
                        gerarProtocolo(id);

                    let prioridade: Prioridade | null = null;

                    let analiseDisponivel =
                        consultaHistoricos && consultaAnalises;

                    if (analiseDisponivel) {

                        try {

                            const analise = obterAnalisePorProtocolo(
                                analises,
                                protocolo
                            );

                            prioridade = normalizarPrioridade(
                                analise?.prioridade
                            );

                        } catch (erro) {

                            analiseDisponivel = false;

                            console.error(
                                `Erro ao consultar análise de ${protocolo}:`,
                                erro
                            );
                        }
                    }

                    formatadas.push({
                        id: String(id),
                        protocolo,
                        categoria: registro.categoria || 'Não informada',
                        status: normalizarStatus(atual?.status),
                        prioridade,
                        analiseDisponivel,
                        dataCriacao: inicial?.data || '',
                    });
                }

                const semStatus = formatadas.filter(
                    item => item.status === 'Não informado'
                ).length;

                const semAnaliseDisponivel = formatadas.filter(
                    item => !item.analiseDisponivel
                ).length;

                if (consultaHistoricos && semStatus > 0) {
                    avisos.push(`${semStatus} ocorrência(s) sem status informado.`);
                }

                if (consultaHistoricos && consultaAnalises && semAnaliseDisponivel > 0) {
                    avisos.push(`${semAnaliseDisponivel} ocorrência(s) com prioridade indisponível.`);
                }

                setOcorrencias(formatadas);
                setRelatorios(relatoriosAPI);

                setHistoricosDisponiveis(consultaHistoricos);
                setAnalisesDisponiveis(consultaAnalises);
                setRelatoriosDisponiveis(consultaRelatorios);

                setDataReferencia(Date.now());
                setAviso(avisos.join(' '));

            } catch (erro) {

                if (!ativo) return;

                console.error('Erro ao carregar relatórios:', erro);

                setOcorrencias([]);
                setRelatorios([]);

                setErroAPI(
                    'Não foi possível consultar os dados da API Java.'
                );

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

    function atualizarRelatorios() {
        if (carregando) return;

        setAtualizacao(valor => valor + 1);
    }

    // DISPONIBILIDADE DOS DADOS

    const dadosDisponiveis = !carregando && !erroAPI;

    const periodoDisponivel =
        dadosDisponiveis &&
        (periodo === 'todos' || historicosDisponiveis);

    const statusDisponivel =
        periodoDisponivel && historicosDisponiveis;

    const prioridadeDisponivel =
        periodoDisponivel &&
        analisesDisponiveis &&
        historicosDisponiveis;

    // FILTRO POR PERÍODO

    const ocorrenciasPeriodo = useMemo(() => {

        if (periodo === 'todos') return ocorrencias;

        const limite = new Date(dataReferencia);

        limite.setHours(0, 0, 0, 0);

        limite.setDate(
            limite.getDate() - Number(periodo) + 1
        );

        const fim = new Date(dataReferencia);

        fim.setHours(23, 59, 59, 999);

        return ocorrencias.filter(ocorrencia => {

            const data = converterData(ocorrencia.dataCriacao);

            return data !== null && data >= limite && data <= fim;
        });

    }, [ocorrencias, periodo, dataReferencia]);

    const semData = ocorrencias.filter(
        ocorrencia => !converterData(ocorrencia.dataCriacao)
    ).length;

    // INDICADORES

    const indicadores = useMemo(() => ({

        total: ocorrenciasPeriodo.length,

        resolvidas: ocorrenciasPeriodo.filter(
            ocorrencia => ocorrencia.status === 'Concluído'
        ).length,

        analise: ocorrenciasPeriodo.filter(
            ocorrencia => ocorrencia.status === 'Em análise'
        ).length,

        andamento: ocorrenciasPeriodo.filter(
            ocorrencia => ocorrencia.status === 'Em andamento'
        ).length,

        pendentes: ocorrenciasPeriodo.filter(
            ocorrencia => ocorrencia.status === 'Pendente'
        ).length,

        semStatus: ocorrenciasPeriodo.filter(
            ocorrencia => ocorrencia.status === 'Não informado'
        ).length,

    }), [ocorrenciasPeriodo]);

    const taxaDisponivel =
        statusDisponivel &&
        indicadores.semStatus === 0 &&
        indicadores.total > 0;

    const taxaResolucao = indicadores.total > 0
        ? indicadores.resolvidas / indicadores.total * 100
        : 0;

    // RELATÓRIOS POR CATEGORIA

    const dadosCategorias = useMemo(() => {

        const contagem = new Map<string, {
            nome: string;
            quantidade: number;
        }>();

        ocorrenciasPeriodo.forEach(ocorrencia => {

            const nome = ocorrencia.categoria || 'Não informada';

            const chave = normalizarTexto(nome);

            const existente = contagem.get(chave);

            contagem.set(chave, {
                nome: existente?.nome ?? nome,
                quantidade: (existente?.quantidade ?? 0) + 1,
            });
        });

        return [...contagem.values()].sort(
            (a, b) => b.quantidade - a.quantidade
        );

    }, [ocorrenciasPeriodo]);

    const maiorCategoria = Math.max(
        1,
        ...dadosCategorias.map(categoria => categoria.quantidade)
    );

    // RELATÓRIOS POR PRIORIDADE

    const dadosPrioridades = useMemo(() => {

        return prioridades.map(prioridade => ({

            nome: prioridade,

            quantidade: ocorrenciasPeriodo.filter(
                ocorrencia => ocorrencia.prioridade === prioridade
            ).length,

            cor: coresPrioridade[prioridade],

        }));

    }, [ocorrenciasPeriodo]);

    const semPrioridade = ocorrenciasPeriodo.filter(
        ocorrencia =>
            ocorrencia.analiseDisponivel &&
            ocorrencia.prioridade === null
    ).length;

    const prioridadeIndisponivel = ocorrenciasPeriodo.filter(
        ocorrencia => !ocorrencia.analiseDisponivel
    ).length;

    const dadosGrafico = [
        ...dadosPrioridades,
        {
            nome: 'Não definida',
            quantidade: semPrioridade,
            cor: '#a49b91',
        },
        {
            nome: 'Indisponível',
            quantidade: prioridadeIndisponivel,
            cor: '#eadbd0',
        },
    ];

    let acumulado = 0;

    const partesGrafico = dadosGrafico.map(item => {

        const inicio = acumulado;

        acumulado += indicadores.total > 0
            ? item.quantidade / indicadores.total * 100
            : 0;

        return `${item.cor} ${inicio}% ${acumulado}%`;
    });

    const fundoGrafico =
        prioridadeDisponivel && indicadores.total > 0
            ? `conic-gradient(${partesGrafico.join(', ')})`
            : '#eadbd0';

    // ORÇAMENTO INSTITUCIONAL

    const ocorrenciaSelecionada = ocorrencias.find(
        ocorrencia => ocorrencia.id === ocorrenciaId
    );

    const totalOrcamento = useMemo(() => {

        return itens.reduce(
            (total, item) => total + subtotalItem(item),
            0
        );

    }, [itens]);

    const totaisPorTipo = useMemo(() => {

        return tiposCusto.map(tipo => ({
            tipo,

            valor: itens
                .filter(item => item.tipo === tipo)
                .reduce(
                    (total, item) => total + subtotalItem(item),
                    0
                ),
        }));

    }, [itens]);

    const valorTotalOrcamentosSalvos = useMemo(() => {

        return orcamentosSalvos.reduce(
            (total, orcamento) => total + orcamento.valorTotal,
            0
        );

    }, [orcamentosSalvos]);

    const orcamentoVisualizado = orcamentosSalvos.find(
        orcamento => orcamento.id === orcamentoVisualizadoId
    );

    function atualizarItem<K extends keyof ItemOrcamento>(
        id: string,
        campo: K,
        valor: ItemOrcamento[K]
    ) {

        setItens(anteriores =>
            anteriores.map(item =>
                item.id === id
                    ? { ...item, [campo]: valor }
                    : item
            )
        );

        setMensagem('');
        setErro('');
    }

    function selecionarOcorrencia(id: string) {

        setOcorrenciaId(id);

        const existente = orcamentosSalvos.find(
            orcamento => orcamento.ocorrenciaId === id
        );

        if (existente) {

            setOrcamentoEditandoId(existente.id);

            setItens(
                existente.itens.map(item => ({ ...item }))
            );

            setObservacoes(existente.observacoes);

        } else {

            setOrcamentoEditandoId(null);

            setItens(id ? [novaLinha()] : []);

            setObservacoes('');
        }

        setMensagem('');
        setErro('');
    }

    function adicionarItem() {

        if (!ocorrenciaSelecionada) return;

        setItens(anteriores => [...anteriores, novaLinha()]);

        setErro('');
        setMensagem('');
    }

    function removerItem(id: string) {

        setItens(anteriores =>
            anteriores.length <= 1
                ? anteriores
                : anteriores.filter(item => item.id !== id)
        );

        setErro('');
        setMensagem('');
    }

    function validarOrcamento(): boolean {

        setErro('');
        setMensagem('');

        if (!ocorrenciaSelecionada) {

            setErro('Selecione uma ocorrência registrada.');

            return false;
        }

        const itensValidos = itens.length > 0 && itens.every(item =>
            item.descricao.trim().length > 0 &&
            Number.isFinite(item.quantidade) &&
            item.quantidade > 0 &&
            Number.isFinite(item.valorUnitario) &&
            item.valorUnitario >= 0 &&
            Number.isFinite(item.quantidade * item.valorUnitario)
        );

        if (!itensValidos) {

            setErro(
                'Preencha corretamente a descrição, a quantidade e o valor de todos os itens.'
            );

            return false;
        }

        if (!Number.isFinite(totalOrcamento) || totalOrcamento <= 0) {

            setErro('O orçamento deve possuir valor maior que zero.');

            return false;
        }

        return true;
    }

    // SALVAR ORÇAMENTO

    function salvarOrcamento() {

        if (!validarOrcamento() || !ocorrenciaSelecionada) return;

        if (erroArmazenamento) {
            setErro(erroArmazenamento);
            return;
        }

        const atual = carregarOrcamentosSalvos();

        if (atual.erro) {
            setErro(atual.erro);
            return;
        }

        const existente = atual.registros.find(
            orcamento => orcamento.ocorrenciaId === ocorrenciaId
        );

        const agora = new Date().toISOString();

        const novoOrcamento: OrcamentoSalvo = {
            id: existente?.id ?? crypto.randomUUID(),
            ocorrenciaId,
            protocolo: ocorrenciaSelecionada.protocolo,
            categoria: ocorrenciaSelecionada.categoria,
            itens: itens.map(item => ({
                ...item,
                descricao: item.descricao.trim(),
            })),
            observacoes: observacoes.trim(),
            valorTotal: Math.round(totalOrcamento * 100) / 100,
            dataCriacao: existente?.dataCriacao ?? agora,
            dataAtualizacao: agora,
        };

        const novosOrcamentos = [
            novoOrcamento,
            ...atual.registros.filter(
                orcamento => orcamento.ocorrenciaId !== ocorrenciaId
            ),
        ];

        try {

            localStorage.setItem(
                CHAVE_ORCAMENTOS,
                JSON.stringify(novosOrcamentos)
            );

            setOrcamentosSalvos(novosOrcamentos);

            setOrcamentoEditandoId(novoOrcamento.id);

            setMensagem(
                existente
                    ? 'Orçamento atualizado com sucesso!'
                    : 'Orçamento salvo com sucesso!'
            );

            setMensagemOrcamentos('');
            setErroOrcamentos('');

        } catch (erro) {

            console.error('Erro ao salvar orçamento:', erro);

            setErro(
                'Não foi possível salvar o orçamento neste navegador.'
            );
        }
    }

    // EDITAR ORÇAMENTO

    function editarOrcamento(orcamento: OrcamentoSalvo) {

        const ocorrencia = ocorrencias.find(
            item => item.id === orcamento.ocorrenciaId
        );

        if (!ocorrencia || !dadosDisponiveis) {

            setErroOrcamentos(
                'Não foi possível localizar a ocorrência vinculada a este orçamento.'
            );

            return;
        }

        setOcorrenciaId(orcamento.ocorrenciaId);

        setOrcamentoEditandoId(orcamento.id);

        setItens(
            orcamento.itens.map(item => ({ ...item }))
        );

        setObservacoes(orcamento.observacoes);

        setOrcamentoVisualizadoId(null);

        setErro('');
        setMensagem('');
        setErroOrcamentos('');
        setMensagemOrcamentos('');

        document.getElementById('elaborar-orcamento')?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        });
    }

    // EXCLUIR ORÇAMENTO

    function excluirOrcamento(orcamento: OrcamentoSalvo) {

        const confirmar = window.confirm(
            `Deseja excluir o orçamento da ocorrência ${orcamento.protocolo}?`
        );

        if (!confirmar) return;

        setErroOrcamentos('');
        setMensagemOrcamentos('');

        const atual = carregarOrcamentosSalvos();

        if (atual.erro) {
            setErroOrcamentos(atual.erro);
            return;
        }

        const novosOrcamentos = atual.registros.filter(
            item => item.id !== orcamento.id
        );

        try {

            localStorage.setItem(
                CHAVE_ORCAMENTOS,
                JSON.stringify(novosOrcamentos)
            );

            setOrcamentosSalvos(novosOrcamentos);

            if (orcamentoVisualizadoId === orcamento.id) {
                setOrcamentoVisualizadoId(null);
            }

            if (orcamentoEditandoId === orcamento.id) {

                setOrcamentoEditandoId(null);
                setOcorrenciaId('');
                setItens([]);
                setObservacoes('');
                setMensagem('');
                setErro('');
            }

            setMensagemOrcamentos('Orçamento excluído com sucesso!');

        } catch (erro) {

            console.error('Erro ao excluir orçamento:', erro);

            setErroOrcamentos(
                'Não foi possível excluir o orçamento.'
            );
        }
    }

    // LIMPAR FORMULÁRIO

    function novoOrcamento() {

        setOcorrenciaId('');
        setItens([]);
        setObservacoes('');

        setOrcamentoEditandoId(null);

        setMensagem('');
        setErro('');

        document.getElementById('elaborar-orcamento')?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        });
    }

    // INTERFACE

    return (

        <main className="min-h-screen w-full min-w-0 bg-fundo font-corpo text-texto">

            <div className="mx-auto w-full min-w-0 max-w-7xl px-4 py-7 sm:px-8 lg:px-10">

                {/* CABEÇALHO */}

                <header className="border-b border-[#d7b4a3] pb-5 pl-16 sm:pl-12 lg:pl-0">

                    <div className="flex items-center gap-2 text-[#78221b]">

                        <Icone nome="account_balance" classe="text-2xl" />

                        <span className="font-titulo text-lg font-bold">
                            Área Administrativa
                        </span>

                    </div>

                    <h1 className="mt-4 font-titulo text-3xl font-bold text-[#78221b] sm:text-4xl">
                        Relatórios e Indicadores
                    </h1>

                    <p className="mt-2 text-sm text-texto-suave">
                        Acompanhe o desempenho da plataforma, analise ocorrências e elabore orçamentos institucionais.
                    </p>

                </header>

                {/* ABAS E FILTROS */}

                <div className="mt-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">

                    <div className="flex flex-wrap gap-2">

                        {([
                            ['geral', 'Visão Geral'],
                            ['categoria', 'Por Categoria'],
                            ['prioridade', 'Por Prioridade'],
                            ['orcamento', 'Orçamento Institucional'],
                        ] as const).map(([valor, titulo]) => (

                            <button key={valor} type="button" onClick={() => setAba(valor)} aria-pressed={aba === valor} className={`cursor-pointer rounded-lg px-4 py-2.5 text-xs font-semibold transition-colors sm:text-sm ${aba === valor ? 'bg-primaria' : 'border border-[#dec4b4] bg-white/50 hover:bg-primaria/5'}`}>

                                <span className={aba === valor ? 'text-white' : 'text-primaria'}>
                                    {titulo}
                                </span>

                            </button>

                        ))}

                    </div>

                    <div className="flex flex-wrap items-center gap-2">

                        {aba !== 'orcamento' && (

                            <select aria-label="Filtrar por período" value={periodo} onChange={evento => setPeriodo(evento.target.value)} className={`${campoClasse} sm:w-44`}>

                                <option value="7">Últimos 7 dias</option>

                                <option value="30">Últimos 30 dias</option>

                                <option value="90">Últimos 90 dias</option>

                                <option value="todos">Todo o período</option>

                            </select>

                        )}

                        <button type="button" onClick={atualizarRelatorios} disabled={carregando} className={botaoSecundario}>

                            <Icone nome="refresh" classe={`text-lg ${carregando ? 'animate-spin' : ''}`} />

                            {carregando ? 'Atualizando...' : 'Atualizar'}

                        </button>

                    </div>

                </div>

                {/* CARREGAMENTO */}

                {carregando && (

                    <div role="status" className="mt-5 flex items-center gap-3 rounded-lg border border-[#dfc4b4] bg-white/55 p-4">

                        <div className="h-6 w-6 shrink-0 animate-spin rounded-full border-3 border-[#dfc4b4] border-t-primaria" />

                        <p className="text-sm text-texto-suave">
                            Consultando os dados da plataforma...
                        </p>

                    </div>

                )}

                {/* ERROS E AVISOS */}

                {erroAPI && (

                    <div role="alert" className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-4">

                        <div className="flex items-center gap-2 text-red-700">

                            <Icone nome="error_outline" />

                            <p className="text-sm">
                                {erroAPI}
                            </p>

                        </div>

                        <button type="button" onClick={atualizarRelatorios} className={botaoPrimario}>

                            <span className="text-white">
                                Tentar novamente
                            </span>

                        </button>

                    </div>

                )}

                {aviso && !erroAPI && (

                    <div role="status" className="mt-5 flex items-start gap-3 rounded-lg border border-[#dfc4b4] bg-[#f5e5d9] p-4">

                        <Icone nome="info" classe="text-primaria" />

                        <p className="text-sm text-texto">
                            {aviso}
                        </p>

                    </div>

                )}

                {/* RELATÓRIOS E INDICADORES */}

                {aba !== 'orcamento' ? (

                    <>

                        <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">

                            <CartaoIndicador icone="campaign" valor={periodoDisponivel ? indicadores.total : null} legenda="Total de ocorrências" />

                            <CartaoIndicador icone="check_circle" valor={statusDisponivel ? indicadores.resolvidas : null} legenda="Concluídas" cor="bg-green-700" />

                            <CartaoIndicador icone="schedule" valor={statusDisponivel ? indicadores.analise : null} legenda="Em análise" />

                            <CartaoIndicador icone="warning" valor={statusDisponivel ? indicadores.pendentes : null} legenda="Pendentes" />

                        </section>

                        {periodoDisponivel && periodo !== 'todos' && semData > 0 && (

                            <p className="mt-3 text-xs text-texto-suave">
                                {semData} ocorrência(s) sem data de histórico não foram incluídas no período selecionado.
                            </p>

                        )}

                        {/* VISÃO GERAL */}

                        {aba === 'geral' && (

                            <section className="mt-5 grid gap-4 md:grid-cols-3">

                                <div className={painelClasse}>

                                    <p className="text-sm font-semibold text-[#78221b]">
                                        Taxa de resolução
                                    </p>

                                    <strong className="mt-3 block font-titulo text-3xl text-[#76221c]">

                                        {taxaDisponivel
                                            ? `${porcentagem(indicadores.resolvidas, indicadores.total)}%`
                                            : '—'}

                                    </strong>

                                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#eadbd0]">

                                        <div className="h-full rounded-full bg-green-700" style={{ width: `${taxaDisponivel ? taxaResolucao : 0}%` }} />

                                    </div>

                                    {statusDisponivel && indicadores.semStatus > 0 && (

                                        <p className="mt-3 text-xs text-texto-suave">
                                            Existem ocorrências sem status informado.
                                        </p>

                                    )}

                                </div>

                                <div className={painelClasse}>

                                    <p className="text-sm font-semibold text-[#78221b]">
                                        Em andamento
                                    </p>

                                    <strong className="mt-3 block font-titulo text-3xl text-[#76221c]">

                                        {statusDisponivel ? numero(indicadores.andamento) : '—'}

                                    </strong>

                                    <p className="mt-3 text-xs text-texto-suave">
                                        Ocorrências com atendimento em andamento.
                                    </p>

                                </div>

                                <div className={painelClasse}>

                                    <p className="text-sm font-semibold text-[#78221b]">
                                        Categorias registradas
                                    </p>

                                    <strong className="mt-3 block font-titulo text-3xl text-[#76221c]">

                                        {periodoDisponivel ? numero(dadosCategorias.length) : '—'}

                                    </strong>

                                    <p className="mt-3 text-xs text-texto-suave">
                                        Categorias com ocorrências no período selecionado.
                                    </p>

                                </div>

                            </section>

                        )}

                        {/* GRÁFICO POR CATEGORIA */}

                        {(aba === 'geral' || aba === 'categoria') && (

                            <section className={`mt-5 ${painelClasse}`}>

                                <h2 className="flex items-center gap-2 font-titulo text-lg font-bold text-[#78221b]">

                                    <Icone nome="bar_chart" />

                                    Ocorrências por Categoria

                                </h2>

                                {!periodoDisponivel || dadosCategorias.length === 0 ? (

                                    <p className="py-12 text-center text-sm text-texto-suave">

                                        {carregando
                                            ? 'Carregando categorias...'
                                            : !periodoDisponivel
                                                ? 'Dados indisponíveis.'
                                                : 'Nenhuma ocorrência disponível para o período selecionado.'}

                                    </p>

                                ) : (

                                    <div className="mt-6 space-y-5">

                                        {dadosCategorias.map(categoria => (

                                            <div key={categoria.nome}>

                                                <div className="mb-2 flex justify-between gap-3 text-sm">

                                                    <span>{categoria.nome}</span>

                                                    <strong>
                                                        {numero(categoria.quantidade)}
                                                    </strong>

                                                </div>

                                                <div className="h-5 overflow-hidden rounded-md bg-[#eadbd0]">

                                                    <div className="h-full rounded-md bg-primaria transition-all duration-500" style={{ width: `${categoria.quantidade / maiorCategoria * 100}%` }} />

                                                </div>

                                                <p className="mt-1 text-right text-xs text-texto-suave">

                                                    {porcentagem(categoria.quantidade, indicadores.total)}% do total

                                                </p>

                                            </div>

                                        ))}

                                    </div>

                                )}

                            </section>

                        )}

                        {/* GRÁFICO POR PRIORIDADE */}

                        {(aba === 'geral' || aba === 'prioridade') && (

                            <section className={`mt-5 ${painelClasse}`}>

                                <h2 className="flex items-center gap-2 font-titulo text-lg font-bold text-[#78221b]">

                                    <Icone nome="donut_large" />

                                    Distribuição por Nível de Prioridade

                                </h2>

                                <div className="mt-6 grid min-w-0 gap-6 md:grid-cols-[200px_minmax(0,1fr)] md:items-center">

                                    <div className="mx-auto flex h-44 w-44 max-w-full items-center justify-center rounded-full" style={{ background: fundoGrafico }} role="img" aria-label="Gráfico de distribuição de prioridades">

                                        <div className="flex h-29 w-29 flex-col items-center justify-center rounded-full bg-fundo">

                                            <strong className="font-titulo text-2xl text-[#78221b]">

                                                {periodoDisponivel ? numero(indicadores.total) : '—'}

                                            </strong>

                                            <span className="text-xs">
                                                Ocorrências
                                            </span>

                                        </div>

                                    </div>

                                    <div className="min-w-0 space-y-4">

                                        {dadosGrafico.map(prioridade => (

                                            <div key={prioridade.nome} className="flex items-center justify-between gap-3">

                                                <div className="flex min-w-0 items-center gap-3">

                                                    <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: prioridade.cor }} />

                                                    <span className="text-sm">

                                                        {prioridade.nome === 'Não definida'
                                                            ? 'Sem prioridade definida'
                                                            : prioridade.nome === 'Indisponível'
                                                                ? 'Prioridade indisponível'
                                                                : `${prioridade.nome} prioridade`}

                                                    </span>

                                                </div>

                                                <strong className="shrink-0 text-sm">

                                                    {prioridadeDisponivel
                                                        ? `${numero(prioridade.quantidade)} (${porcentagem(prioridade.quantidade, indicadores.total)}%)`
                                                        : '—'}

                                                </strong>

                                            </div>

                                        ))}

                                    </div>

                                </div>

                            </section>

                        )}

                        {/* RELATÓRIOS REGISTRADOS NA API */}

                        {aba === 'geral' && (

                            <section className={`mt-5 ${painelClasse}`}>

                                <div className="flex flex-wrap items-center justify-between gap-3">

                                    <h2 className="flex items-center gap-2 font-titulo text-lg font-bold text-[#78221b]">

                                        <Icone nome="description" />

                                        Relatórios Cadastrados

                                    </h2>

                                    <span className="text-sm font-semibold text-[#78221b]">

                                        {dadosDisponiveis && relatoriosDisponiveis
                                            ? `${numero(relatorios.length)} registro(s)`
                                            : '—'}

                                    </span>

                                </div>

                                <p className="mt-2 text-xs text-texto-suave">
                                    Registros cadastrados na plataforma, independentemente do período selecionado.
                                </p>

                                {!dadosDisponiveis || !relatoriosDisponiveis || relatorios.length === 0 ? (

                                    <p className="py-10 text-center text-sm text-texto-suave">

                                        {carregando
                                            ? 'Consultando relatórios...'
                                            : !dadosDisponiveis || !relatoriosDisponiveis
                                                ? 'Relatórios indisponíveis.'
                                                : 'Nenhum relatório cadastrado.'}

                                    </p>

                                ) : (

                                    <div className="mt-5 overflow-x-auto">

                                        <table className="w-full text-left text-sm">

                                            <thead className="bg-[#f1e0d5] text-[#78221b]">

                                                <tr>

                                                    <th scope="col" className="rounded-l-lg px-4 py-3">
                                                        Identificação
                                                    </th>

                                                    <th scope="col" className="px-4 py-3">
                                                        Categoria
                                                    </th>

                                                    <th scope="col" className="rounded-r-lg px-4 py-3">
                                                        Prioridade
                                                    </th>

                                                </tr>

                                            </thead>

                                            <tbody>

                                                {relatorios.map((relatorio, indice) => {

                                                    const prioridade = normalizarPrioridade(
                                                        relatorio.prioridade
                                                    );

                                                    return (

                                                        <tr key={`${relatorio.idRelatorio}-${indice}`} className="border-b border-[#ead7ca]">

                                                            <td className="px-4 py-4 font-semibold">
                                                                {relatorio.idRelatorio ?? '—'}
                                                            </td>

                                                            <td className="px-4 py-4">
                                                                {relatorio.categoria}
                                                            </td>

                                                            <td className="px-4 py-4">

                                                                <div className="flex items-center gap-2">

                                                                    <span className="h-3 w-3 shrink-0 rounded-full" style={{
                                                                        backgroundColor: prioridade
                                                                            ? coresPrioridade[prioridade]
                                                                            : '#a49b91',
                                                                    }} />

                                                                    {prioridade ?? 'Não definida'}

                                                                </div>

                                                            </td>

                                                        </tr>
                                                    );
                                                })}

                                            </tbody>

                                        </table>

                                    </div>

                                )}

                            </section>

                        )}

                        {/* IMPRESSÃO */}

                        <div className="mt-5 flex flex-wrap justify-end gap-3 print:hidden">

                            <button type="button" onClick={() => window.print()} disabled={!periodoDisponivel} className={botaoSecundario}>

                                <Icone nome="picture_as_pdf" classe="text-lg" />

                                Imprimir / Salvar PDF

                            </button>

                        </div>

                    </>

                ) : (

                    /* ORÇAMENTO INSTITUCIONAL */

                    <section className={`mt-5 space-y-5 ${orcamentoVisualizado ? 'print:hidden' : ''}`}>

                        <div id="elaborar-orcamento" className={`${painelClasse} scroll-mt-6`}>

                            <div className="flex flex-wrap items-center justify-between gap-3">

                                <h2 className="flex items-center gap-2 font-titulo text-xl font-bold text-[#78221b]">

                                    <Icone nome="calculate" />

                                    {orcamentoEditandoId
                                        ? 'Editar Orçamento da Ocorrência'
                                        : 'Elaborar Orçamento da Ocorrência'}

                                </h2>

                                {orcamentoEditandoId && (

                                    <button type="button" onClick={novoOrcamento} className={`${botaoSecundario} print:hidden`}>

                                        <Icone nome="add" classe="text-lg" />

                                        Novo Orçamento

                                    </button>

                                )}

                            </div>

                            <p className="mt-2 text-sm text-texto-suave">
                                Selecione uma ocorrência registrada e defina os custos estimados pela instituição.
                            </p>

                            <div className="mt-5">

                                <label htmlFor="orcamento-ocorrencia" className="mb-2 block text-sm font-semibold text-[#78221b]">
                                    Ocorrência
                                </label>

                                <select id="orcamento-ocorrencia" value={ocorrenciaId} onChange={evento => selecionarOcorrencia(evento.target.value)} disabled={!dadosDisponiveis} className={campoClasse}>

                                    <option value="">
                                        Selecione uma ocorrência
                                    </option>

                                    {ocorrencias.map(ocorrencia => (

                                        <option key={ocorrencia.id} value={ocorrencia.id}>

                                            {ocorrencia.protocolo} — {ocorrencia.categoria}

                                            {orcamentosSalvos.some(
                                                orcamento => orcamento.ocorrenciaId === ocorrencia.id
                                            ) ? ' (Orçamento salvo)' : ''}

                                        </option>

                                    ))}

                                </select>

                                {dadosDisponiveis && ocorrencias.length === 0 && (

                                    <p className="mt-3 text-sm text-texto-suave">
                                        Nenhuma ocorrência registrada na plataforma.
                                    </p>

                                )}

                                {ocorrenciaSelecionada && (

                                    <div className="mt-4 grid gap-3 rounded-lg bg-fundo p-4 text-sm sm:grid-cols-3">

                                        <div>

                                            <span className="text-texto-suave">
                                                Protocolo
                                            </span>

                                            <p className="font-semibold">
                                                {ocorrenciaSelecionada.protocolo}
                                            </p>

                                        </div>

                                        <div>

                                            <span className="text-texto-suave">
                                                Status
                                            </span>

                                            <p className="font-semibold">
                                                {ocorrenciaSelecionada.status}
                                            </p>

                                        </div>

                                        <div>

                                            <span className="text-texto-suave">
                                                Prioridade
                                            </span>

                                            <p className="font-semibold">
                                                {textoPrioridade(ocorrenciaSelecionada)}
                                            </p>

                                        </div>

                                    </div>

                                )}

                            </div>

                        </div>

                        {/* INDICADORES ORÇAMENTÁRIOS */}

                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 print:hidden">

                            <div className={painelClasse}>

                                <p className="text-sm text-texto-suave">
                                    Orçamentos salvos
                                </p>

                                <strong className="mt-2 block font-titulo text-2xl text-[#78221b]">

                                    {erroArmazenamento
                                        ? '—'
                                        : numero(orcamentosSalvos.length)}

                                </strong>

                                <p className="mt-2 text-xs text-texto-suave">
                                    Orçamentos elaborados pela instituição neste navegador.
                                </p>

                            </div>

                            <div className={painelClasse}>

                                <p className="text-sm text-texto-suave">
                                    Valor total dos orçamentos
                                </p>

                                <strong className="mt-2 block font-titulo text-2xl text-[#78221b]">

                                    {erroArmazenamento
                                        ? '—'
                                        : moeda(valorTotalOrcamentosSalvos)}

                                </strong>

                                <p className="mt-2 text-xs text-texto-suave">
                                    Soma dos valores estimados armazenados.
                                </p>

                            </div>

                            <div className={`${painelClasse} sm:col-span-2 xl:col-span-1`}>

                                <p className="text-sm text-texto-suave">
                                    Ocorrências registradas
                                </p>

                                <strong className="mt-2 block font-titulo text-2xl text-[#78221b]">

                                    {dadosDisponiveis ? numero(ocorrencias.length) : '—'}

                                </strong>

                                <p className="mt-2 text-xs text-texto-suave">
                                    Registros disponíveis para estimativa de custos.
                                </p>

                            </div>

                        </div>

                        {/* COMPOSIÇÃO DOS CUSTOS */}

                        <div className={painelClasse}>

                            <div className="flex flex-wrap items-center justify-between gap-3">

                                <h2 className="flex items-center gap-2 font-titulo text-lg font-bold text-[#78221b]">

                                    <Icone nome="receipt_long" />

                                    Composição dos Custos

                                </h2>

                                <button type="button" onClick={adicionarItem} disabled={!ocorrenciaSelecionada || !dadosDisponiveis} className={`${botaoSecundario} print:hidden`}>

                                    <Icone nome="add" classe="text-lg" />

                                    Adicionar Item

                                </button>

                            </div>

                            {itens.length === 0 && (

                                <div className="mt-5 rounded-lg border border-dashed border-[#d7b4a3] p-8 text-center">

                                    <Icone nome="receipt_long" classe="text-4xl text-[#b88e7a]" />

                                    <p className="mt-2 text-sm text-texto-suave">
                                        Selecione uma ocorrência para elaborar seu orçamento.
                                    </p>

                                </div>

                            )}

                            <div className="mt-5 space-y-4">

                                {itens.map((item, indice) => (

                                    <div key={item.id} className="min-w-0 rounded-lg border border-[#e3cabb] bg-fundo/70 p-4">

                                        <div className="mb-3 flex items-center justify-between">

                                            <h3 className="text-sm font-semibold text-[#78221b]">
                                                Item {indice + 1}
                                            </h3>

                                            <button type="button" aria-label={`Remover item ${indice + 1}`} disabled={itens.length === 1} onClick={() => removerItem(item.id)} className="cursor-pointer text-primaria disabled:cursor-not-allowed disabled:opacity-30 print:hidden">

                                                <Icone nome="delete_outline" />

                                            </button>

                                        </div>

                                        <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-[1.7fr_1fr_0.7fr_1fr]">

                                            <div className="min-w-0">

                                                <label htmlFor={`descricao-${item.id}`} className="mb-1 block text-xs font-semibold">
                                                    Descrição
                                                </label>

                                                <input id={`descricao-${item.id}`} value={item.descricao} onChange={evento => atualizarItem(item.id, 'descricao', evento.target.value)} placeholder="Ex.: Substituição de luminária" className={campoClasse} />

                                            </div>

                                            <div className="min-w-0">

                                                <label htmlFor={`tipo-${item.id}`} className="mb-1 block text-xs font-semibold">
                                                    Tipo de custo
                                                </label>

                                                <select id={`tipo-${item.id}`} value={item.tipo} onChange={evento => atualizarItem(item.id, 'tipo', evento.target.value as TipoCusto)} className={campoClasse}>

                                                    {tiposCusto.map(tipo => (

                                                        <option key={tipo} value={tipo}>
                                                            {tipo}
                                                        </option>

                                                    ))}

                                                </select>

                                            </div>

                                            <div className="min-w-0">

                                                <label htmlFor={`quantidade-${item.id}`} className="mb-1 block text-xs font-semibold">
                                                    Quantidade
                                                </label>

                                                <input id={`quantidade-${item.id}`} type="number" min="0.01" step="any" value={Number.isFinite(item.quantidade) ? item.quantidade : ''} onChange={evento => atualizarItem(item.id, 'quantidade', evento.target.value === '' ? Number.NaN : Number(evento.target.value))} className={campoClasse} />

                                            </div>

                                            <div className="min-w-0">

                                                <label htmlFor={`valor-${item.id}`} className="mb-1 block text-xs font-semibold">
                                                    Valor unitário (R$)
                                                </label>

                                                <input id={`valor-${item.id}`} type="number" min="0" step="0.01" value={Number.isFinite(item.valorUnitario) ? item.valorUnitario : ''} onChange={evento => atualizarItem(item.id, 'valorUnitario', evento.target.value === '' ? Number.NaN : Number(evento.target.value))} className={campoClasse} />

                                            </div>

                                        </div>

                                        <p className="mt-3 text-right text-sm">

                                            Subtotal:{' '}

                                            <strong className="text-[#78221b]">
                                                {moeda(subtotalItem(item))}
                                            </strong>

                                        </p>

                                    </div>

                                ))}

                            </div>

                        </div>

                        {/* OBSERVAÇÕES E RESUMO */}

                        <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)]">

                            <div className={painelClasse}>

                                <h2 className="font-titulo text-lg font-bold text-[#78221b]">
                                    Observações da Instituição
                                </h2>

                                <textarea aria-label="Observações da instituição" rows={7} value={observacoes} onChange={evento => {

                                    setObservacoes(evento.target.value);
                                    setMensagem('');

                                }} disabled={!ocorrenciaSelecionada} placeholder="Descreva a justificativa do orçamento, os serviços previstos e outras informações relevantes..." className={`${campoClasse} mt-4 resize-y`} />

                            </div>

                            <div className={painelClasse}>

                                <h2 className="flex items-center gap-2 font-titulo text-lg font-bold text-[#78221b]">

                                    <Icone nome="account_balance_wallet" />

                                    Resumo Orçamentário

                                </h2>

                                <div className="mt-5 space-y-3">

                                    {totaisPorTipo.map(({ tipo, valor }) => (

                                        <div key={tipo} className="flex justify-between gap-3 border-b border-[#ead7ca] pb-3 text-sm">

                                            <span>{tipo}</span>

                                            <strong>
                                                {moeda(valor)}
                                            </strong>

                                        </div>

                                    ))}

                                </div>

                                <div className="mt-5 rounded-lg bg-[#f1e0d5] p-4">

                                    <p className="text-sm font-semibold text-[#78221b]">
                                        Valor total estimado
                                    </p>

                                    <p className="mt-2 font-titulo text-3xl font-bold text-[#78221b]">
                                        {moeda(totalOrcamento)}
                                    </p>

                                </div>

                                {erro && (

                                    <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                                        {erro}
                                    </p>

                                )}

                                {mensagem && (

                                    <p role="status" className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-800 print:hidden">
                                        {mensagem}
                                    </p>

                                )}

                                <button type="button" onClick={salvarOrcamento} disabled={!ocorrenciaSelecionada || !dadosDisponiveis || !!erroArmazenamento} className={`${botaoPrimario} mt-5 w-full print:hidden`}>

                                    <Icone nome="save" classe="text-xl text-white" />

                                    <span className="text-white">

                                        {orcamentoEditandoId
                                            ? 'Atualizar Orçamento'
                                            : 'Salvar Orçamento'}

                                    </span>

                                </button>

                                <button type="button" onClick={() => {

                                    if (validarOrcamento()) {
                                        window.print();
                                    }

                                }} disabled={!ocorrenciaSelecionada || !dadosDisponiveis} className={`${botaoSecundario} mt-3 w-full print:hidden`}>

                                    <Icone nome="picture_as_pdf" classe="text-xl" />

                                    Imprimir / Salvar PDF

                                </button>

                                <p className="mt-3 text-xs leading-relaxed text-texto-suave">
                                    O orçamento representa uma estimativa institucional. Os registros são armazenados localmente neste navegador e não constituem um orçamento oficial.
                                </p>

                            </div>

                        </div>

                        {/* ORÇAMENTOS SALVOS */}

                        <section className={`${painelClasse} print:hidden`}>

                            <div className="flex flex-wrap items-center justify-between gap-3">

                                <h2 className="flex items-center gap-2 font-titulo text-xl font-bold text-[#78221b]">

                                    <Icone nome="folder_special" />

                                    Orçamentos Salvos ({orcamentosSalvos.length})

                                </h2>

                                <button type="button" onClick={novoOrcamento} disabled={!dadosDisponiveis || !!erroArmazenamento} className={botaoSecundario}>

                                    <Icone nome="add" classe="text-lg" />

                                    Novo Orçamento

                                </button>

                            </div>

                            <p className="mt-2 text-sm text-texto-suave">
                                Consulte e gerencie os orçamentos elaborados pela instituição.
                            </p>

                            {erroArmazenamento && (

                                <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                                    {erroArmazenamento}
                                </p>

                            )}

                            {erroOrcamentos && (

                                <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                                    {erroOrcamentos}
                                </p>

                            )}

                            {mensagemOrcamentos && (

                                <p role="status" className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-800">
                                    {mensagemOrcamentos}
                                </p>

                            )}

                            {!erroArmazenamento && orcamentosSalvos.length === 0 ? (

                                <div className="mt-5 rounded-lg border border-dashed border-[#d7b4a3] p-8 text-center">

                                    <Icone nome="folder_open" classe="text-5xl text-[#b88e7a]" />

                                    <h3 className="mt-3 font-titulo text-lg font-bold text-[#78221b]">
                                        Nenhum orçamento salvo
                                    </h3>

                                    <p className="mt-2 text-sm text-texto-suave">
                                        Os orçamentos elaborados e salvos aparecerão nesta área.
                                    </p>

                                </div>

                            ) : (

                                <div className="mt-5 grid min-w-0 gap-4 md:grid-cols-2 2xl:grid-cols-3">

                                    {orcamentosSalvos.map(orcamento => (

                                        <article key={orcamento.id} className="min-w-0 rounded-xl border border-[#dfc4b4] bg-[#fffaf4] p-4 shadow-sm sm:p-5">

                                            <div className="flex items-start justify-between gap-3">

                                                <div className="flex min-w-0 items-center gap-3">

                                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f1e0d5]">

                                                        <Icone nome="receipt_long" classe="text-xl text-[#78221b]" />

                                                    </div>

                                                    <div className="min-w-0">

                                                        <p className="text-xs font-semibold text-[#78221b]">
                                                            {orcamento.protocolo}
                                                        </p>

                                                        <h3 className="mt-1 font-titulo text-lg font-bold text-[#78221b]">
                                                            {orcamento.categoria}
                                                        </h3>

                                                    </div>

                                                </div>

                                                <span className="shrink-0 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-800">
                                                    Salvo
                                                </span>

                                            </div>

                                            <div className="mt-5 rounded-lg bg-fundo p-4">

                                                <p className="text-xs text-texto-suave">
                                                    Valor total estimado
                                                </p>

                                                <strong className="mt-1 block font-titulo text-2xl text-[#78221b]">
                                                    {moeda(orcamento.valorTotal)}
                                                </strong>

                                            </div>

                                            <div className="mt-4 space-y-2 text-xs text-texto-suave">

                                                <p className="flex items-center gap-2">

                                                    <Icone nome="event" classe="text-base text-[#78221b]" />

                                                    Criado em {formatarData(orcamento.dataCriacao)}

                                                </p>

                                                <p className="flex items-center gap-2">

                                                    <Icone nome="update" classe="text-base text-[#78221b]" />

                                                    Atualizado em {formatarData(orcamento.dataAtualizacao)}

                                                </p>

                                                <p className="flex items-center gap-2">

                                                    <Icone nome="list_alt" classe="text-base text-[#78221b]" />

                                                    {orcamento.itens.length} item(ns) de custo

                                                </p>

                                            </div>

                                            <div className="mt-4 grid grid-cols-2 gap-2 border-t border-[#dfc4b4] pt-4">

                                                <button type="button" onClick={() => setOrcamentoVisualizadoId(orcamento.id)} className={`${botaoSecundario} px-2`}>

                                                    <Icone nome="visibility" classe="text-lg" />

                                                    Visualizar

                                                </button>

                                                <button type="button" onClick={() => editarOrcamento(orcamento)} disabled={!dadosDisponiveis} className={`${botaoSecundario} px-2`}>

                                                    <Icone nome="edit" classe="text-lg" />

                                                    Editar

                                                </button>

                                                <button type="button" onClick={() => setOrcamentoVisualizadoId(orcamento.id)} className={`${botaoSecundario} px-2`}>

                                                    <Icone nome="picture_as_pdf" classe="text-lg" />

                                                    PDF

                                                </button>

                                                <button type="button" onClick={() => excluirOrcamento(orcamento)} className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-red-300 px-2 py-2.5 text-sm font-semibold text-red-700 transition-colors hover:bg-red-50">

                                                    <Icone nome="delete_outline" classe="text-lg" />

                                                    Excluir

                                                </button>

                                            </div>

                                        </article>

                                    ))}

                                </div>

                            )}

                            <div className="mt-5 flex items-start gap-2 rounded-lg bg-fundo p-3">

                                <Icone nome="info" classe="text-lg text-[#78221b]" />

                                <p className="text-xs leading-relaxed text-texto-suave">
                                    Os orçamentos salvos permanecem disponíveis neste navegador. Os registros não são enviados ao servidor.
                                </p>

                            </div>

                        </section>

                        <div className="flex justify-end print:hidden">

                            <Link to="/admin/gerenciar-ocorrencias" className={botaoSecundario}>

                                <Icone nome="list" classe="text-lg" />

                                Gerenciar Ocorrências

                            </Link>

                        </div>

                    </section>

                )}

            </div>

            {/* VISUALIZAÇÃO DO ORÇAMENTO SALVO */}

            {orcamentoVisualizado && aba === 'orcamento' && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 print:static print:block print:bg-transparent print:p-0" aria-hidden={false}>

                    <section role="dialog" aria-modal="true" aria-labelledby="titulo-orcamento-salvo" onKeyDown={evento => {

                        if (evento.key === 'Escape') {
                            setOrcamentoVisualizadoId(null);
                        }

                    }} className="max-h-[90dvh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-[#dfc4b4] bg-[#fffaf4] shadow-xl print:max-h-none print:max-w-none print:overflow-visible print:border-0 print:shadow-none">

                        <header className="flex items-start justify-between gap-4 border-b border-[#dfc4b4] p-5 sm:p-7">

                            <div className="min-w-0">

                                <p className="text-xs font-bold uppercase tracking-widest text-[#a34c3a]">
                                    Polieus — Área Administrativa
                                </p>

                                <h2 id="titulo-orcamento-salvo" className="mt-2 font-titulo text-2xl font-bold text-[#78221b] sm:text-3xl">
                                    Orçamento Institucional
                                </h2>

                                <p className="mt-2 text-sm text-texto-suave">
                                    {orcamentoVisualizado.protocolo} — {orcamentoVisualizado.categoria}
                                </p>

                            </div>

                            <button type="button" autoFocus aria-label="Fechar detalhes do orçamento" onClick={() => setOrcamentoVisualizadoId(null)} className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-[#78221b] hover:bg-[#f1e0d5] print:hidden">

                                <Icone nome="close" />

                            </button>

                        </header>

                        <div className="space-y-6 p-5 sm:p-7">

                            <div className="grid gap-3 rounded-xl bg-fundo p-4 text-sm sm:grid-cols-2">

                                <div>

                                    <span className="text-texto-suave">
                                        Data de elaboração
                                    </span>

                                    <p className="mt-1 font-semibold">
                                        {formatarData(orcamentoVisualizado.dataCriacao)}
                                    </p>

                                </div>

                                <div>

                                    <span className="text-texto-suave">
                                        Última atualização
                                    </span>

                                    <p className="mt-1 font-semibold">
                                        {formatarData(orcamentoVisualizado.dataAtualizacao)}
                                    </p>

                                </div>

                            </div>

                            <section>

                                <h3 className="font-titulo text-lg font-bold text-[#78221b]">
                                    Composição dos Custos
                                </h3>

                                <div className="mt-4 w-full overflow-x-auto">

                                    <table className="w-full min-w-140 text-left text-sm">

                                        <thead className="bg-[#f1e0d5] text-[#78221b]">

                                            <tr>

                                                <th scope="col" className="rounded-l-lg px-3 py-3">
                                                    Descrição
                                                </th>

                                                <th scope="col" className="px-3 py-3">
                                                    Tipo
                                                </th>

                                                <th scope="col" className="px-3 py-3">
                                                    Qtd.
                                                </th>

                                                <th scope="col" className="px-3 py-3">
                                                    Valor unitário
                                                </th>

                                                <th scope="col" className="rounded-r-lg px-3 py-3">
                                                    Subtotal
                                                </th>

                                            </tr>

                                        </thead>

                                        <tbody>

                                            {orcamentoVisualizado.itens.map(item => (

                                                <tr key={item.id} className="border-b border-[#ead7ca]">

                                                    <td className="px-3 py-4">
                                                        {item.descricao}
                                                    </td>

                                                    <td className="px-3 py-4">
                                                        {item.tipo}
                                                    </td>

                                                    <td className="px-3 py-4">
                                                        {numero(item.quantidade)}
                                                    </td>

                                                    <td className="whitespace-nowrap px-3 py-4">
                                                        {moeda(item.valorUnitario)}
                                                    </td>

                                                    <td className="whitespace-nowrap px-3 py-4 font-semibold">
                                                        {moeda(subtotalItem(item))}
                                                    </td>

                                                </tr>

                                            ))}

                                        </tbody>

                                    </table>

                                </div>

                            </section>

                            <section>

                                <h3 className="font-titulo text-lg font-bold text-[#78221b]">
                                    Observações da Instituição
                                </h3>

                                <p className="mt-3 whitespace-pre-wrap wrap-break-word rounded-lg bg-fundo p-4 text-sm leading-relaxed text-texto-suave">

                                    {orcamentoVisualizado.observacoes || 'Nenhuma observação registrada.'}

                                </p>

                            </section>

                            <section className="rounded-xl border border-[#d7b4a3] bg-[#f1e0d5] p-4 sm:p-5">

                                <h3 className="font-titulo text-lg font-bold text-[#78221b]">
                                    Resumo Orçamentário
                                </h3>

                                <div className="mt-4 space-y-3">

                                    {tiposCusto.map(tipo => (

                                        <div key={tipo} className="flex justify-between gap-3 border-b border-[#d7b4a3] pb-3 text-sm">

                                            <span>{tipo}</span>

                                            <strong>

                                                {moeda(
                                                    orcamentoVisualizado.itens
                                                        .filter(item => item.tipo === tipo)
                                                        .reduce(
                                                            (total, item) => total + subtotalItem(item),
                                                            0
                                                        )
                                                )}

                                            </strong>

                                        </div>

                                    ))}

                                </div>

                                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">

                                    <p className="font-semibold text-[#78221b]">
                                        Valor total estimado
                                    </p>

                                    <strong className="font-titulo text-3xl text-[#78221b]">
                                        {moeda(orcamentoVisualizado.valorTotal)}
                                    </strong>

                                </div>

                            </section>

                            <p className="text-xs leading-relaxed text-texto-suave">
                                Este documento apresenta uma estimativa de custos elaborada pela instituição e não representa compromisso oficial de execução ou contratação.
                            </p>

                            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end print:hidden">

                                <button type="button" onClick={() => setOrcamentoVisualizadoId(null)} className={botaoSecundario}>
                                    Fechar
                                </button>

                                <button type="button" onClick={() => window.print()} className={botaoPrimario}>

                                    <Icone nome="picture_as_pdf" classe="text-xl text-white" />

                                    <span className="text-white">
                                        Imprimir / Salvar PDF
                                    </span>

                                </button>

                            </div>

                        </div>

                    </section>

                </div>

            )}

        </main>

    );
}