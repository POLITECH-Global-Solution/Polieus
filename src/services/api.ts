export const API_URL = (
    import.meta.env.VITE_API_URL?.trim() ||
    'https://polieus.onrender.com'
).replace(/\/+$/, '');

// REQUISIÇÕES À API JAVA
export async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {

    const headers = new Headers(options.headers);

    if (
        options.body &&
        !(options.body instanceof FormData) &&
        !headers.has('Content-Type')
    ) {
        headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(
        `${API_URL}/${endpoint.replace(/^\/+/, '')}`,
        {
            ...options,
            headers,
        }
    );

    // TRATAMENTO DE ERROS HTTP
    if (!response.ok) {
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