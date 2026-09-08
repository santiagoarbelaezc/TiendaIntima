<?php

declare(strict_types=1);

namespace App\Middleware;

use App\Config\Env;
use App\Exceptions\UnauthorizedException;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

final class AuthMiddleware
{
    public static function authenticate(): array
    {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? '';

        if (!$authHeader || !preg_match('/Bearer\s+(\S+)/i', $authHeader, $matches)) {
            throw new UnauthorizedException('Token de autorización no proporcionado.');
        }

        $token  = $matches[1];
        $secret = Env::get('JWT_SECRET');

        if (empty($secret)) {
            throw new UnauthorizedException('JWT_SECRET no configurado en el servidor.');
        }

        try {
            $decoded = JWT::decode($token, new Key($secret, 'HS256'));
            return (array) $decoded;
        } catch (\Throwable $e) {
            throw new UnauthorizedException('Token inválido o expirado: ' . $e->getMessage());
        }
    }
}
