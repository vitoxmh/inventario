<?php
require_once __DIR__ . '/../headers.php';
require_once __DIR__ . '/../../config/db.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

if (!isset($_GET['id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'ID requerido']);
    return;
}

$id = (int)$_GET['id'];

switch ($method) {
    case 'GET':
        getAmiibo($id);
        break;
    case 'PUT':
        updateAmiibo($id);
        break;
    case 'DELETE':
        deleteAmiibo($id);
        break;
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}

function getAmiibo($id) {
    global $pdo;
    
    try {
        $stmt = $pdo->prepare("SELECT * FROM amiibos WHERE id = ?");
        $stmt->execute([$id]);
        $amiibo = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$amiibo) {
            http_response_code(404);
            echo json_encode(['error' => 'Amiibo no encontrado']);
            return;
        }
        
        echo json_encode($amiibo);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}

function updateAmiibo($id) {
    global $pdo;
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['titulo']) || empty($data['titulo'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Titulo es requerido']);
        return;
    }
    
    $id_imagen = $data['id_imagen'] ?? null;
    $titulo = $data['titulo'];
    $anio = $data['anio'] ?? null;
    $estado = $data['estado'] ?? null;
    $calificacion = $data['calificacion'] ?? null;
    $precio = $data['precio'] ?? null;
    $comentario = $data['comentario'] ?? null;
    
    try {
        $stmt = $pdo->prepare("UPDATE amiibos SET id_imagen = ?, titulo = ?, anio = ?, estado = ?, calificacion = ?, precio = ?, comentario = ? WHERE id = ?");
        $stmt->execute([$id_imagen, $titulo, $anio, $estado, $calificacion, $precio, $comentario, $id]);
        
        echo json_encode(['message' => 'Amiibo actualizado correctamente']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}

function deleteAmiibo($id) {
    global $pdo;
    
    try {
        $stmt = $pdo->prepare("DELETE FROM amiibos WHERE id = ?");
        $stmt->execute([$id]);
        
        echo json_encode(['message' => 'Amiibo eliminado correctamente']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}