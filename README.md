<div align="center">
  <img src="./public/favicons/banner-polieus.svg" width="100%" alt="Polieus — Gestão urbana e participação cidadã" />
  <br />
  <img src="./public/favicons/logo_polieus.png" width="180" alt="Logo do Polieus" />
  <h1>POLIEUS — Plataforma de Gestão Urbana e Participação Cidadã</h1>
  <p><strong>Tecnologia a serviço da cidadania, da acessibilidade e da transparência pública.</strong></p>
  <p>
    <strong>Global Solution 2026/2 — CitizenTech</strong><br />
    FIAP | Análise e Desenvolvimento de Sistemas | Equipe Politech | Turma 1TDSPH
  </p>
  <a href="https://polieus.vercel.app"><img src="https://img.shields.io/badge/ACESSAR_PLATAFORMA-78221B?style=for-the-badge&logo=vercel&logoColor=white" alt="Acessar plataforma" /></a>
  <a href="https://youtu.be/-4d9iyXf3pM"><img src="https://img.shields.io/badge/ASSISTIR_APRESENTAÇÃO-78221B?style=for-the-badge&logo=youtube&logoColor=white" alt="Assistir apresentação" /></a>
  <br /><br />
  <img src="https://img.shields.io/badge/React-EAD8C6?style=flat-square&logo=react&logoColor=78221B" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-EAD8C6?style=flat-square&logo=typescript&logoColor=78221B" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-EAD8C6?style=flat-square&logo=vite&logoColor=78221B" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-EAD8C6?style=flat-square&logo=tailwindcss&logoColor=78221B" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Java_REST_API-EAD8C6?style=flat-square&logo=openjdk&logoColor=78221B" alt="Java REST API" />
  <img src="https://img.shields.io/badge/Leaflet-EAD8C6?style=flat-square&logo=leaflet&logoColor=78221B" alt="Leaflet" />
  <img src="https://img.shields.io/badge/Oxlint-EAD8C6?style=flat-square&logo=oxc&logoColor=78221B" alt="Oxlint" />
</div>

---

## Índice

- [Descrição do Projeto](#descrição-do-projeto)
- [Objetivo](#objetivo)
- [Principais Funcionalidades](#principais-funcionalidades)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Rotas da Aplicação](#rotas-da-aplicação)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [Imagens e Identidade Visual](#imagens-e-identidade-visual)
- [Integração com a API Java](#integração-com-a-api-java)
- [Links do Projeto](#links-do-projeto)
- [Vídeo de Apresentação](#vídeo-de-apresentação)
- [Acesso para Avaliação Acadêmica](#acesso-para-avaliação-acadêmica)
- [Como Executar Localmente](#como-executar-localmente)
- [Scripts Disponíveis](#scripts-disponíveis)
- [Deploy na Vercel](#deploy-na-vercel)
- [Impacto Social](#impacto-social)
- [Contato](#-contato)
- [Integrantes & Autores](#-integrantes--autores)

---

## Descrição do Projeto

O **Polieus** é uma proposta CitizenTech desenvolvida para aproximar cidadãos e gestores públicos por meio da tecnologia. A plataforma busca organizar relatos de problemas urbanos, facilitar seu acompanhamento e apoiar a transparência e a tomada de decisão na gestão municipal.

No fluxo proposto, o cidadão identifica uma demanda, registra uma ocorrência com informações de localização e acompanha seu andamento. A administração pública, por sua vez, dispõe de telas para consultar solicitações, analisar prioridades e visualizar indicadores.

O **piloto previsto para o MVP é o município de São Paulo (capital)**. O escopo inicial da proposta prioriza duas frentes:

- **Acessibilidade urbana:** calçadas danificadas, ausência de rampas, obstáculos e dificuldades de circulação.
- **Pavimentação:** buracos, rachaduras e problemas nas vias públicas.

A interface já possui outras opções de categorias e páginas para expansão futura. A persistência e a consulta de dados reais dependem da integração com o back-end Java.

---

## Objetivo

O principal objetivo do Polieus é **fortalecer a participação cidadã e a transparência da gestão urbana**, transformando demandas locais em informações que possam ser acompanhadas e analisadas.

A solução busca:

- Facilitar o registro e a localização de ocorrências urbanas;
- Organizar solicitações por categoria, status e prioridade;
- Permitir o acompanhamento das demandas pela população;
- Apoiar a visualização territorial das ocorrências;
- Oferecer indicadores para apoiar a gestão pública;
- Incentivar acessibilidade, transparência e decisões baseadas em informações.

---

## Principais Funcionalidades

### Área do Cidadão

| Funcionalidade | Descrição |
| --- | --- |
| Escolha de acesso | Entrada para os fluxos de cidadão e administrador. |
| Login e cadastro | Autenticação e registro de cidadãos, com validação dos formulários e integração com o back-end. |
| Início | Apresentação dos recursos da plataforma, indicadores e atalhos de navegação. |
| Registrar Ocorrência | Registro de problemas urbanos com informações de categoria, descrição e localização. |
| Minhas Ocorrências | Consulta, filtragem, histórico e acompanhamento das ocorrências registradas pelo cidadão. |
| Detalhes da Ocorrência | Visualização individual de uma ocorrência por meio de uma rota dinâmica. |
| Mapa de Ocorrências | Visualização geográfica interativa das ocorrências urbanas. |
| Transparência | Indicadores públicos e estimativas orçamentárias demonstrativas. |
| Perfil | Visualização e gerenciamento das informações pessoais do cidadão. |

### Área Administrativa

| Funcionalidade | Descrição |
| --- | --- |
| Login e cadastro administrativo | Acesso à área administrativa mediante autenticação e código de convite para cadastro. |
| Dashboard | Visão geral e indicadores para acompanhamento das ocorrências. |
| Gerenciar Ocorrências | Consulta, filtragem, análise, classificação de prioridades e atualização de status. |
| Mapa Administrativo | Visualização territorial voltada ao acompanhamento das demandas urbanas. |
| Relatórios | Gráficos, filtros, análises e indicadores administrativos. |
| Orçamentos Institucionais | Elaboração, edição, exclusão e impressão de estimativas orçamentárias armazenadas localmente. |
| Perfil Administrativo | Visualização e gerenciamento das informações administrativas. |

### Páginas Institucionais

As páginas **Sobre**, **Integrantes**, **FAQ** e **Contato** apresentam informações sobre a proposta, a equipe e respostas às dúvidas frequentes. O formulário de contato é demonstrativo e ainda não realiza envio a um serviço de mensagens.

---

## Tecnologias Utilizadas

O front-end do Polieus utiliza **React, TypeScript, Vite e Tailwind CSS**, além de bibliotecas para navegação, formulários e mapas.

| Tecnologia | Finalidade |
| --- | --- |
| React | Desenvolvimento de uma Single Page Application (SPA), com páginas e componentes reutilizáveis. |
| TypeScript | Tipagem estática, organização e segurança dos dados. |
| Vite | Ambiente de desenvolvimento e geração da build de produção. |
| Tailwind CSS | Estilização, padronização visual e responsividade. |
| React Router DOM | Gerenciamento da navegação, rotas estáticas, dinâmicas e protegidas. |
| React Hook Form | Gerenciamento e validação de formulários. |
| Leaflet | Construção de mapas interativos. |
| React Leaflet | Integração dos mapas com o React. |
| Fetch API | Comunicação HTTP com a API REST desenvolvida em Java. |
| Session Storage | Armazenamento de informações da sessão. |
| Local Storage | Persistência local de informações complementares. |
| Oxlint | Análise estática e qualidade do código. |
| Git e GitHub | Controle de versão e desenvolvimento colaborativo. |
| Vercel | Hospedagem e publicação do front-end. |
| Render | Hospedagem da API REST Java. |

### Arquitetura da Aplicação

O Polieus foi desenvolvido seguindo uma arquitetura modular de **Single Page Application (SPA)**, promovendo a separação de responsabilidades, a reutilização de componentes e a manutenção do código.

A aplicação utiliza exclusivamente a **Fetch API** para realizar as requisições HTTP ao back-end, sem a utilização de Axios ou outras bibliotecas de requisições.

A estilização dos componentes e das páginas é realizada diretamente por meio do Tailwind CSS, mantendo o arquivo `globals.css` para configurações e estilos globais.

---

## Rotas da Aplicação

O gerenciamento das rotas é centralizado no arquivo `src/main.tsx`, utilizando o React Router DOM.

O arquivo `App.tsx` é responsável pelo layout compartilhado da aplicação.

### Rotas Públicas

| Rota | Finalidade |
| --- | --- |
| `/` | Escolha da área de acesso. |
| `/login-usuario` | Login e cadastro do cidadão. |
| `/login-admin` | Login e cadastro administrativo. |
| `/sobre` | Informações sobre o projeto. |
| `/integrantes` | Apresentação da equipe. |
| `/faq` | Perguntas frequentes. |
| `/contato` | Formulário e informações de contato. |

### Rotas Protegidas do Cidadão

| Rota | Finalidade |
| --- | --- |
| `/inicio` | Página inicial do cidadão. |
| `/registrar-ocorrencia` | Formulário de registro de ocorrências. |
| `/minhas-ocorrencias` | Listagem e acompanhamento de solicitações. |
| `/minhas-ocorrencias/:id` | Visualização dos detalhes de uma ocorrência. |
| `/mapa-ocorrencias` | Mapa interativo de ocorrências. |
| `/transparencia` | Indicadores e informações de transparência. |
| `/perfil` | Perfil do cidadão. |

### Rotas Protegidas da Administração

| Rota | Finalidade |
| --- | --- |
| `/admin` | Painel administrativo. |
| `/admin/dashboard` | Dashboard administrativo. |
| `/admin/gerenciar-ocorrencias` | Gerenciamento de ocorrências. |
| `/admin/mapa-ocorrencias` | Mapa administrativo. |
| `/admin/relatorios` | Relatórios, indicadores e orçamentos. |
| `/admin/perfil` | Perfil administrativo. |
| `/admin/sobre` | Informações sobre o projeto. |
| `/admin/integrantes` | Apresentação da equipe. |
| `/admin/faq` | Perguntas frequentes. |
| `/admin/contato` | Formulário e informações de contato. |

### Rota Dinâmica

A aplicação possui uma rota dinâmica com parâmetro opcional:

```tsx
{
    path: 'minhas-ocorrencias/:id?',
    element: <MinhasOcorrencias />,
}
```

O parâmetro `id` permite identificar uma ocorrência específica por meio da URL, utilizando o hook `useParams` do React Router DOM.

Exemplo:

```text
/minhas-ocorrencias/25
```

Dessa forma, é possível apresentar os detalhes de uma ocorrência utilizando a estrutura existente da página Minhas Ocorrências.

### Proteção de Rotas

O componente `RotaProtegida.tsx` é responsável por verificar a existência de uma sessão correspondente ao perfil de acesso.

Caso não exista uma sessão válida, o usuário é redirecionado para a página de login correspondente.

A proteção de rotas no front-end não substitui a autenticação e a autorização dos endpoints no back-end.

Outros endereços são direcionados à página de **Erro 404** da aplicação.

---

## 📁 Estrutura de Pastas

A estrutura está organizada por componentes, páginas, imagens e serviços, facilitando a manutenção, a reutilização e a escalabilidade da aplicação.

```text
Polieus/
├── public/
│   └── favicons/
│       ├── banner-polieus.svg
│       ├── logo_polieus.png
│       ├── logo_polieus2.png
│       └── logo_polieus3.png
│
├── src/
│   ├── components/
│   │   ├── Botao/
│   │   │   └── Botao.tsx
│   │   ├── Cabecalho/
│   │   │   └── Cabecalho.tsx
│   │   ├── Card/
│   │   │   └── Card.tsx
│   │   ├── Mapa/
│   │   │   └── Mapa.tsx
│   │   ├── Rodape/
│   │   │   └── Rodape.tsx
│   │   └── RotaProtegida/
│   │       └── RotaProtegida.tsx
│   │
│   ├── img/
│   │   ├── cadastro_login.png
│   │   ├── fotoHenrique.jpeg
│   │   ├── fotoIsa.png
│   │   ├── fotoMarina.jpg
│   │   ├── fotoMilena.png
│   │   ├── fotoMurilo.jpeg
│   │   ├── fundo_contato.png
│   │   ├── fundo_escolha.png
│   │   ├── fundo_gerenciarocorrencia.png
│   │   ├── fundo_inicio.png
│   │   ├── fundo_sobre.png
│   │   ├── github.png
│   │   └── lkd.png
│   │
│   ├── pages/
│   │   ├── Acesso/index.tsx
│   │   ├── AdminDashboard/index.tsx
│   │   ├── AdminMapaOcorrencias/index.tsx
│   │   ├── AdminPerfil/index.tsx
│   │   ├── AdminRelatorios/index.tsx
│   │   ├── Contato/index.tsx
│   │   ├── Error/index.tsx
│   │   ├── FAQ/index.tsx
│   │   ├── GerenciarOcorrencia/index.tsx
│   │   ├── Inicio/index.tsx
│   │   ├── Integrantes/index.tsx
│   │   ├── LoginAdministrador/index.tsx
│   │   ├── LoginUsuario/index.tsx
│   │   ├── MapaOcorrencias/index.tsx
│   │   ├── MinhasOcorrencias/index.tsx
│   │   ├── Perfil/index.tsx
│   │   ├── RegistrarOcorrencia/index.tsx
│   │   ├── Sobre/index.tsx
│   │   └── Transparencia/index.tsx
│   │
│   ├── services/
│   │   ├── administrativoService.ts
│   │   ├── analiseService.ts
│   │   ├── api.ts
│   │   ├── autenticacaoService.ts
│   │   ├── historicoService.ts
│   │   ├── ocorrenciaService.ts
│   │   ├── relatorioService.ts
│   │   └── usuarioService.ts
│   │
│   ├── App.tsx
│   ├── globals.css
│   └── main.tsx
│
├── .env
├── .env.example
├── .gitignore
├── .oxlintrc.json
├── index.html
├── package-lock.json
├── package.json
├── README.md
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── vercel.json
└── vite.config.ts
```

Os arquivos de cada página estão organizados em `src/pages/<NomeDaPagina>/index.tsx`.

O arquivo `.env` é mantido localmente e não deve ser versionado no repositório.

---

## Imagens e Identidade Visual

A identidade visual do Polieus combina referências à arquitetura grega com tons de vermelho, vinho e bege. Os arquivos de logo encontram-se em [`public/favicons/`](./public/favicons/), e os fundos e as fotografias da equipe estão em [`src/img/`](./src/img/).

<div align="center">
  <img src="./public/favicons/logo_polieus.png" width="150" alt="Logo principal do Polieus" />
  <br />
  <em>Identidade visual do projeto Polieus</em>
  <br /><br />
  <img src="https://img.shields.io/badge/Vinho_Escuro-411516?style=for-the-badge" alt="Vinho escuro" />
  <img src="https://img.shields.io/badge/Vermelho-78221B?style=for-the-badge" alt="Vermelho" />
  <img src="https://img.shields.io/badge/Dourado-CDA775?style=for-the-badge" alt="Dourado" />
  <img src="https://img.shields.io/badge/Bege-EAD8C6?style=for-the-badge" alt="Bege" />
  <img src="https://img.shields.io/badge/Creme-FFF1DD?style=for-the-badge" alt="Creme" />
</div>

A identidade busca representar a relação entre cidadania, sociedade, democracia e gestão pública, unindo referências históricas a uma proposta tecnológica contemporânea.

---

## Integração com a API Java

O front-end do Polieus está integrado à API REST desenvolvida na disciplina de **Domain Driven Design Using Java**, utilizando a Fetch API para realizar as requisições HTTP.

A integração foi estruturada tomando como referência o padrão de serviços utilizado no projeto MoveUP, mas os endpoints, tipos de dados e regras de negócio são próprios do Polieus.

As requisições são centralizadas na pasta `src/services/`, permitindo a separação entre a interface e a comunicação com o servidor.

### Serviços da Aplicação

| Arquivo | Responsabilidade |
| --- | --- |
| `api.ts` | Configuração da URL base, requisições HTTP e tratamento de respostas. |
| `administrativoService.ts` | Operações relacionadas à administração. |
| `analiseService.ts` | Operações relacionadas às análises e prioridades das ocorrências. |
| `autenticacaoService.ts` | Operações relacionadas à autenticação. |
| `historicoService.ts` | Consulta e registro do histórico das ocorrências. |
| `ocorrenciaService.ts` | Cadastro, consulta, atualização e exclusão de ocorrências. |
| `relatorioService.ts` | Comunicação com os recursos de relatórios da API. |
| `usuarioService.ts` | Operações relacionadas aos usuários da plataforma. |

### Comunicação entre Front-end e Back-end

```text
┌─────────────────────────────┐
│       Cidadão / Gestor       │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│        Front-end React       │
│      TypeScript + Vite       │
│           Vercel             │
└──────────────┬──────────────┘
               │
           Fetch API
          HTTP / JSON
               │
               ▼
┌─────────────────────────────┐
│        API REST Java         │
│           Render             │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│        Banco de Dados        │
└─────────────────────────────┘
```

### Métodos HTTP

<div align="center">
  <img src="https://img.shields.io/badge/GET-78221B?style=for-the-badge" alt="GET" />
  <img src="https://img.shields.io/badge/POST-78221B?style=for-the-badge" alt="POST" />
  <img src="https://img.shields.io/badge/PUT-78221B?style=for-the-badge" alt="PUT" />
  <img src="https://img.shields.io/badge/DELETE-78221B?style=for-the-badge" alt="DELETE" />
</div>

| Método | Finalidade |
| --- | --- |
| GET | Consultar informações cadastradas. |
| POST | Enviar e cadastrar novos registros. |
| PUT | Atualizar informações existentes. |
| DELETE | Excluir registros. |

### Endpoints de Ocorrências

| Método | Endpoint | Finalidade |
| --- | --- | --- |
| GET | `/polieus/ocorrencia` | Listar todas as ocorrências. |
| GET | `/polieus/ocorrencia/{id}` | Buscar uma ocorrência pelo ID. |
| GET | `/polieus/ocorrencia/usuario/{idUsuario}` | Listar ocorrências de um usuário. |
| POST | `/polieus/ocorrencia` | Cadastrar uma nova ocorrência. |
| PUT | `/polieus/ocorrencia/{id}` | Atualizar uma ocorrência existente. |
| DELETE | `/polieus/ocorrencia/{id}` | Excluir uma ocorrência. |

**URL base do back-end:** [https://polieus.onrender.com](https://polieus.onrender.com)

O endereço da API é configurado por meio da variável de ambiente `VITE_API_URL`.

As funcionalidades integradas dependem da disponibilidade do servidor Java. Os orçamentos institucionais são estimativas demonstrativas armazenadas no navegador, não representando registros orçamentários oficiais da administração pública.

---

## Links do Projeto

| Recurso | Endereço |
| --- | --- |
| **Aplicação Web na Vercel** | [https://polieus.vercel.app](https://polieus.vercel.app) |
| **API Java no Render** | [https://polieus.onrender.com](https://polieus.onrender.com) |
| **Repositório do Front-end** | [POLITECH-Global-Solution/Polieus](https://github.com/POLITECH-Global-Solution/Polieus) |
| **Vídeo de Apresentação no YouTube** | [Assistir à apresentação](https://youtu.be/-4d9iyXf3pM?is=Ex4gb3D1TvZkv2it) |

---

## Vídeo de Apresentação

O vídeo apresenta a proposta do Polieus, suas principais funcionalidades, a área do cidadão, a área administrativa, as tecnologias utilizadas e a integração entre o front-end e o back-end Java.

<div align="center">
  <a href="https://youtu.be/-4d9iyXf3pM?is=Ex4gb3D1TvZkv2it">
    <img src="https://img.youtube.com/vi/-4d9iyXf3pM/hqdefault.jpg" width="500" alt="Vídeo de apresentação do Polieus" />
  </a>
  <br />
  <em>Clique na imagem para assistir à apresentação do projeto.</em>
  <br /><br />
  <a href="https://youtu.be/-4d9iyXf3pM?is=Ex4gb3D1TvZkv2it">
    <img src="https://img.shields.io/badge/ASSISTIR_NO_YOUTUBE-78221B?style=for-the-badge&logo=youtube&logoColor=white" alt="Assistir no YouTube" />
  </a>
</div>

---

## Acesso para Avaliação Acadêmica

Para facilitar a avaliação do projeto, a plataforma disponibiliza dois perfis de acesso: **Cidadão** e **Administrador**.

### Acesso do Cidadão

1. Acesse a [plataforma Polieus](https://polieus.vercel.app).
2. Selecione a opção **Cidadão**.
3. Realize o cadastro de uma nova conta.
4. Efetue o login para acessar as funcionalidades.

### Acesso Administrativo

1. Acesse a [plataforma Polieus](https://polieus.vercel.app).
2. Selecione a opção **Administrador**.
3. Escolha a opção de cadastro.
4. Preencha as informações solicitadas.
5. Informe o código de convite administrativo.
6. Finalize o cadastro e realize o login.

<div align="center">
  <h3>Código de Convite Administrativo</h3>
  <img src="https://img.shields.io/badge/CONVITE-260921-78221B?style=for-the-badge&logo=key&logoColor=white" alt="Código de convite administrativo: 260921" />
</div>

> **Observação:** o código de convite é disponibilizado exclusivamente para fins demonstrativos e de avaliação acadêmica. Em um ambiente de produção, sua validação deve ocorrer no back-end.

---

## Como Executar Localmente

### Pré-requisitos

Antes de executar o projeto, é necessário possuir as seguintes ferramentas instaladas:

- Git;
- Node.js;
- npm;
- Visual Studio Code (recomendado).

### 1. Clone o repositório

```bash
git clone https://github.com/POLITECH-Global-Solution/Polieus.git
```

Acesse a pasta do projeto:

```bash
cd Polieus
```

### 2. Instale as dependências

```bash
npm ci
```

### 3. Configure as variáveis de ambiente

Copie o arquivo `.env.example` para `.env`, na raiz do projeto.

No Windows (CMD):

```cmd
copy .env.example .env
```

No macOS ou Linux:

```bash
cp .env.example .env
```

O arquivo `.env` deverá conter:

```dotenv
VITE_API_URL=https://polieus.onrender.com
```

O arquivo `.env` é ignorado pelo Git. Não armazene senhas ou tokens privados em variáveis `VITE_`, pois seus valores podem ficar visíveis no navegador.

### 4. Inicie a aplicação

```bash
npm run dev
```

Abra o endereço local apresentado no terminal pelo Vite:

```text
http://localhost:5173/
```

### 5. Execute as verificações

Para realizar a análise estática do código:

```bash
npm run lint
```

Para validar e gerar a versão de produção:

```bash
npm run build
```

Para visualizar localmente a versão de produção:

```bash
npm run preview
```

---

## Scripts Disponíveis

| Comando | Descrição |
| --- | --- |
| `npm install` | Instala as dependências do projeto. |
| `npm ci` | Instala as dependências conforme o package-lock.json. |
| `npm run dev` | Inicia o servidor local de desenvolvimento. |
| `npm run build` | Valida com TypeScript e gera os arquivos de produção. |
| `npm run lint` | Executa a análise estática com Oxlint. |
| `npm run preview` | Exibe localmente uma prévia da build de produção. |

Os scripts estão definidos no arquivo `package.json`.

---

## Deploy na Vercel

O front-end é publicado na Vercel a partir da branch `main` do repositório GitHub.

| Configuração | Valor |
| --- | --- |
| Branch | `main` |
| Framework | Vite |
| Root Directory | `./` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Variável de ambiente | `VITE_API_URL` |
| Hospedagem do front-end | Vercel |
| Hospedagem do back-end | Render |

O arquivo `vercel.json` redireciona as rotas da aplicação para `index.html`, permitindo que o React Router controle a navegação em acessos diretos e atualizações de página.

O endereço da API deve ser configurado como `VITE_API_URL` nas variáveis de ambiente do projeto na Vercel.

Alterações nessas variáveis exigem um novo deploy para aparecerem no build do front-end.

<div align="center">
  <a href="https://polieus.vercel.app">
    <img src="https://img.shields.io/badge/ACESSAR_POLIEUS-78221B?style=for-the-badge&logo=vercel&logoColor=white" alt="Acessar Polieus" />
  </a>
</div>

---

## Impacto Social

O Polieus busca contribuir para os seguintes Objetivos de Desenvolvimento Sustentável (ODS):

- **ODS 10 — Redução das Desigualdades:** ampliar a visibilidade de problemas que afetam a acessibilidade e a mobilidade urbana;

- **ODS 11 — Cidades e Comunidades Sustentáveis:** apoiar a identificação e o acompanhamento de demandas de infraestrutura;

- **ODS 16 — Paz, Justiça e Instituições Eficazes:** incentivar transparência, participação cidadã e acesso a informações da gestão pública.

<div align="center">
  <img src="https://img.shields.io/badge/ODS_10-Redução_das_Desigualdades-DD1367?style=for-the-badge" alt="ODS 10" />
  <br />
  <img src="https://img.shields.io/badge/ODS_11-Cidades_e_Comunidades_Sustentáveis-F99D26?style=for-the-badge" alt="ODS 11" />
  <br />
  <img src="https://img.shields.io/badge/ODS_16-Paz,_Justiça_e_Instituições_Eficazes-00689D?style=for-the-badge" alt="ODS 16" />
</div>

---

## 📞 Contato

Para dúvidas, sugestões, problemas ou contribuições, utilize a seção de **Issues** do repositório ou entre em contato com os integrantes pelos perfis disponíveis abaixo.

- [Abrir uma Issue sobre o Polieus](https://github.com/POLITECH-Global-Solution/Polieus/issues/new)
- [Acessar o repositório oficial da equipe](https://github.com/POLITECH-Global-Solution/Polieus)

---

## 👥 Integrantes & Autores

Projeto desenvolvido pela **Equipe Politech**, da turma **1TDSPH**, para a Global Solution 2026/2 da FIAP.

<table>
  <tr>
    <td align="center">
      <img src="./src/img/fotoHenrique.jpeg" width="120" alt="Foto de Henrique Bonachela" />
    </td>
    <td>
      <strong>Henrique Bonachela de Carvalho Carabante</strong><br />
      RM <strong>573620</strong> | Turma: <strong>1TDSPH</strong><br />
      Especialista em Inteligência Artificial<br /><br />
      <a href="https://www.linkedin.com/in/henrique-bonachela-de-carvalho-carabante-260b86338/">
        <img src="https://img.shields.io/badge/LinkedIn-78221B?style=flat-square&logo=linkedin&logoColor=white" alt="LinkedIn" />
      </a>
      <a href="https://github.com/henriquebonachela">
        <img src="https://img.shields.io/badge/GitHub-411516?style=flat-square&logo=github&logoColor=white" alt="GitHub" />
      </a>
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="./src/img/fotoIsa.png" width="120" alt="Foto de Isabelle Ferreira" />
    </td>
    <td>
      <strong>Isabelle Ferreira Neri Feitoza</strong><br />
      RM <strong>573507</strong> | Turma: <strong>1TDSPH</strong><br />
      Engenheira de Dados<br /><br />
      <a href="https://www.linkedin.com/in/isabelle-ferreira-8844593ab">
        <img src="https://img.shields.io/badge/LinkedIn-78221B?style=flat-square&logo=linkedin&logoColor=white" alt="LinkedIn" />
      </a>
      <a href="https://github.com/isabelleferreiraa">
        <img src="https://img.shields.io/badge/GitHub-411516?style=flat-square&logo=github&logoColor=white" alt="GitHub" />
      </a>
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="./src/img/fotoMilena.png" width="120" alt="Foto de Milena Conegin" />
    </td>
    <td>
      <strong>Milena Silva Conegin</strong><br />
      RM <strong>568923</strong> | Turma: <strong>1TDSPH</strong><br />
      Desenvolvedora Back-end — Java<br /><br />
      <a href="https://www.linkedin.com/in/milena-conegin-996b22269">
        <img src="https://img.shields.io/badge/LinkedIn-78221B?style=flat-square&logo=linkedin&logoColor=white" alt="LinkedIn" />
      </a>
      <a href="https://github.com/MilenaConegin">
        <img src="https://img.shields.io/badge/GitHub-411516?style=flat-square&logo=github&logoColor=white" alt="GitHub" />
      </a>
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="./src/img/fotoMarina.jpg" width="120" alt="Foto de Marina Fernandes" />
    </td>
    <td>
      <strong>Marina Fernandes Gomes Mesquita</strong><br />
      RM <strong>571265</strong> | Turma: <strong>1TDSPH</strong><br />
      Desenvolvedora Front-end<br /><br />
      <a href="https://www.linkedin.com/in/marifernandesgm-58460a40a">
        <img src="https://img.shields.io/badge/LinkedIn-78221B?style=flat-square&logo=linkedin&logoColor=white" alt="LinkedIn" />
      </a>
      <a href="https://github.com/marifernandesgm">
        <img src="https://img.shields.io/badge/GitHub-411516?style=flat-square&logo=github&logoColor=white" alt="GitHub" />
      </a>
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="./src/img/fotoMurilo.jpeg" width="120" alt="Foto de Murilo Almeida" />
    </td>
    <td>
      <strong>Murilo Almeida Rodrigues de Souza</strong><br />
      RM <strong>573977</strong> | Turma: <strong>1TDSPH</strong><br />
      Desenvolvedor Back-end — Python<br /><br />
      <a href="https://www.linkedin.com/in/murilo-a-souza/">
        <img src="https://img.shields.io/badge/LinkedIn-78221B?style=flat-square&logo=linkedin&logoColor=white" alt="LinkedIn" />
      </a>
      <a href="https://github.com/murilo-a-souza">
        <img src="https://img.shields.io/badge/GitHub-411516?style=flat-square&logo=github&logoColor=white" alt="GitHub" />
      </a>
    </td>
  </tr>
</table>

---

<div align="center">
  <img src="./public/favicons/logo_polieus.png" width="100" alt="Logo do Polieus" />
  <br />
  <strong>POLIEUS — Equipe Politech</strong>
  <br />
  FIAP | Global Solution 2026/2 | CitizenTech | Turma 1TDSPH
  <br />
  <em>Tecnologia que conecta pessoas, cidades e decisões.</em>
  <br /><br />
  <img src="./public/favicons/banner-polieus.svg" width="100%" alt="Polieus" />
</div>