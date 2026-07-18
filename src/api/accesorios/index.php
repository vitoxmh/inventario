<?php
require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../middleware/auth.php';

$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;
$action = $_GET['action'] ?? null;

switch ($method) {
    case 'GET':
        if ($id) {
            getAccesorio($id);
        } elseif ($action === 'last') {
            getLastAccesorios();
        } else {
            listAccesorios();
        }
        break;
    case 'POST':
        requireAdmin();
        createAccesorio();
        break;
    case 'PUT':
        requireAdmin();
        updateAccesorio($id);
        break;
    case 'DELETE':
        requireAdmin();
        deleteAccesorio($id);
        break;
    default:
        errorResponse('Method not allowed', 405);
}

function getAccesorio($id) {
    global $pdo;
    requireId($id, 'ID de accesorio requerido');
    
    $stmt = $pdo->prepare("SELECT *,(SELECT nombre FROM plataformas WHERE id = accesorios.plataforma) as nombrePlataforma  FROM accesorios WHERE id = ?");
    $stmt->execute([$id]);
    $accesorio = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$accesorio) {
        errorResponse('Accesorio no encontrado', 404);
    }
    successResponse($accesorio);
}

function getLastAccesorios() {
    global $pdo;
    $stmt = $pdo->query("SELECT 
        accesorios.id, 
        accesorios.nombre, 
        accesorios.id_imagen,
        accesorios.tipo,
        accesorios.plataforma,
        accesorios.anio,
        accesorios.estado,
        accesorios.precio as valor,
        (SELECT archivo FROM imagenes WHERE tipo = '0' AND imagenes.juego_id = accesorios.id_imagen ORDER BY imagenes.id DESC LIMIT 1) AS portada
        FROM accesorios
        ORDER BY accesorios.created_at DESC
        LIMIT 10");
    successResponse($stmt->fetchAll(PDO::FETCH_ASSOC));
}

function listAccesorios() {
    global $pdo;
    
    extract(getPaginationParams());
    
    $countSql = "SELECT COUNT(*) as total FROM accesorios" . ($search ? " WHERE nombre LIKE :search" : "");
    
    $dataSql = "SELECT 
                accesorios.id, 
                accesorios.nombre, 
                accesorios.id_imagen,
                accesorios.tipo,
                accesorios.plataforma,
                accesorios.anio,
                accesorios.estado,
                accesorios.precio as valor,
                (SELECT archivo FROM imagenes WHERE tipo = '0' AND imagenes.juego_id = accesorios.id_imagen ORDER BY imagenes.id DESC LIMIT 1) AS portada,
                (SELECT archivo FROM imagenes WHERE tipo = '1' AND imagenes.juego_id = accesorios.id_imagen ORDER BY imagenes.id DESC LIMIT 1) AS fondo    
                FROM accesorios" . ($search ? " WHERE accesorios.nombre LIKE :search" : "") . " 
                ORDER BY accesorios.created_at DESC 
                LIMIT :limit OFFSET :offset";
    
    $result = getPaginatedResponse($pdo, $countSql, $dataSql, [], $search, $limit, $offset);
    paginatedResponse($result['data'], $result['pagination']);
}

function createAccesorio() {
    global $pdo;
    
    $data = getJsonInput();
    validateRequired($data, 'nombre', 'El nombre es requerido');
    validateMaxLength($data, 'nombre', 255, 'El nombre no puede exceder 255 caracteres');
    validateMaxLength($data, 'tipo', 100, 'El tipo no puede exceder 100 caracteres');
    validateMaxLength($data, 'comentario', 1000, 'El comentario no puede exceder 1000 caracteres');
    validateNumeric($data, 'plataforma', 'La plataforma debe ser un número válido');
    validateNumeric($data, 'anio', 'El año debe ser numérico');
    if (isset($data['anio']) && $data['anio'] !== '' && $data['anio'] !== null) validateRange($data, 'anio', 1900, 2099, 'El año debe estar entre 1900 y 2099');
    validateNumeric($data, 'precio', 'El precio debe ser numérico');
    validateRange($data, 'precio', 0, 999999999, 'El precio no es válido');
    
    $id_imagen = generateIdImagen();
    
    $stmt = $pdo->prepare("INSERT INTO accesorios (id_imagen, nombre, tipo, plataforma, anio, estado, precio, comentario) 
                           VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        $id_imagen,
        $data['nombre'],
        $data['tipo'] ?? null,
        $data['plataforma'] ?? null,
        $data['anio'] ?? null,
        $data['estado'] ?? null,
        $data['precio'] ?? null,
        $data['comentario'] ?? null
    ]);
    
    $id = $pdo->lastInsertId();
    successResponse(['id' => $id, 'id_imagen' => $id_imagen], 'Accesorio creado correctamente', 201);
}

function updateAccesorio($id) {
    global $pdo;
    
    requireId($id, 'ID requerido');
    $data = getJsonInput();
    validateRequired($data, 'nombre', 'El nombre es requerido');
    validateMaxLength($data, 'nombre', 255, 'El nombre no puede exceder 255 caracteres');
    validateMaxLength($data, 'tipo', 100, 'El tipo no puede exceder 100 caracteres');
    validateMaxLength($data, 'comentario', 1000, 'El comentario no puede exceder 1000 caracteres');
    validateNumeric($data, 'plataforma', 'La plataforma debe ser un número válido');
    if (isset($data['anio']) && $data['anio'] !== '' && $data['anio'] !== null) {
        validateNumeric($data, 'anio', 'El año debe ser numérico');
        validateRange($data, 'anio', 1900, 2099, 'El año debe estar entre 1900 y 2099');
    }
    validateNumeric($data, 'precio', 'El precio debe ser numérico');
    
    $stmt = $pdo->prepare("UPDATE accesorios SET nombre = ?, tipo = ?, plataforma = ?, anio = ?, estado = ?, precio = ?, comentario = ? 
                           WHERE id = ?");
    $stmt->execute([
        $data['nombre'],
        $data['tipo'] ?? null,
        $data['plataforma'] ?? null,
        $data['anio'] ?? null,
        $data['estado'] ?? null,
        $data['precio'] ?? null,
        $data['comentario'] ?? null,
        $id
    ]);
    
    successResponse(null, 'Accesorio actualizado correctamente');
}

function deleteAccesorio($id) {
    global $pdo;
    
    requireId($id, 'ID requerido');
    
    $stmt = $pdo->prepare("DELETE FROM accesorios WHERE id = ?");
    $stmt->execute([$id]);
    successResponse(null, 'Accesorio eliminado correctamente');
}
