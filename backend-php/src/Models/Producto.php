<?php

declare(strict_types=1);

namespace App\Models;

use PDO;

class Producto
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function all(array $filters = []): array
    {
        $where = ['p.activo = 1'];
        $params = [];

        if (!empty($filters['search'])) {
            $where[] = '(p.nombre LIKE ? OR p.descripcion LIKE ?)';
            $searchTerm = '%' . $filters['search'] . '%';
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }

        if (!empty($filters['id_categoria'])) {
            $where[] = 'p.id_categoria = ?';
            $params[] = (int) $filters['id_categoria'];
        }

        if (!empty($filters['genero'])) {
            $where[] = 'LOWER(p.genero) = LOWER(?)';
            $params[] = $filters['genero'];
        }

        $sql = '
            SELECT p.*, c.nombre AS categoria_nombre
            FROM productos p
            LEFT JOIN categorias c ON p.id_categoria = c.id
            WHERE ' . implode(' AND ', $where) . '
            ORDER BY p.id DESC
        ';

        if (!empty($filters['limit'])) {
            $sql .= ' LIMIT ' . (int) $filters['limit'];
            if (!empty($filters['page'])) {
                $offset = ((int) $filters['page'] - 1) * (int) $filters['limit'];
                $sql .= ' OFFSET ' . $offset;
            }
        }

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll();

        return array_map([$this, 'hydrateProduct'], $rows);
    }

    public function find(int $id): ?array
    {
        $stmt = $this->pdo->prepare('
            SELECT p.*, c.nombre AS categoria_nombre
            FROM productos p
            LEFT JOIN categorias c ON p.id_categoria = c.id
            WHERE p.id = ?
            LIMIT 1
        ');
        $stmt->execute([$id]);
        $row = $stmt->fetch();

        if (!$row) {
            return null;
        }

        return $this->hydrateProduct($row);
    }

    public function create(array $data): int
    {
        $this->pdo->beginTransaction();
        try {
            $stmt = $this->pdo->prepare('
                INSERT INTO productos (nombre, descripcion, precio_base, id_categoria, genero, temporada, tela, marca, activo)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ');
            $stmt->execute([
                $data['nombre'],
                $data['descripcion'] ?? '',
                $data['precio_base'] ?? 0,
                $data['id_categoria'] ?? null,
                $data['genero'] ?? 'Mujer',
                $data['temporada'] ?? '2026',
                $data['tela'] ?? 'Satén',
                $data['marca'] ?? 'Tiendaintima',
                $data['activo'] ?? 1
            ]);
            $productId = (int) $this->pdo->lastInsertId();

            if (!empty($data['imagenes']) && is_array($data['imagenes'])) {
                $stmtImg = $this->pdo->prepare('
                    INSERT INTO producto_imagenes (id_producto, url, es_principal, orden)
                    VALUES (?, ?, ?, ?)
                ');
                foreach ($data['imagenes'] as $idx => $img) {
                    $url = is_string($img) ? $img : ($img['url'] ?? '');
                    $principal = is_array($img) ? ($img['es_principal'] ?? ($idx === 0 ? 1 : 0)) : ($idx === 0 ? 1 : 0);
                    if ($url) {
                        $stmtImg->execute([$productId, $url, $principal ? 1 : 0, $idx]);
                    }
                }
            }

            if (!empty($data['variantes']) && is_array($data['variantes'])) {
                $stmtVar = $this->pdo->prepare('
                    INSERT INTO producto_variantes (id_producto, sku, precio, stock, color_nombre, color_hex, talla_nombre)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                ');
                foreach ($data['variantes'] as $v) {
                    $stmtVar->execute([
                        $productId,
                        $v['sku'] ?? ('SKU-' . $productId . '-' . rand(100, 999)),
                        $v['precio'] ?? ($data['precio_base'] ?? 0),
                        $v['stock'] ?? 10,
                        $v['color']['nombre'] ?? ($v['color_nombre'] ?? 'Único'),
                        $v['color']['hex'] ?? ($v['color_hex'] ?? '#000000'),
                        $v['talla']['nombre'] ?? ($v['talla_nombre'] ?? 'Única'),
                    ]);
                }
            }

            $this->pdo->commit();
            return $productId;
        } catch (\Throwable $e) {
            $this->pdo->rollBack();
            throw $e;
        }
    }

    public function delete(int $id): bool
    {
        $stmt = $this->pdo->prepare('DELETE FROM productos WHERE id = ?');
        return $stmt->execute([$id]);
    }

    private function hydrateProduct(array $row): array
    {
        $id = (int) $row['id'];

        // Cargar imágenes
        $stmtImg = $this->pdo->prepare('SELECT id, url, es_principal, orden FROM producto_imagenes WHERE id_producto = ? ORDER BY es_principal DESC, orden ASC');
        $stmtImg->execute([$id]);
        $imagenes = $stmtImg->fetchAll();

        // Cargar variantes
        $stmtVar = $this->pdo->prepare('SELECT id, sku, precio, stock, color_nombre, color_hex, talla_nombre FROM producto_variantes WHERE id_producto = ?');
        $stmtVar->execute([$id]);
        $rawVars = $stmtVar->fetchAll();

        $variantes = array_map(function ($v) {
            return [
                'id'          => (int) $v['id'],
                'sku'         => $v['sku'],
                'precio'      => (float) $v['precio'],
                'stock'       => (int) $v['stock'],
                'color'       => [
                    'nombre' => $v['color_nombre'] ?? 'Único',
                    'hex'    => $v['color_hex'] ?? '#111111',
                ],
                'talla'       => [
                    'nombre' => $v['talla_nombre'] ?? 'Única',
                ],
            ];
        }, $rawVars);

        return [
            'id'          => $id,
            'nombre'      => $row['nombre'],
            'descripcion' => $row['descripcion'],
            'precio_base' => (float) $row['precio_base'],
            'genero'      => $row['genero'],
            'temporada'   => $row['temporada'],
            'activo'      => (int) $row['activo'],
            'categoria'   => [
                'id'     => $row['id_categoria'] ? (int) $row['id_categoria'] : null,
                'nombre' => $row['categoria_nombre'] ?? 'General',
            ],
            'marca'       => [
                'nombre' => $row['marca'] ?? 'Tiendaintima',
            ],
            'tela'        => [
                'nombre' => $row['tela'] ?? 'Satén',
            ],
            'imagenes'    => $imagenes,
            'variantes'   => $variantes,
        ];
    }
}
