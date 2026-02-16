<?php
require_once '../../config/db.php';
require_once '../headers.php';



$id = $_GET['id'] ?? null;

if (!$id) {

    $stmt = $pdo->query("SELECT * FROM plataformas ORDER BY created_at DESC");
    $plataformas = $stmt->fetchAll(PDO::FETCH_ASSOC);
     echo json_encode($plataformas);
    exit;
}

