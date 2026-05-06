<?php
require_once __DIR__ . '/../headers.php';
require_once __DIR__ . '/../../config/db.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        getAmiibos();
        break;
    case 'POST':
        createAmiibo();
        break;
    case 'PUT':
        updateAmiibo();
        break;
    case 'DELETE':
        deleteAmiibo();
        break;
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}

function getAmiibos() {
    global $pdo;
    
    $id = $_GET['id'] ?? null;
    $action = $_GET['action'] ?? null;
    
    if ($action === 'last') {
        try {
            $stmt = $pdo->query("SELECT 
                amiibos.id, 
                amiibos.titulo, 
                amiibos.id_imagen,
                amiibos.anio,
                amiibos.estado,
                amiibos.calificacion,
                amiibos.precio as valor,
                (SELECT archivo FROM imagenes WHERE tipo = '0' AND imagenes.juego_id = amiibos.id_imagen ORDER BY imagenes.id DESC LIMIT 1 ) AS portada
                FROM amiibos
                ORDER BY amiibos.created_at DESC
                LIMIT 10");
            $amiibos = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($amiibos);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
        return;
    }
    
    if ($id) {
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
        return;
    }
    
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
    $search = isset($_GET['search']) ? $_GET['search'] : '';
    
    $page = max(1, $page);
    $limit = max(1, min(100, $limit));
    $offset = ($page - 1) * $limit;
    
    $countSql = "SELECT COUNT(*) as total FROM amiibos" . ($search ? " WHERE titulo LIKE :search" : "");
    $countStmt = $pdo->prepare($countSql);
    if ($search) {
        $countStmt->bindValue(':search', "%$search%", PDO::PARAM_STR);
    }
    $countStmt->execute();
    $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    $sql = "SELECT 
                amiibos.id, 
                amiibos.titulo, 
                amiibos.id_imagen,
                (SELECT archivo FROM imagenes WHERE tipo = '0' AND imagenes.juego_id = amiibos.id_imagen ORDER BY imagenes.id DESC LIMIT 1 ) AS iportada,
                (SELECT archivo FROM imagenes WHERE tipo = '1' AND imagenes.juego_id = amiibos.id_imagen ORDER BY imagenes.id DESC LIMIT 1 ) AS icontraportada,
                amiibos.anio,
                amiibos.estado,
                amiibos.calificacion,
                amiibos.precio as valor,
                (SELECT archivo FROM imagenes WHERE tipo = '0' AND imagenes.amiibo_id = amiibos.id_imagen ORDER BY imagenes.id DESC LIMIT 1 ) AS portada
                FROM amiibos" . ($search ? " WHERE amiibos.titulo LIKE :search" : "") . " ORDER BY amiibos.created_at DESC LIMIT :limit OFFSET :offset";
    
    $stmt = $pdo->prepare($sql);
    if ($search) {
        $stmt->bindValue(':search', "%$search%", PDO::PARAM_STR);
    }
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    $amiibos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'data' => $amiibos,
        'pagination' => [
            'page' => $page,
            'limit' => $limit,
            'total' => (int)$total,
            'totalPages' => ceil($total / $limit)
        ]
    ]);
}

function createAmiibo() {
    global $pdo;
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['titulo']) || empty($data['titulo'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Titulo es requerido']);
        return;
    }
    
    $id_imagen = $data['id_imagen'] ?? bin2hex(random_bytes(16));
    $titulo = $data['titulo'];
    $anio = $data['anio'] ?? null;
    $estado = $data['estado'] ?? null;
    $calificacion = $data['calificacion'] ?? null;
    $precio = $data['precio'] ?? null;
    $comentario = $data['comentario'] ?? null;
    
    try {
        $stmt = $pdo->prepare("INSERT INTO amiibos (id_imagen, titulo, anio, estado, calificacion, precio, comentario) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$id_imagen, $titulo, $anio, $estado, $calificacion, $precio, $comentario]);
        
        $id = $pdo->lastInsertId();
        echo json_encode(['id' => $id, 'id_imagen' => $id_imagen, 'message' => 'Amiibo creado correctamente']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}

function updateAmiibo() {
    global $pdo;
    
    $id = $_GET['id'] ?? null;
    
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'ID requerido']);
        return;
    }
    
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
        $stmt = $pdo->prepare("UPDATE amiibos SET titulo = ?, anio = ?, estado = ?, calificacion = ?, precio = ?, comentario = ? WHERE id = ?");
        $stmt->execute([$titulo, $anio, $estado, $calificacion, $precio, $comentario, $id]);
        
        echo json_encode(['message' => 'Amiibo actualizado correctamente']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}

function deleteAmiibo() {
    global $pdo;
    
    $id = $_GET['id'] ?? null;
    
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'ID requerido']);
        return;
    }
    
    try {
        $stmt = $pdo->prepare("DELETE FROM amiibos WHERE id = ?");
        $stmt->execute([$id]);
        
        echo json_encode(['message' => 'Amiibo eliminado correctamente']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}