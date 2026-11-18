import { apiRequest } from './api';

export interface Ocorrencia {
    idOcorrencia: number | null;
    idUsuario: number;
    categoria: string;
    descricao: string;
    endereco: string;
    departamento: string;
    cep: string;
}

export type DadosOcorrencia = Omit<Ocorrencia, 'idOcorrencia'>;

const ENDPOINT = '/polieus/ocorrencia';

// ==================================================
// FUNÇÕES AUXILIARES
// ==================================================

function idValido(id: unknown): id is number {
    return typeof id === 'number' &&
        Number.isInteger(id) &&
        id > 0;
}

function normalizarTexto(texto: string): string {
    return texto.trim().toLowerCase();
}

function normalizarCep(cep: string): string {
    return cep.replace(/\D/g, '');
}

function compararOcorrencia(ocorrencia: Ocorrencia, dados: DadosOcorrencia): boolean {
    return (
        ocorrencia.idUsuario === dados.idUsuario &&
        normalizarTexto(ocorrencia.categoria) === normalizarTexto(dados.categoria) &&
        normalizarTexto(ocorrencia.descricao) === normalizarTexto(dados.descricao) &&
        normalizarTexto(ocorrencia.endereco) === normalizarTexto(dados.endereco) &&
        normalizarTexto(ocorrencia.departamento) === normalizarTexto(dados.departamento) &&
        normalizarCep(ocorrencia.cep) === normalizarCep(dados.cep)
    );
}

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
export async function cadastrarOcorrencia(dados: DadosOcorrencia): Promise<Ocorrencia> {

    if (!idValido(dados.idUsuario)) {
        throw new Error('Identificação do usuário inválida.');
    }

    // Consultar as ocorrências anteriores ao cadastro
    const ocorrenciasAnteriores = await listarMinhasOcorrencias(dados.idUsuario);

    const idsAnteriores = new Set(
        ocorrenciasAnteriores
            .map(ocorrencia => ocorrencia.idOcorrencia)
            .filter(idValido)
    );

    // Enviar a nova ocorrência ao Java
    const ocorrencia = await apiRequest<Ocorrencia | undefined>(ENDPOINT, {
        method: 'POST',
        body: JSON.stringify(dados),
    });

    // Caso o Java retorne a ocorrência cadastrada
    if (
        ocorrencia &&
        idValido(ocorrencia.idOcorrencia) &&
        ocorrencia.idUsuario === dados.idUsuario
    ) {
        return ocorrencia;
    }

    // Caso o Java retorne 201 sem conteúdo
    // Consultar novamente sem repetir o POST
    try {

        const ocorrenciasAtuais = await listarMinhasOcorrencias(dados.idUsuario);

        const novasOcorrencias = ocorrenciasAtuais.filter(item =>
            idValido(item.idOcorrencia) &&
            !idsAnteriores.has(item.idOcorrencia) &&
            compararOcorrencia(item, dados)
        );

        // Retornar somente quando houver uma identificação inequívoca
        if (novasOcorrencias.length === 1) {
            return novasOcorrencias[0];
        }

    } catch (erro) {
        console.error('Não foi possível identificar a ocorrência cadastrada:', erro);
    }

    // O POST foi bem-sucedido, mas não foi possível recuperar o ID
    return {
        ...dados,
        idOcorrencia: null,
    };
}

// PUT - Atualizar ocorrência existente
export function atualizarOcorrencia(id: number, dados: DadosOcorrencia): Promise<Ocorrencia> {
    return apiRequest<Ocorrencia>(`${ENDPOINT}/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
            ...dados,
            idOcorrencia: id,
        }),
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

        if (!idValido(usuario?.idUsuario)) {
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

// GET - Listar ocorrências por usuário
export async function listarMinhasOcorrencias(idUsuario: number): Promise<Ocorrencia[]> {

    if (!idValido(idUsuario)) {
        throw new Error('Identificação do usuário inválida.');
    }

    const ocorrencias = await apiRequest<Ocorrencia[]>(
        `${ENDPOINT}/usuario/${idUsuario}`
    );

    if (!Array.isArray(ocorrencias)) {
        throw new Error('Resposta inválida ao consultar suas ocorrências.');
    }

    return ocorrencias.filter(
        ocorrencia => ocorrencia.idUsuario === idUsuario
    );
}

// Contabilizar ocorrências do cidadão
export async function contarMinhasOcorrencias(idUsuario: number): Promise<number> {

    const ocorrencias = await listarMinhasOcorrencias(idUsuario);

    return ocorrencias.length;
}