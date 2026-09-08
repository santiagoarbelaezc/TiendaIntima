<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Middleware\AuthMiddleware;
use PDO;

abstract class BaseController
{
    protected PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    protected function body(): array
    {
        $input = file_get_contents('php://input');
        if (!$input) {
            return $_POST;
        }

        $decoded = json_decode($input, true);
        return is_array($decoded) ? $decoded : [];
    }

    protected function authUser(): array
    {
        return AuthMiddleware::authenticate();
    }

    protected function authUserId(): int
    {
        $payload = $this->authUser();
        return (int) ($payload['sub'] ?? 0);
    }
}
