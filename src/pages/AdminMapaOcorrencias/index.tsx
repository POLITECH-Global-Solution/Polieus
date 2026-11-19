import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { listarOcorrencias } from '../../services/ocorrenciaService';

import {
    listarHistoricosPorOcorrencia,
    obterHistoricoInicial,
    obterHistoricoAtual,
    gerarProtocolo,
} from '../../services/historicoService';

import {
    listarAnalises,
    obterAnalisePorProtocolo,
    normalizarPrioridade,
    salvarPrioridadeOcorrencia,
    type Prioridade,
    type Analise,
} from '../../services/analiseService';

// TIPAGENS

type Status = 'Pendente' | 'Em análise' | 'Em andamento' | 'Concluído' | 'Não informado';

interface Ocorrencia {
    id: number;
    protocolo: string;
    categoria: string;
    descricao: string;
    endereco: string;
    numero: string;
    cep: string;
    cidade: string;
    status: Status;
    prioridade: Prioridade | null;
    dataCriacao: string;
    latitude: number | null;
    longitude: number | null;
    historicoDisponivel: boolean;
    analiseDisponivel: boolean;
    possuiAnalise: boolean;
}

interface Filtros {
    categoria: string;
    status: string;
    prioridade: string;
    periodo: string;
}

// CONSTANTES

const centroSaoPaulo: [number, number] = [-23.5505, -46.6333];

const limitesSaoPaulo = L.latLngBounds(
    L.latLng(-25.4, -53.2),
    L.latLng(-19.7, -44.0)
);

const filtrosIniciais: Filtros = {
    categoria: '',
    status: '',
    prioridade: '',
    periodo: '',
};

const statusDisponiveis: Status[] = [
    'Pendente',
    'Em análise',
    'Em andamento',
    'Concluído',
    'Não informado',
];

const prioridades: Prioridade[] = ['Alta', 'Média', 'Baixa'];

const coresPrioridade: Record<Prioridade, string> = {
    Alta: '#b3261e',
    Média: '#e99a3e',
    Baixa: '#4f7b43',
};

const campoClasse = 'w-full rounded-lg border border-[#dec3b2] bg-[#fffaf6] px-3 py-2.5 text-sm text-texto outline-none transition-colors focus:border-primaria focus:ring-2 focus:ring-primaria/15';

const painelClasse = 'rounded-xl border border-[#dfc2ae] bg-[#fffaf6] p-5 shadow-sm';

// FUNÇÕES AUXILIARES

function Icone({ nome, classe = '' }: {
    nome: string;
    classe?: string;
}) {
    return (
        <span className={`material-icons ${classe}`} aria-hidden="true">
            {nome}
        </span>
    );
}

function normalizarTexto(texto: string): string {
    return texto.normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .toLowerCase();
}

function normalizarStatus(status?: string): Status {

    switch (normalizarTexto(status ?? '')) {

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

function corPrioridade(prioridade: Prioridade | null) {
    return prioridade
        ? coresPrioridade[prioridade]
        : '#8d8276';
}

function corStatus(status: Status) {

    const cores: Record<Status, string> = {
        Pendente: 'bg-[#f8d8d0] text-[#84261f]',
        'Em análise': 'bg-[#ffe0a5] text-[#704312]',
        'Em andamento': 'bg-[#d7e6f1] text-[#28546d]',
        'Concluído': 'bg-[#dce9d1] text-[#41642d]',
        'Não informado': 'bg-[#e5ded8] text-[#74645a]',
    };

    return cores[status];
}

function converterData(data: string): Date | null {

    if (!data) return null;

    const partes = data.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/);

    if (partes) {

        const dia = Number(partes[1]);
        const mes = Number(partes[2]);
        const ano = Number(partes[3]);

        const resultado = new Date(ano, mes - 1, dia);

        if (
            resultado.getFullYear() !== ano ||
            resultado.getMonth() !== mes - 1 ||
            resultado.getDate() !== dia
        ) {
            return null;
        }

        return resultado;
    }

    const resultado = new Date(data);

    return Number.isNaN(resultado.getTime())
        ? null
        : resultado;
}

function formatarData(data: string) {

    return converterData(data)?.toLocaleDateString('pt-BR')
        ?? 'Data indisponível';
}

function estaNoPeriodo(data: string, periodo: string) {

    if (!periodo) return true;

    const criacao = converterData(data);

    if (!criacao) return false;

    const hoje = new Date();

    const inicio = new Date(hoje);

    inicio.setHours(0, 0, 0, 0);

    inicio.setDate(hoje.getDate() - Number(periodo) + 1);

    return criacao >= inicio && criacao <= hoje;
}

// LOCALIZAÇÃO APROXIMADA PELO CEP

type Localizacao = {
    cidade: string;
    latitude: number;
    longitude: number;
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

function possuiLocalizacao(ocorrencia: Ocorrencia): boolean {

    return ocorrencia.latitude !== null &&
        ocorrencia.longitude !== null &&
        Number.isFinite(ocorrencia.latitude) &&
        Number.isFinite(ocorrencia.longitude) &&
        limitesSaoPaulo.contains([
            ocorrencia.latitude,
            ocorrencia.longitude,
        ]);
}

// MARCADORES DO MAPA

function criarIcone(prioridade: Prioridade | null, quantidade = 1) {

    const cor = corPrioridade(prioridade);

    if (quantidade > 1) {

        return L.divIcon({
            className: '',
            html: `
                <div style="
                    width: 42px;
                    height: 42px;
                    background: #80271e;
                    border: 3px solid white;
                    border-radius: 50%;
                    box-shadow: 0 3px 9px rgba(0,0,0,0.25);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 16px;
                    font-weight: bold;
                ">
                    ${quantidade}
                </div>
            `,
            iconSize: [42, 42],
            iconAnchor: [21, 21],
            popupAnchor: [0, -21],
        });
    }

    return L.divIcon({
        className: '',
        html: `
            <div style="
                width: 32px;
                height: 32px;
                background: ${cor};
                border: 3px solid white;
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                box-shadow: 0 3px 9px rgba(0,0,0,0.25);
                display: flex;
                align-items: center;
                justify-content: center;
            ">
                <div style="
                    width: 10px;
                    height: 10px;
                    background: white;
                    border-radius: 50%;
                "></div>
            </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -30],
    });
}

// AJUSTE AUTOMÁTICO DO MAPA

function AjustarMapa({ coordenadas }: {
    coordenadas: [number, number][];
}) {

    const mapa = useMap();

    useEffect(() => {

        mapa.invalidateSize();

        if (coordenadas.length === 0) {

            mapa.fitBounds(limitesSaoPaulo, {
                padding: [20, 20],
            });

        } else if (coordenadas.length === 1) {

            mapa.setView(coordenadas[0], 11);

        } else {

            mapa.fitBounds(L.latLngBounds(coordenadas), {
                padding: [40, 40],
                maxZoom: 12,
            });
        }

        const atualizar = window.setTimeout(() => {
            mapa.invalidateSize();
        }, 150);

        return () => window.clearTimeout(atualizar);

    }, [mapa, coordenadas]);

    return null;
}

function CentralizarOcorrencia({ ocorrencia }: {
    ocorrencia: Ocorrencia | null;
}) {

    const mapa = useMap();

    const latitude = ocorrencia?.latitude;

    const longitude = ocorrencia?.longitude;

    useEffect(() => {

        if (
            latitude === null ||
            latitude === undefined ||
            longitude === null ||
            longitude === undefined
        ) {
            return;
        }

        mapa.flyTo(
            [latitude, longitude],
            Math.max(mapa.getZoom(), 12),
            { duration: 0.8 }
        );

    }, [mapa, latitude, longitude]);

    return null;
}

// CONSULTAR OCORRÊNCIAS NA API JAVA

async function consultarOcorrencias(): Promise<Ocorrencia[]> {

    const registros = await listarOcorrencias();

    let analises: Analise[] = [];

    let analisesDisponiveis = true;

    try {

        analises = await listarAnalises();

    } catch (erro) {

        analisesDisponiveis = false;

        console.error('Erro ao consultar análises:', erro);
    }

    const ocorrencias = await Promise.all(

        registros.map(async (registro): Promise<Ocorrencia | null> => {

            const id = registro.idOcorrencia;

            if (
                typeof id !== 'number' ||
                !Number.isInteger(id) ||
                id <= 0
            ) {
                return null;
            }

            let historicos: Awaited<
                ReturnType<typeof listarHistoricosPorOcorrencia>
            > = [];

            let historicoDisponivel = true;

            try {

                historicos = await listarHistoricosPorOcorrencia(id);

            } catch (erro) {

                historicoDisponivel = false;

                console.error(
                    `Erro ao consultar histórico da ocorrência ${id}:`,
                    erro
                );
            }

            const historicoInicial = obterHistoricoInicial(historicos);

            const historicoAtual = obterHistoricoAtual(historicos);

            const protocolo = historicoInicial?.protocolo ||
                historicoAtual?.protocolo ||
                gerarProtocolo(id);

            let analise: Analise | null = null;

            let analiseDisponivel =
                analisesDisponiveis && historicoDisponivel;

            if (analiseDisponivel) {

                try {

                    analise = obterAnalisePorProtocolo(
                        analises,
                        protocolo
                    );

                } catch (erro) {

                    analiseDisponivel = false;

                    console.error(
                        `Erro ao identificar análise de ${protocolo}:`,
                        erro
                    );
                }
            }

            const localizacao = localizarEndereco(
                registro.endereco ?? '',
                registro.cep ?? ''
            );

            return {
                id,
                protocolo,
                categoria: registro.categoria || 'Não informada',
                descricao: registro.descricao || '',
                endereco: registro.endereco || '',
                numero: registro.departamento || '',
                cep: registro.cep || '',
                cidade: localizacao?.cidade ?? '',
                latitude: localizacao?.latitude ?? null,
                longitude: localizacao?.longitude ?? null,
                status: normalizarStatus(historicoAtual?.status),
                prioridade: normalizarPrioridade(analise?.prioridade),
                dataCriacao: historicoInicial?.data || '',
                historicoDisponivel,
                analiseDisponivel,
                possuiAnalise: analise !== null,
            };
        })
    );

    return ocorrencias.filter(
        (item): item is Ocorrencia => item !== null
    );
}

// PÁGINA ADMINISTRATIVA

export default function MapaOcorrenciasAdmin() {

    const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
    const [filtros, setFiltros] = useState<Filtros>(filtrosIniciais);
    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState('');
    const [mensagem, setMensagem] = useState('');
    const [tipoMensagem, setTipoMensagem] = useState<'sucesso' | 'erro'>('sucesso');
    const [selecionadaId, setSelecionadaId] = useState<number | null>(null);
    const [novaPrioridade, setNovaPrioridade] = useState<Prioridade | ''>('');

    const consultaAtual = useRef(0);

    const bloqueioSalvamento = useRef(false);

    // CARREGAMENTO

    const carregarOcorrencias = useCallback(async (): Promise<Ocorrencia[] | null> => {

        const consulta = ++consultaAtual.current;

        setCarregando(true);
        setErro('');

        try {

            const registros = await consultarOcorrencias();

            if (consulta !== consultaAtual.current) return null;

            setOcorrencias(registros);

            return registros;

        } catch (erro) {

            if (consulta !== consultaAtual.current) return null;

            console.error('Erro ao carregar mapa:', erro);

            setErro(
                'Não foi possível consultar as ocorrências na API Java.'
            );

            return null;

        } finally {

            if (consulta === consultaAtual.current) {

                setCarregando(false);
            }
        }

    }, []);

    useEffect(() => {

        const iniciar = window.setTimeout(() => {
            void carregarOcorrencias();
        }, 0);

        return () => {

            window.clearTimeout(iniciar);

            consultaAtual.current += 1;
        };

    }, [carregarOcorrencias]);

    // CATEGORIAS E FILTROS

    const categorias = useMemo(() => {

        const registros = new Map<string, string>();

        ocorrencias.forEach(item => {

            const chave = normalizarTexto(item.categoria);

            if (!registros.has(chave)) {

                registros.set(chave, item.categoria);
            }
        });

        return [...registros.values()].sort(
            (a, b) => a.localeCompare(b, 'pt-BR')
        );

    }, [ocorrencias]);

    const ocorrenciasFiltradas = useMemo(() => {

        return ocorrencias.filter(ocorrencia =>
            (!filtros.categoria ||
                normalizarTexto(ocorrencia.categoria) ===
                normalizarTexto(filtros.categoria)) &&
            (!filtros.status ||
                ocorrencia.status === filtros.status) &&
            (!filtros.prioridade ||
                (
                    filtros.prioridade === 'nao-definida'
                        ? ocorrencia.analiseDisponivel &&
                            ocorrencia.prioridade === null
                        : ocorrencia.prioridade === filtros.prioridade
                )
            ) &&
            estaNoPeriodo(
                ocorrencia.dataCriacao,
                filtros.periodo
            )
        );

    }, [ocorrencias, filtros]);

    const ocorrenciasLocalizadas = useMemo(() => {

        return ocorrenciasFiltradas.filter(possuiLocalizacao);

    }, [ocorrenciasFiltradas]);

    // AGRUPAMENTO DOS MARCADORES

    const grupos = useMemo(() => {

        const registros = new Map<string, Ocorrencia[]>();

        ocorrenciasLocalizadas.forEach(ocorrencia => {

            const chave = `${ocorrencia.latitude},${ocorrencia.longitude}`;

            const grupo = registros.get(chave) ?? [];

            grupo.push(ocorrencia);

            registros.set(chave, grupo);
        });

        return [...registros.entries()];

    }, [ocorrenciasLocalizadas]);

    const coordenadas = useMemo(() => {

        return grupos.map(
            ([, grupo]): [number, number] => [
                grupo[0].latitude as number,
                grupo[0].longitude as number,
            ]
        );

    }, [grupos]);

    // INDICADORES

    const indicadores = useMemo(() => ({

        total: ocorrenciasFiltradas.length,

        localizadas: ocorrenciasLocalizadas.length,

        alta: ocorrenciasFiltradas.filter(
            item => item.prioridade === 'Alta'
        ).length,

        media: ocorrenciasFiltradas.filter(
            item => item.prioridade === 'Média'
        ).length,

        baixa: ocorrenciasFiltradas.filter(
            item => item.prioridade === 'Baixa'
        ).length,

        semPrioridade: ocorrenciasFiltradas.filter(
            item => item.analiseDisponivel &&
                item.prioridade === null
        ).length,

        indisponiveis: ocorrenciasFiltradas.filter(
            item => !item.analiseDisponivel
        ).length,

        semLocalizacao: ocorrenciasFiltradas.length -
            ocorrenciasLocalizadas.length,

    }), [ocorrenciasFiltradas, ocorrenciasLocalizadas]);

    const selecionada = ocorrencias.find(
        item => item.id === selecionadaId
    ) ?? null;

    // ATUALIZAÇÃO DOS FILTROS

    const atualizarFiltro = (
        campo: keyof Filtros,
        valor: string
    ) => {

        if (salvando) return;

        setFiltros(atual => ({
            ...atual,
            [campo]: valor,
        }));
    };

    const selecionarOcorrencia = (ocorrencia: Ocorrencia) => {

        if (salvando) return;

        setSelecionadaId(ocorrencia.id);
        setNovaPrioridade(ocorrencia.prioridade ?? '');
        setMensagem('');
    };

    const limparFiltros = () => {

        if (salvando) return;

        setFiltros({ ...filtrosIniciais });
    };

    // SALVAR PRIORIDADE NA API JAVA

    const podeClassificar = selecionada !== null &&
        selecionada.historicoDisponivel &&
        selecionada.analiseDisponivel &&
        selecionada.status !== 'Não informado' &&
        !!converterData(selecionada.dataCriacao) &&
        !carregando &&
        !salvando &&
        !erro;

    const salvarPrioridade = async () => {

        if (
            !selecionada ||
            !novaPrioridade ||
            !podeClassificar ||
            bloqueioSalvamento.current ||
            selecionada.prioridade === novaPrioridade
        ) {
            return;
        }

        const id = selecionada.id;

        const prioridade = novaPrioridade;

        bloqueioSalvamento.current = true;

        setSalvando(true);
        setMensagem('');

        try {

            await salvarPrioridadeOcorrencia({

                protocolo: selecionada.protocolo,

                categoria: selecionada.categoria,

                localizacao: [
                    selecionada.endereco,
                    selecionada.numero,
                    selecionada.cidade,
                ].filter(Boolean).join(', '),

                prioridade,

                status: selecionada.status,

                data: selecionada.dataCriacao,
            });

            // CONSULTAR NOVAMENTE A API JAVA

            const registros = await carregarOcorrencias();

            const atualizada = registros?.find(
                item => item.id === id
            );

            // CONFIRMAR A PRIORIDADE ARMAZENADA

            if (
                !atualizada?.analiseDisponivel ||
                atualizada.prioridade !== prioridade
            ) {

                throw new Error(
                    'Prioridade não confirmada pela API Java.'
                );
            }

            setNovaPrioridade(prioridade);

            setTipoMensagem('sucesso');

            setMensagem(
                'Prioridade atualizada com sucesso!'
            );

        } catch (erro) {

            console.error('Erro ao atualizar prioridade:', erro);

            const registros = await carregarOcorrencias();

            const atualizada = registros?.find(
                item => item.id === id
            );

            setNovaPrioridade(atualizada?.prioridade ?? '');

            const confirmada =
                atualizada?.analiseDisponivel &&
                atualizada.prioridade === prioridade;

            setTipoMensagem(confirmada ? 'sucesso' : 'erro');

            setMensagem(
                confirmada
                    ? 'Prioridade atualizada com sucesso!'
                    : 'Não foi possível confirmar o armazenamento da prioridade na API Java.'
            );

        } finally {

            bloqueioSalvamento.current = false;

            setSalvando(false);
        }
    };

    // INTERFACE

    return (

        <main className="min-h-screen w-full bg-fundo font-corpo text-texto">

            <div className="mx-auto max-w-400 px-5 py-7 sm:px-8 lg:px-10">

                {/* CABEÇALHO */}

                <header className="border-b border-[#cda998] pb-5">

                    <div className="flex items-center gap-2 text-primaria">

                        <Icone nome="account_balance" classe="text-2xl" />

                        <span className="font-titulo text-lg font-bold">
                            Área Administrativa
                        </span>

                    </div>

                    <h1 className="mt-5 font-titulo text-3xl font-bold text-[#75211b] sm:text-4xl">
                        Mapa de Ocorrências
                    </h1>

                    <p className="mt-2 text-sm text-texto-suave">
                        Visualize as ocorrências no mapa, acompanhe seus status e gerencie suas prioridades.
                    </p>

                </header>

                {/* FILTROS */}

                <section className={`${painelClasse} mt-5`}>

                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">

                        <h2 className="flex items-center gap-2 font-titulo text-xl font-bold text-primaria">

                            <Icone nome="filter_alt" classe="text-2xl" />

                            Filtrar Ocorrências

                        </h2>

                        <button type="button" onClick={limparFiltros} disabled={salvando} className="flex cursor-pointer items-center gap-1 text-sm font-semibold text-primaria hover:underline disabled:opacity-50">

                            <Icone nome="restart_alt" classe="text-xl" />

                            Limpar filtros

                        </button>

                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                        {/* CATEGORIA */}

                        <div>

                            <label htmlFor="mapa-categoria" className="mb-2 block text-xs font-semibold text-[#75211b]">
                                Categoria
                            </label>

                            <select id="mapa-categoria" value={filtros.categoria} onChange={evento => atualizarFiltro('categoria', evento.target.value)} disabled={salvando} className={campoClasse}>

                                <option value="">Todas</option>

                                {categorias.map(categoria => (

                                    <option key={categoria} value={categoria}>
                                        {categoria}
                                    </option>

                                ))}

                            </select>

                        </div>

                        {/* STATUS */}

                        <div>

                            <label htmlFor="mapa-status" className="mb-2 block text-xs font-semibold text-[#75211b]">
                                Status
                            </label>

                            <select id="mapa-status" value={filtros.status} onChange={evento => atualizarFiltro('status', evento.target.value)} disabled={salvando} className={campoClasse}>

                                <option value="">Todos</option>

                                {statusDisponiveis.map(status => (

                                    <option key={status} value={status}>
                                        {status}
                                    </option>

                                ))}

                            </select>

                        </div>

                        {/* PRIORIDADE */}

                        <div>

                            <label htmlFor="mapa-prioridade" className="mb-2 block text-xs font-semibold text-[#75211b]">
                                Prioridade
                            </label>

                            <select id="mapa-prioridade" value={filtros.prioridade} onChange={evento => atualizarFiltro('prioridade', evento.target.value)} disabled={salvando} className={campoClasse}>

                                <option value="">Todas</option>

                                {prioridades.map(prioridade => (

                                    <option key={prioridade} value={prioridade}>
                                        {prioridade}
                                    </option>

                                ))}

                                <option value="nao-definida">
                                    Não definida
                                </option>

                            </select>

                        </div>

                        {/* PERÍODO */}

                        <div>

                            <label htmlFor="mapa-periodo" className="mb-2 block text-xs font-semibold text-[#75211b]">
                                Período
                            </label>

                            <select id="mapa-periodo" value={filtros.periodo} onChange={evento => atualizarFiltro('periodo', evento.target.value)} disabled={salvando} className={campoClasse}>

                                <option value="">Todo o período</option>
                                <option value="7">Últimos 7 dias</option>
                                <option value="30">Últimos 30 dias</option>
                                <option value="90">Últimos 90 dias</option>

                            </select>

                        </div>

                    </div>

                </section>

                {/* CARREGAMENTO */}

                {carregando && (

                    <div role="status" className="mt-5 flex items-center gap-3 rounded-lg border border-[#dfc2ae] bg-[#fffaf6] p-4">

                        <div className="h-6 w-6 shrink-0 animate-spin rounded-full border-3 border-[#ead5c7] border-t-primaria" />

                        <p className="text-sm text-texto-suave">
                            Consultando as ocorrências na plataforma...
                        </p>

                    </div>

                )}

                {/* TRATAMENTO DE ERROS */}

                {erro && (

                    <div role="alert" className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-4">

                        <div className="flex items-center gap-2 text-red-700">

                            <Icone nome="error_outline" />

                            <p className="text-sm">
                                {erro}
                            </p>

                        </div>

                        <button type="button" onClick={() => void carregarOcorrencias()} disabled={carregando || salvando} className="cursor-pointer rounded-lg bg-primaria px-4 py-2 text-sm font-semibold hover:bg-primaria-hover disabled:opacity-50">

                            <span className="text-white">
                                Tentar novamente
                            </span>

                        </button>

                    </div>

                )}

                {/* MAPA E PAINEL LATERAL */}

                <div className="mt-5 grid items-start gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">

                    {/* MAPA */}

                    <section className="min-w-0 overflow-hidden rounded-xl border border-[#dfc2ae] bg-[#fffaf6] shadow-sm">

                        <div className="relative z-0 h-125 w-full sm:h-145">

                            <MapContainer center={centroSaoPaulo} zoom={7} minZoom={6} maxZoom={18} maxBounds={limitesSaoPaulo} maxBoundsViscosity={1} scrollWheelZoom className="h-full w-full">

                                <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                                <AjustarMapa coordenadas={coordenadas} />

                                <CentralizarOcorrencia ocorrencia={selecionada} />

                                {!erro && grupos.map(([chave, grupo]) => (

                                    <Marker key={chave} position={[
                                        grupo[0].latitude as number,
                                        grupo[0].longitude as number,
                                    ]} icon={criarIcone(
                                        grupo.length === 1
                                            ? grupo[0].prioridade
                                            : null,
                                        grupo.length
                                    )} eventHandlers={{
                                        click: () => {
                                            if (grupo.length === 1) {
                                                selecionarOcorrencia(grupo[0]);
                                            }
                                        },
                                    }}>

                                        <Popup>

                                            <div className="min-w-50 max-w-70 font-corpo">

                                                <h3 className="border-b border-[#ead5c7] pb-2 text-sm font-bold text-primaria">

                                                    {grupo.length === 1
                                                        ? 'Ocorrência registrada'
                                                        : `${grupo.length} ocorrências registradas`}

                                                </h3>

                                                <div className="max-h-65 space-y-3 overflow-y-auto">

                                                    {grupo.map(ocorrencia => (

                                                        <div key={ocorrencia.id} className="border-b border-[#ead5c7] pb-3 last:border-b-0">

                                                            <p className="font-semibold text-primaria">
                                                                {ocorrencia.protocolo}
                                                            </p>

                                                            <p className="text-xs">
                                                                {ocorrencia.categoria}
                                                            </p>

                                                            <p className="text-xs">
                                                                {ocorrencia.cidade}
                                                            </p>

                                                            <div className="flex items-center gap-2 text-xs">

                                                                <span className="h-2.5 w-2.5 rounded-full" style={{
                                                                    backgroundColor: corPrioridade(ocorrencia.prioridade),
                                                                }} />

                                                                {ocorrencia.analiseDisponivel
                                                                    ? ocorrencia.prioridade ?? 'Não definida'
                                                                    : 'Indisponível'}

                                                            </div>

                                                            <button type="button" disabled={salvando} onClick={() => selecionarOcorrencia(ocorrencia)} className="mt-2 w-full cursor-pointer rounded-lg bg-primaria px-3 py-2 text-xs font-semibold hover:bg-primaria-hover disabled:opacity-50">

                                                                <span className="text-white">
                                                                    Ver detalhes
                                                                </span>

                                                            </button>

                                                        </div>

                                                    ))}

                                                </div>

                                            </div>

                                        </Popup>

                                    </Marker>

                                ))}

                            </MapContainer>

                        </div>

                        {/* LEGENDA DO MAPA */}

                        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-3 border-t border-[#ead5c7] px-4 py-4 text-xs">

                            {prioridades.map(prioridade => (

                                <span key={prioridade} className="flex items-center gap-2">

                                    <span className="h-3 w-3 rounded-full" style={{
                                        backgroundColor: corPrioridade(prioridade),
                                    }} />

                                    {prioridade}

                                </span>

                            ))}

                            <span className="flex items-center gap-2">

                                <span className="h-3 w-3 rounded-full bg-[#8d8276]" />

                                Não definida ou indisponível

                            </span>

                            <span className="flex items-center gap-2">

                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primaria text-xs font-bold text-white">
                                    2+
                                </span>

                                Ocorrências agrupadas

                            </span>

                        </div>

                        <div className="border-t border-[#ead5c7] px-4 py-3 text-center">

                            <p className="text-xs text-texto-suave">
                                Os marcadores representam localizações aproximadas por município, identificadas pelo CEP.
                            </p>

                        </div>

                    </section>

                    {/* PAINEL LATERAL */}

                    <div className="min-w-0 space-y-4">

                        {/* INDICADORES */}

                        <section className={painelClasse}>

                            <h2 className="flex items-center gap-2 font-titulo text-xl font-bold text-[#75211b]">

                                <Icone nome="location_on" classe="text-2xl" />

                                Ocorrências no Mapa

                            </h2>

                            <div className="my-5 border-y border-[#ead5c7] py-4">

                                <p className="font-titulo text-4xl font-bold text-[#75211b]">

                                    {indicadores.localizadas}

                                </p>

                            </div>

                            <div className="space-y-4">

                                <div className="flex items-center justify-between gap-3">

                                    <span className="flex items-center gap-2 text-sm">

                                        <Icone nome="location_on" classe="text-2xl text-[#b3261e]" />

                                        Alta prioridade

                                    </span>

                                    <strong className="text-sm">
                                        {indicadores.alta}
                                    </strong>

                                </div>

                                <div className="flex items-center justify-between gap-3">

                                    <span className="flex items-center gap-2 text-sm">

                                        <Icone nome="location_on" classe="text-2xl text-[#e99a3e]" />

                                        Média prioridade

                                    </span>

                                    <strong className="text-sm">
                                        {indicadores.media}
                                    </strong>

                                </div>

                                <div className="flex items-center justify-between gap-3">

                                    <span className="flex items-center gap-2 text-sm">

                                        <Icone nome="location_on" classe="text-2xl text-[#4f7b43]" />

                                        Baixa prioridade

                                    </span>

                                    <strong className="text-sm">
                                        {indicadores.baixa}
                                    </strong>

                                </div>

                                <div className="flex items-center justify-between gap-3">

                                    <span className="flex items-center gap-2 text-sm">

                                        <Icone nome="location_on" classe="text-2xl text-[#8d8276]" />

                                        Não classificadas

                                    </span>

                                    <strong className="text-sm">
                                        {indicadores.semPrioridade}
                                    </strong>

                                </div>

                                {indicadores.indisponiveis > 0 && (

                                    <div className="flex items-center justify-between gap-3">

                                        <span className="flex items-center gap-2 text-sm">

                                            <Icone nome="error_outline" classe="text-xl text-[#8d8276]" />

                                            Prioridades indisponíveis

                                        </span>

                                        <strong className="text-sm">
                                            {indicadores.indisponiveis}
                                        </strong>

                                    </div>

                                )}

                                <div className="flex items-center justify-between gap-3">

                                    <span className="flex items-center gap-2 text-sm">

                                        <Icone nome="location_off" classe="text-2xl text-[#74645a]" />

                                        Sem localização

                                    </span>

                                    <strong className="text-sm">
                                        {indicadores.semLocalizacao}
                                    </strong>

                                </div>

                            </div>

                            <div className="mt-5 border-t border-[#ead5c7] pt-4">

                                <div className="flex items-center justify-between gap-3 text-sm font-semibold">

                                    <span>Total de ocorrências</span>

                                    <span>{indicadores.total}</span>

                                </div>

                                <p className="mt-2 text-xs text-texto-suave">
                                    As prioridades incluem as ocorrências com e sem localização.
                                </p>

                            </div>

                        </section>

                        {/* DETALHES DA OCORRÊNCIA */}

                        <aside className={painelClasse}>

                            {!selecionada ? (

                                <div className="flex flex-col items-center justify-center px-2 py-5 text-center">

                                    <Icone nome="assignment" classe="text-4xl text-[#b88e7a]" />

                                    <h2 className="mt-4 font-titulo text-lg font-bold text-primaria">
                                        Detalhes da Ocorrência
                                    </h2>

                                    <p className="mt-4 text-sm leading-relaxed text-texto-suave">
                                        Selecione uma ocorrência no mapa ou na lista abaixo para gerenciar sua prioridade.
                                    </p>

                                </div>

                            ) : (

                                <>

                                    <div className="flex items-start justify-between gap-3 border-b border-[#ead5c7] pb-4">

                                        <div className="min-w-0">

                                            <h2 className="font-titulo text-xl font-bold text-primaria">
                                                Detalhes da Ocorrência
                                            </h2>

                                            <p className="mt-2 wrap-break-word text-sm font-semibold text-[#75211b]">
                                                {selecionada.protocolo}
                                            </p>

                                        </div>

                                        <button type="button" disabled={salvando} onClick={() => {
                                            setSelecionadaId(null);
                                            setNovaPrioridade('');
                                            setMensagem('');
                                        }} aria-label="Fechar detalhes" className="cursor-pointer rounded-full p-1 text-primaria hover:bg-[#f5e9e0] disabled:opacity-50">

                                            <Icone nome="close" />

                                        </button>

                                    </div>

                                    {/* INFORMAÇÕES DA OCORRÊNCIA */}

                                    <div className="mt-4 space-y-4">

                                        <div>

                                            <p className="text-xs font-semibold text-texto-suave">
                                                Categoria
                                            </p>

                                            <p className="mt-1 text-sm font-semibold">
                                                {selecionada.categoria}
                                            </p>

                                        </div>

                                        <div>

                                            <p className="text-xs font-semibold text-texto-suave">
                                                Descrição
                                            </p>

                                            <p className="mt-1 wrap-break-word whitespace-pre-wrap text-sm leading-relaxed">
                                                {selecionada.descricao || 'Descrição não informada'}
                                            </p>

                                        </div>

                                        <div>

                                            <p className="text-xs font-semibold text-texto-suave">
                                                Endereço
                                            </p>

                                            <p className="mt-1 wrap-break-word text-sm">

                                                {[selecionada.endereco, selecionada.numero].filter(Boolean).join(', ') || 'Endereço não informado'}

                                            </p>

                                            <p className="mt-1 text-xs text-texto-suave">
                                                CEP: {selecionada.cep || 'Não informado'}
                                            </p>

                                            <p className="mt-1 text-xs text-texto-suave">
                                                Município: {selecionada.cidade || 'Não identificado'}
                                            </p>

                                        </div>

                                        <div>

                                            <p className="text-xs font-semibold text-texto-suave">
                                                Data do registro
                                            </p>

                                            <p className="mt-1 text-sm">
                                                {formatarData(selecionada.dataCriacao)}
                                            </p>

                                        </div>

                                        <div className="flex flex-wrap items-center justify-between gap-3">

                                            <div>

                                                <p className="mb-2 text-xs font-semibold text-texto-suave">
                                                    Status atual
                                                </p>

                                                <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${corStatus(selecionada.status)}`}>
                                                    {selecionada.status}
                                                </span>

                                            </div>

                                            <div>

                                                <p className="mb-2 text-xs font-semibold text-texto-suave">
                                                    Prioridade atual
                                                </p>

                                                <span className="inline-flex items-center gap-2 text-xs font-semibold">

                                                    <span className="h-3 w-3 rounded-full" style={{
                                                        backgroundColor: corPrioridade(selecionada.prioridade),
                                                    }} />

                                                    {selecionada.analiseDisponivel
                                                        ? selecionada.prioridade ?? 'Não definida'
                                                        : 'Indisponível'}

                                                </span>

                                            </div>

                                        </div>

                                        {!possuiLocalizacao(selecionada) && (

                                            <div className="flex items-start gap-2 rounded-lg bg-[#f5e9e0] p-3">

                                                <Icone nome="location_off" classe="text-xl text-[#74645a]" />

                                                <p className="text-xs text-texto-suave">
                                                    Não foi possível identificar o município desta ocorrência no mapa.
                                                </p>

                                            </div>

                                        )}

                                    </div>

                                    {/* CLASSIFICAÇÃO DA PRIORIDADE */}

                                    <section className="mt-5 border-t border-[#ead5c7] pt-5">

                                        <h3 className="flex items-center gap-2 font-titulo text-lg font-bold text-primaria">

                                            <Icone nome="flag" classe="text-xl" />

                                            Classificar Prioridade

                                        </h3>

                                        <p className="mt-2 text-xs leading-relaxed text-texto-suave">
                                            Classifique a ocorrência de acordo com sua urgência.
                                        </p>

                                        <div className="mt-4 space-y-2">

                                            {prioridades.map(prioridade => (

                                                <label key={prioridade} className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${novaPrioridade === prioridade ? 'border-primaria bg-[#f5e9e0]' : 'border-[#ead5c7] hover:bg-[#fbf1e9]'} ${!podeClassificar ? 'opacity-60' : ''}`}>

                                                    <input type="radio" name="prioridade-ocorrencia" value={prioridade} checked={novaPrioridade === prioridade} onChange={() => setNovaPrioridade(prioridade)} disabled={!podeClassificar} className="h-4 w-4 accent-primaria" />

                                                    <span className="h-3 w-3 shrink-0 rounded-full" style={{
                                                        backgroundColor: corPrioridade(prioridade),
                                                    }} />

                                                    <div>

                                                        <p className="text-sm font-semibold">
                                                            {prioridade}
                                                        </p>

                                                        <p className="mt-0.5 text-xs text-texto-suave">

                                                            {prioridade === 'Alta'
                                                                ? 'Necessita de atenção urgente.'
                                                                : prioridade === 'Média'
                                                                    ? 'Necessita de atenção, sem risco imediato.'
                                                                    : 'Ocorrência de menor urgência.'}

                                                        </p>

                                                    </div>

                                                </label>

                                            ))}

                                        </div>

                                        {/* SALVAR PRIORIDADE */}

                                        <button type="button" onClick={() => void salvarPrioridade()} disabled={!podeClassificar || !novaPrioridade || novaPrioridade === selecionada.prioridade} className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primaria px-4 py-3 text-sm font-semibold transition-colors hover:bg-primaria-hover disabled:cursor-not-allowed disabled:opacity-50">

                                            <Icone nome={salvando ? 'sync' : 'save'} classe={`text-xl text-white ${salvando ? 'animate-spin' : ''}`} />

                                            <span className="text-white">

                                                {salvando
                                                    ? 'Salvando...'
                                                    : 'Salvar prioridade'}

                                            </span>

                                        </button>

                                        {!podeClassificar && !carregando && !salvando && (

                                            <p className="mt-3 text-xs text-primaria">
                                                É necessário consultar os dados da análise e possuir um histórico com data e status válidos para alterar a prioridade.
                                            </p>

                                        )}

                                        {mensagem && (

                                            <p role="status" className={`mt-3 rounded-lg p-3 text-xs font-semibold ${tipoMensagem === 'sucesso' ? 'bg-[#e5efdc] text-[#41642d]' : 'bg-red-50 text-red-700'}`}>

                                                {mensagem}

                                            </p>

                                        )}

                                    </section>

                                </>

                            )}

                        </aside>

                    </div>

                </div>

                {/* LISTA DE OCORRÊNCIAS */}

                <section className={`${painelClasse} mt-5`}>

                    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">

                        <h2 className="flex items-center gap-2 font-titulo text-xl font-bold text-primaria">

                            <Icone nome="format_list_bulleted" classe="text-2xl" />

                            Ocorrências registradas

                        </h2>

                        <button type="button" onClick={() => {
                            setSelecionadaId(null);
                            setNovaPrioridade('');
                            setMensagem('');
                            void carregarOcorrencias();
                        }} disabled={carregando || salvando} className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-primaria hover:underline disabled:opacity-50">

                            <Icone nome="refresh" classe={`text-xl ${carregando ? 'animate-spin' : ''}`} />

                            Atualizar lista

                        </button>

                    </div>

                    <p className="mb-4 text-xs text-texto-suave">
                        Selecione uma ocorrência para consultar seus detalhes ou alterar sua prioridade, mesmo que ela não esteja localizada no mapa.
                    </p>

                    <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">

                        {!carregando && !erro && ocorrenciasFiltradas.map(ocorrencia => (

                            <button key={ocorrencia.id} type="button" disabled={salvando} onClick={() => selecionarOcorrencia(ocorrencia)} className={`cursor-pointer rounded-xl border p-4 text-left transition-colors disabled:opacity-50 ${selecionadaId === ocorrencia.id ? 'border-primaria bg-[#f5e9e0]' : 'border-[#ead5c7] hover:bg-[#fbf1e9]'}`}>

                                <div className="flex items-center justify-between gap-3">

                                    <strong className="text-sm text-primaria">
                                        {ocorrencia.protocolo}
                                    </strong>

                                    <Icone nome="visibility" classe="text-xl text-primaria" />

                                </div>

                                <p className="mt-2 text-sm font-semibold">
                                    {ocorrencia.categoria}
                                </p>

                                <p className="mt-1 truncate text-xs text-texto-suave">
                                    {ocorrencia.endereco || 'Endereço não informado'}
                                </p>

                                <div className="mt-3 flex flex-wrap items-center gap-3">

                                    <span className="flex items-center gap-1.5 text-xs">

                                        <span className="h-2.5 w-2.5 rounded-full" style={{
                                            backgroundColor: corPrioridade(ocorrencia.prioridade),
                                        }} />

                                        {ocorrencia.analiseDisponivel
                                            ? ocorrencia.prioridade ?? 'Não definida'
                                            : 'Indisponível'}

                                    </span>

                                    <span className={`rounded-full px-2 py-1 text-xs ${corStatus(ocorrencia.status)}`}>

                                        {ocorrencia.status}

                                    </span>

                                </div>

                                <div className="mt-3 flex items-center gap-1 text-xs text-texto-suave">

                                    <Icone nome={possuiLocalizacao(ocorrencia) ? 'location_on' : 'location_off'} classe="text-lg" />

                                    {possuiLocalizacao(ocorrencia)
                                        ? ocorrencia.cidade
                                        : 'Sem localização no mapa'}

                                </div>

                            </button>

                        ))}

                    </div>

                    {/* NENHUMA OCORRÊNCIA */}

                    {!carregando && !erro && ocorrenciasFiltradas.length === 0 && (

                        <div className="flex flex-col items-center py-10 text-center">

                            <Icone nome="inbox" classe="text-5xl text-[#b88e7a]" />

                            <p className="mt-3 font-titulo text-lg font-bold text-primaria">
                                Nenhuma ocorrência encontrada
                            </p>

                            <p className="mt-2 text-sm text-texto-suave">
                                Não existem ocorrências disponíveis para os filtros selecionados.
                            </p>

                        </div>

                    )}

                    {/* GERENCIAR OCORRÊNCIAS */}

                    <div className="mt-5 flex justify-end">

                        <Link to="/admin/gerenciar-ocorrencias" className="flex items-center justify-center gap-2 rounded-lg bg-primaria px-5 py-3 text-sm font-semibold transition-colors hover:bg-primaria-hover">

                            <Icone nome="list" classe="text-xl text-white" />

                            <span className="text-white">
                                Gerenciar Ocorrências
                            </span>

                        </Link>

                    </div>

                </section>

            </div>

        </main>
    );
}