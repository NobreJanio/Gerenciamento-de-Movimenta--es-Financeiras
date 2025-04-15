#!/bin/bash
set -e

echo "Iniciando script de configuração..."
# Definir variáveis
APP_DIR="/var/www/html"
STORAGE_DIR="$APP_DIR/storage"
BOOTSTRAP_DIR="$APP_DIR/bootstrap"

# Verificar se o Laravel já está instalado
if [ ! -f "/var/www/html/artisan" ]; then
    echo "Instalando Laravel 10..."
    composer create-project --prefer-dist laravel/laravel:^10.0 /tmp/laravel
    cp -R /tmp/laravel/. /var/www/html/
    rm -rf /tmp/laravel
    
    # Instalar dependências adicionais
    cd /var/www/html
    composer require laravel/sanctum
    composer require maatwebsite/excel
    
    # Publicar configurações do Sanctum
    php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
    
    # Configurar o .env
    cp .env.example .env
    php artisan key:generate
    
    # Executar migrações quando o banco de dados estiver disponível
    echo "Aguardando o banco de dados..."
    
    # Verificar conexão com o banco de dados
    until mysql -h db -P 3306 -u finance_user -pmysql -e "SELECT 1" finance_db; do
        echo "Banco de dados não disponível, tentando novamente em 5 segundos..."
        sleep 5
    done
    
    # Garantir que o usuário finance_user tenha todas as permissões necessárias
    echo "Verificando permissões do usuário no banco de dados..."
    mysql -h db -P 3306 -u root -proot -e "GRANT ALL PRIVILEGES ON finance_db.* TO 'finance_user'@'%'; FLUSH PRIVILEGES;"
    
    # Executar migrações
    php artisan migrate --seed || {
        echo "Erro ao executar migrações. Tentando corrigir permissões..."
        mysql -h db -P 3306 -u root -proot -e "GRANT ALL PRIVILEGES ON *.* TO 'finance_user'@'%' WITH GRANT OPTION; FLUSH PRIVILEGES;"
        php artisan migrate --seed
    }
fi

# Configurar permissões - Sempre executado em cada inicialização
echo "Configurando permissões dos diretórios..."

# Garantir que todos os diretórios necessários existam
echo "Criando diretórios necessários..."
mkdir -p $STORAGE_DIR/logs
mkdir -p $STORAGE_DIR/framework/cache/data
mkdir -p $STORAGE_DIR/framework/sessions
mkdir -p $STORAGE_DIR/framework/views
mkdir -p $STORAGE_DIR/framework/testing
mkdir -p $BOOTSTRAP_DIR/cache

# Criar arquivo de log se não existir
echo "Verificando arquivo de log..."
if [ ! -f "$STORAGE_DIR/logs/laravel.log" ]; then
    echo "Criando arquivo de log..."
    touch $STORAGE_DIR/logs/laravel.log
fi

# Definir permissões para todos os diretórios e arquivos
echo "Aplicando permissões..."

# Primeiro, definir o proprietário para www-data
echo "Definindo proprietário para www-data..."
chown -R www-data:www-data $APP_DIR

# Definir permissões específicas para diretórios de armazenamento
echo "Definindo permissões para diretórios de armazenamento..."
chmod -R 777 $STORAGE_DIR
chmod -R 777 $BOOTSTRAP_DIR/cache

# Garantir que o arquivo de log tenha permissões corretas
echo "Configurando permissões do arquivo de log..."
chmod 666 $STORAGE_DIR/logs/laravel.log

# Aplicar permissões recursivas para garantir acesso total
echo "Aplicando permissões recursivas..."
find $STORAGE_DIR -type d -exec chmod 777 {} \;
find $STORAGE_DIR -type f -exec chmod 666 {} \;
find $BOOTSTRAP_DIR/cache -type d -exec chmod 777 {} \;
find $BOOTSTRAP_DIR/cache -type f -exec chmod 666 {} \;

# Garantir que o grupo www-data tenha acesso total aos diretórios críticos
echo "Garantindo que o grupo www-data tenha acesso total..."
chgrp -R www-data $STORAGE_DIR $BOOTSTRAP_DIR/cache
chmod -R g+rwx $STORAGE_DIR $BOOTSTRAP_DIR/cache

# Verificar se o Apache pode escrever no diretório de logs
echo "Verificando se o Apache pode escrever no diretório de logs..."
su -s /bin/bash -c "touch $STORAGE_DIR/logs/test_write.log" www-data
if [ $? -eq 0 ]; then
    echo "Apache tem permissão para escrever no diretório de logs."
    rm -f $STORAGE_DIR/logs/test_write.log
else
    echo "AVISO: Apache não consegue escrever no diretório de logs. Aplicando permissões mais amplas..."
    chmod -R 777 $STORAGE_DIR/logs
    chown -R www-data:www-data $STORAGE_DIR/logs
    echo "Permissões atualizadas para o diretório de logs."
fi

# Verificar permissões após a configuração
echo "Verificando permissões após configuração..."
ls -la $STORAGE_DIR/logs
ls -la $BOOTSTRAP_DIR/cache

# Iniciar o Apache
exec "$@"