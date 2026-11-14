import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

import logoPolieus from '../../../public/favicons/logo_polieus3.png';
import fundoInicio from '../../img/fundo_inicio.png';

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

const REGIOES: Regiao[] = [
    { nome: 'Metropolitana', cor: '#771c1b' },
    { nome: 'Interior Norte', cor: '#a9362e' },
    { nome: 'Interior Oeste', cor: '#c75d50' },
    { nome: 'Interior Central', cor: '#e49a83' },
    { nome: 'Interior Sul', cor: '#d9ac85' },
    { nome: 'Litoral', cor: '#e7c6a8' },
];

const INDICADORES = [
    { icone: 'groups', nome: 'Ocorrências registradas' },
    { icone: 'task_alt', nome: 'Resolvidas' },
    { icone: 'schedule', nome: 'Em análise' },
    { icone: 'report_problem', nome: 'Pendentes' },
];

const FUNCIONALIDADES: ItemFuncionalidade[] = [
    {
        icone: 'add_location_alt',
        titulo: 'Registrar Ocorrência',
        descricao:
            'Comunique problemas urbanos, descreva a situação e informe o local onde ela acontece.',
        caminho: '/registrar-ocorrencia',
        acao: 'Registrar agora',
    },
    {
        icone: 'map',
        titulo: 'Mapa de Ocorrências',
        descricao:
            'Explore os registros distribuídos pelo estado de São Paulo e consulte suas informações.',
        caminho: '/mapa-ocorrencias',
        acao: 'Explorar mapa',
    },
    {
        icone: 'fact_check',
        titulo: 'Minhas Ocorrências',
        descricao:
            'Consulte o histórico das suas solicitações e acompanhe as informações disponíveis.',
        caminho: '/minhas-ocorrencias',
        acao: 'Acompanhar registros',
    },
    {
        icone: 'bar_chart',
        titulo: 'Transparência',
        descricao:
            'Conheça indicadores e estimativas que ajudam a compreender as demandas urbanas.',
        caminho: '/transparencia',
        acao: 'Ver indicadores',
    },
];

const ETAPAS = [
    {
        numero: '01',
        icone: 'edit_note',
        titulo: 'Descreva',
        descricao:
            'Selecione a categoria e informe os detalhes do problema identificado.',
    },
    {
        numero: '02',
        icone: 'location_on',
        titulo: 'Localize',
        descricao:
            'Preencha o endereço onde a ocorrência foi encontrada.',
    },
    {
        numero: '03',
        icone: 'task_alt',
        titulo: 'Registre',
        descricao:
            'Revise as informações e conclua o registro da ocorrência.',
    },
    {
        numero: '04',
        icone: 'visibility',
        titulo: 'Acompanhe',
        descricao:
            'Consulte o histórico e as atualizações disponibilizadas.',
    },
];

const CATEGORIAS = [
    {
        icone: 'lightbulb',
        titulo: 'Iluminação',
        descricao:
            'Problemas relacionados a postes, lâmpadas e iluminação pública.',
    },
    {
        icone: 'water_drop',
        titulo: 'Saneamento',
        descricao:
            'Questões relacionadas à água, esgoto e drenagem urbana.',
    },
    {
        icone: 'directions_bus',
        titulo: 'Transporte',
        descricao:
            'Demandas relacionadas à mobilidade e ao transporte público.',
    },
    {
        icone: 'construction',
        titulo: 'Infraestrutura',
        descricao:
            'Problemas em ruas, calçadas e equipamentos urbanos.',
    },
];

function Icone({
    nome,
    tamanho = 'text-2xl',
}: {
    nome: string;
    tamanho?: string;
}) {
    return (
        <span
            className={`material-icons inline-flex shrink-0 items-center justify-center leading-none ${tamanho}`}
            aria-hidden="true"
        >
            {nome}
        </span>
    );
}

function BotaoPrincipal({
    to,
    children,
    icone = 'arrow_forward',
}: {
    to: string;
    children: ReactNode;
    icone?: string;
}) {
    return (
        <Link
            to={to}
            className="inline-flex items-center justify-center gap-3 rounded-xl bg-primaria px-6 py-3.5 text-center text-sm font-bold shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-primaria-hover"
            style={{ color: '#ffffff' }}
        >
            {children}
            <Icone nome={icone} tamanho="text-lg" />
        </Link>
    );
}

function TituloSecao({
    detalhe,
    titulo,
    descricao,
}: {
    detalhe: string;
    titulo: string;
    descricao?: string;
}) {
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

/*
 * SVG ilustrativo do estado de São Paulo.
 * As divisões internas seguem a proposta visual do Figma
 * e não representam limites regionais oficiais.
 */
function MapaEstadoSP() {
    return (
        <div className="w-full">
            <div className="grid items-center gap-5 sm:grid-cols-[minmax(0,1fr)_150px]">
                <div className="flex items-center justify-center">
                    <svg
                        viewBox="0 0 520 350"
                        role="img"
                        aria-label="Mapa ilustrativo do estado de São Paulo dividido em seis áreas coloridas"
                        className="h-auto w-full max-w-lg"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <defs>
                            <clipPath id="sp-contorno-inicio">
                                <path
                                    d="
                                        M 32 199
                                        L 45 190 55 176 69 171
                                        80 158 95 151 103 138
                                        118 131 125 116 140 109
                                        151 92 164 97 176 83
                                        191 88 204 75 220 86
                                        238 81 254 91 270 85
                                        285 96 300 92 315 104
                                        330 99 345 113 359 110
                                        372 124 388 122 401 137
                                        416 139 428 153 443 160
                                        452 174 466 180 475 195
                                        490 202 498 215 486 224
                                        472 220 460 229 447 226
                                        433 240 421 238 410 250
                                        395 256 386 271 373 277
                                        361 292 348 295 336 313
                                        322 307 314 294 300 289
                                        288 274 271 267 260 251
                                        243 246 232 232 216 229
                                        204 218 187 221 174 212
                                        157 215 145 204 129 209
                                        116 198 101 201 87 191
                                        73 195 60 189 47 199 Z
                                    "
                                />
                            </clipPath>
                        </defs>

                        <g clipPath="url(#sp-contorno-inicio)">
                            <rect
                                width="520"
                                height="350"
                                fill="#d9ac85"
                            />

                            {/* Interior Oeste */}
                            <path
                                d="
                                    M 0 0
                                    H 225
                                    L 210 90
                                    235 130
                                    210 170
                                    242 215
                                    180 250
                                    0 255 Z
                                "
                                fill="#c75d50"
                                stroke="#fff8f1"
                                strokeWidth="3"
                            />

                            {/* Interior Norte */}
                            <path
                                d="
                                    M 205 0
                                    H 520
                                    V 155
                                    L 425 160
                                    390 145
                                    345 157
                                    300 139
                                    265 153
                                    235 130
                                    210 90 Z
                                "
                                fill="#a9362e"
                                stroke="#fff8f1"
                                strokeWidth="3"
                            />

                            {/* Interior Central */}
                            <path
                                d="
                                    M 235 130
                                    L 265 153
                                    300 139
                                    345 157
                                    390 145
                                    410 190
                                    380 219
                                    341 228
                                    302 213
                                    270 236
                                    242 215
                                    210 170 Z
                                "
                                fill="#e49a83"
                                stroke="#fff8f1"
                                strokeWidth="3"
                            />

                            {/* Interior Sul */}
                            <path
                                d="
                                    M 0 255
                                    L 180 250
                                    242 215
                                    270 236
                                    302 213
                                    341 228
                                    365 270
                                    350 350
                                    H 0 Z
                                "
                                fill="#d9ac85"
                                stroke="#fff8f1"
                                strokeWidth="3"
                            />

                            {/* Metropolitana */}
                            <path
                                d="
                                    M 390 145
                                    L 425 160
                                    460 172
                                    500 204
                                    470 230
                                    440 245
                                    410 250
                                    380 219
                                    410 190 Z
                                "
                                fill="#771c1b"
                                stroke="#fff8f1"
                                strokeWidth="3"
                            />

                            {/* Litoral */}
                            <path
                                d="
                                    M 341 228
                                    L 380 219
                                    410 250
                                    440 245
                                    470 230
                                    520 215
                                    V 350
                                    H 350
                                    L 365 270 Z
                                "
                                fill="#e7c6a8"
                                stroke="#fff8f1"
                                strokeWidth="3"
                            />
                        </g>

                        {/* Contorno externo */}
                        <path
                            d="
                                M 32 199
                                L 45 190 55 176 69 171
                                80 158 95 151 103 138
                                118 131 125 116 140 109
                                151 92 164 97 176 83
                                191 88 204 75 220 86
                                238 81 254 91 270 85
                                285 96 300 92 315 104
                                330 99 345 113 359 110
                                372 124 388 122 401 137
                                416 139 428 153 443 160
                                452 174 466 180 475 195
                                490 202 498 215 486 224
                                472 220 460 229 447 226
                                433 240 421 238 410 250
                                395 256 386 271 373 277
                                361 292 348 295 336 313
                                322 307 314 294 300 289
                                288 274 271 267 260 251
                                243 246 232 232 216 229
                                204 218 187 221 174 212
                                157 215 145 204 129 209
                                116 198 101 201 87 191
                                73 195 60 189 47 199 Z
                            "
                            fill="none"
                            stroke="#fff8f1"
                            strokeWidth="3"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>

                {/* Legenda */}
                <div className="border-t border-[#d6aa90] pt-4 sm:border-l sm:border-t-0 sm:py-4 sm:pl-5">
                    <h3 className="mb-4 font-titulo text-sm font-bold text-primaria">
                        Regiões
                    </h3>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-1">
                        {REGIOES.map((regiao) => (
                            <div
                                key={regiao.nome}
                                className="flex items-center gap-2"
                            >
                                <span
                                    className="h-3.5 w-3.5 shrink-0 rounded-full"
                                    style={{
                                        backgroundColor: regiao.cor,
                                    }}
                                />

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

export default function Inicio() {
    return (
        <main className="min-h-screen w-full min-w-0 flex-1 bg-fundo font-corpo text-texto">
            {/* BANNER PRINCIPAL */}
            <section className="relative isolate overflow-hidden bg-[#f8eee4]">
                <div
                    className="absolute inset-0 -z-20 bg-cover bg-center"
                    style={{
                        backgroundImage: `url(${fundoInicio})`,
                    }}
                    aria-hidden="true"
                />

                <div
                    className="absolute inset-0 -z-10"
                    style={{
                        background:
                            'linear-gradient(90deg, rgba(248,238,228,0.99) 0%, rgba(248,238,228,0.97) 38%, rgba(248,238,228,0.85) 58%, rgba(248,238,228,0.18) 100%)',
                    }}
                    aria-hidden="true"
                />

                <div className="mx-auto grid min-h-130 max-w-7xl items-center gap-10 px-6 py-14 lg:grid-cols-[260px_minmax(0,1fr)] lg:px-10 lg:py-20">
                    {/* LOGO */}
                    <div className="flex items-center justify-center">
                        <img
                            src={logoPolieus}
                            alt="Logotipo Polieus"
                            className="w-56 max-w-full object-contain drop-shadow-md sm:w-64 lg:w-72"
                        />
                    </div>

                    <div className="min-w-0 max-w-2xl">
                        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#d9b7a4] bg-[#fff8f1] px-4 py-2 text-xs font-bold uppercase tracking-wider text-primaria">
                            <Icone
                                nome="account_balance"
                                tamanho="text-base"
                            />
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
                            O Polieus é uma plataforma que conecta
                            tecnologia e participação cidadã para
                            facilitar o registro de problemas urbanos,
                            o acompanhamento de solicitações e o acesso
                            a informações de interesse público.
                        </p>

                        <p className="mt-3 text-sm leading-7 text-texto-suave">
                            Nossa proposta é incentivar uma sociedade
                            mais participativa, oferecendo ferramentas
                            digitais que contribuam para identificar
                            necessidades, ampliar a transparência e
                            construir cidades melhores.
                        </p>

                        {/* APENAS O BOTÃO CONHEÇA O PROJETO */}
                        <div className="mt-7">
                            <BotaoPrincipal to="/sobre">
                                Conheça o Projeto
                            </BotaoPrincipal>
                        </div>
                    </div>
                </div>
            </section>

            <div className="mx-auto max-w-7xl space-y-14 px-4 py-9 sm:px-8 lg:px-10">
                {/* INDICADORES */}
                <section aria-label="Indicadores da plataforma">
                    <div className="grid overflow-hidden rounded-2xl border border-[#e3c5af] bg-[#f0dfd0] shadow-sm sm:grid-cols-2 xl:grid-cols-4">
                        {INDICADORES.map((item) => (
                            <div
                                key={item.nome}
                                className="flex items-center gap-4 border-b border-[#dfbfa8] px-5 py-6 sm:border-r xl:border-b-0"
                            >
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#fff8f1] text-primaria">
                                    <Icone
                                        nome={item.icone}
                                        tamanho="text-3xl"
                                    />
                                </div>

                                <div>
                                    <p className="font-titulo text-3xl font-bold text-primaria">
                                        —
                                    </p>

                                    <p className="text-sm text-texto-suave">
                                        {item.nome}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <p className="mt-3 text-center text-xs text-texto-suave">
                        Indicadores disponíveis após a integração
                        com os registros do sistema.
                    </p>
                </section>

                {/* OCORRÊNCIAS E MAPA */}
                <section className="grid items-stretch gap-7 xl:grid-cols-2">
                    {/* ÚLTIMAS OCORRÊNCIAS */}
                    <div className="flex flex-col">
                        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                            <h2 className="border-l-4 border-primaria pl-4 font-titulo text-2xl font-bold text-primaria">
                                Últimas Ocorrências
                            </h2>

                            <Link
                                to="/minhas-ocorrencias"
                                className="flex items-center gap-2 text-sm font-semibold text-primaria hover:underline"
                            >
                                Meus registros
                                <Icone
                                    nome="arrow_forward"
                                    tamanho="text-lg"
                                />
                            </Link>
                        </div>

                        <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-[#e3c5af] bg-[#fffaf5] px-6 py-12 text-center shadow-sm">
                            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#f0dfd0] text-primaria">
                                <Icone
                                    nome="assignment"
                                    tamanho="text-4xl"
                                />
                            </div>

                            <h3 className="font-titulo text-xl font-bold text-primaria">
                                Nenhuma ocorrência disponível
                            </h3>

                            <p className="mt-4 max-w-sm text-sm leading-7 text-texto-suave">
                                Os registros mais recentes aparecerão
                                aqui quando estiverem disponíveis.
                                Você também pode contribuir relatando
                                problemas encontrados em sua cidade.
                            </p>

                            <div className="mt-7">
                                <BotaoPrincipal
                                    to="/registrar-ocorrencia"
                                    icone="add_circle_outline"
                                >
                                    Registrar Ocorrência
                                </BotaoPrincipal>
                            </div>
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
                            Conheça o território paulista e explore
                            os problemas urbanos registrados pelos
                            cidadãos nas diferentes localidades do estado.
                        </p>

                        <div className="my-5 flex-1">
                            <MapaEstadoSP />
                        </div>

                        <div className="mt-auto">
                            <BotaoPrincipal
                                to="/mapa-ocorrencias"
                                icone="map"
                            >
                                Ver Mapa de Ocorrências
                            </BotaoPrincipal>
                        </div>
                    </div>
                </section>

                {/* FUNCIONALIDADES */}
                <section>
                    <TituloSecao
                        detalhe="Tudo em um só lugar"
                        titulo="O que você pode fazer no Polieus?"
                        descricao="Conheça as funcionalidades desenvolvidas para facilitar a participação cidadã e o acompanhamento das demandas urbanas."
                    />

                    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                        {FUNCIONALIDADES.map((item) => (
                            <article
                                key={item.titulo}
                                className="flex min-w-0 flex-col rounded-2xl border border-[#e3c5af] bg-[#fffaf5] p-6 shadow-sm transition-transform duration-200 hover:-translate-y-1"
                            >
                                {/* ÍCONE CENTRALIZADO */}
                                <div className="mb-6 flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-[#f0dfd0]">
                                    <Icone
                                        nome={item.icone}
                                        tamanho="text-3xl text-primaria"
                                    />
                                </div>

                                <h3 className="font-titulo text-lg font-bold text-primaria">
                                    {item.titulo}
                                </h3>

                                <p className="mt-3 flex-1 text-sm leading-7 text-texto-suave">
                                    {item.descricao}
                                </p>

                                <Link
                                    to={item.caminho}
                                    className="mt-6 flex items-center gap-2 border-t border-[#ead5c5] pt-4 text-sm font-bold text-primaria transition-colors hover:text-primaria-hover"
                                >
                                    {item.acao}

                                    <Icone
                                        nome="arrow_forward"
                                        tamanho="text-lg"
                                    />
                                </Link>
                            </article>
                        ))}
                    </div>
                </section>

                {/* COMO FUNCIONA */}
                <section className="rounded-2xl border border-[#e3c5af] bg-[#f0dfd0] p-6 shadow-sm sm:p-8">
                    <TituloSecao
                        detalhe="Simples e acessível"
                        titulo="Como funciona o Polieus?"
                        descricao="Um processo organizado para que cada cidadão possa comunicar situações e acompanhar suas solicitações."
                    />

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {ETAPAS.map((etapa) => (
                            <article
                                key={etapa.numero}
                                className="rounded-xl border border-[#e4c9b7] bg-[#fffaf5] p-5"
                            >
                                <div className="mb-4 flex items-center justify-between">
                                    <span className="font-titulo text-3xl font-bold text-[#c69d89]">
                                        {etapa.numero}
                                    </span>

                                    <span className="text-primaria">
                                        <Icone
                                            nome={etapa.icone}
                                            tamanho="text-3xl"
                                        />
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
                    <TituloSecao
                        detalhe="Demandas urbanas"
                        titulo="Categorias de Ocorrências"
                        descricao="Os registros são organizados por categorias para facilitar a identificação dos diferentes problemas urbanos."
                    />

                    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                        {CATEGORIAS.map((categoria) => (
                            <article
                                key={categoria.titulo}
                                className="rounded-xl border border-[#e3c5af] bg-[#fffaf5] p-6 shadow-sm"
                            >
                                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-[#f0dfd0] text-primaria">
                                    <Icone
                                        nome={categoria.icone}
                                        tamanho="text-3xl"
                                    />
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
                            O Polieus nasce da ideia de que a
                            tecnologia pode fortalecer a relação
                            entre cidadãos e gestão pública.
                            Ao reunir informações sobre problemas
                            urbanos, buscamos contribuir para
                            uma sociedade mais consciente e participativa.
                        </p>

                        <p className="mt-4 text-sm leading-8 text-texto-suave">
                            Nossa missão é incentivar a transparência,
                            a colaboração e o uso responsável
                            da tecnologia para transformar
                            necessidades individuais em conhecimento coletivo.
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
                                descricao:
                                    'Incentivamos a população a participar da identificação de problemas urbanos.',
                            },
                            {
                                icone: 'visibility',
                                titulo: 'Transparência',
                                descricao:
                                    'Organizamos informações para facilitar a consulta e o acompanhamento.',
                            },
                            {
                                icone: 'hub',
                                titulo: 'Inovação',
                                descricao:
                                    'Utilizamos recursos digitais para apoiar soluções voltadas à sociedade.',
                            },
                        ].map((item) => (
                            <div
                                key={item.titulo}
                                className="flex items-start gap-4 rounded-xl bg-[#fff8f1] p-5"
                            >
                                <span className="shrink-0 text-primaria">
                                    <Icone
                                        nome={item.icone}
                                        tamanho="text-3xl"
                                    />
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

                {/* CHAMADA FINAL - BOTÕES CORRIGIDOS */}
                <section className="rounded-2xl bg-[#76241e] px-6 py-12 text-center shadow-lg sm:px-10">
                    <div className="mb-4 flex justify-center text-white">
                        <Icone
                            nome="account_balance"
                            tamanho="text-5xl"
                        />
                    </div>

                    <h2
                        className="font-titulo text-2xl font-bold sm:text-3xl"
                        style={{ color: '#ffffff' }}
                    >
                        Faça parte da transformação.
                    </h2>

                    <p
                        className="mx-auto mt-4 max-w-2xl text-sm leading-8 sm:text-base"
                        style={{ color: '#ffffff' }}
                    >
                        Sua participação é essencial para a construção
                        de cidades mais justas, transparentes e conectadas.
                        Conheça as ferramentas do Polieus e contribua
                        para essa transformação.
                    </p>

                    <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                        {/* BOTÃO REGISTRAR */}
                        <Link
                            to="/registrar-ocorrencia"
                            className="inline-flex min-h-14 items-center justify-center gap-3 rounded-xl bg-white px-7 py-4 text-sm font-bold shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#f3e2d6]"
                            style={{ color: '#76241e' }}
                        >
                            <span>Registrar Ocorrência</span>

                            <Icone
                                nome="arrow_forward"
                                tamanho="text-xl"
                            />
                        </Link>

                        {/* BOTÃO EXPLORAR MAPA */}
                        <Link
                            to="/mapa-ocorrencias"
                            className="inline-flex min-h-14 items-center justify-center gap-3 rounded-xl border-2 border-white bg-transparent px-7 py-4 text-sm font-bold transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/10"
                            style={{ color: '#ffffff' }}
                        >
                            <span>Explorar o Mapa</span>

                            <Icone
                                nome="map"
                                tamanho="text-xl"
                            />
                        </Link>
                    </div>
                </section>
            </div>
        </main>
    );
}
