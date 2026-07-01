<?php
$host = 'localhost';
$db   = 'videojuegos';
$user = 'app';
$pass = 'app';
 
try {
    $pdo = new PDO(
        "mysql:host=$host;dbname=$db;charset=utf8mb4",
        $user,
        $pass,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
} catch (PDOException $e) {
    die("Error DB: " . $e->getMessage());
}
