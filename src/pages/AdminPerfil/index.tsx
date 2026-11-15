import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

type Administrador = {
    nome: string;
    email: string;
    instituicao: string;
    cargo: string;
};

const CHAVE_SESSAO = 'polieus_admin_sessao';

function Icone({
    nome,
    tamanho = 'text-2xl',
}: {
    nome: string;
    tamanho?: string;
}) {
    return (
        <span
            className={`material-icons inline-flex shrink-0 items-center justify-center leading-none ${tamanho}`}
            aria-hidden="true"
        >
            {nome}
        </span>
    );
}

function lerDados<T>(chave: string): T | null {
    try {
        const conteudo = localStorage.getItem(chave);
        return conteudo ? JSON.parse(conteudo) as T : null;
    } catch {
        return null;
    }
}

function CampoInformacao({
    titulo,
    valor,
}: {
    titulo: string;
    valor?: string;
}) {
    return (
        <div className="grid gap-1 border-b border-[#ead8c9] py-4 last:border-b-0 sm:grid-cols-[170px_minmax(0,1fr)] sm:items-center">
            <span className="text-sm font-semibold text-texto">
                {titulo}
            </span>

            <span className="min-w-0 wrap-break-word text-sm text-texto-suave">
                {valor?.trim() || 'Não informado'}
            </span>
        </div>
    );
}

export default function AdminPerfil() {
    const navigate = useNavigate();

    const [administrador, setAdministrador] = useState<Administrador | null>(
        () => lerDados<Administrador>(CHAVE_SESSAO)
    );

    const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);

    useEffect(() => {
        const atualizar = () => {
            setAdministrador(lerDados<Administrador>(CHAVE_SESSAO));
        };

        window.addEventListener('storage', atualizar);

        return () => {
            window.removeEventListener('storage', atualizar);
        };
    }, []);

    const iniciais = useMemo(() => {
        if (!administrador?.nome) return '';

        return administrador.nome
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map((parte) => parte.charAt(0).toUpperCase())
            .join('');
    }, [administrador]);

    function sairDaConta() {
        localStorage.removeItem(CHAVE_SESSAO);
        setAdministrador(null);
        setMostrarConfirmacao(false);
        navigate('/');
    }

    return (
        <main className="min-h-screen w-full min-w-0 bg-fundo px-4 py-8 font-corpo text-texto sm:px-7 lg:px-10">
            <div className="mx-auto max-w-7xl">

                {/* CABEÇALHO */}
                <header className="mb-8">
                    <div className="mb-4 flex items-center gap-2 text-sm text-texto-suave">
                        <Link
                            to="/admin/dashboard"
                            className="transition-colors hover:text-primaria"
                        >
                            Dashboard
                        </Link>

                        <Icone nome="chevron_right" tamanho="text-base" />

                        <span className="font-semibold text-primaria">
                            Meu Perfil
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="h-10 w-1.5 rounded-full bg-primaria" />

                        <div>
                            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-primaria">
                                Área Administrativa
                            </p>

                            <h1 className="font-titulo text-3xl font-bold text-primaria sm:text-4xl">
                                Meu Perfil
                            </h1>

                            <p className="mt-2 text-sm text-texto-suave sm:text-base">
                                Gerencie suas informações institucionais e os dados de acesso.
                            </p>
                        </div>
                    </div>
                </header>

                {/* PERFIL E INFORMAÇÕES */}
                <div className="grid items-stretch gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">

                    <section className="flex flex-col items-center justify-center rounded-2xl border border-[#e3c5af] bg-[#fffaf5] px-6 py-10 text-center shadow-sm">
                        <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-[#e9cdbb] bg-[#76241e] text-white shadow-md">
                            {iniciais ? (
                                <span className="font-titulo text-4xl font-bold">
                                    {iniciais}
                                </span>
                            ) : (
                                <Icone nome="admin_panel_settings" tamanho="text-6xl" />
                            )}
                        </div>

                        <h2 className="mt-6 max-w-full wrap-break-word font-titulo text-xl font-bold text-primaria">
                            {administrador?.nome || 'Administrador'}
                        </h2>

                        <p className="mt-2 max-w-full wrap-break-word text-sm text-texto-suave">
                            {administrador?.email || 'E-mail institucional não disponível'}
                        </p>

                        <div className="my-6 h-px w-full bg-[#ead8c9]" />

                        <div className="flex items-center gap-2 rounded-full bg-[#f0dfd0] px-4 py-2 text-sm font-semibold text-primaria">
                            <Icone nome="admin_panel_settings" tamanho="text-lg" />
                            Perfil Administrativo
                        </div>

                        {administrador?.instituicao && (
                            <div className="mt-5 flex items-center justify-center gap-2 text-sm text-texto-suave">
                                <Icone nome="account_balance" tamanho="text-xl" />

                                <span className="wrap-break-word">
                                    {administrador.instituicao}
                                </span>
                            </div>
                        )}

                        {administrador?.cargo && (
                            <p className="mt-2 text-sm text-texto-suave">
                                {administrador.cargo}
                            </p>
                        )}

                        <p className="mt-6 text-sm leading-7 text-texto-suave">
                            Acompanhe as demandas urbanas, gerencie ocorrências e contribua para uma gestão pública mais transparente.
                        </p>
                    </section>

                    <section className="min-w-0 rounded-2xl border border-[#e3c5af] bg-[#fffaf5] p-6 shadow-sm sm:p-8">
                        <div className="mb-5 flex items-center gap-3 border-b border-[#ead8c9] pb-5">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f0dfd0] text-primaria">
                                <Icone nome="badge" />
                            </div>

                            <div>
                                <h2 className="font-titulo text-xl font-bold text-primaria">
                                    Informações Institucionais
                                </h2>

                                <p className="mt-1 text-xs text-texto-suave">
                                    Dados associados ao cadastro administrativo.
                                </p>
                            </div>
                        </div>

                        <CampoInformacao
                            titulo="Nome completo"
                            valor={administrador?.nome}
                        />

                        <CampoInformacao
                            titulo="E-mail institucional"
                            valor={administrador?.email}
                        />

                        <CampoInformacao
                            titulo="Instituição / Órgão"
                            valor={administrador?.instituicao}
                        />

                        <CampoInformacao
                            titulo="Cargo / Função"
                            valor={administrador?.cargo}
                        />

                        <CampoInformacao
                            titulo="Tipo de perfil"
                            valor="Administrador"
                        />

                        <div className="mt-6 flex items-start gap-3 rounded-xl bg-[#f4e8dd] p-4">
                            <Icone nome="info" tamanho="text-xl text-primaria" />

                            <p className="text-xs leading-6 text-texto-suave">
                                Os dados apresentados são obtidos da sessão administrativa local, quando disponível. Após a integração com a API Java, poderão ser carregados diretamente da conta autenticada.
                            </p>
                        </div>
                    </section>
                </div>

                {/* ACESSO E SEGURANÇA */}
                <div className="mt-6 grid items-stretch gap-6 lg:grid-cols-2">

                    <section className="rounded-2xl border border-[#e3c5af] bg-[#fffaf5] p-6 shadow-sm sm:p-8">
                        <div className="mb-5 flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f0dfd0] text-primaria">
                                <Icone nome="verified_user" />
                            </div>

                            <div>
                                <h2 className="font-titulo text-lg font-bold text-primaria">
                                    Acesso Institucional
                                </h2>

                                <p className="mt-1 text-xs text-texto-suave">
                                    Informações do perfil administrativo.
                                </p>
                            </div>
                        </div>

                        <div className="rounded-xl bg-[#f4e8dd] p-5">
                            <div className="flex items-start gap-3">
                                <Icone nome="account_balance" tamanho="text-2xl text-primaria" />

                                <div className="min-w-0">
                                    <h3 className="text-sm font-semibold text-texto">
                                        Instituição vinculada
                                    </h3>

                                    <p className="mt-2 wrap-break-word text-sm text-texto-suave">
                                        {administrador?.instituicao || 'Não informada'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 rounded-xl bg-[#f4e8dd] p-5">
                            <div className="flex items-start gap-3">
                                <Icone nome="work" tamanho="text-2xl text-primaria" />

                                <div className="min-w-0">
                                    <h3 className="text-sm font-semibold text-texto">
                                        Função institucional
                                    </h3>

                                    <p className="mt-2 wrap-break-word text-sm text-texto-suave">
                                        {administrador?.cargo || 'Não informada'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <p className="mt-5 text-xs leading-6 text-texto-suave">
                            O acesso administrativo deverá ser validado pelo sistema de autenticação e pelas permissões definidas na API Java.
                        </p>
                    </section>

                    <section className="rounded-2xl border border-[#e3c5af] bg-[#fffaf5] p-6 shadow-sm sm:p-8">
                        <div className="mb-5 flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f0dfd0] text-primaria">
                                <Icone nome="shield" />
                            </div>

                            <div>
                                <h2 className="font-titulo text-lg font-bold text-primaria">
                                    Segurança da Conta
                                </h2>

                                <p className="mt-1 text-xs text-texto-suave">
                                    Opções de segurança do perfil.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <button
                                type="button"
                                disabled
                                title="Disponível após integração com a autenticação"
                                className="flex w-full cursor-not-allowed items-center justify-between rounded-xl border border-[#e3c5af] bg-[#f4e8dd] p-4 text-left opacity-60"
                            >
                                <span className="flex items-center gap-3">
                                    <Icone nome="lock_reset" tamanho="text-2xl text-primaria" />

                                    <span>
                                        <strong className="block text-sm text-primaria">
                                            Alterar Senha
                                        </strong>

                                        <span className="mt-1 block text-xs text-texto-suave">
                                            Atualize sua senha de acesso.
                                        </span>
                                    </span>
                                </span>

                                <Icone nome="chevron_right" tamanho="text-xl text-primaria" />
                            </button>

                            <button
                                type="button"
                                disabled
                                title="Disponível após integração com a autenticação"
                                className="flex w-full cursor-not-allowed items-center justify-between rounded-xl border border-[#e3c5af] bg-[#f4e8dd] p-4 text-left opacity-60"
                            >
                                <span className="flex items-center gap-3">
                                    <Icone nome="security" tamanho="text-2xl text-primaria" />

                                    <span>
                                        <strong className="block text-sm text-primaria">
                                            Autenticação
                                        </strong>

                                        <span className="mt-1 block text-xs text-texto-suave">
                                            Gerencie a proteção da sua conta.
                                        </span>
                                    </span>
                                </span>

                                <Icone nome="chevron_right" tamanho="text-xl text-primaria" />
                            </button>

                            <button
                                type="button"
                                onClick={() => setMostrarConfirmacao(true)}
                                className="flex w-full items-center justify-between rounded-xl bg-primaria p-4 text-left transition-colors hover:bg-primaria-hover"
                                style={{ color: '#ffffff' }}
                            >
                                <span className="flex items-center gap-3">
                                    <Icone nome="logout" tamanho="text-2xl" />

                                    <span>
                                        <strong className="block text-sm">
                                            Sair da Conta
                                        </strong>

                                        <span className="mt-1 block text-xs">
                                            Encerrar a sessão administrativa local.
                                        </span>
                                    </span>
                                </span>

                                <Icone nome="chevron_right" tamanho="text-xl" />
                            </button>
                        </div>
                    </section>
                </div>

                {/* RODAPÉ INTERNO */}
                <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-[#e3c5af] pt-6 text-xs text-texto-suave sm:flex-row">
                    <p>Polieus — Tecnologia a serviço da cidadania.</p>

                    <Link
                        to="/admin/contato"
                        className="inline-flex items-center gap-2 font-semibold text-primaria hover:underline"
                    >
                        Precisa de ajuda?
                        <Icone nome="arrow_forward" tamanho="text-base" />
                    </Link>
                </div>
            </div>

            {/* CONFIRMAÇÃO DE SAÍDA */}
            {mostrarConfirmacao && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="titulo-sair-admin"
                        className="w-full max-w-md rounded-2xl border border-[#e3c5af] bg-[#fffaf5] p-7 text-center shadow-xl"
                    >
                        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#f0dfd0] text-primaria">
                            <Icone nome="logout" tamanho="text-3xl" />
                        </div>

                        <h2
                            id="titulo-sair-admin"
                            className="font-titulo text-xl font-bold text-primaria"
                        >
                            Sair da Conta
                        </h2>

                        <p className="mt-4 text-sm leading-7 text-texto-suave">
                            Deseja realmente sair da área administrativa do Polieus?
                        </p>

                        <div className="mt-7 flex flex-wrap justify-center gap-3">
                            <button
                                type="button"
                                onClick={() => setMostrarConfirmacao(false)}
                                className="rounded-xl border border-[#d8b29c] px-6 py-3 text-sm font-bold text-primaria transition-colors hover:bg-[#f0dfd0]"
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                onClick={sairDaConta}
                                className="rounded-xl bg-primaria px-6 py-3 text-sm font-bold transition-colors hover:bg-primaria-hover"
                                style={{ color: '#ffffff' }}
                            >
                                Confirmar Saída
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
