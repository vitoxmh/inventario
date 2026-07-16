<?php

function sanitizeString($input) {
    if (is_array($input)) {
        return array_map('sanitizeString', $input);
    }
    
    $input = strip_tags($input);
    $input = htmlspecialchars($input, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    $input = trim($input);
    
    return $input;
}

function sanitizeEmail($input) {
    $input = trim($input);
    $input = filter_var($input, FILTER_SANITIZE_EMAIL);
    return $input;
}

function sanitizeInt($input) {
    return filter_var($input, FILTER_SANITIZE_NUMBER_INT);
}

function sanitizeFloat($input) {
    return filter_var($input, FILTER_SANITIZE_NUMBER_FLOAT, FILTER_FLAG_ALLOW_FRACTION);
}

function sanitizeArray($input) {
    $sanitized = [];
    
    foreach ($input as $key => $value) {
        $cleanKey = sanitizeString($key);
        
        if (is_array($value)) {
            $sanitized[$cleanKey] = sanitizeArray($value);
        } elseif (is_string($value)) {
            $sanitized[$cleanKey] = sanitizeString($value);
        } else {
            $sanitized[$cleanKey] = $value;
        }
    }
    
    return $sanitized;
}

function sanitizeJsonInput() {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    
    if (!is_array($data)) {
        return null;
    }
    
    return sanitizeArray($data);
}
