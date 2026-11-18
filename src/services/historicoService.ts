import { apiRequest } from './api';

export interface Historico {
    idHistorico: number | null;
    idOcorrencia: number;
    protocolo: string;
    categoria: string;
    data: string;
    status: string;
}

export type DadosHistorico = Omit<Historico, 'idHistorico'>;

const ENDPOINT = '/polieus/historico';

// ==================================================
// FUNÇÕES AUXILIARES
// ==================================================

function idValido(id: unknown): id is number {
    return typeof id === 'number' &&
        Number.isInteger(id) &&
        id > 0;
}

// Formatar data no padrão utilizado pelo Java
export function formatarDataHistorico(data: Date = new Date()): string {
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();

    return `${dia}-${mes}-${ano}`;
}

// Gerar protocolo utilizando o ID real da ocorrência
export function gerarProtocolo(idOcorrencia: number): string {

    if (!idValido(idOcorrencia)) {
        throw new Error('Identificação da ocorrência inválida.');
    }

    return `POL-${String(idOcorrencia).padStart(6, '0')}`;
}

// Preparar os dados no formato utilizado pelo Java
function prepararDadosHistorico(dados: DadosHistorico) {

    if (!idValido(dados.idOcorrencia)) {
        throw new Error('Identificação da ocorrência inválida.');
    }

    return {
        ...dados,
        idOcorrencia: String(dados.idOcorrencia),
    };
}

// ==================================================
// INTEGRAÇÃO COM A API JAVA
// ==================================================

// GET - Listar todos os históricos
export async function listarHistoricos(): Promise<Historico[]> {

    const historicos = await apiRequest<Historico[]>(ENDPOINT);

    if (!Array.isArray(historicos)) {
        throw new Error('Resposta inválida ao consultar históricos.');
    }

    return historicos;
}

// GET - Buscar histórico pelo ID
export function buscarHistoricoPorId(id: number): Promise<Historico> {
    return apiRequest<Historico>(`${ENDPOINT}/${id}`);
}

// GET - Listar históricos de uma ocorrência
export async function listarHistoricosPorOcorrencia(idOcorrencia: number): Promise<Historico[]> {

    if (!idValido(idOcorrencia)) {
        throw new Error('Identificação da ocorrência inválida.');
    }

    const historicos = await apiRequest<Historico[]>(
        `${ENDPOINT}/ocorrencia/${idOcorrencia}`
    );

    if (!Array.isArray(historicos)) {
        throw new Error('Resposta inválida ao consultar o histórico da ocorrência.');
    }

    return historicos.filter(
        historico => Number(historico.idOcorrencia) === idOcorrencia
    );
}

// POST - Cadastrar novo histórico
export async function cadastrarHistorico(dados: DadosHistorico): Promise<Historico> {

    const historico = await apiRequest<Historico | undefined>(ENDPOINT, {
        method: 'POST',
        body: JSON.stringify(prepararDadosHistorico(dados)),
    });

    // Caso o Java retorne o histórico cadastrado
    if (
        historico &&
        idValido(historico.idHistorico) &&
        Number(historico.idOcorrencia) === dados.idOcorrencia
    ) {
        return historico;
    }

    // Caso o Java retorne 201 sem conteúdo
    try {

        const historicos = await listarHistoricosPorOcorrencia(
            dados.idOcorrencia
        );

        const encontrados = historicos.filter(item =>
            item.protocolo === dados.protocolo &&
            item.categoria === dados.categoria &&
            item.data === dados.data &&
            item.status === dados.status
        );

        if (encontrados.length === 1) {
            return encontrados[0];
        }

    } catch (erro) {
        console.error('Não foi possível consultar o histórico cadastrado:', erro);
    }

    // Não inventar um ID para o histórico
    return {
        ...dados,
        idHistorico: null,
    };
}

// PUT - Atualizar histórico existente
export function atualizarHistorico(id: number, dados: DadosHistorico): Promise<Historico> {

    return apiRequest<Historico>(`${ENDPOINT}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(prepararDadosHistorico(dados)),
    });
}

// PUT - Atualizar status da ocorrência
export function atualizarStatusOcorrencia(
    idOcorrencia: number,
    dados: DadosHistorico
): Promise<Historico> {

    return apiRequest<Historico>(
        `${ENDPOINT}/ocorrencia/${idOcorrencia}/status`,
        {
            method: 'PUT',
            body: JSON.stringify(
                prepararDadosHistorico({
                    ...dados,
                    idOcorrencia,
                })
            ),
        }
    );
}

// DELETE - Excluir histórico pelo ID
export function excluirHistorico(id: number): Promise<void> {

    return apiRequest<void>(`${ENDPOINT}/${id}`, {
        method: 'DELETE',
    });
}

// ==================================================
// GERENCIAMENTO DO HISTÓRICO
// ==================================================

// Converter data brasileira para ordenação cronológica
function converterData(data: string): number {

    const partes = data?.match(/^(\d{2})-(\d{2})-(\d{4})$/);

    if (!partes) return 0;

    const dia = Number(partes[1]);
    const mes = Number(partes[2]);
    const ano = Number(partes[3]);

    const resultado = new Date(ano, mes - 1, dia);

    if (
        resultado.getFullYear() !== ano ||
        resultado.getMonth() !== mes - 1 ||
        resultado.getDate() !== dia
    ) {
        return 0;
    }

    return resultado.getTime();
}

// Ordenar históricos cronologicamente
export function ordenarHistoricos(historicos: Historico[]): Historico[] {

    return [...historicos].sort((a, b) =>
        converterData(a.data) - converterData(b.data) ||
        (a.idHistorico ?? 0) - (b.idHistorico ?? 0)
    );
}

// Recuperar o primeiro histórico da ocorrência
export function obterHistoricoInicial(historicos: Historico[]): Historico | null {

    const ordenados = ordenarHistoricos(historicos);

    return ordenados[0] ?? null;
}

// Recuperar o histórico mais recente
export function obterHistoricoAtual(historicos: Historico[]): Historico | null {

    const ordenados = ordenarHistoricos(historicos);

    return ordenados[ordenados.length - 1] ?? null;
}

// ==================================================
// HISTÓRICO INICIAL DA OCORRÊNCIA
// ==================================================

export async function cadastrarHistoricoInicial(
    idOcorrencia: number,
    categoria: string
): Promise<Historico> {

    if (!idValido(idOcorrencia)) {
        throw new Error('Identificação da ocorrência inválida.');
    }

    // Verificar se a ocorrência já possui histórico
    const historicos = await listarHistoricosPorOcorrencia(idOcorrencia);

    const historicoExistente = obterHistoricoInicial(historicos);

    if (historicoExistente) {
        return historicoExistente;
    }

    // Criar o histórico inicial
    const dados: DadosHistorico = {
        idOcorrencia,
        protocolo: gerarProtocolo(idOcorrencia),
        categoria,
        data: formatarDataHistorico(),
        status: 'Pendente',
    };

    return cadastrarHistorico(dados);
}