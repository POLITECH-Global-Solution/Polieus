import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { listarOcorrencias, listarMinhasOcorrencias, obterUsuarioId, type Ocorrencia } from '../../services/ocorrenciaService';
import { listarHistoricos, listarHistoricosPorOcorrencia, type Historico } from '../../services/historicoService';
import fundoInicio from '../../img/fundo_inicio.png';
const logoPolieus = '/favicons/logo_polieus3.png';

type Status = 'Pendente' | 'Em análise' | 'Em andamento' | 'Concluído' | 'Não informado';

type Regiao = {
    nome: string;
    cor: string;
};

type ItemFuncionalidade = {
    icone: string;
    titulo: string;
    descricao: string;
    caminho: string;
    acao: string;
};

type Indicadores = {
    total: number;
    resolvidas: number | null;
    analise: number | null;
    pendentes: number | null;
};

type OcorrenciaRecente = {
    id: number;
    categoria: string;
    descricao: string;
    protocolo: string;
    data: string;
    status: Status;
    ordem: number;
};

const REGIOES: Regiao[] = [
    { nome: 'Metropolitana', cor: '#771c1b' },
    { nome: 'Interior Norte', cor: '#a9362e' },
    { nome: 'Interior Oeste', cor: '#c75d50' },
    { nome: 'Interior Central', cor: '#e49a83' },
    { nome: 'Interior Sul', cor: '#d9ac85' },
    { nome: 'Litoral', cor: '#e7c6a8' },
];

const INDICADORES = [
    { icone: 'groups', nome: 'Ocorrências registradas', chave: 'total' },
    { icone: 'task_alt', nome: 'Concluídas', chave: 'resolvidas' },
    { icone: 'schedule', nome: 'Em análise', chave: 'analise' },
    { icone: 'report_problem', nome: 'Pendentes', chave: 'pendentes' },
] as const;

const FUNCIONALIDADES: ItemFuncionalidade[] = [
    {
        icone: 'add_location_alt',
        titulo: 'Registrar Ocorrência',
        descricao: 'Comunique problemas urbanos, descreva a situação e informe o local onde ela acontece.',
        caminho: '/registrar-ocorrencia',
        acao: 'Registrar agora',
    },
    {
        icone: 'map',
        titulo: 'Mapa de Ocorrências',
        descricao: 'Explore os registros distribuídos pelo estado de São Paulo e consulte suas informações.',
        caminho: '/mapa-ocorrencias',
        acao: 'Explorar mapa',
    },
    {
        icone: 'fact_check',
        titulo: 'Minhas Ocorrências',
        descricao: 'Consulte o histórico das suas solicitações e acompanhe as informações disponíveis.',
        caminho: '/minhas-ocorrencias',
        acao: 'Acompanhar registros',
    },
    {
        icone: 'bar_chart',
        titulo: 'Transparência',
        descricao: 'Conheça indicadores e estimativas que ajudam a compreender as demandas urbanas.',
        caminho: '/transparencia',
        acao: 'Ver indicadores',
    },
];

const ETAPAS = [
    {
        numero: '01',
        icone: 'edit_note',
        titulo: 'Descreva',
        descricao: 'Selecione a categoria e informe os detalhes do problema identificado.',
    },
    {
        numero: '02',
        icone: 'location_on',
        titulo: 'Localize',
        descricao: 'Preencha o endereço onde a ocorrência foi encontrada.',
    },
    {
        numero: '03',
        icone: 'task_alt',
        titulo: 'Registre',
        descricao: 'Revise as informações e conclua o registro da ocorrência.',
    },
    {
        numero: '04',
        icone: 'visibility',
        titulo: 'Acompanhe',
        descricao: 'Consulte o histórico e as atualizações disponibilizadas.',
    },
];

const CATEGORIAS = [
    {
        icone: 'lightbulb',
        titulo: 'Iluminação',
        descricao: 'Problemas relacionados a postes, lâmpadas e iluminação pública.',
    },
    {
        icone: 'water_drop',
        titulo: 'Saneamento',
        descricao: 'Questões relacionadas à água, esgoto e drenagem urbana.',
    },
    {
        icone: 'directions_bus',
        titulo: 'Transporte',
        descricao: 'Demandas relacionadas à mobilidade e ao transporte público.',
    },
    {
        icone: 'construction',
        titulo: 'Infraestrutura',
        descricao: 'Problemas em ruas, calçadas e equipamentos urbanos.',
    },
];

const CORES_STATUS: Record<Status, string> = {
    'Pendente': 'bg-[#e8ded5] text-[#554238]',
    'Em análise': 'bg-[#ffe0b2] text-[#9b510c]',
    'Em andamento': 'bg-[#f8c9bd] text-[#922c1d]',
    'Concluído': 'bg-[#dfe8c5] text-[#3e6029]',
    'Não informado': 'bg-[#e8ded5] text-[#554238]',
};

const ICONES_CATEGORIA: Record<string, string> = {
    'iluminacao': 'lightbulb',
    'iluminacao publica': 'lightbulb',
    'saneamento': 'water_drop',
    'sanitario': 'water_drop',
    'transporte': 'directions_bus',
    'transporte publico': 'directions_bus',
    'infraestrutura': 'construction',
    'estrada': 'construction',
    'limpeza urbana': 'cleaning_services',
    'seguranca': 'security',
    'meio ambiente': 'eco',
    'acessibilidade': 'accessible',
    'outros': 'assignment',
};

// ==================================================
// FUNÇÕES AUXILIARES
// ==================================================

function normalizarTexto(texto: string): string {
    return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

function normalizarStatus(valor?: string | null): Status {
    switch (normalizarTexto(valor ?? '')) {
        case 'pendente':
            return 'Pendente';

        case 'em analise':
            return 'Em análise';

        case 'em andamento':
            return 'Em andamento';

        case 'resolvida':
        case 'resolvido':
        case 'concluida':
        case 'concluido':
            return 'Concluído';

        default:
            return 'Não informado';
    }
}

function converterData(data: string): number {
    if (!data) return 0;

    const partes = data.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/);

    if (partes) {
        const [, dia, mes, ano] = partes;

        return new Date(Number(ano), Number(mes) - 1, Number(dia)).getTime();
    }

    const resultado = Date.parse(data);

    return Number.isNaN(resultado) ? 0 : resultado;
}

function formatarData(data: string): string {
    const valor = converterData(data);

    if (!valor) return 'Data não informada';

    return new Date(valor).toLocaleDateString('pt-BR');
}

function ordenarHistoricos(historicos: Historico[]): Historico[] {
    return [...historicos].sort((a, b) => {
        const diferenca = converterData(b.data) - converterData(a.data);

        return diferenca || (b.idHistorico ?? 0) - (a.idHistorico ?? 0);
    });
}

function obterHistoricoAtual(historicos: Historico[]): Historico | undefined {
    return ordenarHistoricos(historicos)[0];
}

function calcularIndicadores(ocorrencias: Ocorrencia[], historicos: Historico[]): Indicadores {
    const resultado: Indicadores = {
        total: ocorrencias.length,
        resolvidas: 0,
        analise: 0,
        pendentes: 0,
    };

    const historicosPorOcorrencia = new Map<number, Historico[]>();

    for (const historico of historicos) {
        const id = Number(historico.idOcorrencia);

        if (!Number.isInteger(id) || id <= 0) continue;

        const registros = historicosPorOcorrencia.get(id) || [];

        registros.push(historico);
        historicosPorOcorrencia.set(id, registros);
    }

    for (const ocorrencia of ocorrencias) {
        if (ocorrencia.idOcorrencia === null) continue;

        const registros = historicosPorOcorrencia.get(ocorrencia.idOcorrencia) || [];
        const atual = obterHistoricoAtual(registros);

        if (!atual) continue;

        const status = normalizarStatus(atual.status);

        if (status === 'Concluído') {
            resultado.resolvidas = (resultado.resolvidas ?? 0) + 1;
        }

        if (status === 'Em análise') {
            resultado.analise = (resultado.analise ?? 0) + 1;
        }

        if (status === 'Pendente') {
            resultado.pendentes = (resultado.pendentes ?? 0) + 1;
        }
    }

    return resultado;
}

// ==================================================
// COMPONENTES AUXILIARES
// ==================================================

function Icone({ nome, tamanho = 'text-2xl' }: { nome: string; tamanho?: string }) {
    return (
        <span className={`material-icons inline-flex shrink-0 items-center justify-center leading-none ${tamanho}`} aria-hidden="true">
            {nome}
        </span>
    );
}

function BotaoPrincipal({ to, children, icone = 'arrow_forward' }: { to: string; children: ReactNode; icone?: string }) {
    return (
        <Link to={to} className="inline-flex items-center justify-center gap-3 rounded-xl bg-primaria px-6 py-3.5 text-center text-sm font-bold shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-primaria-hover" style={{ color: '#ffffff' }}>
            {children}
            <Icone nome={icone} tamanho="text-lg" />
        </Link>
    );
}

function TituloSecao({ detalhe, titulo, descricao }: { detalhe: string; titulo: string; descricao?: string }) {
    return (
        <div className="mb-7">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-primaria">
                {detalhe}
            </p>

            <h2 className="font-titulo text-2xl font-bold text-primaria sm:text-3xl">
                {titulo}
            </h2>

            {descricao && (
                <p className="mt-3 max-w-3xl text-sm leading-7 text-texto-suave sm:text-base">
                    {descricao}
                </p>
            )}
        </div>
    );
}

// ==================================================
// MAPA ILUSTRATIVO DO ESTADO DE SÃO PAULO
// ==================================================

function MapaEstadoSP() {
    return (
        <div className="w-full">

            <div className="grid items-center gap-5 sm:grid-cols-[minmax(0,1fr)_150px]">

                <div className="flex items-center justify-center">

                    <svg viewBox="0 0 520 350" role="img" aria-label="Mapa ilustrativo do estado de São Paulo dividido em seis áreas coloridas" className="h-auto w-full max-w-lg" xmlns="http://www.w3.org/2000/svg">

                        <defs>
                            <clipPath id="sp-contorno-inicio">
                                <path d="M 32 199 L 45 190 55 176 69 171 80 158 95 151 103 138 118 131 125 116 140 109 151 92 164 97 176 83 191 88 204 75 220 86 238 81 254 91 270 85 285 96 300 92 315 104 330 99 345 113 359 110 372 124 388 122 401 137 416 139 428 153 443 160 452 174 466 180 475 195 490 202 498 215 486 224 472 220 460 229 447 226 433 240 421 238 410 250 395 256 386 271 373 277 361 292 348 295 336 313 322 307 314 294 300 289 288 274 271 267 260 251 243 246 232 232 216 229 204 218 187 221 174 212 157 215 145 204 129 209 116 198 101 201 87 191 73 195 60 189 47 199 Z" />
                            </clipPath>
                        </defs>

                        <g clipPath="url(#sp-contorno-inicio)">

                            <rect width="520" height="350" fill="#d9ac85" />

                            {/* Interior Oeste */}
                            <path d="M 0 0 H 225 L 210 90 235 130 210 170 242 215 180 250 0 255 Z" fill="#c75d50" stroke="#fff8f1" strokeWidth="3" />

                            {/* Interior Norte */}
                            <path d="M 205 0 H 520 V 155 L 425 160 390 145 345 157 300 139 265 153 235 130 210 90 Z" fill="#a9362e" stroke="#fff8f1" strokeWidth="3" />

                            {/* Interior Central */}
                            <path d="M 235 130 L 265 153 300 139 345 157 390 145 410 190 380 219 341 228 302 213 270 236 242 215 210 170 Z" fill="#e49a83" stroke="#fff8f1" strokeWidth="3" />

                            {/* Interior Sul */}
                            <path d="M 0 255 L 180 250 242 215 270 236 302 213 341 228 365 270 350 350 H 0 Z" fill="#d9ac85" stroke="#fff8f1" strokeWidth="3" />

                            {/* Metropolitana */}
                            <path d="M 390 145 L 425 160 460 172 500 204 470 230 440 245 410 250 380 219 410 190 Z" fill="#771c1b" stroke="#fff8f1" strokeWidth="3" />

                            {/* Litoral */}
                            <path d="M 341 228 L 380 219 410 250 440 245 470 230 520 215 V 350 H 350 L 365 270 Z" fill="#e7c6a8" stroke="#fff8f1" strokeWidth="3" />

                        </g>

                        <path d="M 32 199 L 45 190 55 176 69 171 80 158 95 151 103 138 118 131 125 116 140 109 151 92 164 97 176 83 191 88 204 75 220 86 238 81 254 91 270 85 285 96 300 92 315 104 330 99 345 113 359 110 372 124 388 122 401 137 416 139 428 153 443 160 452 174 466 180 475 195 490 202 498 215 486 224 472 220 460 229 447 226 433 240 421 238 410 250 395 256 386 271 373 277 361 292 348 295 336 313 322 307 314 294 300 289 288 274 271 267 260 251 243 246 232 232 216 229 204 218 187 221 174 212 157 215 145 204 129 209 116 198 101 201 87 191 73 195 60 189 47 199 Z" fill="none" stroke="#fff8f1" strokeWidth="3" strokeLinejoin="round" />

                    </svg>

                </div>

                {/* LEGENDA */}

                <div className="border-t border-[#d6aa90] pt-4 sm:border-l sm:border-t-0 sm:py-4 sm:pl-5">

                    <h3 className="mb-4 font-titulo text-sm font-bold text-primaria">
                        Regiões
                    </h3>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-1">

                        {REGIOES.map(regiao => (
                            <div key={regiao.nome} className="flex items-center gap-2">

                                <span className="h-3.5 w-3.5 shrink-0 rounded-full" style={{ backgroundColor: regiao.cor }} />

                                <span className="text-xs text-texto">
                                    {regiao.nome}
                                </span>

                            </div>
                        ))}

                    </div>

                </div>

            </div>

            <p className="mt-3 text-center text-xs text-texto-suave">
                Representação visual ilustrativa das regiões paulistas.
            </p>

        </div>
    );
}

// ==================================================
// PÁGINA INÍCIO
// ==================================================

export default function Inicio() {

    const [indicadores, setIndicadores] = useState<Indicadores | null>(null);
    const [ocorrenciasRecentes, setOcorrenciasRecentes] = useState<OcorrenciaRecente[]>([]);

    const [carregandoIndicadores, setCarregandoIndicadores] = useState(true);
    const [carregandoOcorrencias, setCarregandoOcorrencias] = useState(true);

    const [erroIndicadores, setErroIndicadores] = useState('');
    const [erroOcorrencias, setErroOcorrencias] = useState('');
    const [avisoHistoricos, setAvisoHistoricos] = useState('');

    const [tentativaIndicadores, setTentativaIndicadores] = useState(0);
    const [tentativaOcorrencias, setTentativaOcorrencias] = useState(0);

    // ==================================================
    // CARREGAR INDICADORES GERAIS DA PLATAFORMA
    // ==================================================

    useEffect(() => {

        let ativo = true;

        async function carregarIndicadores() {

            setCarregandoIndicadores(true);
            setErroIndicadores('');
            setIndicadores(null);

            try {

                const ocorrencias = await listarOcorrencias();

                if (!Array.isArray(ocorrencias)) {
                    throw new Error('Resposta inválida da API.');
                }

                if (!ativo) return;

                setIndicadores({
                    total: ocorrencias.length,
                    resolvidas: null,
                    analise: null,
                    pendentes: null,
                });

                try {

                    const historicos = await listarHistoricos();

                    if (!Array.isArray(historicos)) {
                        throw new Error('Resposta inválida dos históricos.');
                    }

                    if (ativo) {
                        setIndicadores(calcularIndicadores(ocorrencias, historicos));
                    }

                } catch (erro) {

                    console.error('Erro ao consultar históricos:', erro);

                    if (ativo) {
                        setErroIndicadores('Não foi possível consultar os indicadores de status.');
                    }
                }

            } catch (erro) {

                console.error('Erro ao carregar indicadores:', erro);

                if (ativo) {
                    setErroIndicadores('Não foi possível carregar os indicadores da plataforma.');
                }

            } finally {

                if (ativo) setCarregandoIndicadores(false);

            }
        }

        void carregarIndicadores();

        return () => {
            ativo = false;
        };

    }, [tentativaIndicadores]);

    // ==================================================
    // CARREGAR ÚLTIMAS OCORRÊNCIAS DO CIDADÃO
    // ==================================================

    useEffect(() => {

        let ativo = true;

        async function carregarOcorrenciasRecentes() {

            setCarregandoOcorrencias(true);
            setErroOcorrencias('');
            setAvisoHistoricos('');
            setOcorrenciasRecentes([]);

            try {

                const idUsuario = obterUsuarioId();

                if (!idUsuario) {
                    throw new Error('Usuário não identificado.');
                }

                const ocorrencias = await listarMinhasOcorrencias(idUsuario);

                if (!Array.isArray(ocorrencias)) {
                    throw new Error('Resposta inválida da API.');
                }

                const registrosValidos = ocorrencias.filter(
                    (ocorrencia): ocorrencia is Ocorrencia & { idOcorrencia: number } =>
                        typeof ocorrencia.idOcorrencia === 'number' &&
                        Number.isInteger(ocorrencia.idOcorrencia) &&
                        ocorrencia.idOcorrencia > 0 &&
                        ocorrencia.idUsuario === idUsuario
                );

                if (registrosValidos.length !== ocorrencias.length) {
                    throw new Error('Foram recebidos registros inválidos.');
                }

                const registros = await Promise.all(

                    registrosValidos.map(async ocorrencia => {

                        let historicos: Historico[] = [];
                        let erroHistorico = false;

                        try {

                            const resposta = await listarHistoricosPorOcorrencia(ocorrencia.idOcorrencia);

                            if (!Array.isArray(resposta)) {
                                throw new Error('Histórico inválido.');
                            }

                            historicos = resposta.filter(
                                historico => Number(historico.idOcorrencia) === ocorrencia.idOcorrencia
                            );

                        } catch {

                            erroHistorico = true;

                        }

                        const ordenados = ordenarHistoricos(historicos);
                        const atual = ordenados[0];
                        const primeiro = ordenados[ordenados.length - 1];

                        return {
                            erroHistorico,

                            ocorrencia: {
                                id: ocorrencia.idOcorrencia,
                                categoria: ocorrencia.categoria,
                                descricao: ocorrencia.descricao,
                                protocolo: atual?.protocolo || 'Não informado',
                                data: primeiro?.data || '',
                                status: normalizarStatus(atual?.status),
                                ordem: converterData(primeiro?.data || ''),
                            },
                        };
                    })
                );

                const recentes = registros
                    .map(registro => registro.ocorrencia)
                    .sort((a, b) => (b.ordem - a.ordem) || (b.id - a.id))
                    .slice(0, 3);

                if (ativo) {

                    setOcorrenciasRecentes(recentes);

                    if (registros.some(registro => registro.erroHistorico)) {
                        setAvisoHistoricos('Algumas informações do histórico não puderam ser carregadas.');
                    }
                }

            } catch (erro) {

                console.error('Erro ao consultar ocorrências recentes:', erro);

                if (ativo) {
                    setErroOcorrencias('Não foi possível carregar suas ocorrências.');
                }

            } finally {

                if (ativo) setCarregandoOcorrencias(false);

            }
        }

        void carregarOcorrenciasRecentes();

        return () => {
            ativo = false;
        };

    }, [tentativaOcorrencias]);

    return (

        <main className="min-h-screen w-full min-w-0 flex-1 bg-fundo font-corpo text-texto">

            {/* BANNER PRINCIPAL */}

            <section className="relative isolate overflow-hidden bg-[#f8eee4]">

                <div className="absolute inset-0 -z-20 bg-cover bg-center" style={{ backgroundImage: `url(${fundoInicio})` }} aria-hidden="true" />

                <div className="absolute inset-0 -z-10" style={{ background: 'linear-gradient(90deg, rgba(248,238,228,0.99) 0%, rgba(248,238,228,0.97) 38%, rgba(248,238,228,0.85) 58%, rgba(248,238,228,0.18) 100%)' }} aria-hidden="true" />

                <div className="mx-auto grid min-h-130 max-w-7xl items-center gap-10 px-6 py-14 lg:grid-cols-[260px_minmax(0,1fr)] lg:px-10 lg:py-20">

                    {/* LOGO */}

                    <div className="flex items-center justify-center">

                        <img src={logoPolieus} alt="Logotipo Polieus" className="w-56 max-w-full object-contain drop-shadow-md sm:w-64 lg:w-72" />

                    </div>

                    <div className="min-w-0 max-w-2xl">

                        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#d9b7a4] bg-[#fff8f1] px-4 py-2 text-xs font-bold uppercase tracking-wider text-primaria">

                            <Icone nome="account_balance" tamanho="text-base" />

                            Cidadania e tecnologia

                        </div>

                        <h1 className="font-titulo text-5xl font-bold tracking-wide text-primaria sm:text-6xl lg:text-7xl">
                            POLIEUS
                        </h1>

                        <p className="mt-3 font-titulo text-base font-semibold text-primaria sm:text-xl">
                            TECNOLOGIA A SERVIÇO DA CIDADANIA
                        </p>

                        <div className="my-5 h-px max-w-xl bg-[#c89a82]" />

                        <h2 className="font-titulo text-xl font-bold text-primaria sm:text-2xl">
                            Sua voz tem o poder de transformar a cidade.
                        </h2>

                        <p className="mt-4 text-base leading-8 text-texto">
                            O Polieus é uma plataforma que conecta tecnologia e participação cidadã para facilitar o registro de problemas urbanos, o acompanhamento de solicitações e o acesso a informações de interesse público.
                        </p>

                        <p className="mt-3 text-sm leading-7 text-texto-suave">
                            Nossa proposta é incentivar uma sociedade mais participativa, oferecendo ferramentas digitais que contribuam para identificar necessidades, ampliar a transparência e construir cidades melhores.
                        </p>

                        <div className="mt-7">

                            <BotaoPrincipal to="/sobre">
                                Conheça o Projeto
                            </BotaoPrincipal>

                        </div>

                    </div>

                </div>

            </section>

            <div className="mx-auto max-w-7xl space-y-14 px-4 py-9 sm:px-8 lg:px-10">

                {/* INDICADORES REAIS DA API */}

                <section aria-label="Indicadores da plataforma" aria-busy={carregandoIndicadores}>

                    <div className="grid overflow-hidden rounded-2xl border border-[#e3c5af] bg-[#f0dfd0] shadow-sm sm:grid-cols-2 xl:grid-cols-4">

                        {INDICADORES.map(item => (

                            <div key={item.nome} className="flex items-center gap-4 border-b border-[#dfbfa8] px-5 py-6 sm:border-r xl:border-b-0">

                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#fff8f1] text-primaria">

                                    <Icone nome={item.icone} tamanho="text-3xl" />

                                </div>

                                <div>

                                    {carregandoIndicadores ? (

                                        <div role="status" aria-label="Carregando indicador" className="flex h-9 items-center">

                                            <span className="h-6 w-6 animate-spin rounded-full border-4 border-[#dfc2ae] border-t-primaria" />

                                        </div>

                                    ) : (

                                        <p className="font-titulo text-3xl font-bold text-primaria">
                                            {indicadores?.[item.chave]?.toLocaleString('pt-BR') ?? '—'}
                                        </p>

                                    )}

                                    <p className="text-sm text-texto-suave">
                                        {item.nome}
                                    </p>

                                </div>

                            </div>

                        ))}

                    </div>

                    {erroIndicadores ? (

                        <div role="alert" className="mt-3 flex flex-wrap items-center justify-center gap-3 text-xs text-red-700">

                            <span>{erroIndicadores}</span>

                            <button type="button" onClick={() => setTentativaIndicadores(atual => atual + 1)} className="inline-flex cursor-pointer items-center gap-1 font-semibold text-primaria hover:underline">

                                <Icone nome="refresh" tamanho="text-base" />

                                Tentar novamente

                            </button>

                        </div>

                    ) : (

                        <p className="mt-3 text-center text-xs text-texto-suave">

                            {carregandoIndicadores
                                ? 'Consultando os registros da plataforma...'
                                : 'Indicadores gerais baseados nos registros disponíveis no sistema. Os status apresentados não abrangem necessariamente todas as ocorrências.'}

                        </p>

                    )}

                </section>

                {/* OCORRÊNCIAS E MAPA */}

                <section className="grid items-stretch gap-7 xl:grid-cols-2">

                    {/* ÚLTIMAS OCORRÊNCIAS */}

                    <div className="flex flex-col">

                        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">

                            <h2 className="border-l-4 border-primaria pl-4 font-titulo text-2xl font-bold text-primaria">
                                Últimas Ocorrências
                            </h2>

                            <Link to="/minhas-ocorrencias" className="flex items-center gap-2 text-sm font-semibold text-primaria hover:underline">

                                Meus registros

                                <Icone nome="arrow_forward" tamanho="text-lg" />

                            </Link>

                        </div>

                        <div className="flex flex-1 flex-col rounded-2xl border border-[#e3c5af] bg-[#fffaf5] shadow-sm" aria-busy={carregandoOcorrencias}>

                            {carregandoOcorrencias ? (

                                <div role="status" className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-12 text-center">

                                    <span className="h-10 w-10 animate-spin rounded-full border-4 border-[#dfc2ae] border-t-primaria" />

                                    <p className="text-sm text-texto-suave">
                                        Carregando suas ocorrências...
                                    </p>

                                </div>

                            ) : erroOcorrencias ? (

                                <div role="alert" className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">

                                    <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#f0dfd0] text-primaria">

                                        <Icone nome="error_outline" tamanho="text-4xl" />

                                    </div>

                                    <h3 className="font-titulo text-xl font-bold text-primaria">
                                        Não foi possível carregar
                                    </h3>

                                    <p className="mt-4 text-sm leading-7 text-texto-suave">
                                        {erroOcorrencias}
                                    </p>

                                    <button type="button" onClick={() => setTentativaOcorrencias(atual => atual + 1)} className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-primaria px-5 py-3 text-sm font-bold text-white hover:bg-primaria-hover" style={{ color: '#ffffff' }}>

                                        <Icone nome="refresh" tamanho="text-xl" />

                                        Tentar novamente

                                    </button>

                                </div>

                            ) : ocorrenciasRecentes.length === 0 ? (

                                <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">

                                    <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#f0dfd0] text-primaria">

                                        <Icone nome="assignment" tamanho="text-4xl" />

                                    </div>

                                    <h3 className="font-titulo text-xl font-bold text-primaria">
                                        Nenhuma ocorrência registrada
                                    </h3>

                                    <p className="mt-4 max-w-sm text-sm leading-7 text-texto-suave">
                                        Seus registros mais recentes aparecerão aqui. Você também pode contribuir relatando problemas encontrados em sua cidade.
                                    </p>

                                    <div className="mt-7">

                                        <BotaoPrincipal to="/registrar-ocorrencia" icone="add_circle_outline">
                                            Registrar Ocorrência
                                        </BotaoPrincipal>

                                    </div>

                                </div>

                            ) : (

                                <div className="flex flex-1 flex-col">

                                    {ocorrenciasRecentes.map(ocorrencia => (

                                        <article key={ocorrencia.id} className="border-b border-[#ead5c5] p-5 transition-colors hover:bg-[#f8eee5] sm:p-6">

                                            <div className="flex items-start gap-4">

                                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#f0dfd0] text-primaria">

                                                    <Icone nome={ICONES_CATEGORIA[normalizarTexto(ocorrencia.categoria)] || 'assignment'} tamanho="text-2xl" />

                                                </div>

                                                <div className="min-w-0 flex-1">

                                                    <div className="flex flex-wrap items-center justify-between gap-2">

                                                        <h3 className="font-titulo text-base font-bold text-primaria">
                                                            {ocorrencia.categoria}
                                                        </h3>

                                                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${CORES_STATUS[ocorrencia.status]}`}>

                                                            {ocorrencia.status}

                                                        </span>

                                                    </div>

                                                    <p className="mt-2 line-clamp-2 wrap-break-word text-sm leading-6 text-texto-suave">
                                                        {ocorrencia.descricao}
                                                    </p>

                                                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-texto-suave">

                                                        <span className="inline-flex items-center gap-1">

                                                            <Icone nome="tag" tamanho="text-base" />

                                                            {ocorrencia.protocolo === 'Não informado'
                                                                ? 'Sem protocolo'
                                                                : `Protocolo ${ocorrencia.protocolo}`}

                                                        </span>

                                                        <span className="inline-flex items-center gap-1">

                                                            <Icone nome="calendar_today" tamanho="text-base" />

                                                            {formatarData(ocorrencia.data)}

                                                        </span>

                                                    </div>

                                                </div>

                                            </div>

                                        </article>

                                    ))}

                                    {avisoHistoricos && (

                                        <div role="alert" className="mx-5 mt-4 rounded-lg bg-[#f4e8dd] p-3 text-xs text-texto-suave">

                                            {avisoHistoricos}

                                            <button type="button" onClick={() => setTentativaOcorrencias(atual => atual + 1)} className="ml-2 cursor-pointer font-semibold text-primaria hover:underline">

                                                Tentar novamente

                                            </button>

                                        </div>

                                    )}

                                    <div className="mt-auto flex justify-center p-5">

                                        <Link to="/minhas-ocorrencias" className="inline-flex items-center gap-2 text-sm font-bold text-primaria hover:underline">

                                            Ver todas as minhas ocorrências

                                            <Icone nome="arrow_forward" tamanho="text-lg" />

                                        </Link>

                                    </div>

                                </div>

                            )}

                        </div>

                    </div>

                    {/* MAPA REGIONAL */}

                    <div className="flex flex-col rounded-2xl border border-[#e3c5af] bg-[#f0dfd0] p-6 shadow-sm">

                        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-primaria">
                            Território paulista
                        </p>

                        <h2 className="font-titulo text-2xl font-bold text-primaria">
                            São Paulo em Foco
                        </h2>

                        <p className="mt-3 text-sm leading-7 text-texto-suave">
                            Conheça o território paulista e explore os problemas urbanos registrados pelos cidadãos nas diferentes localidades do estado.
                        </p>

                        <div className="my-5 flex-1">

                            <MapaEstadoSP />

                        </div>

                        <div className="mt-auto">

                            <BotaoPrincipal to="/mapa-ocorrencias" icone="map">
                                Ver Mapa de Ocorrências
                            </BotaoPrincipal>

                        </div>

                    </div>

                </section>

                {/* FUNCIONALIDADES */}

                <section>

                    <TituloSecao detalhe="Tudo em um só lugar" titulo="O que você pode fazer no Polieus?" descricao="Conheça as funcionalidades desenvolvidas para facilitar a participação cidadã e o acompanhamento das demandas urbanas." />

                    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

                        {FUNCIONALIDADES.map(item => (

                            <article key={item.titulo} className="flex min-w-0 flex-col rounded-2xl border border-[#e3c5af] bg-[#fffaf5] p-6 shadow-sm transition-transform duration-200 hover:-translate-y-1">

                                <div className="mb-6 flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-[#f0dfd0]">

                                    <Icone nome={item.icone} tamanho="text-3xl text-primaria" />

                                </div>

                                <h3 className="font-titulo text-lg font-bold text-primaria">
                                    {item.titulo}
                                </h3>

                                <p className="mt-3 flex-1 text-sm leading-7 text-texto-suave">
                                    {item.descricao}
                                </p>

                                <Link to={item.caminho} className="mt-6 flex items-center gap-2 border-t border-[#ead5c5] pt-4 text-sm font-bold text-primaria transition-colors hover:text-primaria-hover">

                                    {item.acao}

                                    <Icone nome="arrow_forward" tamanho="text-lg" />

                                </Link>

                            </article>

                        ))}

                    </div>

                </section>

                {/* COMO FUNCIONA */}

                <section className="rounded-2xl border border-[#e3c5af] bg-[#f0dfd0] p-6 shadow-sm sm:p-8">

                    <TituloSecao detalhe="Simples e acessível" titulo="Como funciona o Polieus?" descricao="Um processo organizado para que cada cidadão possa comunicar situações e acompanhar suas solicitações." />

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                        {ETAPAS.map(etapa => (

                            <article key={etapa.numero} className="rounded-xl border border-[#e4c9b7] bg-[#fffaf5] p-5">

                                <div className="mb-4 flex items-center justify-between">

                                    <span className="font-titulo text-3xl font-bold text-[#c69d89]">
                                        {etapa.numero}
                                    </span>

                                    <span className="text-primaria">

                                        <Icone nome={etapa.icone} tamanho="text-3xl" />

                                    </span>

                                </div>

                                <h3 className="font-titulo text-lg font-bold text-primaria">
                                    {etapa.titulo}
                                </h3>

                                <p className="mt-3 text-sm leading-7 text-texto-suave">
                                    {etapa.descricao}
                                </p>

                            </article>

                        ))}

                    </div>

                </section>

                {/* CATEGORIAS */}

                <section>

                    <TituloSecao detalhe="Demandas urbanas" titulo="Categorias de Ocorrências" descricao="Os registros são organizados por categorias para facilitar a identificação dos diferentes problemas urbanos." />

                    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

                        {CATEGORIAS.map(categoria => (

                            <article key={categoria.titulo} className="rounded-xl border border-[#e3c5af] bg-[#fffaf5] p-6 shadow-sm">

                                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-[#f0dfd0] text-primaria">

                                    <Icone nome={categoria.icone} tamanho="text-3xl" />

                                </div>

                                <h3 className="font-titulo text-lg font-bold text-primaria">
                                    {categoria.titulo}
                                </h3>

                                <p className="mt-3 text-sm leading-7 text-texto-suave">
                                    {categoria.descricao}
                                </p>

                            </article>

                        ))}

                    </div>

                </section>

                {/* NOSSO PROPÓSITO */}

                <section className="grid overflow-hidden rounded-2xl border border-[#dfbfa8] bg-[#f1dfd0] shadow-sm lg:grid-cols-2">

                    <div className="p-7 sm:p-10">

                        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-primaria">
                            Nosso propósito
                        </p>

                        <h2 className="font-titulo text-2xl font-bold leading-snug text-primaria sm:text-3xl">
                            Uma cidade melhor começa com a participação de todos.
                        </h2>

                        <p className="mt-5 text-sm leading-8 text-texto-suave">
                            O Polieus nasce da ideia de que a tecnologia pode fortalecer a relação entre cidadãos e gestão pública. Ao reunir informações sobre problemas urbanos, buscamos contribuir para uma sociedade mais consciente e participativa.
                        </p>

                        <p className="mt-4 text-sm leading-8 text-texto-suave">
                            Nossa missão é incentivar a transparência, a colaboração e o uso responsável da tecnologia para transformar necessidades individuais em conhecimento coletivo.
                        </p>

                        <div className="mt-7">

                            <BotaoPrincipal to="/sobre">
                                Saiba mais sobre nós
                            </BotaoPrincipal>

                        </div>

                    </div>

                    <div className="flex flex-col justify-center gap-5 bg-[#e8cdb9] p-7 sm:p-10">

                        {[
                            {
                                icone: 'diversity_3',
                                titulo: 'Participação Cidadã',
                                descricao: 'Incentivamos a população a participar da identificação de problemas urbanos.',
                            },
                            {
                                icone: 'visibility',
                                titulo: 'Transparência',
                                descricao: 'Organizamos informações para facilitar a consulta e o acompanhamento.',
                            },
                            {
                                icone: 'hub',
                                titulo: 'Inovação',
                                descricao: 'Utilizamos recursos digitais para apoiar soluções voltadas à sociedade.',
                            },
                        ].map(item => (

                            <div key={item.titulo} className="flex items-start gap-4 rounded-xl bg-[#fff8f1] p-5">

                                <span className="shrink-0 text-primaria">

                                    <Icone nome={item.icone} tamanho="text-3xl" />

                                </span>

                                <div>

                                    <h3 className="font-titulo text-base font-bold text-primaria">
                                        {item.titulo}
                                    </h3>

                                    <p className="mt-2 text-sm leading-7 text-texto-suave">
                                        {item.descricao}
                                    </p>

                                </div>

                            </div>

                        ))}

                    </div>

                </section>

                {/* CHAMADA FINAL */}

                <section className="rounded-2xl bg-[#76241e] px-6 py-12 text-center shadow-lg sm:px-10">

                    <div className="mb-4 flex justify-center text-white">

                        <Icone nome="account_balance" tamanho="text-5xl" />

                    </div>

                    <h2 className="font-titulo text-2xl font-bold sm:text-3xl" style={{ color: '#ffffff' }}>

                        Faça parte da transformação.

                    </h2>

                    <p className="mx-auto mt-4 max-w-2xl text-sm leading-8 sm:text-base" style={{ color: '#ffffff' }}>

                        Sua participação é essencial para a construção de cidades mais justas, transparentes e conectadas. Conheça as ferramentas do Polieus e contribua para essa transformação.

                    </p>

                    <div className="mt-8 flex flex-wrap items-center justify-center gap-4">

                        <Link to="/registrar-ocorrencia" className="inline-flex min-h-14 items-center justify-center gap-3 rounded-xl bg-white px-7 py-4 text-sm font-bold shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#f3e2d6]" style={{ color: '#76241e' }}>

                            <span>Registrar Ocorrência</span>

                            <Icone nome="arrow_forward" tamanho="text-xl" />

                        </Link>

                        <Link to="/mapa-ocorrencias" className="inline-flex min-h-14 items-center justify-center gap-3 rounded-xl border-2 border-white bg-transparent px-7 py-4 text-sm font-bold transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/10" style={{ color: '#ffffff' }}>

                            <span>Explorar o Mapa</span>

                            <Icone nome="map" tamanho="text-xl" />

                        </Link>

                    </div>

                </section>

            </div>

        </main>
    );
}