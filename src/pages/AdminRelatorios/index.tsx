import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

type Aba = 'geral' | 'categoria' | 'prioridade' | 'orcamento';
type Prioridade = 'Alta' | 'Média' | 'Baixa';
type Status = 'Pendente' | 'Em análise' | 'Em andamento' | 'Resolvida';
type TipoCusto = 'Material' | 'Mão de obra' | 'Serviço' | 'Outros';

interface Ocorrencia {
    id: string;
    protocolo: string;
    categoria: string;
    status: Status;
    prioridade: Prioridade | null;
    dataCriacao: string;
}

interface ItemOrcamento {
    id: string;
    descricao: string;
    tipo: TipoCusto;
    quantidade: number;
    valorUnitario: number;
}

interface Orcamento {
    id: string;
    ocorrenciaId: string;
    protocolo: string;
    itens: ItemOrcamento[];
    observacoes: string;
    total: number;
    dataConfirmacao: string;
    situacao: 'Confirmado';
}

const CHAVE_OCORRENCIAS = 'polieus_ocorrencias';
const CHAVE_ORCAMENTOS = 'polieus_orcamentos';

const prioridades: Prioridade[] = ['Alta', 'Média', 'Baixa'];

const coresPrioridade: Record<Prioridade, string> = {
    Alta: '#b3261e',
    Média: '#e99a3e',
    Baixa: '#d7b4a3',
};

const campoClasse =
    'w-full rounded-lg border border-[#dcc4b5] bg-white/70 px-3 py-2.5 text-sm text-texto outline-none focus:border-primaria focus:ring-2 focus:ring-primaria/10';

const botaoPrimario =
    'inline-flex items-center justify-center gap-2 rounded-lg bg-primaria px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primaria-hover disabled:cursor-not-allowed disabled:opacity-50';

const botaoSecundario =
    'inline-flex items-center justify-center gap-2 rounded-lg border border-primaria px-4 py-2.5 text-sm font-semibold text-primaria transition-colors hover:bg-primaria/5';

function Icone({ nome, classe = '' }: { nome: string; classe?: string }) {
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

function lerLista<T>(chave: string): T[] {
    try {
        const conteudo = localStorage.getItem(chave);
        const dados: unknown = conteudo ? JSON.parse(conteudo) : [];
        return Array.isArray(dados) ? dados as T[] : [];
    } catch {
        return [];
    }
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

function CartaoIndicador({
    icone,
    valor,
    legenda,
    cor = 'bg-primaria',
}: {
    icone: string;
    valor: number;
    legenda: string;
    cor?: string;
}) {
    return (
        <div className="flex items-center gap-4 rounded-xl border border-[#e0c5b5] bg-white/55 p-4">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${cor}`}>
                <Icone nome={icone} classe="text-2xl text-white" />
            </div>

            <div>
                <strong className="font-titulo text-2xl text-[#76221c]">
                    {numero(valor)}
                </strong>
                <p className="text-xs text-texto-suave">{legenda}</p>
            </div>
        </div>
    );
}

export default function RelatoriosAdmin() {
    const [aba, setAba] = useState<Aba>('geral');
    const [periodo, setPeriodo] = useState('30');
    const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
    const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
    const [ocorrenciaId, setOcorrenciaId] = useState('');
    const [itens, setItens] = useState<ItemOrcamento[]>([]);
    const [observacoes, setObservacoes] = useState('');
    const [mensagem, setMensagem] = useState('');
    const [erro, setErro] = useState('');

    useEffect(() => {
        const carregar = () => {
            setOcorrencias(lerLista<Ocorrencia>(CHAVE_OCORRENCIAS));
            setOrcamentos(lerLista<Orcamento>(CHAVE_ORCAMENTOS));
        };

        carregar();

        window.addEventListener('storage', carregar);
        window.addEventListener('polieus:ocorrencias-atualizadas', carregar);

        return () => {
            window.removeEventListener('storage', carregar);
            window.removeEventListener('polieus:ocorrencias-atualizadas', carregar);
        };
    }, []);

    const ocorrenciasPeriodo = useMemo(() => {
        if (periodo === 'todos') return ocorrencias;

        const limite = new Date();
        limite.setDate(limite.getDate() - Number(periodo));

        return ocorrencias.filter((ocorrencia) => {
            const data = new Date(ocorrencia.dataCriacao);
            return !Number.isNaN(data.getTime()) && data >= limite;
        });
    }, [ocorrencias, periodo]);

    const indicadores = useMemo(() => ({
        total: ocorrenciasPeriodo.length,
        resolvidas: ocorrenciasPeriodo.filter((o) => o.status === 'Resolvida').length,
        analise: ocorrenciasPeriodo.filter((o) => o.status === 'Em análise').length,
        pendentes: ocorrenciasPeriodo.filter((o) => o.status === 'Pendente').length,
    }), [ocorrenciasPeriodo]);

    const dadosCategorias = useMemo(() => {
        const contagem = new Map<string, number>();

        ocorrenciasPeriodo.forEach((ocorrencia) => {
            const categoria = ocorrencia.categoria || 'Outros';
            contagem.set(categoria, (contagem.get(categoria) ?? 0) + 1);
        });

        return [...contagem.entries()]
            .map(([nome, quantidade]) => ({ nome, quantidade }))
            .sort((a, b) => b.quantidade - a.quantidade);
    }, [ocorrenciasPeriodo]);

    const dadosPrioridades = useMemo(() => {
        return prioridades.map((prioridade) => ({
            nome: prioridade,
            quantidade: ocorrenciasPeriodo.filter(
                (ocorrencia) => ocorrencia.prioridade === prioridade
            ).length,
            cor: coresPrioridade[prioridade],
        }));
    }, [ocorrenciasPeriodo]);

    const semPrioridade = ocorrenciasPeriodo.filter(
        (ocorrencia) => !ocorrencia.prioridade
    ).length;

    const maiorCategoria = Math.max(
        1,
        ...dadosCategorias.map((categoria) => categoria.quantidade)
    );

    const ocorrenciaSelecionada = ocorrencias.find(
        (ocorrencia) => ocorrencia.id === ocorrenciaId
    );

    const orcamentoExistente = orcamentos.find(
        (orcamento) => orcamento.ocorrenciaId === ocorrenciaId
    );

    const totalOrcamento = useMemo(() => {
        return itens.reduce(
            (total, item) => total + item.quantidade * item.valorUnitario,
            0
        );
    }, [itens]);

    const totaisPorTipo = useMemo(() => {
        const tipos: TipoCusto[] = ['Material', 'Mão de obra', 'Serviço', 'Outros'];

        return tipos.map((tipo) => ({
            tipo,
            valor: itens
                .filter((item) => item.tipo === tipo)
                .reduce(
                    (total, item) => total + item.quantidade * item.valorUnitario,
                    0
                ),
        }));
    }, [itens]);

    function atualizarItem(id: string, campo: keyof ItemOrcamento, valor: string | number) {
        setItens((anteriores) =>
            anteriores.map((item) =>
                item.id === id ? { ...item, [campo]: valor } : item
            )
        );
        setMensagem('');
    }

    function selecionarOcorrencia(id: string) {
        setOcorrenciaId(id);
        setMensagem('');
        setErro('');

        const existente = orcamentos.find((orcamento) => orcamento.ocorrenciaId === id);

        if (existente) {
            setItens(existente.itens.map((item) => ({ ...item })));
            setObservacoes(existente.observacoes);
        } else {
            setItens([novaLinha()]);
            setObservacoes('');
        }
    }

    function confirmarOrcamento() {
        setErro('');
        setMensagem('');

        if (!ocorrenciaSelecionada) {
            setErro('Selecione uma ocorrência registrada.');
            return;
        }

        if (orcamentoExistente) {
            setErro('Esta ocorrência já possui um orçamento confirmado.');
            return;
        }

        const itensValidos = itens.length > 0 && itens.every(
            (item) =>
                item.descricao.trim().length > 0 &&
                Number.isFinite(item.quantidade) &&
                item.quantidade > 0 &&
                Number.isFinite(item.valorUnitario) &&
                item.valorUnitario >= 0
        );

        if (!itensValidos || totalOrcamento <= 0) {
            setErro('Preencha os itens com descrição, quantidade válida e valores corretos.');
            return;
        }

        const novoOrcamento: Orcamento = {
            id: crypto.randomUUID(),
            ocorrenciaId: ocorrenciaSelecionada.id,
            protocolo: ocorrenciaSelecionada.protocolo,
            itens: itens.map((item) => ({
                ...item,
                descricao: item.descricao.trim(),
            })),
            observacoes: observacoes.trim(),
            total: Math.round(totalOrcamento * 100) / 100,
            dataConfirmacao: new Date().toISOString(),
            situacao: 'Confirmado',
        };

        const atualizados = [...orcamentos, novoOrcamento];

        try {
            localStorage.setItem(CHAVE_ORCAMENTOS, JSON.stringify(atualizados));
            setOrcamentos(atualizados);
            window.dispatchEvent(new Event('polieus:orcamentos-atualizados'));

            setMensagem(
                'Orçamento confirmado e salvo neste navegador. O envio ao cidadão será habilitado com a integração compartilhada.'
            );
        } catch {
            setErro('Não foi possível salvar o orçamento neste navegador.');
        }
    }

    function exportarCSV() {
        const cabecalho = [
            'Protocolo',
            'Categoria',
            'Status',
            'Prioridade',
            'Data de criação',
        ];

        const linhas = ocorrenciasPeriodo.map((ocorrencia) => [
            ocorrencia.protocolo,
            ocorrencia.categoria,
            ocorrencia.status,
            ocorrencia.prioridade ?? 'Não definida',
            ocorrencia.dataCriacao,
        ]);

        const escapar = (valor: string) =>
            `"${valor.replace(/"/g, '""')}"`;

        const conteudo = [cabecalho, ...linhas]
            .map((linha) => linha.map(escapar).join(';'))
            .join('\r\n');

        const arquivo = new Blob(['\uFEFF', conteudo], {
            type: 'text/csv;charset=utf-8;',
        });

        const url = URL.createObjectURL(arquivo);
        const link = document.createElement('a');

        link.href = url;
        link.download = 'polieus_relatorio_ocorrencias.csv';
        link.click();

        URL.revokeObjectURL(url);
    }

    return (
        <main className="min-h-screen w-full bg-fundo font-corpo text-texto">
            <div className="mx-auto max-w-7xl px-5 py-7 sm:px-8 lg:px-10">

                <header className="border-b border-[#d7b4a3] pb-5">
                    <div className="flex items-center gap-2 text-primaria">
                        <Icone nome="account_balance" classe="text-2xl" />
                        <span className="font-titulo text-lg font-bold">
                            Área Administrativa
                        </span>
                    </div>

                    <h1 className="mt-4 font-titulo text-3xl font-bold text-primaria sm:text-4xl">
                        Relatórios e Indicadores
                    </h1>

                    <p className="mt-2 text-sm text-texto-suave">
                        Acompanhe o desempenho da plataforma, analise ocorrências
                        e elabore orçamentos institucionais.
                    </p>
                </header>

                <div className="mt-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                    <div className="flex flex-wrap gap-2">
                        {([
                            ['geral', 'Visão Geral'],
                            ['categoria', 'Por Categoria'],
                            ['prioridade', 'Por Prioridade'],
                            ['orcamento', 'Orçamento Institucional'],
                        ] as const).map(([valor, titulo]) => (
                            <button
                                key={valor}
                                type="button"
                                onClick={() => setAba(valor)}
                                className={`rounded-lg px-4 py-2.5 text-xs font-semibold transition-colors sm:text-sm ${
                                    aba === valor
                                        ? 'bg-primaria text-white'
                                        : 'border border-[#dec4b4] bg-white/50 text-primaria hover:bg-primaria/5'
                                }`}
                            >
                                {titulo}
                            </button>
                        ))}
                    </div>

                    {aba !== 'orcamento' && (
                        <select
                            aria-label="Filtrar por período"
                            value={periodo}
                            onChange={(evento) => setPeriodo(evento.target.value)}
                            className={`${campoClasse} w-full lg:w-44`}
                        >
                            <option value="7">Últimos 7 dias</option>
                            <option value="30">Últimos 30 dias</option>
                            <option value="90">Últimos 90 dias</option>
                            <option value="todos">Todo o período</option>
                        </select>
                    )}
                </div>

                {aba !== 'orcamento' ? (
                    <>
                        <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            <CartaoIndicador
                                icone="campaign"
                                valor={indicadores.total}
                                legenda="Total de ocorrências"
                            />
                            <CartaoIndicador
                                icone="check"
                                valor={indicadores.resolvidas}
                                legenda="Resolvidas"
                                cor="bg-green-700"
                            />
                            <CartaoIndicador
                                icone="schedule"
                                valor={indicadores.analise}
                                legenda="Em análise"
                            />
                            <CartaoIndicador
                                icone="warning"
                                valor={indicadores.pendentes}
                                legenda="Pendentes"
                            />
                        </section>

                        {(aba === 'geral' || aba === 'categoria') && (
                            <section className="mt-5 rounded-xl border border-[#dfc4b4] bg-white/55 p-5">
                                <h2 className="flex items-center gap-2 font-titulo text-lg font-bold text-primaria">
                                    <Icone nome="bar_chart" />
                                    Ocorrências por Categoria
                                </h2>

                                {dadosCategorias.length === 0 ? (
                                    <p className="py-12 text-center text-sm text-texto-suave">
                                        Nenhuma ocorrência disponível para o período selecionado.
                                    </p>
                                ) : (
                                    <div className="mt-6 space-y-5">
                                        {dadosCategorias.map((categoria) => (
                                            <div key={categoria.nome}>
                                                <div className="mb-2 flex justify-between gap-3 text-sm">
                                                    <span>{categoria.nome}</span>
                                                    <strong>{numero(categoria.quantidade)}</strong>
                                                </div>
                                                <div className="h-5 overflow-hidden rounded-md bg-[#eadbd0]">
                                                    <div
                                                        className="h-full rounded-md bg-primaria"
                                                        style={{
                                                            width: `${categoria.quantidade / maiorCategoria * 100}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        )}

                        {(aba === 'geral' || aba === 'prioridade') && (
                            <section className="mt-5 rounded-xl border border-[#dfc4b4] bg-white/55 p-5">
                                <h2 className="flex items-center gap-2 font-titulo text-lg font-bold text-primaria">
                                    <Icone nome="donut_large" />
                                    Distribuição por Nível de Prioridade
                                </h2>

                                <div className="mt-6 grid gap-6 md:grid-cols-[200px_1fr] md:items-center">
                                    <div
                                        className="mx-auto flex h-44 w-44 items-center justify-center rounded-full"
                                        style={{
                                            background: indicadores.total > 0
                                                ? `conic-gradient(
                                                    #b3261e 0% ${dadosPrioridades[0].quantidade / indicadores.total * 100}%,
                                                    #e99a3e ${dadosPrioridades[0].quantidade / indicadores.total * 100}% ${(dadosPrioridades[0].quantidade + dadosPrioridades[1].quantidade) / indicadores.total * 100}%,
                                                    #d7b4a3 ${(dadosPrioridades[0].quantidade + dadosPrioridades[1].quantidade) / indicadores.total * 100}% ${(indicadores.total - semPrioridade) / indicadores.total * 100}%,
                                                    #a49b91 ${(indicadores.total - semPrioridade) / indicadores.total * 100}% 100%
                                                )`
                                                : '#eadbd0',
                                        }}
                                    >
                                        <div className="flex h-29 w-29 flex-col items-center justify-center rounded-full bg-fundo">
                                            <strong className="font-titulo text-2xl text-primaria">
                                                {numero(indicadores.total)}
                                            </strong>
                                            <span className="text-xs">Ocorrências</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {dadosPrioridades.map((prioridade) => (
                                            <div key={prioridade.nome} className="flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-3">
                                                    <span
                                                        className="h-3 w-3 rounded-full"
                                                        style={{ backgroundColor: prioridade.cor }}
                                                    />
                                                    <span className="text-sm">
                                                        {prioridade.nome} prioridade
                                                    </span>
                                                </div>
                                                <strong className="text-sm">
                                                    {numero(prioridade.quantidade)}
                                                    {' '}
                                                    ({indicadores.total
                                                        ? (prioridade.quantidade / indicadores.total * 100).toFixed(1)
                                                        : '0,0'}%)
                                                </strong>
                                            </div>
                                        ))}

                                        {semPrioridade > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span>Sem prioridade definida</span>
                                                <strong>{numero(semPrioridade)}</strong>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </section>
                        )}

                        <div className="mt-5 flex flex-wrap justify-end gap-3">
                            <button type="button" onClick={() => window.print()} className={botaoSecundario}>
                                <Icone nome="picture_as_pdf" classe="text-lg" />
                                Imprimir / Salvar PDF
                            </button>

                            <button type="button" onClick={exportarCSV} className={botaoSecundario}>
                                <Icone nome="download" classe="text-lg" />
                                Exportar Dados (CSV)
                            </button>
                        </div>
                    </>
                ) : (
                    <section className="mt-5 space-y-5">
                        <div className="rounded-xl border border-[#dfc4b4] bg-white/55 p-5">
                            <h2 className="flex items-center gap-2 font-titulo text-xl font-bold text-primaria">
                                <Icone nome="calculate" />
                                Elaborar Orçamento da Ocorrência
                            </h2>

                            <p className="mt-2 text-sm text-texto-suave">
                                Selecione uma ocorrência real e defina os custos estimados
                                pela instituição antes da confirmação.
                            </p>

                            <div className="mt-5">
                                <label htmlFor="orcamento-ocorrencia" className="mb-2 block text-sm font-semibold text-primaria">
                                    Ocorrência
                                </label>

                                <select
                                    id="orcamento-ocorrencia"
                                    value={ocorrenciaId}
                                    onChange={(evento) => selecionarOcorrencia(evento.target.value)}
                                    className={campoClasse}
                                >
                                    <option value="">Selecione uma ocorrência</option>
                                    {ocorrencias.map((ocorrencia) => (
                                        <option key={ocorrencia.id} value={ocorrencia.id}>
                                            {ocorrencia.protocolo} — {ocorrencia.categoria}
                                        </option>
                                    ))}
                                </select>

                                {ocorrencias.length === 0 && (
                                    <p className="mt-3 text-sm text-texto-suave">
                                        Nenhuma ocorrência disponível. Os registros precisam
                                        estar conectados à mesma fonte de dados desta página.
                                    </p>
                                )}

                                {ocorrenciaSelecionada && (
                                    <div className="mt-4 grid gap-3 rounded-lg bg-fundo p-4 text-sm sm:grid-cols-3">
                                        <div>
                                            <span className="text-texto-suave">Protocolo</span>
                                            <p className="font-semibold">{ocorrenciaSelecionada.protocolo}</p>
                                        </div>
                                        <div>
                                            <span className="text-texto-suave">Status</span>
                                            <p className="font-semibold">{ocorrenciaSelecionada.status}</p>
                                        </div>
                                        <div>
                                            <span className="text-texto-suave">Prioridade</span>
                                            <p className="font-semibold">
                                                {ocorrenciaSelecionada.prioridade ?? 'Não definida'}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {orcamentoExistente && (
                                    <p className="mt-4 rounded-lg border border-green-700/30 bg-green-50 p-3 text-sm text-green-800">
                                        Esta ocorrência já possui orçamento confirmado em{' '}
                                        {new Date(orcamentoExistente.dataConfirmacao).toLocaleString('pt-BR')}.
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="rounded-xl border border-[#dfc4b4] bg-white/55 p-5">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <h2 className="flex items-center gap-2 font-titulo text-lg font-bold text-primaria">
                                    <Icone nome="receipt_long" />
                                    Composição dos Custos
                                </h2>

                                <button
                                    type="button"
                                    onClick={() => setItens((anteriores) => [...anteriores, novaLinha()])}
                                    disabled={!ocorrenciaId || Boolean(orcamentoExistente)}
                                    className={botaoSecundario}
                                >
                                    <Icone nome="add" classe="text-lg" />
                                    Adicionar Item
                                </button>
                            </div>

                            <div className="mt-5 space-y-4">
                                {itens.map((item, indice) => (
                                    <div key={item.id} className="rounded-lg border border-[#e3cabb] bg-fundo/70 p-4">
                                        <div className="mb-3 flex items-center justify-between">
                                            <h3 className="text-sm font-semibold text-primaria">
                                                Item {indice + 1}
                                            </h3>

                                            <button
                                                type="button"
                                                aria-label={`Remover item ${indice + 1}`}
                                                disabled={itens.length === 1 || Boolean(orcamentoExistente)}
                                                onClick={() => setItens((anteriores) => anteriores.filter((atual) => atual.id !== item.id))}
                                                className="text-primaria disabled:opacity-30"
                                            >
                                                <Icone nome="delete_outline" />
                                            </button>
                                        </div>

                                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[1.7fr_1fr_0.7fr_1fr]">
                                            <div>
                                                <label className="mb-1 block text-xs font-semibold">Descrição</label>
                                                <input
                                                    value={item.descricao}
                                                    onChange={(evento) => atualizarItem(item.id, 'descricao', evento.target.value)}
                                                    disabled={Boolean(orcamentoExistente)}
                                                    placeholder="Ex.: Substituição de luminária"
                                                    className={campoClasse}
                                                />
                                            </div>

                                            <div>
                                                <label className="mb-1 block text-xs font-semibold">Tipo de custo</label>
                                                <select
                                                    value={item.tipo}
                                                    onChange={(evento) => atualizarItem(item.id, 'tipo', evento.target.value)}
                                                    disabled={Boolean(orcamentoExistente)}
                                                    className={campoClasse}
                                                >
                                                    <option>Material</option>
                                                    <option>Mão de obra</option>
                                                    <option>Serviço</option>
                                                    <option>Outros</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="mb-1 block text-xs font-semibold">Quantidade</label>
                                                <input
                                                    type="number"
                                                    min="0.01"
                                                    step="any"
                                                    value={item.quantidade}
                                                    onChange={(evento) => atualizarItem(item.id, 'quantidade', Number(evento.target.value))}
                                                    disabled={Boolean(orcamentoExistente)}
                                                    className={campoClasse}
                                                />
                                            </div>

                                            <div>
                                                <label className="mb-1 block text-xs font-semibold">Valor unitário (R$)</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={item.valorUnitario}
                                                    onChange={(evento) => atualizarItem(item.id, 'valorUnitario', Number(evento.target.value))}
                                                    disabled={Boolean(orcamentoExistente)}
                                                    className={campoClasse}
                                                />
                                            </div>
                                        </div>

                                        <p className="mt-3 text-right text-sm">
                                            Subtotal:{' '}
                                            <strong className="text-primaria">
                                                {moeda(item.quantidade * item.valorUnitario)}
                                            </strong>
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
                            <div className="rounded-xl border border-[#dfc4b4] bg-white/55 p-5">
                                <h2 className="font-titulo text-lg font-bold text-primaria">
                                    Observações da Instituição
                                </h2>

                                <textarea
                                    rows={7}
                                    value={observacoes}
                                    onChange={(evento) => setObservacoes(evento.target.value)}
                                    disabled={Boolean(orcamentoExistente)}
                                    placeholder="Descreva a justificativa do orçamento, os serviços previstos e outras informações relevantes..."
                                    className={`${campoClasse} mt-4 resize-y`}
                                />
                            </div>

                            <div className="rounded-xl border border-[#dfc4b4] bg-white/55 p-5">
                                <h2 className="flex items-center gap-2 font-titulo text-lg font-bold text-primaria">
                                    <Icone nome="account_balance_wallet" />
                                    Resumo Orçamentário
                                </h2>

                                <div className="mt-5 space-y-3">
                                    {totaisPorTipo.map(({ tipo, valor }) => (
                                        <div key={tipo} className="flex justify-between gap-3 border-b border-[#ead7ca] pb-3 text-sm">
                                            <span>{tipo}</span>
                                            <strong>{moeda(valor)}</strong>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-5 rounded-lg bg-[#f1e0d5] p-4">
                                    <p className="text-sm font-semibold text-primaria">
                                        Valor total estimado
                                    </p>
                                    <p className="mt-2 font-titulo text-3xl font-bold text-primaria">
                                        {moeda(totalOrcamento)}
                                    </p>
                                </div>

                                {erro && (
                                    <p role="alert" className="mt-4 text-sm text-red-700">
                                        {erro}
                                    </p>
                                )}

                                {mensagem && (
                                    <p role="status" className="mt-4 text-sm text-green-800">
                                        {mensagem}
                                    </p>
                                )}

                                <button
                                    type="button"
                                    onClick={confirmarOrcamento}
                                    disabled={!ocorrenciaSelecionada || Boolean(orcamentoExistente)}
                                    className={`${botaoPrimario} mt-5 w-full`}
                                >
                                    <Icone nome="check_circle" classe="text-xl" />
                                    Confirmar Orçamento
                                </button>

                                <p className="mt-3 text-xs leading-relaxed text-texto-suave">
                                    A confirmação salva o orçamento localmente. A publicação
                                    para o cidadão dependerá da integração com a API Java.
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Link to="/admin/gerenciar-ocorrencias" className={botaoSecundario}>
                                <Icone nome="list" classe="text-lg" />
                                Gerenciar Ocorrências
                            </Link>
                        </div>
                    </section>
                )}
            </div>
        </main>
    );
}
