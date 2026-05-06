<?php
require_once __DIR__ . '/../helpers.php';

if (!isset($_GET['id'])) {
    $stmt = $pdo->query("SELECT * FROM plataformas ORDER BY created_at DESC");
    jsonResponse($stmt->fetchAll(PDO::FETCH_ASSOC));
}

$id = $_GET['id'];
$stmt = $pdo->prepare("SELECT * FROM plataformas WHERE id = ? ORDER BY created_at DESC");
$stmt->execute([$id]);
$plataforma = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$plataforma) {
    jsonResponse(['error' => 'Plataforma no encontrada'], 404);
}
jsonResponse($plataforma);
