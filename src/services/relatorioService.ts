import { apiRequest } from './api';

export interface Relatorio {
    idRelatorio: number | null;
    categoria: string;
    prioridade: string;
}

export type DadosRelatorio = Omit<Relatorio, 'idRelatorio'>;

const ENDPOINT = '/polieus/relatorio';

function validarId(id: number): void {
    if (!Number.isInteger(id) || id <= 0) {
        throw new Error('Identificação do relatório inválida.');
    }
}

// GET - Listar relatórios

export async function listarRelatorios(): Promise<Relatorio[]> {
    const relatorios = await apiRequest<Relatorio[]>(ENDPOINT);

    if (!Array.isArray(relatorios)) {
        throw new Error('Resposta inválida ao consultar relatórios.');
    }

    return relatorios;
}

// GET - Buscar relatório pelo ID

export function buscarRelatorioPorId(id: number): Promise<Relatorio> {
    validarId(id);

    return apiRequest<Relatorio>(`${ENDPOINT}/${id}`);
}

// POST - Cadastrar relatório

export function cadastrarRelatorio(dados: DadosRelatorio): Promise<Relatorio> {
    return apiRequest<Relatorio>(ENDPOINT, {
        method: 'POST',
        body: JSON.stringify(dados),
    });
}

// PUT - Atualizar relatório

export function atualizarRelatorio(id: number, dados: DadosRelatorio): Promise<Relatorio> {
    validarId(id);

    return apiRequest<Relatorio>(`${ENDPOINT}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(dados),
    });
}

// DELETE - Excluir relatório

export function excluirRelatorio(id: number): Promise<void> {
    validarId(id);

    return apiRequest<void>(`${ENDPOINT}/${id}`, {
        method: 'DELETE',
    });
}