<?php

require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../../config/jwt.php';
require_once __DIR__ . '/../middleware/rate_limit.php';

checkRateLimit();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Método no permitido'], 405);
}

$data = getJsonInput();

if (!$data || empty($data['nombre']) || empty($data['email']) || empty($data['password'])) {
    jsonResponse(['error' => 'Nombre, email y contraseña son requeridos'], 400);
}

$nombre = sanitizeString($data['nombre']);
$email = sanitizeEmail($data['email']);
$password = $data['password'];

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    jsonResponse(['error' => 'Email inválido'], 400);
}

if (strlen($nombre) < 2 || strlen($nombre) > 100) {
    jsonResponse(['error' => 'El nombre debe tener entre 2 y 100 caracteres'], 400);
}

if (strlen($password) < 8) {
    jsonResponse(['error' => 'La contraseña debe tener al menos 8 caracteres'], 400);
}

if (!preg_match('/[A-Z]/', $password) || !preg_match('/[0-9]/', $password)) {
    jsonResponse(['error' => 'La contraseña debe contener al menos una mayúscula y un número'], 400);
}

global $pdo;

$stmt = $pdo->prepare("SELECT id FROM usuarios WHERE email = ?");
$stmt->execute([$email]);

if ($stmt->fetch()) {
    jsonResponse(['error' => 'El email ya está registrado'], 409);
}

$hashedPassword = hashPassword($password);

$stmt = $pdo->prepare("INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, 'viewer')");
$stmt->execute([$nombre, $email, $hashedPassword]);

$userId = $pdo->lastInsertId();

$accessToken = jwt_encode([
    'user_id' => $userId,
    'nombre'  => $nombre,
    'email'   => $email,
    'rol'     => 'viewer'
]);

$refreshToken = generateRefreshToken();

$stmt = $pdo->prepare("INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))");
$stmt->execute([$userId, $refreshToken]);

jsonResponse([
    'access_token'  => $accessToken,
    'refresh_token' => $refreshToken,
    'token_type'    => 'Bearer',
    'expires_in'    => JWT_EXPIRY,
    'user' => [
        'id'     => (int)$userId,
        'nombre' => $nombre,
        'email'  => $email,
        'rol'    => 'viewer'
    ]
], 201);
