<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Exceptions\ApiException;
use App\Utils\Cloudinary;
use App\Utils\Response;

final class UploadController extends BaseController
{
    public function upload(): void
    {
        $this->authUser();

        $folder = $_POST['folder'] ?? 'tiendaintima';

        // 1. Archivo subido vía multipart/form-data
        if (isset($_FILES['file']) && is_uploaded_file($_FILES['file']['tmp_name'])) {
            $tmpPath = $_FILES['file']['tmp_name'];
            $res = Cloudinary::upload($tmpPath, $folder);
            Response::success($res, 'Imagen subida a Cloudinary exitosamente');
            return;
        }

        // 2. Archivo en base64 o URL remota vía JSON
        $body = $this->body();
        if (!empty($body['file'])) {
            $res = Cloudinary::upload((string) $body['file'], $folder);
            Response::success($res, 'Imagen subida a Cloudinary exitosamente');
            return;
        }

        throw new ApiException('No se proporcionó ningún archivo o imagen para subir.', 400);
    }
}
