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

// GET - Listar todas as ocorrências
export function listarOcorrencias(): Promise<Ocorrencia[]> {
  return apiRequest<Ocorrencia[]>(ENDPOINT);
}

// GET - Buscar ocorrência pelo ID
export function buscarOcorrenciaPorId(
  id: number
): Promise<Ocorrencia> {
  return apiRequest<Ocorrencia>(`${ENDPOINT}/${id}`);
}

// POST - Cadastrar nova ocorrência
export function cadastrarOcorrencia(
  dados: DadosOcorrencia
): Promise<Ocorrencia> {
  return apiRequest<Ocorrencia>(ENDPOINT, {
    method: 'POST',
    body: JSON.stringify(dados),
  });
}

// PUT - Atualizar ocorrência existente
export function atualizarOcorrencia(
  id: number,
  dados: DadosOcorrencia
): Promise<Ocorrencia> {
  return apiRequest<Ocorrencia>(`${ENDPOINT}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(dados),
  });
}

// DELETE - Excluir ocorrência
export function excluirOcorrencia(
  id: number
): Promise<void> {
  return apiRequest<void>(`${ENDPOINT}/${id}`, {
    method: 'DELETE',
  });
}
