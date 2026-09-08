<?php

declare(strict_types=1);

require_once __DIR__ . '/vendor/autoload.php';

use App\Config\Database;
use App\Config\Env;
use App\Controllers\AnalyticsController;
use App\Controllers\AuthController;
use App\Controllers\BackupController;
use App\Controllers\CategoriasController;
use App\Controllers\ConfiguracionController;
use App\Controllers\GaleriaController;
use App\Controllers\ProductosController;
use App\Controllers\UploadController;
use App\Exceptions\ApiException;
use App\Middleware\CorsMiddleware;
use App\Router\Router;
use App\Utils\Response;

// 1. Cargar variables de entorno
Env::load(__DIR__ . '/.env');

// 2. Manejo global de CORS y preflight OPTIONS
CorsMiddleware::handle();

// 3. Inicializar conexión a Base de Datos (SQLite por defecto o MySQL)
try {
    $pdo = Database::connect();
} catch (\Throwable $e) {
    Response::error('Error de conexión a la base de datos: ' . $e->getMessage(), 500);
}

// 4. Instanciar controladores con inyección de dependencias (PDO)
$authCtrl     = new AuthController($pdo);
$configCtrl   = new ConfiguracionController($pdo);
$galeriaCtrl  = new GaleriaController($pdo);
$backupCtrl   = new BackupController($pdo);
$analyticsCtrl= new AnalyticsController($pdo);
$productosCtrl= new ProductosController($pdo);
$categoriasCtrl= new CategoriasController($pdo);
$uploadCtrl   = new UploadController($pdo);

// 5. Configurar Rutas
$router = new Router();

// --- Información de la API ---
$router->get('/', function () {
    Response::success([
        'api'       => 'Tienda Íntima API REST',
        'version'   => '1.0.0',
        'status'    => 'online',
        'endpoints' => [
            'auth'          => '/api/auth/login, /api/auth/me',
            'configuracion' => '/api/configuracion',
            'galeria'       => '/api/galeria',
            'backups'       => '/api/backups',
            'analytics'     => '/api/analytics/dashboard, /api/analytics/events',
            'productos'     => '/api/productos',
            'categorias'    => '/api/categorias',
        ],
    ], 'API Tienda Íntima en ejecución');
});

// --- Autenticación ---
$router->post('/api/auth/login', [$authCtrl, 'login']);
$router->post('/auth/login', [$authCtrl, 'login']);
$router->get('/api/auth/me', [$authCtrl, 'me']);
$router->get('/auth/me', [$authCtrl, 'me']);

// --- Personalización del Sitio Web ---
$router->get('/api/configuracion', [$configCtrl, 'index']);
$router->get('/api/configuracion/detallada', [$configCtrl, 'detailed']);
$router->put('/api/configuracion', [$configCtrl, 'update']);

// --- Galería de Fotos y Subida ---
$router->get('/api/galeria', [$galeriaCtrl, 'index']);
$router->get('/api/galeria/admin', [$galeriaCtrl, 'all']);
$router->post('/api/galeria', [$galeriaCtrl, 'store']);
$router->put('/api/galeria/{id}', [$galeriaCtrl, 'update']);
$router->delete('/api/galeria/{id}', [$galeriaCtrl, 'destroy']);
$router->post('/api/upload', [$uploadCtrl, 'upload']);

// --- Backups de Base de Datos ---
$router->get('/api/backups', [$backupCtrl, 'index']);
$router->post('/api/backups', [$backupCtrl, 'create']);
$router->get('/api/backups/download', [$backupCtrl, 'download']);
$router->delete('/api/backups/{filename}', [$backupCtrl, 'destroy']);

// --- Analíticas y Eventos ---
$router->get('/api/analytics/dashboard', [$analyticsCtrl, 'dashboard']);
$router->post('/api/analytics/events', [$analyticsCtrl, 'trackEvent']);

// --- Catálogo: Productos ---
$router->get('/api/productos', [$productosCtrl, 'index']);
$router->get('/api/productos/{id}', [$productosCtrl, 'show']);
$router->post('/api/productos', [$productosCtrl, 'store']);
$router->delete('/api/productos/{id}', [$productosCtrl, 'destroy']);

// --- Catálogo: Categorías ---
$router->get('/api/categorias', [$categoriasCtrl, 'index']);
$router->post('/api/categorias', [$categoriasCtrl, 'store']);
$router->delete('/api/categorias/{id}', [$categoriasCtrl, 'destroy']);

// 6. Despachar petición con captura de excepciones
try {
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    $uri    = $_SERVER['REQUEST_URI'] ?? '/';
    $router->dispatch($method, $uri);
} catch (ApiException $e) {
    Response::error($e->getMessage(), $e->getStatusCode(), $e->getErrors());
} catch (\Throwable $e) {
    $debug = Env::get('APP_DEBUG', 'false') === 'true';
    $msg   = $debug ? $e->getMessage() . ' en ' . $e->getFile() . ':' . $e->getLine() : 'Ocurrió un error interno en el servidor';
    Response::error($msg, 500);
}
