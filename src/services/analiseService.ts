import { apiRequest } from './api';

export type Prioridade = 'Alta' | 'Média' | 'Baixa';

export interface Analise {
    idAnalise: number | null;
    protocolo: string;
    categoria: string;
    localizacao: string;
    prioridade: string;
    status: string;
    data: string;
}

export type DadosAnalise = Omit<Analise, 'idAnalise'>;

const ENDPOINT = '/polieus/analise';

// NORMALIZAÇÃO

export function normalizarProtocolo(protocolo: string): string {
    return String(protocolo ?? '').trim().toUpperCase();
}

export function normalizarPrioridade(valor?: string | null): Prioridade | null {

    const prioridade = String(valor ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .toLowerCase();

    switch (prioridade) {
        case 'alta':
            return 'Alta';

        case 'media':
            return 'Média';

        case 'baixa':
            return 'Baixa';

        default:
            return null;
    }
}

// GET - LISTAR ANÁLISES

export async function listarAnalises(): Promise<Analise[]> {

    const analises = await apiRequest<Analise[]>(ENDPOINT, {
        cache: 'no-store',
    });

    if (!Array.isArray(analises)) {
        throw new Error('Resposta inválida ao consultar análises.');
    }

    return analises;
}

// GET - BUSCAR PELO ID

export function buscarAnalisePorId(id: number): Promise<Analise> {

    return apiRequest<Analise>(`${ENDPOINT}/${id}`, {
        cache: 'no-store',
    });
}

// POST - CADASTRAR ANÁLISE

export function cadastrarAnalise(dados: DadosAnalise): Promise<Analise> {

    return apiRequest<Analise>(ENDPOINT, {
        method: 'POST',
        body: JSON.stringify(dados),
    });
}

// PUT - ATUALIZAR ANÁLISE

export function atualizarAnalise(id: number, dados: DadosAnalise): Promise<Analise> {

    return apiRequest<Analise>(`${ENDPOINT}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(dados),
    });
}

// DELETE - EXCLUIR ANÁLISE

export function excluirAnalise(id: number): Promise<void> {

    return apiRequest<void>(`${ENDPOINT}/${id}`, {
        method: 'DELETE',
    });
}

// LOCALIZAR ANÁLISE PELO PROTOCOLO

export function obterAnalisePorProtocolo(
    analises: Analise[],
    protocolo: string
): Analise | null {

    const protocoloNormalizado = normalizarProtocolo(protocolo);

    if (!protocoloNormalizado) {
        return null;
    }

    const encontradas = analises.filter(
        analise =>
            normalizarProtocolo(analise.protocolo) === protocoloNormalizado
    );

    if (encontradas.length > 1) {
        throw new Error('Existe mais de uma análise para este protocolo.');
    }

    return encontradas[0] ?? null;
}

// CONSULTAR ANÁLISE DIRETAMENTE NA API

export async function buscarAnalisePorProtocolo(
    protocolo: string
): Promise<Analise | null> {

    const analises = await listarAnalises();

    return obterAnalisePorProtocolo(analises, protocolo);
}

// CONSULTAR PRIORIDADE

export function obterPrioridadePorProtocolo(
    analises: Analise[],
    protocolo: string
): Prioridade | null {

    const analise = obterAnalisePorProtocolo(analises, protocolo);

    return normalizarPrioridade(analise?.prioridade);
}

// SALVAR PRIORIDADE NO BANCO DE DADOS

export async function salvarPrioridadeOcorrencia(
    dados: DadosAnalise
): Promise<Analise> {

    const protocolo = normalizarProtocolo(dados.protocolo);
    const prioridade = normalizarPrioridade(dados.prioridade);

    if (!protocolo) {
        throw new Error('Protocolo da ocorrência inválido.');
    }

    if (!prioridade) {
        throw new Error('Selecione uma prioridade válida.');
    }

    const existente = await buscarAnalisePorProtocolo(protocolo);

    const dadosAtualizados: DadosAnalise = {
        protocolo,
        categoria: dados.categoria,
        localizacao: dados.localizacao,
        prioridade,
        status: dados.status,
        data: dados.data,
    };

    if (existente) {

        if (
            existente.idAnalise === null ||
            !Number.isInteger(existente.idAnalise) ||
            existente.idAnalise <= 0
        ) {
            throw new Error('Identificação da análise inválida.');
        }

        await atualizarAnalise(
            existente.idAnalise,
            dadosAtualizados
        );

    } else {

        await cadastrarAnalise(dadosAtualizados);
    }

    // CONSULTAR NOVAMENTE O BANCO DE DADOS

    const confirmada = await buscarAnalisePorProtocolo(protocolo);

    if (
        !confirmada ||
        normalizarPrioridade(confirmada.prioridade) !== prioridade
    ) {
        throw new Error(
            'Não foi possível confirmar o armazenamento da prioridade na API Java.'
        );
    }

    return confirmada;
}