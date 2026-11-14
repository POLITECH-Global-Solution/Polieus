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
      {
        path: 'integrantes',
        element: <Integrantes />,
      },
      {
        path: '*',
        element: <Error />,
      },
      {
        path: 'sobre',
        element: <Sobre />,
      },
      {
        path: 'faq',
        element: <FAQ />,
      },
      {
        path: 'contato',
        element: <Contato />,
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
        path: 'transparencia',
        element: <Transparencia />,
      },
      {
        path: 'mapa-ocorrencias',
        element: <MapaOcorrencias />,
      },
      {
        path: 'inicio',
        element: <Inicio />,
      },
      {
        path: 'perfil',
        element: <Perfil />,
      }
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
