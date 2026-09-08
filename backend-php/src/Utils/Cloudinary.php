<?php

declare(strict_types=1);

namespace App\Utils;

use App\Config\Env;
use App\Exceptions\ApiException;

final class Cloudinary
{
    /**
     * Sube un archivo a Cloudinary (soporta imágenes o archivos raw como backups .sql/.sqlite)
     *
     * @param string $fileDataOrPath Ruta absoluta al archivo o data URI/URL
     * @param string $folder Carpeta destino en Cloudinary (ej: tiendaintima/backups)
     * @param string $resourceType 'image' | 'raw' | 'auto'
     */
    public static function upload(string $fileDataOrPath, string $folder = 'tiendaintima', string $resourceType = 'auto'): array
    {
        $cloudName = Env::get('CLOUDINARY_CLOUD_NAME');
        $apiKey    = Env::get('CLOUDINARY_API_KEY');
        $apiSecret = Env::get('CLOUDINARY_API_SECRET');

        if (!$cloudName || !$apiKey || !$apiSecret) {
            throw new ApiException('Credenciales de Cloudinary no configuradas en .env', 500);
        }

        $timestamp = time();
        $paramsToSign = [
            'folder'    => $folder,
            'timestamp' => $timestamp,
        ];
        ksort($paramsToSign);

        // Generar firma SHA1
        $toSign = '';
        foreach ($paramsToSign as $key => $val) {
            $toSign .= "{$key}={$val}&";
        }
        $toSign = rtrim($toSign, '&') . $apiSecret;
        $signature = sha1($toSign);

        // Preparar archivo si es ruta local
        if (file_exists($fileDataOrPath)) {
            $filePayload = curl_file_create($fileDataOrPath);
        } else {
            $filePayload = $fileDataOrPath;
        }

        $postFields = [
            'file'      => $filePayload,
            'api_key'   => $apiKey,
            'timestamp' => $timestamp,
            'folder'    => $folder,
            'signature' => $signature,
        ];

        $endpoint = "https://api.cloudinary.com/v1_1/{$cloudName}/{$resourceType}/upload";
        $ch = curl_init($endpoint);
        curl_setopt_array($ch, [
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => $postFields,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_TIMEOUT        => 60,
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlErr  = curl_error($ch);
        curl_close($ch);

        if ($curlErr) {
            throw new ApiException("Error en la conexión a Cloudinary: {$curlErr}", 500);
        }

        $result = json_decode($response, true);
        if ($httpCode >= 400 || isset($result['error'])) {
            $msg = $result['error']['message'] ?? 'Error desconocido al subir archivo a Cloudinary';
            throw new ApiException("Cloudinary: {$msg}", 400);
        }

        return [
            'url'        => $result['secure_url'] ?? $result['url'],
            'public_id'  => $result['public_id'] ?? '',
            'format'     => $result['format'] ?? '',
            'bytes'      => $result['bytes'] ?? 0,
        ];
    }
}
