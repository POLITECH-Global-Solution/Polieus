
import { Link } from 'react-router-dom';

// Calcula o ano fora da renderização do componente
const anoAtual = new Date().getFullYear();

export default function Rodape() {
  const estiloLink = `
    w-fit text-sm transition-all duration-200
    hover:opacity-70 hover:underline
    focus-visible:rounded-sm focus-visible:outline-2
    focus-visible:outline-offset-4
    focus-visible:outline-[#78221b]
  `;

  // Volta ao topo da página atual
  const irParaTopo = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <footer className="border-t border-[#c6b9a7] bg-[#d8d0c0] font-corpo">
      <div className="mx-auto max-w-6xl px-6 pt-12 pb-8 sm:px-8 lg:px-10">

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-14">

          {/* Identidade do Polieus */}
          <div className="sm:col-span-2 lg:col-span-1">

            {/* Botão para voltar ao topo */}
            <button
              type="button"
              onClick={irParaTopo}
              aria-label="Polieus - Voltar ao topo da página"
              className="group inline-flex w-fit items-center gap-3 rounded-sm text-left transition-opacity duration-200 hover:opacity-75 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#78221b]"
            >
              <span
                className="material-icons text-3xl text-[#8c251e]"
                aria-hidden="true"
              >
                account_balance
              </span>

              <span className="font-titulo text-2xl font-bold text-[#78221b]">
                POLIEUS
              </span>
            </button>

            <p className="mt-4 max-w-sm text-sm leading-7 text-[#51453e]">
              Tecnologia a serviço da cidadania.
              Uma plataforma que aproxima cidadãos
              e gestores públicos, promovendo
              participação, transparência e
              transformação urbana.
            </p>
          </div>

          {/* Navegação */}
          <nav aria-label="Navegação do rodapé">
            <h3 className="font-titulo text-base font-bold text-[#78221b]">
              Navegação
            </h3>

            <div className="mt-5 flex flex-col gap-4">
              <Link
                to="/"
                className={estiloLink}
                style={{ color: '#51453e' }}
              >
                Início
              </Link>

              <Link
                to="/sobre"
                className={estiloLink}
                style={{ color: '#51453e' }}
              >
                Sobre
              </Link>

              <Link
                to="/faq"
                className={estiloLink}
                style={{ color: '#51453e' }}
              >
                Perguntas Frequentes
              </Link>
            </div>
          </nav>

          {/* Projeto */}
          <nav aria-label="Informações do projeto">
            <h3 className="font-titulo text-base font-bold text-[#78221b]">
              Projeto
            </h3>

            <div className="mt-5 flex flex-col gap-4">
              <Link
                to="/integrantes"
                className={estiloLink}
                style={{ color: '#51453e' }}
              >
                Nossa Equipe
              </Link>

              <Link
                to="/contato"
                className={estiloLink}
                style={{ color: '#51453e' }}
              >
                Contato
              </Link>
            </div>
          </nav>

        </div>

        {/* Divisória */}
        <div className="mt-12 border-t border-[#b9aa99]" />

        {/* Informações finais */}
        <div className="flex flex-col items-center justify-between gap-3 pt-6 text-center sm:flex-row sm:text-left">

          <p className="text-xs text-[#51453e]">
            © {anoAtual} Polieus — Equipe Politech.
            Todos os direitos reservados.
          </p>

          <p className="text-xs text-[#51453e]">
            FIAP • Global Solution • CitizenTech
          </p>

        </div>
      </div>
    </footer>
  );
}
