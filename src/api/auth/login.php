<?php

require_once __DIR__ . '/../helpers.php';

require_once __DIR__ . '/../../config/jwt.php';
require_once __DIR__ . '/../middleware/rate_limit.php';

checkRateLimit();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    errorResponse('Método no permitido', 405);
}

$data = getJsonInput();

if (!$data || empty($data['email']) || empty($data['password'])) {
    errorResponse('Email y contraseña son requeridos', 400);
}

$email = filter_var($data['email'], FILTER_SANITIZE_EMAIL);
$password = $data['password'];

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    errorResponse('Email inválido', 400);
}

global $pdo;

$stmt = $pdo->prepare("SELECT id, nombre, email, password, rol, activo FROM usuarios WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user || !verifyPassword($password, $user['password'])) {
    errorResponse('Credenciales incorrectas', 401);
}

if (!$user['activo']) {
    errorResponse('Cuenta desactivada', 403);
}

$accessToken = jwt_encode([
    'user_id' => $user['id'],
    'nombre'  => $user['nombre'],
    'email'   => $user['email'],
    'rol'     => $user['rol']
]);

$refreshToken = generateRefreshToken();

$stmt = $pdo->prepare("INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))");
$stmt->execute([$user['id'], $refreshToken]);

successResponse([
    'access_token'  => $accessToken,
    'refresh_token' => $refreshToken,
    'token_type'    => 'Bearer',
    'expires_in'    => JWT_EXPIRY,
    'user' => [
        'id'     => $user['id'],
        'nombre' => $user['nombre'],
        'email'  => $user['email'],
        'rol'    => $user['rol']
    ]
], null, 200);
