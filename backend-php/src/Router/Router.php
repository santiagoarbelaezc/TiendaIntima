<?php

declare(strict_types=1);

namespace App\Router;

use App\Exceptions\NotFoundException;

final class Router
{
    private array $routes = [];

    public function get(string $path, callable|array $handler): self
    {
        return $this->add('GET', $path, $handler);
    }

    public function post(string $path, callable|array $handler): self
    {
        return $this->add('POST', $path, $handler);
    }

    public function put(string $path, callable|array $handler): self
    {
        return $this->add('PUT', $path, $handler);
    }

    public function delete(string $path, callable|array $handler): self
    {
        return $this->add('DELETE', $path, $handler);
    }

    private function add(string $method, string $path, callable|array $handler): self
    {
        $this->routes[] = [
            'method'  => strtoupper($method),
            'path'    => $path,
            'pattern' => $this->convertPathToRegex($path),
            'handler' => $handler,
        ];
        return $this;
    }

    public function dispatch(string $method, string $uri): void
    {
        $uri = parse_url($uri, PHP_URL_PATH) ?: '/';
        $uri = rtrim($uri, '/') ?: '/';

        foreach ($this->routes as $route) {
            if ($route['method'] !== $method) {
                continue;
            }

            if (preg_match($route['pattern'], $uri, $matches)) {
                array_shift($matches); // Quitar match completo
                $this->executeHandler($route['handler'], $matches);
                return;
            }
        }

        throw new NotFoundException("Ruta no encontrada: [{$method}] {$uri}");
    }

    private function convertPathToRegex(string $path): string
    {
        $path = rtrim($path, '/') ?: '/';
        // Convertir {param} en captura regex
        $regex = preg_replace('#\{[a-zA-Z0-9_]+\}#', '([^/]+)', $path);
        return '#^' . $regex . '$#';
    }

    private function executeHandler(callable|array $handler, array $params): void
    {
        if (is_array($handler)) {
            [$class, $method] = $handler;
            $controller = is_object($class) ? $class : new $class();
            $controller->$method(...$params);
        } else {
            $handler(...$params);
        }
    }
}
