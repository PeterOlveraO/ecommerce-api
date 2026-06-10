# Ecommerce Ajustado — API

API REST del proyecto **Ecommerce Ajustado**, un sistema de comercio electrónico de propósito general que sirve como backend para dos aplicaciones frontend desacopladas: una **tienda pública** para clientes y un **CMS de administración** interno.

---

## Propósito del Proyecto

Ecommerce Ajustado es una plataforma de e-commerce diseñada para negocios que necesitan una solución completa de venta en línea. La API centraliza la lógica de negocio y expone endpoints RESTful consumidos por:

- **Tienda pública** (`ecommerce-storefront`): Catálogo de productos, carrito de compra, registro y pedidos de clientes.
- **Panel de administración** (`ecommerce-cms`): Gestión de inventario, pedidos, métodos de pago e imágenes del banner.

### Flujo de Validación de Pagos (MVP)

El cliente realiza un pedido → sube su comprobante de pago → un administrador lo verifica manualmente y actualiza el `status` del pedido a `confirmed`. La integración con pasarela de pago se planifica para una iteración post-MVP.

---

## Stack Tecnológico

| Categoría | Tecnología | Versión |
|---|---|---|
| **Entorno** | Node.js | >= 18 |
| **Framework** | Express.js | ^5.2.1 |
| **Base de Datos** | MariaDB via mysql2 | ^3.22.5 |
| **Autenticación** | jsonwebtoken (JWT) | ^9.0.3 |
| **Contraseñas** | bcryptjs | ^3.0.3 |
| **Seguridad HTTP** | helmet | ^8.2.0 |
| **CORS** | cors | ^2.8.6 |
| **Validación** | Zod | ^4.4.3 |

---

## Arquitectura

La API sigue una **arquitectura modular por feature**. Cada entidad de negocio es un módulo autocontenido que agrupa sus capas internamente.

### Flujo de Capas

```
routes → controller → service → model
```

| Capa | Responsabilidad |
|---|---|
| `routes` | Define URLs y métodos HTTP. Conecta middlewares y controlador. |
| `controller` | Maneja `req`/`res`. Llama al servicio. Sin SQL ni lógica de negocio. |
| `service` | Lógica de negocio. Orquesta llamadas al modelo. Lanza `AppError` en fallos. |
| `model` | Queries SQL raw via pool. Retorna datos planos. Sin lógica de negocio. |

### Estructura del Proyecto

```
src/
├── app.js                      # Configuración de Express, middlewares y registro de rutas
├── server.js                   # Inicio del servidor HTTP y test de conexión a DB
├── config/
│   ├── env.js                  # Valida variables de entorno requeridas
│   └── db.js                   # Pool de conexiones mysql2 (compartido por todos los modelos)
├── middlewares/
│   ├── auth.middleware.js       # Verifica JWT e inyecta req.user
│   ├── error.middleware.js      # Manejador global de errores + clase AppError
│   └── validate.middleware.js   # Factory de validación con Zod
├── modules/                    # Un directorio por entidad de negocio
│   └── {module}/
│       ├── {module}.routes.js
│       ├── {module}.controller.js
│       ├── {module}.service.js
│       └── {module}.model.js
└── utils/
    ├── response.js             # successResponse(), paginatedResponse()
    └── uuid.js                 # generateId()
```

---

## Módulos del Sistema

| Módulo | Descripción |
|---|---|
| `auth` | Login, refresh token y logout para admin y customer |
| `customer` | Registro y perfil del cliente |
| `product` | Catálogo de productos con inventario y precios de oferta |
| `category` | Categorías con orden configurable |
| `order` | Creación y gestión de pedidos con snapshot de precios |
| `payment_method` | Cuentas bancarias del negocio para transferencias |
| `header_image` | Imágenes del carrusel del banner de la tienda |

---

## Autenticación

La API implementa **JWT stateless** con dos tokens:

- **Access Token**: Expira en `15m`. Se envía en el header `Authorization: Bearer <token>`. Payload: `{ id, role }`.
- **Refresh Token**: Expira en `7d`. Se envía en el cuerpo del request.

### Roles de Usuario

| Rol | Acceso |
|---|---|
| `admin` | CMS: requiere `authMiddleware` + `requireAdmin` |
| `customer` | Tienda: requiere `authMiddleware` únicamente |

---

## Modelo de Datos

La base de datos usa **MariaDB**. Convenciones: `snake_case`, tablas en singular, inglés.

**Tablas:** `auth`, `customer`, `category`, `product`, `product_category`, `shop_order`, `order_item`, `payment_method`, `header_image`

> Todas las PKs son `CHAR(36)` con UUID v4 generado en la aplicación.  
> Los precios y totales de pedidos se guardan como snapshot al momento de la compra para preservar el historial.  
> Las entidades del catálogo usan `is_active` para soft delete, sin hard DELETE.

---

## Configuración

### Prerequisitos

- Node.js >= 18
- MariaDB / MySQL

### 1. Clonar e instalar dependencias

```bash
git clone https://github.com/PeterOlveraO/ecommerce-api.git
cd ecommerce-api
npm install
```

### 2. Configurar variables de entorno

Copia el archivo de ejemplo y rellena tus valores:

```bash
cp .env.example .env
```

Las variables de JWT deben cambiarse por strings largos y aleatorios en producción. Puedes generarlos con:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. Crear la base de datos

Ejecuta el schema SQL en tu instancia de MariaDB e inicia el servidor.

---

## Comandos

```bash
npm run dev    # Servidor en modo desarrollo con hot reload (recomendado)
npm start      # Servidor en modo producción
```

---

## Convenciones del Código

- **Módulos**: ES Modules (`import/export`). Nunca usar `require`.
- **Idioma**: Código en inglés, comentarios en español.
- **Nomenclatura**: `snake_case` para archivos, variables y columnas de DB.
- **IDs**: Siempre `const id = generateId()` antes de un INSERT.
- **Respuestas**: Siempre usar `successResponse()` o `paginatedResponse()`. Nunca `res.json()` directo.
- **Errores**: Siempre `throw new AppError(message, statusCode)`. Nunca `res.status().json()` directo.
- **Eliminaciones**: Soft delete con `is_active = false` en entidades de catálogo.

---

## Licencia

ISC
