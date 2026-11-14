
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import Botao from '../../components/Botao/Botao';
import fundoLogin from '../../img/cadastro_login.png';

type Aba = 'entrar' | 'cadastrar';

export default function LoginAdministrador() {
  const [aba, setAba] = useState<Aba>('entrar');
  const [mensagem, setMensagem] = useState('');

  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);

  const [emailLogin, setEmailLogin] = useState('');
  const [senhaLogin, setSenhaLogin] = useState('');
  const [lembrar, setLembrar] = useState(false);

  const [nome, setNome] = useState('');
  const [emailCadastro, setEmailCadastro] = useState('');
  const [instituicao, setInstituicao] = useState('');
  const [cargo, setCargo] = useState('');
  const [codigoConvite, setCodigoConvite] = useState('');
  const [senhaCadastro, setSenhaCadastro] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [aceitouTermos, setAceitouTermos] = useState(false);

  const trocarAba = (novaAba: Aba) => {
    setAba(novaAba);
    setMensagem('');
    setMostrarSenha(false);
    setMostrarConfirmacao(false);
  };

  const entrar = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    setMensagem('');

    if (!emailLogin.trim() || !senhaLogin) {
      setMensagem('Preencha seu e-mail institucional e sua senha.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLogin)) {
      setMensagem('Informe um e-mail válido.');
      return;
    }

    setMensagem('');
  };

  const cadastrar = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    setMensagem('');

    if (nome.trim().split(/\s+/).length < 2) {
      setMensagem('Informe seu nome completo.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailCadastro)) {
      setMensagem('Informe um e-mail institucional válido.');
      return;
    }

    if (!instituicao.trim()) {
      setMensagem('Informe a instituição ou órgão responsável.');
      return;
    }

    if (!cargo.trim()) {
      setMensagem('Informe seu cargo ou função.');
      return;
    }

    if (!codigoConvite.trim()) {
      setMensagem('Informe seu código de convite administrativo.');
      return;
    }

    if (senhaCadastro.length < 8) {
      setMensagem('A senha deve ter pelo menos 8 caracteres.');
      return;
    }

    if (senhaCadastro !== confirmarSenha) {
      setMensagem('As senhas informadas não coincidem.');
      return;
    }

    if (!aceitouTermos) {
      setMensagem('Você precisa aceitar os termos para continuar.');
      return;
    }

    setMensagem('');
  };

  const campoClasses =
    'w-full min-w-0 rounded-lg border border-[#d9bda7] bg-white/40 px-3 py-2 font-corpo text-sm text-texto outline-none transition-colors placeholder:text-[#9c9188] focus:border-primaria focus:ring-1 focus:ring-primaria';

  const labelClasses =
    'mb-0.5 block font-corpo text-sm text-texto';

  const sombraTexto = {
    textShadow:
      '0 0 5px #fff4e6, 0 0 12px #fff4e6, 0 0 24px #fff4e6, 1px 2px 2px rgba(75, 25, 15, 0.4)',
  };

  return (
    <main
      className="min-h-dvh w-full overflow-x-hidden bg-cover bg-center bg-no-repeat lg:h-dvh lg:overflow-hidden"
      style={{ backgroundImage: `url(${fundoLogin})` }}
    >
      <div className="grid min-h-dvh w-full grid-cols-1 lg:h-full lg:grid-cols-[43%_57%]">
        <aside className="flex flex-col items-center justify-center px-6 py-8 text-center lg:pr-16">
          <img
            src="/favicons/logo_polieus3.png"
            alt="Logo do Polieus"
            className="w-64 max-w-full object-contain sm:w-72 lg:w-96"
          />

          <h2
            className="mt-4 font-titulo text-xl font-bold uppercase leading-snug text-[#651b16]"
            style={sombraTexto}
          >
            Tecnologia a serviço
            <br />
            da cidadania
          </h2>

          <div className="mt-5 h-px w-64 bg-[#a94b3c]" />

          <h3
            className="mt-7 font-corpo text-[23px] font-bold text-[#651b16]"
            style={sombraTexto}
          >
            Painel Administrativo
          </h3>

          <p
            className="mt-2 max-w-sm text-center font-corpo text-lg font-semibold leading-relaxed text-[#291712]"
            style={sombraTexto}
          >
            Gerencie as ocorrências e contribua
            <br />
            para uma cidade melhor.
          </p>
        </aside>

        <div className="flex min-h-dvh min-w-0 flex-col px-4 py-3 sm:px-8 lg:h-full lg:min-h-0 lg:px-10">
          <div className="mt-4 flex shrink-0 justify-end lg:mt-6">
            <Link
              to="/"
              className="flex items-center gap-2 font-corpo text-sm font-medium text-[#651b16] hover:underline"
            >
              <span className="material-icons text-[20px]">
                arrow_back
              </span>
              Voltar para o início
            </Link>
          </div>

          <div className="flex min-h-0 flex-1 items-center justify-center py-3">
            <section className="w-full max-w-2xl rounded-3xl border border-[#c99179] bg-[#fffaf5]/90 p-4 shadow-sm backdrop-blur-sm sm:p-5 lg:max-h-full lg:overflow-y-auto">
              <div className="flex flex-col items-center text-center">
                <span className="material-icons text-[56px] text-[#751c16]">
                  account_balance
                </span>

                <h1 className="mt-1 font-titulo text-2xl font-bold text-[#751c16] sm:text-3xl">
                  Área Administrativa
                </h1>

                <p className="mt-1 font-corpo text-sm text-texto-suave">
                  Acesse o painel de gestão do Polieus
                </p>
              </div>

              <div className="my-3 flex items-center gap-3">
                <div className="h-px flex-1 bg-[#d9bda7]" />
                <span className="text-base text-[#751c16]">◆</span>
                <div className="h-px flex-1 bg-[#d9bda7]" />
              </div>

              {/* Abas com melhorias de acessibilidade */}
              <div
                className="grid grid-cols-2 border-b-2 border-primaria"
                role="group"
                aria-label="Escolha entre entrar e cadastrar"
              >
                <button
                  type="button"
                  onClick={() => trocarAba('entrar')}
                  aria-pressed={aba === 'entrar'}
                  className={`flex items-center justify-center gap-2 rounded-t-full px-3 py-2 font-corpo text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria sm:text-base ${
                    aba === 'entrar'
                      ? 'bg-primaria text-white'
                      : 'text-primaria hover:bg-primaria/10'
                  }`}
                >
                  <span
                    className="material-icons text-[21px]"
                    aria-hidden="true"
                  >
                    admin_panel_settings
                  </span>
                  Entrar
                </button>

                <button
                  type="button"
                  onClick={() => trocarAba('cadastrar')}
                  aria-pressed={aba === 'cadastrar'}
                  className={`flex items-center justify-center gap-2 rounded-t-full px-3 py-2 font-corpo text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria sm:text-base ${
                    aba === 'cadastrar'
                      ? 'bg-primaria text-white'
                      : 'text-primaria hover:bg-primaria/10'
                  }`}
                >
                  <span
                    className="material-icons text-[21px]"
                    aria-hidden="true"
                  >
                    person_add
                  </span>
                  Cadastrar
                </button>
              </div>

              {aba === 'entrar' ? (
                <form onSubmit={entrar} className="mt-5 flex flex-col">
                  <div className="flex flex-col gap-4">
                    <div className="relative">
                      <label
                        htmlFor="admin-email-login"
                        className="sr-only"
                      >
                        E-mail institucional
                      </label>

                      <span className="material-icons pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[22px] text-texto-suave">
                        mail_outline
                      </span>

                      <input
                        id="admin-email-login"
                        type="email"
                        placeholder="E-mail institucional"
                        autoComplete="username"
                        required
                        value={emailLogin}
                        onChange={(evento) =>
                          setEmailLogin(evento.target.value)
                        }
                        className={`${campoClasses} pl-12`}
                      />
                    </div>

                    <div className="relative">
                      <label
                        htmlFor="admin-senha-login"
                        className="sr-only"
                      >
                        Senha
                      </label>

                      <span className="material-icons pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[22px] text-texto-suave">
                        lock_outline
                      </span>

                      <input
                        id="admin-senha-login"
                        type={mostrarSenha ? 'text' : 'password'}
                        placeholder="Senha"
                        autoComplete="current-password"
                        required
                        value={senhaLogin}
                        onChange={(evento) =>
                          setSenhaLogin(evento.target.value)
                        }
                        className={`${campoClasses} pr-12 pl-12`}
                      />

                      <button
                        type="button"
                        onClick={() => setMostrarSenha(!mostrarSenha)}
                        aria-label={
                          mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'
                        }
                        className="absolute top-1/2 right-3 -translate-y-1/2 text-texto-suave"
                      >
                        <span className="material-icons text-[20px]">
                          {mostrarSenha ? 'visibility' : 'visibility_off'}
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <label className="flex cursor-pointer items-center gap-2 font-corpo text-sm text-texto">
                      <input
                        type="checkbox"
                        checked={lembrar}
                        onChange={(evento) =>
                          setLembrar(evento.target.checked)
                        }
                        className="h-4 w-4 accent-primaria"
                      />
                      Lembrar de mim
                    </label>

                    <button
                      type="button"
                      onClick={() =>
                        setMensagem(
                          'A recuperação de senha ainda não está disponível.'
                        )
                      }
                      className="font-corpo text-sm font-semibold text-primaria underline"
                    >
                      Esqueceu sua senha?
                    </button>
                  </div>

                  <div className="mt-5">
                    <Botao
                      texto="Entrar →"
                      tipo="submit"
                      variante="primario"
                      larguraTotal
                    />
                  </div>
                </form>
              ) : (
                <form onSubmit={cadastrar} className="mt-3 flex flex-col">
                  <h2 className="font-titulo text-xl font-bold text-primaria sm:text-2xl">
                    Cadastro Administrativo
                  </h2>

                  <p className="mt-1 font-corpo text-xs text-texto-suave">
                    Informe seus dados para solicitar acesso à plataforma.
                  </p>

                  <div className="mt-3 grid grid-cols-1 gap-2 text-left sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label htmlFor="admin-nome" className={labelClasses}>
                        Nome completo
                      </label>

                      <input
                        id="admin-nome"
                        type="text"
                        placeholder="Digite seu nome completo"
                        autoComplete="name"
                        required
                        value={nome}
                        onChange={(evento) =>
                          setNome(evento.target.value)
                        }
                        className={campoClasses}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="admin-email-cadastro"
                        className={labelClasses}
                      >
                        E-mail institucional
                      </label>

                      <input
                        id="admin-email-cadastro"
                        type="email"
                        placeholder="Digite seu e-mail institucional"
                        autoComplete="email"
                        required
                        value={emailCadastro}
                        onChange={(evento) =>
                          setEmailCadastro(evento.target.value)
                        }
                        className={campoClasses}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="admin-instituicao"
                        className={labelClasses}
                      >
                        Instituição / Órgão
                      </label>

                      <input
                        id="admin-instituicao"
                        type="text"
                        placeholder="Nome da instituição"
                        required
                        value={instituicao}
                        onChange={(evento) =>
                          setInstituicao(evento.target.value)
                        }
                        className={campoClasses}
                      />
                    </div>

                    <div>
                      <label htmlFor="admin-cargo" className={labelClasses}>
                        Cargo / Função
                      </label>

                      <input
                        id="admin-cargo"
                        type="text"
                        placeholder="Seu cargo"
                        required
                        value={cargo}
                        onChange={(evento) =>
                          setCargo(evento.target.value)
                        }
                        className={campoClasses}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="admin-convite"
                        className={labelClasses}
                      >
                        Código de convite administrativo
                      </label>

                      <input
                        id="admin-convite"
                        type="text"
                        placeholder="Informe o código fornecido pela instituição"
                        required
                        value={codigoConvite}
                        onChange={(evento) =>
                          setCodigoConvite(evento.target.value)
                        }
                        className={campoClasses}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="admin-senha-cadastro"
                        className={labelClasses}
                      >
                        Senha
                      </label>

                      <div className="relative">
                        <input
                          id="admin-senha-cadastro"
                          type={mostrarSenha ? 'text' : 'password'}
                          placeholder="Mínimo de 8 caracteres"
                          autoComplete="new-password"
                          minLength={8}
                          required
                          value={senhaCadastro}
                          onChange={(evento) =>
                            setSenhaCadastro(evento.target.value)
                          }
                          className={`${campoClasses} pr-11`}
                        />

                        <button
                          type="button"
                          onClick={() => setMostrarSenha(!mostrarSenha)}
                          aria-label={
                            mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'
                          }
                          className="absolute top-1/2 right-3 -translate-y-1/2 text-texto-suave"
                        >
                          <span className="material-icons text-[20px]">
                            {mostrarSenha ? 'visibility' : 'visibility_off'}
                          </span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="admin-confirmar-senha"
                        className={labelClasses}
                      >
                        Confirmar senha
                      </label>

                      <div className="relative">
                        <input
                          id="admin-confirmar-senha"
                          type={mostrarConfirmacao ? 'text' : 'password'}
                          placeholder="Repita sua senha"
                          autoComplete="new-password"
                          required
                          value={confirmarSenha}
                          onChange={(evento) =>
                            setConfirmarSenha(evento.target.value)
                          }
                          className={`${campoClasses} pr-11`}
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setMostrarConfirmacao(!mostrarConfirmacao)
                          }
                          aria-label={
                            mostrarConfirmacao
                              ? 'Ocultar senha'
                              : 'Mostrar senha'
                          }
                          className="absolute top-1/2 right-3 -translate-y-1/2 text-texto-suave"
                        >
                          <span className="material-icons text-[20px]">
                            {mostrarConfirmacao
                              ? 'visibility'
                              : 'visibility_off'}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <label className="mt-2 flex items-start gap-2 font-corpo text-xs text-texto">
                    <input
                      type="checkbox"
                      checked={aceitouTermos}
                      onChange={(evento) =>
                        setAceitouTermos(evento.target.checked)
                      }
                      className="mt-0.5 h-4 w-4 shrink-0 accent-primaria"
                    />
                    Li e concordo com os Termos de Uso e a Política de Privacidade.
                  </label>

                  <div className="mt-3">
                    <Botao
                      texto="Solicitar cadastro →"
                      tipo="submit"
                      variante="primario"
                      larguraTotal
                    />
                  </div>

                  <p className="mt-2 font-corpo text-sm text-texto">
                    Já possui uma conta?{' '}
                    <button
                      type="button"
                      onClick={() => trocarAba('entrar')}
                      className="font-semibold text-primaria underline"
                    >
                      Entrar
                    </button>
                  </p>
                </form>
              )}

              {mensagem && (
                <p
                  role="status"
                  className="mt-3 rounded-lg border border-[#dfb99b] bg-[#f5e8d9] p-2 text-center font-corpo text-sm text-primaria"
                >
                  {mensagem}
                </p>
              )}

              <div className="my-3 flex items-center gap-4">
                <div className="h-px flex-1 bg-[#d9bda7]" />
                <span className="font-corpo text-sm text-texto">ou</span>
                <div className="h-px flex-1 bg-[#d9bda7]" />
              </div>

              <Link
                to="/login-usuario"
                className="flex w-full items-center justify-center gap-2 rounded-full border border-primaria px-4 py-2.5 font-corpo text-sm font-semibold text-primaria transition-colors hover:bg-primaria/10 sm:text-base"
              >
                <span className="material-icons text-[21px]">
                  verified_user
                </span>
                Acessar como Cidadão
              </Link>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
