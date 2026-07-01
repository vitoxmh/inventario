<?php
require_once __DIR__ . '/../headers.php';
require_once __DIR__ . '/../../config/db.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        getLibros();
        break;
    case 'POST':
        createLibro();
        break;
    case 'PUT':
        updateLibro();
        break;
    case 'DELETE':
        deleteLibro();
        break;
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}

function getLibros() {
    global $pdo;
    
    $id = $_GET['id'] ?? null;
    $action = $_GET['action'] ?? null;
    
    if ($action === 'last') {
        try { 
            $stmt = $pdo->query("SELECT 
                libros.id, 
                libros.titulo, 
                libros.id_imagen,
                libros.autor,
                libros.anio,
                libros.editorial,
                libros.estado,
                libros.precio as valor,
                (SELECT archivo FROM imagenes WHERE tipo = '0' AND imagenes.juego_id = libros.id_imagen ORDER BY imagenes.id DESC LIMIT 1 ) AS portada
                FROM libros
                ORDER BY libros.created_at DESC
                LIMIT 10");
            $libros = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($libros);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
        return;
    }
    
    if ($id) {
        try {
            $stmt = $pdo->prepare("SELECT * FROM libros WHERE id = ?");
            $stmt->execute([$id]);
            $libro = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$libro) {
                http_response_code(404);
                echo json_encode(['error' => 'Libro no encontrado']);
                return;
            }
            
            echo json_encode($libro);
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
    
    $countSql = "SELECT COUNT(*) as total FROM libros" . ($search ? " WHERE titulo LIKE :search OR autor LIKE :search" : "");
    $countStmt = $pdo->prepare($countSql);
    if ($search) {
        $countStmt->bindValue(':search', "%$search%", PDO::PARAM_STR);
    }
    $countStmt->execute();
    $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    $sql = "SELECT 
                libros.id, 
                libros.titulo, 
                libros.id_imagen,
                libros.autor,
                libros.anio,
                libros.editorial,
                libros.estado,
                libros.calificacion,
                libros.precio as valor,
                (SELECT archivo FROM imagenes WHERE tipo = '0' AND imagenes.juego_id = libros.id_imagen ORDER BY imagenes.id DESC LIMIT 1 ) AS portada
                FROM libros" . ($search ? " WHERE libros.titulo LIKE :search OR libros.autor LIKE :search" : "") . " ORDER BY libros.created_at DESC LIMIT :limit OFFSET :offset";
    
    $stmt = $pdo->prepare($sql);
    if ($search) {
        $stmt->bindValue(':search', "%$search%", PDO::PARAM_STR);
    }
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    $libros = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'data' => $libros,
        'pagination' => [
            'page' => $page,
            'limit' => $limit,
            'total' => (int)$total,
            'totalPages' => ceil($total / $limit)
        ]
    ]);
}

function createLibro() {
    global $pdo;
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['titulo']) || empty($data['titulo'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Titulo es requerido']);
        return;
    }
    
    $id_imagen = $data['id_imagen'] ?? bin2hex(random_bytes(16));
    $titulo = $data['titulo'];
    $autor = $data['autor'] ?? null;
    $anio = $data['anio'] ?? null;
    $editorial = $data['editorial'] ?? null;
    $estado = $data['estado'] ?? null;
    $calificacion = $data['calificacion'] ?? null;
    $precio = $data['precio'] ?? null;
    $comentario = $data['comentario'] ?? null;
    
    try {
        $stmt = $pdo->prepare("INSERT INTO libros (id_imagen, titulo, autor, anio, editorial, estado, calificacion, precio, comentario) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$id_imagen, $titulo, $autor, $anio, $editorial, $estado, $calificacion, $precio, $comentario]);
        
        $id = $pdo->lastInsertId();
        echo json_encode(['id' => $id, 'id_imagen' => $id_imagen, 'message' => 'Libro creado correctamente']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}

function updateLibro() {
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
    $autor = $data['autor'] ?? null;
    $anio = $data['anio'] ?? null;
    $editorial = $data['editorial'] ?? null;
    $estado = $data['estado'] ?? null;
    $calificacion = $data['calificacion'] ?? null;
    $precio = $data['precio'] ?? null;
    $comentario = $data['comentario'] ?? null;
    
    try {
        $stmt = $pdo->prepare("UPDATE libros SET titulo = ?, autor = ?, anio = ?, editorial = ?, estado = ?, calificacion = ?, precio = ?, comentario = ? WHERE id = ?");
        $stmt->execute([$titulo, $autor, $anio, $editorial, $estado, $calificacion, $precio, $comentario, $id]);
        
        echo json_encode(['message' => 'Libro actualizado correctamente']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}

function deleteLibro() {
    global $pdo;
    
    $id = $_GET['id'] ?? null;
    
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'ID requerido']);
        return;
    }
    
    try {
        $stmt = $pdo->prepare("DELETE FROM libros WHERE id = ?");
        $stmt->execute([$id]);
        
        echo json_encode(['message' => 'Libro eliminado correctamente']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}