import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import Mapa, { type OcorrenciaMapa, type PrioridadeOcorrencia } from '../../components/Mapa/Mapa';
import { listarOcorrencias } from '../../services/ocorrenciaService';
import { listarHistoricos, type Historico } from '../../services/historicoService';

type FiltroPrioridade = 'todas' | PrioridadeOcorrencia;

type Localizacao = {
    cidade: string;
    latitude: number;
    longitude: number;
};

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
    return (texto ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
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

// CONVERTER DATA DO HISTÓRICO

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

// OBTER HISTÓRICO MAIS RECENTE

function obterHistoricoAtual(historicos: Historico[], idOcorrencia: number): Historico | undefined {
    return historicos
        .filter(historico => Number(historico.idOcorrencia) === idOcorrencia)
        .sort((a, b) =>
            converterData(b.data) - converterData(a.data) ||
            (b.idHistorico ?? 0) - (a.idHistorico ?? 0)
        )[0];
}

// ==================================================
// PÁGINA MAPA DE OCORRÊNCIAS
// ==================================================

export default function MapaOcorrencias() {
    const [ocorrencias, setOcorrencias] = useState<OcorrenciaMapa[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');
    const [aviso, setAviso] = useState('');
    const [tentativa, setTentativa] = useState(0);
    const [semLocalizacao, setSemLocalizacao] = useState(0);

    const [busca, setBusca] = useState('');
    const [mostrarFiltros, setMostrarFiltros] = useState(false);
    const [filtroPrioridade, setFiltroPrioridade] = useState<FiltroPrioridade>('todas');
    const [filtroCategoria, setFiltroCategoria] = useState('todas');

    const [ocorrenciaSelecionada, setOcorrenciaSelecionada] = useState<OcorrenciaMapa | null>(null);

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
                const registros = await listarOcorrencias();

                if (!ativo) return;

                let historicos: Historico[] = [];

                try {
                    historicos = await listarHistoricos();

                } catch {
                    if (ativo) {
                        setAviso('Não foi possível consultar o status das ocorrências.');
                    }
                }

                if (!ativo) return;

                const resultados: OcorrenciaMapa[] = [];

                let naoLocalizadas = 0;

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

                    const historico = obterHistoricoAtual(historicos, item.idOcorrencia);

                    resultados.push({
                        id: item.idOcorrencia,
                        categoria: item.categoria,
                        descricao: item.descricao,
                        endereco: [item.endereco, item.departamento].filter(Boolean).join(', '),
                        cidade: localizacao.cidade,
                        cep: item.cep,
                        prioridade: 'nao-informada',
                        status: historico?.status || 'Não informado',
                        latitude: localizacao.latitude,
                        longitude: localizacao.longitude,
                    });
                }

                if (ativo) {
                    setOcorrencias(resultados);
                    setSemLocalizacao(naoLocalizadas);
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
                normalizarTexto(ocorrencia.categoria).includes(termo) ||
                normalizarTexto(ocorrencia.descricao).includes(termo) ||
                normalizarTexto(ocorrencia.endereco).includes(termo) ||
                normalizarTexto(ocorrencia.cidade).includes(termo) ||
                (ocorrencia.cep ?? '').includes(termo);

            const correspondePrioridade =
                filtroPrioridade === 'todas' ||
                ocorrencia.prioridade === filtroPrioridade;

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
        setOcorrenciaSelecionada(ocorrencia);
    }

    return (
        <main className="min-h-screen w-full flex-1 bg-fundo font-corpo text-texto">

            {/* CABEÇALHO */}

            <header className="border-b border-[#d8b9a8] bg-[#fffaf4] px-5 py-5 sm:px-8 lg:px-10">
                <h1 className="font-titulo text-3xl font-bold text-primaria sm:text-4xl">
                    Mapa de Ocorrências
                </h1>

                <nav aria-label="Navegação estrutural" className="mt-2 flex items-center gap-2 text-sm">
                    <Link to="/inicio" className="text-[#6b4438] transition-colors hover:text-primaria">
                        Início
                    </Link>

                    <span className="material-icons text-base text-primaria" aria-hidden="true">
                        chevron_right
                    </span>

                    <span className="font-semibold text-primaria">
                        Mapa de Ocorrências
                    </span>
                </nav>
            </header>

            <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-8 lg:px-10">

                {/* APRESENTAÇÃO */}

                <section className="mb-8">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#a34a37]">
                        Participação cidadã
                    </p>

                    <h2 className="font-titulo text-3xl font-bold text-primaria sm:text-4xl">
                        Explore as Ocorrências
                    </h2>

                    <p className="mt-2 max-w-3xl text-sm leading-relaxed text-texto-suave sm:text-base">
                        Visualize a distribuição das ocorrências urbanas no estado de São Paulo, consulte suas prioridades e acompanhe as solicitações registradas na plataforma Polieus.
                    </p>

                    <div className="mt-6 flex max-w-xl items-center gap-4" aria-hidden="true">
                        <div className="h-px flex-1 bg-[#b77965]" />
                        <div className="h-2.5 w-2.5 rotate-45 bg-[#78221b]" />
                        <div className="h-px flex-1 bg-[#d8b9a8]" />
                    </div>
                </section>

                {/* BUSCA E FILTROS */}

                <section className="mb-6" aria-label="Busca e filtros do mapa">
                    <div className="flex flex-col gap-3 sm:flex-row">

                        <div className="relative min-w-0 flex-1">
                            <span className="material-icons pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl text-primaria" aria-hidden="true">
                                search
                            </span>

                            <input type="search" value={busca} onChange={event => setBusca(event.target.value)} placeholder="Buscar por cidade, endereço ou categoria..." aria-label="Buscar ocorrências no mapa" className="w-full rounded-xl border border-[#dfc2ae] bg-[#fffaf4] py-3.5 pl-12 pr-4 text-sm text-texto shadow-sm outline-none transition-colors placeholder:text-[#8d8179] focus:border-primaria focus:ring-2 focus:ring-primaria/15" />
                        </div>

                        <button type="button" onClick={() => setMostrarFiltros(atual => !atual)} aria-expanded={mostrarFiltros} aria-controls="filtros-mapa" className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold transition-colors ${mostrarFiltros ? 'border-primaria bg-[#f0dfd4] text-primaria' : 'border-[#dfc2ae] bg-[#fffaf4] text-primaria hover:bg-[#f3e5d9]'}`}>
                            <span className="material-icons text-xl" aria-hidden="true">
                                filter_alt
                            </span>

                            Filtros

                            <span className={`material-icons text-lg transition-transform duration-300 ${mostrarFiltros ? 'rotate-180' : ''}`} aria-hidden="true">
                                expand_more
                            </span>
                        </button>

                        <button type="button" onClick={() => setTentativa(atual => atual + 1)} disabled={carregando} aria-label="Atualizar ocorrências" title="Atualizar ocorrências" className="flex cursor-pointer items-center justify-center rounded-xl border border-[#dfc2ae] bg-[#fffaf4] px-5 py-3 text-primaria transition-colors hover:bg-[#f3e5d9] disabled:cursor-not-allowed disabled:opacity-50">
                            <span className={`material-icons ${carregando ? 'animate-spin' : ''}`} aria-hidden="true">
                                refresh
                            </span>
                        </button>
                    </div>

                    {mostrarFiltros && (
                        <div id="filtros-mapa" className="mt-3 grid gap-4 rounded-xl border border-[#dfc2ae] bg-[#fffaf4] p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto]">

                            <div>
                                <label htmlFor="filtro-prioridade-mapa" className="mb-2 block text-sm font-semibold text-primaria">
                                    Prioridade
                                </label>

                                <select id="filtro-prioridade-mapa" value={filtroPrioridade} onChange={event => setFiltroPrioridade(event.target.value as FiltroPrioridade)} className="w-full rounded-lg border border-[#dfc2ae] bg-white px-3 py-3 text-sm text-texto outline-none focus:border-primaria">
                                    <option value="todas">Todas as prioridades</option>
                                    <option value="alta">Alta</option>
                                    <option value="media">Média</option>
                                    <option value="baixa">Baixa</option>
                                    <option value="nao-informada">Não informada</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="filtro-categoria-mapa" className="mb-2 block text-sm font-semibold text-primaria">
                                    Categoria
                                </label>

                                <select id="filtro-categoria-mapa" value={filtroCategoria} onChange={event => setFiltroCategoria(event.target.value)} className="w-full rounded-lg border border-[#dfc2ae] bg-white px-3 py-3 text-sm text-texto outline-none focus:border-primaria">
                                    <option value="todas">Todas as categorias</option>

                                    {categorias.map(categoria => (
                                        <option key={categoria} value={categoria}>
                                            {categoria}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-end">
                                <button type="button" onClick={limparFiltros} className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#b77965] px-4 py-3 text-sm font-semibold text-primaria transition-colors hover:bg-[#f0dfd4]">
                                    <span className="material-icons text-lg" aria-hidden="true">
                                        restart_alt
                                    </span>

                                    Limpar filtros
                                </button>
                            </div>
                        </div>
                    )}
                </section>

                {/* LEGENDA */}

                <section className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#dfc2ae] bg-[#fffaf4] px-5 py-4 shadow-sm" aria-label="Legenda das prioridades">
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                        <span className="text-sm font-semibold text-primaria">
                            Prioridade:
                        </span>

                        {(['alta', 'media', 'baixa', 'nao-informada'] as const).map(prioridade => (
                            <div key={prioridade} className="flex items-center gap-2">
                                <span className="h-3.5 w-3.5 rounded-full border border-white shadow-sm" style={{ backgroundColor: CORES_PRIORIDADE[prioridade] }} />

                                <span className="text-sm text-texto-suave">
                                    {NOMES_PRIORIDADE[prioridade]}
                                </span>
                            </div>
                        ))}
                    </div>

                    <p className="text-sm font-semibold text-primaria" role="status">
                        {carregando
                            ? 'Carregando ocorrências...'
                            : erro
                                ? 'Consulta indisponível'
                                : `${ocorrenciasFiltradas.length} ${ocorrenciasFiltradas.length === 1 ? 'ocorrência localizada' : 'ocorrências localizadas'}`}
                    </p>
                </section>

                {/* ERRO NA API */}

                {erro && (
                    <div role="alert" className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 p-4">
                        <div className="flex items-center gap-3 text-sm text-red-800">
                            <span className="material-icons" aria-hidden="true">
                                error_outline
                            </span>

                            {erro}
                        </div>

                        <button type="button" onClick={() => setTentativa(atual => atual + 1)} className="cursor-pointer rounded-lg bg-primaria px-4 py-2 text-sm font-semibold text-white">
                            Tentar novamente
                        </button>
                    </div>
                )}

                {/* AVISOS */}

                {aviso && (
                    <div role="alert" className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#dfc2ae] bg-[#fffaf4] p-4 text-sm text-texto-suave">
                        <div className="flex items-center gap-3">
                            <span className="material-icons text-primaria" aria-hidden="true">
                                info
                            </span>

                            {aviso}
                        </div>

                        <button type="button" onClick={() => setTentativa(atual => atual + 1)} className="cursor-pointer font-semibold text-primaria hover:underline">
                            Tentar novamente
                        </button>
                    </div>
                )}

                {/* OCORRÊNCIAS SEM LOCALIZAÇÃO */}

                {!carregando && !erro && semLocalizacao > 0 && (
                    <div role="status" className="mb-6 flex items-center gap-3 rounded-xl border border-[#dfc2ae] bg-[#fffaf4] p-4 text-sm text-texto-suave">
                        <span className="material-icons text-2xl text-primaria" aria-hidden="true">
                            location_off
                        </span>

                        <p>
                            {semLocalizacao} {semLocalizacao === 1
                                ? 'ocorrência não possui um município identificado no mapa.'
                                : 'ocorrências não possuem municípios identificados no mapa.'}
                        </p>
                    </div>
                )}

                {/* MAPA E PAINEL LATERAL */}

                <section className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]" aria-label="Visualização das ocorrências" aria-busy={carregando}>

                    <div className="min-w-0">
                        <Mapa ocorrencias={ocorrenciasFiltradas} ocorrenciaSelecionadaId={ocorrenciaVisivel?.id ?? null} aoSelecionarOcorrencia={selecionarOcorrencia} altura="600px" carregando={carregando} />

                        <p className="mt-3 text-xs text-texto-suave">
                            Os marcadores representam localizações aproximadas por município.
                        </p>
                    </div>

                    <aside className="flex min-h-100 flex-col overflow-hidden rounded-2xl border border-[#dfc2ae] bg-[#fffaf4] shadow-sm lg:min-h-150">
                        <div className="border-b border-[#dfc2ae] bg-[#f0dfd4] px-5 py-5">
                            <div className="flex items-center gap-3">
                                <span className="material-icons text-2xl text-primaria" aria-hidden="true">
                                    location_on
                                </span>

                                <h3 className="font-titulo text-lg font-bold text-primaria">
                                    Detalhes da Ocorrência
                                </h3>
                            </div>

                            <p className="mt-2 text-xs text-texto-suave">
                                Selecione um marcador para consultar as informações.
                            </p>
                        </div>

                        {ocorrenciaVisivel ? (
                            <div className="flex flex-1 flex-col gap-5 p-5">

                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <h4 className="font-titulo text-lg font-bold text-primaria">
                                        {ocorrenciaVisivel.categoria}
                                    </h4>

                                    <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${ESTILOS_PRIORIDADE[ocorrenciaVisivel.prioridade]}`}>
                                        Prioridade {NOMES_PRIORIDADE[ocorrenciaVisivel.prioridade]}
                                    </span>
                                </div>

                                {/* DESCRIÇÃO */}

                                <div>
                                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-texto-suave">
                                        Descrição
                                    </p>

                                    <p className="text-sm leading-relaxed text-texto">
                                        {ocorrenciaVisivel.descricao}
                                    </p>
                                </div>

                                {/* ENDEREÇO */}

                                <div className="border-t border-[#ead7c9] pt-4">
                                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-texto-suave">
                                        Endereço
                                    </p>

                                    <div className="flex items-start gap-2">
                                        <span className="material-icons text-lg text-primaria" aria-hidden="true">
                                            place
                                        </span>

                                        <div className="text-sm leading-relaxed text-texto">
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

                                <div className="border-t border-[#ead7c9] pt-4">
                                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-texto-suave">
                                        Cidade
                                    </p>

                                    <div className="flex items-center gap-2">
                                        <span className="material-icons text-lg text-primaria" aria-hidden="true">
                                            location_city
                                        </span>

                                        <span className="text-sm text-texto">
                                            {ocorrenciaVisivel.cidade} - SP
                                        </span>
                                    </div>
                                </div>

                                {/* STATUS */}

                                <div className="border-t border-[#ead7c9] pt-4">
                                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-texto-suave">
                                        Status
                                    </p>

                                    <div className="flex items-center gap-2">
                                        <span className="material-icons text-xl text-primaria" aria-hidden="true">
                                            info
                                        </span>

                                        <span className="text-sm font-semibold text-texto">
                                            {ocorrenciaVisivel.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-auto border-t border-[#ead7c9] pt-4">
                                    <button type="button" onClick={() => setOcorrenciaSelecionada(null)} className="w-full cursor-pointer rounded-xl border border-primaria px-4 py-3 text-sm font-semibold text-primaria transition-colors hover:bg-[#f3e5d9]">
                                        Fechar detalhes
                                    </button>
                                </div>
                            </div>

                        ) : (
                            <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
                                <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#f3e5d9]">
                                    <span className="material-icons text-4xl text-primaria" aria-hidden="true">
                                        map
                                    </span>
                                </div>

                                <h4 className="font-titulo text-lg font-semibold text-primaria">
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

                                <p className="mt-3 max-w-xs text-sm leading-relaxed text-texto-suave">
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
                                    <button type="button" onClick={limparFiltros} className="mt-5 cursor-pointer rounded-full border border-primaria px-5 py-2.5 text-sm font-semibold text-primaria transition-colors hover:bg-[#f3e5d9]">
                                        Limpar filtros
                                    </button>
                                )}
                            </div>
                        )}
                    </aside>
                </section>

                {/* LISTA DE OCORRÊNCIAS LOCALIZADAS */}

                {ocorrenciasFiltradas.length > 0 && (
                    <section className="mt-7 rounded-2xl border border-[#dfc2ae] bg-[#fffaf4] p-6 shadow-sm">
                        <h3 className="font-titulo text-lg font-bold text-primaria">
                            Ocorrências Localizadas
                        </h3>

                        <p className="mt-2 text-sm text-texto-suave">
                            Selecione uma ocorrência para consultar seus detalhes no mapa.
                        </p>

                        <div className="mt-5 grid max-h-96 gap-3 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3">
                            {ocorrenciasFiltradas.map(ocorrencia => (
                                <button key={ocorrencia.id} type="button" onClick={() => selecionarOcorrencia(ocorrencia)} aria-pressed={ocorrenciaVisivel?.id === ocorrencia.id} className={`cursor-pointer rounded-xl border p-4 text-left transition-colors ${ocorrenciaVisivel?.id === ocorrencia.id ? 'border-primaria bg-[#f0dfd4]' : 'border-[#dfc2ae] bg-[#fffaf4] hover:bg-[#f3e5d9]'}`}>
                                    <div className="flex items-center gap-3">
                                        <span className="material-icons text-2xl text-primaria" aria-hidden="true">
                                            location_on
                                        </span>

                                        <div className="min-w-0">
                                            <p className="font-titulo text-sm font-bold text-primaria">
                                                {ocorrencia.categoria}
                                            </p>

                                            <p className="mt-1 text-xs text-texto-suave">
                                                {ocorrencia.cidade}
                                            </p>

                                            <p className="mt-2 line-clamp-2 text-xs text-texto">
                                                {ocorrencia.descricao}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </section>
                )}

                {/* INFORMAÇÕES ADICIONAIS */}

                <section className="mt-7 rounded-2xl border border-[#dfc2ae] bg-[#fffaf4] p-6 shadow-sm sm:p-8">
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#f3e5d9]">
                            <span className="material-icons text-2xl text-primaria" aria-hidden="true">
                                info
                            </span>
                        </div>

                        <div>
                            <h3 className="font-titulo text-lg font-bold text-primaria">
                                Sobre o Mapa de Ocorrências
                            </h3>

                            <p className="mt-2 text-sm leading-relaxed text-texto-suave">
                                O mapa permite visualizar a distribuição das ocorrências urbanas registradas no Polieus, contribuindo para o acompanhamento das demandas da população e para a transparência da gestão pública.
                            </p>

                            <p className="mt-3 text-sm leading-relaxed text-texto-suave">
                                Os marcadores podem ser filtrados por categoria, prioridade ou localização. Ao selecionar uma ocorrência, suas informações são apresentadas no painel lateral.
                            </p>

                            <p className="mt-3 text-xs leading-relaxed text-texto-suave">
                                As localizações são identificadas pelos CEPs disponíveis na base geográfica do sistema e representadas por coordenadas aproximadas dos municípios, não correspondendo necessariamente ao endereço exato da ocorrência.
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}