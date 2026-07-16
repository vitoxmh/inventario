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
        jsonResponse(['error' => 'Method not allowed'], 405);
}

function getAccesorio($id) {
    global $pdo;
    requireId($id, 'ID de accesorio requerido');
    
    $stmt = $pdo->prepare("SELECT *,(SELECT nombre FROM plataformas WHERE id = accesorios.plataforma) as nombrePlataforma  FROM accesorios WHERE id = ?");
    $stmt->execute([$id]);
    $accesorio = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$accesorio) {
        jsonResponse(['error' => 'Accesorio no encontrado'], 404);
    }
    jsonResponse($accesorio);
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
    jsonResponse($stmt->fetchAll(PDO::FETCH_ASSOC));
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
    
    jsonResponse(getPaginatedResponse($pdo, $countSql, $dataSql, [], $search, $limit, $offset));
}

function createAccesorio() {
    global $pdo;
    
    $data = getJsonInput();
    validateRequired($data, 'nombre', 'Nombre es requerido');
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
    jsonResponse(['id' => $id, 'id_imagen' => $id_imagen, 'message' => 'Accesorio creado correctamente'], 201);
}

function updateAccesorio($id) {
    global $pdo;
    
    requireId($id, 'ID requerido');
    $data = getJsonInput();
    validateRequired($data, 'nombre', 'Nombre es requerido');
    
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
    
    jsonResponse(['message' => 'Accesorio actualizado correctamente']);
}

function deleteAccesorio($id) {
    global $pdo;
    
    requireId($id, 'ID requerido');
    
    $stmt = $pdo->prepare("DELETE FROM accesorios WHERE id = ?");
    $stmt->execute([$id]);
    jsonResponse(['message' => 'Accesorio eliminado correctamente']);
}
