
/**
 * Configuração da API do Polieus.
 *
 * Prioriza a variável de ambiente VITE_API_URL.
 * Caso não esteja definida, utiliza a URL pública do Render.
 */

export const API_URL = (
  import.meta.env.VITE_API_URL?.trim() ||
  'https://polieus.onrender.com'
).replace(/\/+$/, '');
