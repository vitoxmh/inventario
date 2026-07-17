<?php
require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../middleware/auth.php';

$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;
$action = $_GET['action'] ?? null;

switch ($method) {
    case 'GET':
        if ($id) {
            getAmiibo($id);
        } elseif ($action === 'last') {
            getLastAmiibos();
        } else {
            listAmiibos();
        }
        break;
    case 'POST':
        requireAdmin();
        createAmiibo();
        break;
    case 'PUT':
        requireAdmin();
        updateAmiibo($id);
        break;
    case 'DELETE':
        requireAdmin();
        deleteAmiibo($id);
        break;
    default:
        errorResponse('Method not allowed', 405);
}

function getAmiibo($id) {
    global $pdo;
    requireId($id, 'ID de amiibo requerido');
    
    $stmt = $pdo->prepare("SELECT * FROM amiibos WHERE id = ?");
    $stmt->execute([$id]);
    $amiibo = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$amiibo) {
        errorResponse('Amiibo no encontrado', 404);
    }
    successResponse($amiibo);
}

function getLastAmiibos() {
    global $pdo;
    $stmt = $pdo->query("SELECT 
        amiibos.id, 
        amiibos.titulo, 
        amiibos.id_imagen,
        amiibos.anio,
        amiibos.estado,
        amiibos.calificacion,
        amiibos.precio as valor,
        (SELECT archivo FROM imagenes WHERE tipo = '0' AND imagenes.juego_id = amiibos.id_imagen ORDER BY imagenes.id DESC LIMIT 1) AS portada
        FROM amiibos
        ORDER BY amiibos.created_at DESC
        LIMIT 10");
    successResponse($stmt->fetchAll(PDO::FETCH_ASSOC));
}

function listAmiibos() {
    global $pdo;
    
    extract(getPaginationParams());
    
    $countSql = "SELECT COUNT(*) as total FROM amiibos" . ($search ? " WHERE titulo LIKE :search" : "");
    
    $dataSql = "SELECT 
                amiibos.id, 
                amiibos.titulo, 
                amiibos.id_imagen,
                (SELECT archivo FROM imagenes WHERE tipo = '0' AND imagenes.juego_id = amiibos.id_imagen ORDER BY imagenes.id DESC LIMIT 1) AS iportada,
                (SELECT archivo FROM imagenes WHERE tipo = '1' AND imagenes.juego_id = amiibos.id_imagen ORDER BY imagenes.id DESC LIMIT 1) AS icontraportada,
                amiibos.anio,
                amiibos.estado,
                amiibos.calificacion,
                amiibos.precio as valor,
                (SELECT archivo FROM imagenes WHERE tipo = '0' AND imagenes.amiibo_id = amiibos.id_imagen ORDER BY imagenes.id DESC LIMIT 1) AS portada
                FROM amiibos" . ($search ? " WHERE amiibos.titulo LIKE :search" : "") . " 
                ORDER BY amiibos.created_at DESC 
                LIMIT :limit OFFSET :offset";
    
    $result = getPaginatedResponse($pdo, $countSql, $dataSql, [], $search, $limit, $offset);
    paginatedResponse($result['data'], $result['pagination']);
}

function createAmiibo() {
    global $pdo;
    
    $data = getJsonInput();
    validateRequired($data, 'titulo', 'Titulo es requerido');
    
    $id_imagen = generateIdImagen();
    
    $stmt = $pdo->prepare("INSERT INTO amiibos (id_imagen, titulo, anio, estado, calificacion, precio, comentario) 
                           VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        $id_imagen,
        $data['titulo'],
        $data['anio'] ?? null,
        $data['estado'] ?? null,
        $data['calificacion'] ?? null,
        $data['precio'] ?? null,
        $data['comentario'] ?? null
    ]);
    
    $id = $pdo->lastInsertId();
    successResponse(['id' => $id, 'id_imagen' => $id_imagen], 'Amiibo creado correctamente', 201);
}

function updateAmiibo($id) {
    global $pdo;
    
    requireId($id, 'ID requerido');
    $data = getJsonInput();
    validateRequired($data, 'titulo', 'Titulo es requerido');
    
    $stmt = $pdo->prepare("UPDATE amiibos SET titulo = ?, anio = ?, estado = ?, calificacion = ?, precio = ?, comentario = ? 
                           WHERE id = ?");
    $stmt->execute([
        $data['titulo'],
        $data['anio'] ?? null,
        $data['estado'] ?? null,
        $data['calificacion'] ?? null,
        $data['precio'] ?? null,
        $data['comentario'] ?? null,
        $id
    ]);
    
    successResponse(null, 'Amiibo actualizado correctamente');
}

function deleteAmiibo($id) {
    global $pdo;
    
    requireId($id, 'ID requerido');
    
    $stmt = $pdo->prepare("DELETE FROM amiibos WHERE id = ?");
    $stmt->execute([$id]);
    successResponse(null, 'Amiibo eliminado correctamente');
}
