<?php

require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../../config/jwt.php';
require_once __DIR__ . '/../middleware/rate_limit.php';

checkRateLimit();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Método no permitido'], 405);
}

$data = getJsonInput();

if (!$data || empty($data['refresh_token'])) {
    jsonResponse(['error' => 'Refresh token requerido'], 400);
}

$refreshToken = $data['refresh_token'];

global $pdo;

$stmt = $pdo->prepare("SELECT rt.id, rt.user_id, u.nombre, u.email, u.rol, u.activo 
                       FROM refresh_tokens rt 
                       JOIN usuarios u ON rt.user_id = u.id 
                       WHERE rt.token = ? AND rt.expires_at > NOW()");
$stmt->execute([$refreshToken]);
$tokenData = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$tokenData) {
    jsonResponse(['error' => 'Refresh token inválido o expirado'], 401);
}

if (!$tokenData['activo']) {
    jsonResponse(['error' => 'Cuenta desactivada'], 403);
}

$stmt = $pdo->prepare("DELETE FROM refresh_tokens WHERE id = ?");
$stmt->execute([$tokenData['id']]);

$newAccessToken = jwt_encode([
    'user_id' => $tokenData['user_id'],
    'nombre'  => $tokenData['nombre'],
    'email'   => $tokenData['email'],
    'rol'     => $tokenData['rol']
]);

$newRefreshToken = generateRefreshToken();

$stmt = $pdo->prepare("INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))");
$stmt->execute([$tokenData['user_id'], $newRefreshToken]);

jsonResponse([
    'access_token'  => $newAccessToken,
    'refresh_token' => $newRefreshToken,
    'token_type'    => 'Bearer',
    'expires_in'    => JWT_EXPIRY
]);
