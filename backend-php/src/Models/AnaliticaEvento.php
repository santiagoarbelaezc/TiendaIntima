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
        // 1. Agregado de KPIs en una sola consulta
        $stmtKpis = $this->pdo->query("
            SELECT 
                (SELECT COUNT(*) FROM analitica_eventos WHERE event_type = 'whatsapp_quote') as total_wa,
                (SELECT COUNT(*) FROM analitica_eventos) as total_eventos,
                (SELECT COUNT(*) FROM productos WHERE activo = 1) as total_productos,
                (SELECT COUNT(*) FROM galeria_items WHERE activo = 1) as total_galeria,
                (SELECT COUNT(*) FROM admin_usuarios) as total_usuarios
        ");
        $kpiData = $stmtKpis ? $stmtKpis->fetch() : [];

        $totalWhatsApp  = (int) ($kpiData['total_wa'] ?? 0);
        $totalEventos   = (int) ($kpiData['total_eventos'] ?? 0);
        $totalProductos = (int) ($kpiData['total_productos'] ?? 0);
        $totalGaleria   = (int) ($kpiData['total_galeria'] ?? 0);
        $totalUsuarios  = (int) ($kpiData['total_usuarios'] ?? 0);

        // 2. Consultas por día (últimos 7 días) en 1 sola consulta
        $labelsDias = [];
        $dataDias = [];
        $diasMap = [];
        $diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        
        $fechaInicio = date('Y-m-d 00:00:00', strtotime('-6 days'));
        $stmtDias = $this->pdo->prepare("
            SELECT DATE(created_at) as fecha, COUNT(*) as cant 
            FROM analitica_eventos 
            WHERE created_at >= ? 
            GROUP BY DATE(created_at)
        ");
        $stmtDias->execute([$fechaInicio]);
        $rowsDias = $stmtDias->fetchAll();
        foreach ($rowsDias as $r) {
            $diasMap[$r['fecha']] = (int) $r['cant'];
        }

        for ($i = 6; $i >= 0; $i--) {
            $ts = strtotime("-{$i} days");
            $fechaStr = date('Y-m-d', $ts);
            $labelsDias[] = $diasSemana[(int) date('w', $ts)];
            $dataDias[] = $diasMap[$fechaStr] ?? 0;
        }

        // 3. Distribución real de prendas por categoría (1 consulta)
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

        // 4. Top prendas más consultadas por WhatsApp o visitas (1 consulta)
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

        // 5. Canales de interacción en 1 sola consulta
        $labelsCanales = ['Cotizaciones WhatsApp', 'Vistas de Detalle Prenda', 'Otras Interacciones'];
        $cWa = 0;
        $cView = 0;
        $stmtEventCounts = $this->pdo->query("
            SELECT event_type, COUNT(*) as cant 
            FROM analitica_eventos 
            GROUP BY event_type
        ");
        $eventRows = $stmtEventCounts ? $stmtEventCounts->fetchAll() : [];
        foreach ($eventRows as $er) {
            if ($er['event_type'] === 'whatsapp_quote') {
                $cWa = (int) $er['cant'];
            } elseif ($er['event_type'] === 'product_view') {
                $cView = (int) $er['cant'];
            }
        }
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
