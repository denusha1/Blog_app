<?php
/**
 * Blog Management Handler
 * Handles CRUD operations for blog posts
 */

require_once 'config.php';

// Set content type for JSON responses
header('Content-Type: application/json');

// Enable CORS if needed
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Get JSON input for POST requests
$input = null;
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $rawInput = file_get_contents('php://input');
    if (!empty($rawInput)) {
        $input = json_decode($rawInput, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            sendJSONResponse(['success' => false, 'message' => 'Invalid JSON data'], 400);
        }
    }
}

// Handle different actions - check both GET and JSON input
$action = $_GET['action'] ?? ($input['action'] ?? '');

switch ($action) {
    case 'create':
        createBlogPost($input);
        break;
    case 'read':
        readBlogPosts();
        break;
    case 'read_single':
        readSingleBlogPost();
        break;
    case 'update':
        updateBlogPost($input);
        break;
    case 'delete':
        deleteBlogPost($input);
        break;
    case 'user_posts':
        getUserBlogPosts();
        break;
    default:
        sendJSONResponse(['success' => false, 'message' => 'Invalid action'], 400);
}

/**
 * Create a new blog post
 */
function createBlogPost($input = null) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendJSONResponse(['success' => false, 'message' => 'Method not allowed'], 405);
    }
    
    // Check authentication
    if (!isLoggedIn()) {
        sendJSONResponse(['success' => false, 'message' => 'Authentication required'], 401);
    }
    
    // Get and validate input - support both JSON and form data
    $title = '';
    $content = '';
    $csrf_token = '';
    
    if ($input && is_array($input)) {
        // JSON input
        $title = trim($input['title'] ?? '');
        $content = trim($input['content'] ?? '');
        $csrf_token = $input['csrf_token'] ?? '';
    } else {
        // Form data
        $title = trim($_POST['title'] ?? '');
        $content = trim($_POST['content'] ?? '');
        $csrf_token = $_POST['csrf_token'] ?? '';
    }
    
    // For now, skip CSRF validation for JSON requests (we'll add session-based auth)
    // TODO: Implement proper CSRF for JSON requests
    if (!$input && !verifyCSRFToken($csrf_token)) {
        sendJSONResponse(['success' => false, 'message' => 'Invalid security token'], 403);
    }
    
    // Validate input
    $errors = [];
    
    if (empty($title)) {
        $errors[] = 'Title is required and must be at least 5 characters long';
    } elseif (strlen($title) < 5) {
        $errors[] = 'Title must be at least 5 characters long';
    } elseif (strlen($title) > 255) {
        $errors[] = 'Title must be less than 255 characters';
    }
    
    if (empty($content)) {
        $errors[] = 'Content is required and must be at least 50 characters long';
    } elseif (strlen($content) < 50) {
        $errors[] = 'Content must be at least 50 characters long';
    }
    
    if (!empty($errors)) {
        sendJSONResponse(['success' => false, 'message' => implode('. ', $errors)], 400);
    }
    
    try {
        $pdo = getDBConnection();
        $user = getCurrentUser();
        
        // Insert new blog post
        $stmt = $pdo->prepare("INSERT INTO blog_posts (user_id, title, content, created_at, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)");
        $stmt->execute([$user['id'], $title, $content]);
        
        $postId = $pdo->lastInsertId();
        
        sendJSONResponse([
            'success' => true,
            'message' => 'Blog post created successfully!',
            'post_id' => $postId
        ]);
        
    } catch (Exception $e) {
        logError($e->getMessage(), __FILE__, __LINE__);
        sendJSONResponse(['success' => false, 'message' => 'Failed to create blog post. Please try again.'], 500);
    }
}

/**
 * Read all blog posts (with pagination)
 */
function readBlogPosts() {
    $page = max(1, intval($_GET['page'] ?? 1));
    $limit = 10; // Posts per page
    $offset = ($page - 1) * $limit;
    
    try {
        $pdo = getDBConnection();
        
        // Get total count
        $countStmt = $pdo->query("SELECT COUNT(*) as total FROM blog_posts");
        $totalPosts = $countStmt->fetch()['total'];
        $totalPages = ceil($totalPosts / $limit);
        
        // Get blog posts with user information
        $stmt = $pdo->prepare("
            SELECT bp.id, bp.title, bp.content, bp.created_at, bp.updated_at,
                   u.username, u.id as user_id
            FROM blog_posts bp
            JOIN users u ON bp.user_id = u.id
            ORDER BY bp.created_at DESC
            LIMIT ? OFFSET ?
        ");
        $stmt->execute([$limit, $offset]);
        $posts = $stmt->fetchAll();
        
        // Add excerpt to each post
        foreach ($posts as &$post) {
            $post['excerpt'] = createExcerpt($post['content'], 150);
            $post['title'] = sanitizeOutput($post['title']);
            $post['username'] = sanitizeOutput($post['username']);
        }
        
        sendJSONResponse([
            'success' => true,
            'posts' => $posts,
            'pagination' => [
                'current_page' => $page,
                'total_pages' => $totalPages,
                'total_posts' => $totalPosts,
                'has_next' => $page < $totalPages,
                'has_prev' => $page > 1
            ]
        ]);
        
    } catch (Exception $e) {
        logError($e->getMessage(), __FILE__, __LINE__);
        sendJSONResponse(['success' => false, 'message' => 'Failed to load blog posts'], 500);
    }
}

/**
 * Read a single blog post
 */
function readSingleBlogPost() {
    $postId = intval($_GET['id'] ?? 0);
    
    if ($postId <= 0) {
        sendJSONResponse(['success' => false, 'message' => 'Invalid post ID'], 400);
    }
    
    try {
        $pdo = getDBConnection();
        
        // Get blog post with user information
        $stmt = $pdo->prepare("
            SELECT bp.id, bp.title, bp.content, bp.created_at, bp.updated_at,
                   u.username, u.id as user_id
            FROM blog_posts bp
            JOIN users u ON bp.user_id = u.id
            WHERE bp.id = ?
        ");
        $stmt->execute([$postId]);
        $post = $stmt->fetch();
        
        if (!$post) {
            sendJSONResponse(['success' => false, 'message' => 'Blog post not found'], 404);
        }
        
        // Sanitize output
        $post['title'] = sanitizeOutput($post['title']);
        $post['username'] = sanitizeOutput($post['username']);
        
        // Check if current user can edit this post
        $currentUser = getCurrentUser();
        $post['can_edit'] = $currentUser && ($currentUser['id'] == $post['user_id'] || $currentUser['role'] === 'admin');
        
        sendJSONResponse([
            'success' => true,
            'post' => $post
        ]);
        
    } catch (Exception $e) {
        logError($e->getMessage(), __FILE__, __LINE__);
        sendJSONResponse(['success' => false, 'message' => 'Failed to load blog post'], 500);
    }
}

/**
 * Update a blog post
 */
function updateBlogPost($input = null) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendJSONResponse(['success' => false, 'message' => 'Method not allowed'], 405);
    }
    
    // Check authentication
    if (!isLoggedIn()) {
        sendJSONResponse(['success' => false, 'message' => 'Authentication required'], 401);
    }
    
    // Get and validate input - support both JSON and form data
    $postId = 0;
    $title = '';
    $content = '';
    $csrf_token = '';
    
    if ($input && is_array($input)) {
        // JSON input
        $postId = intval($input['id'] ?? 0);
        $title = trim($input['title'] ?? '');
        $content = trim($input['content'] ?? '');
        $csrf_token = $input['csrf_token'] ?? '';
    } else {
        // Form data
        $postId = intval($_POST['post_id'] ?? 0);
        $title = trim($_POST['title'] ?? '');
        $content = trim($_POST['content'] ?? '');
        $csrf_token = $_POST['csrf_token'] ?? '';
    }
    
    // For now, skip CSRF validation for JSON requests (we'll add session-based auth)
    // TODO: Implement proper CSRF for JSON requests
    if (!$input && !verifyCSRFToken($csrf_token)) {
        sendJSONResponse(['success' => false, 'message' => 'Invalid security token'], 403);
    }
    
    // Validate input
    $errors = [];
    
    if ($postId <= 0) {
        $errors[] = 'Invalid post ID';
    }
    
    if (empty($title)) {
        $errors[] = 'Title is required and must be at least 5 characters long';
    } elseif (strlen($title) < 5) {
        $errors[] = 'Title must be at least 5 characters long';
    } elseif (strlen($title) > 255) {
        $errors[] = 'Title must be less than 255 characters';
    }
    
    if (empty($content)) {
        $errors[] = 'Content is required and must be at least 50 characters long';
    } elseif (strlen($content) < 50) {
        $errors[] = 'Content must be at least 50 characters long';
    }
    
    if (!empty($errors)) {
        sendJSONResponse(['success' => false, 'message' => implode('. ', $errors)], 400);
    }
    
    try {
        $pdo = getDBConnection();
        $user = getCurrentUser();
        
        // Check if post exists and user has permission to edit
        $stmt = $pdo->prepare("SELECT user_id FROM blog_posts WHERE id = ?");
        $stmt->execute([$postId]);
        $post = $stmt->fetch();
        
        if (!$post) {
            sendJSONResponse(['success' => false, 'message' => 'Blog post not found'], 404);
        }
        
        if ($post['user_id'] != $user['id'] && $user['role'] !== 'admin') {
            sendJSONResponse(['success' => false, 'message' => 'You do not have permission to edit this post'], 403);
        }
        
        // Update blog post
        $stmt = $pdo->prepare("UPDATE blog_posts SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
        $stmt->execute([$title, $content, $postId]);
        
        sendJSONResponse([
            'success' => true,
            'message' => 'Blog post updated successfully!',
            'post_id' => $postId
        ]);
        
    } catch (Exception $e) {
        logError($e->getMessage(), __FILE__, __LINE__);
        sendJSONResponse(['success' => false, 'message' => 'Failed to update blog post. Please try again.'], 500);
    }
}

/**
 * Delete a blog post
 */
function deleteBlogPost($input = null) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendJSONResponse(['success' => false, 'message' => 'Method not allowed'], 405);
    }
    
    // Check authentication
    if (!isLoggedIn()) {
        sendJSONResponse(['success' => false, 'message' => 'Authentication required'], 401);
    }
    
    // Get and validate input - support both JSON and form data
    $postId = 0;
    $csrf_token = '';
    
    if ($input && is_array($input)) {
        // JSON input
        $postId = intval($input['id'] ?? 0);
        $csrf_token = $input['csrf_token'] ?? '';
    } else {
        // Form data
        $postId = intval($_POST['post_id'] ?? 0);
        $csrf_token = $_POST['csrf_token'] ?? '';
    }
    
    // For now, skip CSRF validation for JSON requests (we'll add session-based auth)
    // TODO: Implement proper CSRF for JSON requests
    if (!$input && !verifyCSRFToken($csrf_token)) {
        sendJSONResponse(['success' => false, 'message' => 'Invalid security token'], 403);
    }
    
    if ($postId <= 0) {
        sendJSONResponse(['success' => false, 'message' => 'Invalid post ID'], 400);
    }
    
    try {
        $pdo = getDBConnection();
        $user = getCurrentUser();
        
        // Check if post exists and user has permission to delete
        $stmt = $pdo->prepare("SELECT user_id, title FROM blog_posts WHERE id = ?");
        $stmt->execute([$postId]);
        $post = $stmt->fetch();
        
        if (!$post) {
            sendJSONResponse(['success' => false, 'message' => 'Blog post not found'], 404);
        }
        
        if ($post['user_id'] != $user['id'] && $user['role'] !== 'admin') {
            sendJSONResponse(['success' => false, 'message' => 'You do not have permission to delete this post'], 403);
        }
        
        // Delete blog post
        $stmt = $pdo->prepare("DELETE FROM blog_posts WHERE id = ?");
        $stmt->execute([$postId]);
        
        sendJSONResponse([
            'success' => true,
            'message' => 'Blog post "' . sanitizeOutput($post['title']) . '" has been deleted successfully!'
        ]);
        
    } catch (Exception $e) {
        logError($e->getMessage(), __FILE__, __LINE__);
        sendJSONResponse(['success' => false, 'message' => 'Failed to delete blog post. Please try again.'], 500);
    }
}

/**
 * Get blog posts for current user
 */
function getUserBlogPosts() {
    if (!isLoggedIn()) {
        sendJSONResponse(['success' => false, 'message' => 'Authentication required'], 401);
    }
    
    try {
        $pdo = getDBConnection();
        $user = getCurrentUser();
        
        // Get user's blog posts
        $stmt = $pdo->prepare("
            SELECT id, title, content, created_at, updated_at
            FROM blog_posts
            WHERE user_id = ?
            ORDER BY created_at DESC
        ");
        $stmt->execute([$user['id']]);
        $posts = $stmt->fetchAll();
        
        // Add excerpt to each post
        foreach ($posts as &$post) {
            $post['excerpt'] = createExcerpt($post['content'], 150);
            $post['title'] = sanitizeOutput($post['title']);
        }
        
        sendJSONResponse([
            'success' => true,
            'posts' => $posts
        ]);
        
    } catch (Exception $e) {
        logError($e->getMessage(), __FILE__, __LINE__);
        sendJSONResponse(['success' => false, 'message' => 'Failed to load your blog posts'], 500);
    }
}

/**
 * Create excerpt from content
 * @param string $content Full content
 * @param int $length Maximum length
 * @return string Excerpt
 */
function createExcerpt($content, $length = 150) {
    // Remove markdown formatting for excerpt
    $text = preg_replace('/[#*`_\[\]()>-]/', '', $content);
    $text = strip_tags($text);
    $text = trim($text);
    
    if (strlen($text) <= $length) {
        return $text;
    }
    
    $excerpt = substr($text, 0, $length);
    $lastSpace = strrpos($excerpt, ' ');
    
    if ($lastSpace !== false) {
        $excerpt = substr($excerpt, 0, $lastSpace);
    }
    
    return $excerpt . '...';
}
?>
