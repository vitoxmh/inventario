<?php
ini_set('post_max_size', '128M');
ini_set('upload_max_filesize', '128M');
ini_set('memory_limit', '128M');

require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../middleware/auth.php';

define('MAX_FILE_SIZE', 5 * 1024 * 1024);
define('ALLOWED_MIME_TYPES', [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/jpg'
]);
define('ALLOWED_EXTENSIONS', ['jpg', 'jpeg', 'png', 'webp', 'gif']);

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    getImagenes();
} elseif ($method === 'POST') {
    requireAdmin();
    uploadImagenes();
} elseif ($method === 'DELETE') {
    requireAdmin();
    deleteImagen();
} else {
    errorResponse('Método no permitido', 405);
}

function validateUploadedFile($file) {
    if ($file['error'] !== UPLOAD_ERR_OK) {
        errorResponse('Error en la subida del archivo: ' . $file['error'], 400);
    }
    
    if ($file['size'] > MAX_FILE_SIZE) {
        errorResponse('El archivo excede el tamaño máximo de 5MB', 400);
    }
    
    $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if (!in_array($extension, ALLOWED_EXTENSIONS)) {
        errorResponse('Extensión no permitida: ' . $extension . '. Permitidas: ' . implode(', ', ALLOWED_EXTENSIONS), 400);
    }
    
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mimeType = $finfo->file($file['tmp_name']);
    
    if (!in_array($mimeType, ALLOWED_MIME_TYPES)) {
        errorResponse('Tipo de archivo no permitido: ' . $mimeType, 400);
    }
    
    $imageInfo = @getimagesize($file['tmp_name']);
    if ($imageInfo === false) {
        errorResponse('El archivo no es una imagen válida', 400);
    }
    
    return true;
}

function getImagenes() {
    global $pdo;
    
    $juego_id = $_GET["juego_id"] ?? null;
    $amiibo_id = $_GET["amiibo_id"] ?? null;
    $type = $_GET["type"] ?? null;
    
    if (!$juego_id && !$amiibo_id) {
        successResponse([]);
    }
    
    try {
        if ($type === 'all') {
            if ($juego_id) {
                $stmt = $pdo->prepare("SELECT * FROM imagenes WHERE juego_id = ? AND is_deleted = false");
                $stmt->execute([$juego_id]);
            } else {
                $stmt = $pdo->prepare("SELECT * FROM imagenes WHERE amiibo_id = ? AND is_deleted = false");
                $stmt->execute([$amiibo_id]);
            }
        } else {
            if ($juego_id) {
                $stmt = $pdo->prepare("SELECT * FROM imagenes WHERE juego_id = ? AND tipo = ? AND is_deleted = false");
                $stmt->execute([$juego_id, $type]);
            } else {
                $stmt = $pdo->prepare("SELECT * FROM imagenes WHERE amiibo_id = ? AND tipo = ? AND is_deleted = false");
                $stmt->execute([$amiibo_id, $type]);
            }
        }
        successResponse($stmt->fetchAll(PDO::FETCH_ASSOC));
    } catch (PDOException $e) {
        errorResponse('Error interno del servidor', 500);
    }
}

function uploadImagenes() {
    global $pdo;
    
    $juego_id = $_POST["juego_id"] ?? null;
    $amiibo_id = $_POST["amiibo_id"] ?? null;
    
    if (empty($juego_id) && empty($amiibo_id)) {
        errorResponse("juego_id o amiibo_id requerido", 400);
    }
    
    if (!isset($_FILES['imagenes']) || empty($_FILES['imagenes']['name'][0])) {
        errorResponse("Archivo de imagen requerido", 400);
    }
    
    $type = $_POST['tipo'] ?? 'imagen';
    $type = sanitizeString($type);
    
    $allowedTypes = ['imagen', 'portada', 'contraportada', 'poster', 'logo', '0', '1', '2', '3', '4'];
    if (!in_array($type, $allowedTypes)) {
        errorResponse("Tipo de imagen inválido", 400);
    }
    
    $dir = __DIR__ . "/uploads";
    
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
    
    $imagenes = [];
    
    foreach ($_FILES['imagenes']['tmp_name'] as $i => $tmp) {
        if ($_FILES['imagenes']['error'][$i] !== UPLOAD_ERR_OK) {
            continue;
        }
        
        $file = [
            'name'     => $_FILES['imagenes']['name'][$i],
            'type'     => $_FILES['imagenes']['type'][$i],
            'tmp_name' => $_FILES['imagenes']['tmp_name'][$i],
            'error'    => $_FILES['imagenes']['error'][$i],
            'size'     => $_FILES['imagenes']['size'][$i]
        ];
        
        validateUploadedFile($file);
        
        $extension = strtolower(pathinfo($_FILES['imagenes']['name'][$i], PATHINFO_EXTENSION));
        $nombre = bin2hex(random_bytes(16)) . '.' . $extension;
        
        if (move_uploaded_file($tmp, "$dir/$nombre")) {
            try {
                if (!empty($juego_id)) {
                    $stmt = $pdo->prepare("INSERT INTO imagenes (juego_id, archivo, tipo) VALUES (?, ?, ?)");
                    $stmt->execute([$juego_id, $nombre, $type]);
                } else {
                    $stmt = $pdo->prepare("INSERT INTO imagenes (amiibo_id, archivo, tipo) VALUES (?, ?, ?)");
                    $stmt->execute([$amiibo_id, $nombre, $type]);
                }
                $imagenes[] = $nombre;
            } catch (PDOException $e) {
                errorResponse('Error al guardar en la base de datos', 500);
            }
        }
    }
    
    successResponse(['imagenes' => $imagenes], 'Imágenes subidas correctamente');
}

function deleteImagen() {
    global $pdo;
    
    $id = $_GET["id"] ?? null;
    requireId($id, "ID requerido");
    
    try {
        $stmt = $pdo->prepare("UPDATE imagenes SET is_deleted = true WHERE id = ?");
        $stmt->execute([$id]);
        successResponse(null, 'Imagen eliminada');
    } catch (PDOException $e) {
        errorResponse('Error al eliminar la imagen', 500);
    }
}
