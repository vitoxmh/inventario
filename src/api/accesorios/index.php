<?php
require_once __DIR__ . '/../helpers.php';

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
        createAccesorio();
        break;
    case 'PUT':
        updateAccesorio($id);
        break;
    case 'DELETE':
        deleteAccesorio($id);
        break;
    default:
        jsonResponse(['error' => 'Method not allowed'], 405);
}

function getAccesorio($id) {
    global $pdo;
    requireId($id, 'ID de accesorio requerido');
    
    $stmt = $pdo->prepare("SELECT * FROM accesorios WHERE id = ?");
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
    
    $estado = $_GET['estado'] ?? null;
    $valor_min = $_GET['valor_min'] ?? null;
    $valor_max = $_GET['valor_max'] ?? null;
    $tipo = $_GET['tipo'] ?? null;
    $orden = $_GET['orden'] ?? 'created_at_desc';
    
    $where = [];
    $params = [];
    
    if ($search) {
        $where[] = "accesorios.nombre LIKE :search";
    }
    if ($estado) {
        $where[] = "accesorios.estado = :estado";
        $params[':estado'] = $estado;
    }
    if ($valor_min !== null && $valor_min !== '') {
        $where[] = "accesorios.precio >= :valor_min";
        $params[':valor_min'] = $valor_min;
    }
    if ($valor_max !== null && $valor_max !== '') {
        $where[] = "accesorios.precio <= :valor_max";
        $params[':valor_max'] = $valor_max;
    }
    if ($tipo) {
        $where[] = "accesorios.tipo = :tipo";
        $params[':tipo'] = $tipo;
    }
    
    $whereClause = $where ? "WHERE " . implode(" AND ", $where) : "";
    
    $orderClause = match($orden) {
        'nombre_asc' => 'ORDER BY accesorios.nombre ASC',
        'nombre_desc' => 'ORDER BY accesorios.nombre DESC',
        'valor_asc' => 'ORDER BY accesorios.precio ASC',
        'valor_desc' => 'ORDER BY accesorios.precio DESC',
        default => 'ORDER BY accesorios.created_at DESC'
    };
    
    $countSql = "SELECT COUNT(*) as total FROM accesorios $whereClause";
    
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
                FROM accesorios $whereClause 
                $orderClause 
                LIMIT :limit OFFSET :offset";
    
    jsonResponse(getPaginatedResponse($pdo, $countSql, $dataSql, $params, $search, $limit, $offset));
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
