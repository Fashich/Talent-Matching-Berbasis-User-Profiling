# backend/Dockerfile
# Image produksi backend EduPKL buat deploy ke Render (runtime: docker).
# Base PHP-FPM + Nginx + Supervisor (2 proses jalan bareng dalam 1 container),
# pola yang sama seperti yang sudah terbukti jalan di project magang_unesa
# (Presensi Lab SMKS Rajasa) — diadaptasi ke backend PHP plain EduPKL
# (TANPA Composer/dependency, jadi TIDAK ada langkah `composer install`).

FROM php:8.2-fpm

# Install Nginx + Supervisor + ekstensi PDO MySQL (wajib buat konek ke TiDB Cloud)
RUN apt-get update && apt-get install -y \
    nginx supervisor \
    && docker-php-ext-install pdo pdo_mysql \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /var/www/html
COPY . .

# Copy konfigurasi Nginx & Supervisor
COPY nginx-render.conf /etc/nginx/sites-available/default
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Permission
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html \
    && rm -f /etc/nginx/sites-enabled/default \
    && ln -s /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default

EXPOSE 80

CMD ["/usr/bin/supervisord", "-n", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
