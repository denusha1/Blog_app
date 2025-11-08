<?php
/**
 * Authentication Handler
 * Handles user registration, login, logout, and profile management functionality
 */

require_once 'config.php';

// Set content type for JSON responses
header('Content-Type: application/json');

// Handle different request methods and actions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get JSON input for POST requests
    $input = json_decode(file_get_contents('php://input'), true);
    if ($input) {
        $_POST = array_merge($_POST, $input);
    }
}

$action = $_GET['action'] ?? $_POST['action'] ?? '';

switch ($action) {
    case 'register':
        handleRegistration();
        break;
    case 'login':
        handleLogin();
        break;
    case 'logout':
        handleLogout();
        break;
    case 'check':
        checkAuthStatus();
        break;
    case 'update_profile':
        handleUpdateProfile();
        break;
    case 'change_password':
        handleChangePassword();
        break;
    case 'delete_account':
        handleDeleteAccount();
        break;
    default:
        sendJSONResponse(['success' => false, 'message' => 'Invalid action'], 400);
}

/**
 * Handle user registration
 */
function handleRegistration() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendJSONResponse(['success' => false, 'message' => 'Method not allowed'], 405);
    }
    
    // Get and validate input
    $username = trim($_POST['username'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    $csrf_token = $_POST['csrf_token'] ?? '';
    
    // Validate CSRF token
    if (!verifyCSRFToken($csrf_token)) {
        sendJSONResponse(['success' => false, 'message' => 'Invalid security token'], 403);
    }
    
    // Validate input
    $errors = [];
    
    if (empty($username)) {
        $errors[] = 'Username is required';
    } elseif (strlen($username) < 3 || strlen($username) > 50) {
        $errors[] = 'Username must be between 3 and 50 characters';
    } elseif (!preg_match('/^[a-zA-Z0-9_]+$/', $username)) {
        $errors[] = 'Username can only contain letters, numbers, and underscores';
    }
    
    if (empty($email)) {
        $errors[] = 'Email is required';
    } elseif (!isValidEmail($email)) {
        $errors[] = 'Please enter a valid email address';
    }
    
    if (empty($password)) {
        $errors[] = 'Password is required';
    } else {
        $passwordValidation = validatePassword($password);
        if (!$passwordValidation['valid']) {
            $errors[] = $passwordValidation['message'];
        }
    }
    
    if (!empty($errors)) {
        sendJSONResponse(['success' => false, 'message' => implode('. ', $errors)], 400);
    }
    
    try {
        $pdo = getDBConnection();
        
        // Check if username or email already exists
        $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
        $stmt->execute([$username, $email]);
        
        if ($stmt->fetch()) {
            sendJSONResponse(['success' => false, 'message' => 'Username or email already exists'], 409);
        }
        
        // Hash password
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        
        // Insert new user
        $stmt = $pdo->prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
        $stmt->execute([$username, $email, $hashedPassword]);
        
        sendJSONResponse([
            'success' => true, 
            'message' => 'Registration successful! You can now log in.',
            'redirect' => 'pages/login.php'
        ]);
        
    } catch (Exception $e) {
        logError($e->getMessage(), __FILE__, __LINE__);
        sendJSONResponse(['success' => false, 'message' => 'Registration failed. Please try again.'], 500);
    }
}

/**
 * Handle user login
 */
function handleLogin() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendJSONResponse(['success' => false, 'message' => 'Method not allowed'], 405);
    }
    
    // Get and validate input
    $username = trim($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';
    $csrf_token = $_POST['csrf_token'] ?? '';
    
    // Validate CSRF token
    if (!verifyCSRFToken($csrf_token)) {
        sendJSONResponse(['success' => false, 'message' => 'Invalid security token'], 403);
    }
    
    // Validate input
    if (empty($username) || empty($password)) {
        sendJSONResponse(['success' => false, 'message' => 'Username and password are required'], 400);
    }
    
    try {
        $pdo = getDBConnection();
        
        // Find user by username or email
        $stmt = $pdo->prepare("SELECT id, username, email, password, role, created_at FROM users WHERE username = ? OR email = ?");
        $stmt->execute([$username, $username]);
        $user = $stmt->fetch();
        
        if (!$user || !password_verify($password, $user['password'])) {
            sendJSONResponse(['success' => false, 'message' => 'Invalid username or password'], 401);
        }
        
        // Regenerate session ID for security
        session_regenerate_id(true);
        
        // Set session variables
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['email'] = $user['email'];
        $_SESSION['role'] = $user['role'];
        $_SESSION['created_at'] = $user['created_at'];
        $_SESSION['last_activity'] = time();
        
        sendJSONResponse([
            'success' => true,
            'message' => 'Login successful!',
            'user_id' => $user['id'],
            'username' => $user['username'],
            'redirect' => 'index.php'
        ]);
        
    } catch (Exception $e) {
        logError($e->getMessage(), __FILE__, __LINE__);
        sendJSONResponse(['success' => false, 'message' => 'Login failed. Please try again.'], 500);
    }
}

/**
 * Handle user logout
 */
function handleLogout() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendJSONResponse(['success' => false, 'message' => 'Method not allowed'], 405);
    }
    
    // Destroy session
    session_destroy();
    
    // Clear session cookie
    if (isset($_COOKIE[session_name()])) {
        setcookie(session_name(), '', time() - 3600, '/');
    }
    
    sendJSONResponse([
        'success' => true,
        'message' => 'Logged out successfully',
        'redirect' => 'index.php'
    ]);
}

/**
 * Check authentication status
 */
function checkAuthStatus() {
    if (isLoggedIn()) {
        $user = getCurrentUser();
        sendJSONResponse([
            'success' => true,
            'authenticated' => true,
            'user' => $user
        ]);
    } else {
        sendJSONResponse([
            'success' => true,
            'authenticated' => false
        ]);
    }
}

/**
 * Handle profile update
 */
function handleUpdateProfile() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendJSONResponse(['success' => false, 'message' => 'Method not allowed'], 405);
    }
    
    if (!isLoggedIn()) {
        sendJSONResponse(['success' => false, 'message' => 'Authentication required'], 401);
    }
    
    $currentUser = getCurrentUser();
    $username = trim($_POST['username'] ?? '');
    $email = trim($_POST['email'] ?? '');
    
    // Validate input
    $errors = [];
    
    if (empty($username)) {
        $errors[] = 'Username is required';
    } elseif (strlen($username) < 3 || strlen($username) > 50) {
        $errors[] = 'Username must be between 3 and 50 characters';
    } elseif (!preg_match('/^[a-zA-Z0-9_]+$/', $username)) {
        $errors[] = 'Username can only contain letters, numbers, and underscores';
    }
    
    if (empty($email)) {
        $errors[] = 'Email is required';
    } elseif (!isValidEmail($email)) {
        $errors[] = 'Please enter a valid email address';
    }
    
    if (!empty($errors)) {
        sendJSONResponse(['success' => false, 'message' => implode('. ', $errors)], 400);
    }
    
    try {
        $pdo = getDBConnection();
        
        // Check if username or email already exists (excluding current user)
        $stmt = $pdo->prepare("SELECT id FROM users WHERE (username = ? OR email = ?) AND id != ?");
        $stmt->execute([$username, $email, $currentUser['id']]);
        
        if ($stmt->fetch()) {
            sendJSONResponse(['success' => false, 'message' => 'Username or email already exists'], 409);
        }
        
        // Update user profile
        $stmt = $pdo->prepare("UPDATE users SET username = ?, email = ? WHERE id = ?");
        $stmt->execute([$username, $email, $currentUser['id']]);
        
        // Update session variables
        $_SESSION['username'] = $username;
        $_SESSION['email'] = $email;
        
        sendJSONResponse([
            'success' => true,
            'message' => 'Profile updated successfully!'
        ]);
        
    } catch (Exception $e) {
        logError($e->getMessage(), __FILE__, __LINE__);
        sendJSONResponse(['success' => false, 'message' => 'Failed to update profile. Please try again.'], 500);
    }
}

/**
 * Handle password change
 */
function handleChangePassword() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendJSONResponse(['success' => false, 'message' => 'Method not allowed'], 405);
    }
    
    if (!isLoggedIn()) {
        sendJSONResponse(['success' => false, 'message' => 'Authentication required'], 401);
    }
    
    $currentUser = getCurrentUser();
    $currentPassword = $_POST['currentPassword'] ?? '';
    $newPassword = $_POST['newPassword'] ?? '';
    $confirmPassword = $_POST['confirmPassword'] ?? '';
    
    // Validate input
    $errors = [];
    
    if (empty($currentPassword)) {
        $errors[] = 'Current password is required';
    }
    
    if (empty($newPassword)) {
        $errors[] = 'New password is required';
    } else {
        $passwordValidation = validatePassword($newPassword);
        if (!$passwordValidation['valid']) {
            $errors[] = $passwordValidation['message'];
        }
    }
    
    if ($newPassword !== $confirmPassword) {
        $errors[] = 'New passwords do not match';
    }
    
    if (!empty($errors)) {
        sendJSONResponse(['success' => false, 'message' => implode('. ', $errors)], 400);
    }
    
    try {
        $pdo = getDBConnection();
        
        // Get current user's password
        $stmt = $pdo->prepare("SELECT password FROM users WHERE id = ?");
        $stmt->execute([$currentUser['id']]);
        $user = $stmt->fetch();
        
        if (!$user || !password_verify($currentPassword, $user['password'])) {
            sendJSONResponse(['success' => false, 'message' => 'Current password is incorrect'], 401);
        }
        
        // Hash new password
        $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
        
        // Update password
        $stmt = $pdo->prepare("UPDATE users SET password = ? WHERE id = ?");
        $stmt->execute([$hashedPassword, $currentUser['id']]);
        
        sendJSONResponse([
            'success' => true,
            'message' => 'Password changed successfully!'
        ]);
        
    } catch (Exception $e) {
        logError($e->getMessage(), __FILE__, __LINE__);
        sendJSONResponse(['success' => false, 'message' => 'Failed to change password. Please try again.'], 500);
    }
}

/**
 * Handle account deletion
 */
function handleDeleteAccount() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendJSONResponse(['success' => false, 'message' => 'Method not allowed'], 405);
    }
    
    if (!isLoggedIn()) {
        sendJSONResponse(['success' => false, 'message' => 'Authentication required'], 401);
    }
    
    $currentUser = getCurrentUser();
    
    try {
        $pdo = getDBConnection();
        
        // Start transaction
        $pdo->beginTransaction();
        
        // Delete user's blog posts first (due to foreign key constraint)
        $stmt = $pdo->prepare("DELETE FROM blog_posts WHERE user_id = ?");
        $stmt->execute([$currentUser['id']]);
        
        // Delete user account
        $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
        $stmt->execute([$currentUser['id']]);
        
        // Commit transaction
        $pdo->commit();
        
        // Destroy session
        session_destroy();
        
        // Clear session cookie
        if (isset($_COOKIE[session_name()])) {
            setcookie(session_name(), '', time() - 3600, '/');
        }
        
        sendJSONResponse([
            'success' => true,
            'message' => 'Account deleted successfully'
        ]);
        
    } catch (Exception $e) {
        // Rollback transaction on error
        if ($pdo->inTransaction()) {
            $pdo->rollback();
        }
        
        logError($e->getMessage(), __FILE__, __LINE__);
        sendJSONResponse(['success' => false, 'message' => 'Failed to delete account. Please try again.'], 500);
    }
}
?>