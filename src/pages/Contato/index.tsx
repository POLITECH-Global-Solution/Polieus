import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import fundoContato from '../../img/fundo_contato.png';

interface ContatoFormData {
  nome: string;
  email: string;
  assunto: string;
  mensagem: string;
}

export default function Contato() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContatoFormData>({
    mode: 'onSubmit',
    defaultValues: {
      nome: '',
      email: '',
      assunto: '',
      mensagem: '',
    },
  });

  const onSubmit = (data: ContatoFormData) => {
    console.log('Mensagem de contato:', data);

    alert(
      '✅ Formulário preenchido com sucesso! Esta é uma demonstração; nenhuma mensagem foi enviada.'
    );

    reset();
  };

  const campoClasse =
    'w-full rounded-lg border border-[#dfc2ae] bg-[#fffaf5]/90 px-4 py-3 font-corpo text-sm text-texto outline-none transition-colors placeholder:text-[#8d8178] focus:border-primaria focus:ring-2 focus:ring-primaria/15';

  return (
    <main className="min-h-screen w-full bg-fundo font-corpo text-texto">
      {/* Cabeçalho */}
      <header className="border-b border-[#dfc2ae] bg-[#fffaf5] py-5 pr-5 pl-20 sm:pr-8 sm:pl-20 lg:px-10">
        <h1 className="font-titulo text-3xl font-bold text-[#78221b] sm:text-4xl">
          Contato
        </h1>

        <nav
          aria-label="Navegação estrutural"
          className="mt-1 flex items-center gap-2 text-sm"
        >
          <Link
            to="/inicio"
            className="text-[#6b4438] transition-colors hover:text-primaria hover:underline"
          >
            Início
          </Link>

          <span
            className="material-icons text-base text-[#78221b]"
            aria-hidden="true"
          >
            chevron_right
          </span>

          <span
            className="font-semibold text-[#78221b]"
            aria-current="page"
          >
            Contato
          </span>
        </nav>
      </header>

      {/* Conteúdo principal */}
      <section
        className="relative isolate min-h-screen overflow-hidden bg-[#f6e9dc] bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${fundoContato})`,
        }}
      >
        {/* Camada para melhorar a leitura */}
        <div
          className="pointer-events-none absolute inset-0 bg-linear-to-r from-[#fff7ee]/95 via-[#fff7ee]/85 to-[#fff7ee]/35"
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10 lg:py-16">
          {/* Título */}
          <div className="mb-9">
            <p className="mb-2 text-sm font-bold uppercase tracking-widest text-[#994937]">
              Estamos aqui para ajudar
            </p>

            <h2 className="font-titulo text-4xl font-bold text-[#78221b] sm:text-5xl">
              Fale Conosco
            </h2>

            <p className="mt-3 max-w-xl text-base leading-relaxed text-[#46352d]">
              Tem alguma dúvida, sugestão ou precisa de ajuda?
              Envie sua mensagem para a equipe do Polieus.
              Queremos ouvir você!
            </p>

            <div
              className="mt-5 flex max-w-md items-center gap-4"
              aria-hidden="true"
            >
              <span className="h-px flex-1 bg-[#b77b5e]" />
              <span className="h-2.5 w-2.5 rotate-45 bg-[#78221b]" />
              <span className="h-px flex-1 bg-[#b77b5e]" />
            </div>
          </div>

          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1.65fr)_minmax(280px,1fr)]">
            {/* Formulário */}
            <section
              aria-labelledby="titulo-formulario"
              className="rounded-2xl border border-[#dfc2ae] bg-[#fffaf5]/95 p-5 shadow-lg backdrop-blur-sm sm:p-8"
            >
              <div className="mb-6 flex items-center gap-3">
                <span
                  className="material-icons text-3xl text-[#78221b]"
                  aria-hidden="true"
                >
                  mail
                </span>

                <div>
                  <h3
                    id="titulo-formulario"
                    className="font-titulo text-2xl font-bold text-[#78221b]"
                  >
                    Envie sua mensagem
                  </h3>

                  <p className="mt-1 text-sm text-texto-suave">
                    Preencha os campos abaixo para entrar em contato.
                  </p>
                </div>
              </div>

              <form
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                className="space-y-5"
              >
                {/* Nome */}
                <div>
                  <label
                    htmlFor="contatoNome"
                    className="mb-2 block text-sm font-semibold text-[#46352d]"
                  >
                    Nome completo
                  </label>

                  <div className="relative">
                    <span
                      className="material-icons pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xl text-[#78221b]"
                      aria-hidden="true"
                    >
                      person_outline
                    </span>

                    <input
                      id="contatoNome"
                      type="text"
                      placeholder="Digite seu nome completo"
                      autoComplete="name"
                      aria-invalid={!!errors.nome}
                      aria-describedby={
                        errors.nome ? 'erroNome' : undefined
                      }
                      className={`${campoClasse} pl-11`}
                      {...register('nome', {
                        required: 'O nome é obrigatório.',
                        maxLength: {
                          value: 80,
                          message:
                            'O nome deve ter no máximo 80 caracteres.',
                        },
                        validate: (valor) => {
                          const nome = valor
                            .trim()
                            .replace(/\s+/g, ' ');

                          if (nome.length < 3) {
                            return 'O nome deve ter pelo menos 3 caracteres.';
                          }

                          if (
                            !/^[\p{L}]+(?:[ '\u2019-][\p{L}]+)*$/u.test(
                              nome
                            )
                          ) {
                            return 'Digite um nome válido, sem números ou símbolos.';
                          }

                          return true;
                        },
                      })}
                    />
                  </div>

                  {errors.nome && (
                    <p
                      id="erroNome"
                      role="alert"
                      className="mt-1 text-xs font-medium text-red-700"
                    >
                      {errors.nome.message}
                    </p>
                  )}
                </div>

                {/* E-mail */}
                <div>
                  <label
                    htmlFor="contatoEmail"
                    className="mb-2 block text-sm font-semibold text-[#46352d]"
                  >
                    E-mail
                  </label>

                  <div className="relative">
                    <span
                      className="material-icons pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xl text-[#78221b]"
                      aria-hidden="true"
                    >
                      alternate_email
                    </span>

                    <input
                      id="contatoEmail"
                      type="email"
                      placeholder="Digite seu e-mail"
                      autoComplete="email"
                      aria-invalid={!!errors.email}
                      aria-describedby={
                        errors.email ? 'erroEmail' : undefined
                      }
                      className={`${campoClasse} pl-11`}
                      {...register('email', {
                        required: 'O e-mail é obrigatório.',
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: 'Digite um e-mail válido.',
                        },
                      })}
                    />
                  </div>

                  {errors.email && (
                    <p
                      id="erroEmail"
                      role="alert"
                      className="mt-1 text-xs font-medium text-red-700"
                    >
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Assunto */}
                <div>
                  <label
                    htmlFor="contatoAssunto"
                    className="mb-2 block text-sm font-semibold text-[#46352d]"
                  >
                    Assunto
                  </label>

                  <div className="relative">
                    <span
                      className="material-icons pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xl text-[#78221b]"
                      aria-hidden="true"
                    >
                      subject
                    </span>

                    <select
                      id="contatoAssunto"
                      aria-invalid={!!errors.assunto}
                      aria-describedby={
                        errors.assunto ? 'erroAssunto' : undefined
                      }
                      className={`${campoClasse} pl-11`}
                      {...register('assunto', {
                        required: 'Selecione um assunto.',
                      })}
                    >
                      <option value="" disabled>
                        Selecione o assunto
                      </option>

                      <option value="duvida">
                        Dúvidas sobre a plataforma
                      </option>

                      <option value="ocorrencia">
                        Registro de ocorrências
                      </option>

                      <option value="acompanhamento">
                        Acompanhamento de solicitações
                      </option>

                      <option value="administrativo">
                        Área administrativa
                      </option>

                      <option value="problema-tecnico">
                        Problema técnico
                      </option>

                      <option value="sugestao">
                        Sugestões e melhorias
                      </option>

                      <option value="outros">
                        Outros assuntos
                      </option>
                    </select>
                  </div>

                  {errors.assunto && (
                    <p
                      id="erroAssunto"
                      role="alert"
                      className="mt-1 text-xs font-medium text-red-700"
                    >
                      {errors.assunto.message}
                    </p>
                  )}
                </div>

                {/* Mensagem */}
                <div>
                  <label
                    htmlFor="contatoMensagem"
                    className="mb-2 block text-sm font-semibold text-[#46352d]"
                  >
                    Sua mensagem
                  </label>

                  <textarea
                    id="contatoMensagem"
                    rows={5}
                    placeholder="Descreva sua dúvida, sugestão ou solicitação..."
                    aria-invalid={!!errors.mensagem}
                    aria-describedby={
                      errors.mensagem ? 'erroMensagem' : undefined
                    }
                    className={`${campoClasse} resize-y`}
                    {...register('mensagem', {
                      required: 'A mensagem é obrigatória.',
                      validate: (valor) => {
                        const mensagem = valor.trim();

                        if (mensagem.length < 10) {
                          return 'A mensagem deve ter pelo menos 10 caracteres.';
                        }

                        if (mensagem.length > 1000) {
                          return 'A mensagem deve ter no máximo 1000 caracteres.';
                        }

                        return true;
                      },
                    })}
                  />

                  {errors.mensagem && (
                    <p
                      id="erroMensagem"
                      role="alert"
                      className="mt-1 text-xs font-medium text-red-700"
                    >
                      {errors.mensagem.message}
                    </p>
                  )}
                </div>

                {/* Botão de envio */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-full bg-primaria px-5 py-3.5 font-corpo font-semibold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-primaria-hover hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span>
                    {isSubmitting
                      ? 'Validando...'
                      : 'Enviar Mensagem'}
                  </span>

                  <span
                    className="material-icons text-xl"
                    aria-hidden="true"
                  >
                    arrow_forward
                  </span>
                </button>
              </form>
            </section>

            {/* Informações de contato */}
            <aside className="space-y-6">
              <section className="rounded-2xl border border-[#dfc2ae] bg-[#fffaf5]/95 p-6 shadow-lg backdrop-blur-sm sm:p-7">
                <h3 className="font-titulo text-2xl font-bold text-[#78221b]">
                  Outros Canais
                </h3>

                <div
                  className="my-5 h-px bg-[#dfc2ae]"
                  aria-hidden="true"
                />

                <div className="space-y-7">
                  {/* E-mail */}
                  <div className="flex items-start gap-4">
                    <span
                      className="material-icons text-2xl text-[#78221b]"
                      aria-hidden="true"
                    >
                      email
                    </span>

                    <div>
                      <h4 className="font-semibold text-[#78221b]">
                        E-mail
                      </h4>

                      <p className="mt-1 text-sm leading-relaxed text-texto-suave">
                        Utilize o formulário ao lado para
                        preencher sua mensagem à equipe.
                      </p>
                    </div>
                  </div>

                  {/* FAQ */}
                  <div className="flex items-start gap-4">
                    <span
                      className="material-icons text-2xl text-[#78221b]"
                      aria-hidden="true"
                    >
                      help_outline
                    </span>

                    <div>
                      <h4 className="font-semibold text-[#78221b]">
                        Central de Ajuda
                      </h4>

                      <p className="mt-1 text-sm leading-relaxed text-texto-suave">
                        Consulte respostas sobre a navegação
                        do cidadão e da área administrativa.
                      </p>

                      <Link
                        to="/faq"
                        className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-primaria hover:underline"
                      >
                        Acessar FAQ

                        <span
                          className="material-icons text-base"
                          aria-hidden="true"
                        >
                          arrow_forward
                        </span>
                      </Link>
                    </div>
                  </div>

                  {/* Equipe */}
                  <div className="flex items-start gap-4">
                    <span
                      className="material-icons text-2xl text-[#78221b]"
                      aria-hidden="true"
                    >
                      groups
                    </span>

                    <div>
                      <h4 className="font-semibold text-[#78221b]">
                        Nossa Equipe
                      </h4>

                      <p className="mt-1 text-sm leading-relaxed text-texto-suave">
                        Conheça os integrantes responsáveis
                        pelo desenvolvimento do Polieus.
                      </p>

                      <Link
                        to="/integrantes"
                        className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-primaria hover:underline"
                      >
                        Conhecer integrantes

                        <span
                          className="material-icons text-base"
                          aria-hidden="true"
                        >
                          arrow_forward
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>
              </section>

              {/* Mensagem institucional */}
              <section className="rounded-2xl border border-[#dfc2ae] bg-[#fffaf5]/95 p-6 text-center shadow-md backdrop-blur-sm">
                <span
                  className="material-icons text-4xl text-[#78221b]"
                  aria-hidden="true"
                >
                  account_balance
                </span>

                <h3 className="mt-3 font-titulo text-xl font-bold text-[#78221b]">
                  Sua voz transforma a cidade
                </h3>

                <p className="mt-3 text-sm leading-relaxed text-texto-suave">
                  O Polieus acredita que a participação cidadã
                  é essencial para construir uma gestão pública
                  mais transparente, acessível e colaborativa.
                </p>

                <div
                  className="mt-5 flex items-center justify-center gap-3"
                  aria-hidden="true"
                >
                  <span className="h-px w-14 bg-[#b77b5e]" />
                  <span className="h-2 w-2 rotate-45 bg-[#78221b]" />
                  <span className="h-px w-14 bg-[#b77b5e]" />
                </div>
              </section>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
