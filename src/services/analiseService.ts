import { apiRequest } from './api';

export interface Analise {
  idAnalise: number | null;
  protocolo: string;
  categoria: string;
  localizacao: string;
  prioridade: string;
  status: string;
  data: string;
}

// Dados enviados para cadastrar ou atualizar
export type DadosAnalise = Omit<Analise, 'idAnalise'>;
const ENDPOINT = '/polieus/analise';

// GET - Listar todas as análises
export function listarAnalises(): Promise<Analise[]> {
  return apiRequest<Analise[]>(ENDPOINT);
}

// GET - Buscar análise pelo ID
export function buscarAnalisePorId(
  id: number
): Promise<Analise> {
  return apiRequest<Analise>(`${ENDPOINT}/${id}`);
}

// POST - Cadastrar nova análise
export function cadastrarAnalise(
  dados: DadosAnalise
): Promise<Analise> {
  return apiRequest<Analise>(ENDPOINT, {
    method: 'POST',
    body: JSON.stringify(dados),
  });
}

// PUT - Atualizar análise existente
export function atualizarAnalise(
  id: number,
  dados: DadosAnalise
): Promise<Analise> {
  return apiRequest<Analise>(`${ENDPOINT}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(dados),
  });
}

// DELETE - Excluir análise pelo ID
export function excluirAnalise(
  id: number
): Promise<void> {
  return apiRequest<void>(`${ENDPOINT}/${id}`, {
    method: 'DELETE',
  });
}
