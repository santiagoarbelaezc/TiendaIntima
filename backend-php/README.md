# Backend REST API — Tienda Íntima (PHP)

Backend profesional, modular y seguro para la plataforma de comercio y descanso **Tienda Íntima**. Construido con PHP moderno (8.1+), arquitectura limpia PSR-4, autenticación JWT, soporte para personalización de textos e imágenes de galería, backups de base de datos y módulo de analíticas en tiempo real.

---

## 🚀 Cómo Iniciar el Servidor

Desde la carpeta `backend-php/`:

```bash
php -S localhost:8000 index.php
```

La API estará disponible de inmediato en: `http://localhost:8000/api`

---

## 🔐 Credenciales de Administrador por Defecto

- **Email:** `admin@tiendaintima.com`
- **Contraseña:** `Tiendaintima-123`

---

## 🛠️ Módulos y Endpoints Disponibles

### 1. Autenticación (`AuthController`)
| Método | Endpoint | Descripción | Requiere Token |
|---|---|---|---|
| `POST` | `/api/auth/login` | Iniciar sesión y recibir Token JWT | No |
| `GET` | `/api/auth/me` | Obtener datos del usuario autenticado | Sí (Bearer) |

#### Ejemplo de Login:
```json
// POST /api/auth/login
{
  "email": "admin@tiendaintima.com",
  "password": "Tiendaintima-123"
}
```

---

### 2. Personalización del Sitio Web (`ConfiguracionController`)
Permite editar todos los textos del sitio (Hero, avisos de cobertura en Calarcá, barra promocional, datos de contacto).

| Método | Endpoint | Descripción | Requiere Token |
|---|---|---|---|
| `GET` | `/api/configuracion` | Obtiene el mapa clave-valor de textos y ajustes | No |
| `GET` | `/api/configuracion/detallada` | Obtiene descripciones y fechas de actualización | Sí |
| `PUT` | `/api/configuracion` | Actualiza uno o múltiples textos en tiempo real | Sí |

#### Ejemplo de Actualización de Textos:
```json
// PUT /api/configuracion
{
  "hero_title": "Descanso, Calma y Satén",
  "hero_notice": "Envíos a domicilio solo en Calarcá, Quindío",
  "topbar_msg1": "Envíos a domicilio exclusivos en Calarcá, Quindío",
  "whatsapp_number": "+573001234567"
}
```

---

### 3. Galería de Fotos (`GaleriaController`)
Permite administrar las fotos de la sección de galería.

| Método | Endpoint | Descripción | Requiere Token |
|---|---|---|---|
| `GET` | `/api/galeria` | Listado público de fotos activas | No |
| `GET` | `/api/galeria/admin` | Listado completo con estado y orden | Sí |
| `POST` | `/api/galeria` | Añadir nueva imagen a la galería | Sí |
| `PUT` | `/api/galeria/{id}` | Actualizar título, orden o estado | Sí |
| `DELETE` | `/api/galeria/{id}` | Eliminar imagen de la galería | Sí |

---

### 4. Backups de Base de Datos (`BackupController`)
Permite generar snapshots de la base de datos, descargarlos y gestionarlos.

| Método | Endpoint | Descripción | Requiere Token |
|---|---|---|---|
| `GET` | `/api/backups` | Lista copias de seguridad existentes con tamaño y fecha | Sí |
| `POST` | `/api/backups` | Genera una nueva copia de seguridad snapshot | Sí |
| `GET` | `/api/backups/download?file=...` | Descarga el archivo de respaldo seleccionado | Sí |
| `DELETE` | `/api/backups/{filename}` | Elimina una copia de seguridad | Sí |

---

### 5. Analíticas y Métricas (`AnalyticsController`)
Métricas de rendimiento e interacciones del cliente (cotizaciones por WhatsApp, visitas, productos más consultados).

| Método | Endpoint | Descripción | Requiere Token |
|---|---|---|---|
| `GET` | `/api/analytics/dashboard` | KPIs del dashboard (WhatsApp, productos, actividad) | Sí |
| `POST` | `/api/analytics/events` | Registra clics y eventos de WhatsApp | No |

---

### 6. Catálogo: Productos y Categorías
| Método | Endpoint | Descripción | Requiere Token |
|---|---|---|---|
| `GET` | `/api/productos` | Lista de productos con filtros y variantes | No |
| `GET` | `/api/productos/{id}` | Detalle de un producto | No |
| `POST` | `/api/productos` | Crear nuevo producto con variantes e imágenes | Sí |
| `DELETE` | `/api/productos/{id}` | Eliminar producto | Sí |
| `GET` | `/api/categorias` | Categorías (`?format=tree` o plano) | No |
| `POST` | `/api/categorias` | Crear categoría | Sí |

---

## 💾 Base de Datos

Por defecto utiliza **SQLite** (`storage/database.sqlite`), el cual se inicializa y autoseedee automáticamente en el primer arranque sin necesidad de comandos manuales. También puede configurarse para **MySQL** ajustando las variables en el archivo `.env`.
