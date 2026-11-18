import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { administradorLogado } from '../../services/administrativoService';

export default function RotaProtegida() {

    const location = useLocation();

    const administrador =
        location.pathname === '/admin' ||
        location.pathname.startsWith('/admin/');

    // VERIFICAR SESSÃO DO CIDADÃO

    function verificarSessaoUsuario(): boolean {
        try {
            const dados = sessionStorage.getItem('usuario');

            if (!dados) return false;

            const usuario = JSON.parse(dados);

            return (
                usuario !== null &&
                Number.isInteger(usuario.idUsuario) &&
                usuario.idUsuario > 0
            );

        } catch {
            return false;
        }
    }

    // PROTEGER ROTAS ADMINISTRATIVAS

    if (administrador) {
        if (!administradorLogado()) {
            return <Navigate to="/login-admin" replace />;
        }

        return <Outlet />;
    }

    // PROTEGER ROTAS DO CIDADÃO

    if (!verificarSessaoUsuario()) {
        return <Navigate to="/login-usuario" replace />;
    }

    return <Outlet />;
}