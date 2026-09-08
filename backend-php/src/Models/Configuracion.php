<?php

declare(strict_types=1);

namespace App\Models;

use PDO;

class Configuracion
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function all(): array
    {
        $stmt = $this->pdo->query('SELECT clave, valor, descripcion, updated_at FROM configuracion');
        $rows = $stmt->fetchAll();

        $assoc = [];
        foreach ($rows as $row) {
            $assoc[$row['clave']] = $row['valor'];
        }
        return $assoc;
    }

    public function getDetailed(): array
    {
        $stmt = $this->pdo->query('SELECT clave, valor, descripcion, updated_at FROM configuracion ORDER BY clave ASC');
        return $stmt->fetchAll();
    }

    public function set(string $clave, string $valor, ?string $descripcion = null): void
    {
        $driver = $this->pdo->getAttribute(PDO::ATTR_DRIVER_NAME);
        if ($driver === 'mysql') {
            $stmt = $this->pdo->prepare('
                INSERT INTO configuracion (clave, valor, descripcion, updated_at)
                VALUES (?, ?, ?, CURRENT_TIMESTAMP)
                ON DUPLICATE KEY UPDATE
                    valor = VALUES(valor),
                    updated_at = CURRENT_TIMESTAMP
            ');
        } else {
            $stmt = $this->pdo->prepare('
                INSERT INTO configuracion (clave, valor, descripcion, updated_at)
                VALUES (?, ?, ?, CURRENT_TIMESTAMP)
                ON CONFLICT(clave) DO UPDATE SET
                    valor = excluded.valor,
                    updated_at = CURRENT_TIMESTAMP
            ');
        }
        $stmt->execute([$clave, $valor, $descripcion]);
    }

    public function updateMultiple(array $keyValues): void
    {
        $this->pdo->beginTransaction();
        try {
            foreach ($keyValues as $clave => $valor) {
                $this->set((string) $clave, (string) $valor);
            }
            $this->pdo->commit();
        } catch (\Throwable $e) {
            $this->pdo->rollBack();
            throw $e;
        }
    }
}
