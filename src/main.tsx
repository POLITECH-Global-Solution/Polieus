import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import App from './App.tsx';
import './globals.css';

import Error from './pages/Error/index.tsx';
import Integrantes from './pages/Integrantes/index.tsx';
import EscolhaAcesso from './pages/Acesso/index.tsx';
import LoginUsuario from './pages/LoginUsuario/index.tsx';
import LoginAdministrador from './pages/LoginAdministrador/index.tsx';
import Sobre from './pages/Sobre/index.tsx';
import FAQ from './pages/FAQ/index.tsx';
import Contato from './pages/Contato/index.tsx';
import RegistrarOcorrencia from './pages/RegistrarOcorrencia/index.tsx';
import MinhasOcorrencias from './pages/MinhasOcorrencias/index.tsx';
import Transparencia from './pages/Transparencia/index.tsx';
import MapaOcorrencias from './pages/MapaOcorrencias/index.tsx';
import Inicio from './pages/Inicio/index.tsx';
import Perfil from './pages/Perfil/index.tsx';
import GerenciarOcorrencias from './pages/GerenciarOcorrencia/index.tsx';
import AdminMapaOcorrencias from './pages/AdminMapaOcorrencias/index.tsx';
import AdminRelatorios from './pages/AdminRelatorios/index.tsx';
import AdminDashboard from './pages/AdminDashboard/index.tsx';

function PaginaAdministrativa({ titulo }: { titulo: string }) {
    return (
        <main className="min-h-screen bg-fundo px-6 py-10 font-corpo lg:px-10">
            <div className="mx-auto max-w-7xl">
                <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primaria">
                    Área Administrativa
                </p>

                <h1 className="font-titulo text-3xl font-bold text-primaria">
                    {titulo}
                </h1>

                <p className="mt-4 text-texto-suave">
                    Esta página administrativa será desenvolvida em breve.
                </p>
            </div>
        </main>
    );
}

const router = createBrowserRouter([
    {
        path: '/',
        element: <EscolhaAcesso />,
    },
    {
        path: '/login-usuario',
        element: <LoginUsuario />,
    },
    {
        path: '/login-admin',
        element: <LoginAdministrador />,
    },
    {
        element: <App />,
        children: [
            // PÁGINAS DO CIDADÃO
            {
                path: 'inicio',
                element: <Inicio />,
            },
            {
                path: 'registrar-ocorrencia',
                element: <RegistrarOcorrencia />,
            },
            {
                path: 'minhas-ocorrencias',
                element: <MinhasOcorrencias />,
            },
            {
                path: 'mapa-ocorrencias',
                element: <MapaOcorrencias />,
            },
            {
                path: 'transparencia',
                element: <Transparencia />,
            },
            {
                path: 'perfil',
                element: <Perfil />,
            },

            // PÁGINAS INSTITUCIONAIS
            {
                path: 'sobre',
                element: <Sobre />,
            },
            {
                path: 'integrantes',
                element: <Integrantes />,
            },
            {
                path: 'faq',
                element: <FAQ />,
            },
            {
                path: 'contato',
                element: <Contato />,
            },

            // PÁGINAS DO ADMINISTRADOR
            {
                path: 'admin',
                children: [
                    {
                        index: true,
                        element: <AdminDashboard />,
                    },
                    {
                        path: 'dashboard',
                        element: <AdminDashboard />,
                    },
                    {
                        path: 'gerenciar-ocorrencias',
                        element: <GerenciarOcorrencias />,
                    },
                    {
                        path: 'mapa-ocorrencias',
                        element: <AdminMapaOcorrencias />,
                    },
                    {
                        path: 'relatorios',
                        element: <AdminRelatorios />,
                    },
                    {
                        path: 'perfil',
                        element: <PaginaAdministrativa titulo="Perfil do Administrador" />,
                    },

                    // PÁGINAS COMPARTILHADAS
                    {
                        path: 'sobre',
                        element: <Sobre />,
                    },
                    {
                        path: 'integrantes',
                        element: <Integrantes />,
                    },
                    {
                        path: 'faq',
                        element: <FAQ />,
                    },
                    {
                        path: 'contato',
                        element: <Contato />,
                    },
                ],
            },

            // PÁGINA DE ERRO
            {
                path: '*',
                element: <Error />,
            },
        ],
    },
]);

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>
);
