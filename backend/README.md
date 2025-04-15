# Gerenciamento de Movimentações Financeiras - Backend

Este diretório contém o código-fonte do backend da aplicação "Gerenciamento de Movimentações Financeiras", desenvolvido com Laravel.

## Funcionalidades Principais

*   **API RESTful:** Fornece endpoints para gerenciar transações (receitas e despesas) e categorias.
*   **Autenticação:** Utiliza Laravel Sanctum para autenticação baseada em token e proteção CSRF.
*   **Banco de Dados:** Interage com um banco de dados MySQL para persistir os dados.
*   **Exportação:** Permite exportar transações filtradas para os formatos Excel (.xlsx) e PDF.
*   **Validação:** Valida os dados de entrada para garantir a integridade.
*   **Relacionamentos:** Gerencia o relacionamento entre usuários, categorias e transações.

## Tecnologias Utilizadas

*   **PHP 8.1+**
*   **Laravel 10+**
*   **Laravel Sanctum:** Autenticação
*   **MySQL:** Banco de Dados
*   **Maatwebsite/Laravel-Excel:** Exportação para Excel
*   **Barryvdh/Laravel-DomPDF:** Exportação para PDF
*   **Composer:** Gerenciador de dependências PHP
*   **Docker & Docker Compose:** Ambiente de desenvolvimento containerizado

## Configuração do Ambiente (Usando Docker)

1.  **Pré-requisitos:**
    *   Docker ([https://www.docker.com/get-started](https://www.docker.com/get-started))
    *   Docker Compose (geralmente incluído com o Docker)
2.  **Clonar o repositório:** Se ainda não o fez.
3.  **Navegar para a raiz do projeto:** O diretório que contém o arquivo `docker-compose.yml`.
4.  **Copiar arquivo de ambiente:**
    ```bash
    cd backend
    cp .env.example .env
    cd ..
    ```
5.  **Construir e iniciar os containers:**
    ```bash
    docker-compose up -d --build
    ```
6.  **Instalar dependências do Composer:**
    ```bash
    docker-compose exec backend composer install
    ```
7.  **Gerar chave da aplicação:**
    ```bash
    docker-compose exec backend php artisan key:generate
    ```
8.  **Executar migrações do banco de dados:**
    ```bash
    docker-compose exec backend php artisan migrate
    ```
9.  **(Opcional) Popular o banco de dados com dados de exemplo:**
    ```bash
    docker-compose exec backend php artisan db:seed
    ```

O backend estará acessível em `http://localhost:8000`.

## Endpoints da API

A API está disponível sob o prefixo `/api`. Consulte o arquivo `backend/routes/api.php` para a lista completa de endpoints.

*   `/api/register` (POST): Registro de novo usuário.
*   `/api/login` (POST): Login de usuário.
*   `/api/logout` (POST): Logout de usuário (requer autenticação).
*   `/api/user` (GET): Obter informações do usuário autenticado.
*   `/api/categories` (GET, POST): Listar ou criar categorias (requer autenticação).
*   `/api/categories/{id}` (GET, PUT, DELETE): Obter, atualizar ou deletar uma categoria específica (requer autenticação).
*   `/api/transactions` (GET, POST): Listar ou criar transações (requer autenticação).
*   `/api/transactions/{id}` (GET, PUT, DELETE): Obter, atualizar ou deletar uma transação específica (requer autenticação).
*   `/api/transactions/export/excel` (GET): Exportar transações para Excel (requer autenticação, aceita parâmetros de filtro).
*   `/api/transactions/export/pdf` (GET): Exportar transações para PDF (requer autenticação, aceita parâmetros de filtro).

## Testes

Para executar os testes PHPUnit:

```bash
docker-compose exec backend php artisan test
```

## Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.
