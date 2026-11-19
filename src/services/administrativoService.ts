import { apiRequest } from './api';
export interface Administrador {
    idAdmin: number;
    nomeAdmin: string;
    email: string;
    instituicao: string;
    cargo: string;
}
export interface DadosAdministrador {
    nomeAdmin: string;
    email: string;
    instituicao: string;
    cargo: string;
    cdConvite: string;
    senha: string;
}
export interface DadosLoginAdmin {
    email: string;
    senha: string;
}

const ENDPOINT = '/polieus/administrativo';

export const CODIGO_CONVITE_ADMIN = '260921';

function idValido(id: unknown): id is number {
    return typeof id === 'number' && Number.isInteger(id) && id > 0;
}

function obterDadosAdministrador(admin: Administrador): Administrador {
    if (!admin || !idValido(admin.idAdmin)) {
        throw new Error('Identificação do administrador inválida.');
    }

    return {
        idAdmin: admin.idAdmin,
        nomeAdmin: admin.nomeAdmin,
        email: admin.email,
        instituicao: admin.instituicao,
        cargo: admin.cargo,
    };
}

// CADASTRAR ADMINISTRADOR
export async function cadastrarAdministrador(dados: DadosAdministrador): Promise<void> {
    if (dados.cdConvite !== CODIGO_CONVITE_ADMIN) {
        throw new Error('Código de convite administrativo inválido.');
    }

    await apiRequest(ENDPOINT, {
        method: 'POST',
        body: JSON.stringify(dados),
    });
}

// LOGIN ADMINISTRATIVO
export async function loginAdministrador(dados: DadosLoginAdmin): Promise<Administrador> {
    const administrador = await apiRequest<Administrador>(`${ENDPOINT}/login`, {
        method: 'POST',
        body: JSON.stringify(dados),
    });

    return obterDadosAdministrador(administrador);
}

// LISTAR ADMINISTRADORES
export async function listarAdministradores(): Promise<Administrador[]> {
    const administradores = await apiRequest<Administrador[]>(ENDPOINT);

    if (!Array.isArray(administradores)) {
        throw new Error('Resposta inválida ao consultar administradores.');
    }

    return administradores.map(obterDadosAdministrador);
}

// BUSCAR ADMINISTRADOR POR ID
export async function buscarAdministradorPorId(id: number): Promise<Administrador> {
    if (!idValido(id)) {
        throw new Error('Identificação do administrador inválida.');
    }

    const administrador = await apiRequest<Administrador>(`${ENDPOINT}/${id}`);

    return obterDadosAdministrador(administrador);
}

// ATUALIZAR ADMINISTRADOR
export async function atualizarAdministrador(id: number, dados: DadosAdministrador): Promise<Administrador> {
    if (!idValido(id)) {
        throw new Error('Identificação do administrador inválida.');
    }

    const administrador = await apiRequest<Administrador>(`${ENDPOINT}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(dados),
    });

    return obterDadosAdministrador(administrador);
}

// EXCLUIR ADMINISTRADOR
export async function excluirAdministrador(id: number): Promise<void> {
    if (!idValido(id)) {
        throw new Error('Identificação do administrador inválida.');
    }

    await apiRequest<void>(`${ENDPOINT}/${id}`, {
        method: 'DELETE',
    });
}

// SALVAR SESSÃO ADMINISTRATIVA
export function salvarSessaoAdministrador(administrador: Administrador): void {
    sessionStorage.setItem(
        'administrador',
        JSON.stringify(obterDadosAdministrador(administrador))
    );
}

// RECUPERAR SESSÃO ADMINISTRATIVA
export function obterAdministradorLogado(): Administrador | null {
    try {
        const dados = sessionStorage.getItem('administrador');

        if (!dados) return null;

        const administrador = JSON.parse(dados);

        return obterDadosAdministrador(administrador);

    } catch {
        return null;
    }
}

export function obterAdministradorId(): number | null {
    return obterAdministradorLogado()?.idAdmin ?? null;
}

// VERIFICAR SESSÃO ADMINISTRATIVA
export function administradorLogado(): boolean {
    return obterAdministradorId() !== null;
}

export function logoutAdministrador(): void {
    sessionStorage.removeItem('administrador');
}