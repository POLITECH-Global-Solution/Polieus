import { apiRequest } from './api';

export interface Usuario {
  idUsuario?: number | null;
  [campo: string]: unknown;
}

export type DadosUsuario = Record<string, unknown>;
const ENDPOINT = '/polieus/usuario';

// GET - Listar todos os usuários
export function listarUsuarios(): Promise<Usuario[]> {
  return apiRequest<Usuario[]>(ENDPOINT);
}

// GET - Buscar usuário pelo ID
export function buscarUsuarioPorId(
  id: number
): Promise<Usuario> {
  return apiRequest<Usuario>(`${ENDPOINT}/${id}`);
}

// POST - Cadastrar novo usuário
export function cadastrarUsuario(
  dados: DadosUsuario
): Promise<Usuario> {
  return apiRequest<Usuario>(ENDPOINT, {
    method: 'POST',
    body: JSON.stringify(dados),
  });
}

// PUT - Atualizar usuário existente
export function atualizarUsuario(
  id: number,
  dados: DadosUsuario
): Promise<Usuario> {
  return apiRequest<Usuario>(`${ENDPOINT}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(dados),
  });
}

// DELETE - Excluir usuário
export function excluirUsuario(
  id: number
): Promise<void> {
  return apiRequest<void>(`${ENDPOINT}/${id}`, {
    method: 'DELETE',
  });
}
