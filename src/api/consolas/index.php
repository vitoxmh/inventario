<?php
require_once __DIR__ . '/../helpers.php';

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
        createConsola();
        break;
    case 'PUT':
        updateConsola($id);
        break;
    case 'DELETE':
        deleteConsola($id);
        break;
    default:
        jsonResponse(['error' => 'Method not allowed'], 405);
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
        jsonResponse(['error' => 'Consola no encontrada'], 404);
    }
    jsonResponse($consola);
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
    jsonResponse($stmt->fetchAll(PDO::FETCH_ASSOC));
}

function listConsolas() {
    global $pdo;
    
    extract(getPaginationParams());
    
    $estado = $_GET['estado'] ?? null;
    $valor_min = $_GET['valor_min'] ?? null;
    $valor_max = $_GET['valor_max'] ?? null;
    $orden = $_GET['orden'] ?? 'created_at_desc';
    
    $where = ["consolas.plataforma_id = plataformas.id"];
    $params = [];
    
    if ($search) {
        $where[] = "consolas.nombre LIKE :search";
    }
    if ($estado) {
        $where[] = "consolas.estado = :estado";
        $params[':estado'] = $estado;
    }
    if ($valor_min !== null && $valor_min !== '') {
        $where[] = "consolas.valor >= :valor_min";
        $params[':valor_min'] = $valor_min;
    }
    if ($valor_max !== null && $valor_max !== '') {
        $where[] = "consolas.valor <= :valor_max";
        $params[':valor_max'] = $valor_max;
    }
    
    $whereClause = "WHERE " . implode(" AND ", $where);
    
    $orderClause = match($orden) {
        'nombre_asc' => 'ORDER BY consolas.nombre ASC',
        'nombre_desc' => 'ORDER BY consolas.nombre DESC',
        'valor_asc' => 'ORDER BY consolas.valor ASC',
        'valor_desc' => 'ORDER BY consolas.valor DESC',
        default => 'ORDER BY consolas.created_at DESC'
    };
    
    $countSql = "SELECT COUNT(*) as total FROM consolas, plataformas $whereClause";
    $dataSql = "SELECT consolas.id, 
                        consolas.plataforma_id, 
                        consolas.id_imagen,
                        consolas.nombre,
                        consolas.caja,
                        consolas.manuales,
                        consolas.carton,
                        consolas.valor,
                        (SELECT archivo FROM imagenes WHERE juego_id = consolas.id_imagen ORDER BY created_at DESC LIMIT 1) AS archivo,
                        plataformas.nombre AS plataforma
                FROM consolas, plataformas 
                $whereClause 
                $orderClause 
                LIMIT :limit OFFSET :offset";
    
    jsonResponse(getPaginatedResponse($pdo, $countSql, $dataSql, $params, $search, $limit, $offset));
}

function createConsola() {
    global $pdo;
    
    $data = getJsonInput();
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
    
    jsonResponse(["message" => "Consola creada", "id" => $id_imagen], 201);
}

function updateConsola($id) {
    global $pdo;
    
    requireId($id, 'ID de consola requerido');
    $data = getJsonInput();
    
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
    
    jsonResponse(["message" => "Consola actualizada"]);
}

function deleteConsola($id) {
    global $pdo;
    
    requireId($id, 'ID de consola requerido');
    
    $stmt = $pdo->prepare("DELETE FROM consolas WHERE id = ?");
    $stmt->execute([$id]);
    jsonResponse(["message" => "Consola eliminada"]);
}
