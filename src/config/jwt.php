<?php

require_once __DIR__ . '/env.php';

loadEnv();

define('JWT_SECRET', env('JWT_SECRET', 'xK#9mP$2vL!nQ@7wR#4tY@8uI@3oP@6aS@1dF@5gH'));
define('JWT_EXPIRY', env('JWT_EXPIRY', 900));
define('REFRESH_EXPIRY', env('REFRESH_EXPIRY', 604800));
define('JWT_ISSUER', env('JWT_ISSUER', 'inventario-api'));

function base64url_encode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64url_decode($data) {
    return base64_decode(str_pad(strtr($data, '-_', '+/'), strlen($data) % 4, '=', STR_PAD_RIGHT));
}

function jwt_encode($payload) {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload['iat'] = time();
    $payload['exp'] = time() + JWT_EXPIRY;
    $payload['iss'] = JWT_ISSUER;
    $payload = json_encode($payload);
    
    $base64Header = base64url_encode($header);
    $base64Payload = base64url_encode($payload);
    $signature = hash_hmac('sha256', "$base64Header.$base64Payload", JWT_SECRET, true);
    $base64Signature = base64url_encode($signature);
    
    return "$base64Header.$base64Payload.$base64Signature";
}

function jwt_decode($token) {
    $parts = explode('.', $token);
    if (count($parts) !== 3) {
        return null;
    }
    
    list($base64Header, $base64Payload, $base64Signature) = $parts;
    
    $signature = base64url_decode($base64Signature);
    $expectedSig = hash_hmac('sha256', "$base64Header.$base64Payload", JWT_SECRET, true);
    
    if (!hash_equals($expectedSig, $signature)) {
        return null;
    }
    
    $payload = json_decode(base64url_decode($base64Payload), true);
    
    if (!$payload || !isset($payload['exp']) || $payload['exp'] < time()) {
        return null;
    }
    
    if (isset($payload['iss']) && $payload['iss'] !== JWT_ISSUER) {
        return null;
    }
    
    return $payload;
}

function generateRefreshToken() {
    return bin2hex(random_bytes(32));
}

function hashPassword($password) {
    return password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
}

function verifyPassword($password, $hash) {
    return password_verify($password, $hash);
}
