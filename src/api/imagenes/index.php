<?php
ini_set('post_max_size', '128M');
ini_set('upload_max_filesize', '128M');
ini_set('memory_limit', '128M');
ini_set('display_errors', 0);
error_reporting(E_ALL);
require_once '../headers.php';
require_once '../../config/db.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}


if ($_SERVER['REQUEST_METHOD'] === 'GET') {

    $juego_id = $_GET["juego_id"] ?? null;
    $type = $_GET["type"] ?? null;

    if (!$juego_id) {
      echo json_encode([]);
      exit;
    }


    if($type === 'all'){
        $stmt = $pdo->prepare("SELECT * FROM imagenes WHERE juego_id = ? AND is_deleted = false");
        $stmt->execute([$juego_id]);

        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        exit;
    }

    $stmt = $pdo->prepare("SELECT * FROM imagenes WHERE juego_id = ? AND tipo = ? AND is_deleted = false");
    $stmt->execute([$juego_id, $type]);

    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));

}


 
if ($_SERVER['REQUEST_METHOD'] === 'POST') {


    if (
        !isset($_POST['juego_id']) ||
        !isset($_FILES['imagenes'])
    ) {
        echo json_encode(["error" => "Datos incompletos"]);
        exit;
    }
    // soloe texto y numeros

    $juego_id = htmlspecialchars($_POST['juego_id']);
    $type = $_POST['tipo'] ?? 'imagen';

    $dir = __DIR__ . "/uploads";
    if (!is_dir($dir)) mkdir($dir, 0777, true);

    $imagenes = [];

    foreach ($_FILES['imagenes']['tmp_name'] as $i => $tmp) {
        $nombre = uniqid() . "_" . basename($_FILES['imagenes']['name'][$i]);
        move_uploaded_file($tmp, "$dir/$nombre");

        // guardar en DB
        $stmt = $pdo->prepare("
          INSERT INTO imagenes (juego_id, archivo, tipo)
          VALUES (?, ?, ?)
        ");
        $stmt->execute([$juego_id, $nombre, $type]);

        $imagenes[] = $nombre;
    }

    echo json_encode([
      "ok" => true,
      "imagenes" => $imagenes
    ]);

}

 
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {

    $id = $_GET["id"] ?? null;


    if (!$id) {
      echo json_encode([]);
      exit;
    }


    $stmt = $pdo->prepare("UPDATE imagenes SET is_deleted = true WHERE id = ?");
    $stmt->execute([$id]);

    echo json_encode(["ok" => true]);

}