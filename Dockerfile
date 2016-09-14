FROM php:5.6-apache

COPY ./ /var/www/html/

RUN apt-get update -y \
 && apt-get install -y libssl-dev git curl unzip \
 && pecl install mongo \
 && docker-php-ext-enable mongo

RUN cp /etc/apache2/mods-available/rewrite.load /etc/apache2/mods-enabled/rewrite.load
