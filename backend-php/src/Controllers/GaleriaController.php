<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Exceptions\NotFoundException;
use App\Models\GaleriaItem;
use App\Utils\Response;
use App\Utils\Validator;

final class GaleriaController extends BaseController
{
    public function index(): void
    {
        $model = new GaleriaItem($this->pdo);
        $items = $model->all(true);
        Response::success($items, 'Galería obtenida exitosamente');
    }

    public function all(): void
    {
        $this->authUser();
        $model = new GaleriaItem($this->pdo);
        $items = $model->all(false);
        Response::success($items, 'Listado completo de galería');
    }

    public function store(): void
    {
        $this->authUser();
        $body = $this->body();

        $v = new Validator($body);
        $v->required(['titulo', 'imagen_url']);
        $validated = $v->validateOrFail();

        $model = new GaleriaItem($this->pdo);
        $id = $model->create(
            (string) $validated['titulo'],
            (string) $validated['imagen_url'],
            (int) ($validated['orden'] ?? 0)
        );

        $newItem = $model->find($id);
        Response::success($newItem, 'Imagen agregada a la galería', 201);
    }

    public function update(int $id): void
    {
        $this->authUser();
        $body = $this->body();

        $model = new GaleriaItem($this->pdo);
        $item = $model->find($id);
        if (!$item) {
            throw new NotFoundException('Elemento de galería no encontrado');
        }

        $model->update($id, $body);
        Response::success($model->find($id), 'Elemento de galería actualizado');
    }

    public function destroy(int $id): void
    {
        $this->authUser();
        $model = new GaleriaItem($this->pdo);
        $item = $model->find($id);
        if (!$item) {
            throw new NotFoundException('Elemento de galería no encontrado');
        }

        $model->delete($id);
        Response::success(['id' => $id], 'Imagen eliminada de la galería');
    }
}
