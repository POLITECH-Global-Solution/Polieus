interface BotaoProps {
    texto: string;
    onClick?: () => void;
    tipo?: 'button' | 'submit' | 'reset';
    variante?: 'primario' | 'secundario' | 'sucesso' | 'perigo';
    desabilitado?: boolean;
    larguraTotal?: boolean;
    className?: string;
}

export default function Botao({
                                  texto,
                                  onClick,
                                  tipo = 'button',
                                  variante = 'primario',
                                  desabilitado = false,
                                  larguraTotal = false,
                                  className = '',
                              }: BotaoProps) {
    const estilosBase =
        'inline-block px-5 py-2.5 rounded-md font-corpo font-semibold text-sm transition-all duration-300 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria';

    const estilosVariante = {
        primario:
            'bg-primaria text-white hover:bg-primaria-hover',
        secundario:
            'bg-transparent text-primaria border border-primaria hover:bg-secundaria',
        sucesso:
            'bg-green-700 text-white hover:bg-green-800',
        perigo:
            'bg-red-700 text-white hover:bg-red-800',
    };

    const estilosDesabilitado =
        'disabled:bg-secundaria disabled:text-texto-suave disabled:border-transparent disabled:cursor-not-allowed disabled:hover:bg-secundaria';

    return (
        <button
            type={tipo}
            onClick={onClick}
            disabled={desabilitado}
            className={`${estilosBase} ${estilosVariante[variante]} ${
                desabilitado ? estilosDesabilitado : ''
            } ${larguraTotal ? 'w-full text-center' : ''} ${className}`}
        >
            {texto}
        </button>
    );
}