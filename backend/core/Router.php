<?php
// core/Router.php
// Router super-simpel tanpa dependency framework — cukup buat kebutuhan
// REST API modul-modul EduPKL (PHP plain sesuai keputusan stack).

class Router
{
    private array $routes = [];

    public function get(string $path, callable $handler): void
    {
        $this->add('GET', $path, $handler);
    }

    public function post(string $path, callable $handler): void
    {
        $this->add('POST', $path, $handler);
    }

    public function put(string $path, callable $handler): void
    {
        $this->add('PUT', $path, $handler);
    }

    public function delete(string $path, callable $handler): void
    {
        $this->add('DELETE', $path, $handler);
    }

    private function add(string $method, string $path, callable $handler): void
    {
        // Ubah "/api/siswa/{id}" jadi regex "#^/api/siswa/([^/]+)$#"
        $pattern = preg_replace('#\{[a-zA-Z_]+\}#', '([^/]+)', $path);
        $this->routes[] = [
            'method'  => $method,
            'pattern' => '#^' . $pattern . '$#',
            'handler' => $handler,
        ];
    }

    public function dispatch(string $method, string $uri): void
    {
        $path = parse_url($uri, PHP_URL_PATH) ?? '/';

        // Buang base path "/EDUPKL/backend" kalau XAMPP nge-serve dari
        // subfolder htdocs, bukan document root langsung.
        $basePath = '/EDUPKL/backend';
        if (str_starts_with($path, $basePath)) {
            $path = substr($path, strlen($basePath));
        }
        $path = $path === '' ? '/' : $path;

        foreach ($this->routes as $route) {
            if ($route['method'] === $method && preg_match($route['pattern'], $path, $matches)) {
                array_shift($matches); // buang full match, sisain capture groups {id} dst.
                call_user_func_array($route['handler'], $matches);
                return;
            }
        }

        Response::error('Endpoint tidak ditemukan: ' . $method . ' ' . $path, 404);
    }
}
