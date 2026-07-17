<?php

function loadEnv($path = null) {
    if ($path === null) {
        $path = __DIR__ . '/../../.env';
    }

    if (!file_exists($path)) {
        return;
    }

    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    
    foreach ($lines as $line) {
        $line = trim($line);
        
        if (empty($line) || $line[0] === '#') {
            continue;
        }

        if (strpos($line, '=') === false) {
            continue;
        }

        list($key, $value) = explode('=', $line, 2);
        
        $key = trim($key);
        $value = trim($value);
        
        $value = preg_replace('/^["\']|["\']$/', '', $value);
        
        $_ENV[$key] = $value;
        putenv("$key=$value");
    }
}

function env($key, $default = null) {
    $value = getenv($key);
    
    if ($value === false) {
        return $default;
    }
    
    switch (strtolower($value)) {
        case 'true':
        case '(true)':
            return true;
        case 'false':
        case '(false)':
            return false;
        case 'null':
        case '(null)':
            return null;
        case 'empty':
        case '(empty)':
            return '';
    }
    
    if (is_numeric($value)) {
        return $value + 0;
    }
    
    return $value;
}
