import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import {
    type Administrador,
    obterAdministradorLogado,
    buscarAdministradorPorId,
    salvarSessaoAdministrador,
    logoutAdministrador,
} from '../../services/administrativoService';

// COMPONENTES AUXILIARES

function Icone({ nome, tamanho = 'text-2xl' }: {
    nome: string;
    tamanho?: string;
}) {

    return (
        <span className={`material-icons inline-flex shrink-0 items-center justify-center leading-none ${tamanho}`} aria-hidden="true">
            {nome}
        </span>
    );
}

function CampoInformacao({ titulo, valor }: {
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

// PÁGINA PRINCIPAL

export default function AdminPerfil() {

    const navigate = useNavigate();

    const [administrador, setAdministrador] = useState<Administrador | null>(
        () => obterAdministradorLogado()
    );

    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');
    const [atualizacao, setAtualizacao] = useState(0);

    const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);

    // INTEGRAÇÃO COM A API JAVA

    useEffect(() => {

        let ativo = true;

        async function carregarAdministrador() {

            const sessao = obterAdministradorLogado();

            if (!sessao) {

                navigate('/login-admin', {
                    replace: true,
                });

                return;
            }

            setCarregando(true);
            setErro('');

            try {

                const dados = await buscarAdministradorPorId(sessao.idAdmin);

                if (!ativo) return;

                if (dados.idAdmin !== sessao.idAdmin) {
                    throw new Error('Identificação administrativa incompatível.');
                }

                setAdministrador(dados);

                salvarSessaoAdministrador(dados);

            } catch (erro) {

                if (!ativo) return;

                console.error(
                    'Erro ao consultar perfil administrativo:',
                    erro
                );

                setErro(
                    'Não foi possível consultar os dados atualizados da conta administrativa.'
                );

            } finally {

                if (ativo) {
                    setCarregando(false);
                }
            }
        }

        void carregarAdministrador();

        return () => {
            ativo = false;
        };

    }, [navigate, atualizacao]);

    // INICIAIS DO ADMINISTRADOR

    const iniciais = useMemo(() => {

        if (!administrador?.nomeAdmin) return '';

        return administrador.nomeAdmin
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map(parte => parte.charAt(0).toUpperCase())
            .join('');

    }, [administrador]);

    // ATUALIZAR PERFIL

    function atualizarPerfil() {

        if (carregando) return;

        setAtualizacao(valor => valor + 1);
    }

    // ENCERRAR SESSÃO

    function sairDaConta() {

        logoutAdministrador();

        setAdministrador(null);
        setMostrarConfirmacao(false);

        navigate('/', {
            replace: true,
        });
    }

    return (

        <main className="min-h-screen w-full min-w-0 bg-fundo px-4 py-8 font-corpo text-texto sm:px-7 lg:px-10">

            <div className="mx-auto max-w-7xl">

                {/* CABEÇALHO */}

                <header className="mb-8">

                    <div className="mb-4 flex items-center gap-2 text-sm text-texto-suave">

                        <Link to="/admin/dashboard" className="transition-colors hover:text-primaria">
                            Dashboard
                        </Link>

                        <Icone nome="chevron_right" tamanho="text-base" />

                        <span className="font-semibold text-primaria">
                            Meu Perfil
                        </span>

                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4">

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
                                    Consulte suas informações institucionais e os dados de acesso.
                                </p>

                            </div>

                        </div>

                        <button type="button" onClick={atualizarPerfil} disabled={carregando} className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-primaria px-4 py-2.5 text-sm font-semibold text-primaria transition-colors hover:bg-primaria/5 disabled:cursor-not-allowed disabled:opacity-50">

                            <Icone nome="refresh" tamanho={`text-lg ${carregando ? 'animate-spin' : ''}`} />

                            {carregando ? 'Atualizando...' : 'Atualizar Perfil'}

                        </button>

                    </div>

                </header>

                {/* CARREGAMENTO */}

                {carregando && (

                    <div role="status" className="mb-6 flex items-center gap-3 rounded-xl border border-[#e3c5af] bg-[#fffaf5] p-4">

                        <div className="h-6 w-6 shrink-0 animate-spin rounded-full border-3 border-[#e3c5af] border-t-primaria" />

                        <p className="text-sm text-texto-suave">
                            Consultando os dados da conta administrativa...
                        </p>

                    </div>

                )}

                {/* TRATAMENTO DE ERROS */}

                {erro && (

                    <div role="alert" className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 p-4">

                        <div className="flex items-start gap-3 text-red-700">

                            <Icone nome="error_outline" />

                            <div>

                                <p className="text-sm font-semibold">
                                    {erro}
                                </p>

                                <p className="mt-1 text-xs">
                                    As informações exibidas correspondem à última sessão disponível.
                                </p>

                            </div>

                        </div>

                        <button type="button" onClick={atualizarPerfil} disabled={carregando} className="cursor-pointer rounded-lg bg-primaria px-4 py-2 text-sm font-semibold transition-colors hover:bg-primaria-hover disabled:opacity-50">

                            <span className="text-white">
                                Tentar novamente
                            </span>

                        </button>

                    </div>

                )}

                {/* PERFIL E INFORMAÇÕES */}

                <div className="grid items-stretch gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">

                    {/* CARTÃO DO ADMINISTRADOR */}

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
                            {administrador?.nomeAdmin || 'Administrador'}
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

                    {/* INFORMAÇÕES INSTITUCIONAIS */}

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

                        <CampoInformacao titulo="Nome completo" valor={administrador?.nomeAdmin} />

                        <CampoInformacao titulo="E-mail institucional" valor={administrador?.email} />

                        <CampoInformacao titulo="Instituição / Órgão" valor={administrador?.instituicao} />

                        <CampoInformacao titulo="Cargo / Função" valor={administrador?.cargo} />

                        <CampoInformacao titulo="Tipo de perfil" valor="Administrador" />

                        <CampoInformacao titulo="Identificação administrativa" valor={administrador?.idAdmin.toString()} />

                        <div className="mt-6 flex items-start gap-3 rounded-xl bg-[#f4e8dd] p-4">

                            <Icone nome="info" tamanho="text-xl text-primaria" />

                            <p className="text-xs leading-6 text-texto-suave">

                                {carregando
                                    ? 'As informações da sua conta estão sendo consultadas.'
                                    : erro
                                        ? 'Os dados apresentados correspondem à última sessão administrativa disponível.'
                                        : 'Os dados apresentados são obtidos diretamente do cadastro administrativo na plataforma Polieus.'}

                            </p>

                        </div>

                    </section>

                </div>

                {/* ACESSO E SEGURANÇA */}

                <div className="mt-6 grid items-stretch gap-6 lg:grid-cols-2">

                    {/* ACESSO INSTITUCIONAL */}

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
                            O perfil administrativo é destinado ao acompanhamento de demandas urbanas e à gestão das ocorrências registradas na plataforma.
                        </p>

                    </section>

                    {/* SEGURANÇA DA CONTA */}

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
                                    Informações de acesso e encerramento da sessão.
                                </p>

                            </div>

                        </div>

                        <div className="space-y-4">

                            {/* IDENTIFICAÇÃO DA CONTA */}

                            <div className="flex w-full items-center justify-between rounded-xl border border-[#e3c5af] bg-[#f4e8dd] p-4 text-left">

                                <span className="flex min-w-0 items-center gap-3">

                                    <Icone nome="person" tamanho="text-2xl text-primaria" />

                                    <span className="min-w-0">

                                        <strong className="block text-sm text-primaria">
                                            Conta Administrativa
                                        </strong>

                                        <span className="mt-1 block wrap-break-word text-xs text-texto-suave">
                                            {administrador?.email || 'Conta não identificada'}
                                        </span>

                                    </span>

                                </span>

                            </div>

                            {/* LOGOUT */}

                            <button type="button" onClick={() => setMostrarConfirmacao(true)} className="flex w-full cursor-pointer items-center justify-between rounded-xl bg-primaria p-4 text-left text-white transition-colors hover:bg-primaria-hover">

                                <span className="flex items-center gap-3 text-white">

                                    <Icone nome="logout" tamanho="text-2xl" />

                                    <span>

                                        <strong className="block text-sm">
                                            Sair da Conta
                                        </strong>

                                        <span className="mt-1 block text-xs">
                                            Encerrar a sessão administrativa neste dispositivo.
                                        </span>

                                    </span>

                                </span>

                                <Icone nome="chevron_right" tamanho="text-xl text-white" />

                            </button>

                        </div>

                    </section>

                </div>

                {/* RODAPÉ INTERNO */}

                <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-[#e3c5af] pt-6 text-xs text-texto-suave sm:flex-row">

                    <p>
                        Polieus — Tecnologia a serviço da cidadania.
                    </p>

                    <Link to="/admin/contato" className="inline-flex items-center gap-2 font-semibold text-primaria hover:underline">

                        Precisa de ajuda?

                        <Icone nome="arrow_forward" tamanho="text-base" />

                    </Link>

                </div>

            </div>

            {/* CONFIRMAÇÃO DE SAÍDA */}

            {mostrarConfirmacao && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">

                    <div role="dialog" aria-modal="true" aria-labelledby="titulo-sair-admin" className="w-full max-w-md rounded-2xl border border-[#e3c5af] bg-[#fffaf5] p-7 text-center shadow-xl" onKeyDown={evento => {

                        if (evento.key === 'Escape') {
                            setMostrarConfirmacao(false);
                        }

                    }}>

                        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#f0dfd0] text-primaria">

                            <Icone nome="logout" tamanho="text-3xl" />

                        </div>

                        <h2 id="titulo-sair-admin" className="font-titulo text-xl font-bold text-primaria">
                            Sair da Conta
                        </h2>

                        <p className="mt-4 text-sm leading-7 text-texto-suave">
                            Deseja realmente sair da área administrativa do Polieus?
                        </p>

                        <div className="mt-7 flex flex-wrap justify-center gap-3">

                            <button type="button" autoFocus onClick={() => setMostrarConfirmacao(false)} className="cursor-pointer rounded-xl border border-[#d8b29c] px-6 py-3 text-sm font-bold text-primaria transition-colors hover:bg-[#f0dfd0]">

                                Cancelar

                            </button>

                            <button type="button" onClick={sairDaConta} className="cursor-pointer rounded-xl bg-primaria px-6 py-3 text-sm font-bold transition-colors hover:bg-primaria-hover">

                                <span className="text-white">
                                    Confirmar Saída
                                </span>

                            </button>

                        </div>

                    </div>

                </div>

            )}

        </main>
    );
}