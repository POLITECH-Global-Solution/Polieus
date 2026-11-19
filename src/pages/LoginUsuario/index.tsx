import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cadastrarUsuario, loginUsuario } from '../../services/usuarioService';
import Botao from '../../components/Botao/Botao';
import fundoLogin from '../../img/cadastro_login.png';

type Aba = 'entrar' | 'cadastrar';
type Campo = 'nome' | 'cpf' | 'telefone' | 'email' | 'senha' | 'confirmacao' | 'termos';
type Erros = Partial<Record<Campo, string>>;
type TipoMensagem = 'sucesso' | 'erro' | 'aviso';

const somenteNumeros = (valor: string) => valor.replace(/\D/g, '');

function formatarCPF(valor: string) {
  return somenteNumeros(valor).slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function formatarTelefone(valor: string) {
  const numero = somenteNumeros(valor).slice(0, 11);

  if (numero.length <= 10) {
    return numero.replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }

  return numero.replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');
}

function validarCPF(valor: string) {
  const cpf = somenteNumeros(valor);

  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  for (let posicao = 9; posicao < 11; posicao++) {
    let soma = 0;

    for (let i = 0; i < posicao; i++) {
      soma += Number(cpf[i]) * (posicao + 1 - i);
    }

    const resto = (soma * 10) % 11;
    const digito = resto === 10 ? 0 : resto;

    if (digito !== Number(cpf[posicao])) return false;
  }

  return true;
}

function validarTelefone(valor: string) {
  const numero = somenteNumeros(valor);

  if (![10, 11].includes(numero.length)) return false;

  const ddd = Number(numero.slice(0, 2));
  const assinante = numero.slice(2);

  if (ddd < 11 || ddd > 99) return false;
  if (/^(\d)\1+$/.test(assinante)) return false;
  if (numero.length === 11 && numero[2] !== '9') return false;

  return true;
}

function validarEmail(valor: string) {
  return /^[\w\.-]+@[\w\.-]+\.[a-zA-Z]{2,}$/.test(valor.trim());
}

function requisitosSenha(senha: string) {
  return [
    { texto: 'Entre 8 e 100 caracteres', valido: senha.length >= 8 && senha.length <= 100 },
    { texto: 'Uma letra maiúscula', valido: /[A-Z]/.test(senha) },
    { texto: 'Uma letra minúscula', valido: /[a-z]/.test(senha) },
    { texto: 'Um número', valido: /[0-9]/.test(senha) },
    { texto: 'Um caractere especial', valido: /[@#$%^&+=!_]/.test(senha) },
  ];
}

function validarSenha(senha: string) {
  if (senha.length < 8 || senha.length > 100) return 'A senha deve ter entre 8 e 100 caracteres.';
  if (!/[A-Z]/.test(senha)) return 'Adicione pelo menos uma letra maiúscula.';
  if (!/[a-z]/.test(senha)) return 'Adicione pelo menos uma letra minúscula.';
  if (!/[0-9]/.test(senha)) return 'Adicione pelo menos um número.';
  if (!/[@#$%^&+=!_]/.test(senha)) return 'Use pelo menos um destes símbolos: @ # $ % ^ & + = ! _.';

  return '';
}

function identificarCampo(nome: string): Campo | null {
  const campo = nome.toLowerCase().replace(/[^a-z]/g, '');

  if (campo.includes('cpf')) return 'cpf';
  if (campo.includes('telefone') || campo.includes('phone')) return 'telefone';
  if (campo.includes('email')) return 'email';
  if (campo.includes('senha') || campo.includes('password')) return 'senha';
  if (campo.includes('nomeusuario') || campo === 'nome') return 'nome';

  return null;
}

function mensagemCampo(campo: Campo, descricao: string) {
  const texto = descricao.toLowerCase();

  if (/duplic|exist|cadastrad|unique|already/.test(texto)) {
    if (campo === 'cpf') return 'Este CPF já está cadastrado.';
    if (campo === 'email') return 'Este e-mail já está cadastrado.';
  }

  const mensagens: Record<Campo, string> = {
    nome: 'Confira seu nome completo.',
    cpf: 'Confira o CPF informado.',
    telefone: 'Confira o telefone e o DDD.',
    email: 'Confira o endereço de e-mail.',
    senha: 'Confira os requisitos da senha.',
    confirmacao: 'Confira a confirmação da senha.',
    termos: 'Aceite os termos para continuar.',
  };

  return mensagens[campo];
}

function interpretarErro(erro: unknown): { mensagem: string; campos: Erros } {
  const campos: Erros = {};

  const objeto = erro && typeof erro === 'object'
    ? erro as Record<string, unknown>
    : {};

  const textoInicial = erro instanceof Error ? erro.message : '';
  const mensagens: string[] = [textoInicial];

  const analisar = (valor: unknown, profundidade = 0): void => {
    if (profundidade > 4 || valor == null) return;

    if (typeof valor === 'string') {
      const texto = valor.trim();

      if ((texto.startsWith('{') || texto.startsWith('[')) && texto.length < 20000) {
        try {
          analisar(JSON.parse(texto) as unknown, profundidade + 1);
          return;
        } catch {
          // Resposta sem JSON válido.
        }
      }

      mensagens.push(texto);
      return;
    }

    if (Array.isArray(valor)) {
      valor.forEach(item => analisar(item, profundidade + 1));
      return;
    }

    if (typeof valor !== 'object') return;

    const dados = valor as Record<string, unknown>;
    const nomeCampo = dados.field ?? dados.campo ?? dados.property ?? dados.fieldName;
    const descricao = dados.defaultMessage ?? dados.message ?? dados.mensagem ?? dados.detail;
    const campo = typeof nomeCampo === 'string' ? identificarCampo(nomeCampo) : null;

    if (campo && typeof descricao === 'string') {
      campos[campo] = mensagemCampo(campo, descricao);
    }

    for (const chave of ['errors', 'erros', 'violations', 'fieldErrors', 'details', 'detalhes']) {
      if (dados[chave] !== undefined) analisar(dados[chave], profundidade + 1);
    }

    for (const chave of ['message', 'mensagem', 'detail', 'error']) {
      if (typeof dados[chave] === 'string') mensagens.push(dados[chave] as string);
    }
  };

  analisar(objeto.detalhes);
  analisar(objeto.data);
  analisar(objeto.response);

  const texto = mensagens.join(' ').toLowerCase();

  if (Object.keys(campos).length > 0) {
    return { mensagem: 'Confira os campos destacados e tente novamente.', campos };
  }

  if (/failed to fetch|networkerror|network request failed|cors/.test(texto)) {
    return {
      mensagem: 'Não foi possível conectar. Verifique sua conexão e tente novamente.',
      campos: {},
    };
  }

  if (/timeout|aborterror|tempo limite/.test(texto)) {
    return {
      mensagem: 'A conexão demorou mais que o esperado. Tente novamente em instantes.',
      campos: {},
    };
  }

  if (objeto.status === 409 || /\b409\b|conflict/.test(texto)) {
    return {
      mensagem: 'Já pode existir um cadastro com estes dados. Confira o CPF e o e-mail.',
      campos: {},
    };
  }

  return {
    mensagem: /\b400\b|bad request/.test(texto)
      ? 'Não foi possível concluir o cadastro. Confira os dados informados.'
      : 'Não foi possível criar sua conta. Tente novamente.',
    campos: {},
  };
}

export default function LoginUsuario() {
  const navigate = useNavigate();

  const [aba, setAba] = useState<Aba>('entrar');
  const [mensagem, setMensagem] = useState('');
  const [tipoMensagem, setTipoMensagem] = useState<TipoMensagem>('aviso');
  const [processando, setProcessando] = useState(false);
  const [erros, setErros] = useState<Erros>({});
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);

  const [identificacao, setIdentificacao] = useState('');
  const [senhaLogin, setSenhaLogin] = useState('');

  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [senhaCadastro, setSenhaCadastro] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [aceitouTermos, setAceitouTermos] = useState(false);

  const avisar = (texto: string, tipo: TipoMensagem = 'erro') => {
    setMensagem(texto);
    setTipoMensagem(tipo);
  };

  const limparErro = (campo: Campo) => {
    setErros(anterior => ({ ...anterior, [campo]: undefined }));
    setMensagem('');
  };

  const trocarAba = (novaAba: Aba) => {
    if (processando) return;

    setAba(novaAba);
    setMensagem('');
    setErros({});
    setMostrarSenha(false);
    setMostrarConfirmacao(false);
  };

  const validarCadastro = () => {
    const novosErros: Erros = {};

    if (!nome.trim() || nome.trim().split(/\s+/).length < 2) {
      novosErros.nome = 'Informe seu nome e sobrenome.';
    }

    if (!validarCPF(cpf)) {
      novosErros.cpf = 'CPF inválido. Confira os números informados.';
    }

    if (!validarTelefone(telefone)) {
      novosErros.telefone = 'Informe um telefone válido com DDD.';
    }

    if (!validarEmail(email)) {
      novosErros.email = 'Informe um e-mail válido.';
    }

    const erroSenha = validarSenha(senhaCadastro);

    if (erroSenha) novosErros.senha = erroSenha;

    if (!confirmarSenha || confirmarSenha !== senhaCadastro) {
      novosErros.confirmacao = 'As senhas não coincidem.';
    }

    if (!aceitouTermos) {
      novosErros.termos = 'Aceite os termos para continuar.';
    }

    setErros(novosErros);

    if (Object.keys(novosErros).length > 0) {
      avisar('Confira os campos destacados em vermelho.');
      return false;
    }

    return true;
  };

  // CADASTRO DE USUÁRIO
  const cadastrar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();

    if (processando) return;

    setMensagem('');

    if (!validarCadastro()) return;

    setProcessando(true);

    try {
      await cadastrarUsuario({
        nomeUsuario: nome.trim(),
        cpf: somenteNumeros(cpf),
        telefone: somenteNumeros(telefone),
        email: email.trim().toLowerCase(),
        senha: senhaCadastro,
      });

      setIdentificacao(email.trim().toLowerCase());
      setNome('');
      setCpf('');
      setTelefone('');
      setEmail('');
      setSenhaCadastro('');
      setConfirmarSenha('');
      setAceitouTermos(false);
      setMostrarSenha(false);
      setMostrarConfirmacao(false);
      setErros({});
      setAba('entrar');

      avisar('Conta criada com sucesso! Agora você pode entrar.', 'sucesso');
    } catch (erro) {
      const resultado = interpretarErro(erro);

      setErros(resultado.campos);
      avisar(resultado.mensagem);
    } finally {
      setProcessando(false);
    }
  };

  // LOGIN DE USUÁRIO
  const entrar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();

    if (processando) return;

    setMensagem('');

    if (!validarEmail(identificacao)) {
      avisar('Informe um e-mail válido.');
      return;
    }

    if (!senhaLogin.trim()) {
      avisar('Informe sua senha.');
      return;
    }

    setProcessando(true);

    try {
      const usuario = await loginUsuario({
        email: identificacao.trim().toLowerCase(),
        senha: senhaLogin,
      });

      if (!usuario || !Number.isInteger(usuario.idUsuario) || Number(usuario.idUsuario) <= 0) {
        avisar('Não foi possível acessar sua conta. Tente novamente.');
        return;
      }

      // Armazena somente os dados básicos do usuário.
      sessionStorage.setItem('usuario', JSON.stringify({
        idUsuario: usuario.idUsuario,
        nomeUsuario: usuario.nomeUsuario,
        email: usuario.email,
      }));

      setSenhaLogin('');

      // Redireciona para a área do cidadão.
      navigate('/inicio', { replace: true });
    } catch (erro) {
      const status = (erro as { status?: number } | null)?.status;
      const texto = erro instanceof Error ? erro.message : '';

      if (
        status === 401 ||
        status === 403 ||
        /\b401\b|\b403\b|credenciais|senha incorreta|unauthorized/i.test(texto)
      ) {
        avisar('E-mail ou senha incorretos.');
      } else if (/failed to fetch|networkerror|cors/i.test(texto)) {
        avisar('Não foi possível conectar ao servidor. Tente novamente.');
      } else {
        avisar('Não foi possível acessar sua conta. Tente novamente.');
      }
    } finally {
      setProcessando(false);
    }
  };

  const campoBase = 'w-full min-w-0 rounded-lg border border-[#d9bda7] bg-white/40 px-3 py-2 font-corpo text-sm text-texto outline-none transition-colors placeholder:text-[#9c9188] focus:border-primaria focus:ring-1 focus:ring-primaria';
  const labelBase = 'mb-0.5 block font-corpo text-sm text-texto';

  const classeCampo = (campo: Campo, adicional = '') =>
    `${campoBase} ${erros[campo] ? 'border-red-600 bg-red-50/70 focus:border-red-600 focus:ring-red-600' : ''} ${adicional}`;

  const mostrarErro = (campo: Campo) =>
    erros[campo] ? (
      <p id={`erro-${campo}`} role="alert" className="mt-1 flex items-start gap-1 font-corpo text-xs font-medium text-red-700">
        <span className="material-icons text-[15px]" aria-hidden="true">error_outline</span>
        {erros[campo]}
      </p>
    ) : null;

  const classesMensagem = {
    sucesso: 'border-green-300 bg-green-50 text-green-800',
    erro: 'border-red-300 bg-red-50 text-red-700',
    aviso: 'border-[#dfb99b] bg-[#f5e8d9] text-primaria',
  };

  const listaRequisitos = requisitosSenha(senhaCadastro);
  const senhaValida = listaRequisitos.every(requisito => requisito.valido);

  return (
    <main className="min-h-dvh w-full overflow-x-hidden bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${fundoLogin})` }}>
      <div className="grid min-h-dvh w-full grid-cols-1 lg:grid-cols-[43%_57%]">
        <aside className="flex flex-col items-center justify-center px-6 py-8 text-center lg:min-h-dvh lg:pr-16">
          <img src="/favicons/logo_polieus3.png" alt="Logo do Polieus" className="w-64 max-w-full object-contain sm:w-72 lg:w-96" />

          <div className="mt-3 h-px w-48 bg-primaria/70 sm:w-64" />

          <p className="mt-6 max-w-sm text-center font-corpo text-xl font-semibold leading-relaxed text-[#4a1712]" style={{ textShadow: '0 2px 3px rgba(255,248,235,1), 0 0 12px rgba(255,248,235,1), 0 0 24px rgba(255,248,235,.95)' }}>
            Uma cidade mais participativa,<br />
            começa com você.
          </p>
        </aside>

        <div className="flex min-h-dvh min-w-0 flex-col px-4 py-3 sm:px-8 lg:px-10">
          {/* VOLTAR PARA HOME */}
          <div className="mt-6 flex shrink-0 justify-end lg:mt-8">
            <Link to="/" className="flex items-center gap-2 font-corpo text-sm font-medium text-primaria hover:underline">
              <span className="material-icons text-[20px]">arrow_back</span>
              Voltar para início
            </Link>
          </div>

          <div className="flex flex-1 items-center justify-center py-3">
            <section className="w-full max-w-2xl rounded-3xl border border-[#dfb99b] bg-[#fffaf5]/90 p-4 shadow-sm backdrop-blur-sm sm:p-5">
              <div className="grid grid-cols-2 border-b-2 border-primaria" role="group" aria-label="Acesso à plataforma">
                <button type="button" onClick={() => trocarAba('entrar')} disabled={processando} aria-pressed={aba === 'entrar'} className={`flex items-center justify-center gap-2 rounded-t-full px-3 py-2 font-corpo text-sm font-semibold transition-colors sm:text-base ${aba === 'entrar' ? 'bg-primaria text-white' : 'text-primaria hover:bg-primaria/10'}`}>
                  <span className="material-icons text-[22px]">person</span>
                  Entrar
                </button>

                <button type="button" onClick={() => trocarAba('cadastrar')} disabled={processando} aria-pressed={aba === 'cadastrar'} className={`flex items-center justify-center gap-2 rounded-t-full px-3 py-2 font-corpo text-sm font-semibold transition-colors sm:text-base ${aba === 'cadastrar' ? 'bg-primaria text-white' : 'text-primaria hover:bg-primaria/10'}`}>
                  <span className="material-icons text-[22px]">person_add</span>
                  Cadastrar
                </button>
              </div>

              {aba === 'entrar' ? (

                /* FORMULÁRIO DE LOGIN */
                <form onSubmit={entrar} className="mt-5 flex flex-col">
                  <h1 className="font-titulo text-3xl font-bold text-primaria sm:text-4xl">
                    Bem-vindo de volta!
                  </h1>
                  <p className="mt-1 font-corpo text-sm text-texto-suave">
                    Acesse sua conta para continuar.
                  </p>

                  <div className="mt-6 flex flex-col gap-4">
                    {/* E-MAIL */}
                    <div className="relative">
                      <label htmlFor="login-email" className="sr-only">E-mail</label>
                      <span className="material-icons pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[22px] text-texto-suave">
                        mail_outline
                      </span>
                      <input id="login-email" type="email" autoComplete="username" placeholder="E-mail" required disabled={processando} value={identificacao} onChange={e => { setIdentificacao(e.target.value); setMensagem(''); }} className={`${campoBase} pl-12`} />
                    </div>

                    {/* SENHA */}
                    <div className="relative">
                      <label htmlFor="login-senha" className="sr-only">Senha</label>
                      <span className="material-icons pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[22px] text-texto-suave">
                        lock_outline
                      </span>
                      <input id="login-senha" type={mostrarSenha ? 'text' : 'password'} autoComplete="current-password" placeholder="Senha" required disabled={processando} value={senhaLogin} onChange={e => { setSenhaLogin(e.target.value); setMensagem(''); }} className={`${campoBase} pr-12 pl-12`} />

                      <button type="button" onClick={() => setMostrarSenha(!mostrarSenha)} aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'} className="absolute top-1/2 right-4 -translate-y-1/2 text-texto-suave">
                        <span className="material-icons text-[22px]">
                          {mostrarSenha ? 'visibility' : 'visibility_off'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* RECUPERAÇÃO DE SENHA */}
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                    <span className="font-corpo text-sm text-texto">
                      Acesso à sua conta Polieus
                    </span>

                    <button type="button" onClick={() => avisar('A recuperação de senha ainda não está disponível.', 'aviso')} className="font-corpo text-sm font-semibold text-primaria underline">
                      Esqueceu sua senha?
                    </button>
                  </div>

                  {/* BOTÃO ENTRAR */}
                  <div className="mt-6">
                    <fieldset disabled={processando}>
                      <Botao texto={processando ? 'Entrando...' : 'Entrar →'} tipo="submit" variante="primario" larguraTotal />
                    </fieldset>
                  </div>

                  <p className="mt-5 font-corpo text-sm text-texto">
                    Ainda não tem uma conta?{' '}
                    <button type="button" onClick={() => trocarAba('cadastrar')} className="font-semibold text-primaria underline">
                      Cadastre-se
                    </button>
                  </p>
                </form>
              ) : (

                /* FORMULÁRIO DE CADASTRO */
                <form onSubmit={cadastrar} noValidate className="mt-3 flex flex-col">
                  <h1 className="font-titulo text-2xl font-bold text-primaria sm:text-3xl">
                    Crie sua conta!
                  </h1>
                  <p className="mt-1 font-corpo text-sm text-texto-suave">
                    Faça parte de uma cidade mais participativa.
                  </p>

                  <div className="mt-3 grid grid-cols-1 gap-2 text-left sm:grid-cols-2">
                    {/* NOME COMPLETO */}
                    <div className="sm:col-span-2">
                      <label htmlFor="cadastro-nome" className={labelBase}>Nome completo</label>
                      <input id="cadastro-nome" type="text" autoComplete="name" placeholder="Digite seu nome completo" value={nome} disabled={processando} onChange={e => { setNome(e.target.value); limparErro('nome'); }} aria-invalid={Boolean(erros.nome)} aria-describedby={erros.nome ? 'erro-nome' : undefined} className={classeCampo('nome')} />
                      {mostrarErro('nome')}
                    </div>

                    {/* CPF */}
                    <div>
                      <label htmlFor="cadastro-cpf" className={labelBase}>CPF</label>
                      <input id="cadastro-cpf" type="text" inputMode="numeric" autoComplete="off" maxLength={14} placeholder="000.000.000-00" value={cpf} disabled={processando} onChange={e => { setCpf(formatarCPF(e.target.value)); limparErro('cpf'); }} aria-invalid={Boolean(erros.cpf)} aria-describedby={erros.cpf ? 'erro-cpf' : undefined} className={classeCampo('cpf')} />
                      {mostrarErro('cpf')}
                    </div>

                    {/* TELEFONE */}
                    <div>
                      <label htmlFor="cadastro-telefone" className={labelBase}>Telefone</label>
                      <input id="cadastro-telefone" type="tel" autoComplete="tel" placeholder="(11) 99999-9999" value={telefone} disabled={processando} onChange={e => { setTelefone(formatarTelefone(e.target.value)); limparErro('telefone'); }} aria-invalid={Boolean(erros.telefone)} aria-describedby={erros.telefone ? 'erro-telefone' : undefined} className={classeCampo('telefone')} />
                      {mostrarErro('telefone')}
                    </div>

                    {/* E-MAIL */}
                    <div className="sm:col-span-2">
                      <label htmlFor="cadastro-email" className={labelBase}>E-mail</label>
                      <input id="cadastro-email" type="email" autoComplete="email" placeholder="Digite seu e-mail" value={email} disabled={processando} onChange={e => { setEmail(e.target.value); limparErro('email'); }} aria-invalid={Boolean(erros.email)} aria-describedby={erros.email ? 'erro-email' : undefined} className={classeCampo('email')} />
                      {mostrarErro('email')}
                    </div>

                    {/* SENHA */}
                    <div>
                      <label htmlFor="cadastro-senha" className={labelBase}>Senha</label>
                      <div className="relative">
                        <input id="cadastro-senha" type={mostrarSenha ? 'text' : 'password'} autoComplete="new-password" placeholder="Crie uma senha segura" value={senhaCadastro} disabled={processando} onChange={e => { setSenhaCadastro(e.target.value); limparErro('senha'); }} aria-invalid={Boolean(erros.senha)} aria-describedby={erros.senha ? 'requisitos-senha erro-senha' : 'requisitos-senha'} className={classeCampo('senha', 'pr-11')} />

                        <button type="button" onClick={() => setMostrarSenha(!mostrarSenha)} aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'} className="absolute top-1/2 right-3 -translate-y-1/2 text-texto-suave">
                          <span className="material-icons text-[20px]">
                            {mostrarSenha ? 'visibility' : 'visibility_off'}
                          </span>
                        </button>
                      </div>
                      {mostrarErro('senha')}
                    </div>

                    {/* CONFIRMAR SENHA */}
                    <div>
                      <label htmlFor="cadastro-confirmacao" className={labelBase}>Confirmar senha</label>
                      <div className="relative">
                        <input id="cadastro-confirmacao" type={mostrarConfirmacao ? 'text' : 'password'} autoComplete="new-password" placeholder="Repita sua senha" value={confirmarSenha} disabled={processando} onChange={e => { setConfirmarSenha(e.target.value); limparErro('confirmacao'); }} aria-invalid={Boolean(erros.confirmacao)} aria-describedby={erros.confirmacao ? 'erro-confirmacao' : undefined} className={classeCampo('confirmacao', 'pr-11')} />

                        <button type="button" onClick={() => setMostrarConfirmacao(!mostrarConfirmacao)} aria-label={mostrarConfirmacao ? 'Ocultar senha' : 'Mostrar senha'} className="absolute top-1/2 right-3 -translate-y-1/2 text-texto-suave">
                          <span className="material-icons text-[20px]">
                            {mostrarConfirmacao ? 'visibility' : 'visibility_off'}
                          </span>
                        </button>
                      </div>
                      {mostrarErro('confirmacao')}
                    </div>

                    {/* REQUISITOS DA SENHA */}
                    <div id="requisitos-senha" className="sm:col-span-2 rounded-lg border border-[#e5cdbb] bg-[#f9eee5]/80 px-3 py-2">
                      <p className="mb-2 font-corpo text-xs font-semibold text-primaria">
                        Sua senha deve conter:
                      </p>

                      <div className="grid grid-cols-1 gap-x-3 gap-y-1 sm:grid-cols-2">
                        {listaRequisitos.map(requisito => (
                          <div key={requisito.texto} className={`flex items-center gap-1.5 font-corpo text-xs ${requisito.valido ? 'text-green-700' : 'text-texto-suave'}`}>
                            <span className="material-icons text-[15px]" aria-hidden="true">
                              {requisito.valido ? 'check_circle' : 'radio_button_unchecked'}
                            </span>
                            <span>{requisito.texto}</span>
                          </div>
                        ))}
                      </div>

                      {senhaCadastro.length > 0 && (
                        <p className={`mt-2 font-corpo text-xs font-semibold ${senhaValida ? 'text-green-700' : 'text-primaria'}`}>
                          {senhaValida
                            ? 'Sua senha atende a todos os requisitos.'
                            : 'Complete os requisitos para continuar.'}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* TERMOS DE USO */}
                  <label className="mt-2 flex items-start gap-2 text-left font-corpo text-xs text-texto">
                    <input type="checkbox" checked={aceitouTermos} disabled={processando} onChange={e => { setAceitouTermos(e.target.checked); limparErro('termos'); }} className="mt-0.5 h-4 w-4 shrink-0 accent-primaria" />
                    Li e concordo com os Termos de Uso e a Política de Privacidade.
                  </label>
                  {mostrarErro('termos')}

                  {/* BOTÃO CADASTRAR */}
                  <div className="mt-3">
                    <fieldset disabled={processando}>
                      <Botao texto={processando ? 'Cadastrando...' : 'Criar conta →'} tipo="submit" variante="primario" larguraTotal />
                    </fieldset>
                  </div>

                  <p className="mt-2 font-corpo text-sm text-texto">
                    Já possui uma conta?{' '}
                    <button type="button" onClick={() => trocarAba('entrar')} className="font-semibold text-primaria underline">
                      Entrar
                    </button>
                  </p>
                </form>
              )}

              {/* MENSAGENS DE SUCESSO E ERRO */}
              {mensagem && (
                <div role={tipoMensagem === 'erro' ? 'alert' : 'status'} aria-live="polite" className={`mt-3 rounded-lg border p-3 text-center font-corpo text-sm ${classesMensagem[tipoMensagem]}`}>
                  {mensagem}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}