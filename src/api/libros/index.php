<?php
require_once __DIR__ . '/../helpers.php';

$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;
$action = $_GET['action'] ?? null;

switch ($method) {
    case 'GET':
        if ($id) {
            getLibro($id);
        } elseif ($action === 'last') {
            getLastLibros();
        } else {
            listLibros();
        }
        break;
    case 'POST':
        createLibro();
        break;
    case 'PUT':
        updateLibro($id);
        break;
    case 'DELETE':
        deleteLibro($id);
        break;
    default:
        jsonResponse(['error' => 'Method not allowed'], 405);
}

function getLibro($id) {
    global $pdo;
    requireId($id, 'ID de libro requerido');
    
    $stmt = $pdo->prepare("SELECT * FROM libros WHERE id = ?");
    $stmt->execute([$id]);
    $libro = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$libro) {
        jsonResponse(['error' => 'Libro no encontrado'], 404);
    }
    jsonResponse($libro);
}

function getLastLibros() {
    global $pdo;
    $stmt = $pdo->query("SELECT 
        libros.id, 
        libros.titulo, 
        libros.id_imagen,
        libros.autor,
        libros.anio,
        libros.editorial,
        libros.estado,
        libros.precio as valor,
        (SELECT archivo FROM imagenes WHERE tipo = '0' AND imagenes.juego_id = libros.id_imagen ORDER BY imagenes.id DESC LIMIT 1) AS portada
        FROM libros
        ORDER BY libros.created_at DESC
        LIMIT 10");
    jsonResponse($stmt->fetchAll(PDO::FETCH_ASSOC));
}

function listLibros() {
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
        $where[] = "(libros.titulo LIKE :search OR libros.autor LIKE :search)";
    }
    if ($estado) {
        $where[] = "libros.estado = :estado";
        $params[':estado'] = $estado;
    }
    if ($valor_min !== null && $valor_min !== '') {
        $where[] = "libros.precio >= :valor_min";
        $params[':valor_min'] = $valor_min;
    }
    if ($valor_max !== null && $valor_max !== '') {
        $where[] = "libros.precio <= :valor_max";
        $params[':valor_max'] = $valor_max;
    }
    if ($anio) {
        $where[] = "libros.anio = :anio";
        $params[':anio'] = $anio;
    }
    
    $whereClause = $where ? "WHERE " . implode(" AND ", $where) : "";
    
    $orderClause = match($orden) {
        'titulo_asc' => 'ORDER BY libros.titulo ASC',
        'titulo_desc' => 'ORDER BY libros.titulo DESC',
        'valor_asc' => 'ORDER BY libros.precio ASC',
        'valor_desc' => 'ORDER BY libros.precio DESC',
        'anio_desc' => 'ORDER BY libros.anio DESC',
        'calificacion_desc' => 'ORDER BY libros.calificacion DESC',
        default => 'ORDER BY libros.created_at DESC'
    };
    
    $countSql = "SELECT COUNT(*) as total FROM libros $whereClause";
    
    $dataSql = "SELECT 
                libros.id, 
                libros.titulo, 
                libros.id_imagen,
                libros.autor,
                libros.anio,
                libros.editorial,
                libros.estado,
                libros.calificacion,
                libros.precio as valor,
                (SELECT archivo FROM imagenes WHERE tipo = '0' AND imagenes.juego_id = libros.id_imagen ORDER BY imagenes.id DESC LIMIT 1) AS portada
                FROM libros $whereClause 
                $orderClause 
                LIMIT :limit OFFSET :offset";
    
    jsonResponse(getPaginatedResponse($pdo, $countSql, $dataSql, $params, $search, $limit, $offset));
}

function createLibro() {
    global $pdo;
    
    $data = getJsonInput();
    validateRequired($data, 'titulo', 'Titulo es requerido');
    
    $id_imagen = generateIdImagen();
    
    $stmt = $pdo->prepare("INSERT INTO libros (id_imagen, titulo, autor, anio, editorial, estado, calificacion, precio, comentario) 
                           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        $id_imagen,
        $data['titulo'],
        $data['autor'] ?? null,
        $data['anio'] ?? null,
        $data['editorial'] ?? null,
        $data['estado'] ?? null,
        $data['calificacion'] ?? null,
        $data['precio'] ?? null,
        $data['comentario'] ?? null
    ]);
    
    $id = $pdo->lastInsertId();
    jsonResponse(['id' => $id, 'id_imagen' => $id_imagen, 'message' => 'Libro creado correctamente'], 201);
}

function updateLibro($id) {
    global $pdo;
    
    requireId($id, 'ID requerido');
    $data = getJsonInput();
    validateRequired($data, 'titulo', 'Titulo es requerido');
    
    $stmt = $pdo->prepare("UPDATE libros SET titulo = ?, autor = ?, anio = ?, editorial = ?, estado = ?, calificacion = ?, precio = ?, comentario = ? 
                           WHERE id = ?");
    $stmt->execute([
        $data['titulo'],
        $data['autor'] ?? null,
        $data['anio'] ?? null,
        $data['editorial'] ?? null,
        $data['estado'] ?? null,
        $data['calificacion'] ?? null,
        $data['precio'] ?? null,
        $data['comentario'] ?? null,
        $id
    ]);
    
    jsonResponse(['message' => 'Libro actualizado correctamente']);
}

function deleteLibro($id) {
    global $pdo;
    
    requireId($id, 'ID requerido');
    
    $stmt = $pdo->prepare("DELETE FROM libros WHERE id = ?");
    $stmt->execute([$id]);
    jsonResponse(['message' => 'Libro eliminado correctamente']);
}
