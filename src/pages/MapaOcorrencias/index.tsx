import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import Mapa, { type OcorrenciaMapa, type PrioridadeOcorrencia } from '../../components/Mapa/Mapa';

import { listarOcorrencias } from '../../services/ocorrenciaService';

import {
    listarHistoricos,
    gerarProtocolo,
    obterHistoricoInicial,
    obterHistoricoAtual,
    type Historico,
} from '../../services/historicoService';

import {
    listarAnalises,
    obterAnalisePorProtocolo,
    normalizarPrioridade,
    type Analise,
} from '../../services/analiseService';

// TIPAGENS

type FiltroPrioridade = 'todas' | PrioridadeOcorrencia | 'indisponivel';

type StatusOcorrencia =
    | 'Pendente'
    | 'Em análise'
    | 'Em andamento'
    | 'Concluído'
    | 'Não informado';

type Localizacao = {
    cidade: string;
    latitude: number;
    longitude: number;
};

interface OcorrenciaMapaCompleta extends OcorrenciaMapa {
    protocolo: string;
    prioridadeDisponivel: boolean;
}

// CONSTANTES

const NOMES_PRIORIDADE: Record<PrioridadeOcorrencia, string> = {
    alta: 'Alta',
    media: 'Média',
    baixa: 'Baixa',
    'nao-informada': 'Não informada',
};

const CORES_PRIORIDADE: Record<PrioridadeOcorrencia, string> = {
    alta: '#b3261e',
    media: '#e99a3e',
    baixa: '#4caf50',
    'nao-informada': '#808080',
};

const ESTILOS_PRIORIDADE: Record<PrioridadeOcorrencia, string> = {
    alta: 'bg-[#f8d7d2] text-[#922c1d]',
    media: 'bg-[#ffebcf] text-[#96500c]',
    baixa: 'bg-[#dfe8c5] text-[#3e6029]',
    'nao-informada': 'bg-[#e5e5e5] text-[#616161]',
};

// ==================================================
// COORDENADAS APROXIMADAS DOS MUNICÍPIOS
// ==================================================

const MUNICIPIOS: Record<string, [number, number]> = {
    'São Paulo': [-23.5505, -46.6333],
    'Guarulhos': [-23.4543, -46.5337],
    'Campinas': [-22.9056, -47.0608],
    'São Bernardo do Campo': [-23.6914, -46.5646],
    'Santo André': [-23.6639, -46.5383],
    'Osasco': [-23.5325, -46.7917],
    'Sorocaba': [-23.5015, -47.4526],
    'Ribeirão Preto': [-21.1775, -47.8103],
    'São José dos Campos': [-23.1896, -45.8841],
    'São José do Rio Preto': [-20.8113, -49.3758],
    'Santos': [-23.9608, -46.3336],
    'Mauá': [-23.6677, -46.4613],
    'Diadema': [-23.6861, -46.6228],
    'Jundiaí': [-23.1857, -46.8978],
    'Piracicaba': [-22.7343, -47.6481],
    'Bauru': [-22.3145, -49.0587],
    'Itaquaquecetuba': [-23.4863, -46.3486],
    'Mogi das Cruzes': [-23.5228, -46.1887],
    'Franca': [-20.5390, -47.4010],
    'Praia Grande': [-24.0058, -46.4028],
    'Taubaté': [-23.0264, -45.5553],
    'Limeira': [-22.5647, -47.4017],
    'Suzano': [-23.5425, -46.3108],
    'Taboão da Serra': [-23.6019, -46.7526],
    'Sumaré': [-22.8219, -47.2669],
    'Barueri': [-23.5057, -46.8790],
    'Embu das Artes': [-23.6491, -46.8522],
    'São Carlos': [-22.0174, -47.8909],
    'Indaiatuba': [-23.0884, -47.2119],
    'Cotia': [-23.6039, -46.9192],
    'Americana': [-22.7374, -47.3331],
    'Araraquara': [-21.7845, -48.1780],
    'Jacareí': [-23.3053, -45.9658],
    'Presidente Prudente': [-22.1207, -51.3925],
    'Marília': [-22.2139, -49.9458],
    'Rio Claro': [-22.4108, -47.5604],
    'Carapicuíba': [-23.5235, -46.8407],
    'São Vicente': [-23.9631, -46.3919],
    'Guarujá': [-23.9939, -46.2564],
    'Hortolândia': [-22.8583, -47.2200],
    'Itapevi': [-23.5489, -46.9342],
    'Atibaia': [-23.1171, -46.5563],
    'Bragança Paulista': [-22.9527, -46.5419],
    'Mogi Guaçu': [-22.3672, -46.9428],
    'Botucatu': [-22.8858, -48.4450],
    'Itu': [-23.2644, -47.2992],
    'Salto': [-23.2019, -47.2936],
    'Valinhos': [-22.9706, -46.9958],
    'Vinhedo': [-23.0302, -46.9833],
    'São Caetano do Sul': [-23.6231, -46.5511],
    'Ribeirão Pires': [-23.7104, -46.4121],
    'Rio Grande da Serra': [-23.7437, -46.3970],
    'Ferraz de Vasconcelos': [-23.5408, -46.3710],
    'Poá': [-23.5286, -46.3447],
    'Arujá': [-23.3961, -46.3208],
    'Caieiras': [-23.3644, -46.7406],
    'Cajamar': [-23.3561, -46.8781],
    'Franco da Rocha': [-23.3229, -46.7290],
    'Francisco Morato': [-23.2817, -46.7453],
    'Mairiporã': [-23.3186, -46.5883],
    'Santana de Parnaíba': [-23.4442, -46.9178],
    'Jandira': [-23.5275, -46.9022],
    'Vargem Grande Paulista': [-23.6031, -47.0220],
    'Itapecerica da Serra': [-23.7169, -46.8492],
    'Embu-Guaçu': [-23.8322, -46.8114],
    'Caraguatatuba': [-23.6204, -45.4131],
    'Ubatuba': [-23.4332, -45.0834],
    'São Sebastião': [-23.8067, -45.4025],
    'Ilhabela': [-23.7781, -45.3581],
    'Bertioga': [-23.8544, -46.1386],
    'Cubatão': [-23.8950, -46.4253],
    'Mongaguá': [-24.0931, -46.6208],
    'Itanhaém': [-24.1833, -46.7889],
    'Peruíbe': [-24.3200, -47.0003],
    'Araçatuba': [-21.2076, -50.4401],
    'Birigui': [-21.2886, -50.3403],
    'Barretos': [-20.5572, -48.5678],
    'Catanduva': [-21.1378, -48.9728],
    'Ourinhos': [-22.9797, -49.8706],
    'Assis': [-22.6617, -50.4122],
    'Avaré': [-23.1067, -48.9250],
    'Itapetininga': [-23.5886, -48.0531],
    'Itapeva': [-23.9822, -48.8756],
    'Registro': [-24.4972, -47.8449],
    'Votorantim': [-23.5469, -47.4381],
    'Tatuí': [-23.3556, -47.8569],
    'Pindamonhangaba': [-22.9239, -45.4617],
    'Guaratinguetá': [-22.8164, -45.1925],
    'Lorena': [-22.7311, -45.1247],
    'Aparecida': [-22.8469, -45.2297],
};

// ==================================================
// FAIXAS DE CEP DOS MUNICÍPIOS
// ==================================================

const FAIXAS_CEP = [
    { inicio: '01000', fim: '05999', cidade: 'São Paulo' },
    { inicio: '06000', fim: '06299', cidade: 'Osasco' },
    { inicio: '06500', fim: '06549', cidade: 'Santana de Parnaíba' },
    { inicio: '06600', fim: '06649', cidade: 'Jandira' },
    { inicio: '06650', fim: '06699', cidade: 'Itapevi' },
    { inicio: '06750', fim: '06799', cidade: 'Taboão da Serra' },
    { inicio: '06850', fim: '06889', cidade: 'Itapecerica da Serra' },
    { inicio: '07000', fim: '07399', cidade: 'Guarulhos' },
    { inicio: '07800', fim: '07899', cidade: 'Franco da Rocha' },
    { inicio: '07900', fim: '07999', cidade: 'Francisco Morato' },
    { inicio: '08000', fim: '08499', cidade: 'São Paulo' },
    { inicio: '08500', fim: '08549', cidade: 'Ferraz de Vasconcelos' },
    { inicio: '08550', fim: '08569', cidade: 'Poá' },
    { inicio: '08570', fim: '08599', cidade: 'Itaquaquecetuba' },
    { inicio: '08600', fim: '08699', cidade: 'Suzano' },
    { inicio: '08700', fim: '08889', cidade: 'Mogi das Cruzes' },
    { inicio: '09000', fim: '09299', cidade: 'Santo André' },
    { inicio: '09300', fim: '09399', cidade: 'Mauá' },
    { inicio: '09400', fim: '09449', cidade: 'Ribeirão Pires' },
    { inicio: '09450', fim: '09499', cidade: 'Rio Grande da Serra' },
    { inicio: '09500', fim: '09599', cidade: 'São Caetano do Sul' },
    { inicio: '09600', fim: '09899', cidade: 'São Bernardo do Campo' },
    { inicio: '09900', fim: '09999', cidade: 'Diadema' },
    { inicio: '11300', fim: '11399', cidade: 'São Vicente' },
    { inicio: '11500', fim: '11599', cidade: 'Cubatão' },
    { inicio: '11700', fim: '11729', cidade: 'Praia Grande' },
    { inicio: '11730', fim: '11730', cidade: 'Mongaguá' },
    { inicio: '11740', fim: '11740', cidade: 'Itanhaém' },
];

// ==================================================
// FUNÇÕES AUXILIARES
// ==================================================

function normalizarTexto(texto: string): string {
    return (texto ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

// PADRONIZAR STATUS

function normalizarStatus(status?: string): StatusOcorrencia {

    const valor = normalizarTexto(status ?? '')
        .replace(/_/g, ' ')
        .trim();

    switch (valor) {

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

// CONVERTER PRIORIDADE DO JAVA PARA O MAPA

function converterPrioridadeMapa(prioridade?: string | null): PrioridadeOcorrencia {

    switch (normalizarPrioridade(prioridade)) {

        case 'Alta':
            return 'alta';

        case 'Média':
            return 'media';

        case 'Baixa':
            return 'baixa';

        default:
            return 'nao-informada';
    }
}

// IDENTIFICAR MUNICÍPIO PELO CEP

function localizarPorCep(cep: string): Localizacao | null {

    const cepLimpo = (cep ?? '').replace(/\D/g, '');

    if (cepLimpo.length !== 8) return null;

    const prefixo = cepLimpo.slice(0, 5);

    const municipio = FAIXAS_CEP.find(faixa =>
        prefixo >= faixa.inicio && prefixo <= faixa.fim
    );

    if (!municipio) return null;

    const coordenadas = MUNICIPIOS[municipio.cidade];

    if (!coordenadas) return null;

    return {
        cidade: municipio.cidade,
        latitude: coordenadas[0],
        longitude: coordenadas[1],
    };
}

// IDENTIFICAR MUNICÍPIO PELO ENDEREÇO OU CEP

function localizarEndereco(endereco: string, cep: string): Localizacao | null {

    const localizacaoCep = localizarPorCep(cep);

    if (localizacaoCep) return localizacaoCep;

    const partes = (endereco ?? '').split(',').map(parte => normalizarTexto(parte));

    const municipiosEncontrados = Object.entries(MUNICIPIOS).filter(([cidade]) => {

        const nome = normalizarTexto(cidade);

        return partes.some(parte =>
            parte === `${nome} - sp` ||
            parte === `${nome} - sao paulo`
        );
    });

    if (municipiosEncontrados.length !== 1) return null;

    const [cidade, coordenadas] = municipiosEncontrados[0];

    return {
        cidade,
        latitude: coordenadas[0],
        longitude: coordenadas[1],
    };
}

// ==================================================
// PÁGINA MAPA DE OCORRÊNCIAS
// ==================================================

export default function MapaOcorrencias() {

    const [ocorrencias, setOcorrencias] = useState<OcorrenciaMapaCompleta[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');
    const [aviso, setAviso] = useState('');
    const [tentativa, setTentativa] = useState(0);
    const [semLocalizacao, setSemLocalizacao] = useState(0);

    const [busca, setBusca] = useState('');
    const [mostrarFiltros, setMostrarFiltros] = useState(false);
    const [filtroPrioridade, setFiltroPrioridade] = useState<FiltroPrioridade>('todas');
    const [filtroCategoria, setFiltroCategoria] = useState('todas');

    const [ocorrenciaSelecionada, setOcorrenciaSelecionada] = useState<OcorrenciaMapaCompleta | null>(null);

    // ==================================================
    // INTEGRAÇÃO COM A API JAVA
    // ==================================================

    useEffect(() => {

        let ativo = true;

        async function carregarOcorrencias() {

            setCarregando(true);
            setErro('');
            setAviso('');
            setOcorrencias([]);
            setSemLocalizacao(0);
            setOcorrenciaSelecionada(null);

            try {

                // CONSULTAR OCORRÊNCIAS

                const registros = await listarOcorrencias();

                if (!ativo) return;

                if (!Array.isArray(registros)) {
                    throw new Error('Resposta inválida ao consultar ocorrências.');
                }

                if (registros.length === 0) return;

                // CONSULTAR HISTÓRICOS E ANÁLISES

                const [resultadoHistoricos, resultadoAnalises] = await Promise.allSettled([
                    listarHistoricos(),
                    listarAnalises(),
                ]);

                if (!ativo) return;

                let historicos: Historico[] = [];
                let analises: Analise[] = [];

                let historicosDisponiveis = true;
                let analisesDisponiveis = true;

                const avisos: string[] = [];

                // HISTÓRICOS

                if (resultadoHistoricos.status === 'fulfilled' && Array.isArray(resultadoHistoricos.value)) {

                    historicos = resultadoHistoricos.value;

                } else {

                    historicosDisponiveis = false;

                    avisos.push('Não foi possível consultar o status das ocorrências.');

                    console.error('Erro ao consultar históricos:', resultadoHistoricos);
                }

                // ANÁLISES E PRIORIDADES

                if (resultadoAnalises.status === 'fulfilled' && Array.isArray(resultadoAnalises.value)) {

                    analises = resultadoAnalises.value;

                } else {

                    analisesDisponiveis = false;

                    avisos.push('Não foi possível consultar as prioridades das ocorrências.');

                    console.error('Erro ao consultar análises:', resultadoAnalises);
                }

                const resultados: OcorrenciaMapaCompleta[] = [];

                let naoLocalizadas = 0;
                let prioridadesIndisponiveis = 0;

                // ORGANIZAR HISTÓRICOS POR OCORRÊNCIA

                const historicosPorOcorrencia = new Map<number, Historico[]>();

                for (const historico of historicos) {

                    const idOcorrencia = Number(historico.idOcorrencia);

                    if (!Number.isInteger(idOcorrencia) || idOcorrencia <= 0) continue;

                    const historicosExistentes = historicosPorOcorrencia.get(idOcorrencia) ?? [];

                    historicosExistentes.push(historico);

                    historicosPorOcorrencia.set(idOcorrencia, historicosExistentes);
                }

                // FORMATAR OCORRÊNCIAS PARA O MAPA

                for (const item of registros) {

                    if (
                        typeof item.idOcorrencia !== 'number' ||
                        !Number.isInteger(item.idOcorrencia) ||
                        item.idOcorrencia <= 0
                    ) {
                        continue;
                    }

                    // LOCALIZAÇÃO UTILIZANDO O CEP DO JAVA

                    const localizacao = localizarEndereco(item.endereco, item.cep);

                    if (!localizacao) {

                        naoLocalizadas++;

                        continue;
                    }

                    // HISTÓRICO DA OCORRÊNCIA

                    const historicosOcorrencia = historicosPorOcorrencia.get(item.idOcorrencia) ?? [];

                    const historicoInicial = obterHistoricoInicial(historicosOcorrencia);

                    const historicoAtual = obterHistoricoAtual(historicosOcorrencia);

                    // IDENTIFICAR PROTOCOLO ORIGINAL

                    const protocolo = String(
                        historicoInicial?.protocolo ||
                        historicoAtual?.protocolo ||
                        gerarProtocolo(item.idOcorrencia)
                    );

                    // CONSULTAR PRIORIDADE PELO PROTOCOLO

                    let prioridade: PrioridadeOcorrencia = 'nao-informada';

                    let prioridadeDisponivel = historicosDisponiveis && analisesDisponiveis;

                    if (prioridadeDisponivel) {

                        try {

                            const analise = obterAnalisePorProtocolo(analises, protocolo);

                            prioridade = converterPrioridadeMapa(analise?.prioridade);

                        } catch (erro) {

                            prioridadeDisponivel = false;

                            console.error(`Erro ao consultar prioridade da ocorrência ${protocolo}:`, erro);
                        }
                    }

                    if (!prioridadeDisponivel) {

                        prioridadesIndisponiveis++;
                    }

                    // ADICIONAR OCORRÊNCIA AO MAPA

                    resultados.push({
                        id: item.idOcorrencia,
                        protocolo,
                        categoria: item.categoria ?? 'Outros',
                        descricao: item.descricao ?? '',
                        endereco: [item.endereco, item.departamento].filter(Boolean).join(', '),
                        cidade: localizacao.cidade,
                        cep: item.cep,
                        prioridade,
                        prioridadeDisponivel,
                        status: normalizarStatus(historicoAtual?.status),
                        latitude: localizacao.latitude,
                        longitude: localizacao.longitude,
                    });
                }

                if (prioridadesIndisponiveis > 0 && analisesDisponiveis && historicosDisponiveis) {

                    avisos.push('Algumas prioridades não puderam ser identificadas.');
                }

                if (ativo) {

                    setOcorrencias(resultados);
                    setSemLocalizacao(naoLocalizadas);
                    setAviso(avisos.join(' '));
                }

            } catch (erro) {

                console.error('Erro ao carregar ocorrências do mapa:', erro);

                if (ativo) {

                    setErro('Não foi possível consultar as ocorrências. Tente novamente.');
                }

            } finally {

                if (ativo) {

                    setCarregando(false);
                }
            }
        }

        void carregarOcorrencias();

        return () => {

            ativo = false;
        };

    }, [tentativa]);

    // ==================================================
    // CATEGORIAS DISPONÍVEIS
    // ==================================================

    const categorias = useMemo(() => {

        return [...new Set(
            ocorrencias.map(ocorrencia => ocorrencia.categoria)
        )].sort((a, b) => a.localeCompare(b, 'pt-BR'));

    }, [ocorrencias]);

    // ==================================================
    // BUSCA E FILTROS
    // ==================================================

    const ocorrenciasFiltradas = useMemo(() => {

        const termo = normalizarTexto(busca);

        return ocorrencias.filter(ocorrencia => {

            const correspondeBusca =
                termo === '' ||
                normalizarTexto(ocorrencia.protocolo).includes(termo) ||
                normalizarTexto(ocorrencia.categoria).includes(termo) ||
                normalizarTexto(ocorrencia.descricao).includes(termo) ||
                normalizarTexto(ocorrencia.endereco).includes(termo) ||
                normalizarTexto(ocorrencia.cidade).includes(termo) ||
                (ocorrencia.cep ?? '').includes(termo);

            const correspondePrioridade =
                filtroPrioridade === 'todas' ||
                (
                    filtroPrioridade === 'indisponivel'
                        ? !ocorrencia.prioridadeDisponivel
                        : ocorrencia.prioridadeDisponivel &&
                          ocorrencia.prioridade === filtroPrioridade
                );

            const correspondeCategoria =
                filtroCategoria === 'todas' ||
                ocorrencia.categoria === filtroCategoria;

            return correspondeBusca && correspondePrioridade && correspondeCategoria;
        });

    }, [ocorrencias, busca, filtroPrioridade, filtroCategoria]);

    const ocorrenciaVisivel =
        ocorrenciaSelecionada &&
        ocorrenciasFiltradas.some(ocorrencia => ocorrencia.id === ocorrenciaSelecionada.id)
            ? ocorrenciaSelecionada
            : null;

    function limparFiltros() {

        setBusca('');
        setFiltroPrioridade('todas');
        setFiltroCategoria('todas');
    }

    function selecionarOcorrencia(ocorrencia: OcorrenciaMapa) {

        const ocorrenciaCompleta = ocorrencias.find(item => item.id === ocorrencia.id);

        setOcorrenciaSelecionada(ocorrenciaCompleta ?? null);
    }

    const focoClasse = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria';

    const campoClasse = 'w-full min-w-0 max-w-full rounded-lg border border-[#dfc2ae] bg-white px-3 py-3 text-sm text-texto outline-none transition-colors focus:border-primaria focus:ring-2 focus:ring-primaria/20';

    return (

        <main className="min-h-screen w-full min-w-0 flex-1 bg-fundo font-corpo text-texto">

            {/* CABEÇALHO */}

            <header className="border-b border-[#d8b9a5] bg-[#fffaf4] py-5 pr-5 pl-20 sm:pr-8 sm:pl-20 lg:px-10">

                <h1 className="font-titulo text-3xl font-bold text-[#78221b] sm:text-4xl">
                    Mapa de Ocorrências
                </h1>

                <nav aria-label="Navegação estrutural" className="mt-1 flex flex-wrap items-center gap-2 text-sm text-[#6b4438]">

                    <Link to="/inicio" className={`text-[#6b4438] transition-colors hover:text-primaria hover:underline ${focoClasse}`}>
                        Início
                    </Link>

                    <span className="material-icons text-base text-[#6b4438]" aria-hidden="true">
                        chevron_right
                    </span>

                    <span aria-current="page" className="font-semibold text-[#78221b]">
                        Mapa de Ocorrências
                    </span>

                </nav>

            </header>

            <div className="mx-auto w-full min-w-0 max-w-7xl px-4 py-8 sm:px-8 sm:py-10 lg:px-10">

                {/* APRESENTAÇÃO */}

                <section className="mb-8 min-w-0">

                    <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#a34c3a]">
                        Participação cidadã
                    </p>

                    <h2 className="font-titulo text-3xl font-bold text-[#78221b] sm:text-4xl">
                        Explore as Ocorrências
                    </h2>

                    <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#51453e] sm:text-base">
                        Visualize a distribuição das ocorrências urbanas no estado de São Paulo, consulte suas prioridades e acompanhe as solicitações registradas na plataforma Polieus.
                    </p>

                    <div className="mt-6 flex max-w-xl items-center gap-4" aria-hidden="true">

                        <div className="h-px flex-1 bg-[#b77965]" />

                        <div className="h-2.5 w-2.5 shrink-0 rotate-45 bg-[#78221b]" />

                        <div className="h-px flex-1 bg-[#d8b9a8]" />

                    </div>

                </section>

                {/* BUSCA E FILTROS */}

                <section className="mb-6 min-w-0" aria-label="Busca e filtros do mapa">

                    <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap">

                        <div className="relative w-full min-w-0 flex-1">

                            <span className="material-icons pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-xl text-[#78221b]" aria-hidden="true">
                                search
                            </span>

                            <input type="search" value={busca} onChange={event => setBusca(event.target.value)} placeholder="Buscar por cidade, endereço ou categoria..." aria-label="Buscar ocorrências no mapa" className="w-full min-w-0 rounded-xl border border-[#dfc2ae] bg-[#fffaf4] py-3.5 pr-4 pl-12 text-sm text-texto shadow-sm outline-none transition-colors placeholder:text-[#807167] focus:border-primaria focus:ring-2 focus:ring-primaria/20" />

                        </div>

                        <button type="button" onClick={() => setMostrarFiltros(atual => !atual)} aria-expanded={mostrarFiltros} aria-controls="filtros-mapa" className={`flex w-full shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold transition-colors sm:w-auto ${focoClasse} ${mostrarFiltros ? 'border-primaria bg-[#f0dfd4] text-[#78221b]' : 'border-[#dfc2ae] bg-[#fffaf4] text-[#78221b] hover:bg-[#f3e5d9]'}`}>

                            <span className="material-icons text-xl" aria-hidden="true">
                                filter_alt
                            </span>

                            Filtros

                            <span className={`material-icons text-lg transition-transform duration-300 motion-reduce:transition-none ${mostrarFiltros ? 'rotate-180' : ''}`} aria-hidden="true">
                                expand_more
                            </span>

                        </button>

                        <button type="button" onClick={() => setTentativa(atual => atual + 1)} disabled={carregando} aria-label="Atualizar ocorrências" title="Atualizar ocorrências" className={`flex w-full shrink-0 cursor-pointer items-center justify-center rounded-xl border border-[#dfc2ae] bg-[#fffaf4] px-5 py-3 text-[#78221b] transition-colors hover:bg-[#f3e5d9] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto ${focoClasse}`}>

                            <span className={`material-icons ${carregando ? 'animate-spin motion-reduce:animate-none' : ''}`} aria-hidden="true">
                                refresh
                            </span>

                        </button>

                    </div>

                    <div id="filtros-mapa" hidden={!mostrarFiltros}>

                        {mostrarFiltros && (

                            <div className="mt-3 grid min-w-0 grid-cols-1 gap-4 rounded-xl border border-[#dfc2ae] bg-[#fffaf4] p-4 shadow-sm sm:grid-cols-2 sm:p-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">

                                {/* FILTRO DE PRIORIDADE */}

                                <div className="min-w-0">

                                    <label htmlFor="filtro-prioridade-mapa" className="mb-2 block text-sm font-semibold text-[#78221b]">
                                        Prioridade
                                    </label>

                                    <select id="filtro-prioridade-mapa" value={filtroPrioridade} onChange={event => setFiltroPrioridade(event.target.value as FiltroPrioridade)} className={campoClasse}>

                                        <option value="todas">Todas as prioridades</option>
                                        <option value="alta">Alta</option>
                                        <option value="media">Média</option>
                                        <option value="baixa">Baixa</option>
                                        <option value="nao-informada">Não informada</option>
                                        <option value="indisponivel">Indisponível</option>

                                    </select>

                                </div>

                                {/* FILTRO DE CATEGORIA */}

                                <div className="min-w-0">

                                    <label htmlFor="filtro-categoria-mapa" className="mb-2 block text-sm font-semibold text-[#78221b]">
                                        Categoria
                                    </label>

                                    <select id="filtro-categoria-mapa" value={filtroCategoria} onChange={event => setFiltroCategoria(event.target.value)} className={campoClasse}>

                                        <option value="todas">Todas as categorias</option>

                                        {categorias.map(categoria => (

                                            <option key={categoria} value={categoria}>
                                                {categoria}
                                            </option>

                                        ))}

                                    </select>

                                </div>

                                <div className="flex min-w-0 items-end">

                                    <button type="button" onClick={limparFiltros} className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#b77965] px-4 py-3 text-sm font-semibold text-[#78221b] transition-colors hover:bg-[#f0dfd4] ${focoClasse}`}>

                                        <span className="material-icons shrink-0 text-lg" aria-hidden="true">
                                            restart_alt
                                        </span>

                                        Limpar filtros

                                    </button>

                                </div>

                            </div>

                        )}

                    </div>

                </section>

                {/* LEGENDA */}

                <section className="mb-6 flex w-full min-w-0 flex-wrap items-center justify-between gap-4 rounded-xl border border-[#dfc2ae] bg-[#fffaf4] px-4 py-4 shadow-sm sm:px-5" aria-label="Legenda das prioridades">

                    <div className="flex min-w-0 flex-wrap items-center gap-x-6 gap-y-3">

                        <span className="text-sm font-semibold text-[#78221b]">
                            Prioridade:
                        </span>

                        {(['alta', 'media', 'baixa', 'nao-informada'] as const).map(prioridade => (

                            <div key={prioridade} className="flex min-w-0 items-center gap-2">

                                <span className="h-3.5 w-3.5 shrink-0 rounded-full border border-white shadow-sm" style={{ backgroundColor: CORES_PRIORIDADE[prioridade] }} aria-hidden="true" />

                                <span className="text-sm text-[#51453e]">

                                    {prioridade === 'nao-informada'
                                        ? 'Não informada ou indisponível'
                                        : NOMES_PRIORIDADE[prioridade]}

                                </span>

                            </div>

                        ))}

                    </div>

                    <p className="text-sm font-semibold text-[#78221b]" role="status">

                        {carregando
                            ? 'Carregando ocorrências...'
                            : erro
                                ? 'Consulta indisponível'
                                : `${ocorrenciasFiltradas.length} ${ocorrenciasFiltradas.length === 1 ? 'ocorrência localizada' : 'ocorrências localizadas'}`}

                    </p>

                </section>

                {/* ERRO NA API */}

                {erro && (

                    <div role="alert" className="mb-6 flex min-w-0 flex-wrap items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 p-4">

                        <div className="flex min-w-0 items-start gap-3 text-sm text-red-800">

                            <span className="material-icons shrink-0" aria-hidden="true">
                                error_outline
                            </span>

                            <span className="min-w-0 wrap-break-word">
                                {erro}
                            </span>

                        </div>

                        <button type="button" onClick={() => setTentativa(atual => atual + 1)} className={`w-full cursor-pointer rounded-lg bg-primaria px-4 py-2 text-sm font-semibold transition-colors hover:bg-primaria-hover sm:w-auto ${focoClasse}`}>

                            <span className="text-white">
                                Tentar novamente
                            </span>

                        </button>

                    </div>

                )}

                {/* AVISOS */}

                {aviso && (

                    <div role="alert" className="mb-6 flex min-w-0 flex-wrap items-center justify-between gap-3 rounded-xl border border-[#dfc2ae] bg-[#fffaf4] p-4 text-sm text-[#51453e]">

                        <div className="flex min-w-0 items-start gap-3">

                            <span className="material-icons shrink-0 text-[#78221b]" aria-hidden="true">
                                info
                            </span>

                            <span className="min-w-0 wrap-break-word">
                                {aviso}
                            </span>

                        </div>

                        <button type="button" onClick={() => setTentativa(atual => atual + 1)} className={`cursor-pointer font-semibold text-[#78221b] hover:underline ${focoClasse}`}>
                            Tentar novamente
                        </button>

                    </div>

                )}

                {/* OCORRÊNCIAS SEM LOCALIZAÇÃO */}

                {!carregando && !erro && semLocalizacao > 0 && (

                    <div role="status" className="mb-6 flex min-w-0 items-start gap-3 rounded-xl border border-[#dfc2ae] bg-[#fffaf4] p-4 text-sm text-[#51453e]">

                        <span className="material-icons shrink-0 text-2xl text-[#78221b]" aria-hidden="true">
                            location_off
                        </span>

                        <p className="min-w-0 wrap-break-word">

                            {semLocalizacao} {semLocalizacao === 1
                                ? 'ocorrência não possui um município identificado no mapa.'
                                : 'ocorrências não possuem municípios identificados no mapa.'}

                        </p>

                    </div>

                )}

                {/* MAPA E PAINEL LATERAL */}

                <section className="grid w-full min-w-0 grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]" aria-label="Visualização das ocorrências" aria-busy={carregando}>

                    <div className="w-full min-w-0">

                        <Mapa ocorrencias={ocorrenciasFiltradas} ocorrenciaSelecionadaId={ocorrenciaVisivel?.id ?? null} aoSelecionarOcorrencia={selecionarOcorrencia} altura="clamp(350px, 65dvh, 600px)" carregando={carregando} />

                        <p className="mt-3 text-xs leading-relaxed text-[#51453e]">
                            Os marcadores representam localizações aproximadas por município.
                        </p>

                    </div>

                    {/* PAINEL DE DETALHES */}

                    <aside className="flex min-h-80 w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-[#dfc2ae] bg-[#fffaf4] shadow-sm xl:min-h-150">

                        <div className="border-b border-[#dfc2ae] bg-[#f0dfd4] px-4 py-5 sm:px-5">

                            <div className="flex min-w-0 items-center gap-3">

                                <span className="material-icons shrink-0 text-2xl text-[#78221b]" aria-hidden="true">
                                    location_on
                                </span>

                                <h3 className="min-w-0 font-titulo text-lg font-bold text-[#78221b]">
                                    Detalhes da Ocorrência
                                </h3>

                            </div>

                            <p className="mt-2 text-xs leading-relaxed text-[#51453e]">
                                Selecione um marcador para consultar as informações.
                            </p>

                        </div>

                        {ocorrenciaVisivel ? (

                            <div className="flex min-w-0 flex-1 flex-col gap-5 p-4 sm:p-5">

                                <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">

                                    <h4 className="min-w-0 wrap-break-word font-titulo text-lg font-bold text-[#78221b]">
                                        {ocorrenciaVisivel.categoria}
                                    </h4>

                                    <span className={`max-w-full rounded-full px-3 py-1.5 text-xs font-semibold ${ESTILOS_PRIORIDADE[ocorrenciaVisivel.prioridade]}`}>

                                        Prioridade {ocorrenciaVisivel.prioridadeDisponivel
                                            ? NOMES_PRIORIDADE[ocorrenciaVisivel.prioridade]
                                            : 'indisponível'}

                                    </span>

                                </div>

                                {/* PROTOCOLO */}

                                <div className="min-w-0">

                                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#51453e]">
                                        Protocolo
                                    </p>

                                    <p className="wrap-break-word text-sm font-semibold text-[#78221b]">
                                        {ocorrenciaVisivel.protocolo}
                                    </p>

                                </div>

                                {/* DESCRIÇÃO */}

                                <div className="min-w-0 border-t border-[#ead7c9] pt-4">

                                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#51453e]">
                                        Descrição
                                    </p>

                                    <p className="wrap-break-word text-sm leading-relaxed text-texto">
                                        {ocorrenciaVisivel.descricao}
                                    </p>

                                </div>

                                {/* ENDEREÇO */}

                                <div className="min-w-0 border-t border-[#ead7c9] pt-4">

                                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#51453e]">
                                        Endereço
                                    </p>

                                    <div className="flex min-w-0 items-start gap-2">

                                        <span className="material-icons shrink-0 text-lg text-[#78221b]" aria-hidden="true">
                                            place
                                        </span>

                                        <div className="min-w-0 wrap-break-word text-sm leading-relaxed text-texto">

                                            <p>{ocorrenciaVisivel.endereco}</p>

                                            {ocorrenciaVisivel.cep && (

                                                <p>
                                                    CEP: {ocorrenciaVisivel.cep.replace(/^(\d{5})(\d{3})$/, '$1-$2')}
                                                </p>

                                            )}

                                        </div>

                                    </div>

                                </div>

                                {/* CIDADE */}

                                <div className="min-w-0 border-t border-[#ead7c9] pt-4">

                                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#51453e]">
                                        Cidade
                                    </p>

                                    <div className="flex min-w-0 items-center gap-2">

                                        <span className="material-icons shrink-0 text-lg text-[#78221b]" aria-hidden="true">
                                            location_city
                                        </span>

                                        <span className="min-w-0 wrap-break-word text-sm text-texto">
                                            {ocorrenciaVisivel.cidade} - SP
                                        </span>

                                    </div>

                                </div>

                                {/* STATUS */}

                                <div className="min-w-0 border-t border-[#ead7c9] pt-4">

                                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#51453e]">
                                        Status
                                    </p>

                                    <div className="flex min-w-0 items-center gap-2">

                                        <span className="material-icons shrink-0 text-xl text-[#78221b]" aria-hidden="true">
                                            info
                                        </span>

                                        <span className="min-w-0 wrap-break-word text-sm font-semibold text-texto">
                                            {ocorrenciaVisivel.status}
                                        </span>

                                    </div>

                                </div>

                                <div className="mt-auto border-t border-[#ead7c9] pt-4">

                                    <button type="button" onClick={() => setOcorrenciaSelecionada(null)} className={`w-full cursor-pointer rounded-xl border border-primaria px-4 py-3 text-sm font-semibold text-[#78221b] transition-colors hover:bg-[#f3e5d9] ${focoClasse}`}>
                                        Fechar detalhes
                                    </button>

                                </div>

                            </div>

                        ) : (

                            <div className="flex min-w-0 flex-1 flex-col items-center justify-center px-4 py-10 text-center sm:px-6 sm:py-12">

                                <div className="mb-5 flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#f3e5d9]">

                                    <span className="material-icons text-4xl text-[#78221b]" aria-hidden="true">
                                        map
                                    </span>

                                </div>

                                <h4 className="font-titulo text-lg font-semibold text-[#78221b]">

                                    {carregando
                                        ? 'Carregando ocorrências'
                                        : erro
                                            ? 'Consulta indisponível'
                                            : ocorrencias.length === 0
                                                ? 'Nenhuma ocorrência localizada'
                                                : ocorrenciasFiltradas.length === 0
                                                    ? 'Nenhum resultado encontrado'
                                                    : 'Selecione uma ocorrência'}

                                </h4>

                                <p className="mt-3 max-w-xs text-sm leading-relaxed text-[#51453e]">

                                    {carregando
                                        ? 'Aguarde enquanto consultamos as ocorrências registradas.'
                                        : erro
                                            ? 'Não foi possível recuperar as ocorrências.'
                                            : ocorrencias.length === 0
                                                ? 'As ocorrências aparecerão no mapa quando seus municípios forem identificados.'
                                                : ocorrenciasFiltradas.length === 0
                                                    ? 'Não encontramos ocorrências com os filtros selecionados.'
                                                    : 'Clique em um dos marcadores do mapa para visualizar os detalhes da ocorrência.'}

                                </p>

                                {ocorrenciasFiltradas.length === 0 && ocorrencias.length > 0 && (

                                    <button type="button" onClick={limparFiltros} className={`mt-5 cursor-pointer rounded-full border border-primaria px-5 py-2.5 text-sm font-semibold text-[#78221b] transition-colors hover:bg-[#f3e5d9] ${focoClasse}`}>
                                        Limpar filtros
                                    </button>

                                )}

                            </div>

                        )}

                    </aside>

                </section>

                {/* LISTA DE OCORRÊNCIAS LOCALIZADAS */}

                {ocorrenciasFiltradas.length > 0 && (

                    <section className="mt-7 w-full min-w-0 rounded-2xl border border-[#dfc2ae] bg-[#fffaf4] p-4 shadow-sm sm:p-6">

                        <h3 className="font-titulo text-lg font-bold text-[#78221b]">
                            Ocorrências Localizadas
                        </h3>

                        <p className="mt-2 text-sm leading-relaxed text-[#51453e]">
                            Selecione uma ocorrência para consultar seus detalhes no mapa.
                        </p>

                        <div className="mt-5 grid max-h-96 min-w-0 grid-cols-1 gap-3 overflow-y-auto overscroll-contain p-1 sm:grid-cols-2 xl:grid-cols-3">

                            {ocorrenciasFiltradas.map(ocorrencia => (

                                <button key={ocorrencia.id} type="button" onClick={() => selecionarOcorrencia(ocorrencia)} aria-pressed={ocorrenciaVisivel?.id === ocorrencia.id} className={`w-full min-w-0 cursor-pointer rounded-xl border p-4 text-left transition-colors ${focoClasse} ${ocorrenciaVisivel?.id === ocorrencia.id ? 'border-primaria bg-[#f0dfd4]' : 'border-[#dfc2ae] bg-[#fffaf4] hover:bg-[#f3e5d9]'}`}>

                                    <div className="flex min-w-0 items-start gap-3">

                                        <span className="material-icons shrink-0 text-2xl" style={{ color: CORES_PRIORIDADE[ocorrencia.prioridade] }} aria-hidden="true">
                                            location_on
                                        </span>

                                        <div className="min-w-0 flex-1">

                                            <p className="wrap-break-word font-titulo text-sm font-bold text-[#78221b]">
                                                {ocorrencia.categoria}
                                            </p>

                                            <p className="mt-1 wrap-break-word text-xs text-[#51453e]">
                                                {ocorrencia.cidade}
                                            </p>

                                            <p className="mt-2 line-clamp-2 wrap-break-word text-xs text-texto">
                                                {ocorrencia.descricao}
                                            </p>

                                            <span className={`mt-3 inline-flex max-w-full rounded-full px-2.5 py-1 text-[10px] font-semibold ${ESTILOS_PRIORIDADE[ocorrencia.prioridade]}`}>

                                                Prioridade {ocorrencia.prioridadeDisponivel
                                                    ? NOMES_PRIORIDADE[ocorrencia.prioridade]
                                                    : 'indisponível'}

                                            </span>

                                        </div>

                                    </div>

                                </button>

                            ))}

                        </div>

                    </section>

                )}

                {/* INFORMAÇÕES ADICIONAIS */}

                <section className="mt-7 w-full min-w-0 rounded-2xl border border-[#dfc2ae] bg-[#fffaf4] p-4 shadow-sm sm:p-8">

                    <div className="flex min-w-0 flex-col items-start gap-4 sm:flex-row">

                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#f3e5d9]">

                            <span className="material-icons text-2xl text-[#78221b]" aria-hidden="true">
                                info
                            </span>

                        </div>

                        <div className="min-w-0 flex-1">

                            <h3 className="font-titulo text-lg font-bold text-[#78221b]">
                                Sobre o Mapa de Ocorrências
                            </h3>

                            <p className="mt-2 text-sm leading-relaxed text-[#51453e]">
                                O mapa permite visualizar a distribuição das ocorrências urbanas registradas no Polieus, contribuindo para o acompanhamento das demandas da população e para a transparência da gestão pública.
                            </p>

                            <p className="mt-3 text-sm leading-relaxed text-[#51453e]">
                                Os marcadores podem ser filtrados por categoria, prioridade ou localização. Ao selecionar uma ocorrência, suas informações são apresentadas no painel lateral.
                            </p>

                            <p className="mt-3 text-sm leading-relaxed text-[#51453e]">
                                As prioridades apresentadas são atribuídas pela equipe administrativa e consultadas diretamente no sistema.
                            </p>

                            <p className="mt-3 text-xs leading-relaxed text-[#51453e]">
                                As localizações são identificadas pelos CEPs disponíveis na base geográfica do sistema e representadas por coordenadas aproximadas dos municípios, não correspondendo necessariamente ao endereço exato da ocorrência.
                            </p>

                        </div>

                    </div>

                </section>

            </div>

        </main>
    );
}