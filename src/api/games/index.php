<?php
require_once __DIR__ . '/../helpers.php';

$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;
$action = $_GET['action'] ?? null;
$id_plataforma = $_GET['plataforma_id'] ?? null;

switch ($method) {
    case 'GET':
        if ($id) {
            getGame($id);
        } elseif ($action === 'last') {
            getLastGames();
        } elseif ($action === 'all-plataforma') {
            getGamesByPlatform($id_plataforma);
        } else {
            listGames();
        }
        break;
    case 'POST':
        createGame();
        break;
    case 'PUT':
        updateGame($id);
        break;
    case 'DELETE':
        deleteGame($id);
        break;
    default:
        jsonResponse(['error' => 'Method not allowed'], 405);
}

function getGame($id) {
    global $pdo;
    requireId($id, 'ID de juego requerido');
    
    $stmt = $pdo->prepare("SELECT 
        juegos.titulo, 
        juegos.region,
        juegos.formato,
        juegos.estado,
        juegos.valor,
        juegos.fecha_compra,
        juegos.notas,
        juegos.cartucho,
        juegos.manual,
        juegos.caja,
        juegos.desarrollador,
        juegos.genero,
        juegos.publicador,
        juegos.lanzamiento, 
        juegos.plataforma_id,
        juegos.comentario,
        juegos.puntuacion,
        plataformas.nombre as plataforma,
        juegos.id as id_juego, 
        juegos.id_imagen as id_imagen_games,
        (SELECT archivo FROM imagenes WHERE tipo = '0' AND imagenes.juego_id = juegos.id_imagen ORDER BY imagenes.id DESC LIMIT 1) AS portada,
        (SELECT archivo FROM imagenes WHERE tipo = '1' AND imagenes.juego_id = juegos.id_imagen ORDER BY imagenes.id DESC LIMIT 1) AS contraportada,
        (SELECT archivo FROM imagenes WHERE tipo = '2' AND imagenes.juego_id = juegos.id_imagen ORDER BY imagenes.id DESC LIMIT 1) AS poster,
        (SELECT archivo FROM imagenes WHERE tipo = '3' AND imagenes.juego_id = juegos.id_imagen ORDER BY imagenes.id DESC LIMIT 1) AS logo  
        FROM juegos, plataformas
        WHERE juegos.plataforma_id = plataformas.id 
        AND juegos.id = ?");
    $stmt->execute([$id]);
    $game = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$game) {
        jsonResponse(['error' => 'Juego no encontrado'], 404);
    }
    jsonResponse($game);
}

function getLastGames() {
    global $pdo;
    $stmt = $pdo->query("SELECT 
        juegos.id,
        juegos.titulo,
        juegos.id_imagen,
        juegos.valor,
        juegos.region,
        juegos.lanzamiento,
        juegos.estado,
        juegos.region,
        plataformas.nombre AS plataforma,
        (SELECT archivo FROM imagenes WHERE tipo = '0' AND imagenes.juego_id = juegos.id_imagen ORDER BY imagenes.id DESC LIMIT 1) AS archivo
        FROM juegos, plataformas
        WHERE juegos.plataforma_id = plataformas.id
        ORDER BY juegos.created_at DESC
        LIMIT 10");
    jsonResponse($stmt->fetchAll(PDO::FETCH_ASSOC));
}

function getGamesByPlatform($id_plataforma) {
    global $pdo;
    
    $params = ['id_plataforma' => $id_plataforma];
    extract(getPaginationParams());
    
    $countSql = "SELECT COUNT(*) as total FROM juegos, plataformas 
                 WHERE juegos.plataforma_id = plataformas.id 
                 AND juegos.plataforma_id = :id_plataforma" . 
                 ($search ? " AND juegos.titulo LIKE :search" : "");
    
    $dataSql = "SELECT juegos.id, 
                        juegos.titulo, 
                        juegos.id_imagen, 
                        juegos.valor, 
                        juegos.region, 
                        juegos.lanzamiento, 
                        juegos.estado, 
                        juegos.region,
                        plataformas.nombre AS plataforma, 
                        (SELECT archivo FROM imagenes WHERE tipo = '0' AND imagenes.juego_id = juegos.id_imagen ORDER BY imagenes.id DESC LIMIT 1) AS archivo 
                FROM juegos, plataformas 
                WHERE juegos.plataforma_id = plataformas.id 
                AND juegos.plataforma_id = :id_plataforma" . 
                ($search ? " AND juegos.titulo LIKE :search" : "") . " 
                ORDER BY juegos.created_at DESC 
                LIMIT :limit OFFSET :offset";
    
    jsonResponse(getPaginatedResponse($pdo, $countSql, $dataSql, $params, $search, $limit, $offset));
}

function listGames() {
    global $pdo;
    
    extract(getPaginationParams());
    
    $plataforma_id = $_GET['plataforma_id'] ?? null;
    $estado = $_GET['estado'] ?? null;
    $valor_min = $_GET['valor_min'] ?? null;
    $valor_max = $_GET['valor_max'] ?? null;
    $fecha_inicio = $_GET['fecha_inicio'] ?? null;
    $fecha_fin = $_GET['fecha_fin'] ?? null;
    $orden = $_GET['orden'] ?? 'created_at_desc';
    
    $where = ["juegos.plataforma_id = plataformas.id"];
    $params = [];
    
    if ($search) {
        $where[] = "juegos.titulo LIKE :search";
    }
    if ($plataforma_id) {
        $where[] = "juegos.plataforma_id = :plataforma_id";
        $params[':plataforma_id'] = $plataforma_id;
    }
    if ($estado) {
        $where[] = "juegos.estado = :estado";
        $params[':estado'] = $estado;
    }
    if ($valor_min !== null && $valor_min !== '') {
        $where[] = "juegos.valor >= :valor_min";
        $params[':valor_min'] = $valor_min;
    }
    if ($valor_max !== null && $valor_max !== '') {
        $where[] = "juegos.valor <= :valor_max";
        $params[':valor_max'] = $valor_max;
    }
    if ($fecha_inicio) {
        $where[] = "juegos.fecha_compra >= :fecha_inicio";
        $params[':fecha_inicio'] = $fecha_inicio;
    }
    if ($fecha_fin) {
        $where[] = "juegos.fecha_compra <= :fecha_fin";
        $params[':fecha_fin'] = $fecha_fin;
    }
    
    $whereClause = "WHERE " . implode(" AND ", $where);
    
    $orderClause = match($orden) {
        'titulo_asc' => 'ORDER BY juegos.titulo ASC',
        'titulo_desc' => 'ORDER BY juegos.titulo DESC',
        'valor_asc' => 'ORDER BY juegos.valor ASC',
        'valor_desc' => 'ORDER BY juegos.valor DESC',
        'fecha_compra_desc' => 'ORDER BY juegos.fecha_compra DESC',
        'puntuacion_desc' => 'ORDER BY juegos.puntuacion DESC',
        default => 'ORDER BY juegos.created_at DESC'
    };
    
    $countSql = "SELECT COUNT(*) as total FROM juegos, plataformas $whereClause";
    $dataSql = "SELECT juegos.id, 
                        juegos.titulo, 
                        juegos.id_imagen, 
                        juegos.valor, 
                        juegos.region,
                        (SELECT archivo FROM imagenes WHERE tipo = '0' AND imagenes.juego_id = juegos.id_imagen ORDER BY imagenes.id DESC LIMIT 1) AS portada, 
                        plataformas.nombre as plataforma 
                FROM juegos, plataformas 
                $whereClause 
                $orderClause 
                LIMIT :limit OFFSET :offset";
    
    jsonResponse(getPaginatedResponse($pdo, $countSql, $dataSql, $params, $search, $limit, $offset));
}

function createGame() {
    global $pdo;
    
    $data = getJsonInput();
    $id_imagen = generateIdImagen();
    
    $stmt = $pdo->prepare("INSERT INTO juegos 
        (titulo, plataforma_id, id_imagen, region, formato, estado, valor, fecha_compra, notas, cartucho, manual, caja, lanzamiento, desarrollador, genero, publicador, comentario, puntuacion) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    
    $stmt->execute([
        $data['titulo'] ?? null,
        $data['plataforma_id'] ?? null,
        $id_imagen,
        $data['region'] ?? null,
        $data['formato'] ?? null,
        $data['estado'] ?? null,
        $data['valor'] ?? null,
        $data['fecha_compra'] ?? null,
        $data['notas'] ?? null,
        $data['cartucho'] ?? null,
        $data['manual'] ?? null,
        $data['caja'] ?? null,
        $data['lanzamiento'] ?? null,
        $data['desarrollador'] ?? null,
        $data['genero'] ?? null,
        $data['publicador'] ?? null,
        $data['comentario'] ?? null,
        $data['puntuacion'] ?? null
    ]);
    
    jsonResponse(["message" => "Juego creado", "id" => $id_imagen], 201);
}

function updateGame($id) {
    global $pdo;
    
    requireId($id, 'ID de juego requerido');
    $data = getJsonInput();
    
    $stmt = $pdo->prepare("UPDATE juegos SET 
        titulo = ?, plataforma_id = ?, region = ?, formato = ?, estado = ?, valor = ?, cartucho = ?, manual = ?, caja = ?, lanzamiento = ?, desarrollador = ?, genero = ?, publicador = ?, comentario = ?, puntuacion = ? 
        WHERE id = ?");
    
    $stmt->execute([
        $data['titulo'] ?? null,
        $data['plataforma_id'] ?? null,
        $data['region'] ?? null,
        $data['formato'] ?? null,
        $data['estado'] ?? null,
        $data['valor'] ?? null,
        $data['cartucho'] ?? null,
        $data['manual'] ?? null,
        $data['caja'] ?? null,
        $data['lanzamiento'] ?? null,
        $data['desarrollador'] ?? null,
        $data['genero'] ?? null,
        $data['publicador'] ?? null,
        $data['comentario'] ?? null,
        $data['puntuacion'] ?? null,
        $id
    ]);
    
    jsonResponse(["message" => "Juego actualizado"]);
}

function deleteGame($id) {
    global $pdo;
    
    requireId($id, 'ID de juego requerido');
    
    $stmt = $pdo->prepare("DELETE FROM juegos WHERE id = ?");
    $stmt->execute([$id]);
    jsonResponse(["message" => "Juego eliminado"]);
}
