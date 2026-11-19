import { apiRequest } from './api';

const ENDPOINT = '/polieus/autenticacao/usuario';
export interface AutenticacaoUsuario {
    idAutenticacao: number | null;
    email: string;
    senha: string;
}

export type DadosAutenticacao = Pick<
    AutenticacaoUsuario,
    'email' | 'senha'
>;

// POST - Cadastrar registro de autenticação
export async function cadastrarAutenticacao(
    dados: DadosAutenticacao
): Promise<AutenticacaoUsuario> {
    return apiRequest<AutenticacaoUsuario>(ENDPOINT, {
        method: 'POST',
        body: JSON.stringify(dados),
    });
}

// GET - Listar registros de autenticação
export async function listarAutenticacoes(): Promise<AutenticacaoUsuario[]> {
    return apiRequest<AutenticacaoUsuario[]>(ENDPOINT, {
        method: 'GET',
    });
}

// GET - Buscar autenticação pelo ID
export async function buscarAutenticacaoPorId(
    id: number
): Promise<AutenticacaoUsuario> {
    return apiRequest<AutenticacaoUsuario>(`${ENDPOINT}/${id}`, {
        method: 'GET',
    });
}

// PUT - Atualizar registro de autenticação
export async function atualizarAutenticacao(
    id: number,
    dados: DadosAutenticacao
): Promise<AutenticacaoUsuario> {
    return apiRequest<AutenticacaoUsuario>(`${ENDPOINT}/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
            idAutenticacao: id,
            ...dados,
        }),
    });
}

// DELETE - Excluir registro de autenticação
export async function excluirAutenticacao(
    id: number
): Promise<void> {
    return apiRequest<void>(`${ENDPOINT}/${id}`, {
        method: 'DELETE',
    });
}
