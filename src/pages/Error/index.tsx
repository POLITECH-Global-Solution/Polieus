import { Link } from 'react-router-dom';

export default function Error() {
    return (
        <main className="w-full flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-8 text-center bg-fundo">

            <div className="mb-4 text-primaria" aria-hidden="true">
        <span className="material-icons text-6xl sm:text-7xl lg:text-8xl">
          account_balance
        </span>
            </div>

            <h1 className="font-titulo text-4xl sm:text-5xl lg:text-6xl font-bold text-primaria mb-3">
                Erro 404
            </h1>

            <h2 className="font-titulo text-lg sm:text-xl lg:text-2xl text-texto mb-5">
                Esta página não existe.
            </h2>

            <div className="flex flex-col items-center gap-3 mb-7 max-w-lg">
                <p className="font-corpo text-sm sm:text-base text-texto-suave leading-relaxed">
                    Ops! Parece que você encontrou um caminho que não existe em nossa pólis.
                </p>

                <p className="font-corpo text-sm sm:text-base text-texto-suave leading-relaxed">
                    A página que você está procurando não foi encontrada.
                </p>
            </div>

            <Link
                to="/"
                style={{ color: '#ffffff' }}
                className="inline-flex items-center justify-center w-full max-w-xs sm:w-auto px-6 py-3 bg-primaria text-sm font-corpo font-semibold rounded-md hover:bg-primaria-hover transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria"
            >
                Voltar para a Página Inicial
            </Link>

        </main>
    );
}