<p align="center">
  <img src="./public/favicons/logo_polieus.png" width="180" alt="Logo do Polieus">
</p>

<h1 align="center">POLIEUS — Plataforma de Gestão Urbana e Participação Cidadã</h1>

<p align="center">
  <strong>Tecnologia a serviço da cidadania, da acessibilidade e da transparência pública.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS">
</p>

<p align="center">
  <strong>Global Solution 2026/2 — CitizenTech</strong><br>
  FIAP | Análise e Desenvolvimento de Sistemas | Equipe Politech | Turma 1TDSPH
</p>

<p align="center">
  <a href="https://polieus.vercel.app"><strong>Acessar o Polieus na Vercel</strong></a>
</p>

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

## Tecnologias Utilizadas

O front-end do Polieus utiliza **React, TypeScript, Vite e Tailwind CSS**, além de bibliotecas para navegação, formulários e mapas.

### React e TypeScript

O React organiza a interface em páginas e componentes reutilizáveis. O TypeScript acrescenta tipagem estática e auxilia na manutenção do código.

### Vite

Ferramenta utilizada para executar o ambiente de desenvolvimento e gerar a versão de produção da aplicação.

### Tailwind CSS

Utilizado para a estilização da interface e adaptação a diferentes tamanhos de tela.

### React Router DOM

Responsável pela navegação entre as páginas, com as rotas centralizadas em `src/main.tsx`.

**Rotas públicas e do cidadão:**

- `/` — escolha da área de acesso;
- `/login-usuario` — acesso e cadastro do cidadão;
- `/login-admin` — acesso e cadastro administrativo;
- `/inicio` — página inicial da plataforma;
- `/registrar-ocorrencia` — formulário de registro;
- `/minhas-ocorrencias` — acompanhamento de solicitações;
- `/mapa-ocorrencias` — mapa de ocorrências;
- `/transparencia` — indicadores e informações de transparência;
- `/perfil` — perfil do cidadão;
- `/sobre`, `/integrantes`, `/faq`, `/contato` — páginas institucionais.

**Rotas administrativas:**

- `/admin` e `/admin/dashboard` — painel administrativo;
- `/admin/gerenciar-ocorrencias` — gerenciamento de ocorrências;
- `/admin/mapa-ocorrencias` — mapa administrativo;
- `/admin/relatorios` — relatórios e indicadores;
- `/admin/perfil` — perfil administrativo;
- `/admin/sobre`, `/admin/integrantes`, `/admin/faq`, `/admin/contato` — páginas institucionais na navegação administrativa.

Outros endereços são direcionados à página de erro da aplicação.

### React Hook Form

Biblioteca presente no projeto para auxiliar no gerenciamento e validação de formulários, incluindo a página de contato.

### Leaflet e React Leaflet

Bibliotecas utilizadas na construção e apresentação dos mapas interativos da plataforma.

### Fetch API e variáveis de ambiente

A aplicação está preparada para consumir uma API REST Java por meio do endereço base definido em `VITE_API_URL`. **As chamadas de negócio aos endpoints ainda serão implementadas após a disponibilização dos contratos da API.**

### Oxlint

Ferramenta usada para a análise estática do código por meio de `npm run lint`.

---

## 📁 Estrutura de Pastas

A estrutura está organizada por componentes, páginas, imagens e serviços. As páginas abaixo já existem no repositório do front-end; isso **não significa que todas as operações estejam integradas à API**.

```text
Polieus/
├── public/
│   └── favicons/
│       ├── logo_polieus.png
│       ├── logo_polieus2.png
│       └── logo_polieus3.png
│
├── src/
│   ├── components/
│   │   ├── Botao/                  # Botão reutilizável
│   │   ├── Cabecalho/              # Menu lateral e navegação
│   │   ├── Card/                   # Cards reutilizáveis
│   │   ├── Mapa/                   # Componente de mapa
│   │   └── Rodape/                 # Rodapé da aplicação
│   │
│   ├── img/                        # Fotos dos integrantes e imagens da interface
│   │
│   ├── pages/
│   │   ├── Acesso/                 # Escolha entre cidadão e administrador
│   │   ├── AdminDashboard/        # Painel administrativo
│   │   ├── AdminMapaOcorrencias/  # Mapa da área administrativa
│   │   ├── AdminPerfil/           # Perfil administrativo
│   │   ├── AdminRelatorios/       # Relatórios administrativos
│   │   ├── Contato/               # Formulário de contato
│   │   ├── Error/                 # Página de erro
│   │   ├── FAQ/                   # Perguntas frequentes
│   │   ├── GerenciarOcorrencia/   # Gestão de ocorrências
│   │   ├── Inicio/                # Página inicial interna
│   │   ├── Integrantes/           # Apresentação da equipe
│   │   ├── LoginAdministrador/    # Login/cadastro administrativo
│   │   ├── LoginUsuario/          # Login/cadastro do cidadão
│   │   ├── MapaOcorrencias/       # Mapa do cidadão
│   │   ├── MinhasOcorrencias/     # Histórico e acompanhamento
│   │   ├── Perfil/                # Perfil do cidadão
│   │   ├── RegistrarOcorrencia/   # Registro de ocorrência
│   │   ├── Sobre/                 # Informações sobre o projeto
│   │   └── Transparencia/         # Indicadores e transparência
│   │
│   ├── services/
│   │   └── api.ts                 # URL base da API e fallback para o Render
│   │
│   ├── App.tsx                    # Layout compartilhado
│   ├── globals.css               # Estilos globais
│   └── main.tsx                   # Inicialização e rotas
│
├── .env.example                   # Exemplo das variáveis de ambiente
├── .gitignore                     # Regras de arquivos ignorados
├── .oxlintrc.json                 # Configuração do Oxlint
├── index.html                     # HTML de entrada
├── package.json                   # Dependências e scripts
├── package-lock.json              # Versões das dependências
├── README.md                      # Documentação
├── tsconfig.app.json              # Configuração TypeScript da aplicação
├── tsconfig.json                  # Configuração geral do TypeScript
├── tsconfig.node.json             # Configuração TypeScript para o Node
├── vercel.json                    # Rewrite para as rotas SPA na Vercel
└── vite.config.ts                 # Configuração do Vite
```

Os arquivos de cada página estão organizados em `src/pages/<NomeDaPagina>/index.tsx`.

---

## Imagens e Identidade Visual

A identidade visual do Polieus combina referências à arquitetura grega com tons de vermelho, vinho e bege. Os arquivos de logo encontram-se em [`public/favicons/`](./public/favicons/), e os fundos e as fotografias da equipe estão em [`src/img/`](./src/img/).

---

## Principais Funcionalidades

### Área do Cidadão

- **Escolha de acesso:** entrada para os fluxos de cidadão e administrador.
- **Login e cadastro:** formulários com validações de interface; autenticação efetiva depende da integração posterior.
- **Início:** apresentação dos recursos da plataforma e atalhos de navegação.
- **Registrar Ocorrência:** formulário em etapas com descrição, endereço e opção de fotografia. O envio à API Java ainda está pendente.
- **Minhas Ocorrências:** tela preparada para consulta, filtros e acompanhamento; a lista aguarda os dados do back-end.
- **Mapa de Ocorrências:** visualização interativa preparada para receber ocorrências e localizações reais.
- **Transparência:** indicadores e estimativas apresentados atualmente com dados demonstrativos.
- **Perfil:** visualização das informações do cidadão, com integração futura à autenticação e aos dados persistidos.

### Área Administrativa

- **Dashboard:** visão geral e indicadores das ocorrências.
- **Gerenciar Ocorrências:** interface para consulta, filtragem, prioridade e atualização de status; há recursos locais de demonstração que precisarão ser conectados à API.
- **Mapa Administrativo:** visualização territorial voltada ao acompanhamento das demandas.
- **Relatórios:** gráficos, análises e informações orçamentárias; parte dos dados e registros ainda utiliza armazenamento local ou conteúdo demonstrativo.
- **Perfil Administrativo:** exibição de dados administrativos atualmente baseada em informações locais da aplicação.

### Páginas Institucionais

As páginas **Sobre**, **Integrantes**, **FAQ** e **Contato** apresentam informações sobre a proposta, a equipe e respostas às dúvidas frequentes. O formulário de contato é demonstrativo e ainda não realiza envio a um serviço de mensagens.

---

## Integração com a API Java

A integração foi estruturada tomando como referência o padrão de serviços utilizado no projeto MoveUP, mas **os endpoints, tipos de dados e regras de negócio serão próprios do Polieus**.

### Situação atual

- O front-end está publicado na Vercel.
- O arquivo `src/services/api.ts` define a URL base e um fallback para o Render.
- O arquivo `.env.example` documenta a variável `VITE_API_URL`.
- **Ainda não foram implementados os serviços de negócio nem conectadas as telas aos endpoints definitivos do Java.**

**URL base informada para o back-end:** [`https://polieus.onrender.com`](https://polieus.onrender.com)

O endereço acima é a configuração prevista para a API; a disponibilidade e o funcionamento dos endpoints devem ser verificados na etapa de integração.

### Etapas pendentes

- [ ] Receber a documentação final dos endpoints Java (métodos, caminhos, payloads e respostas);
- [ ] Completar a função de requisições HTTP e o tratamento de erros em `src/services/api.ts`;
- [ ] Criar os serviços específicos do Polieus, conforme os recursos disponibilizados;
- [ ] Conectar os formulários de cadastro e consulta de ocorrências;
- [ ] Conectar as telas administrativas e os relatórios aos dados reais, conforme a API permitir;
- [ ] Validar CORS, estados de carregamento, mensagens de erro e respostas vazias;
- [ ] Executar os testes de integração e atualizar esta documentação com os fluxos realmente concluídos.

**Observação:** a publicação do front-end não comprova integração funcional com o back-end ou autenticação real.

---

## Como Usar

### Links do Projeto

| Recurso | Endereço / Situação |
| --- | --- |
| **Aplicação Web na Vercel** | [https://polieus.vercel.app](https://polieus.vercel.app) |
| **API Java no Render** | [https://polieus.onrender.com](https://polieus.onrender.com) — integração pendente |
| **Repositório do Front-end** | [POLITECH-Global-Solution/Polieus](https://github.com/POLITECH-Global-Solution/Polieus) |
| **Vídeo de Apresentação no YouTube** | **PENDENTE — adicionar o link quando o vídeo for publicado** |

### 🎥 Vídeo de Apresentação

> **LEMBRETE PARA A ENTREGA:** inserir aqui o link oficial do vídeo de apresentação do Polieus no YouTube após a publicação.

<!-- TODO: Substituir este lembrete pelo link do vídeo do Polieus no YouTube. -->

### Como Executar Localmente

**Pré-requisitos:** Git, Node.js e npm instalados.

1. **Clone o repositório:**

   ```bash
   git clone https://github.com/POLITECH-Global-Solution/Polieus.git
   cd Polieus
   ```

2. **Instale as dependências:**

   ```bash
   npm ci
   ```

3. **Configure o ambiente local:** copie `.env.example` para `.env`, na raiz do projeto. No Windows (CMD):

   ```cmd
   copy .env.example .env
   ```

   Em macOS/Linux:

   ```bash
   cp .env.example .env
   ```

   Conteúdo esperado:

   ```dotenv
   VITE_API_URL=https://polieus.onrender.com
   ```

   O `.env` é ignorado pelo Git. Não armazene senhas ou tokens privados em variáveis `VITE_`, pois seus valores podem ficar visíveis no navegador.

   **Vercel:** o endereço da API deve ser configurado como `VITE_API_URL` nas variáveis de ambiente do projeto. Alterações nessas variáveis exigem um novo deploy para aparecerem no build do front-end.

4. **Inicie a aplicação:**

   ```bash
   npm run dev
   ```

   Abra o endereço local mostrado no terminal pelo Vite (geralmente `http://localhost:5173/`).

5. **Execute as verificações:**

   ```bash
   npm run lint
   npm run build
   ```

---

## Scripts Disponíveis

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia o servidor local de desenvolvimento |
| `npm run build` | Valida com TypeScript e gera os arquivos de produção |
| `npm run lint` | Executa a análise estática com Oxlint |
| `npm run preview` | Exibe localmente uma prévia da build de produção |

Os scripts estão definidos em `package.json`.

---

## Deploy na Vercel

O front-end é publicado na Vercel a partir da branch `main` do repositório GitHub.

- **Framework:** Vite;
- **Root Directory:** `./`;
- **Build Command:** `npm run build`;
- **Output Directory:** `dist`;
- **Variável de ambiente:** `VITE_API_URL`;
- **Roteamento:** o arquivo `vercel.json` redireciona as rotas da aplicação para `index.html`, permitindo que o React Router controle a navegação em acessos diretos e atualizações de página.

**Endereço público:** [polieus.vercel.app](https://polieus.vercel.app)

---

## Impacto Social

O Polieus busca contribuir para os seguintes Objetivos de Desenvolvimento Sustentável (ODS):

- **ODS 10 — Redução das Desigualdades:** ampliar a visibilidade de problemas que afetam a acessibilidade e a mobilidade urbana;
- **ODS 11 — Cidades e Comunidades Sustentáveis:** apoiar a identificação e o acompanhamento de demandas de infraestrutura;
- **ODS 16 — Paz, Justiça e Instituições Eficazes:** incentivar transparência, participação cidadã e acesso a informações da gestão pública.

---

## 📞 Contato

Para dúvidas, sugestões, problemas ou contribuições, utilize a seção de **Issues** do repositório ou entre em contato com os integrantes pelos perfis disponíveis abaixo.

- [Abrir uma Issue sobre o Polieus](https://github.com/POLITECH-Global-Solution/Polieus/issues/new)
- [Acessar o repositório oficial da equipe](https://github.com/POLITECH-Global-Solution/Polieus)

---

## 👥 Integrantes & Autores

Projeto desenvolvido pela **Equipe Politech**, da turma **1TDSPH**, para a Global Solution 2026/2 da FIAP.

- <img src="src/img/fotoHenrique.jpeg" width="120px" alt="Foto de Henrique Bonachela"><br>
  **Henrique Bonachela de Carvalho Carabante** — RM **573620** (Especialista em Inteligência Artificial) — Turma: **1TDSPH**  
  [LinkedIn](https://www.linkedin.com/in/henrique-bonachela-de-carvalho-carabante-260b86338/) | [GitHub](https://github.com/henriquebonachela)

- <img src="src/img/fotoIsa.png" width="120px" alt="Foto de Isabelle Ferreira"><br>
  **Isabelle Ferreira Neri Feitoza** — RM **573507** (Engenheira de Dados) — Turma: **1TDSPH**  
  [LinkedIn](https://www.linkedin.com/in/isabelle-ferreira-8844593ab) | [GitHub](https://github.com/isabelleferreiraa)

- <img src="src/img/fotoMilena.png" width="120px" alt="Foto de Milena Conegin"><br>
  **Milena Silva Conegin** — RM **568923** (Desenvolvedora Back-end — Java) — Turma: **1TDSPH**  
  [LinkedIn](https://www.linkedin.com/in/milena-conegin-996b22269) | [GitHub](https://github.com/MilenaConegin)

- <img src="src/img/fotoMarina.jpg" width="120px" alt="Foto de Marina Fernandes"><br>
  **Marina Fernandes Gomes Mesquita** — RM **571265** (Desenvolvedora Front-end) — Turma: **1TDSPH**  
  [LinkedIn](https://www.linkedin.com/in/marifernandesgm-58460a40a) | [GitHub](https://github.com/marifernandesgm)

- <img src="src/img/fotoMurilo.jpeg" width="120px" alt="Foto de Murilo Almeida"><br>
  **Murilo Almeida Rodrigues de Souza** — RM **573977** (Desenvolvedor Back-end — Python) — Turma: **1TDSPH**  
  [LinkedIn](https://www.linkedin.com/in/murilo-a-souza/) | [GitHub](https://github.com/murilo-a-souza)

---

<p align="center">
  <strong>POLIEUS — Equipe Politech</strong><br>
  FIAP | Global Solution 2026/2 | CitizenTech | Turma 1TDSPH<br>
  <em>Tecnologia que conecta pessoas, cidades e decisões.</em>
</p>
