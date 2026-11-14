import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

type Usuario = {
    nome: string;
    cpf: string;
    email: string;
    telefone: string;
    quantidadeOcorrencias: number | null;
    notificacoesEmail: boolean;
};

type IconeProps = {
    nome: string;
    tamanho?: string;
};

function Icone({
    nome,
    tamanho = 'text-2xl',
}: IconeProps) {
    return (
        <span
            className={`material-icons inline-flex shrink-0 items-center justify-center leading-none ${tamanho}`}
            aria-hidden="true"
        >
            {nome}
        </span>
    );
}

function formatarCPF(cpf: string): string {
    const numeros = cpf.replace(/\D/g, '');

    if (numeros.length !== 11) {
        return cpf;
    }

    return numeros.replace(
        /(\d{3})(\d{3})(\d{3})(\d{2})/,
        '$1.$2.$3-$4'
    );
}

function formatarTelefone(telefone: string): string {
    const numeros = telefone.replace(/\D/g, '');

    if (numeros.length === 11) {
        return numeros.replace(
            /(\d{2})(\d{5})(\d{4})/,
            '($1) $2-$3'
        );
    }

    if (numeros.length === 10) {
        return numeros.replace(
            /(\d{2})(\d{4})(\d{4})/,
            '($1) $2-$3'
        );
    }

    return telefone;
}

function CampoInformacao({
    titulo,
    valor,
}: {
    titulo: string;
    valor?: string;
}) {
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

    /*
     * Os dados serão preenchidos futuramente
     * pela API Java do Polieus.
     */
    const [usuario] = useState<Usuario | null>(null);

    const [notificacoesEmail, setNotificacoesEmail] =
        useState<boolean | null>(null);

    const [mostrarConfirmacao, setMostrarConfirmacao] =
        useState(false);

    const nomeExibicao = usuario?.nome || 'Meu Perfil';

    const iniciais = usuario?.nome
        ? usuario.nome
              .trim()
              .split(/\s+/)
              .slice(0, 2)
              .map((parte) => parte.charAt(0).toUpperCase())
              .join('')
        : '';

    function sairDaConta() {
        setMostrarConfirmacao(false);

        /*
         * Integrar posteriormente com a
         * autenticação do projeto.
         */
        navigate('/');
    }

    return (
        <main className="min-h-screen w-full min-w-0 bg-fundo px-4 py-8 font-corpo text-texto sm:px-7 lg:px-10">
            <div className="mx-auto max-w-7xl">
                {/* CABEÇALHO */}
                <header className="mb-8">
                    <div className="mb-4 flex items-center gap-2 text-sm text-texto-suave">
                        <Link
                            to="/inicio"
                            className="transition-colors hover:text-primaria"
                        >
                            Início
                        </Link>

                        <Icone
                            nome="chevron_right"
                            tamanho="text-base"
                        />

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
                                Gerencie suas informações e preferências.
                            </p>
                        </div>
                    </div>
                </header>

                {/* CONTEÚDO PRINCIPAL */}
                <div className="grid items-stretch gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
                    {/* CARTÃO DO USUÁRIO */}
                    <section className="flex flex-col items-center justify-center rounded-2xl border border-[#e3c5af] bg-[#fffaf5] px-6 py-10 text-center shadow-sm">
                        <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-[#e9cdbb] bg-[#76241e] text-white shadow-md">
                            {iniciais ? (
                                <span className="font-titulo text-4xl font-bold">
                                    {iniciais}
                                </span>
                            ) : (
                                <Icone
                                    nome="person"
                                    tamanho="text-7xl"
                                />
                            )}
                        </div>

                        <h2 className="mt-6 max-w-full wrap-break-word font-titulo text-xl font-bold text-primaria">
                            {nomeExibicao}
                        </h2>

                        <p className="mt-2 max-w-full wrap-break-word text-sm text-texto-suave">
                            {usuario?.email || 'E-mail não disponível'}
                        </p>

                        <div className="my-6 h-px w-full bg-[#ead8c9]" />

                        <div className="flex items-center gap-2 rounded-full bg-[#f0dfd0] px-4 py-2 text-sm font-semibold text-primaria">
                            <Icone
                                nome="verified_user"
                                tamanho="text-lg"
                            />

                            Perfil do Cidadão
                        </div>

                        <p className="mt-6 text-sm leading-7 text-texto-suave">
                            Suas informações pessoais serão exibidas
                            aqui a partir dos dados cadastrados
                            na plataforma Polieus.
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

                        <div>
                            <CampoInformacao
                                titulo="Nome completo"
                                valor={usuario?.nome}
                            />

                            <CampoInformacao
                                titulo="CPF"
                                valor={
                                    usuario?.cpf
                                        ? formatarCPF(usuario.cpf)
                                        : undefined
                                }
                            />

                            <CampoInformacao
                                titulo="E-mail"
                                valor={usuario?.email}
                            />

                            <CampoInformacao
                                titulo="Telefone"
                                valor={
                                    usuario?.telefone
                                        ? formatarTelefone(
                                              usuario.telefone
                                          )
                                        : undefined
                                }
                            />
                        </div>

                        <div className="mt-6 flex items-start gap-3 rounded-xl bg-[#f4e8dd] p-4">
                            <span className="mt-0.5 text-primaria">
                                <Icone
                                    nome="info"
                                    tamanho="text-xl"
                                />
                            </span>

                            <p className="text-xs leading-6 text-texto-suave">
                                As informações pessoais serão
                                carregadas automaticamente da API
                                Java quando a integração estiver
                                disponível.
                            </p>
                        </div>
                    </section>
                </div>

                {/* HISTÓRICO E PREFERÊNCIAS */}
                <div className="mt-6 grid items-stretch gap-6 lg:grid-cols-2">
                    {/* HISTÓRICO DE PARTICIPAÇÃO */}
                    <section className="rounded-2xl border border-[#e3c5af] bg-[#fffaf5] p-6 shadow-sm sm:p-8">
                        <div className="mb-5 flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f0dfd0] text-primaria">
                                <Icone nome="assignment" />
                            </div>

                            <div>
                                <h2 className="font-titulo text-lg font-bold text-primaria">
                                    Histórico de Participação
                                </h2>

                                <p className="mt-1 text-xs text-texto-suave">
                                    Sua atividade na plataforma.
                                </p>
                            </div>
                        </div>

                        <div className="rounded-xl bg-[#f4e8dd] px-5 py-6">
                            <p className="font-titulo text-4xl font-bold text-primaria">
                                {usuario?.quantidadeOcorrencias ?? '—'}
                            </p>

                            <p className="mt-2 text-sm text-texto-suave">
                                Ocorrências registradas
                            </p>
                        </div>

                        <p className="mt-5 text-sm leading-7 text-texto-suave">
                            Acompanhe as solicitações realizadas
                            e consulte o histórico das suas
                            contribuições para a cidade.
                        </p>

                        <Link
                            to="/minhas-ocorrencias"
                            className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primaria transition-colors hover:text-primaria-hover"
                        >
                            Ver minhas ocorrências

                            <Icone
                                nome="arrow_forward"
                                tamanho="text-lg"
                            />
                        </Link>
                    </section>

                    {/* NOTIFICAÇÕES */}
                    <section className="rounded-2xl border border-[#e3c5af] bg-[#fffaf5] p-6 shadow-sm sm:p-8">
                        <div className="mb-5 flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f0dfd0] text-primaria">
                                <Icone nome="notifications" />
                            </div>

                            <div>
                                <h2 className="font-titulo text-lg font-bold text-primaria">
                                    Preferências de Notificação
                                </h2>

                                <p className="mt-1 text-xs text-texto-suave">
                                    Gerencie suas atualizações.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between gap-4 rounded-xl bg-[#f4e8dd] p-5">
                            <div className="min-w-0">
                                <h3 className="text-sm font-semibold text-texto">
                                    Atualizações por e-mail
                                </h3>

                                <p className="mt-2 text-xs leading-6 text-texto-suave">
                                    Receba informações sobre o
                                    andamento das suas ocorrências.
                                </p>
                            </div>

                            <button
                                type="button"
                                role="switch"
                                aria-checked={
                                    notificacoesEmail ??
                                    usuario?.notificacoesEmail ??
                                    false
                                }
                                aria-label="Receber atualizações por e-mail"
                                disabled
                                onClick={() =>
                                    setNotificacoesEmail(
                                        !(
                                            notificacoesEmail ??
                                            usuario?.notificacoesEmail ??
                                            false
                                        )
                                    )
                                }
                                className={`relative h-7 w-13 shrink-0 rounded-full transition-colors ${
                                    (
                                        notificacoesEmail ??
                                        usuario?.notificacoesEmail ??
                                        false
                                    )
                                        ? 'bg-primaria'
                                        : 'bg-[#c9b6a7]'
                                } cursor-not-allowed opacity-60`}
                                title="Disponível após integração com a API"
                            >
                                <span
                                    className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-all ${
                                        (
                                            notificacoesEmail ??
                                            usuario?.notificacoesEmail ??
                                            false
                                        )
                                            ? 'left-7'
                                            : 'left-1'
                                    }`}
                                />
                            </button>
                        </div>

                        <p className="mt-5 flex items-start gap-2 text-xs leading-6 text-texto-suave">
                            <Icone
                                nome="info"
                                tamanho="text-lg"
                            />

                            As preferências poderão ser alteradas
                            quando esse recurso estiver disponível
                            na API.
                        </p>
                    </section>
                </div>

                {/* SEGURANÇA DA CONTA */}
                <section className="mt-6 rounded-2xl border border-[#e3c5af] bg-[#fffaf5] p-6 shadow-sm sm:p-8">
                    <div className="mb-6 flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f0dfd0] text-primaria">
                            <Icone nome="shield" />
                        </div>

                        <div>
                            <h2 className="font-titulo text-lg font-bold text-primaria">
                                Segurança da Conta
                            </h2>

                            <p className="mt-1 text-xs text-texto-suave">
                                Acesse as opções de segurança
                                do seu perfil.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <button
                            type="button"
                            disabled
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#d8b29c] bg-[#fffaf5] px-5 py-3 text-sm font-bold text-primaria opacity-60 cursor-not-allowed"
                            title="Disponível após integração com a API"
                        >
                            <Icone
                                nome="lock_reset"
                                tamanho="text-xl"
                            />

                            Alterar Senha
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                setMostrarConfirmacao(true)
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primaria px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-primaria-hover"
                            style={{ color: '#ffffff' }}
                        >
                            <Icone
                                nome="logout"
                                tamanho="text-xl"
                            />

                            Sair da Conta
                        </button>
                    </div>
                </section>

                {/* RODAPÉ INTERNO */}
                <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-[#e3c5af] pt-6 text-xs text-texto-suave sm:flex-row">
                    <p>
                        Polieus — Tecnologia a serviço da cidadania.
                    </p>

                    <Link
                        to="/contato"
                        className="inline-flex items-center gap-2 font-semibold text-primaria hover:underline"
                    >
                        Precisa de ajuda?

                        <Icone
                            nome="arrow_forward"
                            tamanho="text-base"
                        />
                    </Link>
                </div>
            </div>

            {/* CONFIRMAÇÃO DE SAÍDA */}
            {mostrarConfirmacao && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="titulo-sair"
                        className="w-full max-w-md rounded-2xl border border-[#e3c5af] bg-[#fffaf5] p-7 text-center shadow-xl"
                    >
                        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#f0dfd0] text-primaria">
                            <Icone
                                nome="logout"
                                tamanho="text-3xl"
                            />
                        </div>

                        <h2
                            id="titulo-sair"
                            className="font-titulo text-xl font-bold text-primaria"
                        >
                            Sair da Conta
                        </h2>

                        <p className="mt-4 text-sm leading-7 text-texto-suave">
                            Deseja realmente sair da sua conta
                            no Polieus?
                        </p>

                        <div className="mt-7 flex flex-wrap justify-center gap-3">
                            <button
                                type="button"
                                onClick={() =>
                                    setMostrarConfirmacao(false)
                                }
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
