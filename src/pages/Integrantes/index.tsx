import { Link } from 'react-router-dom';
import fotoMurilo from '../../img/fotoMurilo.jpeg';
import fotoIsa from '../../img/fotoIsa.png';
import fotoMilena from '../../img/fotoMilena.png';
import fotoMarina from '../../img/fotoMarina.jpg';
import fotoHenrique from '../../img/fotoHenrique.jpeg';

import githubIcon from '../../img/github.png';
import linkedinIcon from '../../img/lkd.png';

const equipe = [
  {
    nome: 'Henrique Bonachela de Carvalho Carabante',
    rm: '573620',
    cargo: 'Especialista em Inteligência Artificial',
    turma: '1TDSPH',
    foto: fotoHenrique,
    github: 'https://github.com/henriquebonachela',
    linkedin:
      'https://www.linkedin.com/in/henrique-bonachela-de-carvalho-carabante-260b86338/',
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

function OrnamentoGrego() {
  return (
    <div
      className="flex items-center justify-center gap-3"
      aria-hidden="true"
    >
      <span className="h-px w-20 bg-[#a34c3a]" />
      <span className="size-2 rotate-45 bg-[#8c251e]" />
      <span className="h-px w-20 bg-[#a34c3a]" />
    </div>
  );
}

function FrisoGrego() {
  return (
    <svg
      viewBox="0 0 300 22"
      className="h-5 w-full text-[#9b4938]"
      fill="none"
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <path
        d="M0 11H12V3H28V19H44V3H60V11H72
           M72 11H84V3H100V19H116V3H132V11H144
           M156 11H168V3H184V19H200V3H216V11H228
           M228 11H240V3H256V19H272V3H288V11H300"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M150 4L157 11L150 18L143 11Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ColunaGrega() {
  return (
    <div
      className="flex h-full w-5 flex-col items-center opacity-70"
      aria-hidden="true"
    >
      <div className="h-1.5 w-6 rounded-sm border border-[#b77b5e] bg-[#e7cbb6]" />

      <div className="flex h-3 w-6 items-center justify-between rounded-sm border border-[#b77b5e] bg-[#f0ddcd] px-0.5">
        <span className="size-1 rounded-full border border-[#9a4937]" />
        <span className="h-px w-2 bg-[#9a4937]" />
        <span className="size-1 rounded-full border border-[#9a4937]" />
      </div>

      <div className="flex min-h-0 w-4 flex-1 justify-evenly border-x border-[#b77b5e] bg-[#f3e1d2]">
        <span className="h-full w-px bg-[#c99b7e]" />
        <span className="h-full w-px bg-[#c99b7e]" />
        <span className="h-full w-px bg-[#c99b7e]" />
      </div>

      <div className="h-2 w-6 rounded-sm border border-[#b77b5e] bg-[#e7cbb6]" />
      <div className="h-1.5 w-7 rounded-sm border border-[#b77b5e] bg-[#e7cbb6]" />
    </div>
  );
}

export default function Integrantes() {
  return (
    <main className="min-h-screen w-full bg-fundo font-corpo text-texto">
      <header className="border-b border-[#d8b9a5] bg-[#fffaf4] px-5 py-5 sm:px-8 lg:px-10">
        <h1 className="font-titulo text-3xl font-bold text-[#78221b] sm:text-4xl">
          Integrantes
        </h1>

        <nav
          aria-label="Navegação estrutural"
          className="mt-1 flex items-center gap-2 text-sm text-[#6b4438]"
        >
          <Link
            to="/inicio"
            className="hover:text-primaria hover:underline"
          >
            Início
          </Link>

          <span
            className="material-icons text-base"
            aria-hidden="true"
          >
            chevron_right
          </span>

          <span
            aria-current="page"
            className="font-semibold text-[#78221b]"
          >
            Integrantes
          </span>
        </nav>
      </header>

      <section className="relative overflow-hidden px-5 pt-12 pb-20 sm:px-8 lg:px-10">
        <div
          className="pointer-events-none absolute top-12 -left-20 size-72 rounded-full border border-[#dec6b3] opacity-35"
          aria-hidden="true"
        />

        <div
          className="pointer-events-none absolute top-24 -left-12 size-56 rounded-full border border-[#dec6b3] opacity-35"
          aria-hidden="true"
        />

        <div
          className="pointer-events-none absolute -right-25 bottom-12 size-80 rounded-full border border-[#dec6b3] opacity-35"
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-3 text-xs font-bold tracking-[0.25em] text-[#a34c3a] uppercase">
              As pessoas por trás do projeto
            </p>

            <h2 className="font-titulo text-4xl font-bold text-[#78221b] sm:text-5xl">
              Nossa Equipe
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-texto-suave">
              Conheça os integrantes responsáveis pelo desenvolvimento
              do Polieus, unindo tecnologia, inovação e participação
              cidadã para construir soluções que aproximam pessoas
              e transformam cidades.
            </p>

            <div className="mt-7">
              <OrnamentoGrego />
            </div>
          </div>

          <div className="mx-auto mt-14 flex max-w-6xl flex-wrap items-stretch justify-center gap-8">
            {equipe.map((integrante) => (
              <article
                key={integrante.rm}
                className="group relative flex w-full max-w-86.25 flex-col overflow-hidden rounded-t-23.75 rounded-b-xl border border-[#c99d83] bg-[#fff9f2] shadow-[0_8px_24px_rgba(91,42,28,0.09)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#9c4b38] hover:shadow-[0_16px_35px_rgba(91,42,28,0.16)]"
              >
                <div className="relative h-19 overflow-hidden bg-[#78221b]">
                  <div className="absolute inset-x-0 top-0 h-1 bg-[#b77b5e]" />

                  <div className="absolute inset-x-0 top-3 px-5">
                    <FrisoGrego />
                  </div>

                  <div className="absolute inset-x-0 bottom-0 h-8 rounded-t-[100%] bg-[#fff9f2]" />
                </div>

                <div className="relative flex flex-1 flex-col px-5 pb-6">
                  <div className="absolute top-5 bottom-6 left-3">
                    <ColunaGrega />
                  </div>

                  <div className="absolute top-5 right-3 bottom-6">
                    <ColunaGrega />
                  </div>

                  <div className="relative z-10 flex flex-1 flex-col items-center px-4 text-center">
                    <div className="-mt-9 flex size-33 shrink-0 items-center justify-center rounded-full border-2 border-[#9b4938] bg-[#fff9f2] p-1 shadow-md">
                      <div className="size-full overflow-hidden rounded-full border-2 border-[#d7ad92]">
                        <img
                          src={integrante.foto}
                          alt={`Foto de ${integrante.nome}`}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    </div>

                    <div className="mt-5 flex items-center gap-2">
                      <span className="h-px w-7 bg-[#c99d83]" />

                      <span
                        className="material-icons text-base text-[#8c251e]"
                        aria-hidden="true"
                      >
                        account_balance
                      </span>

                      <span className="h-px w-7 bg-[#c99d83]" />
                    </div>

                    <p className="mt-2 text-xs font-bold tracking-[0.2em] text-[#9b4938]">
                      {integrante.turma}
                    </p>

                    <h3 className="mt-3 flex min-h-16 items-center justify-center font-titulo text-lg leading-7 font-bold text-[#78221b]">
                      {integrante.nome}
                    </h3>

                    <div className="my-3 flex items-center gap-2">
                      <span className="h-px w-9 bg-[#c99d83]" />
                      <span className="size-1.5 rotate-45 bg-[#9b4938]" />
                      <span className="h-px w-9 bg-[#c99d83]" />
                    </div>

                    <p className="text-sm font-bold text-[#30241f]">
                      RM: {integrante.rm}
                    </p>

                    <p className="mt-3 min-h-12 text-sm leading-6 text-[#62534a]">
                      {integrante.cargo}
                    </p>

                    <div className="mt-auto w-full pt-7">
                      <div className="mb-5">
                        <FrisoGrego />
                      </div>

                      <div className="flex w-full gap-2">
                        <a
                          href={integrante.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`GitHub de ${integrante.nome}`}
                          className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-md bg-primaria px-2 py-2.5 transition-colors hover:bg-primaria-hover"
                          style={{ color: '#ffffff' }}
                        >
                          <img
                            src={githubIcon}
                            alt=""
                            className="size-5 shrink-0 object-contain"
                          />

                          <span className="text-xs font-semibold">
                            GitHub
                          </span>
                        </a>

                        <a
                          href={integrante.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`LinkedIn de ${integrante.nome}`}
                          className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-md border border-primaria px-2 py-2.5 text-primaria transition-colors hover:bg-[#f0dcd0]"
                        >
                          <img
                            src={linkedinIcon}
                            alt=""
                            className="size-5 shrink-0 object-contain"
                          />

                          <span className="text-xs font-semibold">
                            LinkedIn
                          </span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="h-2 border-t border-[#c99d83] bg-[#78221b]" />
              </article>
            ))}
          </div>

          <div className="mx-auto mt-16 max-w-3xl text-center">
            <OrnamentoGrego />

            <p className="mt-6 font-titulo text-lg leading-8 font-semibold italic text-[#78221b] sm:text-xl">
              Por trás de cada inovação, existem pessoas comprometidas
              com a transformação.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
