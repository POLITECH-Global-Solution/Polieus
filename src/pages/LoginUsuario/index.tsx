import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';

import Botao from '../../components/Botao/Botao';
import fundoLogin from '../../img/cadastro_login.png';

type Aba = 'entrar' | 'cadastrar';

function formatarCPF(valor: string) {
  return valor
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function formatarTelefone(valor: string) {
  const numeros = valor.replace(/\D/g, '').slice(0, 11);

  if (numeros.length <= 10) {
    return numeros
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }

  return numeros
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');
}

function validarCPF(valor: string) {
  const cpf = valor.replace(/\D/g, '');

  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  for (let digito = 9; digito < 11; digito++) {
    let soma = 0;

    for (let i = 0; i < digito; i++) {
      soma += Number(cpf[i]) * (digito + 1 - i);
    }

    const resto = (soma * 10) % 11;
    const verificador = resto === 10 ? 0 : resto;

    if (verificador !== Number(cpf[digito])) {
      return false;
    }
  }

  return true;
}

export default function LoginUsuario() {
  const [aba, setAba] = useState<Aba>('entrar');
  const [mensagem, setMensagem] = useState('');

  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);

  const [identificacao, setIdentificacao] = useState('');
  const [senhaLogin, setSenhaLogin] = useState('');
  const [lembrar, setLembrar] = useState(false);

  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
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

    if (!identificacao.trim() || !senhaLogin) {
      setMensagem('Preencha seu e-mail ou CPF e sua senha.');
      return;
    }

    const identificacaoValida = identificacao.includes('@')
      ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identificacao)
      : validarCPF(identificacao);

    if (!identificacaoValida) {
      setMensagem('Informe um e-mail ou CPF válido.');
      return;
    }

    setMensagem(
      'Dados validados. O login estará disponível após a integração com o back-end.'
    );
  };

  const cadastrar = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    setMensagem('');

    if (nome.trim().split(/\s+/).length < 2) {
      setMensagem('Informe seu nome completo.');
      return;
    }

    if (!validarCPF(cpf)) {
      setMensagem('Informe um CPF válido.');
      return;
    }

    if (telefone.replace(/\D/g, '').length < 10) {
      setMensagem('Informe um telefone válido com DDD.');
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
  };

  const campoClasses =
    'w-full min-w-0 rounded-lg border border-[#d9bda7] bg-white/40 px-3 py-2 font-corpo text-sm text-texto outline-none transition-colors placeholder:text-[#9c9188] focus:border-primaria focus:ring-1 focus:ring-primaria';

  const labelClasses =
    'mb-0.5 block font-corpo text-sm text-texto';

  return (
    <main
      className="min-h-dvh w-full overflow-x-hidden bg-cover bg-center bg-no-repeat lg:min-h-dvh"
      style={{ backgroundImage: `url(${fundoLogin})` }}
    >
      <div className="grid min-h-dvh w-full grid-cols-1 lg:grid-cols-[43%_57%]">

        {/* LADO ESQUERDO - IDENTIDADE VISUAL */}
        <aside className="flex flex-col items-center justify-center px-6 py-8 text-center lg:min-h-dvh lg:pr-16">

          <img
            src="/favicons/logo_polieus3.png"
            alt="Logo do Polieus"
            className="w-64 max-w-full object-contain sm:w-72 lg:w-96"
          />

          <div className="mt-3 h-px w-48 bg-primaria/70 sm:w-64" />

          <p  className="mt-6 max-w-sm text-center font-corpo text-xl font-semibold leading-relaxed text-[#4a1712]"
            style={{
            textShadow: '0 2px 3px rgba(255, 248, 235, 1), 0 0 12px rgba(255, 248, 235, 1), 0 0 24px rgba(255, 248, 235, 0.95)',}}>
            Uma cidade mais participativa,
            <br />
            começa com você.
          </p>

        </aside>

        {/* LADO DIREITO - LOGIN E CADASTRO */}
        <div className="flex min-h-dvh min-w-0 flex-col px-4 py-3 sm:px-8 lg:px-10">

          {/* VOLTAR PARA O INÍCIO */}
          <div className="mt-6 flex shrink-0 justify-end lg:mt-8">
            <Link
              to="/"
              className="flex items-center gap-2 font-corpo text-sm font-medium text-primaria hover:underline"
            >
              <span className="material-icons text-[20px]">
                arrow_back
              </span>
              Voltar para início
            </Link>
          </div>

          {/* CENTRALIZAÇÃO DO CARD */}
          <div className="flex flex-1 items-center justify-center py-3">

            <section className="w-full max-w-2xl rounded-3xl border border-[#dfb99b] bg-[#fffaf5]/90 p-4 shadow-sm backdrop-blur-sm sm:p-5">

              {/* ABAS ENTRAR E CADASTRAR */}
              <div className="grid grid-cols-2 border-b-2 border-primaria">

                <button
                  type="button"
                  onClick={() => trocarAba('entrar')}
                  className={`flex items-center justify-center gap-2 rounded-t-full px-3 py-2 font-corpo text-sm font-semibold transition-colors sm:text-base ${
                    aba === 'entrar'
                      ? 'bg-primaria text-white'
                      : 'text-primaria hover:bg-primaria/10'
                  }`}
                >
                  <span className="material-icons text-[22px]">
                    person
                  </span>
                  Entrar
                </button>

                <button
                  type="button"
                  onClick={() => trocarAba('cadastrar')}
                  className={`flex items-center justify-center gap-2 rounded-t-full px-3 py-2 font-corpo text-sm font-semibold transition-colors sm:text-base ${
                    aba === 'cadastrar'
                      ? 'bg-primaria text-white'
                      : 'text-primaria hover:bg-primaria/10'
                  }`}
                >
                  <span className="material-icons text-[22px]">
                    person_add
                  </span>
                  Cadastrar
                </button>

              </div>

              {/* FORMULÁRIO DE LOGIN */}
              {aba === 'entrar' ? (

                <form onSubmit={entrar} className="mt-5 flex flex-col">

                  <h1 className="font-titulo text-3xl font-bold text-primaria sm:text-4xl">
                    Bem-vindo de volta!
                  </h1>

                  <p className="mt-1 font-corpo text-sm text-texto-suave">
                    Acesse sua conta para continuar.
                  </p>

                  <div className="mt-6 flex flex-col gap-4 text-left">

                    {/* E-MAIL OU CPF */}
                    <div>
                      <label
                        htmlFor="login-identificacao"
                        className="sr-only"
                      >
                        E-mail ou CPF
                      </label>

                      <div className="relative">

                        <span className="material-icons pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[22px] text-texto-suave">
                          mail_outline
                        </span>

                        <input
                          id="login-identificacao"
                          type="text"
                          placeholder="E-mail ou CPF"
                          autoComplete="username"
                          required
                          value={identificacao}
                          onChange={(evento) =>
                            setIdentificacao(evento.target.value)
                          }
                          className={`${campoClasses} pl-12`}
                        />

                      </div>
                    </div>

                    {/* SENHA */}
                    <div>
                      <label
                        htmlFor="login-senha"
                        className="sr-only"
                      >
                        Senha
                      </label>

                      <div className="relative">

                        <span className="material-icons pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[22px] text-texto-suave">
                          lock_outline
                        </span>

                        <input
                          id="login-senha"
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
                          className="absolute top-1/2 right-4 -translate-y-1/2 text-texto-suave"
                        >
                          <span className="material-icons text-[22px]">
                            {mostrarSenha ? 'visibility' : 'visibility_off'}
                          </span>
                        </button>

                      </div>
                    </div>

                  </div>

                  {/* LEMBRAR DE MIM E ESQUECEU A SENHA */}
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3">

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
                          'A recuperação de senha estará disponível após a integração com o back-end.'
                        )
                      }
                      className="font-corpo text-sm font-semibold text-primaria underline"
                    >
                      Esqueceu sua senha?
                    </button>

                  </div>

                  {/* BOTÃO ENTRAR */}
                  <div className="mt-6">
                    <Botao
                      texto="Entrar →"
                      tipo="submit"
                      variante="primario"
                      larguraTotal
                    />
                  </div>

                  {/* DIVISOR */}
                  <div className="my-4 flex items-center gap-4">
                    <div className="h-px flex-1 bg-[#dfb99b]" />

                    <span className="font-corpo text-sm text-texto">
                      ou
                    </span>

                    <div className="h-px flex-1 bg-[#dfb99b]" />
                  </div>

                  {/* LOGIN COM GOOGLE */}
                  <Botao
                    texto="Entrar com Google"
                    tipo="button"
                    variante="secundario"
                    larguraTotal
                    onClick={() =>
                      setMensagem(
                        'O login com Google estará disponível após a configuração da autenticação.'
                      )
                    }
                  />

                  {/* IR PARA CADASTRO */}
                  <p className="mt-5 font-corpo text-sm text-texto">
                    Ainda não tem uma conta?{' '}

                    <button
                      type="button"
                      onClick={() => trocarAba('cadastrar')}
                      className="font-semibold text-primaria underline"
                    >
                      Cadastre-se
                    </button>
                  </p>

                </form>

              ) : (

                /* FORMULÁRIO DE CADASTRO */
                <form onSubmit={cadastrar} className="mt-3 flex flex-col">

                  <h1 className="font-titulo text-2xl font-bold text-primaria sm:text-3xl">
                    Crie sua conta!
                  </h1>

                  <p className="mt-1 font-corpo text-sm text-texto-suave">
                    Faça parte de uma cidade mais participativa.
                  </p>

                  {/* CAMPOS DO CADASTRO */}
                  <div className="mt-3 grid grid-cols-1 gap-2 text-left sm:grid-cols-2">

                    {/* NOME COMPLETO */}
                    <div className="sm:col-span-2">

                      <label
                        htmlFor="cadastro-nome"
                        className={labelClasses}
                      >
                        Nome completo
                      </label>

                      <input
                        id="cadastro-nome"
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

                    {/* CPF */}
                    <div>

                      <label
                        htmlFor="cadastro-cpf"
                        className={labelClasses}
                      >
                        CPF
                      </label>

                      <input
                        id="cadastro-cpf"
                        type="text"
                        inputMode="numeric"
                        placeholder="000.000.000-00"
                        autoComplete="off"
                        required
                        maxLength={14}
                        value={cpf}
                        onChange={(evento) =>
                          setCpf(formatarCPF(evento.target.value))
                        }
                        className={campoClasses}
                      />

                    </div>

                    {/* TELEFONE */}
                    <div>

                      <label
                        htmlFor="cadastro-telefone"
                        className={labelClasses}
                      >
                        Telefone
                      </label>

                      <input
                        id="cadastro-telefone"
                        type="tel"
                        placeholder="(11) 99999-9999"
                        autoComplete="tel"
                        required
                        value={telefone}
                        onChange={(evento) =>
                          setTelefone(formatarTelefone(evento.target.value))
                        }
                        className={campoClasses}
                      />

                    </div>

                    {/* E-MAIL */}
                    <div className="sm:col-span-2">

                      <label
                        htmlFor="cadastro-email"
                        className={labelClasses}
                      >
                        E-mail
                      </label>

                      <input
                        id="cadastro-email"
                        type="email"
                        placeholder="Digite seu e-mail"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(evento) =>
                          setEmail(evento.target.value)
                        }
                        className={campoClasses}
                      />

                    </div>

                    {/* SENHA */}
                    <div>

                      <label
                        htmlFor="cadastro-senha"
                        className={labelClasses}
                      >
                        Senha
                      </label>

                      <div className="relative">

                        <input
                          id="cadastro-senha"
                          type={mostrarSenha ? 'text' : 'password'}
                          placeholder="Mínimo de 8 caracteres"
                          autoComplete="new-password"
                          required
                          minLength={8}
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

                    {/* CONFIRMAR SENHA */}
                    <div>

                      <label
                        htmlFor="cadastro-confirmacao"
                        className={labelClasses}
                      >
                        Confirmar senha
                      </label>

                      <div className="relative">

                        <input
                          id="cadastro-confirmacao"
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

                  {/* TERMOS DE USO */}
                  <label className="mt-2 flex items-start gap-2 text-left font-corpo text-xs text-texto">

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

                  {/* BOTÃO CRIAR CONTA */}
                  <div className="mt-3">
                    <Botao
                      texto="Criar conta →"
                      tipo="submit"
                      variante="primario"
                      larguraTotal
                    />
                  </div>

                  {/* VOLTAR PARA O LOGIN */}
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

              {/* MENSAGENS DE VALIDAÇÃO */}
              {mensagem && (
                <p
                  role="status"
                  className="mt-3 rounded-lg border border-[#dfb99b] bg-[#f5e8d9] p-2 text-center font-corpo text-sm text-primaria"
                >
                  {mensagem}
                </p>
              )}

            </section>

          </div>

        </div>

      </div>
    </main>
  );
}
