<?php

declare(strict_types=1);

namespace App\Config;

use PDO;
use PDOException;

final class Database
{
    private static ?PDO $pdo = null;

    public static function connect(): PDO
    {
        if (self::$pdo !== null) {
            return self::$pdo;
        }

        $connection = Env::get('DB_CONNECTION', 'sqlite');

        try {
            if ($connection === 'mysql') {
                $host     = Env::get('DB_MYSQL_HOST', Env::get('DB_HOST', '127.0.0.1'));
                $port     = Env::get('DB_MYSQL_PORT', Env::get('DB_PORT', '3306'));
                $database = Env::get('DB_MYSQL_DATABASE', Env::get('DB_DATABASE', 'tiendaintima'));
                $username = Env::get('DB_MYSQL_USERNAME', Env::get('DB_USERNAME', 'root'));
                $password = Env::get('DB_MYSQL_PASSWORD', Env::get('DB_PASSWORD', ''));

                $dsn = "mysql:host={$host};port={$port};dbname={$database};charset=utf8mb4";
                self::$pdo = new PDO($dsn, $username, $password, [
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES   => false,
                ]);
            } else {
                $dbRelativePath = Env::get('DB_DATABASE', 'storage/database.sqlite');
                $rootPath       = dirname(__DIR__, 2);
                $sqlitePath     = $rootPath . DIRECTORY_SEPARATOR . str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $dbRelativePath);

                $dir = dirname($sqlitePath);
                if (!is_dir($dir)) {
                    mkdir($dir, 0777, true);
                }

                $backupsDir = $dir . DIRECTORY_SEPARATOR . 'backups';
                if (!is_dir($backupsDir)) {
                    mkdir($backupsDir, 0777, true);
                }

                self::$pdo = new PDO("sqlite:{$sqlitePath}", null, null, [
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                ]);

                self::$pdo->exec('PRAGMA foreign_keys = ON;');
            }

            self::runMigrationsAndSeed(self::$pdo);

            return self::$pdo;
        } catch (PDOException $e) {
            throw new \RuntimeException('Error al conectar con la base de datos: ' . $e->getMessage(), (int) $e->getCode(), $e);
        }
    }

    private static function runMigrationsAndSeed(PDO $pdo): void
    {
        $isMysql = $pdo->getAttribute(PDO::ATTR_DRIVER_NAME) === 'mysql';
        $autoInc = $isMysql ? 'AUTO_INCREMENT' : 'AUTOINCREMENT';
        $idCol   = $isMysql ? 'INT' : 'INTEGER';

        $pdo->exec("
            CREATE TABLE IF NOT EXISTS admin_usuarios (
                id {$idCol} PRIMARY KEY {$autoInc},
                nombre VARCHAR(120) NOT NULL,
                email VARCHAR(160) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                rol VARCHAR(50) NOT NULL DEFAULT 'admin',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS configuracion (
                clave VARCHAR(100) PRIMARY KEY,
                valor TEXT NOT NULL,
                descripcion TEXT,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS galeria_items (
                id {$idCol} PRIMARY KEY {$autoInc},
                titulo VARCHAR(160) NOT NULL,
                imagen_url TEXT NOT NULL,
                orden INTEGER DEFAULT 0,
                activo INTEGER DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS categorias (
                id {$idCol} PRIMARY KEY {$autoInc},
                nombre VARCHAR(120) NOT NULL,
                id_padre INTEGER DEFAULT NULL,
                descripcion TEXT,
                imagen_url TEXT,
                orden INTEGER DEFAULT 0,
                activo INTEGER DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS productos (
                id {$idCol} PRIMARY KEY {$autoInc},
                nombre VARCHAR(180) NOT NULL,
                descripcion TEXT,
                precio_base NUMERIC(12, 2) NOT NULL DEFAULT 0,
                id_categoria INTEGER,
                genero VARCHAR(50) DEFAULT 'Mujer',
                temporada VARCHAR(80) DEFAULT '2026',
                tela VARCHAR(80) DEFAULT 'Satén',
                marca VARCHAR(80) DEFAULT 'Tiendaintima',
                activo INTEGER DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS producto_imagenes (
                id {$idCol} PRIMARY KEY {$autoInc},
                id_producto {$idCol} NOT NULL,
                url TEXT NOT NULL,
                es_principal INTEGER DEFAULT 0,
                orden INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (id_producto) REFERENCES productos(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS producto_variantes (
                id {$idCol} PRIMARY KEY {$autoInc},
                id_producto {$idCol} NOT NULL,
                sku VARCHAR(80) NOT NULL,
                precio NUMERIC(12, 2) NOT NULL DEFAULT 0,
                stock INTEGER DEFAULT 0,
                color_nombre VARCHAR(60),
                color_hex VARCHAR(20),
                talla_nombre VARCHAR(30),
                activo INTEGER DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (id_producto) REFERENCES productos(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS analitica_eventos (
                id {$idCol} PRIMARY KEY {$autoInc},
                event_type VARCHAR(80) NOT NULL,
                producto_id {$idCol},
                variante_id {$idCol},
                metadata TEXT,
                ip_address VARCHAR(45),
                user_agent TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS backups_log (
                id {$idCol} PRIMARY KEY {$autoInc},
                filename VARCHAR(255) NOT NULL,
                size_bytes INTEGER NOT NULL,
                cloudinary_url TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        ");

        // 1. Seed usuario administrador por defecto
        $stmt = $pdo->prepare('SELECT COUNT(*) FROM admin_usuarios WHERE email = ?');
        $stmt->execute(['admin@tiendaintima.com']);
        if ((int) $stmt->fetchColumn() === 0) {
            $insertUser = $pdo->prepare('
                INSERT INTO admin_usuarios (nombre, email, password_hash, rol)
                VALUES (?, ?, ?, ?)
            ');
            $adminPassword = Env::get('ADMIN_INITIAL_PASSWORD', 'Tiendaintima-123');
            $insertUser->execute([
                'Administrador Tienda Íntima',
                'admin@tiendaintima.com',
                password_hash($adminPassword, PASSWORD_BCRYPT),
                'admin'
            ]);
        }

        // 2. Seed configuración inicial
        $defaultConfig = [
            'brand_name'         => ['Tiendaintima', 'Nombre de la marca'],
            'slogan'             => ['Moda íntima y descanso', 'Eslogan de la tienda'],
            'topbar_active'      => ['1', 'Estado de barra promocional superior'],
            'topbar_msg1'        => ['Envíos a domicilio exclusivos en Calarcá, Quindío', 'Mensaje 1 barra superior'],
            'topbar_msg2'        => ['Nueva colección de pijamas y descanso', 'Mensaje 2 barra superior'],
            'hero_title'         => ['Descanso & Confort', 'Título del Hero'],
            'hero_subtitle'      => ['Pijamas y prendas íntimas suaves para tu comodidad diaria.', 'Subtítulo del Hero'],
            'hero_notice'        => ['Envíos a domicilio solo en Calarcá, Quindío', 'Aclaración de envíos en Hero'],
            'hero_cta'           => ['Ver Catálogo', 'Botón de llamada a la acción en Hero'],
            'whatsapp_number'    => ['+573001234567', 'Número oficial de WhatsApp'],
            'instagram_url'      => ['https://instagram.com/tiendaintima', 'Enlace de Instagram'],
            'direccion_fisica'   => ['Boutique física en Calarcá, Quindío. Envíos locales.', 'Dirección y cobertura física'],
            'politica_envio'     => ['Los envíos a domicilio aplican exclusivamente para el municipio de Calarcá, Quindío.', 'Texto de política de envíos']
        ];

        $checkConf = $pdo->prepare('SELECT COUNT(*) FROM configuracion WHERE clave = ?');
        $insertConf = $pdo->prepare('INSERT INTO configuracion (clave, valor, descripcion) VALUES (?, ?, ?)');

        foreach ($defaultConfig as $clave => [$valor, $descripcion]) {
            $checkConf->execute([$clave]);
            if ((int) $checkConf->fetchColumn() === 0) {
                $insertConf->execute([$clave, $valor, $descripcion]);
            }
        }

        // 3. Seed galería inicial si está vacía
        $countGal = (int) $pdo->query('SELECT COUNT(*) FROM galeria_items')->fetchColumn();
        if ($countGal === 0) {
            $galeriaInitial = [
                ['Satén Blush en Mañanas Claras', 'assets/images/galeria_1.png', 1],
                ['Set Descanso Beige Arena', 'assets/images/galeria_2.png', 2],
                ['Detalle Nupcial Seda Marfil', 'assets/images/galeria_3.png', 3],
                ['Conjunto Casual & Pijama', 'assets/images/galeria_4.png', 4]
            ];
            $stmtGal = $pdo->prepare('INSERT INTO galeria_items (titulo, imagen_url, orden) VALUES (?, ?, ?)');
            foreach ($galeriaInitial as $item) {
                $stmtGal->execute($item);
            }
        }

        // 4. Seed categorías iniciales si está vacía
        $countCat = (int) $pdo->query('SELECT COUNT(*) FROM categorias')->fetchColumn();
        if ($countCat === 0) {
            $cats = [
                ['Pijamas', null, 'Sets de satén y algodón nublado para descanso.', 'assets/images/categorias/cat_pijama.png', 1],
                ['Ropa interior', null, 'Curaduría diaria en algodón y soporte suave.', 'assets/images/categorias/cat_ropa_interior.png', 2],
                ['Lencería', null, 'Detalles en encajes finos y transparencias.', 'assets/images/categorias/cat_lenceria.png', 3],
                ['Hombre', null, 'Línea de descanso masculina y comodidad diaria.', 'assets/images/categorias/cat_hombre.png', 4]
            ];
            $stmtCat = $pdo->prepare('INSERT INTO categorias (nombre, id_padre, descripcion, imagen_url, orden) VALUES (?, ?, ?, ?, ?)');
            foreach ($cats as $c) {
                $stmtCat->execute($c);
            }
        }

        // 5. Seed productos iniciales si está vacía
        $countProd = (int) $pdo->query('SELECT COUNT(*) FROM productos')->fetchColumn();
        if ($countProd === 0) {
            $prods = [
                [
                    'Pijama Satinada Encaje',
                    'Pijama de dos piezas con fino ribete en encaje francés y satén sedoso de alto confort.',
                    125000, 1, 'Mujer', '2026', 'Satén', 'Tiendaintima',
                    ['assets/images/card/c1.png', 'assets/images/galeria_1.png'],
                    [
                        ['sku' => 'PIJ-SAT-ROSA-S', 'precio' => 125000, 'stock' => 12, 'color_nombre' => 'Rosa Blush', 'color_hex' => '#EAC7D2', 'talla_nombre' => 'S'],
                        ['sku' => 'PIJ-SAT-ROSA-M', 'precio' => 125000, 'stock' => 18, 'color_nombre' => 'Rosa Blush', 'color_hex' => '#EAC7D2', 'talla_nombre' => 'M'],
                        ['sku' => 'PIJ-SAT-NEG-S', 'precio' => 125000, 'stock' => 10, 'color_nombre' => 'Negro Azabache', 'color_hex' => '#111111', 'talla_nombre' => 'S'],
                        ['sku' => 'PIJ-SAT-NEG-M', 'precio' => 125000, 'stock' => 15, 'color_nombre' => 'Negro Azabache', 'color_hex' => '#111111', 'talla_nombre' => 'M']
                    ]
                ],
                [
                    'Set Descanso Algodón Beige',
                    'Silueta holgada y fresca, ideal para tardes de calma y lectura en el hogar.',
                    110000, 1, 'Mujer', '2026', 'Algodón Nublado', 'Tiendaintima',
                    ['assets/images/card/c2.png', 'assets/images/galeria_2.png'],
                    [
                        ['sku' => 'SET-BEI-S', 'precio' => 110000, 'stock' => 8, 'color_nombre' => 'Beige Arena', 'color_hex' => '#E8E0D5', 'talla_nombre' => 'S'],
                        ['sku' => 'SET-BEI-M', 'precio' => 110000, 'stock' => 14, 'color_nombre' => 'Beige Arena', 'color_hex' => '#E8E0D5', 'talla_nombre' => 'M']
                    ]
                ],
                [
                    'Bralette Soft Floral',
                    'Soporte sin varillas para uso continuo, confeccionado con microfibra transpirable.',
                    78000, 3, 'Mujer', '2026', 'Encaje Suave', 'Tiendaintima',
                    ['assets/images/card/c3.png', 'assets/images/galeria_3.png'],
                    [
                        ['sku' => 'BRA-NEG-32B', 'precio' => 78000, 'stock' => 10, 'color_nombre' => 'Negro Elegante', 'color_hex' => '#181818', 'talla_nombre' => '32B'],
                        ['sku' => 'BRA-NEG-34B', 'precio' => 78000, 'stock' => 16, 'color_nombre' => 'Negro Elegante', 'color_hex' => '#181818', 'talla_nombre' => '34B']
                    ]
                ],
                [
                    'Set Descanso Hombre Confort',
                    'Camiseta de cuello redondo y pantalón fresco en modal de tacto ultrasuave.',
                    135000, 4, 'Hombre', '2026', 'Modal Premium', 'Tiendaintima',
                    ['assets/images/card/c4.png', 'assets/images/galeria_4.png'],
                    [
                        ['sku' => 'HOM-AZUL-M', 'precio' => 135000, 'stock' => 12, 'color_nombre' => 'Azul Marino', 'color_hex' => '#1E293B', 'talla_nombre' => 'M'],
                        ['sku' => 'HOM-AZUL-L', 'precio' => 135000, 'stock' => 9, 'color_nombre' => 'Azul Marino', 'color_hex' => '#1E293B', 'talla_nombre' => 'L']
                    ]
                ]
            ];

            $stmtInsP = $pdo->prepare('
                INSERT INTO productos (nombre, descripcion, precio_base, id_categoria, genero, temporada, tela, marca, activo)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
            ');
            $stmtInsImg = $pdo->prepare('INSERT INTO producto_imagenes (id_producto, url, es_principal, orden) VALUES (?, ?, ?, ?)');
            $stmtInsVar = $pdo->prepare('
                INSERT INTO producto_variantes (id_producto, sku, precio, stock, color_nombre, color_hex, talla_nombre)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ');

            foreach ($prods as $p) {
                $stmtInsP->execute([$p[0], $p[1], $p[2], $p[3], $p[4], $p[5], $p[6], $p[7]]);
                $newPid = (int) $pdo->lastInsertId();

                foreach ($p[8] as $iIdx => $iUrl) {
                    $stmtInsImg->execute([$newPid, $iUrl, $iIdx === 0 ? 1 : 0, $iIdx]);
                }

                foreach ($p[9] as $v) {
                    $stmtInsVar->execute([$newPid, $v['sku'], $v['precio'], $v['stock'], $v['color_nombre'], $v['color_hex'], $v['talla_nombre']]);
                }
            }
        }
    }
}

