import { Link } from 'react-router-dom';

const anoAtual = new Date().getFullYear();

const linksPlataforma = [
    { nome: 'Início', caminho: '/inicio' },
    { nome: 'Mapa de Ocorrências', caminho: '/mapa-ocorrencias' },
    { nome: 'Registrar Ocorrência', caminho: '/registrar-ocorrencia' },
    { nome: 'Minhas Ocorrências', caminho: '/minhas-ocorrencias' },
    { nome: 'Transparência', caminho: '/transparencia' },
    { nome: 'Meu Perfil', caminho: '/perfil' },
];

const linksInstitucionais = [
    { nome: 'Sobre o Polieus', caminho: '/sobre' },
    { nome: 'Nossa Equipe', caminho: '/integrantes' },
];

const linksSuporte = [
    { nome: 'Perguntas Frequentes', caminho: '/faq' },
    { nome: 'Contato', caminho: '/contato' },
];

type GrupoLinksProps = {
    titulo: string;
    links: {
        nome: string;
        caminho: string;
    }[];
};

function GrupoLinks({ titulo, links }: GrupoLinksProps) {
    return (
        <nav aria-label={titulo}>
            <h3 className="font-titulo text-lg font-bold text-primaria">
                {titulo}
            </h3>

            <div className="mt-5 flex flex-col items-start gap-3">
                {links.map((link) => (
                    <Link
                        key={link.caminho}
                        to={link.caminho}
                        className="group inline-flex items-center gap-2 text-sm leading-6 text-texto-suave transition-colors duration-200 hover:text-primaria focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primaria"
                    >
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primaria opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

                        <span className="-ml-3 transition-transform duration-200 group-hover:translate-x-3">
                            {link.nome}
                        </span>
                    </Link>
                ))}
            </div>
        </nav>
    );
}

export default function Rodape() {
    const irParaTopo = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    return (
        <footer className="w-full border-t border-[#c6b9a7] bg-secundaria font-corpo">
            <div className="mx-auto max-w-7xl px-6 pt-12 pb-7 sm:px-8 lg:px-10">
                <div className="grid gap-10 sm:grid-cols-2 xl:grid-cols-[1.5fr_1fr_1fr_1fr] xl:gap-12">
                    <div className="sm:col-span-2 xl:col-span-1">
                        <button
                            type="button"
                            onClick={irParaTopo}
                            aria-label="Polieus - Voltar ao topo da página"
                            className="group inline-flex items-center gap-3 rounded-sm text-left transition-opacity duration-200 hover:opacity-75 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primaria"
                        >
                            <span
                                className="material-icons text-3xl text-primaria"
                                aria-hidden="true"
                            >
                                account_balance
                            </span>

                            <span className="font-titulo text-2xl font-bold text-primaria">
                                POLIEUS
                            </span>
                        </button>

                        <p className="mt-5 max-w-sm text-sm leading-7 text-texto-suave">
                            Tecnologia a serviço da cidadania.
                            Uma plataforma que conecta cidadãos,
                            incentiva a participação social e
                            facilita o registro e acompanhamento
                            de problemas urbanos.
                        </p>

                        <p className="mt-4 max-w-sm text-sm leading-7 text-texto-suave">
                            Juntos, construímos cidades mais
                            justas, transparentes e participativas.
                        </p>

                        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#bfa99a] px-4 py-2">
                            <span
                                className="material-icons text-lg text-primaria"
                                aria-hidden="true"
                            >
                                location_on
                            </span>

                            <span className="text-xs font-semibold text-texto-suave">
                                São Paulo, Brasil
                            </span>
                        </div>
                    </div>

                    <GrupoLinks
                        titulo="Plataforma"
                        links={linksPlataforma}
                    />

                    <GrupoLinks
                        titulo="Institucional"
                        links={linksInstitucionais}
                    />

                    <GrupoLinks
                        titulo="Suporte"
                        links={linksSuporte}
                    />
                </div>

                <div className="mt-12 border-t border-[#b9aa99]" />

                <div className="flex flex-col items-center justify-between gap-4 pt-6 text-center sm:flex-row sm:text-left">
                    <p className="text-xs leading-6 text-texto-suave">
                        © {anoAtual} Polieus — Equipe Politech.
                        Todos os direitos reservados.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-texto-suave sm:justify-end">
                        <span>FIAP</span>

                        <span className="text-primaria">•</span>

                        <span>Global Solution</span>

                        <span className="text-primaria">•</span>

                        <span>CitizenTech</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
