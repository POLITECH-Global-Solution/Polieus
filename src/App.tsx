import { Outlet } from 'react-router-dom';
import Cabecalho from './components/Cabecalho/Cabecalho.tsx';

export default function App() {
  return (
    <div className="flex min-h-screen">
      <Cabecalho />
      <main className="min-w-0 flex-1">
        <Outlet />
      </main>
    </div>
  );
}