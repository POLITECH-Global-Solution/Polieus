import fotoMurilo from '../../img/fotoMurilo.jpeg';
import fotoIsa from '../../img/fotoIsa.png';
import fotoMilena from '../../img/fotoMilena.png';
import fotoMarina from '../../img/fotoMarina.jpg';
import fotoHenrique from '../../img/fotoHenrique.jpeg';

import githubIcon from '../../img/github.png';
import linkedinIcon from '../../img/lkd.png';

export default function Integrantes() {
    const equipe = [
        {
            nome: 'Henrique Bonachela de Carvalho Carabante',
            rm: '573620',
            cargo: 'Especialista em Inteligência Artificial',
            turma: '1TDSPH',
            foto: fotoHenrique,
            github: 'https://github.com/henriquebonachela',
            linkedin: 'https://www.linkedin.com/in/henrique-bonachela-de-carvalho-carabante-260b86338/',
        },
        {
            nome: 'Isabelle Ferreira Neri Feitoza',
            rm: '573507',
            cargo: 'Analista de Dados',
            turma: '1TDSPH',
            foto: fotoIsa,
            github: 'https://github.com/isabelleferreiraa',
            linkedin: 'https://www.linkedin.com/in/isabelle-ferreira-8844593ab',
        },
        {
            nome: 'Milena Silva Conegin',
            rm: '568923',
            cargo: 'Desenvolvedora Back-end (Java)',
            turma: '1TDSPH',
            foto: fotoMilena,
            github: 'https://github.com/MilenaConegin',
            linkedin: 'https://www.linkedin.com/in/milena-conegin-996b22269',
        },
        {
            nome: 'Marina Fernandes Gomes Mesquita',
            rm: '571265',
            cargo: 'Desenvolvedora Front-end',
            turma: '1TDSPH',
            foto: fotoMarina,
            github: 'https://github.com/marifernandesgm',
            linkedin: 'https://www.linkedin.com/in/marifernandesgm-58460a40a',
        },
        {
            nome: 'Murilo Almeida Rodrigues de Souza',
            rm: '573977',
            cargo: 'Desenvolvedor Back-end (Python)',
            turma: '1TDSPH',
            foto: fotoMurilo,
            github: 'https://github.com/murilo-a-souza',
            linkedin: 'https://www.linkedin.com/in/murilo-a-souza/',
        },
    ];

    return (
        <main className="w-full flex-1 bg-fundo px-4 sm:px-6 lg:px-8 py-10">

            <section className="text-center mb-10">
                <h1 className="font-titulo text-3xl sm:text-4xl lg:text-5xl font-bold text-primaria mb-3">
                    Nossa Equipe
                </h1>

                <p className="font-corpo text-sm sm:text-base text-texto-suave max-w-2xl mx-auto">
                    Conheça os integrantes responsáveis pelo desenvolvimento do Polieus,
                    unindo tecnologia, inovação e participação cidadã.
                </p>

                <div className="flex items-center justify-center gap-3 mt-5" aria-hidden="true">
                    <span className="w-20 h-px bg-primaria"></span>
                    <span className="w-2 h-2 rotate-45 bg-primaria"></span>
                    <span className="w-20 h-px bg-primaria"></span>
                </div>
            </section>

            <section className="flex flex-wrap justify-center items-stretch gap-6 max-w-6xl mx-auto">
                {equipe.map((integrante) => (
                    <article
                        key={integrante.rm}
                        className="bg-[#f9f0e7] border border-[#dfc2ae] rounded-xl p-6 w-full max-w-xs min-h-105 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md flex flex-col items-center"
                    >
                        <div className="w-28 h-28 shrink-0 rounded-full overflow-hidden mb-5 border-3 border-primaria shadow-sm bg-secundaria">
                            <img
                                src={integrante.foto}
                                alt={`Foto de ${integrante.nome}`}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <p className="font-corpo text-xs font-semibold text-primaria mb-2 tracking-wider">
                            {integrante.turma}
                        </p>

                        <h2 className="font-titulo text-lg font-semibold text-primaria mb-2 min-h-14 flex items-center justify-center">
                            {integrante.nome}
                        </h2>

                        <p className="font-corpo text-sm font-semibold text-texto mb-2">
                            RM: {integrante.rm}
                        </p>

                        <p className="font-corpo text-sm text-texto-suave mb-6">
                            {integrante.cargo}
                        </p>

                        <div className="flex gap-3 w-full mt-auto">
                            {integrante.github ? (
                                <a
                                    href={integrante.github}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={`GitHub de ${integrante.nome}`}
                                    className="flex-1 min-w-0 py-2 px-3 rounded-md bg-primaria hover:bg-primaria-hover transition-colors flex items-center justify-center gap-2"
                                    style={{ color: '#ffffff' }}
                                >
                                    <img
                                        src={githubIcon}
                                        alt=""
                                        className="w-5 h-5 shrink-0 object-contain"
                                    />
                                    <span className="font-corpo text-xs font-semibold">
                    GitHub
                  </span>
                                </a>
                            ) : (
                                <span className="flex-1 py-2 px-3 rounded-md bg-secundaria text-texto-suave font-corpo text-xs flex items-center justify-center">
                  GitHub indisponível
                </span>
                            )}

                            {integrante.linkedin ? (
                                <a
                                    href={integrante.linkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={`LinkedIn de ${integrante.nome}`}
                                    className="flex-1 min-w-0 py-2 px-3 rounded-md border border-primaria text-primaria hover:bg-secundaria transition-colors flex items-center justify-center gap-2"
                                >
                                    <img
                                        src={linkedinIcon}
                                        alt=""
                                        className="w-5 h-5 shrink-0 object-contain"
                                    />
                                    <span className="font-corpo text-xs font-semibold">
                    LinkedIn
                  </span>
                                </a>
                            ) : (
                                <span className="flex-1 py-2 px-3 rounded-md bg-secundaria text-texto-suave font-corpo text-xs flex items-center justify-center">
                  LinkedIn indisponível
                </span>
                            )}
                        </div>
                    </article>
                ))}
            </section>

        </main>
    );
}