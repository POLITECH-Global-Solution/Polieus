export const API_URL = (
    import.meta.env.VITE_API_URL?.trim() ||
    'https://polieus.onrender.com'
).replace(/\/+$/, '');

const MAX_TENTATIVAS = 5;
const TEMPO_ESPERA = 3000;

const ERROS_TEMPORARIOS = [
    408, 429, 500, 502, 503, 504
];

function aguardar(tempo: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, tempo));
}

export async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {

    const headers = new Headers(options.headers);
    const metodo = (options.method ?? 'GET').toUpperCase();

    if (
        options.body &&
        !(options.body instanceof FormData) &&
        !headers.has('Content-Type')
    ) {
        headers.set('Content-Type', 'application/json');
    }

    const url = `${API_URL}/${endpoint.replace(/^\/+/, '')}`;

    const tentativas = metodo === 'GET' ? MAX_TENTATIVAS : 1;

    for (let tentativa = 1; tentativa <= tentativas; tentativa++) {
        let response: Response;

        try {

            response = await fetch(url, {
                ...options,
                headers,
            });

        } catch (erro) {

            if (tentativa === tentativas || options.signal?.aborted) {
                throw erro;
            }

            console.warn(
                `[API] Falha na conexão. Tentativa ${tentativa}/${tentativas}: ${endpoint}`
            );

            await aguardar(TEMPO_ESPERA * tentativa);

            continue;
        }

        // TRATAMENTO DE ERROS HTTP
        if (!response.ok) {

            const erroTemporario = ERROS_TEMPORARIOS.includes(
                response.status
            );

            if (erroTemporario && tentativa < tentativas && !options.signal?.aborted) {

                console.warn(
                    `[API] Servidor temporariamente indisponível (${response.status}). Tentando novamente...`
                );

                await aguardar(TEMPO_ESPERA * tentativa);

                continue;
            }

            throw new Error(`Erro na API: ${response.status}`);
        }

        // TRATAMENTO DE RESPOSTAS SEM CONTEÚDO
        if (response.status === 204) {
            return undefined as T;
        }

        const conteudo = await response.text();

        // RESPOSTAS BEM-SUCEDIDAS SEM CORPO
        if (!conteudo.trim()) {
            return undefined as T;
        }

        // CONVERTER RESPOSTA JSON
        return JSON.parse(conteudo) as T;
    }

    throw new Error('Não foi possível conectar à API Java.');
}