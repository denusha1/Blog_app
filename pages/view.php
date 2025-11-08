<?php
session_start();
require_once '../php/config.php';

// Get post ID from URL
$postId = isset($_GET['id']) ? intval($_GET['id']) : 0;

if (!$postId) {
    redirect('../index.php');
}

try {
    $db = getDBConnection();
    
    // Get blog post with author information
    $query = "SELECT bp.*, u.username as author_name 
              FROM blog_posts bp 
              JOIN users u ON bp.user_id = u.id 
              WHERE bp.id = ?";
    
    $stmt = $db->prepare($query);
    $stmt->execute([$postId]);
    $post = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$post) {
        redirect('../index.php');
    }
    
} catch (PDOException $e) {
    error_log("Database error: " . $e->getMessage());
    redirect('../index.php');
}

// Check if user is logged in and is the author
$isLoggedIn = isLoggedIn();
$currentUser = $isLoggedIn ? getCurrentUser() : null;
$isAuthor = $isLoggedIn && $currentUser['id'] == $post['user_id'];

// Simple Markdown to HTML converter
function markdownToHtml($text) {
    // Headers
    $text = preg_replace('/^### (.*$)/m', '<h3>$1</h3>', $text);
    $text = preg_replace('/^## (.*$)/m', '<h2>$1</h2>', $text);
    $text = preg_replace('/^# (.*$)/m', '<h1>$1</h1>', $text);
    
    // Bold and Italic
    $text = preg_replace('/\*\*(.*?)\*\*/', '<strong>$1</strong>', $text);
    $text = preg_replace('/\*(.*?)\*/', '<em>$1</em>', $text);
    
    // Links
    $text = preg_replace('/\[([^\]]+)\]\(([^)]+)\)/', '<a href="$2" target="_blank" rel="noopener">$1</a>', $text);
    
    // Code blocks
    $text = preg_replace('/```(.*?)```/s', '<pre><code>$1</code></pre>', $text);
    $text = preg_replace('/`([^`]+)`/', '<code>$1</code>', $text);
    
    // Line breaks
    $text = nl2br($text);
    
    return $text;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo sanitizeOutput($post['title']); ?> - Blog Application</title>
    <link rel="stylesheet" href="../css/style.css">
    <meta name="description" content="<?php echo sanitizeOutput(substr(strip_tags($post['content']), 0, 160)); ?>">
    <meta name="author" content="<?php echo sanitizeOutput($post['author_name']); ?>">
</head>
<body>
    <!-- Header -->
    <header class="header">
        <div class="container">
            <nav class="navbar">
                <div class="logo">
                    <a href="../index.php">BlogApp</a>
                </div>
                
                <button class="mobile-menu-toggle" id="mobileMenuToggle">
                    ☰
                </button>
                
                <ul class="nav-menu" id="navMenu">
                    <li><a href="../index.php" class="nav-link">Home</a></li>
                    <?php if ($isLoggedIn): ?>
                        <li><a href="create.php" class="nav-link">Write Post</a></li>
                        <li><a href="dashboard.php" class="nav-link">My Posts</a></li>
                        <li><a href="profile.php" class="nav-link">Profile</a></li>
                        <li><a href="#" class="nav-link" onclick="logout()">Logout</a></li>
                        <li><span class="nav-link">Welcome, <?php echo sanitizeOutput($currentUser['username']); ?>!</span></li>
                    <?php else: ?>
                        <li><a href="login.php" class="nav-link">Login</a></li>
                        <li><a href="register.php" class="nav-link">Register</a></li>
                    <?php endif; ?>
                </ul>
            </nav>
        </div>
    </header>

    <!-- Main Content -->
    <main class="main-content">
        <div class="container">
            <article class="blog-content">
                <!-- Blog Header -->
                <header class="blog-header">
                    <h1 class="blog-title"><?php echo sanitizeOutput($post['title']); ?></h1>
                    
                    <div class="blog-meta">
                        <span class="blog-author">
                            By <?php echo sanitizeOutput($post['author_name']); ?>
                        </span>
                        <span>•</span>
                        <time datetime="<?php echo $post['created_at']; ?>">
                            <?php echo date('F j, Y \a\t g:i A', strtotime($post['created_at'])); ?>
                        </time>
                        <?php if ($post['updated_at'] && $post['updated_at'] !== $post['created_at']): ?>
                            <span>•</span>
                            <span>Updated <?php echo date('M j, Y', strtotime($post['updated_at'])); ?></span>
                        <?php endif; ?>
                    </div>
                    
                    <?php if ($isAuthor): ?>
                        <div class="blog-actions">
                            <a href="edit.php?id=<?php echo $post['id']; ?>" class="btn btn-secondary">
                                Edit Post
                            </a>
                            <button onclick="deletePost(<?php echo $post['id']; ?>)" class="btn btn-danger">
                                Delete Post
                            </button>
                        </div>
                    <?php endif; ?>
                </header>
                
                <!-- Blog Content -->
                <div class="markdown-content">
                    <?php echo markdownToHtml($post['content']); ?>
                </div>
            </article>
            
            <!-- Navigation -->
            <div class="text-center mt-4">
                <a href="../index.php" class="btn btn-outline">
                    &larr; Back to All Posts
                </a>
                <?php if ($isLoggedIn): ?>
                    <a href="create.php" class="btn btn-primary">
                        Write New Post
                    </a>
                <?php endif; ?>
            </div>
        </div>
    </main>

    <!-- JavaScript -->
    <script src="../js/main.js"></script>
    <script>
        // Delete post function
        function deletePost(postId) {
            if (confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
                fetch('../php/blog.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        action: 'delete',
                        id: postId
                    })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        BlogApp.showAlert('Post deleted successfully!', 'success');
                        setTimeout(() => {
                            window.location.href = '../index.php';
                        }, 1000);
                    } else {
                        BlogApp.showAlert(data.message || 'Failed to delete post.', 'error');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    BlogApp.showAlert('An error occurred. Please try again.', 'error');
                });
            }
        }

        // Logout function
        function logout() {
            Auth.logout().then(success => {
                if (success) {
                    setTimeout(() => {
                        window.location.href = '../index.php';
                    }, 1000);
                }
            });
        }
    </script>
</body>
</html>