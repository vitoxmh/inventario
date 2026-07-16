<?php

define('RATE_LIMIT_DIR', __DIR__ . '/../tmp/rate_limits/');

function getClientIP() {
    $headers = [
        'HTTP_CF_CONNECTING_IP',
        'HTTP_X_FORWARDED_FOR',
        'HTTP_X_REAL_IP',
        'REMOTE_ADDR'
    ];
    
    foreach ($headers as $header) {
        if (!empty($_SERVER[$header])) {
            $ip = explode(',', $_SERVER[$header])[0];
            return trim($ip);
        }
    }
    
    return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
}

function getRateLimitKey($ip, $endpoint) {
    return md5($ip . '_' . $endpoint);
}

function getRateLimitConfig() {
    return [
        'login'     => ['max' => 5,   'window' => 60],
        'register'  => ['max' => 3,   'window' => 3600],
        'refresh'   => ['max' => 10,  'window' => 60],
        'read'      => ['max' => 100, 'window' => 60],
        'write'     => ['max' => 30,  'window' => 60],
    ];
}

function getEndpointCategory($method, $path) {
    if (strpos($path, '/auth/login') !== false) return 'login';
    if (strpos($path, '/auth/register') !== false) return 'register';
    if (strpos($path, '/auth/refresh') !== false) return 'refresh';
    
    if ($method === 'GET') return 'read';
    
    return 'write';
}

function checkRateLimit() {
    if (!is_dir(RATE_LIMIT_DIR)) {
        mkdir(RATE_LIMIT_DIR, 0777, true);
    }
    
    $ip = getClientIP();
    $path = $_SERVER['REQUEST_URI'] ?? '/';
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    
    $category = getEndpointCategory($method, $path);
    $config = getRateLimitConfig();
    
    if (!isset($config[$category])) {
        return true;
    }
    
    $maxRequests = $config[$category]['max'];
    $window = $config[$category]['window'];
    
    $key = getRateLimitKey($ip, $category);
    $filePath = RATE_LIMIT_DIR . $key . '.json';
    
    $now = time();
    $data = ['requests' => [], 'blocked_until' => 0];
    
    if (file_exists($filePath)) {
        $content = file_get_contents($filePath);
        $data = json_decode($content, true) ?: $data;
    }
    
    if (isset($data['blocked_until']) && $data['blocked_until'] > $now) {
        $retryAfter = $data['blocked_until'] - $now;
        header("Retry-After: $retryAfter");
        jsonResponse([
            'error' => 'Demasiadas peticiones. Intenta de nuevo más tarde.',
            'retry_after' => $retryAfter
        ], 429);
    }
    
    $data['requests'] = array_filter($data['requests'], function($timestamp) use ($now, $window) {
        return ($now - $timestamp) < $window;
    });
    
    $data['requests'][] = $now;
    
    if (count($data['requests']) > $maxRequests * 2) {
        $data['blocked_until'] = $now + $window;
        $retryAfter = $window;
        header("Retry-After: $retryAfter");
        jsonResponse([
            'error' => 'Límite de peticiones excedido. Bloqueado temporalmente.',
            'retry_after' => $retryAfter
        ], 429);
    }
    
    file_put_contents($filePath, json_encode($data));
    
    header("X-RateLimit-Limit: $maxRequests");
    header("X-RateLimit-Remaining: " . max(0, $maxRequests - count($data['requests'])));
    header("X-RateLimit-Reset: " . ($now + $window));
    
    return true;
}

function cleanupOldRateLimits() {
    if (!is_dir(RATE_LIMIT_DIR)) return;
    
    $files = glob(RATE_LIMIT_DIR . '*.json');
    $now = time();
    
    foreach ($files as $file) {
        if (filemtime($file) < $now - 86400) {
            unlink($file);
        }
    }
}
