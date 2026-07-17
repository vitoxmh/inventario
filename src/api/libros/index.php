<?php
require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../middleware/auth.php';

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
        requireAdmin();
        createLibro();
        break;
    case 'PUT':
        requireAdmin();
        updateLibro($id);
        break;
    case 'DELETE':
        requireAdmin();
        deleteLibro($id);
        break;
    default:
        errorResponse('Method not allowed', 405);
}

function getLibro($id) {
    global $pdo;
    requireId($id, 'ID de libro requerido');
    
    $stmt = $pdo->prepare("SELECT * FROM libros WHERE id = ?");
    $stmt->execute([$id]);
    $libro = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$libro) {
        errorResponse('Libro no encontrado', 404);
    }
    successResponse($libro);
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
    successResponse($stmt->fetchAll(PDO::FETCH_ASSOC));
}

function listLibros() {
    global $pdo;
    
    extract(getPaginationParams());
    
    $countSql = "SELECT COUNT(*) as total FROM libros" . ($search ? " WHERE titulo LIKE :search OR autor LIKE :search" : "");
    
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
                FROM libros" . ($search ? " WHERE libros.titulo LIKE :search OR libros.autor LIKE :search" : "") . " 
                ORDER BY libros.created_at DESC 
                LIMIT :limit OFFSET :offset";
    
    $result = getPaginatedResponse($pdo, $countSql, $dataSql, [], $search, $limit, $offset);
    paginatedResponse($result['data'], $result['pagination']);
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
    successResponse(['id' => $id, 'id_imagen' => $id_imagen], 'Libro creado correctamente', 201);
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
    
    successResponse(null, 'Libro actualizado correctamente');
}

function deleteLibro($id) {
    global $pdo;
    
    requireId($id, 'ID requerido');
    
    $stmt = $pdo->prepare("DELETE FROM libros WHERE id = ?");
    $stmt->execute([$id]);
    successResponse(null, 'Libro eliminado correctamente');
}
