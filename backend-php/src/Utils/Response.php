<?php

declare(strict_types=1);

namespace App\Utils;

final class Response
{
    public static function json(array $data, int $statusCode = 200): void
    {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    public static function success(mixed $data = null, string $message = 'Operación exitosa', int $statusCode = 200, array $meta = []): void
    {
        $payload = [
            'success' => true,
            'data'    => $data,
            'message' => $message,
        ];

        if (!empty($meta)) {
            $payload['meta'] = $meta;
        }

        self::json($payload, $statusCode);
    }

    public static function error(string $message = 'Error en la petición', int $statusCode = 400, array $errors = []): void
    {
        $payload = [
            'success' => false,
            'message' => $message,
        ];

        if (!empty($errors)) {
            $payload['errors'] = $errors;
        }

        self::json($payload, $statusCode);
    }
}
