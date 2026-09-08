<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Exceptions\NotFoundException;
use App\Models\Categoria;
use App\Utils\Response;
use App\Utils\Validator;

final class CategoriasController extends BaseController
{
    public function index(): void
    {
        $format = $_GET['format'] ?? 'tree';
        $model = new Categoria($this->pdo);
        $categories = $model->all($format);

        Response::success($categories, 'Categorías obtenidas exitosamente');
    }

    public function store(): void
    {
        $this->authUser();
        $body = $this->body();

        $v = new Validator($body);
        $v->required(['nombre']);
        $validated = $v->validateOrFail();

        $model = new Categoria($this->pdo);
        $id = $model->create($body);
        $cat = $model->find($id);

        Response::success($cat, 'Categoría creada exitosamente', 201);
    }

    public function destroy(int $id): void
    {
        $this->authUser();
        $model = new Categoria($this->pdo);
        $cat = $model->find($id);

        if (!$cat) {
            throw new NotFoundException('Categoría no encontrada');
        }

        $model->delete($id);
        Response::success(['id' => $id], 'Categoría eliminada correctamente');
    }
}
