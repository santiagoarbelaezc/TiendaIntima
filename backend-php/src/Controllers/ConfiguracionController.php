<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Models\Configuracion;
use App\Utils\Response;

final class ConfiguracionController extends BaseController
{
    public function index(): void
    {
        $model = new Configuracion($this->pdo);
        Response::success($model->all(), 'Configuración obtenida');
    }

    public function detailed(): void
    {
        $this->authUser();
        $model = new Configuracion($this->pdo);
        Response::success($model->getDetailed(), 'Configuración detallada obtenida');
    }

    public function update(): void
    {
        $this->authUser();
        $body = $this->body();

        if (empty($body)) {
            Response::error('No se enviaron datos para actualizar', 400);
            return;
        }

        $model = new Configuracion($this->pdo);
        $model->updateMultiple($body);

        Response::success($model->all(), 'Configuración actualizada exitosamente');
    }
}
