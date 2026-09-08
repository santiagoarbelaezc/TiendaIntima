<?php

declare(strict_types=1);

namespace App\Models;

use PDO;

class AdminUsuario
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function findByEmail(string $email): ?array
    {
        $stmt = $this->pdo->prepare('SELECT * FROM admin_usuarios WHERE LOWER(email) = LOWER(?) LIMIT 1');
        $stmt->execute([trim($email)]);
        $user = $stmt->fetch();
        return $user ?: null;
    }

    public function findById(int|string $id): ?array
    {
        $stmt = $this->pdo->prepare('SELECT id, nombre, email, rol, created_at FROM admin_usuarios WHERE id = ? LIMIT 1');
        $stmt->execute([$id]);
        $user = $stmt->fetch();
        return $user ?: null;
    }

    public function all(): array
    {
        $stmt = $this->pdo->query('SELECT id, nombre, email, rol, created_at FROM admin_usuarios ORDER BY id ASC');
        return $stmt->fetchAll();
    }
}
