<?php
require_once __DIR__ . '/../headers.php';
require_once __DIR__ . '/../../config/db.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        getAccesorios();
        break;
    case 'POST':
        createAccesorio();
        break;
    case 'PUT':
        updateAccesorio();
        break;
    case 'DELETE':
        deleteAccesorio();
        break;
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}

function getAccesorios() {
    global $pdo;
    
    $id = $_GET['id'] ?? null;
    $action = $_GET['action'] ?? null;
    
    if ($action === 'last') {
        try {
            $stmt = $pdo->query("SELECT 
                accesorios.id, 
                accesorios.nombre, 
                accesorios.id_imagen,
                accesorios.tipo,
                accesorios.plataforma,
                accesorios.anio,
                accesorios.estado,
                accesorios.precio as valor,
                (SELECT archivo FROM imagenes WHERE tipo = '0' AND imagenes.juego_id = accesorios.id_imagen ORDER BY imagenes.id DESC LIMIT 1 ) AS portada
                FROM accesorios
                ORDER BY accesorios.created_at DESC
                LIMIT 10");
            $accesorios = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($accesorios);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
        return;
    }
    
    if ($id) {
        try {
            $stmt = $pdo->prepare("SELECT * FROM accesorios WHERE id = ?");
            $stmt->execute([$id]);
            $accesorio = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$accesorio) {
                http_response_code(404);
                echo json_encode(['error' => 'Accesorio no encontrado']);
                return;
            }
            
            echo json_encode($accesorio);
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
    
    $countSql = "SELECT COUNT(*) as total FROM accesorios" . ($search ? " WHERE nombre LIKE :search" : "");
    $countStmt = $pdo->prepare($countSql);
    if ($search) {
        $countStmt->bindValue(':search', "%$search%", PDO::PARAM_STR);
    }
    $countStmt->execute();
    $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    $sql = "SELECT 
                accesorios.id, 
                accesorios.nombre, 
                accesorios.id_imagen,
                accesorios.tipo,
                accesorios.plataforma,
                accesorios.anio,
                accesorios.estado,
                accesorios.precio as valor,
                (SELECT archivo FROM imagenes WHERE tipo = '0' AND imagenes.juego_id = accesorios.id_imagen ORDER BY imagenes.id DESC LIMIT 1 ) AS portada,
                (SELECT archivo FROM imagenes WHERE tipo = '1' AND imagenes.juego_id = accesorios.id_imagen ORDER BY imagenes.id DESC LIMIT 1 ) AS fondo    
                FROM accesorios" . ($search ? " WHERE accesorios.nombre LIKE :search" : "") . " ORDER BY accesorios.created_at DESC LIMIT :limit OFFSET :offset";
    
    $stmt = $pdo->prepare($sql);
    if ($search) {
        $stmt->bindValue(':search', "%$search%", PDO::PARAM_STR);
    }
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    $accesorios = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'data' => $accesorios,
        'pagination' => [
            'page' => $page,
            'limit' => $limit,
            'total' => (int)$total,
            'totalPages' => ceil($total / $limit)
        ]
    ]);
}

function createAccesorio() {
    global $pdo;
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['nombre']) || empty($data['nombre'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Nombre es requerido']);
        return;
    }
    
    $id_imagen = $data['id_imagen'] ?? bin2hex(random_bytes(16));
    $nombre = $data['nombre'];
    $tipo = $data['tipo'] ?? null;
    $plataforma = $data['plataforma'] ?? null;
    $anio = $data['anio'] ?? null;
    $estado = $data['estado'] ?? null;
    $precio = $data['precio'] ?? null;
    $comentario = $data['comentario'] ?? null;
    
    try {
        $stmt = $pdo->prepare("INSERT INTO accesorios (id_imagen, nombre, tipo, plataforma, anio, estado, precio, comentario) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$id_imagen, $nombre, $tipo, $plataforma, $anio, $estado, $precio, $comentario]);
        
        $id = $pdo->lastInsertId();
        echo json_encode(['id' => $id, 'id_imagen' => $id_imagen, 'message' => 'Accesorio creado correctamente']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}

function updateAccesorio() {
    global $pdo;
    
    $id = $_GET['id'] ?? null;
    
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'ID requerido']);
        return;
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['nombre']) || empty($data['nombre'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Nombre es requerido']);
        return;
    }
    
    $id_imagen = $data['id_imagen'] ?? null;
    $nombre = $data['nombre'];
    $tipo = $data['tipo'] ?? null;
    $plataforma = $data['plataforma'] ?? null;
    $anio = $data['anio'] ?? null;
    $estado = $data['estado'] ?? null;
    $precio = $data['precio'] ?? null;
    $comentario = $data['comentario'] ?? null;
    
    try {
        $stmt = $pdo->prepare("UPDATE accesorios SET nombre = ?, tipo = ?, plataforma = ?, anio = ?, estado = ?, precio = ?, comentario = ? WHERE id = ?");
        $stmt->execute([$nombre, $tipo, $plataforma, $anio, $estado, $precio, $comentario, $id]);
        
        echo json_encode(['message' => 'Accesorio actualizado correctamente']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}

function deleteAccesorio() {
    global $pdo;
    
    $id = $_GET['id'] ?? null;
    
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'ID requerido']);
        return;
    }
    
    try {
        $stmt = $pdo->prepare("DELETE FROM accesorios WHERE id = ?");
        $stmt->execute([$id]);
        
        echo json_encode(['message' => 'Accesorio eliminado correctamente']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}