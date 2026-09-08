<?php

declare(strict_types=1);

namespace App\Models;

use PDO;

class Categoria
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function all(string $format = 'tree'): array
    {
        $stmt = $this->pdo->query('SELECT * FROM categorias WHERE activo = 1 ORDER BY orden ASC, nombre ASC');
        $categories = $stmt->fetchAll();

        if ($format === 'flat') {
            return $categories;
        }

        // Estructura de árbol
        $parents = [];
        $children = [];

        foreach ($categories as $cat) {
            if ($cat['id_padre'] === null) {
                $parents[$cat['id']] = array_merge($cat, ['subcategorias' => []]);
            } else {
                $children[$cat['id_padre']][] = $cat;
            }
        }

        foreach ($children as $parentId => $subcats) {
            if (isset($parents[$parentId])) {
                $parents[$parentId]['subcategorias'] = $subcats;
            }
        }

        return array_values($parents);
    }

    public function find(int $id): ?array
    {
        $stmt = $this->pdo->prepare('SELECT * FROM categorias WHERE id = ? LIMIT 1');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public function create(array $data): int
    {
        $stmt = $this->pdo->prepare('
            INSERT INTO categorias (nombre, id_padre, descripcion, imagen_url, orden, activo)
            VALUES (?, ?, ?, ?, ?, ?)
        ');
        $stmt->execute([
            $data['nombre'],
            $data['id_padre'] ?? null,
            $data['descripcion'] ?? '',
            $data['imagen_url'] ?? '',
            $data['orden'] ?? 0,
            $data['activo'] ?? 1,
        ]);
        return (int) $this->pdo->lastInsertId();
    }

    public function delete(int $id): bool
    {
        $stmt = $this->pdo->prepare('DELETE FROM categorias WHERE id = ?');
        return $stmt->execute([$id]);
    }
}
