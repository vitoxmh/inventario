<?php

require_once __DIR__ . '/env.php';

loadEnv();

$host = env('DB_HOST', 'mysql');
$db   = env('DB_NAME', 'videojuegos');
$user = env('DB_USER', 'app');
$pass = env('DB_PASSWORD', 'app');
$charset = env('DB_CHARSET', 'utf8mb4');
 
try {
    $pdo = new PDO(
        "mysql:host=$host;dbname=$db;charset=$charset",
        $user,
        $pass,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
} catch (PDOException $e) {
    die("Error DB: " . $e->getMessage());
}
