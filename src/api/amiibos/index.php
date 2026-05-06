<?php
require_once __DIR__ . '/../helpers.php';

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
        createAmiibo();
        break;
    case 'PUT':
        updateAmiibo($id);
        break;
    case 'DELETE':
        deleteAmiibo($id);
        break;
    default:
        jsonResponse(['error' => 'Method not allowed'], 405);
}

function getAmiibo($id) {
    global $pdo;
    requireId($id, 'ID de amiibo requerido');
    
    $stmt = $pdo->prepare("SELECT * FROM amiibos WHERE id = ?");
    $stmt->execute([$id]);
    $amiibo = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$amiibo) {
        jsonResponse(['error' => 'Amiibo no encontrado'], 404);
    }
    jsonResponse($amiibo);
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
    jsonResponse($stmt->fetchAll(PDO::FETCH_ASSOC));
}

function listAmiibos() {
    global $pdo;
    
    extract(getPaginationParams());
    
    $estado = $_GET['estado'] ?? null;
    $valor_min = $_GET['valor_min'] ?? null;
    $valor_max = $_GET['valor_max'] ?? null;
    $anio = $_GET['anio'] ?? null;
    $orden = $_GET['orden'] ?? 'created_at_desc';
    
    $where = [];
    $params = [];
    
    if ($search) {
        $where[] = "amiibos.titulo LIKE :search";
    }
    if ($estado) {
        $where[] = "amiibos.estado = :estado";
        $params[':estado'] = $estado;
    }
    if ($valor_min !== null && $valor_min !== '') {
        $where[] = "amiibos.precio >= :valor_min";
        $params[':valor_min'] = $valor_min;
    }
    if ($valor_max !== null && $valor_max !== '') {
        $where[] = "amiibos.precio <= :valor_max";
        $params[':valor_max'] = $valor_max;
    }
    if ($anio) {
        $where[] = "amiibos.anio = :anio";
        $params[':anio'] = $anio;
    }
    
    $whereClause = $where ? "WHERE " . implode(" AND ", $where) : "";
    
    $orderClause = match($orden) {
        'titulo_asc' => 'ORDER BY amiibos.titulo ASC',
        'titulo_desc' => 'ORDER BY amiibos.titulo DESC',
        'valor_asc' => 'ORDER BY amiibos.precio ASC',
        'valor_desc' => 'ORDER BY amiibos.precio DESC',
        'anio_desc' => 'ORDER BY amiibos.anio DESC',
        'calificacion_desc' => 'ORDER BY amiibos.calificacion DESC',
        default => 'ORDER BY amiibos.created_at DESC'
    };
    
    $countSql = "SELECT COUNT(*) as total FROM amiibos $whereClause";
    
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
                FROM amiibos $whereClause 
                $orderClause 
                LIMIT :limit OFFSET :offset";
    
    jsonResponse(getPaginatedResponse($pdo, $countSql, $dataSql, $params, $search, $limit, $offset));
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
    jsonResponse(['id' => $id, 'id_imagen' => $id_imagen, 'message' => 'Amiibo creado correctamente'], 201);
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
    
    jsonResponse(['message' => 'Amiibo actualizado correctamente']);
}

function deleteAmiibo($id) {
    global $pdo;
    
    requireId($id, 'ID requerido');
    
    $stmt = $pdo->prepare("DELETE FROM amiibos WHERE id = ?");
    $stmt->execute([$id]);
    jsonResponse(['message' => 'Amiibo eliminado correctamente']);
}
