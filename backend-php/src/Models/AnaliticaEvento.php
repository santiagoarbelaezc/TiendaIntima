<?php

declare(strict_types=1);

namespace App\Models;

use PDO;

class AnaliticaEvento
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function log(string $eventType, ?int $productoId = null, ?int $varianteId = null, array $metadata = []): int
    {
        $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
        $ua = $_SERVER['HTTP_USER_AGENT'] ?? '';

        $stmt = $this->pdo->prepare('
            INSERT INTO analitica_eventos (event_type, producto_id, variante_id, metadata, ip_address, user_agent)
            VALUES (?, ?, ?, ?, ?, ?)
        ');
        $stmt->execute([
            $eventType,
            $productoId,
            $varianteId,
            !empty($metadata) ? json_encode($metadata) : null,
            $ip,
            $ua
        ]);
        return (int) $this->pdo->lastInsertId();
    }

    public function getDashboardStats(): array
    {
        // 1. Total cotizaciones WhatsApp registradas
        $stmtWa = $this->pdo->query("SELECT COUNT(*) FROM analitica_eventos WHERE event_type = 'whatsapp_quote'");
        $totalWhatsApp = (int) ($stmtWa ? $stmtWa->fetchColumn() : 0);

        // 2. Total interacciones registradas
        $stmtTotal = $this->pdo->query("SELECT COUNT(*) FROM analitica_eventos");
        $totalEventos = (int) ($stmtTotal ? $stmtTotal->fetchColumn() : 0);

        // 3. Total prendas activas en catálogo
        $stmtProd = $this->pdo->query("SELECT COUNT(*) FROM productos WHERE activo = 1");
        $totalProductos = (int) ($stmtProd ? $stmtProd->fetchColumn() : 0);

        // 4. Total fotos en galería
        $stmtGal = $this->pdo->query("SELECT COUNT(*) FROM galeria_items WHERE activo = 1");
        $totalGaleria = (int) ($stmtGal ? $stmtGal->fetchColumn() : 0);

        // 5. Total administradores
        $stmtUsers = $this->pdo->query("SELECT COUNT(*) FROM admin_usuarios");
        $totalUsuarios = (int) ($stmtUsers ? $stmtUsers->fetchColumn() : 0);

        // 6. Consultas por día (últimos 7 días reales)
        $labelsDias = [];
        $dataDias = [];
        $diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        for ($i = 6; $i >= 0; $i--) {
            $ts = strtotime("-{$i} days");
            $fecha = date('Y-m-d', $ts);
            $diaSem = $diasSemana[(int) date('w', $ts)];
            $labelsDias[] = $diaSem;

            $stmtCount = $this->pdo->prepare("SELECT COUNT(*) FROM analitica_eventos WHERE DATE(created_at) = ?");
            $stmtCount->execute([$fecha]);
            $cant = (int) $stmtCount->fetchColumn();
            $dataDias[] = $cant;
        }

        // 7. Distribución real de prendas por categoría
        $stmtCat = $this->pdo->query("
            SELECT c.nombre as categoria, COUNT(p.id) as total_prendas
            FROM categorias c
            LEFT JOIN productos p ON p.id_categoria = c.id AND p.activo = 1
            GROUP BY c.id, c.nombre
            ORDER BY total_prendas DESC
        ");
        $cats = $stmtCat ? $stmtCat->fetchAll() : [];
        $labelsCat = [];
        $dataCat = [];
        foreach ($cats as $c) {
            $labelsCat[] = $c['categoria'];
            $dataCat[] = (int) $c['total_prendas'];
        }
        if (empty($labelsCat)) {
            $labelsCat = ['Pijamas', 'Ropa interior', 'Lencería', 'Hombre'];
            $dataCat = [1, 1, 1, 1];
        }

        // 8. Top prendas más consultadas por WhatsApp o visitas
        $stmtTop = $this->pdo->query("
            SELECT p.id, p.nombre, COUNT(e.id) as consultas, COALESCE(c.nombre, 'General') as categoria,
                   p.precio_base as precio
            FROM analitica_eventos e
            JOIN productos p ON e.producto_id = p.id
            LEFT JOIN categorias c ON p.id_categoria = c.id
            GROUP BY p.id, p.nombre, c.nombre, p.precio_base
            ORDER BY consultas DESC
            LIMIT 5
        ");
        $topList = $stmtTop ? $stmtTop->fetchAll() : [];

        // Si aún no hay suficientes eventos registrados, mostrar las prendas del catálogo
        if (empty($topList)) {
            $stmtFallback = $this->pdo->query("
                SELECT p.id, p.nombre, 0 as consultas, COALESCE(c.nombre, 'General') as categoria,
                       p.precio_base as precio
                FROM productos p
                LEFT JOIN categorias c ON p.id_categoria = c.id
                WHERE p.activo = 1
                LIMIT 5
            ");
            $topList = $stmtFallback ? $stmtFallback->fetchAll() : [];
        }

        $topProductos = array_map(function($p) {
            return [
                'id'        => (string) $p['id'],
                'nombre'    => $p['nombre'],
                'categoria' => $p['categoria'] ?? 'General',
                'consultas' => (int) $p['consultas'],
                'precio'    => (float) ($p['precio'] ?? 0),
            ];
        }, $topList);

        // 9. Canales de interacción (WhatsApp vs Catálogo Web)
        $labelsCanales = ['Cotizaciones WhatsApp', 'Vistas de Detalle Prenda', 'Otras Interacciones'];
        $stmtWaCount = $this->pdo->query("SELECT COUNT(*) FROM analitica_eventos WHERE event_type = 'whatsapp_quote'");
        $cWa = (int) ($stmtWaCount ? $stmtWaCount->fetchColumn() : 0);

        $stmtViewCount = $this->pdo->query("SELECT COUNT(*) FROM analitica_eventos WHERE event_type = 'product_view'");
        $cView = (int) ($stmtViewCount ? $stmtViewCount->fetchColumn() : 0);

        $cOther = max(0, $totalEventos - ($cWa + $cView));
        $dataCanales = [$cWa, $cView, $cOther];

        return [
            'kpis' => [
                'totalCotizacionesWhatsApp' => $totalWhatsApp,
                'totalInteracciones'        => $totalEventos,
                'prendasActivas'            => $totalProductos,
                'fotosGaleria'              => $totalGaleria,
                'usuariosAdmin'             => $totalUsuarios
            ],
            'consultasPorDia' => [
                'labels' => $labelsDias,
                'data'   => $dataDias,
            ],
            'prendasPorCategoria' => [
                'labels' => $labelsCat,
                'data'   => $dataCat,
            ],
            'canalesInteraccion' => [
                'labels' => $labelsCanales,
                'data'   => $dataCanales,
            ],
            'topProductos' => $topProductos,
        ];
    }
}
