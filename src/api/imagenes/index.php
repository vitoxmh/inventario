<?php
ini_set('post_max_size', '128M');
ini_set('upload_max_filesize', '128M');
ini_set('memory_limit', '128M');
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once '../headers.php';
require_once '../../config/db.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $juego_id = $_GET["juego_id"] ?? null;
    $amiibo_id = $_GET["amiibo_id"] ?? null;
    $type = $_GET["type"] ?? null;

    if (!$juego_id && !$amiibo_id) {
        echo json_encode([]);
        exit;
    }

    try {
        if($type === 'all'){
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
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
    exit;
}
  
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $juego_id = $_POST["juego_id"] ?? null;
    $amiibo_id = $_POST["amiibo_id"] ?? null;
    
    if (empty($juego_id) && empty($amiibo_id)) {
        http_response_code(400);
        echo json_encode(["error" => "juego_id o amiibo_id requerido"]);
        exit;
    }
    
    if (!isset($_FILES['imagenes']) || empty($_FILES['imagenes']['name'][0])) {
        http_response_code(400);
        echo json_encode(["error" => "Archivo de imagen requerido"]);
        exit;
    }

    $type = $_POST['tipo'] ?? 'imagen';

    $dir = __DIR__ . "/uploads";
    if (!is_dir($dir)) mkdir($dir, 0777, true);

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
                } else if (!empty($amiibo_id)) {
                    $stmt = $pdo->prepare("INSERT INTO imagenes (amiibo_id, archivo, tipo) VALUES (?, ?, ?)");
                    $stmt->execute([$amiibo_id, $nombre, $type]);
                }
                $imagenes[] = $nombre;
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(['error' => 'Error DB: ' . $e->getMessage()]);
                exit;
            }
        }
    }

    echo json_encode([
      "ok" => true,
      "imagenes" => $imagenes
    ]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = $_GET["id"] ?? null;

    if (!$id) {
        echo json_encode(["error" => "ID requerido"]);
        exit;
    }

    try {
        $stmt = $pdo->prepare("UPDATE imagenes SET is_deleted = true WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(["ok" => true]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
    exit;
}

echo json_encode(["error" => "Método no permitido"]);