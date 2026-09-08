<?php

declare(strict_types=1);

namespace App\Models;

use PDO;

class GaleriaItem
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function all(bool $onlyActive = false): array
    {
        $sql = 'SELECT id, titulo, imagen_url, orden, activo, created_at FROM galeria_items';
        if ($onlyActive) {
            $sql .= ' WHERE activo = 1';
        }
        $sql .= ' ORDER BY orden ASC, id DESC';

        $stmt = $this->pdo->query($sql);
        return $stmt->fetchAll();
    }

    public function find(int $id): ?array
    {
        $stmt = $this->pdo->prepare('SELECT * FROM galeria_items WHERE id = ? LIMIT 1');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public function create(string $titulo, string $imagenUrl, int $orden = 0): int
    {
        $stmt = $this->pdo->prepare('
            INSERT INTO galeria_items (titulo, imagen_url, orden, activo)
            VALUES (?, ?, ?, 1)
        ');
        $stmt->execute([$titulo, $imagenUrl, $orden]);
        return (int) $this->pdo->lastInsertId();
    }

    public function update(int $id, array $data): bool
    {
        $fields = [];
        $params = [];

        if (isset($data['titulo'])) {
            $fields[] = 'titulo = ?';
            $params[] = $data['titulo'];
        }
        if (isset($data['imagen_url'])) {
            $fields[] = 'imagen_url = ?';
            $params[] = $data['imagen_url'];
        }
        if (isset($data['orden'])) {
            $fields[] = 'orden = ?';
            $params[] = (int) $data['orden'];
        }
        if (isset($data['activo'])) {
            $fields[] = 'activo = ?';
            $params[] = (int) $data['activo'];
        }

        if (empty($fields)) {
            return false;
        }

        $params[] = $id;
        $sql = 'UPDATE galeria_items SET ' . implode(', ', $fields) . ' WHERE id = ?';
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute($params);
    }

    public function delete(int $id): bool
    {
        $stmt = $this->pdo->prepare('DELETE FROM galeria_items WHERE id = ?');
        return $stmt->execute([$id]);
    }
}
