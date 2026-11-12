import { Outlet } from 'react-router-dom';
import Cabecalho from './components/Cabecalho/Cabecalho';
import Rodape from './components/Rodape/Rodape';

export default function App() {
    return (
        <div className="flex min-h-dvh">
            <Cabecalho />

            <div className="flex flex-col flex-1 min-w-0 min-h-dvh">
                <div className="flex flex-col flex-1">
                    <Outlet />
                </div>

                <Rodape />
            </div>
        </div>
    );
}