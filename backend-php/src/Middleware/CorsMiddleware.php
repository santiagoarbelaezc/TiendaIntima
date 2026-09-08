<?php

declare(strict_types=1);

namespace App\Middleware;

use App\Config\Env;

final class CorsMiddleware
{
    public static function handle(): void
    {
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
        $allowed = Env::get('CORS_ALLOWED_ORIGINS', '*');

        if ($allowed === '*' || str_contains($allowed, $origin) || str_contains($origin, 'localhost') || str_contains($origin, '127.0.0.1')) {
            header("Access-Control-Allow-Origin: {$origin}");
        } else {
            header("Access-Control-Allow-Origin: *");
        }

        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Max-Age: 86400');

        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(204);
            exit;
        }
    }
}
