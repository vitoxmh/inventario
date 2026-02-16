<?php
require 'config/db.php';

$stmt = $pdo->query("SELECT 'Conectado a MySQL' AS msg");
$row = $stmt->fetch();

echo "<h1>{$row['msg']}</h1>";
