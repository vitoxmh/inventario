<?php
require_once __DIR__ . '/../helpers.php';

$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;
$action = $_GET['action'] ?? null;
$id_plataforma = $_GET['plataforma_id'] ?? null;
$favorito = $_GET['favorito'] ?? null;

switch ($method) {
    case 'GET':
        if ($id) {
            getGame($id);
        } elseif ($action === 'last') {
            getLastGames();
        } elseif ($action === 'all-plataforma') {
            getGamesByPlatform($id_plataforma);
        } else {
            listGames($favorito);
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
        juegos.favorito,
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
        juegos.favorito,
        plataformas.nombre AS plataforma,
        (SELECT archivo FROM imagenes WHERE tipo = '0' AND imagenes.juego_id = juegos.id_imagen ORDER BY imagenes.id DESC LIMIT 1) AS portada
        FROM juegos, plataformas
        WHERE juegos.plataforma_id = plataformas.id
        ORDER BY juegos.created_at DESC
        LIMIT 10");
    jsonResponse($stmt->fetchAll(PDO::FETCH_ASSOC));
}

function getGamesByPlatform($platformId) {
    global $pdo;
    
    $params = ['id_plataforma' => $platformId];
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
                        juegos.favorito,
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

function listGames($favorito = null) {
    global $pdo;
    
    extract(getPaginationParams());
    
    $favoritoFilter = "";
    if ($favorito == '1') {
        $favoritoFilter = " AND juegos.favorito = 1";
    }
    
    $countSql = "SELECT COUNT(*) as total FROM juegos, plataformas 
                 WHERE juegos.plataforma_id = plataformas.id" . 
                 ($search ? " AND juegos.titulo LIKE :search" : "") . 
                 $favoritoFilter;
    
    $dataSql = "SELECT juegos.id, 
                        juegos.titulo, 
                        juegos.id_imagen, 
                        juegos.valor, 
                        juegos.region,
                        juegos.favorito,
                        (SELECT archivo FROM imagenes WHERE tipo = '0' AND imagenes.juego_id = juegos.id_imagen ORDER BY imagenes.id DESC LIMIT 1) AS portada, 
                        plataformas.nombre as plataforma 
                FROM juegos, plataformas 
                WHERE juegos.plataforma_id = plataformas.id" . 
                ($search ? " AND juegos.titulo LIKE :search" : "") . 
                $favoritoFilter . " 
                ORDER BY juegos.created_at DESC 
                LIMIT :limit OFFSET :offset";
    
    jsonResponse(getPaginatedResponse($pdo, $countSql, $dataSql, [], $search, $limit, $offset));
}

function createGame() {
    global $pdo;
    
    $data = getJsonInput();
    $id_imagen = generateIdImagen();
    
    $stmt = $pdo->prepare("INSERT INTO juegos 
        (titulo, plataforma_id, id_imagen, region, formato, estado, valor, fecha_compra, notas, cartucho, manual, caja, lanzamiento, desarrollador, genero, publicador, comentario, puntuacion, favorito) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    
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
        $data['puntuacion'] ?? null,
        $data['favorito'] ?? 0
    ]);
    
    jsonResponse(["message" => "Juego creado", "id" => $id_imagen], 201);
}

function updateGame($id) {
    global $pdo;
    
    requireId($id, 'ID de juego requerido');
    $data = getJsonInput();
    
    // Obtener datos actuales
    $stmt = $pdo->prepare("SELECT * FROM juegos WHERE id = ?");
    $stmt->execute([$id]);
    $juego = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$juego) {
        jsonResponse(['error' => 'Juego no encontrado'], 404);
    }
    
    // Mezclar datos
    $titulo = $data['titulo'] ?? $juego['titulo'];
    $plataforma_id = $data['plataforma_id'] ?? $juego['plataforma_id'];
    if ($plataforma_id === '') $plataforma_id = null;
    
    $region = $data['region'] ?? $juego['region'];
    $formato = $data['formato'] ?? $juego['formato'];
    $estado = $data['estado'] ?? $juego['estado'];
    $valor = $data['valor'] ?? $juego['valor'];
    if ($valor === '') $valor = null;
    
    $cartucho = $data['cartucho'] ?? $juego['cartucho'];
    $manual = $data['manual'] ?? $juego['manual'];
    $caja = $data['caja'] ?? $juego['caja'];
    $lanzamiento = $data['lanzamiento'] ?? $juego['lanzamiento'];
    if ($lanzamiento === '') $lanzamiento = null;
    
    $desarrollador = $data['desarrollador'] ?? $juego['desarrollador'];
    $genero = $data['genero'] ?? $juego['genero'];
    $publicador = $data['publicador'] ?? $juego['publicador'];
    $comentario = $data['comentario'] ?? $juego['comentario'];
    $puntuacion = $data['puntuacion'] ?? $juego['puntuacion'];
    if ($puntuacion === '') $puntuacion = null;
    
    if (isset($data['favorito'])) {
        $favorito = filter_var($data['favorito'], FILTER_VALIDATE_BOOLEAN) ? 1 : 0;
    } else {
        $favorito = (int)$juego['favorito'];
    }
    
    $stmt = $pdo->prepare("UPDATE juegos SET 
        titulo = ?, plataforma_id = ?, region = ?, formato = ?, estado = ?, valor = ?, cartucho = ?, manual = ?, caja = ?, lanzamiento = ?, desarrollador = ?, genero = ?, publicador = ?, comentario = ?, puntuacion = ?, favorito = ? 
        WHERE id = ?");
    
    $stmt->execute([
        $titulo,
        $plataforma_id,
        $region,
        $formato,
        $estado,
        $valor,
        $cartucho,
        $manual,
        $caja,
        $lanzamiento,
        $desarrollador,
        $genero,
        $publicador,
        $comentario,
        $puntuacion,
        $favorito,
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
