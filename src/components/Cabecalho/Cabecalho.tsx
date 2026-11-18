import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { logoutAdministrador } from '../../services/administrativoService';

interface CabecalhoProps {
    aoSair?: () => void;
}

export default function Cabecalho({ aoSair }: CabecalhoProps) {

    const location = useLocation();
    const navigate = useNavigate();

    const [menuAberto, setMenuAberto] = useState(false);
    const [botaoVisivel, setBotaoVisivel] = useState(true);

    const botaoMenuRef = useRef<HTMLButtonElement>(null);

    const administrador =
        location.pathname === '/admin' ||
        location.pathname.startsWith('/admin/');

    // CONTROLE DO BOTÃO MOBILE

    useEffect(() => {
        let ultimaPosicao = Math.max(0, window.scrollY);

        const verificarRolagem = () => {
            const posicaoAtual = Math.max(0, window.scrollY);

            if (
                window.innerWidth >= 1024 ||
                menuAberto ||
                posicaoAtual <= 80
            ) {
                setBotaoVisivel(true);
                ultimaPosicao = posicaoAtual;
                return;
            }

            const diferenca = posicaoAtual - ultimaPosicao;

            if (Math.abs(diferenca) > 8) {
                setBotaoVisivel(diferenca < 0);
                ultimaPosicao = posicaoAtual;
            }
        };

        window.addEventListener('scroll', verificarRolagem, { passive: true });
        window.addEventListener('resize', verificarRolagem);

        verificarRolagem();

        return () => {
            window.removeEventListener('scroll', verificarRolagem);
            window.removeEventListener('resize', verificarRolagem);
        };
    }, [menuAberto]);

    // FECHAR MENU COM ESC

    useEffect(() => {
        if (!menuAberto) return;

        const fecharComEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setMenuAberto(false);
                setBotaoVisivel(true);
                botaoMenuRef.current?.focus();
            }
        };

        document.addEventListener('keydown', fecharComEscape);

        return () => {
            document.removeEventListener('keydown', fecharComEscape);
        };
    }, [menuAberto]);

    const fecharMenu = () => {
        setMenuAberto(false);
    };

    // ENCERRAR SESSÃO

    const fazerLogout = () => {
        fecharMenu();

        if (administrador) {
            logoutAdministrador();
        } else {
            sessionStorage.removeItem('usuario');
        }

        if (aoSair) {
            aoSair();
        } else {
            navigate('/', { replace: true });
        }
    };

    // ESTILIZAÇÃO DOS ITENS

    const estiloItem = 'flex w-full items-center gap-3 rounded-md px-3 py-2 text-[12px] leading-tight transition-colors duration-200 [@media(max-height:700px)]:py-1 [@media(max-height:500px)]:py-0.5';

    const estiloIcone = 'material-icons shrink-0 text-[18px]';

    const linkClasses = ({ isActive }: { isActive: boolean }) =>
        `${estiloItem} ${
            isActive
                ? 'bg-white/20 text-white font-semibold'
                : 'text-white hover:bg-white/15'
        }`;

    return (
        <>
            {/* BOTÃO DO MENU MOBILE */}

            <button type="button" onClick={() => setMenuAberto(!menuAberto)} ref={botaoMenuRef} aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'} aria-expanded={menuAberto} aria-controls="menu-polieus" tabIndex={!botaoVisivel && !menuAberto ? -1 : undefined} className={`fixed top-4 left-4 z-50 flex h-10 w-10 items-center justify-center rounded-lg bg-primaria text-white transition-all duration-300 ease-in-out focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#f1d5c0] lg:hidden ${
                botaoVisivel || menuAberto
                    ? 'translate-y-0 opacity-100'
                    : '-translate-y-16 opacity-0 pointer-events-none'
            }`}>

                <span className="material-icons">
                    {menuAberto ? 'close' : 'menu'}
                </span>

            </button>

            {/* FUNDO DO MENU MOBILE */}

            {menuAberto && (
                <button type="button" onClick={fecharMenu} aria-label="Fechar menu" className="fixed inset-0 z-30 bg-black/50 lg:hidden" />
            )}

            {/* CABEÇALHO LATERAL */}

            <header id="menu-polieus" className={`fixed top-0 left-0 z-40 flex h-dvh w-52 shrink-0 flex-col overflow-hidden bg-linear-to-b from-[#86291f] to-[#651b16] text-white transition-[transform,visibility] duration-300 lg:sticky lg:top-0 lg:translate-x-0 lg:visible ${
                menuAberto
                    ? 'translate-x-0 visible'
                    : '-translate-x-full invisible'
            }`}>

                {/* LOGO */}

                <div className="flex shrink-0 flex-col items-center border-b border-white/25 px-2 pt-3 pb-3 [@media(max-height:700px)]:py-2 [@media(max-height:500px)]:py-1">

                    <img src="/favicons/logo_polieus2.png" alt="Logo do Polieus" className="h-[18dvh] max-h-44 w-44 object-contain" />

                    <p className="mt-1 text-center text-[8px] uppercase leading-3 text-white">
                        Tecnologia a serviço da cidadania
                    </p>

                </div>

                {/* NAVEGAÇÃO */}

                <nav aria-label={administrador ? 'Menu administrativo' : 'Menu principal'} className="flex min-h-0 flex-1 flex-col px-3 py-2">

                    <ul className="flex flex-col gap-1 [@media(max-height:700px)]:gap-0.5 [@media(max-height:500px)]:gap-0">

                        {administrador ? (
                            <>
                                {/* MENU DO ADMINISTRADOR */}

                                <li>
                                    <NavLink to="/admin/dashboard" onClick={fecharMenu} className={linkClasses}>
                                        <span className={estiloIcone}>dashboard</span>
                                        Dashboard
                                    </NavLink>
                                </li>

                                <li>
                                    <NavLink to="/admin/gerenciar-ocorrencias" onClick={fecharMenu} className={linkClasses}>
                                        <span className={estiloIcone}>description</span>
                                        Gerenciar Ocorrências
                                    </NavLink>
                                </li>

                                <li>
                                    <NavLink to="/admin/mapa-ocorrencias" onClick={fecharMenu} className={linkClasses}>
                                        <span className={estiloIcone}>location_on</span>
                                        Mapa de Ocorrências
                                    </NavLink>
                                </li>

                                <li>
                                    <NavLink to="/admin/relatorios" onClick={fecharMenu} className={linkClasses}>
                                        <span className={estiloIcone}>bar_chart</span>
                                        Relatórios e Indicadores
                                    </NavLink>
                                </li>

                            </>
                        ) : (
                            <>
                                {/* MENU DO CIDADÃO */}

                                <li>
                                    <NavLink to="/inicio" onClick={fecharMenu} className={linkClasses}>
                                        <span className={estiloIcone}>home</span>
                                        Início
                                    </NavLink>
                                </li>

                                <li>
                                    <NavLink to="/mapa-ocorrencias" onClick={fecharMenu} className={linkClasses}>
                                        <span className={estiloIcone}>location_on</span>
                                        Mapa de Ocorrências
                                    </NavLink>
                                </li>

                                <li>
                                    <NavLink to="/registrar-ocorrencia" onClick={fecharMenu} className={linkClasses}>
                                        <span className={estiloIcone}>add_circle</span>
                                        Registrar Ocorrência
                                    </NavLink>
                                </li>

                                <li>
                                    <NavLink to="/minhas-ocorrencias" onClick={fecharMenu} className={linkClasses}>
                                        <span className={estiloIcone}>list_alt</span>
                                        Minhas Ocorrências
                                    </NavLink>
                                </li>

                                <li>
                                    <NavLink to="/transparencia" onClick={fecharMenu} className={linkClasses}>
                                        <span className={estiloIcone}>bar_chart</span>
                                        Transparência
                                    </NavLink>
                                </li>

                            </>
                        )}

                    </ul>

                    {/* DIVISÓRIA */}

                    <div className="my-2 shrink-0 border-t border-white/25 [@media(max-height:700px)]:my-1" />

                    {/* PÁGINAS COMPARTILHADAS */}

                    <ul className="flex flex-col gap-1 [@media(max-height:700px)]:gap-0.5 [@media(max-height:500px)]:gap-0">

                        <li>
                            <NavLink to={administrador ? '/admin/sobre' : '/sobre'} onClick={fecharMenu} className={linkClasses}>
                                <span className={estiloIcone}>info</span>
                                Sobre
                            </NavLink>
                        </li>

                        <li>
                            <NavLink to={administrador ? '/admin/integrantes' : '/integrantes'} onClick={fecharMenu} className={linkClasses}>
                                <span className={estiloIcone}>groups</span>
                                Integrantes
                            </NavLink>
                        </li>

                        <li>
                            <NavLink to={administrador ? '/admin/faq' : '/faq'} onClick={fecharMenu} className={linkClasses}>
                                <span className={estiloIcone}>help</span>
                                FAQ
                            </NavLink>
                        </li>

                        <li>
                            <NavLink to={administrador ? '/admin/contato' : '/contato'} onClick={fecharMenu} className={linkClasses}>
                                <span className={estiloIcone}>mail</span>
                                Contato
                            </NavLink>
                        </li>

                    </ul>

                    {/* DIVISÓRIA */}

                    <div className="my-2 shrink-0 border-t border-white/25 [@media(max-height:700px)]:my-1" />

                    {/* PERFIL E LOGOUT */}

                    <ul className="flex flex-col gap-1 [@media(max-height:700px)]:gap-0.5 [@media(max-height:500px)]:gap-0">

                        <li>
                            <NavLink to={administrador ? '/admin/perfil' : '/perfil'} onClick={fecharMenu} className={linkClasses}>
                                <span className={estiloIcone}>person</span>
                                Meu Perfil
                            </NavLink>
                        </li>

                        <li>
                            <button type="button" onClick={fazerLogout} className={`${estiloItem} cursor-pointer text-left text-white hover:bg-white/15`}>
                                <span className={estiloIcone}>logout</span>
                                Sair
                            </button>
                        </li>

                    </ul>

                </nav>

            </header>
        </>
    );
}