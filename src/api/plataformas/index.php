<?php
require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../middleware/auth.php';

$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;
$action = $_GET['action'] ?? null;

switch ($method) {
    case 'GET':
        if ($id) {
            getPlataforma($id);
        } elseif ($action === 'countPlataformas') {
            getCountPlataformas();
        } elseif ($action === 'last') {
            getLastPlataformas();
        } else {
            listPlataformas();
        }
        break;
    case 'POST':
        requireAdmin();
        createPlataforma();
        break;
    case 'PUT':
        requireAdmin();
        updatePlataforma($id);
        break;
    case 'DELETE':
        requireAdmin();
        deletePlataforma($id);
        break;
    default:
        errorResponse('Method not allowed', 405);
}

function getPlataforma($id) {
    global $pdo;
    requireId($id, 'ID de plataforma requerido');
    
    $stmt = $pdo->prepare("SELECT * FROM plataformas WHERE id = ?");
    $stmt->execute([$id]);
    $plataforma = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$plataforma) {
        errorResponse('Plataforma no encontrada', 404);
    }
    successResponse($plataforma);
}

function getLastPlataformas() {
    global $pdo;
    $stmt = $pdo->query("SELECT 
        p.*,
        (SELECT archivo FROM imagenes i WHERE i.juego_id = p.id_imagen AND i.tipo = 0 ORDER BY created_at DESC LIMIT 1) AS archivo
        FROM plataformas p
        ORDER BY p.created_at DESC
        LIMIT 10");
    successResponse($stmt->fetchAll(PDO::FETCH_ASSOC));
}

function listPlataformas() {
    global $pdo;
    $stmt = $pdo->query("SELECT 
        p.*,
        COUNT(j.id) AS total,
        (SELECT archivo FROM imagenes i WHERE i.juego_id = p.id_imagen AND i.tipo = 0 ORDER BY created_at DESC LIMIT 1) AS archivo
        FROM plataformas p
        LEFT JOIN juegos j ON j.plataforma_id = p.id
        GROUP BY p.id
        ORDER BY p.nombre ASC");
    successResponse($stmt->fetchAll(PDO::FETCH_ASSOC));
}

function getCountPlataformas() {
    global $pdo;
    $stmt = $pdo->query("SELECT *,
        (SELECT count(*) FROM juegos WHERE juegos.plataforma_id = plataformas.id) as total,
        (SELECT SUM(juegos.valor) FROM juegos WHERE juegos.plataforma_id = plataformas.id) as totalprecio
        FROM plataformas 
        ORDER BY total DESC");
    successResponse($stmt->fetchAll(PDO::FETCH_ASSOC));
}

function createPlataforma() {
    global $pdo;
    
    $data = getJsonInput();
    $id_imagen = generateIdImagen();
    
    $stmt = $pdo->prepare("INSERT INTO plataformas (nombre, fabricante, id_imagen) VALUES (?, ?, ?)");
    $stmt->execute([
        $data['nombre'] ?? null,
        $data['fabricante'] ?? null,
        $id_imagen
    ]);
    
    successResponse(['id' => $id_imagen], 'Plataforma creada', 201);
}

function updatePlataforma($id) {
    global $pdo;
    
    requireId($id, 'ID de plataforma requerido');
    $data = getJsonInput();
    
    $stmt = $pdo->prepare("UPDATE plataformas SET nombre = ?, fabricante = ? WHERE id = ?");
    $stmt->execute([
        $data['nombre'] ?? null,
        $data['fabricante'] ?? null,
        $id
    ]);
    
    successResponse(null, 'Plataforma actualizada');
}

function deletePlataforma($id) {
    global $pdo;
    
    requireId($id, 'ID de plataforma requerido');
    
    $stmt = $pdo->prepare("DELETE FROM plataformas WHERE id = ?");
    $stmt->execute([$id]);
    successResponse(null, 'Plataforma eliminada');
}
