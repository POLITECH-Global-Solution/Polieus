import { apiRequest } from './api';
export interface Ocorrencia {
    idOcorrencia: number | null;
    categoria: string;
    descricao: string;
    endereco: string;
    departamento: string;
    cep: string;
}

export type DadosOcorrencia = Omit<Ocorrencia, 'idOcorrencia'>;

const ENDPOINT = '/polieus/ocorrencia';

// ==================================================
// INTEGRAÇÃO COM A API JAVA
// ==================================================

// GET - Listar todas as ocorrências
export async function listarOcorrencias(): Promise<Ocorrencia[]> {
    const ocorrencias = await apiRequest<Ocorrencia[]>(ENDPOINT);

    if (!Array.isArray(ocorrencias)) {
        throw new Error('Resposta inválida ao consultar ocorrências.');
    }

    return ocorrencias;
}

// GET - Buscar ocorrência pelo ID
export function buscarOcorrenciaPorId(id: number): Promise<Ocorrencia> {
    return apiRequest<Ocorrencia>(`${ENDPOINT}/${id}`);
}

// POST - Cadastrar nova ocorrência
export function cadastrarOcorrencia(
    dados: DadosOcorrencia
): Promise<Ocorrencia | undefined> {
    return apiRequest<Ocorrencia | undefined>(ENDPOINT, {
        method: 'POST',
        body: JSON.stringify(dados),
    });
}

// PUT - Atualizar ocorrência existente
export function atualizarOcorrencia(
    id: number,
    dados: DadosOcorrencia
): Promise<Ocorrencia | undefined> {
    return apiRequest<Ocorrencia | undefined>(`${ENDPOINT}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(dados),
    });
}

// DELETE - Excluir ocorrência
export function excluirOcorrencia(id: number): Promise<void> {
    return apiRequest<void>(`${ENDPOINT}/${id}`, {
        method: 'DELETE',
    });
}

// ==================================================
// IDENTIFICAÇÃO DO CIDADÃO
// ==================================================

// Recuperar o ID do usuário conectado
export function obterUsuarioId(): number | null {
    try {
        const dados = sessionStorage.getItem('usuario');

        if (!dados) return null;

        const usuario = JSON.parse(dados);

        if (
            !Number.isInteger(usuario?.idUsuario) ||
            usuario.idUsuario <= 0
        ) {
            return null;
        }

        return usuario.idUsuario;

    } catch {
        return null;
    }
}

// ==================================================
// CONSULTA DAS OCORRÊNCIAS DO CIDADÃO
// ==================================================

export async function listarMinhasOcorrencias(
    idUsuario: number
): Promise<Ocorrencia[]> {
    if (!Number.isInteger(idUsuario) || idUsuario <= 0) {
        throw new Error('Identificação do usuário inválida.');
    }

    throw new Error(
        'A consulta de ocorrências por cidadão ainda não está disponível na integração com a API.'
    );
}

// Contabilizar ocorrências do cidadão
export async function contarMinhasOcorrencias(
    idUsuario: number
): Promise<number> {
    const ocorrencias = await listarMinhasOcorrencias(idUsuario);

    return ocorrencias.length;
}