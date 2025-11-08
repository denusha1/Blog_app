<?php
// =========================
// PHP Error Reporting ON
// =========================
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

/**
 * Database Configuration File
 * InfinityFree Hosting Only
 */

// Load environment variables from .env file
function loadEnv($path = __DIR__ . '/.env') {
    if (!file_exists($path)) {
        die("⚠️ .env file not found at: $path");
    }
    
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        // Skip comments
        if (strpos(trim($line), '#') === 0) {
            continue;
        }
        
        // Parse KEY=VALUE
        if (strpos($line, '=') !== false) {
            list($key, $value) = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value);
            
            // Remove quotes if present
            $value = trim($value, '"\'');
            
            // Set environment variable
            if (!array_key_exists($key, $_ENV)) {
                $_ENV[$key] = $value;
                putenv("$key=$value");
            }
        }
    }
}

// Load environment variables
loadEnv();

// Helper function to get environment variable
function env($key, $default = null) {
    $value = getenv($key);
    if ($value === false) {
        return $default;
    }
    return $value;
}

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Database configuration - Now loaded from .env
define('DB_HOST', env('DB_HOST', 'localhost'));
define('DB_NAME', env('DB_NAME', ''));
define('DB_USER', env('DB_USER', ''));
define('DB_PASS', env('DB_PASS', ''));
define('DB_PORT', env('DB_PORT', '3306'));
define('DB_CHARSET', env('DB_CHARSET', 'utf8mb4'));

// Security configuration
define('CSRF_TOKEN_NAME', env('CSRF_TOKEN_NAME', 'csrf_token'));
define('SESSION_TIMEOUT', (int)env('SESSION_TIMEOUT', 3600)); // 1 hour

/**
 * Get DB connection using PDO
 */
function getDBConnection() {
    static $pdo = null;
    
    if ($pdo === null) {
        try {
            $dsn = "mysql:host=".DB_HOST.";port=".DB_PORT.";dbname=".DB_NAME.";charset=".DB_CHARSET;
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ];
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            // Show full error with line number
            die("⚠️ Database Connection Failed: " . $e->getMessage() . " in " . $e->getFile() . " on line " . $e->getLine());
        }
    }
    
    return $pdo;
}

/** CSRF Token */
function generateCSRFToken() {
    if (!isset($_SESSION[CSRF_TOKEN_NAME])) {
        $_SESSION[CSRF_TOKEN_NAME] = bin2hex(random_bytes(32));
    }
    return $_SESSION[CSRF_TOKEN_NAME];
}

function verifyCSRFToken($token) {
    return isset($_SESSION[CSRF_TOKEN_NAME]) && hash_equals($_SESSION[CSRF_TOKEN_NAME], $token);
}

/** XSS Protection */
function sanitizeOutput($string) {
    return htmlspecialchars($string, ENT_QUOTES, 'UTF-8');
}

/** Email Validation */
function isValidEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

/** Password Strength */
function validatePassword($password) {
    $errors = [];
    if (strlen($password) < 8) $errors[] = "Min 8 characters required";
    if (!preg_match('/[A-Z]/', $password)) $errors[] = "Include at least 1 uppercase letter";
    if (!preg_match('/[a-z]/', $password)) $errors[] = "Include at least 1 lowercase letter";
    if (!preg_match('/[0-9]/', $password)) $errors[] = "Include at least 1 number";
    
    return [
        'valid' => empty($errors),
        'message' => implode('. ', $errors)
    ];
}

/** User Login Check */
function isLoggedIn() {
    return isset($_SESSION['user_id']) &&
           isset($_SESSION['username']) &&
           isset($_SESSION['last_activity']) &&
           (time() - $_SESSION['last_activity']) < SESSION_TIMEOUT;
}

/** Get logged user */
function getCurrentUser() {
    if (!isLoggedIn()) return null;
    
    return [
        'id' => $_SESSION['user_id'],
        'username' => $_SESSION['username'],
        'email' => $_SESSION['email'] ?? '',
        'role' => $_SESSION['role'] ?? 'user',
        'created_at' => $_SESSION['created_at'] ?? date('Y-m-d H:i:s'),
    ];
}

/** Update last activity */
function updateLastActivity() {
    if (isLoggedIn()) $_SESSION['last_activity'] = time();
}

/** Redirect */
function redirect($url) {
    header("Location: $url");
    exit();
}

/** JSON Response */
function sendJSONResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit();
}

/** Error Logger */
function logError($message, $file = '', $line = 0) {
    $timestamp = date('Y-m-d H:i:s');
    error_log("[$timestamp] ERROR: $message in $file:$line");
}

// Auto-update last activity
updateLastActivity();
?>