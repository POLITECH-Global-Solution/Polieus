import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { buscarUsuarioPorId } from '../../services/usuarioService';

type Usuario = {
    nomeUsuario: string;
    cpf: string;
    email: string;
    telefone: string;
};

type UsuarioSessao = {
    idUsuario: number;
    nomeUsuario: string;
    email: string;
};

type IconeProps = {
    nome: string;
    tamanho?: string;
};

function Icone({ nome, tamanho = 'text-2xl' }: IconeProps) {
    return (
        <span className={`material-icons inline-flex shrink-0 items-center justify-center leading-none ${tamanho}`} aria-hidden="true">
            {nome}
        </span>
    );
}

function obterUsuarioSessao(): UsuarioSessao | null {
    try {
        const dados = sessionStorage.getItem('usuario');

        if (!dados) return null;

        const usuario = JSON.parse(dados) as UsuarioSessao;

        if (!usuario || !Number.isInteger(usuario.idUsuario) || usuario.idUsuario <= 0) {
            return null;
        }

        return usuario;
    } catch {
        return null;
    }
}

function formatarCPF(cpf: string): string {
    const numeros = cpf.replace(/\D/g, '');

    if (numeros.length !== 11) return cpf;

    return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

function formatarTelefone(telefone: string): string {
    const numeros = telefone.replace(/\D/g, '');

    if (numeros.length === 11) {
        return numeros.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }

    if (numeros.length === 10) {
        return numeros.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }

    return telefone;
}

function CampoInformacao({ titulo, valor }: { titulo: string; valor?: string }) {
    return (
        <div className="grid gap-1 border-b border-[#ead8c9] py-4 last:border-b-0 sm:grid-cols-[150px_minmax(0,1fr)] sm:items-center">
            <span className="text-sm font-semibold text-texto">
                {titulo}
            </span>

            <span className="min-w-0 wrap-break-word text-sm text-texto-suave">
                {valor || 'Não informado'}
            </span>
        </div>
    );
}

export default function Perfil() {
    const navigate = useNavigate();
    const inputFoto = useRef<HTMLInputElement>(null);

    const [sessao] = useState(obterUsuarioSessao);
    const [usuario, setUsuario] = useState<Usuario | null>(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');
    const [fotoPerfil, setFotoPerfil] = useState('');
    const [mensagemFoto, setMensagemFoto] = useState('');
    const [erroFoto, setErroFoto] = useState(false);
    const [processandoFoto, setProcessandoFoto] = useState(false);
    const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);

    const chaveFoto = sessao
        ? `polieus_foto_perfil_${sessao.idUsuario}`
        : '';

    // CARREGAR DADOS DO USUÁRIO
    useEffect(() => {
        if (!sessao) {
            navigate('/login-usuario', { replace: true });
            return;
        }

        let ativo = true;

        async function carregarUsuario(id: number) {
            try {
                const dados = await buscarUsuarioPorId(id);

                if (!dados || dados.idUsuario !== id) {
                    throw new Error('Usuário não encontrado.');
                }

                if (ativo) {
                    setUsuario({
                        nomeUsuario: dados.nomeUsuario,
                        cpf: dados.cpf,
                        email: dados.email,
                        telefone: dados.telefone,
                    });
                }
            } catch {
                if (ativo) {
                    setErro('Não foi possível carregar suas informações. Tente novamente.');
                }
            } finally {
                if (ativo) setCarregando(false);
            }
        }

        void carregarUsuario(sessao.idUsuario);

        return () => {
            ativo = false;
        };
    }, [sessao, navigate]);

    // CARREGAR FOTO DE PERFIL
    useEffect(() => {
        if (!chaveFoto) return;

        try {
            setFotoPerfil(localStorage.getItem(chaveFoto) || '');
        } catch {
            setFotoPerfil('');
        }
    }, [chaveFoto]);

    const nomeExibicao = usuario?.nomeUsuario || sessao?.nomeUsuario || 'Meu Perfil';
    const emailExibicao = usuario?.email || sessao?.email || '';

    const iniciais = nomeExibicao
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(parte => parte.charAt(0).toUpperCase())
        .join('');

    // ABRIR SELETOR DE IMAGEM
    function selecionarFoto() {
        inputFoto.current?.click();
    }

    // ALTERAR FOTO DE PERFIL
    async function alterarFoto(evento: ChangeEvent<HTMLInputElement>) {
        const arquivo = evento.target.files?.[0];

        evento.target.value = '';

        if (!arquivo || !chaveFoto || processandoFoto) return;

        setMensagemFoto('');
        setErroFoto(false);

        const formatosPermitidos = [
            'image/jpeg',
            'image/png',
            'image/webp',
        ];

        if (!formatosPermitidos.includes(arquivo.type)) {
            setErroFoto(true);
            setMensagemFoto('Selecione uma imagem JPG, PNG ou WEBP.');
            return;
        }

        if (arquivo.size > 5 * 1024 * 1024) {
            setErroFoto(true);
            setMensagemFoto('A imagem deve ter no máximo 5 MB.');
            return;
        }

        setProcessandoFoto(true);

        try {
            const imagem = await createImageBitmap(arquivo);

            const canvas = document.createElement('canvas');
            const tamanho = 400;

            canvas.width = tamanho;
            canvas.height = tamanho;

            const contexto = canvas.getContext('2d');

            if (!contexto) {
                imagem.close();
                throw new Error('Não foi possível processar a imagem.');
            }

            const recorte = Math.min(imagem.width, imagem.height);
            const x = (imagem.width - recorte) / 2;
            const y = (imagem.height - recorte) / 2;

            contexto.fillStyle = '#ffffff';
            contexto.fillRect(0, 0, tamanho, tamanho);

            contexto.drawImage(
                imagem,
                x,
                y,
                recorte,
                recorte,
                0,
                0,
                tamanho,
                tamanho
            );

            imagem.close();

            const foto = canvas.toDataURL('image/jpeg', 0.85);

            localStorage.setItem(chaveFoto, foto);
            setFotoPerfil(foto);
            setMensagemFoto('Foto de perfil atualizada!');
        } catch {
            setErroFoto(true);
            setMensagemFoto('Não foi possível salvar a foto de perfil.');
        } finally {
            setProcessandoFoto(false);
        }
    }

    // REMOVER FOTO DE PERFIL
    function removerFoto() {
        if (!chaveFoto || processandoFoto) return;

        try {
            localStorage.removeItem(chaveFoto);
            setFotoPerfil('');
            setErroFoto(false);
            setMensagemFoto('Foto de perfil removida.');
        } catch {
            setErroFoto(true);
            setMensagemFoto('Não foi possível remover a foto.');
        }
    }

    // ENCERRAR SESSÃO LOCAL
    function sairDaConta() {
        sessionStorage.removeItem('usuario');

        setMostrarConfirmacao(false);
        setUsuario(null);
        setFotoPerfil('');

        navigate('/', { replace: true });
    }

    if (!sessao) return null;

    return (
        <main className="min-h-screen w-full min-w-0 bg-fundo px-4 py-8 font-corpo text-texto sm:px-7 lg:px-10">

            <div className="mx-auto max-w-7xl">

                {/* CABEÇALHO */}
                <header className="mb-8">

                    <div className="mb-4 flex items-center gap-2 text-sm text-texto-suave">

                        <Link to="/inicio" className="transition-colors hover:text-primaria">
                            Início
                        </Link>

                        <Icone nome="chevron_right" tamanho="text-base" />

                        <span className="font-semibold text-primaria">
                            Meu Perfil
                        </span>

                    </div>

                    <div className="flex items-center gap-3">

                        <span className="h-10 w-1.5 rounded-full bg-primaria" />

                        <div>
                            <h1 className="font-titulo text-3xl font-bold text-primaria sm:text-4xl">
                                Meu Perfil
                            </h1>

                            <p className="mt-2 text-sm text-texto-suave sm:text-base">
                                Gerencie suas informações pessoais e acompanhe sua participação.
                            </p>
                        </div>

                    </div>

                </header>

                {/* MENSAGENS DA API */}
                {erro && (
                    <div role="alert" className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        <Icone nome="error_outline" tamanho="text-xl" />
                        {erro}
                    </div>
                )}

                {/* CONTEÚDO PRINCIPAL */}
                <div className="grid items-stretch gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">

                    {/* CARTÃO DO USUÁRIO */}
                    <section className="flex flex-col items-center justify-center rounded-2xl border border-[#e3c5af] bg-[#fffaf5] px-6 py-10 text-center shadow-sm">

                        {/* FOTO DE PERFIL */}
                        <div className="relative">

                            <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-[#e9cdbb] bg-[#76241e] text-white shadow-md">

                                {fotoPerfil ? (
                                    <img src={fotoPerfil} alt="Foto de perfil do usuário" className="h-full w-full object-cover" />
                                ) : iniciais ? (
                                    <span className="font-titulo text-4xl font-bold">
                                        {iniciais}
                                    </span>
                                ) : (
                                    <Icone nome="person" tamanho="text-7xl" />
                                )}

                            </div>

                            <button type="button" onClick={selecionarFoto} disabled={processandoFoto} aria-label="Alterar foto de perfil" title="Alterar foto de perfil" className="absolute right-0 bottom-0 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-4 border-[#fffaf5] bg-primaria text-white shadow-md transition-colors hover:bg-primaria-hover disabled:opacity-60">
                                <Icone nome="photo_camera" tamanho="text-xl" />
                            </button>

                            <input ref={inputFoto} type="file" accept="image/jpeg,image/png,image/webp" onChange={alterarFoto} className="hidden" aria-label="Selecionar foto de perfil" />

                        </div>

                        <h2 className="mt-6 max-w-full wrap-break-word font-titulo text-xl font-bold text-primaria">
                            {nomeExibicao}
                        </h2>

                        <p className="mt-2 max-w-full wrap-break-word text-sm text-texto-suave">
                            {emailExibicao || 'E-mail não disponível'}
                        </p>

                        {/* OPÇÕES DA FOTO */}
                        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">

                            <button type="button" onClick={selecionarFoto} disabled={processandoFoto} className="inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-primaria hover:underline disabled:opacity-60">
                                <Icone nome="edit" tamanho="text-base" />
                                {processandoFoto ? 'Salvando...' : 'Alterar foto'}
                            </button>

                            {fotoPerfil && (
                                <button type="button" onClick={removerFoto} disabled={processandoFoto} className="inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-red-700 hover:underline disabled:opacity-60">
                                    <Icone nome="delete_outline" tamanho="text-base" />
                                    Remover
                                </button>
                            )}

                        </div>

                        {mensagemFoto && (
                            <p role={erroFoto ? 'alert' : 'status'} className={`mt-3 text-xs font-medium ${erroFoto ? 'text-red-700' : 'text-green-700'}`}>
                                {mensagemFoto}
                            </p>
                        )}

                        <div className="my-6 h-px w-full bg-[#ead8c9]" />

                        <div className="flex items-center gap-2 rounded-full bg-[#f0dfd0] px-4 py-2 text-sm font-semibold text-primaria">
                            <Icone nome="verified_user" tamanho="text-lg" />
                            Perfil do Cidadão
                        </div>

                        <p className="mt-6 text-sm leading-7 text-texto-suave">
                            Gerencie suas informações pessoais e acompanhe suas contribuições para a cidade através da plataforma Polieus.
                        </p>

                    </section>

                    {/* INFORMAÇÕES PESSOAIS */}
                    <section className="min-w-0 rounded-2xl border border-[#e3c5af] bg-[#fffaf5] p-6 shadow-sm sm:p-8">

                        <div className="mb-5 flex items-center gap-3 border-b border-[#ead8c9] pb-5">

                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f0dfd0] text-primaria">
                                <Icone nome="badge" />
                            </div>

                            <div>
                                <h2 className="font-titulo text-xl font-bold text-primaria">
                                    Informações Pessoais
                                </h2>

                                <p className="mt-1 text-xs text-texto-suave">
                                    Dados associados à sua conta.
                                </p>
                            </div>

                        </div>

                        {carregando ? (
                            <div role="status" className="flex min-h-56 flex-col items-center justify-center gap-3">

                                <span className="h-8 w-8 animate-spin rounded-full border-4 border-[#ead8c9] border-t-primaria" />

                                <p className="text-sm text-texto-suave">
                                    Carregando suas informações...
                                </p>

                            </div>
                        ) : (
                            <div>

                                <CampoInformacao titulo="Nome completo" valor={usuario?.nomeUsuario || sessao.nomeUsuario} />

                                <CampoInformacao titulo="CPF" valor={usuario?.cpf ? formatarCPF(usuario.cpf) : undefined} />

                                <CampoInformacao titulo="E-mail" valor={emailExibicao} />

                                <CampoInformacao titulo="Telefone" valor={usuario?.telefone ? formatarTelefone(usuario.telefone) : undefined} />

                            </div>
                        )}

                        <div className="mt-6 flex items-start gap-3 rounded-xl bg-[#f4e8dd] p-4">

                            <span className="mt-0.5 text-primaria">
                                <Icone nome="info" tamanho="text-xl" />
                            </span>

                            <p className="text-xs leading-6 text-texto-suave">
                                As informações pessoais são carregadas a partir dos dados cadastrados na sua conta Polieus.
                            </p>

                        </div>

                    </section>

                </div>

                {/* HISTÓRICO DE PARTICIPAÇÃO */}
                <section className="mt-6 rounded-2xl border border-[#e3c5af] bg-[#fffaf5] p-6 shadow-sm sm:p-8">

                    <div className="mb-6 flex items-center gap-3">

                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#f0dfd0] text-primaria">
                            <Icone nome="assignment" />
                        </div>

                        <div>
                            <h2 className="font-titulo text-xl font-bold text-primaria">
                                Histórico de Participação
                            </h2>

                            <p className="mt-1 text-xs text-texto-suave">
                                Sua atividade na plataforma.
                            </p>
                        </div>

                    </div>

                    <div className="grid items-center gap-6 md:grid-cols-[280px_minmax(0,1fr)]">

                        <div className="rounded-xl bg-[#f4e8dd] px-6 py-6">

                            <p className="font-titulo text-4xl font-bold text-primaria">
                                —
                            </p>

                            <p className="mt-2 text-sm text-texto-suave">
                                Ocorrências registradas
                            </p>

                        </div>

                        <div>

                            <p className="text-sm leading-7 text-texto-suave">
                                Acompanhe as solicitações realizadas e consulte o histórico das suas contribuições para a cidade.
                            </p>

                            <Link to="/minhas-ocorrencias" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primaria transition-colors hover:text-primaria-hover">
                                Ver minhas ocorrências
                                <Icone nome="arrow_forward" tamanho="text-lg" />
                            </Link>

                        </div>

                    </div>

                </section>

                {/* SEGURANÇA DA CONTA */}
                <section className="mt-6 rounded-2xl border border-[#e3c5af] bg-[#fffaf5] p-6 shadow-sm sm:p-8">

                    <div className="flex flex-wrap items-center justify-between gap-4">

                        <div className="flex items-center gap-3">

                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#f0dfd0] text-primaria">
                                <Icone nome="shield" />
                            </div>

                            <div>
                                <h2 className="font-titulo text-lg font-bold text-primaria">
                                    Segurança da Conta
                                </h2>

                                <p className="mt-1 text-xs text-texto-suave">
                                    Encerre sua sessão no Polieus.
                                </p>
                            </div>

                        </div>

                        <button type="button" onClick={() => setMostrarConfirmacao(true)} className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-primaria px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-primaria-hover" style={{ color: '#ffffff' }}>
                            <Icone nome="logout" tamanho="text-xl" />
                            Sair da Conta
                        </button>

                    </div>

                </section>

                {/* RODAPÉ INTERNO */}
                <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-[#e3c5af] pt-6 text-xs text-texto-suave sm:flex-row">

                    <p>
                        Polieus — Tecnologia a serviço da cidadania.
                    </p>

                    <Link to="/contato" className="inline-flex items-center gap-2 font-semibold text-primaria hover:underline">
                        Precisa de ajuda?
                        <Icone nome="arrow_forward" tamanho="text-base" />
                    </Link>

                </div>

            </div>

            {/* CONFIRMAÇÃO DE SAÍDA */}
            {mostrarConfirmacao && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">

                    <div role="dialog" aria-modal="true" aria-labelledby="titulo-sair" className="w-full max-w-md rounded-2xl border border-[#e3c5af] bg-[#fffaf5] p-7 text-center shadow-xl">

                        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#f0dfd0] text-primaria">
                            <Icone nome="logout" tamanho="text-3xl" />
                        </div>

                        <h2 id="titulo-sair" className="font-titulo text-xl font-bold text-primaria">
                            Sair da Conta
                        </h2>

                        <p className="mt-4 text-sm leading-7 text-texto-suave">
                            Deseja realmente sair da sua conta no Polieus?
                        </p>

                        <div className="mt-7 flex flex-wrap justify-center gap-3">

                            <button type="button" onClick={() => setMostrarConfirmacao(false)} className="cursor-pointer rounded-xl border border-[#d8b29c] px-6 py-3 text-sm font-bold text-primaria transition-colors hover:bg-[#f0dfd0]">
                                Cancelar
                            </button>

                            <button type="button" onClick={sairDaConta} className="cursor-pointer rounded-xl bg-primaria px-6 py-3 text-sm font-bold transition-colors hover:bg-primaria-hover" style={{ color: '#ffffff' }}>
                                Confirmar Saída
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </main>
    );
}