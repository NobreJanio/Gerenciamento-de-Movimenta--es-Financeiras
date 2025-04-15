FROM php:8.2-apache as base

# Argumentos de ambiente
ARG user=appuser
ARG uid=1000

# Instalar dependências do sistema e extensões PHP
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    libzip-dev \
    libpq-dev \
    libgd-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

RUN docker-php-ext-install pdo pdo_mysql mbstring exif pcntl bcmath gd zip

# Configurar Apache
RUN a2enmod rewrite
# RUN service apache2 restart # Removido, será feito pelo entrypoint

# Obter Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Definir diretório de trabalho
WORKDIR /var/www/html

# Copiar configuração do Apache
COPY apache-config.conf /etc/apache2/sites-available/000-default.conf

# Copiar entrypoint e dar permissão
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Expor porta do Apache
EXPOSE 80

# Definir entrypoint
ENTRYPOINT ["docker-entrypoint.sh"]

# Definir comando padrão
CMD ["apache2-foreground"]