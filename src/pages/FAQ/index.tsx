
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';

interface FaqItemData {
  id: number;
  categoria: 'cidadao' | 'administrador';
  pergunta: string;
  resposta: string;
}

interface FaqForm {
  busca: string;
}

type Filtro = 'todos' | 'cidadao' | 'administrador';

const faqData: FaqItemData[] = [
  {
    id: 1,
    categoria: 'cidadao',
    pergunta: 'Como realizar meu cadastro no Polieus?',
    resposta:
      'Na página inicial, selecione Área do Cidadão e clique na opção Cadastrar. Preencha seus dados pessoais, como nome completo, CPF, telefone, e-mail e senha. Após a implementação do sistema de autenticação, será possível concluir o cadastro e acessar os serviços da plataforma.',
  },
  {
    id: 2,
    categoria: 'cidadao',
    pergunta: 'Como registrar uma ocorrência?',
    resposta:
      'Acesse a opção Registrar Ocorrência no menu lateral. Nessa área, você poderá informar o problema identificado, selecionar sua categoria, descrever a situação e indicar a localização. Quando o serviço estiver integrado ao sistema, o registro será encaminhado para acompanhamento.',
  },
  {
    id: 3,
    categoria: 'cidadao',
    pergunta: 'Como acompanhar o status da minha solicitação?',
    resposta:
      'Acesse Minhas Ocorrências no menu lateral. Essa página reunirá os registros vinculados à sua conta, permitindo consultar informações e acompanhar as atualizações de cada solicitação.',
  },
  {
    id: 4,
    categoria: 'cidadao',
    pergunta: 'O que são os níveis de prioridade das ocorrências?',
    resposta:
      'Os níveis de prioridade ajudam a organizar os registros de acordo com a gravidade e a urgência do problema. Eles poderão orientar a análise das demandas pelos responsáveis, considerando os critérios definidos para o atendimento.',
  },
  {
    id: 5,
    categoria: 'cidadao',
    pergunta: 'Como funciona o mapa de ocorrências?',
    resposta:
      'O Mapa de Ocorrências foi planejado para apresentar visualmente os problemas registrados em diferentes regiões. Com ele, será possível identificar localizações e consultar informações sobre as ocorrências disponíveis.',
  },
  {
    id: 6,
    categoria: 'cidadao',
    pergunta: 'Posso registrar mais de uma ocorrência?',
    resposta:
      'Sim. A proposta do Polieus permite que o cidadão registre diferentes problemas urbanos. Cada ocorrência deverá possuir suas próprias informações, localização e acompanhamento.',
  },
  {
    id: 7,
    categoria: 'cidadao',
    pergunta: 'Como consultar as informações de transparência?',
    resposta:
      'Acesse a opção Transparência no menu lateral. Essa área foi planejada para apresentar informações sobre as ocorrências e o acompanhamento das demandas, contribuindo para uma gestão pública mais transparente.',
  },
  {
    id: 8,
    categoria: 'cidadao',
    pergunta: 'Como atualizar meus dados pessoais?',
    resposta:
      'Acesse Meu Perfil no menu lateral. Nessa página, você poderá consultar seus dados cadastrais e, quando a funcionalidade estiver implementada, atualizar as informações permitidas pelo sistema.',
  },
  {
    id: 9,
    categoria: 'administrador',
    pergunta: 'Como acessar a área administrativa do Polieus?',
    resposta:
      'Na página inicial, selecione Área Administrativa. Em seguida, utilize a aba Entrar para informar seu e-mail institucional e senha. O acesso às funcionalidades administrativas dependerá da autenticação e das permissões configuradas no sistema.',
  },
  {
    id: 10,
    categoria: 'administrador',
    pergunta: 'Como realizar o cadastro de um administrador?',
    resposta:
      'Na tela de acesso administrativo, selecione a aba Cadastrar e preencha as informações solicitadas. A criação e a liberação de contas administrativas deverão respeitar as regras de autorização definidas para a plataforma.',
  },
  {
    id: 11,
    categoria: 'administrador',
    pergunta: 'Como visualizar todas as ocorrências registradas?',
    resposta:
      'Acesse a opção Ocorrências no menu administrativo. Essa área foi planejada para reunir os registros enviados pelos cidadãos, permitindo consultar suas informações e acompanhar as demandas recebidas.',
  },
  {
    id: 12,
    categoria: 'administrador',
    pergunta: 'Como atualizar o status de uma ocorrência?',
    resposta:
      'Na área de gerenciamento de ocorrências, selecione o registro desejado. Conforme as permissões disponíveis, o administrador poderá atualizar as informações de acompanhamento e o status da solicitação.',
  },
  {
    id: 13,
    categoria: 'administrador',
    pergunta: 'Como funciona o dashboard administrativo?',
    resposta:
      'O dashboard foi planejado para apresentar uma visão geral das ocorrências e dos indicadores da plataforma. Seu objetivo é facilitar a análise das demandas e apoiar a organização das atividades administrativas.',
  },
  {
    id: 14,
    categoria: 'administrador',
    pergunta: 'Como consultar o mapa na área administrativa?',
    resposta:
      'Acesse a opção Mapa no menu administrativo. A visualização geográfica permitirá analisar a distribuição das ocorrências e identificar regiões com maior concentração de registros.',
  },
  {
    id: 15,
    categoria: 'administrador',
    pergunta: 'Como gerar e consultar relatórios?',
    resposta:
      'Acesse a opção Relatórios no menu administrativo. Essa funcionalidade foi planejada para organizar informações sobre as ocorrências, seus status e outros indicadores úteis para o acompanhamento da gestão.',
  },
  {
    id: 16,
    categoria: 'administrador',
    pergunta: 'Qual é a importância da área administrativa?',
    resposta:
      'A área administrativa busca apoiar a organização, a análise e o acompanhamento das demandas registradas pelos cidadãos. Dessa forma, o Polieus pretende contribuir para decisões mais informadas, transparentes e responsáveis.',
  },
];

export default function FAQ() {
  const { register, control } = useForm<FaqForm>({
    defaultValues: {
      busca: '',
    },
  });

  const busca =
    useWatch({
      control,
      name: 'busca',
    }) ?? '';

  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [abertoId, setAbertoId] = useState<number | null>(null);

  const toggleAccordion = (id: number) => {
    setAbertoId((atual) => (atual === id ? null : id));
  };

  const buscaNormalizada = busca.trim().toLocaleLowerCase('pt-BR');

  const filteredFaqs = faqData.filter((item) => {
    const correspondeCategoria =
      filtro === 'todos' || item.categoria === filtro;

    const correspondeBusca =
      item.pergunta.toLocaleLowerCase('pt-BR').includes(buscaNormalizada) ||
      item.resposta.toLocaleLowerCase('pt-BR').includes(buscaNormalizada);

    return correspondeCategoria && correspondeBusca;
  });

  return (
    <main className="min-h-screen w-full bg-fundo font-corpo text-texto">
      <header className="border-b border-[#d8b9a5] bg-[#fffaf4] py-5 pr-5 pl-20 sm:pr-8 sm:pl-20 lg:px-10">
        <h1 className="font-titulo text-3xl font-bold text-[#78221b] sm:text-4xl">
          FAQ
        </h1>

        <nav
          aria-label="Navegação estrutural"
          className="mt-1 flex items-center gap-2 text-sm text-[#6b4438]"
        >
          <Link
            to="/inicio"
            className="hover:text-primaria hover:underline"
          >
            Início
          </Link>

          <span
            className="material-icons text-base"
            aria-hidden="true"
          >
            chevron_right
          </span>

          <span
            aria-current="page"
            className="font-semibold text-[#78221b]"
          >
            FAQ
          </span>
        </nav>
      </header>

      <section className="relative overflow-hidden px-5 py-12 sm:px-8 lg:px-10">
        <div
          className="pointer-events-none absolute -right-25 top-24 size-80 rounded-full border border-[#dec6b3] opacity-35"
          aria-hidden="true"
        />

        <div
          className="pointer-events-none absolute -left-25 bottom-12 size-72 rounded-full border border-[#dec6b3] opacity-35"
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <p className="mb-3 text-xs font-bold tracking-[0.2em] text-[#9a4937] uppercase">
              Central de ajuda
            </p>

            <h2 className="font-titulo text-3xl font-bold text-[#78221b] sm:text-4xl lg:text-5xl">
              Perguntas Frequentes
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-texto-suave sm:text-base">
              Encontre respostas para as dúvidas mais comuns sobre o
              Polieus, desde o registro de ocorrências até as
              funcionalidades de gestão administrativa.
            </p>

            <div
              className="mt-6 flex items-center justify-center gap-3"
              aria-hidden="true"
            >
              <span className="h-px w-20 bg-[#a34c3a]" />
              <span className="size-2 rotate-45 bg-[#8c251e]" />
              <span className="h-px w-20 bg-[#a34c3a]" />
            </div>
          </div>

          <div className="mx-auto mb-8 max-w-3xl">
            <div className="relative">
              <span
                className="material-icons pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-2xl text-[#78221b]"
                aria-hidden="true"
              >
                search
              </span>

              <input
                type="search"
                placeholder="Busque por uma pergunta..."
                aria-label="Buscar perguntas frequentes"
                {...register('busca')}
                className="w-full rounded-xl border border-[#dfc2ae] bg-[#fffaf4] py-4 pr-5 pl-13 text-sm text-texto shadow-sm outline-none transition-colors placeholder:text-[#8c8178] focus:border-primaria focus:ring-2 focus:ring-primaria/15 sm:text-base"
              />
            </div>
          </div>

          <div
            className="mb-10 flex flex-wrap items-center justify-center gap-3"
            role="group"
            aria-label="Filtrar perguntas por área"
          >
            <button
              type="button"
              onClick={() => {
                setFiltro('todos');
                setAbertoId(null);
              }}
              aria-pressed={filtro === 'todos'}
              className={`flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-all ${
                filtro === 'todos'
                  ? 'border-primaria bg-primaria text-white shadow-sm'
                  : 'border-[#dfc2ae] bg-[#fffaf4] text-[#78221b] hover:bg-[#f0dfd2]'
              }`}
            >
              <span className="material-icons text-lg" aria-hidden="true">
                help_outline
              </span>
              Todas as perguntas
            </button>

            <button
              type="button"
              onClick={() => {
                setFiltro('cidadao');
                setAbertoId(null);
              }}
              aria-pressed={filtro === 'cidadao'}
              className={`flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-all ${
                filtro === 'cidadao'
                  ? 'border-primaria bg-primaria text-white shadow-sm'
                  : 'border-[#dfc2ae] bg-[#fffaf4] text-[#78221b] hover:bg-[#f0dfd2]'
              }`}
            >
              <span className="material-icons text-lg" aria-hidden="true">
                person
              </span>
              Área do Cidadão
            </button>

            <button
              type="button"
              onClick={() => {
                setFiltro('administrador');
                setAbertoId(null);
              }}
              aria-pressed={filtro === 'administrador'}
              className={`flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-all ${
                filtro === 'administrador'
                  ? 'border-primaria bg-primaria text-white shadow-sm'
                  : 'border-[#dfc2ae] bg-[#fffaf4] text-[#78221b] hover:bg-[#f0dfd2]'
              }`}
            >
              <span className="material-icons text-lg" aria-hidden="true">
                account_balance
              </span>
              Área Administrativa
            </button>
          </div>

          <div className="mx-auto max-w-4xl">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span
                  className="material-icons text-2xl text-[#78221b]"
                  aria-hidden="true"
                >
                  menu_book
                </span>

                <h3 className="font-titulo text-xl font-bold text-[#78221b] sm:text-2xl">
                  {filtro === 'cidadao'
                    ? 'Dúvidas do Cidadão'
                    : filtro === 'administrador'
                      ? 'Dúvidas Administrativas'
                      : 'Todas as Dúvidas'}
                </h3>
              </div>

              <span className="rounded-full border border-[#dfc2ae] bg-[#fffaf4] px-4 py-1.5 text-xs font-semibold text-[#78221b]">
                {filteredFaqs.length}{' '}
                {filteredFaqs.length === 1 ? 'pergunta' : 'perguntas'}
              </span>
            </div>

            <section
              className="space-y-3"
              aria-label="Lista de perguntas frequentes"
            >
              {filteredFaqs.length === 0 ? (
                <div
                  className="rounded-xl border border-[#dfc2ae] bg-[#fffaf4] px-5 py-10 text-center shadow-sm"
                  role="status"
                >
                  <span
                    className="material-icons mb-3 text-4xl text-[#9a4937]"
                    aria-hidden="true"
                  >
                    search_off
                  </span>

                  <p className="text-sm text-texto-suave sm:text-base">
                    Nenhuma pergunta encontrada para "{busca}".
                  </p>
                </div>
              ) : (
                filteredFaqs.map((item, index) => {
                  const isOpen = abertoId === item.id;
                  const respostaId = `faq-resposta-${item.id}`;

                  return (
                    <article
                      key={item.id}
                      className={`overflow-hidden rounded-xl border bg-[#fffaf4] transition-all duration-300 ${
                        isOpen
                          ? 'border-primaria shadow-[0_8px_24px_rgba(91,42,28,0.10)]'
                          : 'border-[#dfc2ae] shadow-sm hover:border-[#bd8c73] hover:shadow-md'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleAccordion(item.id)}
                        aria-expanded={isOpen}
                        aria-controls={respostaId}
                        className="flex w-full items-center justify-between gap-4 px-4 py-5 text-left outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primaria sm:px-6"
                      >
                        <div className="flex min-w-0 items-center gap-3 sm:gap-5">
                          <span className="w-7 shrink-0 font-titulo text-base font-bold text-[#b78c78] sm:text-lg">
                            {String(index + 1).padStart(2, '0')}
                          </span>

                          <div className="min-w-0">
                            <span className="mb-1 block text-[11px] font-bold tracking-wider text-[#9a4937] uppercase">
                              {item.categoria === 'cidadao'
                                ? 'Área do Cidadão'
                                : 'Área Administrativa'}
                            </span>

                            <h4
                              className={`font-corpo text-sm leading-6 font-semibold transition-colors sm:text-base ${
                                isOpen
                                  ? 'text-primaria'
                                  : 'text-[#78221b]'
                              }`}
                            >
                              {item.pergunta}
                            </h4>
                          </div>
                        </div>

                        <span
                          className={`material-icons shrink-0 text-2xl transition-transform duration-300 ${
                            isOpen
                              ? 'rotate-180 text-primaria'
                              : 'text-[#78221b]'
                          }`}
                          aria-hidden="true"
                        >
                          expand_more
                        </span>
                      </button>

                      <div
                        id={respostaId}
                        aria-hidden={!isOpen}
                        className={`grid transition-[grid-template-rows,opacity] duration-500 ease-in-out ${
                            isOpen
                            ? 'grid-rows-[1fr] opacity-100'
                            : 'grid-rows-[0fr] opacity-0'
                        }`}
                    >
                      <div className="min-h-0 overflow-hidden">
                        <div className="px-4 pb-5 sm:px-6">
                          <div className="ml-10 border-t border-[#e5cbbb] pt-4 sm:ml-12">
                            <p className="text-sm leading-7 text-[#51463e] sm:text-base">
                              {item.resposta}
                            </p>
                          </div>
                         </div>
                        </div>
                      </div>

                    </article>
                  );
                })
              )}
            </section>
          </div>

          <div className="mt-12 text-center">
            <div
              className="flex items-center justify-center gap-3"
              aria-hidden="true"
            >
              <span className="h-px w-20 bg-[#a34c3a]" />
              <span className="size-2 rotate-45 bg-[#8c251e]" />
              <span className="h-px w-20 bg-[#a34c3a]" />
            </div>

            <p className="mt-5 font-titulo text-sm italic text-[#78221b]">
              Polieus — Tecnologia a serviço da cidadania.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
