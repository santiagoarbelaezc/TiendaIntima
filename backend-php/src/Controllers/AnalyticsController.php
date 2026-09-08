<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Models\AnaliticaEvento;
use App\Utils\Response;
use App\Utils\Validator;

final class AnalyticsController extends BaseController
{
    public function dashboard(): void
    {
        $this->authUser();
        $model = new AnaliticaEvento($this->pdo);
        $stats = $model->getDashboardStats();
        Response::success($stats, 'Métricas y analíticas obtenidas exitosamente');
    }

    public function trackEvent(): void
    {
        $body = $this->body();

        $v = new Validator($body);
        $v->required(['event_type']);
        $validated = $v->validateOrFail();

        $model = new AnaliticaEvento($this->pdo);
        $id = $model->log(
            (string) $validated['event_type'],
            isset($validated['producto_id']) ? (int) $validated['producto_id'] : null,
            isset($validated['variante_id']) ? (int) $validated['variante_id'] : null,
            is_array($validated['metadata'] ?? null) ? $validated['metadata'] : []
        );

        Response::success(['event_id' => $id], 'Evento registrado correctamente', 201);
    }
}
