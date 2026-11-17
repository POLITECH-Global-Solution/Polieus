import { apiRequest } from './api';

export interface Relatorio {
  idRelatorio: number | null;
  categoria: string;
  prioridade: string;
}

// Dados enviados para cadastrar ou atualizar
export type DadosRelatorio = Omit<Relatorio, 'idRelatorio'>;
const ENDPOINT = '/polieus/relatorio';

// GET - Listar todos os relatórios
export function listarRelatorios(): Promise<Relatorio[]> {
  return apiRequest<Relatorio[]>(ENDPOINT);
}

// GET - Buscar relatório pelo ID
export function buscarRelatorioPorId(
  id: number
): Promise<Relatorio> {
  return apiRequest<Relatorio>(`${ENDPOINT}/${id}`);
}

// POST - Cadastrar novo relatório
export function cadastrarRelatorio(
  dados: DadosRelatorio
): Promise<Relatorio> {
  return apiRequest<Relatorio>(ENDPOINT, {
    method: 'POST',
    body: JSON.stringify(dados),
  });
}

// PUT - Atualizar relatório existente
export function atualizarRelatorio(
  id: number,
  dados: DadosRelatorio
): Promise<Relatorio> {
  return apiRequest<Relatorio>(`${ENDPOINT}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(dados),
  });
}

// DELETE - Excluir relatório pelo ID
export function excluirRelatorio(
  id: number
): Promise<void> {
  return apiRequest<void>(`${ENDPOINT}/${id}`, {
    method: 'DELETE',
  });
}
