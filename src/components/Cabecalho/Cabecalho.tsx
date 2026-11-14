
import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';

interface CabecalhoProps {
    tipoUsuario?: 'cidadao' | 'administrador';
    aoSair?: () => void;
}

export default function Cabecalho({ tipoUsuario = 'cidadao', aoSair }: CabecalhoProps) {
    const [menuAberto, setMenuAberto] = useState(false);
    const [botaoVisivel, setBotaoVisivel] = useState(true);

    // Controla a visibilidade do botão durante a rolagem no celular
    useEffect(() => {
        let ultimaPosicao = Math.max(0, window.scrollY);

        const verificarRolagem = () => {
            const posicaoAtual = Math.max(0, window.scrollY);

            // Mantém o botão visível fora do celular,
            // com o menu aberto ou próximo ao topo
            if (
                window.innerWidth >= 768 ||
                menuAberto ||
                posicaoAtual <= 80
            ) {
                setBotaoVisivel(true);
                ultimaPosicao = posicaoAtual;
                return;
            }

            const diferenca = posicaoAtual - ultimaPosicao;

            // Evita esconder ou mostrar o botão
            // por movimentos muito pequenos
            if (Math.abs(diferenca) > 8) {
                setBotaoVisivel(diferenca < 0);
                ultimaPosicao = posicaoAtual;
            }
        };

        window.addEventListener('scroll', verificarRolagem, {
            passive: true,
        });

        window.addEventListener('resize', verificarRolagem);

        verificarRolagem();

        return () => {
            window.removeEventListener('scroll', verificarRolagem);
            window.removeEventListener('resize', verificarRolagem);
        };
    }, [menuAberto]);

    const administrador = tipoUsuario === 'administrador';

    const fecharMenu = () => {
        setMenuAberto(false);
    };

    const fazerLogout = () => {
        fecharMenu();
        aoSair?.();
    };

    const linkClasses = ({ isActive }: { isActive: boolean }) =>
        `flex items-center gap-3 px-3 py-2 rounded-md text-[12px] transition-colors duration-200 ${
            isActive ? 'bg-white/20 text-white font-semibold' : 'text-white hover:bg-white/15'
        }`;

    return (
        <>
            <button type="button" onClick={() => setMenuAberto(!menuAberto)}
                    aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'}
                    aria-expanded={menuAberto}
                    aria-controls="menu-polieus"
                    tabIndex={!botaoVisivel && !menuAberto ? -1 : undefined}
                    className={`fixed top-4 left-4 z-50 flex h-10 w-10 items-center justify-center rounded-lg bg-primaria text-white lg:hidden transition-all duration-300 ease-in-out ${
                        botaoVisivel || menuAberto
                            ? 'translate-y-0 opacity-100'
                            : '-translate-y-16 opacity-0 pointer-events-none'
                    }`}>
                <span className="material-icons">{menuAberto ? 'close' : 'menu'}</span>
            </button>

            {menuAberto && (
                <button type="button" onClick={fecharMenu} aria-label="Fechar menu"
                        className="fixed inset-0 z-30 bg-black/50 lg:hidden" />
            )}

            <header id="menu-polieus"
                    className={`fixed inset-y-0 left-0 z-40 flex w-52 flex-col bg-linear-to-b from-[#86291f] to-[#651b16] text-white transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:shrink-0 lg:translate-x-0 ${
                        menuAberto ? 'translate-x-0' : '-translate-x-full'
                    }`}>

                <div className="flex flex-col items-center border-b border-white/25 px-2 pt-3 pb-4">
                    <img src="/favicons/logo_polieus2.png" alt="Logo do Polieus"
                         className="w-44 h-auto object-contain" />
                    <p className="mt-1 text-center text-[8px] uppercase leading-3 text-white">
                        Tecnologia a serviço da cidadania
                    </p>
                </div>

                <nav aria-label="Menu principal" className="flex flex-1 flex-col overflow-y-auto px-3 pt-4 pb-3">

                    <ul className="flex flex-col gap-1">
                        {administrador ? (
                            <>
                                <li>
                                    <NavLink to="/admin/dashboard" onClick={fecharMenu} className={linkClasses}>
                                        <span className="material-icons text-[18px]">dashboard</span>
                                        Dashboard
                                    </NavLink>
                                </li>

                                <li>
                                    <NavLink to="/admin/ocorrencias" onClick={fecharMenu} className={linkClasses}>
                                        <span className="material-icons text-[18px]">description</span>
                                        Gerenciar Ocorrências
                                    </NavLink>
                                </li>

                                <li>
                                    <NavLink to="/admin/mapa" onClick={fecharMenu} className={linkClasses}>
                                        <span className="material-icons text-[18px]">location_on</span>
                                        Mapa de Ocorrências
                                    </NavLink>
                                </li>

                                <li>
                                    <NavLink to="/admin/relatorios" onClick={fecharMenu} className={linkClasses}>
                                        <span className="material-icons text-[18px]">bar_chart</span>
                                        Relatórios e Indicadores
                                    </NavLink>
                                </li>
                            </>
                        ) : (
                            <>
                                <li>
                                    <NavLink to="/inicio" onClick={fecharMenu} className={linkClasses}>
                                        <span className="material-icons text-[18px]">home</span>
                                        Início
                                    </NavLink>
                                </li>

                                <li>
                                    <NavLink to="/mapa" onClick={fecharMenu} className={linkClasses}>
                                        <span className="material-icons text-[18px]">location_on</span>
                                        Mapa de Ocorrências
                                    </NavLink>
                                </li>

                                <li>
                                    <NavLink to="/registrar-ocorrencia" onClick={fecharMenu} className={linkClasses}>
                                        <span className="material-icons text-[18px]">add_circle</span>
                                        Registrar Ocorrência
                                    </NavLink>
                                </li>

                                <li>
                                    <NavLink to="/minhas-ocorrencias" onClick={fecharMenu} className={linkClasses}>
                                        <span className="material-icons text-[18px]">list_alt</span>
                                        Minhas Ocorrências
                                    </NavLink>
                                </li>

                                <li>
                                    <NavLink to="/transparencia" onClick={fecharMenu} className={linkClasses}>
                                        <span className="material-icons text-[18px]">bar_chart</span>
                                        Transparência
                                    </NavLink>
                                </li>
                            </>
                        )}
                    </ul>

                    <div className="my-3 border-t border-white/25"></div>

                    <ul className="flex flex-col gap-1">
                        <li>
                            <NavLink to="/sobre" onClick={fecharMenu} className={linkClasses}>
                                <span className="material-icons text-[18px]">info</span>
                                Sobre
                            </NavLink>
                        </li>

                        <li>
                            <NavLink to="/integrantes" onClick={fecharMenu} className={linkClasses}>
                                <span className="material-icons text-[18px]">groups</span>
                                Integrantes
                            </NavLink>
                        </li>

                        <li>
                            <NavLink to="/faq" onClick={fecharMenu} className={linkClasses}>
                                <span className="material-icons text-[18px]">help</span>
                                FAQ
                            </NavLink>
                        </li>

                        <li>
                            <NavLink to="/contato" onClick={fecharMenu} className={linkClasses}>
                                <span className="material-icons text-[18px]">mail</span>
                                Contato
                            </NavLink>
                        </li>
                    </ul>

                    <div className="my-3 border-t border-white/25"></div>

                    <ul className="flex flex-col gap-1">
                        <li>
                            <NavLink to={administrador ? '/admin/perfil' : '/perfil'} onClick={fecharMenu} className={linkClasses}>
                                <span className="material-icons text-[18px]">person</span>
                                Meu Perfil
                            </NavLink>
                        </li>

                        <li>
                            <button type="button" onClick={fazerLogout}
                                    className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-[12px] text-white transition-colors hover:bg-white/15">
                                <span className="material-icons text-[18px]">logout</span>
                                Sair
                            </button>
                        </li>
                    </ul>

                </nav>
            </header>
        </>
    );
}
