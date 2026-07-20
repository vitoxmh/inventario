# Inventario - Sistema de Gestion de Colecciones

Sistema web para la gestion de colecciones de videojuegos, consolas, amiibos, libros, accesorios y plataformas. Compuesto por una API REST en PHP, una API secundaria en Python (FastAPI), un frontend en React y una base de datos MySQL 8.0, todo orquestado con Docker.

## Arquitectura

```
inventario/
├── app/                        # Frontend React (Vite + React 19)
│   ├── src/                    # Codigo fuente React
│   │   ├── components/         # Componentes reutilizables
│   │   ├── config/             # Configuracion de API y validaciones
│   │   ├── context/            # Contextos (Auth, Sidebar)
│   │   └── pages/              # Paginas de la aplicacion
│   ├── vite.config.js          # Configuracion de Vite
│   └── package.json            # Dependencias del frontend
├── src/                        # Backend PHP
│   ├── api/                    # Endpoints REST
│   │   ├── auth/               # Autenticacion (login, register, refresh)
│   │   ├── games/              # CRUD de videojuegos
│   │   ├── consolas/           # CRUD de consolas
│   │   ├── amiibos/            # CRUD de amiibos y figuras
│   │   ├── libros/             # CRUD de libros
│   │   ├── accesorios/         # CRUD de accesorios
│   │   ├── plataformas/        # CRUD de plataformas
│   │   ├── imagenes/           # Gestion de imagenes (upload/download)
│   │   ├── controllers/        # Controladores (patron repositorio)
│   │   ├── interfaces/         # Interfaces PHP
│   │   ├── repositories/       # Repositorios de datos
│   │   ├── middleware/         # Autenticacion, rate limiting, sanitizacion
│   │   └── helpers.php         # Funciones auxiliares
│   └── config/                 # Configuracion (DB, JWT, env)
├── src-python/                 # API secundaria Python (FastAPI)
│   ├── main.py                 # Endpoint FastAPI
│   ├── database.py             # Conexion SQLAlchemy
│   └── requirements.txt        # Dependencias Python
├── docker/                     # Configuracion Docker
│   ├── php/Dockerfile          # Imagen PHP-FPM 8.3
│   └── nginx/default.conf      # Configuracion Nginx
├── SQL/                        # Esquema de base de datos
│   └── videojuegos.sql         # Script de creacion de tablas
├── docker-compose.yml          # Compose base
├── docker-compose.dev.yml      # Compose para desarrollo
├── docker-compose.prod.yml     # Compose para produccion
└── .env.example                # Plantilla de variables de entorno
```

## Stack Tecnologico

| Capa         | Tecnologia                          |
|--------------|-------------------------------------|
| Frontend     | React 19, React Router 7, Bootstrap 5, Vite 7, SCSS |
| Backend API  | PHP 8.3 (FPM), Nginx, PDO MySQL     |
| API Python   | Python 3.12, FastAPI, SQLAlchemy, PyMySQL |
| Base datos   | MySQL 8.0                           |
| Infra        | Docker, Docker Compose              |
| Auth         | JWT (HS256) + Refresh Tokens         |

## Requisitos Previos

- Docker y Docker Compose v2+
- Git

## Instalacion

1. Clonar el repositorio:
```bash
git clone https://github.com/tu-usuario/inventario.git
cd inventario
```

2. Copiar el archivo de variables de entorno:
```bash
cp .env.example .env
```

3. Editar `.env` con los valores deseados (especialmente `JWT_SECRET` y `MYSQL_ROOT_PASSWORD`).

4. Levantar el entorno de desarrollo:
```bash
docker compose -f docker-compose.dev.yml up -d --build
```

5. Importar la base de datos:
```bash
docker exec -i mysql-dev mysql -uapp -papp videojuegos < SQL/videojuegos.sql
```

6. Acceder a la aplicacion en `http://localhost:8080` (API PHP) y `http://localhost:5173` (Frontend React).

## Variables de Entorno

| Variable               | Descripcion                          | Valor por defecto         |
|------------------------|--------------------------------------|---------------------------|
| `DB_HOST`              | Host de MySQL                        | `mysql`                   |
| `DB_NAME`              | Nombre de la base de datos           | `videojuegos`             |
| `DB_USER`              | Usuario de MySQL                     | `app`                     |
| `DB_PASSWORD`          | Contrasena de MySQL                  | `app`                     |
| `DB_CHARSET`           | Charset de la conexion               | `utf8mb4`                 |
| `JWT_SECRET`           | Secreto para firmar JWT              | (requerido)               |
| `JWT_EXPIRY`           | Duracion del access token (seg)      | `900` (15 min)            |
| `REFRESH_EXPIRY`       | Duracion del refresh token (seg)     | `604800` (7 dias)         |
| `JWT_ISSUER`           | Emisor del JWT                       | `inventario-api`          |
| `APP_ENV`              | Entorno de la aplicacion             | `production`              |
| `APP_DEBUG`            | Modo debug                           | `false`                   |
| `APP_URL`              | URL base de la aplicacion            | `https://your-domain.com` |
| `MYSQL_ROOT_PASSWORD`  | Contrasena root de MySQL             | (requerido)               |

## Comandos Docker Compose

```bash
# Desarrollo (con API Python incluida)
docker compose -f docker-compose.dev.yml up -d --build

# Produccion (sin API Python)
docker compose -f docker-compose.prod.yml up -d --build

# Base (sin entorno especifico)
docker compose up -d

# Detener
docker compose -f docker-compose.dev.yml down

# Ver logs
docker compose -f docker-compose.dev.yml logs -f
```

### Puertos por defecto

| Servicio    | Puerto |
|-------------|--------|
| Nginx (API) | 8080   |
| Frontend    | 5173   |
| MySQL       | 3306   |
| phpMyAdmin  | 8081   |
| FastAPI     | 8000   |

## API REST (PHP)

### Autenticacion

| Endpoint                    | Metodo | Descripcion                        |
|-----------------------------|--------|------------------------------------|
| `/api/auth/register.php`    | POST   | Registrar usuario nuevo            |
| `/api/auth/login.php`       | POST   | Iniciar sesion                     |
| `/api/auth/refresh.php`     | POST   | Refrescar access token             |

**Registro - Request:**
```json
{
  "nombre": "Usuario",
  "email": "usuario@email.com",
  "password": "Contrasena1"
}
```

**Login - Response:**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJ...",
    "refresh_token": "abc123...",
    "token_type": "Bearer",
    "expires_in": 900,
    "user": {
      "id": 1,
      "nombre": "Usuario",
      "email": "usuario@email.com",
      "rol": "admin"
    }
  }
}
```

### Videojuegos

| Endpoint                          | Metodo | Auth     | Descripcion                    |
|-----------------------------------|--------|----------|--------------------------------|
| `/api/games/index.php`            | GET    | Requerido| Listar juegos (paginado)       |
| `/api/games/index.php?id={id}`    | GET    | Requerido| Detalle de un juego            |
| `/api/games/index.php?action=last`| GET    | Requerido| Ultimos 10 juegos              |
| `/api/games/index.php?plataforma_id={id}` | GET | Requerido | Juegos por plataforma |
| `/api/games/index.php?favorito=1` | GET    | Requerido| Juegos favoritos                |
| `/api/games/index.php`            | POST   | Admin    | Crear juego                    |
| `/api/games/index.php?id={id}`    | PUT    | Admin    | Actualizar juego               |
| `/api/games/index.php?id={id}`    | DELETE | Admin    | Eliminar juego                 |

### Consolas

| Endpoint                             | Metodo | Auth     | Descripcion                  |
|--------------------------------------|--------|----------|------------------------------|
| `/api/consolas/index.php`            | GET    | Requerido| Listar consolas (paginado)   |
| `/api/consolas/index.php?id={id}`    | GET    | Requerido| Detalle de consola           |
| `/api/consolas/index.php?action=last`| GET    | Requerido| Ultimas 10 consolas          |
| `/api/consolas/index.php`            | POST   | Admin    | Crear consola                |
| `/api/consolas/index.php?id={id}`    | PUT    | Admin    | Actualizar consola           |
| `/api/consolas/index.php?id={id}`    | DELETE | Admin    | Eliminar consola             |

### Amiibos y Figuras

| Endpoint                             | Metodo | Auth     | Descripcion                  |
|--------------------------------------|--------|----------|------------------------------|
| `/api/amiibos/index.php`             | GET    | Requerido| Listar amiibos (paginado)    |
| `/api/amiibos/index.php?id={id}`     | GET    | Requerido| Detalle de amiibo            |
| `/api/amiibos/index.php?action=last` | GET    | Requerido| Ultimos 10 amiibos           |
| `/api/amiibos/index.php`             | POST   | Admin    | Crear amiibo                 |
| `/api/amiibos/index.php?id={id}`     | PUT    | Admin    | Actualizar amiibo            |
| `/api/amiibos/index.php?id={id}`     | DELETE | Admin    | Eliminar amiibo              |

### Libros

| Endpoint                            | Metodo | Auth     | Descripcion                  |
|-------------------------------------|--------|----------|------------------------------|
| `/api/libros/index.php`             | GET    | Requerido| Listar libros (paginado)     |
| `/api/libros/index.php?id={id}`     | GET    | Requerido| Detalle de libro             |
| `/api/libros/index.php?action=last` | GET    | Requerido| Ultimos 10 libros            |
| `/api/libros/index.php`             | POST   | Admin    | Crear libro                  |
| `/api/libros/index.php?id={id}`     | PUT    | Admin    | Actualizar libro             |
| `/api/libros/index.php?id={id}`     | DELETE | Admin    | Eliminar libro               |

### Accesorios

| Endpoint                               | Metodo | Auth     | Descripcion                  |
|----------------------------------------|--------|----------|------------------------------|
| `/api/accesorios/index.php`            | GET    | Requerido| Listar accesorios (paginado) |
| `/api/accesorios/index.php?id={id}`    | GET    | Requerido| Detalle de accesorio         |
| `/api/accesorios/index.php?action=last`| GET    | Requerido| Ultimos 10 accesorios        |
| `/api/accesorios/index.php`            | POST   | Admin    | Crear accesorio              |
| `/api/accesorios/index.php?id={id}`    | PUT    | Admin    | Actualizar accesorio         |
| `/api/accesorios/index.php?id={id}`    | DELETE | Admin    | Eliminar accesorio           |

### Plataformas

| Endpoint                                  | Metodo | Auth     | Descripcion                  |
|-------------------------------------------|--------|----------|------------------------------|
| `/api/plataformas/index.php`              | GET    | Requerido| Listar plataformas           |
| `/api/plataformas/index.php?id={id}`      | GET    | Requerido| Detalle de plataforma        |
| `/api/plataformas/index.php?action=countPlataformas` | GET | Requerido | Plataformas con conteo de juegos |
| `/api/plataformas/index.php?action=last`  | GET    | Requerido| Ultimas 10 plataformas       |
| `/api/plataformas/index.php`              | POST   | Admin    | Crear plataforma             |
| `/api/plataformas/index.php?id={id}`      | PUT    | Admin    | Actualizar plataforma        |
| `/api/plataformas/index.php?id={id}`      | DELETE | Admin    | Eliminar plataforma          |

### Imagenes

| Endpoint                                 | Metodo | Auth     | Descripcion                  |
|------------------------------------------|--------|----------|------------------------------|
| `/api/imagenes/index.php?juego_id={id}&type={tipo}` | GET | Requerido | Obtener imagenes de un item |
| `/api/imagenes/index.php`                | POST   | Admin    | Subir imagenes (multipart/form-data) |
| `/api/imagenes/index.php?id={id}`        | DELETE | Admin    | Eliminar imagen (soft delete) |

**Tipos de imagen:** `0` = portada, `1` = contraportada, `2` = poster, `3` = logo

### Parametros de paginacion

| Parametro | Descripcion           | Default |
|-----------|-----------------------|---------|
| `page`    | Numero de pagina      | `1`     |
| `limit`   | Items por pagina      | `20`    |
| `search`  | Buscar por titulo     | (vacio) |

**Respuesta paginada:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### Autenticacion en requests

Enviar el header `Authorization` en cada request autenticado:
```
Authorization: Bearer <access_token>
```

## Frontend React

### Rutas principales

| Ruta                          | Descripcion           | Acceso    |
|-------------------------------|-----------------------|-----------|
| `/login`                      | Pagina de login       | Publico   |
| `/`                           | Dashboard/Home        | Autenticado |
| `/games/`                     | Listado de juegos     | Autenticado |
| `/games/nuevo/`               | Crear juego           | Admin     |
| `/games/detalle/:id/:id_imagen/` | Detalle de juego  | Autenticado |
| `/games/editar/:id/:id_imagen/`  | Editar juego      | Admin     |
| `/consolas/`                  | Listado de consolas   | Autenticado |
| `/consolas/add/`              | Crear consola         | Admin     |
| `/consolas/detalle/:id/:id_imagen/` | Detalle de consola | Autenticado |
| `/consolas/edit/:id/:id_imagen/`  | Editar consola    | Admin     |
| `/amiibos/`                   | Listado de amiibos    | Autenticado |
| `/amiibos/nuevo/`             | Crear amiibo          | Admin     |
| `/amiibos/detalle/:id/:id_imagen/` | Detalle de amiibo | Autenticado |
| `/amiibos/editar/:id/:id_imagen/`  | Editar amiibo     | Admin     |
| `/libros/`                    | Listado de libros     | Autenticado |
| `/libros/nuevo/`              | Crear libro           | Admin     |
| `/libros/detalle/:id/:id_imagen/` | Detalle de libro  | Autenticado |
| `/libros/editar/:id/:id_imagen/`  | Editar libro      | Admin     |
| `/accesorios/`                | Listado de accesorios | Autenticado |
| `/accesorios/nuevo/`          | Crear accesorio       | Admin     |
| `/accesorios/detalle/:id/:id_imagen/` | Detalle de accesorio | Autenticado |
| `/accesorios/editar/:id/:id_imagen/`  | Editar accesorio | Admin     |
| `/favoritos/`                 | Elementos favoritos   | Autenticado |
| `/recien-agregado/`           | Recien agregados      | Autenticado |
| `/plataformas/`               | Listado de plataformas| Autenticado |
| `/detalle-plataforma/:id/`    | Detalle de plataforma | Autenticado |

### Roles

| Rol      | Permisos                                        |
|----------|-------------------------------------------------|
| `admin`  | Lectura + Escritura (CRUD completo)              |
| `viewer` | Solo lectura                                     |

### Comandos del Frontend

```bash
cd app

# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Build de produccion
npm run build

# Lint
npm run lint
```

### Variables de entorno del Frontend

| Variable         | Descripcion                      | Default                        |
|------------------|----------------------------------|--------------------------------|
| `VITE_API_URL`   | URL base de la API PHP           | `http://localhost:8080/api`    |

## API Python (FastAPI)

Disponible solo en el entorno de desarrollo.

| Endpoint           | Metodo | Descripcion                |
|--------------------|--------|----------------------------|
| `GET /juegos`      | GET    | Listar todos los juegos    |

Documentacion interactiva: `http://localhost:8000/docs`

## Base de Datos

### Tablas principales

| Tabla         | Descripcion                              |
|---------------|------------------------------------------|
| `juegos`      | Videojuegos de la coleccion              |
| `consolas`    | Consolas de videojuegos                   |
| `amiibos`     | Amiibos y figuras coleccionables          |
| `libros`      | Libros de la coleccion                    |
| `accesorios`  | Accesorios para consolas                  |
| `plataformas` | Plataformas de videojuegos                |
| `imagenes`    | Imagenes asociadas a los items            |
| `usuarios`    | Usuarios del sistema                      |
| `refresh_tokens` | Tokens de refresco para autenticacion  |

### Relaciones

- `juegos.plataforma_id` -> `plataformas.id`
- `consolas.plataforma_id` -> `plataformas.id`
- `imagenes.juego_id` -> referencia al `id_imagen` de juegos/consolas/amiibos/libros/accesorios
- `refresh_tokens.user_id` -> `usuarios.id`

## Seguridad

- Autenticacion JWT con HMAC-SHA256
- Tokens de refresco con expiracion de 7 dias
- Rate limiting por IP (login: 5/min, registro: 3/hora, lectura: 100/min, escritura: 30/min)
- Sanitizacion de inputs (XSS, SQL injection)
- Headers de seguridad (X-Frame-Options, X-Content-Type-Options, Referrer-Policy)
- Proteccion de archivos `.env` via Nginx
- Validacion de tipo MIME en uploads
- Password hashing con bcrypt (cost 12)
- Soft delete en imagenes

## Licencia

Proyecto privado. Todos los derechos reservados.
