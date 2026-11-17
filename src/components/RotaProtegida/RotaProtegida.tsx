import { Navigate, Outlet } from 'react-router-dom';

export default function RotaProtegida() {

    function verificarSessao(): boolean {
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

    if (!verificarSessao()) {
        return <Navigate to="/login-usuario" replace />;
    }

    return <Outlet />;
}