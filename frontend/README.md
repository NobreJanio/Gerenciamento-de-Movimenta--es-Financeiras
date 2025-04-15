# Gerenciamento de Movimentações Financeiras - Frontend

Este diretório contém o código-fonte do frontend da aplicação "Gerenciamento de Movimentações Financeiras", desenvolvido com Vue.js e Vuetify.

## Funcionalidades Principais

*   **Interface Reativa:** Construída com Vue 3 (Composition API) para uma experiência de usuário dinâmica.
*   **Componentes Visuais:** Utiliza Vuetify 3 para uma interface moderna e consistente baseada no Material Design.
*   **Gerenciamento de Estado:** Pinia é usado para gerenciar o estado global da aplicação (transações, categorias, usuário).
*   **Roteamento:** Vue Router controla a navegação entre as diferentes páginas (Login, Registro, Transações, Relatórios, Categorias).
*   **Comunicação com API:** Axios é usado para fazer requisições HTTP para a API backend (Laravel).
*   **Visualização de Dados:**
    *   Tabelas de dados (Vuetify `v-data-table`) para listar transações.
    *   Gráficos (Chart.js via `vue-chartjs`) para visualizar relatórios (distribuição por categoria, evolução mensal).
*   **Formulários:** Formulários com validação para criar e editar transações e categorias.
*   **Exportação:** Interage com a API para solicitar a exportação de dados em Excel e PDF.
*   **Notificações:** Snackbar (Vuetify `v-snackbar`) para feedback ao usuário.
*   **Autenticação:** Gerencia o login/logout e armazena o token de autenticação.

## Tecnologias Utilizadas

*   **Vue.js 3 (Composition API):** Framework JavaScript progressivo.
*   **Vuetify 3:** Biblioteca de componentes UI Material Design para Vue.
*   **Pinia:** Gerenciador de estado para Vue.
*   **Vue Router:** Roteador oficial para Vue.
*   **Axios:** Cliente HTTP baseado em Promises.
*   **TypeScript:** Superset de JavaScript que adiciona tipagem estática.
*   **Chart.js & vue-chartjs:** Biblioteca para criação de gráficos.
*   **Vite:** Ferramenta de build rápida para desenvolvimento web moderno.
*   **Docker & Docker Compose:** Ambiente de desenvolvimento containerizado.

## Configuração do Ambiente (Usando Docker)

1.  **Pré-requisitos:**
    *   Docker ([https://www.docker.com/get-started](https://www.docker.com/get-started))
    *   Docker Compose
    *   Node.js e npm/yarn (para instalação inicial de dependências se não usar Docker build diretamente)
2.  **Clonar o repositório:** Se ainda não o fez.
3.  **Navegar para a raiz do projeto:** O diretório que contém o arquivo `docker-compose.yml`.
4.  **Construir e iniciar os containers:** (O build do frontend é feito automaticamente se usar o Dockerfile fornecido)
    ```bash
    docker-compose up -d --build
    ```
    *Se o build falhar ou você precisar reinstalar as dependências do Node.js manualmente dentro do container:* 
    ```bash
    docker-compose exec frontend npm install 
    # ou
    # docker-compose exec frontend yarn install
    ```

O frontend estará acessível em `http://localhost:8080`.

## Estrutura de Diretórios (frontend/src)

*   `@types/`: Definições de tipos TypeScript personalizadas.
*   `assets/`: Arquivos estáticos (imagens, fontes, etc.).
*   `components/`: Componentes Vue reutilizáveis.
*   `composables/`: Funções Composition API reutilizáveis (ex: `useSnackbar`).
*   `layouts/`: Componentes de layout da aplicação (ex: `DefaultLayout`).
*   `lib/`: Configuração de bibliotecas (ex: `axios.ts`).
*   `plugins/`: Plugins Vue (ex: Vuetify).
*   `router/`: Configuração do Vue Router.
*   `services/`: Lógica de comunicação com a API backend.
*   `stores/`: Módulos do Pinia para gerenciamento de estado.
*   `styles/`: Arquivos CSS/SCSS globais.
*   `utils/`: Funções utilitárias (ex: formatadores).
*   `views/`: Componentes Vue que representam as páginas/rotas da aplicação.
*   `main.ts`: Ponto de entrada da aplicação Vue.

## Scripts Disponíveis (Executar com `docker-compose exec frontend <script>`)

*   `npm run dev` ou `yarn dev`: Inicia o servidor de desenvolvimento Vite com hot-reload.
*   `npm run build` ou `yarn build`: Compila a aplicação para produção.
*   `npm run preview` ou `yarn preview`: Inicia um servidor local para visualizar a build de produção.

## Contribuição

Contribuições são bem-vindas!