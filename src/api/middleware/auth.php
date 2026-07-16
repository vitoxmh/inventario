<?php

require_once __DIR__ . '/../../config/jwt.php';
require_once __DIR__ . '/../helpers.php';

function getBearerToken() {
    $headers = [];
    
    if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $headers['Authorization'] = $_SERVER['HTTP_AUTHORIZATION'];
    } elseif (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $headers['Authorization'] = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    }
    
    if (!isset($headers['Authorization'])) {
        return null;
    }
    
    if (!preg_match('/Bearer\s(\S+)/i', $headers['Authorization'], $matches)) {
        return null;
    }
    
    return $matches[1];
}

function requireAuth() {
    $token = getBearerToken();
    
    if (!$token) {
        jsonResponse(['error' => 'Token de autenticación requerido'], 401);
    }
    
    $payload = jwt_decode($token);
    
    if (!$payload) {
        jsonResponse(['error' => 'Token inválido o expirado'], 401);
    }
    
    $GLOBALS['auth_user'] = $payload;
    return $payload;
}

function requireAdmin() {
    $payload = requireAuth();
    
    if (!isset($payload['rol']) || $payload['rol'] !== 'admin') {
        jsonResponse(['error' => 'Se requieren permisos de administrador'], 403);
    }
    
    return $payload;
}

function optionalAuth() {
    $token = getBearerToken();
    
    if (!$token) {
        return null;
    }
    
    $payload = jwt_decode($token);
    
    if ($payload) {
        $GLOBALS['auth_user'] = $payload;
    }
    
    return $payload;
}
