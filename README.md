# Gerenciamento de Movimentações Financeiras

Este projeto é uma aplicação completa para gerenciamento de movimentações financeiras, permitindo o controle de receitas e despesas, categorização, visualização de relatórios e exportação de dados. A aplicação é composta por um frontend em Vue.js e um backend em Laravel, ambos containerizados com Docker para facilitar o desenvolvimento e implantação.

## Estrutura do Projeto

O projeto está organizado em dois diretórios principais:

- **`/frontend`**: Contém a aplicação cliente desenvolvida com Vue.js 3 e Vuetify 3.
- **`/backend`**: Contém a API RESTful desenvolvida com Laravel 10.

## Funcionalidades Principais

### Frontend

- **Interface Reativa:** Construída com Vue 3 (Composition API) para uma experiência de usuário dinâmica.
- **Componentes Visuais:** Utiliza Vuetify 3 para uma interface moderna e consistente baseada no Material Design.
- **Gerenciamento de Estado:** Pinia é usado para gerenciar o estado global da aplicação.
- **Visualização de Dados:** Tabelas e gráficos para visualizar transações e relatórios.
- **Formulários:** Formulários com validação para criar e editar transações e categorias.
- **Exportação:** Interage com a API para solicitar a exportação de dados em Excel e PDF.

### Backend

- **API RESTful:** Fornece endpoints para gerenciar transações (receitas e despesas) e categorias.
- **Autenticação:** Utiliza Laravel Sanctum para autenticação baseada em token e proteção CSRF.
- **Banco de Dados:** Interage com um banco de dados MySQL para persistir os dados.
- **Exportação:** Permite exportar transações filtradas para os formatos Excel (.xlsx) e PDF.
- **Validação:** Valida os dados de entrada para garantir a integridade.
- **Relacionamentos:** Gerencia o relacionamento entre usuários, categorias e transações.

## Tecnologias Utilizadas

### Frontend

- **Vue.js 3 (Composition API)**
- **Vuetify 3**
- **Pinia:** Gerenciador de estado
- **Vue Router**
- **Axios:** Cliente HTTP
- **TypeScript**
- **Chart.js & vue-chartjs:** Biblioteca para criação de gráficos
- **Vite:** Ferramenta de build

### Backend

- **PHP 8.1+**
- **Laravel 10+**
- **Laravel Sanctum:** Autenticação
- **MySQL:** Banco de Dados
- **Maatwebsite/Laravel-Excel:** Exportação para Excel
- **Barryvdh/Laravel-DomPDF:** Exportação para PDF
- **Composer:** Gerenciador de dependências PHP

### Infraestrutura

- **Docker & Docker Compose:** Ambiente de desenvolvimento containerizado

## Configuração do Ambiente (Usando Docker)

1. **Pré-requisitos:**
   - Docker ([https://www.docker.com/get-started](https://www.docker.com/get-started))
   - Docker Compose (geralmente incluído com o Docker)

2. **Clonar o repositório:** Se ainda não o fez.

3. **Configurar o ambiente do backend:**
   ```bash
   cd backend
   cp .env.example .env
   cd ..
   ```

4. **Construir e iniciar os containers:**
   ```bash
   docker-compose up -d --build
   ```

5. **Configurar o backend:**
   ```bash
   docker-compose exec backend composer install
   docker-compose exec backend php artisan key:generate
   docker-compose exec backend php artisan migrate
   docker-compose exec backend php artisan db:seed  # Opcional: popula o banco com dados de exemplo
   ```

6. **Se necessário, reinstalar dependências do frontend:**
   ```bash
   docker-compose exec frontend npm install
   ```

## Acessando a Aplicação

- **Frontend:** [http://localhost:8080](http://localhost:8080)
- **Backend (API):** [http://localhost:8000/api](http://localhost:8000/api)

## Endpoints da API

A API está disponível sob o prefixo `/api`. Alguns dos principais endpoints:

- `/api/register` (POST): Registro de novo usuário
- `/api/login` (POST): Login de usuário
- `/api/logout` (POST): Logout de usuário (requer autenticação)
- `/api/categories` (GET, POST): Listar ou criar categorias
- `/api/transactions` (GET, POST): Listar ou criar transações
- `/api/transactions/export/excel` (GET): Exportar transações para Excel
- `/api/transactions/export/pdf` (GET): Exportar transações para PDF

Consulte o arquivo `backend/routes/api.php` para a lista completa de endpoints.

## Estrutura de Diretórios

### Frontend (frontend/src)

- `components/`: Componentes Vue reutilizáveis
- `composables/`: Funções Composition API reutilizáveis
- `router/`: Configuração do Vue Router
- `services/`: Lógica de comunicação com a API backend
- `stores/`: Módulos do Pinia para gerenciamento de estado
- `views/`: Componentes Vue que representam as páginas da aplicação

### Backend

- `app/Models/`: Modelos Eloquent
- `app/Http/Controllers/`: Controladores da API
- `app/Http/Requests/`: Classes de validação de requisições
- `app/Exports/`: Classes para exportação de dados
- `database/migrations/`: Migrações do banco de dados
- `routes/api.php`: Definição das rotas da API

## Testes

Para executar os testes do backend:

```bash
docker-compose exec backend php artisan test
```

## Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.