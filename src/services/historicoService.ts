import { apiRequest } from './api';

export interface Historico {
  idHistorico: number | null;
  protocolo: string;
  categoria: string;
  data: string;
  status: string;
}

// Dados enviados para cadastrar ou atualizar
export type DadosHistorico = Omit<Historico, 'idHistorico'>;

const ENDPOINT = '/polieus/historico';

// GET - Listar todos os históricos
export function listarHistoricos(): Promise<Historico[]> {
  return apiRequest<Historico[]>(ENDPOINT);
}

// GET - Buscar histórico pelo ID
export function buscarHistoricoPorId(
  id: number
): Promise<Historico> {
  return apiRequest<Historico>(`${ENDPOINT}/${id}`);
}

// POST - Cadastrar novo histórico
export function cadastrarHistorico(
  dados: DadosHistorico
): Promise<Historico> {
  return apiRequest<Historico>(ENDPOINT, {
    method: 'POST',
    body: JSON.stringify(dados),
  });
}

// PUT - Atualizar histórico existente
export function atualizarHistorico(
  id: number,
  dados: DadosHistorico
): Promise<Historico> {
  return apiRequest<Historico>(`${ENDPOINT}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(dados),
  });
}

// DELETE - Excluir histórico pelo ID
export function excluirHistorico(
  id: number
): Promise<void> {
  return apiRequest<void>(`${ENDPOINT}/${id}`, {
    method: 'DELETE',
  });
}
