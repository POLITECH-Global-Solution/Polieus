import { Link } from 'react-router-dom';
import fundoSobre from '../../img/fundo_sobre.png';

const valores = [
  {
    icone: 'visibility',
    titulo: 'Transparência',
    descricao:
      'Promover o acesso às informações e permitir que a população acompanhe as ações relacionadas às demandas urbanas.',
  },
  {
    icone: 'handshake',
    titulo: 'Compromisso',
    descricao:
      'Valorizar a responsabilidade, a colaboração e a busca por soluções que contribuam para o bem-estar coletivo.',
  },
  {
    icone: 'groups',
    titulo: 'Participação',
    descricao:
      'Incentivar o envolvimento dos cidadãos nas decisões e melhorias que impactam suas comunidades.',
  },
  {
    icone: 'diversity_3',
    titulo: 'Inclusão',
    descricao:
      'Considerar diferentes realidades e necessidades para construir uma cidade mais acessível e acolhedora.',
  },
];

const etapas = [
  {
    numero: '01',
    icone: 'edit_location_alt',
    titulo: 'Registro de ocorrências',
    descricao:
      'O cidadão poderá informar problemas encontrados na cidade, descrevendo a situação e indicando sua localização.',
  },
  {
    numero: '02',
    icone: 'analytics',
    titulo: 'Análise das demandas',
    descricao:
      'As informações registradas poderão ser organizadas e analisadas para apoiar a identificação de prioridades.',
  },
  {
    numero: '03',
    icone: 'account_balance',
    titulo: 'Acompanhamento da gestão',
    descricao:
      'Os responsáveis pela administração poderão consultar as ocorrências e acompanhar as demandas da população.',
  },
  {
    numero: '04',
    icone: 'fact_check',
    titulo: 'Transparência e acompanhamento',
    descricao:
      'A proposta é permitir que os cidadãos acompanhem o andamento de suas solicitações e tenham maior visibilidade das ações realizadas.',
  },
];

const diferenciais = [
  {
    icone: 'smart_toy',
    titulo: 'Tecnologia e inteligência artificial',
    descricao:
      'O Polieus propõe o uso de recursos tecnológicos para auxiliar na organização e análise das informações, contribuindo para decisões mais fundamentadas.',
  },
  {
    icone: 'map',
    titulo: 'Visualização geográfica',
    descricao:
      'A representação das ocorrências em um mapa poderá facilitar a identificação de regiões com maior concentração de problemas urbanos.',
  },
  {
    icone: 'analytics',
    titulo: 'Gestão orientada por informações',
    descricao:
      'A plataforma busca transformar registros individuais em informações úteis para o planejamento e a gestão pública.',
  },
  {
    icone: 'accessibility_new',
    titulo: 'Acessibilidade e inclusão',
    descricao:
      'A experiência digital deve considerar diferentes necessidades de navegação, leitura e interação, favorecendo o acesso de mais pessoas.',
  },
  {
    icone: 'verified_user',
    titulo: 'Responsabilidade e segurança',
    descricao:
      'A proposta valoriza o tratamento responsável das informações e a proteção dos dados dos usuários.',
  },
  {
    icone: 'public',
    titulo: 'Participação cidadã',
    descricao:
      'O cidadão deixa de ser apenas um observador e passa a ter um canal para comunicar problemas e acompanhar demandas de sua comunidade.',
  },
];

const objetivos = [
  {
    numero: '10',
    titulo: 'Redução das Desigualdades',
    descricao:
      'Incentivar a inclusão e ampliar a possibilidade de participação de diferentes grupos sociais.',
  },
  {
    numero: '11',
    titulo: 'Cidades e Comunidades Sustentáveis',
    descricao:
      'Contribuir para cidades mais inclusivas, acessíveis, organizadas e preparadas para atender às necessidades da população.',
  },
  {
    numero: '16',
    titulo: 'Paz, Justiça e Instituições Eficazes',
    descricao:
      'Fortalecer a transparência, a participação social e a aproximação entre a população e a administração pública.',
  },
];

const tituloSecao =
  'mt-3 font-titulo text-3xl font-bold text-[#78221b] sm:text-4xl';

const subtituloSecao =
  'text-sm font-bold tracking-widest text-[#a34c3a] uppercase';

const textoSecao = 'leading-8 text-[#51453e]';

const cardBase =
  'rounded-2xl border border-[#dfc4b0] bg-[#fffaf4] p-5 sm:p-7 shadow-sm';

export default function Sobre() {
  return (
    <main className="min-h-screen w-full bg-fundo font-corpo text-texto">
      <header className="border-b border-[#d8b9a5] bg-[#fffaf4] py-5 pr-5 pl-20 sm:pr-8 sm:pl-20 lg:px-10">

        <h1 className="font-titulo text-3xl font-bold text-[#78221b] sm:text-4xl">
          Sobre
        </h1>

        <nav
          aria-label="Navegação estrutural"
          className="mt-1 flex items-center gap-2 text-sm text-[#6b4438]"
        >
          <Link
            to="/"
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
            Sobre
          </span>
        </nav>
      </header>

      <section
        className="relative overflow-hidden bg-[#f6e9dc] bg-cover bg-no-repeat"
        style={{ backgroundImage: `url(${fundoSobre})`,
        backgroundPosition: 'right top',}} 
    >

        <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-[#fff7ee]/95 via-[#fff7ee]/80 to-transparent" />

        <div className="relative mx-auto max-w-7xl px-5 pt-12 pb-10 sm:px-8 lg:px-10 lg:pt-16 lg:pb-14">
          <div className="max-w-2xl">
            <p className="mb-3 font-corpo text-sm font-bold tracking-widest text-[#9a4937] uppercase">
              Conheça nossa plataforma
            </p>

            <h2 className="font-titulo text-5xl font-bold text-[#78221b] sm:text-6xl">
              Polieus
            </h2>

            <p className="mt-3 font-titulo text-xl font-semibold italic text-[#78221b] sm:text-2xl">
              Tecnologia a serviço da cidadania
            </p>

            <div className="my-6 flex max-w-md items-center gap-3">
              <div className="h-px flex-1 bg-[#a94b3c]" />
              <span
                className="text-[#8e2a22]"
                aria-hidden="true"
              >
                ◆
              </span>
              <div className="h-px flex-1 bg-[#d7b6a0]" />
            </div>

            <p className="max-w-xl text-base leading-relaxed text-[#30241f]">
              O <strong>Polieus</strong> é uma plataforma de participação
              cidadã que busca aproximar a população da gestão pública,
              promovendo uma cidade mais transparente, organizada,
              acessível e participativa.
            </p>

            <p className="mt-4 max-w-xl text-base leading-relaxed text-[#30241f]">
              Por meio da tecnologia, nossa proposta é oferecer um espaço
              onde os cidadãos possam registrar problemas urbanos,
              acompanhar suas solicitações e contribuir para a melhoria
              dos lugares onde vivem.
            </p>

            <p className="mt-4 max-w-xl text-base leading-relaxed text-[#30241f]">
              Ao mesmo tempo, buscamos apoiar os gestores públicos na
              compreensão das necessidades da população, facilitando
              a organização das demandas e incentivando decisões
              mais transparentes e responsáveis.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
            <article className="flex items-start gap-4 rounded-xl border border-[#dfbda7] bg-[#fff8f1]/95 p-5 shadow-sm">
              <span
                className="material-icons shrink-0 text-4xl text-[#8c251e]"
                aria-hidden="true"
              >
                track_changes
              </span>

              <div>
                <h3 className="font-titulo text-xl font-bold text-[#78221b]">
                  Nossa Missão
                </h3>

                <p className="mt-2 text-sm leading-relaxed">
                  Promover uma cidade mais justa e participativa por
                  meio da tecnologia, da colaboração e do diálogo
                  entre cidadãos e gestores.
                </p>
              </div>
            </article>

            <article className="flex items-start gap-4 rounded-xl border border-[#dfbda7] bg-[#fff8f1]/95 p-5 shadow-sm">
              <span
                className="material-icons shrink-0 text-4xl text-[#8c251e]"
                aria-hidden="true"
              >
                visibility
              </span>

              <div>
                <h3 className="font-titulo text-xl font-bold text-[#78221b]">
                  Nossa Visão
                </h3>

                <p className="mt-2 text-sm leading-relaxed">
                  Ser referência em inovação para uma gestão pública
                  mais próxima, eficiente, inclusiva e conectada
                  às necessidades da população.
                </p>
              </div>
            </article>

            <article className="flex items-start gap-4 rounded-xl border border-[#dfbda7] bg-[#fff8f1]/95 p-5 shadow-sm">
              <span
                className="material-icons shrink-0 text-4xl text-[#8c251e]"
                aria-hidden="true"
              >
                diversity_3
              </span>

              <div>
                <h3 className="font-titulo text-xl font-bold text-[#78221b]">
                  Nossos Valores
                </h3>

                <p className="mt-2 text-sm leading-relaxed">
                  Transparência, compromisso, respeito, inclusão,
                  responsabilidade e participação social.
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="bg-[#fffaf4] px-5 py-16 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className={subtituloSecao}>
              Nosso propósito
            </p>

            <h2 className={tituloSecao}>
              Uma cidade melhor começa com a participação de todos
            </h2>

            <div className="mt-5 h-px w-48 bg-[#b76d55]" />
          </div>

          <div className="mt-8 grid gap-8 text-base leading-8 text-[#40332d] lg:grid-cols-2">
            <div className="space-y-5">
              <p>
                As cidades são espaços de convivência, desenvolvimento
                e transformação. Todos os dias, milhares de pessoas
                utilizam ruas, calçadas, praças, transportes e serviços
                que fazem parte de sua rotina.
              </p>

              <p>
                Entretanto, problemas como buracos nas vias, iluminação
                insuficiente, obstáculos de acessibilidade e falhas
                na infraestrutura podem comprometer a segurança,
                a mobilidade e a qualidade de vida da população.
              </p>
            </div>

            <div className="space-y-5">
              <p>
                Muitas vezes, os cidadãos encontram dificuldades para
                comunicar essas situações, identificar os canais
                responsáveis ou acompanhar o andamento de suas solicitações.
              </p>

              <p>
                O Polieus surge com a proposta de tornar essa comunicação
                mais simples e organizada, reunindo participação cidadã
                e informações relevantes em um ambiente digital.
              </p>
            </div>
          </div>

          <div className="mt-10 rounded-2xl border-l-4 border-[#8c251e] bg-[#f5e8dc] px-6 py-7 sm:px-9">
            <p className="font-titulo text-xl font-semibold leading-relaxed italic text-[#78221b] sm:text-2xl">
              “A tecnologia ganha verdadeiro significado quando aproxima
              pessoas, fortalece comunidades e contribui para
              transformar a realidade.”
            </p>
          </div>
        </div>
      </section>

      <section className="bg-fundo px-5 py-10 sm:px-8 sm:py-16 lg:px-10">

        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className={subtituloSecao}>
              O que nos orienta
            </p>

            <h2 className={tituloSecao}>
              Nossos Princípios
            </h2>

            <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-texto-suave">
              Acreditamos que a inovação deve caminhar junto
              com a responsabilidade social e o respeito às pessoas.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {valores.map((valor) => (
              <article
                key={valor.titulo}
                className={cardBase}
              >
                <span
                  className="material-icons text-4xl text-[#8c251e]"
                  aria-hidden="true"
                >
                  {valor.icone}
                </span>

                <h3 className="mt-4 font-titulo text-xl font-bold text-[#78221b]">
                  {valor.titulo}
                </h3>

                <p className="mt-3 leading-relaxed text-[#51453e]">
                  {valor.descricao}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#fffaf4] px-5 py-16 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className={subtituloSecao}>
              Da participação à transformação
            </p>

            <h2 className={tituloSecao}>
              Como o Polieus Funciona?
            </h2>

            <p className="mt-5 leading-relaxed text-texto-suave">
              Nossa proposta conecta o registro de problemas urbanos
              à organização das informações e ao acompanhamento
              das demandas, aproximando cidadãos e administração pública.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {etapas.map((etapa) => (
              <article
                key={etapa.numero}
                className="relative overflow-hidden rounded-2xl border border-[#dfc4b0] bg-[#f9efe6] p-7"
              >
                <span
                  className="absolute top-3 right-5 font-titulo text-6xl font-bold text-[#e9d6c8]"
                  aria-hidden="true"
                >
                  {etapa.numero}
                </span>

                <span
                  className="material-icons relative text-4xl text-[#8c251e]"
                  aria-hidden="true"
                >
                  {etapa.icone}
                </span>

                <h3 className="relative mt-4 font-titulo text-xl font-bold text-[#78221b]">
                  {etapa.titulo}
                </h3>

                <p className="relative mt-3 leading-relaxed text-[#51453e]">
                  {etapa.descricao}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-fundo px-5 py-16 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className={subtituloSecao}>
              Inovação com propósito
            </p>

            <h2 className={tituloSecao}>
              Nossos Diferenciais
            </h2>

            <p className="mx-auto mt-4 max-w-3xl leading-relaxed text-texto-suave">
              Mais do que disponibilizar um canal de comunicação,
              o Polieus busca utilizar a tecnologia para facilitar
              a participação social e apoiar uma gestão urbana
              mais eficiente e transparente.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {diferenciais.map((diferencial) => (
              <article
                key={diferencial.titulo}
                className="rounded-2xl border border-[#dfc4b0] bg-[#fffaf4] p-6 shadow-sm transition-transform hover:-translate-y-1"
              >
                <div className="flex size-14 items-center justify-center rounded-xl bg-[#f0dcd0]">
                  <span
                    className="material-icons block text-center text-3xl leading-none text-[#8c251e]"
                    aria-hidden="true"
                  >
                    {diferencial.icone}
                  </span>
                </div>

                <h3 className="mt-5 font-titulo text-lg font-bold text-[#78221b]">
                  {diferencial.titulo}
                </h3>

                <p className="mt-3 text-sm leading-7 text-[#51453e]">
                  {diferencial.descricao}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#fffaf4] px-5 py-16 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <p className={subtituloSecao}>
                Pessoas no centro da tecnologia
              </p>

              <h2 className={tituloSecao}>
                Acessibilidade e Inclusão
              </h2>

              <p className="mt-6 leading-8 text-[#40332d]">
                Uma cidade verdadeiramente participativa deve considerar
                as necessidades de todos os seus habitantes.
                Por isso, a acessibilidade faz parte dos princípios
                que orientam a proposta do Polieus.
              </p>

              <p className="mt-4 leading-8 text-[#40332d]">
                Buscamos desenvolver uma experiência que valorize
                a clareza das informações, a navegação intuitiva
                e a inclusão de pessoas com diferentes habilidades,
                condições e necessidades.
              </p>

              <p className="mt-4 leading-8 text-[#40332d]">
                Também reconhecemos a importância de identificar
                problemas urbanos que afetam diretamente a mobilidade,
                a autonomia e a segurança da população.
              </p>
            </div>

            <div className="rounded-2xl border border-[#dfc4b0] bg-[#f5e8dc] p-7 sm:p-9">
              <span
                className="material-icons text-5xl text-[#8c251e]"
                aria-hidden="true"
              >
                accessibility_new
              </span>

              <h3 className="mt-4 font-titulo text-2xl font-bold text-[#78221b]">
                Uma plataforma para todos
              </h3>

              <p className="mt-4 leading-8 text-[#51453e]">
                Nosso compromisso é trabalhar para que a tecnologia
                não seja uma barreira, mas uma ferramenta que amplie
                as oportunidades de participação e comunicação.
              </p>

              <div className="mt-6 flex items-start gap-3">
                <span
                  className="material-icons text-[#8c251e]"
                  aria-hidden="true"
                >
                  check_circle
                </span>

                <p className="text-sm leading-relaxed">
                  Informações organizadas e linguagem compreensível.
                </p>
              </div>

              <div className="mt-4 flex items-start gap-3">
                <span
                  className="material-icons text-[#8c251e]"
                  aria-hidden="true"
                >
                  check_circle
                </span>

                <p className="text-sm leading-relaxed">
                  Atenção à navegação e à experiência dos usuários.
                </p>
              </div>

              <div className="mt-4 flex items-start gap-3">
                <span
                  className="material-icons text-[#8c251e]"
                  aria-hidden="true"
                >
                  check_circle
                </span>

                <p className="text-sm leading-relaxed">
                  Valorização das necessidades de diferentes comunidades.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-fundo px-5 py-16 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className={subtituloSecao}>
              Uma solução colaborativa
            </p>

            <h2 className={tituloSecao}>
              Para Quem é o Polieus?
            </h2>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <article className={`${cardBase} text-center`}>
              <span
                className="material-icons text-5xl text-[#8c251e]"
                aria-hidden="true"
              >
                person
              </span>

              <h3 className="mt-4 font-titulo text-xl font-bold text-[#78221b]">
                Cidadãos
              </h3>

              <p className="mt-4 text-sm leading-7 text-[#51453e]">
                Pessoas que desejam comunicar problemas urbanos,
                acompanhar suas solicitações e contribuir
                para melhorias em sua cidade.
              </p>
            </article>

            <article className={`${cardBase} text-center`}>
              <span
                className="material-icons text-5xl text-[#8c251e]"
                aria-hidden="true"
              >
                groups
              </span>

              <h3 className="mt-4 font-titulo text-xl font-bold text-[#78221b]">
                Comunidades
              </h3>

              <p className="mt-4 text-sm leading-7 text-[#51453e]">
                Bairros e grupos que buscam maior visibilidade
                para necessidades coletivas e desejam participar
                da transformação dos espaços urbanos.
              </p>
            </article>

            <article className={`${cardBase} text-center`}>
              <span
                className="material-icons text-5xl text-[#8c251e]"
                aria-hidden="true"
              >
                account_balance
              </span>

              <h3 className="mt-4 font-titulo text-xl font-bold text-[#78221b]">
                Gestores Públicos
              </h3>

              <p className="mt-4 text-sm leading-7 text-[#51453e]">
                Profissionais responsáveis pela análise, organização
                e acompanhamento de demandas, que poderão utilizar
                informações para apoiar o planejamento de ações.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="bg-[#fffaf4] px-5 py-16 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className={subtituloSecao}>
              Compromisso com o futuro
            </p>

            <h2 className={tituloSecao}>
              Desenvolvimento Sustentável
            </h2>

            <p className={`mt-5 ${textoSecao}`}>
              O Polieus se relaciona com os princípios de desenvolvimento
              sustentável ao incentivar a participação social,
              a inclusão e a construção de cidades mais organizadas
              e responsáveis.
            </p>

            <p className={`mt-3 ${textoSecao}`}>
              Nossa proposta dialoga especialmente com três Objetivos
              de Desenvolvimento Sustentável da Organização
              das Nações Unidas.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {objetivos.map((objetivo) => (
              <article
                key={objetivo.numero}
                className="rounded-2xl border border-[#dfc4b0] bg-[#f9efe6] p-7"
              >
                <span className="font-titulo text-5xl font-bold text-[#8c251e]">
                  {objetivo.numero}
                </span>

                <p className="mt-1 text-xs font-bold tracking-widest text-[#a34c3a] uppercase">
                  ODS {objetivo.numero}
                </p>

                <h3 className="mt-4 font-titulo text-lg font-bold text-[#78221b]">
                  {objetivo.titulo}
                </h3>

                <p className="mt-3 text-sm leading-7 text-[#51453e]">
                  {objetivo.descricao}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#78221b] px-5 py-16 text-center text-white sm:px-8 lg:px-10">
        <div className="mx-auto max-w-4xl">
          <span
            className="material-icons text-5xl text-[#f1d5c0]"
            aria-hidden="true"
          >
            account_balance
          </span>

          <h2 className="mt-5 font-titulo text-3xl font-bold sm:text-4xl">
            O Futuro da Cidade é Construído em Conjunto
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-[#f7e8dd]">
            Acreditamos que cada cidadão tem um papel importante
            na transformação da sociedade. Quando tecnologia,
            participação e responsabilidade caminham juntas,
            novas possibilidades surgem para nossas cidades.
          </p>

          <p className="mt-7 font-titulo text-xl font-semibold italic text-[#f5d5bd]">
            Polieus — Tecnologia a serviço da cidadania.
          </p>
        </div>
      </section>
    </main>
  );
}
