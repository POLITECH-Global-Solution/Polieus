interface CardProps {
  icone: string;
  titulo: string;
  descricao: string;
  className?: string;
}

export default function Card({ icone, titulo, descricao, className = '' }: CardProps) {
  return (
    <article className={`bg-[#f9f0e7] border border-[#dfc2ae] p-6 rounded-2xl shadow-[0_4px_12px_rgba(90,40,25,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(90,40,25,0.12)] ${className}`}>
      <div className="mb-4 text-primaria">
        <span className="material-icons text-[38px]">{icone}</span>
      </div>

      <h3 className="font-titulo text-xl font-semibold text-primaria mb-3">
        {titulo}
      </h3>

      <p className="font-corpo text-sm text-texto leading-relaxed">
        {descricao}
      </p>
    </article>
  );
}