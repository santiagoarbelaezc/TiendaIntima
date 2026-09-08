<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Exceptions\NotFoundException;
use App\Models\Producto;
use App\Utils\Response;
use App\Utils\Validator;

final class ProductosController extends BaseController
{
    public function index(): void
    {
        $filters = [
            'search'       => $_GET['search'] ?? null,
            'id_categoria' => $_GET['id_categoria'] ?? null,
            'genero'       => $_GET['genero'] ?? null,
            'page'         => $_GET['page'] ?? null,
            'limit'        => $_GET['limit'] ?? null,
        ];

        $model = new Producto($this->pdo);
        $products = $model->all($filters);

        Response::success($products, 'Productos obtenidos exitosamente');
    }

    public function show(int $id): void
    {
        $model = new Producto($this->pdo);
        $product = $model->find($id);

        if (!$product) {
            throw new NotFoundException("Producto con ID {$id} no encontrado");
        }

        Response::success($product);
    }

    public function store(): void
    {
        $this->authUser();
        $body = $this->body();

        $v = new Validator($body);
        $v->required(['nombre', 'precio_base']);
        $validated = $v->validateOrFail();

        $model = new Producto($this->pdo);
        $id = $model->create($body);
        $product = $model->find($id);

        Response::success($product, 'Producto creado exitosamente', 201);
    }

    public function destroy(int $id): void
    {
        $this->authUser();
        $model = new Producto($this->pdo);
        $product = $model->find($id);

        if (!$product) {
            throw new NotFoundException('Producto no encontrado');
        }

        $model->delete($id);
        Response::success(['id' => $id], 'Producto eliminado correctamente');
    }
}
