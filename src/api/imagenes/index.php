<?php
ini_set('post_max_size', '128M');
ini_set('upload_max_filesize', '128M');
ini_set('memory_limit', '128M');

require_once __DIR__ . '/../helpers.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    getImagenes();
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    uploadImagenes();
} elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    deleteImagen();
} else {
    jsonResponse(['error' => 'Método no permitido'], 405);
}

function getImagenes() {
    global $pdo;
    
    $juego_id = $_GET["juego_id"] ?? null;
    $amiibo_id = $_GET["amiibo_id"] ?? null;
    $type = $_GET["type"] ?? null;
    
    if (!$juego_id && !$amiibo_id) {
        jsonResponse([]);
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
        jsonResponse($stmt->fetchAll(PDO::FETCH_ASSOC));
    } catch (PDOException $e) {
        jsonResponse(['error' => $e->getMessage()], 500);
    }
}

function uploadImagenes() {
    global $pdo;
    
    $juego_id = $_POST["juego_id"] ?? null;
    $amiibo_id = $_POST["amiibo_id"] ?? null;
    
    if (empty($juego_id) && empty($amiibo_id)) {
        jsonResponse(["error" => "juego_id o amiibo_id requerido"], 400);
    }
    
    if (!isset($_FILES['imagenes']) || empty($_FILES['imagenes']['name'][0])) {
        jsonResponse(["error" => "Archivo de imagen requerido"], 400);
    }
    
    $type = $_POST['tipo'] ?? 'imagen';
    $dir = __DIR__ . "/uploads";
    
    if (!is_dir($dir)) {
        mkdir($dir, 0777, true);
    }
    
    $imagenes = [];
    
    foreach ($_FILES['imagenes']['tmp_name'] as $i => $tmp) {
        if ($_FILES['imagenes']['error'][$i] !== UPLOAD_ERR_OK) {
            continue;
        }
        
        $nombre = uniqid() . "_" . basename($_FILES['imagenes']['name'][$i]);
        
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
                jsonResponse(['error' => 'Error DB: ' . $e->getMessage()], 500);
            }
        }
    }
    
    jsonResponse(["ok" => true, "imagenes" => $imagenes]);
}

function deleteImagen() {
    global $pdo;
    
    $id = $_GET["id"] ?? null;
    requireId($id, "ID requerido");
    
    try {
        $stmt = $pdo->prepare("UPDATE imagenes SET is_deleted = true WHERE id = ?");
        $stmt->execute([$id]);
        jsonResponse(["ok" => true]);
    } catch (PDOException $e) {
        jsonResponse(['error' => $e->getMessage()], 500);
    }
}
