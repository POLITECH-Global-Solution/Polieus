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
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
