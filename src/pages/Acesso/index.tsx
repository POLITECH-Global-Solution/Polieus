import { Link } from 'react-router-dom';
import fundoEscolha from '../../img/fundo_escolha.png';

export default function EscolhaAcesso() {
  return (
    <main
      className="flex min-h-dvh w-full flex-col items-center justify-center bg-cover bg-center bg-no-repeat px-4 py-5 sm:px-8 lg:h-dvh lg:overflow-hidden"
      style={{ backgroundImage: `url(${fundoEscolha})` }}
    >
      <div className="flex w-full max-w-5xl flex-col items-center text-center">

        <img
          src="/favicons/logo_polieus3.png"
          alt="Logo do Polieus"
          className="mb-3 h-auto w-40 object-contain sm:w-48"
        />

        <div className="mb-3 flex w-full max-w-3xl items-center gap-5">
          <div className="h-px flex-1 bg-primaria" />
          <span className="material-icons text-[26px] text-primaria">
            spa
          </span>
          <div className="h-px flex-1 bg-primaria" />
        </div>

        <h1 className="font-titulo text-3xl font-bold text-primaria sm:text-4xl">
          Bem-vindo ao Polieus!
        </h1>

        <p className="mt-2 font-corpo text-base text-texto sm:text-xl">
          Escolha como deseja acessar a plataforma:
        </p>

        <div className="mt-5 grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-2 md:gap-10">

          <section className="flex flex-col items-center rounded-2xl border border-[#dfb99b] bg-[#f5e8d9]/85 px-6 py-5 shadow-sm backdrop-blur-sm">
            <span className="material-icons text-[64px] text-primaria">
              groups
            </span>

            <h2 className="mt-2 font-titulo text-2xl font-bold text-primaria">
              Área do Cidadão
            </h2>

            <p className="mt-3 min-h-15 font-corpo text-base text-texto">
              Registre problemas, acompanhe suas solicitações e participe da sua cidade.
            </p>

            <Link
              to="/login-usuario"
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-primaria px-5 py-3 font-corpo text-sm font-semibold transition-colors hover:bg-primaria-hover sm:text-base"
              style={{ color: '#ffffff' }}
            >
              Acessar como Cidadão
              <span className="material-icons text-[20px]">
                arrow_forward
              </span>
            </Link>
          </section>

          <section className="flex flex-col items-center rounded-2xl border border-[#dfb99b] bg-[#f5e8d9]/85 px-6 py-5 shadow-sm backdrop-blur-sm">
            <span className="material-icons text-[64px] text-primaria">
              account_balance
            </span>

            <h2 className="mt-2 font-titulo text-2xl font-bold text-primaria">
              Área Administrativa
            </h2>

            <p className="mt-3 min-h-15 font-corpo text-base text-texto">
              Gerencie ocorrências, consulte relatórios e acompanhe as ações da sua equipe.
            </p>

            <Link
              to="login-admin"
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-primaria px-5 py-3 font-corpo text-sm font-semibold transition-colors hover:bg-primaria-hover sm:text-base"
              style={{ color: '#ffffff' }}
            >
              Acessar como Administrador
              <span className="material-icons text-[20px]">
                arrow_forward
              </span>
            </Link>
          </section>
        </div>

        <div className="mt-5 flex w-full max-w-3xl items-center gap-5">
          <div className="h-px flex-1 bg-primaria/60" />
          <span className="material-icons text-[26px] text-primaria">
            spa
          </span>
          <div className="h-px flex-1 bg-primaria/60" />
        </div>

        <p className="mt-2 font-corpo text-xs uppercase tracking-[0.3em] text-primaria sm:text-sm">
          Juntos, por uma cidade melhor
        </p>

      </div>
    </main>
  );
}
