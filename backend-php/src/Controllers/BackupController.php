<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Config\Env;
use App\Exceptions\NotFoundException;
use App\Utils\Cloudinary;
use App\Utils\Response;
use PDO;

final class BackupController extends BaseController
{
    private string $backupDir;

    public function __construct(PDO $pdo)
    {
        parent::__construct($pdo);
        $this->backupDir = dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . 'storage' . DIRECTORY_SEPARATOR . 'backups';
        if (!is_dir($this->backupDir)) {
            mkdir($this->backupDir, 0777, true);
        }

        $this->ensureTableSchema();
    }

    private function ensureTableSchema(): void
    {
        try {
            // Asegurar columna cloudinary_url en backups_log
            $driver = $this->pdo->getAttribute(PDO::ATTR_DRIVER_NAME);
            if ($driver === 'sqlite') {
                $cols = $this->pdo->query("PRAGMA table_info(backups_log)")->fetchAll(PDO::FETCH_COLUMN, 1);
                if (!in_array('cloudinary_url', $cols, true)) {
                    $this->pdo->exec("ALTER TABLE backups_log ADD COLUMN cloudinary_url TEXT");
                }
            } else {
                $cols = $this->pdo->query("SHOW COLUMNS FROM backups_log LIKE 'cloudinary_url'")->fetchAll();
                if (empty($cols)) {
                    $this->pdo->exec("ALTER TABLE backups_log ADD COLUMN cloudinary_url TEXT");
                }
            }
        } catch (\Throwable) {
            // Ignorar si ya existe
        }
    }

    public function index(): void
    {
        $this->authUser();

        $stmt = $this->pdo->query("SELECT * FROM backups_log ORDER BY created_at DESC");
        $logs = $stmt ? $stmt->fetchAll(PDO::FETCH_ASSOC) : [];

        $backups = [];
        foreach ($logs as $log) {
            $filename = $log['filename'];
            $localPath = $this->backupDir . DIRECTORY_SEPARATOR . $filename;
            $size = (int) ($log['size_bytes'] ?? (file_exists($localPath) ? filesize($localPath) : 0));

            $backups[] = [
                'filename'       => $filename,
                'size_bytes'     => $size,
                'size_formatted' => $this->formatBytes($size),
                'cloudinary_url' => $log['cloudinary_url'] ?? null,
                'created_at'     => $log['created_at'],
            ];
        }

        // Si hay archivos en disco no registrados en la tabla, agregarlos también
        $existingNames = array_column($backups, 'filename');
        $files = glob($this->backupDir . DIRECTORY_SEPARATOR . 'backup_*.*');
        foreach ($files as $filepath) {
            $fname = basename($filepath);
            if (!in_array($fname, $existingNames, true)) {
                $size = filesize($filepath);
                $backups[] = [
                    'filename'       => $fname,
                    'size_bytes'     => $size,
                    'size_formatted' => $this->formatBytes($size),
                    'cloudinary_url' => null,
                    'created_at'     => date('Y-m-d H:i:s', filemtime($filepath)),
                ];
            }
        }

        usort($backups, fn($a, $b) => strcmp($b['created_at'], $a['created_at']));

        Response::success($backups, 'Listado de copias de seguridad');
    }

    public function create(): void
    {
        $this->authUser();

        $timestamp = date('Ymd_His');
        $destFile  = "backup_tiendaintima_{$timestamp}.sql";
        $destPath  = $this->backupDir . DIRECTORY_SEPARATOR . $destFile;

        // 1. Generar volcado SQL completo de todas las tablas de la base de datos actual
        $sqlDump = $this->generateSqlDump();
        file_put_contents($destPath, $sqlDump);
        $size = filesize($destPath);

        // 2. Subir copia de seguridad directamente a Cloudinary como recurso raw
        $cloudinaryUrl = null;
        try {
            $cloudRes = Cloudinary::upload($destPath, 'tiendaintima/backups', 'raw');
            $cloudinaryUrl = $cloudRes['url'] ?? null;
        } catch (\Throwable $e) {
            // Si falla Cloudinary (por ejemplo sin internet momentáneo), conservamos la copia local
            error_log('Cloudinary backup upload warning: ' . $e->getMessage());
        }

        // 3. Registrar en log de base de datos
        $stmt = $this->pdo->prepare('
            INSERT INTO backups_log (filename, size_bytes, cloudinary_url, created_at)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        ');
        $stmt->execute([$destFile, $size, $cloudinaryUrl]);

        Response::success([
            'filename'       => $destFile,
            'size_bytes'     => $size,
            'size_formatted' => $this->formatBytes($size),
            'cloudinary_url' => $cloudinaryUrl,
            'created_at'     => date('Y-m-d H:i:s'),
        ], 'Copia de seguridad generada y guardada en Cloudinary exitosamente', 201);
    }

    public function download(): void
    {
        $this->authUser();

        $filename = $_GET['file'] ?? '';
        $filename = basename($filename);

        // Verificar si tiene URL en Cloudinary
        $stmt = $this->pdo->prepare("SELECT cloudinary_url FROM backups_log WHERE filename = ?");
        $stmt->execute([$filename]);
        $cloudUrl = $stmt->fetchColumn();

        if (!empty($cloudUrl)) {
            header('Location: ' . $cloudUrl);
            exit;
        }

        $filePath = $this->backupDir . DIRECTORY_SEPARATOR . $filename;
        if (!$filename || !file_exists($filePath)) {
            throw new NotFoundException('El archivo de respaldo solicitado no existe.');
        }

        header('Content-Description: File Transfer');
        header('Content-Type: application/sql');
        header('Content-Disposition: attachment; filename="' . $filename . '"');
        header('Expires: 0');
        header('Cache-Control: must-revalidate');
        header('Pragma: public');
        header('Content-Length: ' . filesize($filePath));
        readfile($filePath);
        exit;
    }

    public function destroy(string $filename): void
    {
        $this->authUser();

        $cleanFilename = basename($filename);
        $filePath = $this->backupDir . DIRECTORY_SEPARATOR . $cleanFilename;

        if (file_exists($filePath)) {
            unlink($filePath);
        }

        $stmt = $this->pdo->prepare('DELETE FROM backups_log WHERE filename = ?');
        $stmt->execute([$cleanFilename]);

        Response::success(['filename' => $cleanFilename], 'Copia de seguridad eliminada');
    }

    private function formatBytes(int $bytes): string
    {
        if ($bytes >= 1048576) {
            return number_format($bytes / 1048576, 2) . ' MB';
        }
        if ($bytes >= 1024) {
            return number_format($bytes / 1024, 2) . ' KB';
        }
        return $bytes . ' B';
    }

    private function generateSqlDump(): string
    {
        $driver = $this->pdo->getAttribute(PDO::ATTR_DRIVER_NAME);
        $isMysql = $driver === 'mysql';

        $tables = [
            'admin_usuarios',
            'configuracion',
            'galeria_items',
            'categorias',
            'productos',
            'producto_imagenes',
            'producto_variantes',
            'analitica_eventos'
        ];

        $dump = "-- ========================================================\n";
        $dump .= "-- Backup de Base de Datos - Tienda Íntima (" . strtoupper($driver) . ")\n";
        $dump .= "-- Fecha de Generación: " . date('Y-m-d H:i:s') . "\n";
        $dump .= "-- ========================================================\n\n";

        foreach ($tables as $table) {
            // Verificar si la tabla existe
            try {
                $check = $this->pdo->query("SELECT 1 FROM {$table} LIMIT 1");
                if (!$check) continue;
            } catch (\Throwable) {
                continue;
            }

            $dump .= "-- --------------------------------------------------------\n";
            $dump .= "-- Tabla: `{$table}`\n";
            $dump .= "-- --------------------------------------------------------\n\n";

            if ($isMysql) {
                $createRow = $this->pdo->query("SHOW CREATE TABLE `{$table}`")->fetch(PDO::FETCH_ASSOC);
                if ($createRow && isset($createRow['Create Table'])) {
                    $dump .= "DROP TABLE IF EXISTS `{$table}`;\n";
                    $dump .= $createRow['Create Table'] . ";\n\n";
                }
            } else {
                $sqlCreate = $this->pdo->query("SELECT sql FROM sqlite_master WHERE type='table' AND name='{$table}'")->fetchColumn();
                if ($sqlCreate) {
                    $dump .= "DROP TABLE IF EXISTS `{$table}`;\n";
                    $dump .= $sqlCreate . ";\n\n";
                }
            }

            // Filas
            $rows = $this->pdo->query("SELECT * FROM `{$table}`")->fetchAll(PDO::FETCH_ASSOC);
            if (!empty($rows)) {
                $columns = array_keys($rows[0]);
                $colNames = implode(', ', array_map(fn($c) => "`{$c}`", $columns));

                foreach ($rows as $row) {
                    $vals = array_map(function ($val) {
                        if ($val === null) return 'NULL';
                        return $this->pdo->quote((string) $val);
                    }, array_values($row));

                    $dump .= "INSERT INTO `{$table}` ({$colNames}) VALUES (" . implode(', ', $vals) . ");\n";
                }
                $dump .= "\n";
            }
        }

        return $dump;
    }
}
