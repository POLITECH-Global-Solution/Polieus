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

    const campoClasse = 'w-full min-w-0 max-w-full rounded-lg border border-[#dfc2ae] bg-[#fffaf4] px-4 py-3 font-corpo text-sm text-texto outline-none transition-colors placeholder:text-[#807167] focus:border-primaria focus:ring-2 focus:ring-primaria/15';

    const rotuloClasse = 'mb-2 block font-corpo text-sm font-semibold text-[#46352d]';

    return (

        <main className="min-h-screen w-full min-w-0 flex-1 bg-fundo font-corpo text-texto">

            {/* CABEÇALHO DA PÁGINA */}

            <header className="border-b border-[#d8b9a5] bg-[#fffaf4] py-5 pr-5 pl-20 sm:pr-8 sm:pl-20 lg:px-10">

                <h1 className="font-titulo text-3xl font-bold text-[#78221b] sm:text-4xl">
                    Registrar Ocorrência
                </h1>

                <nav aria-label="Navegação estrutural" className="mt-1 flex flex-wrap items-center gap-2 text-sm text-[#6b4438]">

                    <Link to="/inicio" className="text-[#6b4438] hover:text-primaria hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria">
                        Início
                    </Link>

                    <span className="material-icons text-base text-[#6b4438]" aria-hidden="true">
                        chevron_right
                    </span>

                    <span aria-current="page" className="font-semibold text-[#78221b]">
                        Registrar Ocorrência
                    </span>

                </nav>

            </header>

            <div className="mx-auto w-full min-w-0 max-w-5xl px-4 py-8 sm:px-8 sm:py-10 lg:py-12">

                {/* APRESENTAÇÃO */}

                <section className="mb-8 min-w-0 text-center">

                    <span className="material-icons mb-3 text-4xl text-[#78221b] sm:text-5xl" aria-hidden="true">
                        add_location_alt
                    </span>

                    <h2 className="font-titulo text-3xl font-bold text-[#78221b] sm:text-4xl">
                        Registre uma Ocorrência
                    </h2>

                    <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-[#51453e] sm:text-base">
                        Encontrou algum problema em sua cidade?
                        Registre sua ocorrência e contribua para uma
                        cidade mais organizada, acessível e participativa.
                    </p>

                    <div className="mx-auto mt-5 flex max-w-sm items-center gap-3" aria-hidden="true">

                        <span className="h-px flex-1 bg-[#b77b5e]" />
                        <span className="h-2.5 w-2.5 shrink-0 rotate-45 bg-[#78221b]" />
                        <span className="h-px flex-1 bg-[#b77b5e]" />

                    </div>

                </section>

                <section className="w-full min-w-0 overflow-hidden rounded-2xl border border-[#dfc2ae] bg-[#fffaf4] shadow-lg">

                    <div className="h-2 bg-primaria" />

                    <div className="min-w-0 p-4 sm:p-8 lg:p-10">

                        {!finalizado ? (

                            <>

                                {/* INDICADOR DE ETAPAS */}

                                <div className="mb-8 sm:mb-10">

                                    <div className="relative mx-auto flex w-full min-w-0 max-w-2xl items-start justify-between">

                                        <div className="absolute top-5 right-[16%] left-[16%] h-0.5 bg-[#dfc2ae]" aria-hidden="true" />

                                        <div className="absolute top-5 left-[16%] h-0.5 bg-primaria transition-all duration-500 motion-reduce:transition-none" style={{ width: etapa === 1 ? '0%' : etapa === 2 ? '34%' : '68%' }} aria-hidden="true" />

                                        {[
                                            { numero: 1, titulo: 'Descrição' },
                                            { numero: 2, titulo: 'Localização' },
                                            { numero: 3, titulo: 'Confirmação' },
                                        ].map(item => (

                                            <div key={item.numero} aria-current={etapa === item.numero ? 'step' : undefined} className="relative z-10 flex w-1/3 min-w-0 flex-col items-center px-1 text-center">

                                                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 font-semibold transition-all duration-300 motion-reduce:transition-none ${etapa >= item.numero ? 'border-primaria bg-primaria text-white' : 'border-[#dfc2ae] bg-[#fffaf4] text-[#77675d]'}`}>

                                                    {etapa > item.numero ? (

                                                        <span className="material-icons text-xl text-white" aria-hidden="true">
                                                            check
                                                        </span>

                                                    ) : (

                                                        item.numero

                                                    )}

                                                </div>

                                                <span className={`mt-3 wrap-break-word text-xs font-semibold sm:text-sm ${etapa >= item.numero ? 'text-[#78221b]' : 'text-[#51453e]'}`}>
                                                    {item.titulo}
                                                </span>

                                            </div>

                                        ))}

                                    </div>

                                </div>

                                <form onSubmit={finalizarOcorrencia} noValidate aria-busy={enviando} className="w-full min-w-0">

                                    {/* ETAPA 1 - DESCRIÇÃO */}

                                    {etapa === 1 && (

                                        <div className="min-w-0 space-y-6">

                                            <div className="border-b border-[#dfc2ae] pb-5">

                                                <div className="flex min-w-0 items-center gap-3">

                                                    <span className="material-icons shrink-0 text-3xl text-[#78221b]" aria-hidden="true">
                                                        edit_note
                                                    </span>

                                                    <h3 className="min-w-0 font-titulo text-xl font-bold text-[#78221b] sm:text-2xl">
                                                        Descrição da Ocorrência
                                                    </h3>

                                                </div>

                                                <p className="mt-2 text-sm text-[#51453e]">
                                                    Conte-nos qual problema foi identificado.
                                                </p>

                                            </div>

                                            {/* CATEGORIA */}

                                            <div className="min-w-0">

                                                <label htmlFor="categoria" className={rotuloClasse}>
                                                    Categoria do problema
                                                    <span className="ml-1 text-red-700" aria-hidden="true">*</span>
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

                                            <div className="min-w-0">

                                                <label htmlFor="descricao" className={rotuloClasse}>
                                                    Descrição
                                                    <span className="ml-1 text-red-700" aria-hidden="true">*</span>
                                                </label>

                                                <textarea id="descricao" rows={6} maxLength={1000} value={dados.descricao} onChange={evento => atualizarCampo('descricao', evento.target.value)} placeholder="Descreva o problema encontrado com o máximo de detalhes possível..." className={`${campoClasse} resize-y`} aria-describedby="descricaoOrientacao" required />

                                                <div className="mt-2 flex flex-wrap justify-between gap-x-3 gap-y-1 text-xs text-[#51453e]">

                                                    <span id="descricaoOrientacao" className="min-w-0">
                                                        Informe o que aconteceu e como isso afeta a região.
                                                    </span>

                                                    <span className="shrink-0">
                                                        {dados.descricao.length}/1000
                                                    </span>

                                                </div>

                                            </div>

                                            {/* FOTO OPCIONAL */}

                                            <div className="min-w-0">

                                                <p className={rotuloClasse}>
                                                    Foto da ocorrência

                                                    <span className="ml-2 font-normal text-[#51453e]">
                                                        (opcional)
                                                    </span>

                                                </p>

                                                {!fotoPreview ? (

                                                    <label className="flex w-full min-w-0 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#d8b9a5] bg-[#f9f0e7] px-4 py-8 text-center transition-colors hover:border-primaria hover:bg-[#f3e4d7] focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primaria sm:px-5 sm:py-9">

                                                        <span className="material-icons text-4xl text-[#78221b]" aria-hidden="true">
                                                            add_a_photo
                                                        </span>

                                                        <span className="mt-3 text-sm font-semibold text-[#78221b]">
                                                            Adicionar foto
                                                        </span>

                                                        <span className="mt-1 text-xs text-[#51453e]">
                                                            Clique para selecionar uma imagem
                                                        </span>

                                                        <span className="mt-1 text-xs text-[#51453e]">
                                                            JPG, PNG ou WEBP — até 5 MB
                                                        </span>

                                                        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={selecionarFoto} className="sr-only" aria-label="Selecionar foto da ocorrência" aria-describedby="orientacaoFoto" />

                                                    </label>

                                                ) : (

                                                    <div className="w-full min-w-0 rounded-xl border border-[#dfc2ae] bg-[#f9f0e7] p-4">

                                                        <img src={fotoPreview} alt="Pré-visualização da foto selecionada" className="mx-auto max-h-64 max-w-full rounded-lg object-contain" />

                                                        <div className="mt-4 flex min-w-0 flex-wrap items-center justify-between gap-3">

                                                            <span className="min-w-0 max-w-full wrap-break-word text-sm text-[#51453e] sm:max-w-xs">
                                                                {foto?.name}
                                                            </span>

                                                            <button type="button" onClick={removerFoto} className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-red-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700">

                                                                <span className="material-icons shrink-0 text-lg" aria-hidden="true">
                                                                    delete_outline
                                                                </span>

                                                                Remover foto

                                                            </button>

                                                        </div>

                                                    </div>

                                                )}

                                                <p id="orientacaoFoto" className="mt-2 text-xs leading-relaxed text-[#51453e]">
                                                    A foto é opcional e serve apenas para pré-visualização nesta versão. Ela não será enviada ao servidor.
                                                </p>

                                            </div>

                                        </div>

                                    )}

                                    {/* ETAPA 2 - LOCALIZAÇÃO */}

                                    {etapa === 2 && (

                                        <div className="min-w-0 space-y-6">

                                            <div className="border-b border-[#dfc2ae] pb-5">

                                                <div className="flex min-w-0 items-center gap-3">

                                                    <span className="material-icons shrink-0 text-3xl text-[#78221b]" aria-hidden="true">
                                                        location_on
                                                    </span>

                                                    <h3 className="min-w-0 font-titulo text-xl font-bold text-[#78221b] sm:text-2xl">
                                                        Localização da Ocorrência
                                                    </h3>

                                                </div>

                                                <p className="mt-2 text-sm text-[#51453e]">
                                                    Informe o endereço onde o problema foi identificado.
                                                </p>

                                            </div>

                                            {/* CEP */}

                                            <div className="w-full min-w-0 sm:max-w-xs">

                                                <label htmlFor="cep" className={rotuloClasse}>
                                                    CEP
                                                    <span className="ml-1 text-red-700" aria-hidden="true">*</span>
                                                </label>

                                                <input id="cep" type="text" inputMode="numeric" maxLength={9} value={dados.cep} onChange={evento => atualizarCampo('cep', formatarCep(evento.target.value))} placeholder="00000-000" className={campoClasse} required />

                                            </div>

                                            {/* ENDEREÇO E NÚMERO */}

                                            <div className="grid min-w-0 grid-cols-1 gap-5 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">

                                                <div className="min-w-0">

                                                    <label htmlFor="endereco" className={rotuloClasse}>
                                                        Endereço
                                                        <span className="ml-1 text-red-700" aria-hidden="true">*</span>
                                                    </label>

                                                    <input id="endereco" type="text" value={dados.endereco} onChange={evento => atualizarCampo('endereco', evento.target.value)} placeholder="Rua, avenida ou travessa" className={campoClasse} required />

                                                </div>

                                                <div className="min-w-0">

                                                    <label htmlFor="numero" className={rotuloClasse}>
                                                        Número
                                                        <span className="ml-1 text-red-700" aria-hidden="true">*</span>
                                                    </label>

                                                    <input id="numero" type="text" value={dados.numero} onChange={evento => atualizarCampo('numero', evento.target.value)} placeholder="Ex.: 250" className={campoClasse} required />

                                                </div>

                                            </div>

                                            {/* COMPLEMENTO E BAIRRO */}

                                            <div className="grid min-w-0 grid-cols-1 gap-5 sm:grid-cols-2">

                                                <div className="min-w-0">

                                                    <label htmlFor="complemento" className={rotuloClasse}>
                                                        Complemento

                                                        <span className="ml-2 font-normal text-[#51453e]">
                                                            (opcional)
                                                        </span>

                                                    </label>

                                                    <input id="complemento" type="text" value={dados.complemento} onChange={evento => atualizarCampo('complemento', evento.target.value)} placeholder="Apartamento, bloco ou referência" className={campoClasse} />

                                                </div>

                                                <div className="min-w-0">

                                                    <label htmlFor="bairro" className={rotuloClasse}>
                                                        Bairro
                                                        <span className="ml-1 text-red-700" aria-hidden="true">*</span>
                                                    </label>

                                                    <input id="bairro" type="text" value={dados.bairro} onChange={evento => atualizarCampo('bairro', evento.target.value)} placeholder="Nome do bairro" className={campoClasse} required />

                                                </div>

                                            </div>

                                            {/* CIDADE E ESTADO */}

                                            <div className="grid min-w-0 grid-cols-1 gap-5 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">

                                                <div className="min-w-0">

                                                    <label htmlFor="cidade" className={rotuloClasse}>
                                                        Cidade
                                                        <span className="ml-1 text-red-700" aria-hidden="true">*</span>
                                                    </label>

                                                    <input id="cidade" type="text" value={dados.cidade} onChange={evento => atualizarCampo('cidade', evento.target.value)} placeholder="Nome da cidade" className={campoClasse} required />

                                                </div>

                                                <div className="min-w-0">

                                                    <label htmlFor="estado" className={rotuloClasse}>
                                                        Estado
                                                        <span className="ml-1 text-red-700" aria-hidden="true">*</span>
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

                                            <div className="flex min-w-0 items-start gap-3 rounded-xl border border-[#dfc2ae] bg-[#fff7ee] p-4">

                                                <span className="material-icons shrink-0 text-xl text-[#78221b]" aria-hidden="true">
                                                    info
                                                </span>

                                                <p className="min-w-0 text-xs leading-relaxed text-[#51453e]">
                                                    Nesta versão, o servidor recebe o endereço, o número e o CEP. Os demais campos são utilizados para conferência da localização.
                                                </p>

                                            </div>

                                        </div>

                                    )}

                                    {/* ETAPA 3 - CONFIRMAÇÃO */}

                                    {etapa === 3 && (

                                        <div className="min-w-0 space-y-6">

                                            <div className="border-b border-[#dfc2ae] pb-5">

                                                <div className="flex min-w-0 items-center gap-3">

                                                    <span className="material-icons shrink-0 text-3xl text-[#78221b]" aria-hidden="true">
                                                        fact_check
                                                    </span>

                                                    <h3 className="min-w-0 font-titulo text-xl font-bold text-[#78221b] sm:text-2xl">
                                                        Confirmação da Ocorrência
                                                    </h3>

                                                </div>

                                                <p className="mt-2 text-sm text-[#51453e]">
                                                    Revise as informações antes de finalizar.
                                                </p>

                                            </div>

                                            {/* RESUMO DA DESCRIÇÃO */}

                                            <section className="min-w-0 rounded-xl border border-[#dfc2ae] bg-[#f9f0e7] p-4 sm:p-5">

                                                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">

                                                    <h4 className="flex min-w-0 items-center gap-2 font-titulo text-lg font-bold text-[#78221b]">

                                                        <span className="material-icons shrink-0" aria-hidden="true">
                                                            description
                                                        </span>

                                                        Descrição

                                                    </h4>

                                                    <button type="button" disabled={enviando} onClick={() => setEtapa(1)} className="cursor-pointer text-sm font-semibold text-primaria hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria disabled:cursor-not-allowed disabled:opacity-50">
                                                        Editar
                                                    </button>

                                                </div>

                                                <div className="min-w-0 space-y-3 text-sm">

                                                    <div className="min-w-0">

                                                        <span className="font-semibold">Categoria:</span>

                                                        <p className="mt-1 wrap-break-word text-[#51453e]">
                                                            {dados.categoria}
                                                        </p>

                                                    </div>

                                                    <div className="min-w-0">

                                                        <span className="font-semibold">Descrição:</span>

                                                        <p className="mt-1 wrap-break-word whitespace-pre-wrap leading-relaxed text-[#51453e]">
                                                            {dados.descricao}
                                                        </p>

                                                    </div>

                                                    <div className="min-w-0">

                                                        <span className="font-semibold">Foto:</span>

                                                        <p className="mt-1 wrap-break-word text-[#51453e]">
                                                            {foto ? `${foto.name} (pré-visualização local)` : 'Nenhuma foto adicionada'}
                                                        </p>

                                                    </div>

                                                </div>

                                            </section>

                                            {/* RESUMO DA LOCALIZAÇÃO */}

                                            <section className="min-w-0 rounded-xl border border-[#dfc2ae] bg-[#f9f0e7] p-4 sm:p-5">

                                                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">

                                                    <h4 className="flex min-w-0 items-center gap-2 font-titulo text-lg font-bold text-[#78221b]">

                                                        <span className="material-icons shrink-0" aria-hidden="true">
                                                            location_on
                                                        </span>

                                                        Localização

                                                    </h4>

                                                    <button type="button" disabled={enviando} onClick={() => setEtapa(2)} className="cursor-pointer text-sm font-semibold text-primaria hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria disabled:cursor-not-allowed disabled:opacity-50">
                                                        Editar
                                                    </button>

                                                </div>

                                                <div className="grid min-w-0 grid-cols-1 gap-4 text-sm sm:grid-cols-2">

                                                    <div className="min-w-0">

                                                        <span className="font-semibold">CEP:</span>

                                                        <p className="mt-1 wrap-break-word text-[#51453e]">
                                                            {dados.cep}
                                                        </p>

                                                    </div>

                                                    <div className="min-w-0">

                                                        <span className="font-semibold">Endereço:</span>

                                                        <p className="mt-1 wrap-break-word text-[#51453e]">
                                                            {dados.endereco}, {dados.numero}
                                                        </p>

                                                    </div>

                                                    {dados.complemento && (

                                                        <div className="min-w-0">

                                                            <span className="font-semibold">Complemento:</span>

                                                            <p className="mt-1 wrap-break-word text-[#51453e]">
                                                                {dados.complemento}
                                                            </p>

                                                        </div>

                                                    )}

                                                    <div className="min-w-0">

                                                        <span className="font-semibold">Bairro:</span>

                                                        <p className="mt-1 wrap-break-word text-[#51453e]">
                                                            {dados.bairro}
                                                        </p>

                                                    </div>

                                                    <div className="min-w-0">

                                                        <span className="font-semibold">Cidade:</span>

                                                        <p className="mt-1 wrap-break-word text-[#51453e]">
                                                            {dados.cidade}
                                                        </p>

                                                    </div>

                                                    <div className="min-w-0">

                                                        <span className="font-semibold">Estado:</span>

                                                        <p className="mt-1 wrap-break-word text-[#51453e]">
                                                            {dados.estado}
                                                        </p>

                                                    </div>

                                                </div>

                                            </section>

                                            {/* AVISO */}

                                            <div className="flex min-w-0 items-start gap-3 rounded-xl border border-[#dfc2ae] bg-[#fff7ee] p-4">

                                                <span className="material-icons shrink-0 text-2xl text-[#78221b]" aria-hidden="true">
                                                    info
                                                </span>

                                                <p className="min-w-0 text-sm leading-relaxed text-[#51453e]">
                                                    Confira se todas as informações estão corretas.
                                                    Após a confirmação, os dados compatíveis com o servidor serão enviados ao sistema Polieus e vinculados à sua conta.
                                                </p>

                                            </div>

                                        </div>

                                    )}

                                    {/* MENSAGENS DE ERRO */}

                                    {erro && (

                                        <div role="alert" className="mt-6 flex min-w-0 items-start gap-3 rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-800">

                                            <span className="material-icons shrink-0" aria-hidden="true">
                                                error_outline
                                            </span>

                                            <span className="min-w-0 wrap-break-word">
                                                {erro}
                                            </span>

                                        </div>

                                    )}

                                    {/* NAVEGAÇÃO ENTRE ETAPAS */}

                                    <div className="mt-8 flex min-w-0 flex-col items-stretch justify-between gap-3 border-t border-[#dfc2ae] pt-6 sm:mt-10 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">

                                        {etapa === 1 ? (

                                            <Link to="/inicio" className="inline-flex w-full items-center justify-center rounded-lg border border-[#b77b5e] px-5 py-3 text-center text-sm font-semibold text-[#78221b] transition-colors hover:bg-[#f3e4d7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria sm:w-auto sm:px-6">
                                                Cancelar
                                            </Link>

                                        ) : (

                                            <button type="button" disabled={enviando} onClick={etapaAnterior} className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#b77b5e] px-5 py-3 text-sm font-semibold text-[#78221b] transition-colors hover:bg-[#f3e4d7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-6">

                                                <span className="material-icons shrink-0 text-lg" aria-hidden="true">
                                                    arrow_back
                                                </span>

                                                Voltar

                                            </button>

                                        )}

                                        {etapa < 3 ? (

                                            <button type="button" onClick={proximaEtapa} className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primaria px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primaria-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria sm:w-auto sm:px-6">

                                                <span className="text-white">
                                                    Próximo passo
                                                </span>

                                                <span className="material-icons shrink-0 text-lg text-white" aria-hidden="true">
                                                    arrow_forward
                                                </span>

                                            </button>

                                        ) : (

                                            <button type="submit" disabled={enviando} className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primaria px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primaria-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-6">

                                                {enviando ? (

                                                    <>

                                                        <span className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-white/40 border-t-white motion-reduce:animate-none" aria-hidden="true" />

                                                        <span className="text-white">
                                                            Registrando ocorrência...
                                                        </span>

                                                    </>

                                                ) : (

                                                    <>

                                                        <span className="text-white">
                                                            Confirmar ocorrência
                                                        </span>

                                                        <span className="material-icons shrink-0 text-lg text-white" aria-hidden="true">
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

                            <div className="w-full min-w-0 py-8 text-center sm:py-12" role="status" aria-busy={enviando}>

                                <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full sm:h-24 sm:w-24 ${idOcorrencia !== null ? 'bg-[#e8f1e5]' : 'bg-[#f9f0e7]'}`}>

                                    <span className={`material-icons text-5xl sm:text-6xl ${idOcorrencia !== null ? 'text-green-700' : 'text-primaria'}`} aria-hidden="true">
                                        {idOcorrencia !== null ? 'check_circle' : 'info'}
                                    </span>

                                </div>

                                <h3 className="mt-6 font-titulo text-2xl font-bold text-[#78221b] sm:text-3xl">
                                    {idOcorrencia !== null ? 'Ocorrência Registrada!' : 'Ocorrência Enviada!'}
                                </h3>

                                <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-[#51453e] sm:text-base">

                                    {idOcorrencia !== null
                                        ? 'Sua ocorrência foi registrada com sucesso no sistema Polieus.'
                                        : 'Sua solicitação foi recebida pelo servidor.'}

                                    {' '}Agradecemos por contribuir para uma cidade mais organizada, acessível e participativa.

                                </p>

                                {/* PROTOCOLO E IDENTIFICAÇÃO */}

                                {idOcorrencia !== null && (

                                    <div className="mx-auto mt-6 w-full min-w-0 max-w-xs rounded-xl border border-[#dfc2ae] bg-[#f9f0e7] p-4 sm:p-5">

                                        <p className="text-xs font-semibold uppercase tracking-wider text-[#51453e]">
                                            Protocolo da ocorrência
                                        </p>

                                        <p className="mt-2 wrap-break-word font-titulo text-xl font-bold text-[#78221b] sm:text-2xl">
                                            {enviando ? 'Gerando protocolo...' : protocolo ?? 'Não disponível'}
                                        </p>

                                        <p className="mt-3 wrap-break-word text-xs text-[#51453e]">
                                            Identificação: #{String(idOcorrencia).padStart(6, '0')}
                                        </p>

                                    </div>

                                )}

                                {/* CARREGAMENTO DO HISTÓRICO */}

                                {enviando && (

                                    <div className="mt-5 flex min-w-0 items-center justify-center gap-3 text-sm text-[#51453e]">

                                        <span className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-[#dfc2ae] border-t-primaria motion-reduce:animate-none" aria-hidden="true" />

                                        Finalizando histórico da ocorrência...

                                    </div>

                                )}

                                {/* AVISO SOBRE O HISTÓRICO */}

                                {avisoHistorico && (

                                    <div className="mx-auto mt-5 flex min-w-0 max-w-lg items-start gap-3 rounded-xl border border-[#dfc2ae] bg-[#fff7ee] p-4 text-left">

                                        <span className="material-icons shrink-0 text-xl text-[#78221b]" aria-hidden="true">
                                            info
                                        </span>

                                        <p className="min-w-0 wrap-break-word text-sm leading-relaxed text-[#51453e]">
                                            {avisoHistorico}
                                        </p>

                                    </div>

                                )}

                                {/* BOTÕES DE NAVEGAÇÃO */}

                                <div className="mt-8 flex min-w-0 flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">

                                    {!enviando && (

                                        <Link to="/minhas-ocorrencias" className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primaria px-5 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-primaria-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria sm:w-auto sm:px-6">

                                            <span className="material-icons shrink-0 text-lg text-white" aria-hidden="true">
                                                assignment
                                            </span>

                                            <span className="text-white">
                                                Acompanhar ocorrência
                                            </span>

                                        </Link>

                                    )}

                                    <button type="button" disabled={enviando || idOcorrencia === null} onClick={novaOcorrencia} className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#b77b5e] px-5 py-3 text-sm font-semibold text-[#78221b] transition-colors hover:bg-[#f3e4d7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-6">

                                        <span className="material-icons shrink-0 text-lg" aria-hidden="true">
                                            add_circle_outline
                                        </span>

                                        Nova ocorrência

                                    </button>

                                    {!enviando && (

                                        <Link to="/inicio" className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#b77b5e] px-5 py-3 text-center text-sm font-semibold text-[#78221b] hover:bg-[#f3e4d7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria sm:w-auto sm:px-6">
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