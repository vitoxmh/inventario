<?php

require_once __DIR__ . '/headers.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/middleware/sanitize.php';
require_once __DIR__ . '/middleware/rate_limit.php';

header('Content-Type: application/json');

function getPaginationParams() {
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
    $search = isset($_GET['search']) ? $_GET['search'] : '';
    
    $page = max(1, $page);
    $limit = max(1, min(100, $limit));
    $offset = ($page - 1) * $limit;
    
    return ['page' => $page, 'limit' => $limit, 'offset' => $offset, 'search' => $search];
}

function getPaginatedResponse($pdo, $countSql, $dataSql, $params, $search = '', $limit = 20, $offset = 0) {
    $countStmt = $pdo->prepare($countSql);
    if ($search) {
        $countStmt->bindValue(':search', "%$search%", PDO::PARAM_STR);
    }
    foreach ($params as $key => $value) {
        $countStmt->bindValue($key, $value);
    }
    $countStmt->execute();
    $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    $stmt = $pdo->prepare($dataSql);
    if ($search) {
        $stmt->bindValue(':search', "%$search%", PDO::PARAM_STR);
    }
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    return [
        'data' => $data,
        'pagination' => [
            'page' => (int)($offset / $limit) + 1,
            'limit' => (int)$limit,
            'total' => (int)$total,
            'totalPages' => ceil($total / $limit)
        ]
    ];
}

function generateIdImagen() {
    return bin2hex(random_bytes(16));
}

function getImageUrl($pdo, $juego_id, $tipo = '0') {
    $stmt = $pdo->prepare("SELECT archivo FROM imagenes WHERE tipo = ? AND juego_id = ? ORDER BY id DESC LIMIT 1");
    $stmt->execute([$tipo, $juego_id]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    return $result ? $result['archivo'] : null;
}

function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data);
    exit;
}

function successResponse($data = null, $message = null, $statusCode = 200) {
    $response = ['success' => true];
    if ($message) $response['message'] = $message;
    if ($data !== null) $response['data'] = $data;
    jsonResponse($response, $statusCode);
}

function errorResponse($message, $statusCode = 400, $details = null) {
    $response = ['success' => false, 'error' => $message];
    if ($details) $response['details'] = $details;
    jsonResponse($response, $statusCode);
}

function paginatedResponse($data, $pagination, $statusCode = 200) {
    jsonResponse([
        'success' => true,
        'data' => $data,
        'pagination' => $pagination
    ], $statusCode);
}

function requireId($id, $errorMsg = 'ID requerido') {
    if (!$id) {
        jsonResponse(['error' => $errorMsg], 400);
    }
}

function getJsonInput() {
    return sanitizeJsonInput();
}

function validateRequired($data, $field, $errorMsg = null) {
    if (!isset($data[$field]) || empty($data[$field])) {
        $errorMsg = $errorMsg ?? "$field es requerido";
        jsonResponse(['error' => $errorMsg], 400);
    }
}
