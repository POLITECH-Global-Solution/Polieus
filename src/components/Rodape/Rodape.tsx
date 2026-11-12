export default function Rodape() {
  return (
    <footer className="bg-#f5f0e6 py-5 text-center border-t border-#d8d0c0">
      <div className="max-w-1200px mx-auto px-4">
        <div className="flex flex-col justify-center items-center gap-2">
          <p className="font-titulo text-lg font-semibold text-primaria">
            POLIEUS
          </p>

          <p className="font-corpo text-xs uppercase tracking-wider text-texto-suave">
            PLATAFORMA INTELIGENTE DE GESTÃO URBANA, PARTICIPAÇÃO CIDADÃ E TRANSPARÊNCIA PÚBLICA
          </p>

          <div className="w-24 border-t border-primaria/40 my-1"></div>

          <p className="font-corpo text-xs text-texto-suave">
            &copy; Polieus. Todos os direitos reservados. {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
}