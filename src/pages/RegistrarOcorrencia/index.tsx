
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cadastrarOcorrencia, obterUsuarioId } from '../../services/ocorrenciaService';
import { cadastrarHistoricoInicial } from '../../services/historicoService';

type Etapa = 1 | 2 | 3;

interface DadosOcorrencia {
    categoria: string;
    descricao: string;
    cep: string;
    endereco: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    estado: string;
}

const dadosIniciais: DadosOcorrencia = {
    categoria: '',
    descricao: '',
    cep: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
};

const categorias = [
    'Iluminação',
    'Sanitário',
    'Estrada',
    'Transporte público',
    'Infraestrutura',
    'Limpeza urbana',
    'Segurança',
    'Meio ambiente',
    'Acessibilidade',
    'Outros',
];

const estados = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF',
    'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA',
    'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS',
    'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

function formatarCep(valor: string) {
    const numeros = valor.replace(/\D/g, '').slice(0, 8);

    if (numeros.length > 5) {
        return `${numeros.slice(0, 5)}-${numeros.slice(5)}`;
    }

    return numeros;
}

export default function RegistrarOcorrencia() {
    const navigate = useNavigate();

    const [etapa, setEtapa] = useState<Etapa>(1);
    const [dados, setDados] = useState<DadosOcorrencia>(dadosIniciais);
    const [foto, setFoto] = useState<File | null>(null);
    const [fotoPreview, setFotoPreview] = useState<string | null>(null);
    const [erro, setErro] = useState('');
    const [finalizado, setFinalizado] = useState(false);
    const [enviando, setEnviando] = useState(false);
    const [idOcorrencia, setIdOcorrencia] = useState<number | null>(null);
    const [protocolo, setProtocolo] = useState<string | null>(null);
    const [avisoHistorico, setAvisoHistorico] = useState('');

    const envioEmAndamento = useRef(false);

    useEffect(() => {
        return () => {
            if (fotoPreview) {
                URL.revokeObjectURL(fotoPreview);
            }
        };
    }, [fotoPreview]);

    // ATUALIZAR CAMPOS DO FORMULÁRIO

    const atualizarCampo = (campo: keyof DadosOcorrencia, valor: string) => {
        setDados(anterior => ({
            ...anterior,
            [campo]: valor,
        }));

        setErro('');
    };

    // SELECIONAR FOTO

    const selecionarFoto = (evento: ChangeEvent<HTMLInputElement>) => {
        const arquivo = evento.target.files?.[0];

        if (!arquivo) return;

        const formatosPermitidos = ['image/jpeg', 'image/png', 'image/webp'];

        if (!formatosPermitidos.includes(arquivo.type)) {
            setErro('Selecione uma imagem JPG, PNG ou WEBP.');
            evento.target.value = '';
            return;
        }

        if (arquivo.size > 5 * 1024 * 1024) {
            setErro('A imagem deve ter no máximo 5 MB.');
            evento.target.value = '';
            return;
        }

        setFoto(arquivo);
        setFotoPreview(URL.createObjectURL(arquivo));
        setErro('');
    };

    // REMOVER FOTO

    const removerFoto = () => {
        setFoto(null);
        setFotoPreview(null);
    };

    // VALIDAR DESCRIÇÃO

    const validarDescricao = () => {
        if (!categorias.includes(dados.categoria)) {
            setErro('Selecione a categoria da ocorrência.');
            return false;
        }

        if (dados.descricao.trim().length < 10) {
            setErro('A descrição deve conter pelo menos 10 caracteres.');
            return false;
        }

        if (dados.descricao.length > 1000) {
            setErro('A descrição deve conter no máximo 1000 caracteres.');
            return false;
        }

        return true;
    };

    // VALIDAR LOCALIZAÇÃO

    const validarLocalizacao = () => {
        if (dados.cep.replace(/\D/g, '').length !== 8) {
            setErro('Digite um CEP válido com 8 números.');
            return false;
        }

        if (
            !dados.endereco.trim() ||
            !dados.numero.trim() ||
            !dados.bairro.trim() ||
            !dados.cidade.trim() ||
            !estados.includes(dados.estado)
        ) {
            setErro('Preencha todos os campos obrigatórios da localização.');
            return false;
        }

        return true;
    };

    // VALIDAR ETAPA ATUAL

    const validarEtapa = () => {
        if (etapa === 1 && !validarDescricao()) return false;
        if (etapa === 2 && !validarLocalizacao()) return false;

        setErro('');

        return true;
    };

    // AVANÇAR ETAPA

    const proximaEtapa = () => {
        if (enviando || !validarEtapa()) return;

        if (etapa < 3) {
            setEtapa(atual => (atual + 1) as Etapa);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // VOLTAR ETAPA

    const etapaAnterior = () => {
        if (enviando) return;

        if (etapa > 1) {
            setErro('');
            setEtapa(atual => (atual - 1) as Etapa);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // REGISTRAR OCORRÊNCIA NA API JAVA

    const finalizarOcorrencia = async (evento: FormEvent<HTMLFormElement>) => {
        evento.preventDefault();

        if (etapa !== 3 || envioEmAndamento.current || finalizado) return;

        const idUsuario = obterUsuarioId();

        if (!idUsuario) {
            navigate('/login-usuario', { replace: true });
            return;
        }

        if (!validarDescricao()) {
            setEtapa(1);
            return;
        }

        if (!validarLocalizacao()) {
            setEtapa(2);
            return;
        }

        envioEmAndamento.current = true;

        setEnviando(true);
        setErro('');
        setIdOcorrencia(null);
        setProtocolo(null);
        setAvisoHistorico('');

        // DADOS NO FORMATO UTILIZADO PELO JAVA

        const dadosEnvio = {
            idUsuario,
            categoria: dados.categoria,
            descricao: dados.descricao.trim(),
            endereco: dados.endereco.trim(),
            departamento: dados.numero.trim(),
            cep: formatarCep(dados.cep),
        };

        try {
            // CADASTRAR OCORRÊNCIA NO JAVA

            const ocorrencia = await cadastrarOcorrencia(dadosEnvio);

            const id = ocorrencia.idOcorrencia;

            // IMPEDIR NOVO ENVIO DA MESMA OCORRÊNCIA

            setFinalizado(true);
            removerFoto();

            window.scrollTo({ top: 0, behavior: 'smooth' });

            // VERIFICAR SE O ID REAL FOI RECUPERADO

            if (typeof id === 'number' && Number.isInteger(id) && id > 0) {
                setIdOcorrencia(id);

                try {
                    // CONSULTAR OU CADASTRAR O HISTÓRICO INICIAL

                    const historico = await cadastrarHistoricoInicial(
                        id,
                        ocorrencia.categoria
                    );

                    // EXIBIR SOMENTE O PROTOCOLO CONFIRMADO

                    if (
                        typeof historico.idHistorico === 'number' &&
                        Number.isInteger(historico.idHistorico) &&
                        historico.idHistorico > 0 &&
                        historico.protocolo?.trim()
                    ) {
                        setProtocolo(historico.protocolo);
                    } else {
                        setAvisoHistorico(
                            'A ocorrência foi registrada, mas ainda não foi possível confirmar o protocolo. Consulte suas ocorrências para acompanhar o registro.'
                        );
                    }

                } catch (erroHistorico) {
                    console.error('Erro ao cadastrar histórico:', erroHistorico);

                    setAvisoHistorico(
                        'Sua ocorrência foi registrada, mas não foi possível confirmar o histórico neste momento. Não é necessário cadastrar a ocorrência novamente.'
                    );
                }

            } else {
                setAvisoHistorico(
                    'O servidor recebeu sua ocorrência, mas não foi possível recuperar sua identificação. Consulte Minhas Ocorrências antes de realizar outro registro.'
                );
            }

        } catch (erro) {
            console.error('Erro ao registrar ocorrência:', erro);

            const mensagem = erro instanceof Error ? erro.message : '';

            if (/\b400\b/.test(mensagem)) {
                setErro('O servidor não aceitou os dados. Confira as informações preenchidas.');

            } else if (/\b401\b|\b403\b/.test(mensagem)) {
                setErro('Não foi possível autorizar o registro da ocorrência.');

            } else if (/\b404\b/.test(mensagem)) {
                setErro('O serviço de registro de ocorrências não foi encontrado.');

            } else if (/\b500\b|\b502\b|\b503\b|\b504\b/.test(mensagem)) {
                setErro('O servidor apresentou uma instabilidade. Verifique suas ocorrências antes de tentar novamente.');

            } else if (/failed to fetch|networkerror|cors/i.test(mensagem)) {
                setErro('Não foi possível confirmar o envio. Verifique sua conexão e suas ocorrências antes de tentar novamente.');

            } else {
                setErro('Não foi possível confirmar o registro da ocorrência. Verifique suas ocorrências antes de reenviar.');
            }

        } finally {
            envioEmAndamento.current = false;
            setEnviando(false);
        }
    };

    // REGISTRAR NOVA OCORRÊNCIA

    const novaOcorrencia = () => {
        if (enviando) return;

        removerFoto();

        setDados(dadosIniciais);
        setEtapa(1);
        setFinalizado(false);
        setIdOcorrencia(null);
        setProtocolo(null);
        setAvisoHistorico('');
        setErro('');

        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const campoClasse = 'w-full rounded-lg border border-[#dfc2ae] bg-[#fffaf5] px-4 py-3 font-corpo text-sm text-texto outline-none transition-colors placeholder:text-[#998a7d] focus:border-primaria focus:ring-2 focus:ring-primaria/15';

    const rotuloClasse = 'mb-2 block font-corpo text-sm font-semibold text-[#46352d]';

    return (
        <main className="min-h-screen w-full bg-fundo font-corpo text-texto">

            {/* CABEÇALHO DA PÁGINA */}

            <header className="border-b border-[#dfc2ae] bg-[#fffaf5] px-5 py-5 sm:px-8 lg:px-10">
                <h1 className="font-titulo text-3xl font-bold text-[#78221b] sm:text-4xl">
                    Registrar Ocorrência
                </h1>

                <nav aria-label="Navegação estrutural" className="mt-1 flex items-center gap-2 text-sm">
                    <Link to="/inicio" className="text-[#6b4438] hover:text-primaria hover:underline">
                        Início
                    </Link>

                    <span className="material-icons text-base text-[#78221b]" aria-hidden="true">
                        chevron_right
                    </span>

                    <span className="font-semibold text-[#78221b]">
                        Registrar Ocorrência
                    </span>
                </nav>
            </header>

            <div className="mx-auto max-w-5xl px-4 py-10 sm:px-8 lg:py-12">

                {/* APRESENTAÇÃO */}

                <section className="mb-8 text-center">
                    <span className="material-icons mb-3 text-5xl text-[#78221b]" aria-hidden="true">
                        add_location_alt
                    </span>

                    <h2 className="font-titulo text-3xl font-bold text-[#78221b] sm:text-4xl">
                        Registre uma Ocorrência
                    </h2>

                    <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-texto-suave sm:text-base">
                        Encontrou algum problema em sua cidade?
                        Registre sua ocorrência e contribua para uma
                        cidade mais organizada, acessível e participativa.
                    </p>

                    <div className="mx-auto mt-5 flex max-w-sm items-center gap-3" aria-hidden="true">
                        <span className="h-px flex-1 bg-[#b77b5e]" />
                        <span className="h-2.5 w-2.5 rotate-45 bg-[#78221b]" />
                        <span className="h-px flex-1 bg-[#b77b5e]" />
                    </div>
                </section>

                <section className="overflow-hidden rounded-2xl border border-[#dfc2ae] bg-[#fffaf5] shadow-lg">
                    <div className="h-2 bg-primaria" />

                    <div className="p-5 sm:p-8 lg:p-10">

                        {!finalizado ? (
                            <>

                                {/* INDICADOR DE ETAPAS */}

                                <div className="mb-10">
                                    <div className="relative mx-auto flex max-w-2xl items-start justify-between">
                                        <div className="absolute left-[16%] right-[16%] top-5 h-0.5 bg-[#dfc2ae]" aria-hidden="true" />

                                        <div className="absolute left-[16%] top-5 h-0.5 bg-primaria transition-all duration-500" style={{ width: etapa === 1 ? '0%' : etapa === 2 ? '34%' : '68%' }} aria-hidden="true" />

                                        {[
                                            { numero: 1, titulo: 'Descrição' },
                                            { numero: 2, titulo: 'Localização' },
                                            { numero: 3, titulo: 'Confirmação' },
                                        ].map(item => (
                                            <div key={item.numero} className="relative z-10 flex w-1/3 flex-col items-center text-center">
                                                <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold transition-all duration-300 ${etapa >= item.numero ? 'border-primaria bg-primaria text-white' : 'border-[#dfc2ae] bg-[#fffaf5] text-[#8d8178]'}`}>
                                                    {etapa > item.numero ? (
                                                        <span className="material-icons text-xl">
                                                            check
                                                        </span>
                                                    ) : (
                                                        item.numero
                                                    )}
                                                </div>

                                                <span className={`mt-3 text-xs font-semibold sm:text-sm ${etapa >= item.numero ? 'text-[#78221b]' : 'text-texto-suave'}`}>
                                                    {item.titulo}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <form onSubmit={finalizarOcorrencia} noValidate aria-busy={enviando}>

                                    {/* ETAPA 1 - DESCRIÇÃO */}

                                    {etapa === 1 && (
                                        <div className="space-y-6">
                                            <div className="border-b border-[#dfc2ae] pb-5">
                                                <div className="flex items-center gap-3">
                                                    <span className="material-icons text-3xl text-[#78221b]" aria-hidden="true">
                                                        edit_note
                                                    </span>

                                                    <h3 className="font-titulo text-2xl font-bold text-[#78221b]">
                                                        Descrição da Ocorrência
                                                    </h3>
                                                </div>

                                                <p className="mt-2 text-sm text-texto-suave">
                                                    Conte-nos qual problema foi identificado.
                                                </p>
                                            </div>

                                            {/* CATEGORIA */}

                                            <div>
                                                <label htmlFor="categoria" className={rotuloClasse}>
                                                    Categoria do problema
                                                    <span className="ml-1 text-red-700">*</span>
                                                </label>

                                                <select id="categoria" value={dados.categoria} onChange={evento => atualizarCampo('categoria', evento.target.value)} className={campoClasse} required>
                                                    <option value="">Selecione uma categoria</option>

                                                    {categorias.map(categoria => (
                                                        <option key={categoria} value={categoria}>
                                                            {categoria}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* DESCRIÇÃO */}

                                            <div>
                                                <label htmlFor="descricao" className={rotuloClasse}>
                                                    Descrição
                                                    <span className="ml-1 text-red-700">*</span>
                                                </label>

                                                <textarea id="descricao" rows={6} maxLength={1000} value={dados.descricao} onChange={evento => atualizarCampo('descricao', evento.target.value)} placeholder="Descreva o problema encontrado com o máximo de detalhes possível..." className={`${campoClasse} resize-y`} required />

                                                <div className="mt-2 flex justify-between gap-3 text-xs text-texto-suave">
                                                    <span>
                                                        Informe o que aconteceu e como isso afeta a região.
                                                    </span>

                                                    <span>
                                                        {dados.descricao.length}/1000
                                                    </span>
                                                </div>
                                            </div>

                                            {/* FOTO OPCIONAL */}

                                            <div>
                                                <label className={rotuloClasse}>
                                                    Foto da ocorrência
                                                    <span className="ml-2 font-normal text-texto-suave">
                                                        (opcional)
                                                    </span>
                                                </label>

                                                {!fotoPreview ? (
                                                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#d8b9a5] bg-[#f9f0e7] px-5 py-9 text-center transition-colors hover:border-primaria hover:bg-[#f3e4d7]">
                                                        <span className="material-icons text-4xl text-[#78221b]" aria-hidden="true">
                                                            add_a_photo
                                                        </span>

                                                        <span className="mt-3 text-sm font-semibold text-[#78221b]">
                                                            Adicionar foto
                                                        </span>

                                                        <span className="mt-1 text-xs text-texto-suave">
                                                            Clique para selecionar uma imagem
                                                        </span>

                                                        <span className="mt-1 text-xs text-texto-suave">
                                                            JPG, PNG ou WEBP — até 5 MB
                                                        </span>

                                                        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={selecionarFoto} className="sr-only" aria-label="Selecionar foto da ocorrência" />
                                                    </label>

                                                ) : (
                                                    <div className="rounded-xl border border-[#dfc2ae] bg-[#f9f0e7] p-4">
                                                        <img src={fotoPreview} alt="Pré-visualização da foto selecionada" className="mx-auto max-h-64 rounded-lg object-contain" />

                                                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                                                            <span className="max-w-xs truncate text-sm text-texto-suave">
                                                                {foto?.name}
                                                            </span>

                                                            <button type="button" onClick={removerFoto} className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-red-700 hover:underline">
                                                                <span className="material-icons text-lg">
                                                                    delete_outline
                                                                </span>

                                                                Remover foto
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}

                                                <p className="mt-2 text-xs leading-relaxed text-texto-suave">
                                                    A foto é opcional e serve apenas para pré-visualização nesta versão. Ela não será enviada ao servidor.
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* ETAPA 2 - LOCALIZAÇÃO */}

                                    {etapa === 2 && (
                                        <div className="space-y-6">
                                            <div className="border-b border-[#dfc2ae] pb-5">
                                                <div className="flex items-center gap-3">
                                                    <span className="material-icons text-3xl text-[#78221b]" aria-hidden="true">
                                                        location_on
                                                    </span>

                                                    <h3 className="font-titulo text-2xl font-bold text-[#78221b]">
                                                        Localização da Ocorrência
                                                    </h3>
                                                </div>

                                                <p className="mt-2 text-sm text-texto-suave">
                                                    Informe o endereço onde o problema foi identificado.
                                                </p>
                                            </div>

                                            {/* CEP */}

                                            <div className="max-w-xs">
                                                <label htmlFor="cep" className={rotuloClasse}>
                                                    CEP
                                                    <span className="ml-1 text-red-700">*</span>
                                                </label>

                                                <input id="cep" type="text" inputMode="numeric" maxLength={9} value={dados.cep} onChange={evento => atualizarCampo('cep', formatarCep(evento.target.value))} placeholder="00000-000" className={campoClasse} required />
                                            </div>

                                            {/* ENDEREÇO E NÚMERO */}

                                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-[2fr_1fr]">
                                                <div>
                                                    <label htmlFor="endereco" className={rotuloClasse}>
                                                        Endereço
                                                        <span className="ml-1 text-red-700">*</span>
                                                    </label>

                                                    <input id="endereco" type="text" value={dados.endereco} onChange={evento => atualizarCampo('endereco', evento.target.value)} placeholder="Rua, avenida ou travessa" className={campoClasse} required />
                                                </div>

                                                <div>
                                                    <label htmlFor="numero" className={rotuloClasse}>
                                                        Número
                                                        <span className="ml-1 text-red-700">*</span>
                                                    </label>

                                                    <input id="numero" type="text" value={dados.numero} onChange={evento => atualizarCampo('numero', evento.target.value)} placeholder="Ex.: 250" className={campoClasse} required />
                                                </div>
                                            </div>

                                            {/* COMPLEMENTO E BAIRRO */}

                                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                                <div>
                                                    <label htmlFor="complemento" className={rotuloClasse}>
                                                        Complemento
                                                        <span className="ml-2 font-normal text-texto-suave">
                                                            (opcional)
                                                        </span>
                                                    </label>

                                                    <input id="complemento" type="text" value={dados.complemento} onChange={evento => atualizarCampo('complemento', evento.target.value)} placeholder="Apartamento, bloco ou referência" className={campoClasse} />
                                                </div>

                                                <div>
                                                    <label htmlFor="bairro" className={rotuloClasse}>
                                                        Bairro
                                                        <span className="ml-1 text-red-700">*</span>
                                                    </label>

                                                    <input id="bairro" type="text" value={dados.bairro} onChange={evento => atualizarCampo('bairro', evento.target.value)} placeholder="Nome do bairro" className={campoClasse} required />
                                                </div>
                                            </div>

                                            {/* CIDADE E ESTADO */}

                                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-[2fr_1fr]">
                                                <div>
                                                    <label htmlFor="cidade" className={rotuloClasse}>
                                                        Cidade
                                                        <span className="ml-1 text-red-700">*</span>
                                                    </label>

                                                    <input id="cidade" type="text" value={dados.cidade} onChange={evento => atualizarCampo('cidade', evento.target.value)} placeholder="Nome da cidade" className={campoClasse} required />
                                                </div>

                                                <div>
                                                    <label htmlFor="estado" className={rotuloClasse}>
                                                        Estado
                                                        <span className="ml-1 text-red-700">*</span>
                                                    </label>

                                                    <select id="estado" value={dados.estado} onChange={evento => atualizarCampo('estado', evento.target.value)} className={campoClasse} required>
                                                        <option value="">Selecione</option>

                                                        {estados.map(estado => (
                                                            <option key={estado} value={estado}>
                                                                {estado}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3 rounded-xl border border-[#dfc2ae] bg-[#fff7ee] p-4">
                                                <span className="material-icons text-xl text-[#78221b]" aria-hidden="true">
                                                    info
                                                </span>

                                                <p className="text-xs leading-relaxed text-texto-suave">
                                                    Nesta versão, o servidor recebe o endereço, o número e o CEP. Os demais campos são utilizados para conferência da localização.
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* ETAPA 3 - CONFIRMAÇÃO */}

                                    {etapa === 3 && (
                                        <div className="space-y-6">
                                            <div className="border-b border-[#dfc2ae] pb-5">
                                                <div className="flex items-center gap-3">
                                                    <span className="material-icons text-3xl text-[#78221b]" aria-hidden="true">
                                                        fact_check
                                                    </span>

                                                    <h3 className="font-titulo text-2xl font-bold text-[#78221b]">
                                                        Confirmação da Ocorrência
                                                    </h3>
                                                </div>

                                                <p className="mt-2 text-sm text-texto-suave">
                                                    Revise as informações antes de finalizar.
                                                </p>
                                            </div>

                                            {/* RESUMO DA DESCRIÇÃO */}

                                            <section className="rounded-xl border border-[#dfc2ae] bg-[#f9f0e7] p-5">
                                                <div className="mb-4 flex items-center justify-between gap-3">
                                                    <h4 className="flex items-center gap-2 font-titulo text-lg font-bold text-[#78221b]">
                                                        <span className="material-icons" aria-hidden="true">
                                                            description
                                                        </span>

                                                        Descrição
                                                    </h4>

                                                    <button type="button" disabled={enviando} onClick={() => setEtapa(1)} className="cursor-pointer text-sm font-semibold text-primaria hover:underline disabled:cursor-not-allowed disabled:opacity-50">
                                                        Editar
                                                    </button>
                                                </div>

                                                <div className="space-y-3 text-sm">
                                                    <div>
                                                        <span className="font-semibold">Categoria:</span>

                                                        <p className="mt-1 text-texto-suave">
                                                            {dados.categoria}
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <span className="font-semibold">Descrição:</span>

                                                        <p className="mt-1 whitespace-pre-wrap leading-relaxed text-texto-suave">
                                                            {dados.descricao}
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <span className="font-semibold">Foto:</span>

                                                        <p className="mt-1 text-texto-suave">
                                                            {foto ? `${foto.name} (pré-visualização local)` : 'Nenhuma foto adicionada'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </section>

                                            {/* RESUMO DA LOCALIZAÇÃO */}

                                            <section className="rounded-xl border border-[#dfc2ae] bg-[#f9f0e7] p-5">
                                                <div className="mb-4 flex items-center justify-between gap-3">
                                                    <h4 className="flex items-center gap-2 font-titulo text-lg font-bold text-[#78221b]">
                                                        <span className="material-icons" aria-hidden="true">
                                                            location_on
                                                        </span>

                                                        Localização
                                                    </h4>

                                                    <button type="button" disabled={enviando} onClick={() => setEtapa(2)} className="cursor-pointer text-sm font-semibold text-primaria hover:underline disabled:cursor-not-allowed disabled:opacity-50">
                                                        Editar
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                                                    <div>
                                                        <span className="font-semibold">CEP:</span>
                                                        <p className="mt-1 text-texto-suave">{dados.cep}</p>
                                                    </div>

                                                    <div>
                                                        <span className="font-semibold">Endereço:</span>

                                                        <p className="mt-1 text-texto-suave">
                                                            {dados.endereco}, {dados.numero}
                                                        </p>
                                                    </div>

                                                    {dados.complemento && (
                                                        <div>
                                                            <span className="font-semibold">Complemento:</span>
                                                            <p className="mt-1 text-texto-suave">{dados.complemento}</p>
                                                        </div>
                                                    )}

                                                    <div>
                                                        <span className="font-semibold">Bairro:</span>
                                                        <p className="mt-1 text-texto-suave">{dados.bairro}</p>
                                                    </div>

                                                    <div>
                                                        <span className="font-semibold">Cidade:</span>
                                                        <p className="mt-1 text-texto-suave">{dados.cidade}</p>
                                                    </div>

                                                    <div>
                                                        <span className="font-semibold">Estado:</span>
                                                        <p className="mt-1 text-texto-suave">{dados.estado}</p>
                                                    </div>
                                                </div>
                                            </section>

                                            {/* AVISO */}

                                            <div className="flex items-start gap-3 rounded-xl border border-[#dfc2ae] bg-[#fff7ee] p-4">
                                                <span className="material-icons text-2xl text-[#78221b]" aria-hidden="true">
                                                    info
                                                </span>

                                                <p className="text-sm leading-relaxed text-texto-suave">
                                                    Confira se todas as informações estão corretas.
                                                    Após a confirmação, os dados compatíveis com o servidor serão enviados ao sistema Polieus e vinculados à sua conta.
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* MENSAGENS DE ERRO */}

                                    {erro && (
                                        <div role="alert" className="mt-6 flex items-center gap-3 rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-800">
                                            <span className="material-icons" aria-hidden="true">
                                                error_outline
                                            </span>

                                            {erro}
                                        </div>
                                    )}

                                    {/* NAVEGAÇÃO ENTRE ETAPAS */}

                                    <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-[#dfc2ae] pt-6">
                                        {etapa === 1 ? (
                                            <Link to="/inicio" className="inline-flex items-center justify-center rounded-lg border border-[#b77b5e] px-6 py-3 text-sm font-semibold text-[#78221b] transition-colors hover:bg-[#f3e4d7]">
                                                Cancelar
                                            </Link>

                                        ) : (
                                            <button type="button" disabled={enviando} onClick={etapaAnterior} className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[#b77b5e] px-6 py-3 text-sm font-semibold text-[#78221b] transition-colors hover:bg-[#f3e4d7] disabled:cursor-not-allowed disabled:opacity-50">
                                                <span className="material-icons text-lg">
                                                    arrow_back
                                                </span>

                                                Voltar
                                            </button>
                                        )}

                                        {etapa < 3 ? (
                                            <button type="button" onClick={proximaEtapa} className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primaria px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primaria-hover">
                                                Próximo passo

                                                <span className="material-icons text-lg">
                                                    arrow_forward
                                                </span>
                                            </button>

                                        ) : (
                                            <button type="submit" disabled={enviando} className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primaria px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primaria-hover disabled:cursor-not-allowed disabled:opacity-60">
                                                {enviando ? (
                                                    <>
                                                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />

                                                        Registrando ocorrência...
                                                    </>

                                                ) : (
                                                    <>
                                                        Confirmar ocorrência

                                                        <span className="material-icons text-lg">
                                                            check_circle
                                                        </span>
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </>

                        ) : (

                            /* TELA DE SUCESSO */

                            <div className="py-12 text-center" role="status" aria-busy={enviando}>
                                <div className={`mx-auto flex h-24 w-24 items-center justify-center rounded-full ${idOcorrencia !== null ? 'bg-[#e8f1e5]' : 'bg-[#f9f0e7]'}`}>
                                    <span className={`material-icons text-6xl ${idOcorrencia !== null ? 'text-green-700' : 'text-primaria'}`} aria-hidden="true">
                                        {idOcorrencia !== null ? 'check_circle' : 'info'}
                                    </span>
                                </div>

                                <h3 className="mt-6 font-titulo text-3xl font-bold text-[#78221b]">
                                    {idOcorrencia !== null ? 'Ocorrência Registrada!' : 'Ocorrência Enviada!'}
                                </h3>

                                <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-texto-suave">
                                    {idOcorrencia !== null
                                        ? 'Sua ocorrência foi registrada com sucesso no sistema Polieus.'
                                        : 'Sua solicitação foi recebida pelo servidor.'}

                                    {' '}Agradecemos por contribuir para uma cidade mais organizada, acessível e participativa.
                                </p>

                                {/* PROTOCOLO E IDENTIFICAÇÃO */}

                                {idOcorrencia !== null && (
                                    <div className="mx-auto mt-6 max-w-xs rounded-xl border border-[#dfc2ae] bg-[#f9f0e7] p-5">
                                        <p className="text-xs font-semibold uppercase tracking-wider text-texto-suave">
                                            Protocolo da ocorrência
                                        </p>

                                        <p className="mt-2 font-titulo text-2xl font-bold text-[#78221b]">
                                            {enviando ? 'Gerando protocolo...' : protocolo ?? 'Não disponível'}
                                        </p>

                                        <p className="mt-3 text-xs text-texto-suave">
                                            Identificação: #{String(idOcorrencia).padStart(6, '0')}
                                        </p>
                                    </div>
                                )}

                                {/* CARREGAMENTO DO HISTÓRICO */}

                                {enviando && (
                                    <div className="mt-5 flex items-center justify-center gap-3 text-sm text-texto-suave">
                                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#dfc2ae] border-t-primaria" aria-hidden="true" />

                                        Finalizando histórico da ocorrência...
                                    </div>
                                )}

                                {/* AVISO SOBRE O HISTÓRICO */}

                                {avisoHistorico && (
                                    <div className="mx-auto mt-5 flex max-w-lg items-start gap-3 rounded-xl border border-[#dfc2ae] bg-[#fff7ee] p-4 text-left">
                                        <span className="material-icons text-xl text-[#78221b]" aria-hidden="true">
                                            info
                                        </span>

                                        <p className="text-sm leading-relaxed text-texto-suave">
                                            {avisoHistorico}
                                        </p>
                                    </div>
                                )}

                                {/* BOTÕES DE NAVEGAÇÃO */}

                                <div className="mt-8 flex flex-wrap justify-center gap-4">
                                    {!enviando && (
                                        <Link to="/minhas-ocorrencias" className="inline-flex items-center gap-2 rounded-lg bg-primaria px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primaria-hover">
                                            <span className="material-icons text-lg">
                                                assignment
                                            </span>

                                            Acompanhar ocorrência
                                        </Link>
                                    )}

                                    <button type="button" disabled={enviando || idOcorrencia === null} onClick={novaOcorrencia} className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[#b77b5e] px-6 py-3 text-sm font-semibold text-[#78221b] transition-colors hover:bg-[#f3e4d7] disabled:cursor-not-allowed disabled:opacity-50">
                                        <span className="material-icons text-lg">
                                            add_circle_outline
                                        </span>

                                        Nova ocorrência
                                    </button>

                                    {!enviando && (
                                        <Link to="/inicio" className="inline-flex items-center gap-2 rounded-lg border border-[#b77b5e] px-6 py-3 text-sm font-semibold text-[#78221b] hover:bg-[#f3e4d7]">
                                            Voltar ao início
                                        </Link>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
}
