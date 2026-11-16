
import { apiRequest } from './api';

export interface Ocorrencia {
  idOcorrencia: number;
  categoria: string;
  descricao: string;
  endereco: string;
  departamento: string;
  cep: string;
}

const ENDPOINT = '/polieus/ocorrencia';

// GET - Listar todas as ocorrências
export function listarOcorrencias(): Promise<Ocorrencia[]> {
  return apiRequest<Ocorrencia[]>(ENDPOINT);
}

// GET - Buscar uma ocorrência pelo ID
export function buscarOcorrenciaPorId(
  id: number
): Promise<Ocorrencia> {
  return apiRequest<Ocorrencia>(`${ENDPOINT}/${id}`);
}
