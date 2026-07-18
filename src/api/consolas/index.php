<?php
require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../middleware/auth.php';

$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;
$action = $_GET['action'] ?? null;

switch ($method) {
    case 'GET':
        if ($id) {
            getConsola($id);
        } elseif ($action === 'last') {
            getLastConsolas();
        } else {
            listConsolas();
        }
        break;
    case 'POST':
        requireAdmin();
        createConsola();
        break;
    case 'PUT':
        requireAdmin();
        updateConsola($id);
        break;
    case 'DELETE':
        requireAdmin();
        deleteConsola($id);
        break;
    default:
        errorResponse('Method not allowed', 405);
}

function getConsola($id) {
    global $pdo;
    requireId($id, 'ID de consola requerido');
    
    $stmt = $pdo->prepare("SELECT 
        consolas.id, 
        consolas.plataforma_id, 
        consolas.id_imagen,
        consolas.nombre,
        consolas.caja,
        consolas.manuales,
        consolas.carton,
        consolas.valor,
        consolas.comentario,
        consolas.otro,
        consolas.type,
        consolas.estado,
        plataformas.fabricante,
        (SELECT archivo FROM imagenes WHERE tipo = '0' AND imagenes.juego_id = consolas.id_imagen ORDER BY imagenes.id DESC LIMIT 1) AS portada,
        (SELECT archivo FROM imagenes WHERE tipo = '1' AND imagenes.juego_id = consolas.id_imagen ORDER BY imagenes.id DESC LIMIT 1) AS contraportada, 
        plataformas.nombre AS plataforma
        FROM consolas, plataformas 
        WHERE consolas.plataforma_id = plataformas.id AND consolas.id = ?");
    $stmt->execute([$id]);
    $consola = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$consola) {
        errorResponse('Consola no encontrada', 404);
    }
    successResponse($consola);
}

function getLastConsolas() {
    global $pdo;
    $stmt = $pdo->query("SELECT 
        c.id, 
        c.plataforma_id, 
        c.id_imagen,
        c.nombre,
        c.caja,
        c.manuales,
        c.carton,
        c.valor,
        c.estado,
        p.nombre AS plataforma,
        (SELECT archivo FROM imagenes WHERE tipo = '0' AND imagenes.juego_id = c.id_imagen ORDER BY imagenes.id DESC LIMIT 1) AS archivo
        FROM consolas c
        JOIN plataformas p ON c.plataforma_id = p.id
        ORDER BY c.created_at DESC
        LIMIT 10");
    successResponse($stmt->fetchAll(PDO::FETCH_ASSOC));
}

function listConsolas() {
    global $pdo;
    
    extract(getPaginationParams());
    
    $countSql = "SELECT COUNT(*) as total FROM consolas, plataformas 
                 WHERE consolas.plataforma_id = plataformas.id" . 
                 ($search ? " AND consolas.nombre LIKE :search" : "");
    
    $dataSql = "SELECT consolas.id, 
                        consolas.plataforma_id, 
                        consolas.id_imagen,
                        consolas.nombre,
                        consolas.caja,
                        consolas.manuales,
                        consolas.carton,
                        consolas.valor,
                        (SELECT archivo FROM imagenes WHERE juego_id = consolas.id_imagen and tipo = 0 ORDER BY created_at DESC LIMIT 1) AS portada,
                        plataformas.nombre AS plataforma
                FROM consolas, plataformas 
                WHERE consolas.plataforma_id = plataformas.id" . 
                ($search ? " AND consolas.nombre LIKE :search" : "") . " 
                ORDER BY consolas.created_at DESC 
                LIMIT :limit OFFSET :offset";
    
    $result = getPaginatedResponse($pdo, $countSql, $dataSql, [], $search, $limit, $offset);
    paginatedResponse($result['data'], $result['pagination']);
}

function createConsola() {
    global $pdo;
    
    $data = getJsonInput();
    validateRequired($data, 'nombre', 'El nombre es requerido');
    validateRequired($data, 'plataforma_id', 'La plataforma es requerida');
    validateMaxLength($data, 'nombre', 255, 'El nombre no puede exceder 255 caracteres');
    validateMaxLength($data, 'comentario', 1000, 'El comentario no puede exceder 1000 caracteres');
    validateMaxLength($data, 'otro', 1000, 'El campo otro no puede exceder 1000 caracteres');
    validateNumeric($data, 'plataforma_id', 'La plataforma debe ser un número válido');
    validateNumeric($data, 'valor', 'El valor debe ser numérico');
    validateRange($data, 'valor', 0, 999999999, 'El valor no es válido');
    
    $id_imagen = generateIdImagen();
    
    $stmt = $pdo->prepare("INSERT INTO consolas 
        (plataforma_id, id_imagen, nombre, caja, manuales, carton, valor, comentario, otro, estado) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    
    $stmt->execute([
        $data['plataforma_id'] ?? null,
        $id_imagen,
        $data['nombre'] ?? null,
        ($data['caja'] === "" ? 0 : ($data['caja'] ?? 0)),
        ($data['manuales'] === "" ? 0 : ($data['manuales'] ?? 0)),
        ($data['carton'] === "" ? 0 : ($data['carton'] ?? 0)),
        $data['valor'] ?? null,
        $data['comentario'] ?? null,
        $data['otro'] ?? null,
        $data['estado'] ?? null
    ]);
    
    successResponse(['id' => $id_imagen], 'Consola creada', 201);
}

function updateConsola($id) {
    global $pdo;
    
    requireId($id, 'ID de consola requerido');
    $data = getJsonInput();
    
    if (isset($data['nombre'])) validateRequired($data, 'nombre', 'El nombre es requerido');
    if (isset($data['nombre'])) validateMaxLength($data, 'nombre', 255, 'El nombre no puede exceder 255 caracteres');
    if (isset($data['comentario'])) validateMaxLength($data, 'comentario', 1000, 'El comentario no puede exceder 1000 caracteres');
    if (isset($data['otro'])) validateMaxLength($data, 'otro', 1000, 'El campo otro no puede exceder 1000 caracteres');
    if (isset($data['plataforma_id']) && $data['plataforma_id'] !== '') validateNumeric($data, 'plataforma_id', 'La plataforma debe ser un número válido');
    if (isset($data['valor']) && $data['valor'] !== '') validateNumeric($data, 'valor', 'El valor debe ser numérico');
    
    $stmt = $pdo->prepare("UPDATE consolas SET 
        plataforma_id = ?, nombre = ?, caja = ?, manuales = ?, carton = ?, valor = ?, comentario = ?, otro = ?, estado = ?, type = ? 
        WHERE id = ?");
    
    $stmt->execute([
        $data['plataforma_id'] ?? null,
        $data['nombre'] ?? null,
        ($data['caja'] === "" ? 0 : ($data['caja'] ?? 0)),
        ($data['manuales'] === "" ? 0 : ($data['manuales'] ?? 0)),
        ($data['carton'] === "" ? 0 : ($data['carton'] ?? 0)),
        $data['valor'] ?? null,
        $data['comentario'] ?? null,
        $data['otro'] ?? null,
        $data['estado'] ?? null,
        $data['type'] ?? null,
        $id
    ]);
    
    successResponse(null, 'Consola actualizada');
}

function deleteConsola($id) {
    global $pdo;
    
    requireId($id, 'ID de consola requerido');
    
    $stmt = $pdo->prepare("DELETE FROM consolas WHERE id = ?");
    $stmt->execute([$id]);
    successResponse(null, 'Consola eliminada');
}
