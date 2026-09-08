<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Config\Env;
use App\Exceptions\ApiException;
use App\Exceptions\UnauthorizedException;
use App\Models\AdminUsuario;
use App\Utils\Response;
use App\Utils\Validator;
use Firebase\JWT\JWT;

/**
 * POST /api/auth/login
 * GET /api/auth/me (devuelve el usuario autenticado)
 */
final class AuthController extends BaseController
{
    public function login(): void
    {
        $body = $this->body();

        $v = new Validator($body);
        $v->required(['email', 'password'])
          ->email('email')
          ->minLength('password', 6);

        $validated = $v->validateOrFail();

        $model = new AdminUsuario($this->pdo);
        $user  = $model->findByEmail($validated['email']);

        if ($user === null || !password_verify($validated['password'], $user['password_hash'])) {
            throw new UnauthorizedException('Credenciales incorrectas.');
        }

        $ttl    = (int) Env::get('JWT_TTL_SECONDS', 86400);
        $now    = time();
        $secret = Env::get('JWT_SECRET');

        if (empty($secret)) {
            throw new ApiException('JWT_SECRET no configurado en el servidor.', 500);
        }

        $payload = [
            'sub'   => $user['id'],
            'email' => $user['email'],
            'name'  => $user['nombre'],
            'rol'   => $user['rol'] ?? 'admin',
            'iat'   => $now,
            'exp'   => $now + $ttl,
        ];

        $token = JWT::encode($payload, $secret, 'HS256');

        Response::success([
            'token'      => $token,
            'expires_in' => $ttl,
            'user' => [
                'id'    => $user['id'],
                'email' => $user['email'],
                'nombre'=> $user['nombre'],
                'rol'   => $user['rol'] ?? 'admin',
            ],
        ], 'Inicio de sesión exitoso');
    }

    /** GET /api/auth/me — requiere JWT (middleware) */
    public function me(): void
    {
        $userId = $this->authUserId();
        $model  = new AdminUsuario($this->pdo);
        $user   = $model->findById($userId);

        if ($user === null) {
            throw new UnauthorizedException('Usuario no encontrado.');
        }

        Response::success($user);
    }
}
