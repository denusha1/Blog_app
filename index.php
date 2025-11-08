<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

session_start();
require_once 'php/config.php';

// Get current page for pagination
$page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
$limit = 6; // Posts per page
$offset = ($page - 1) * $limit;

// Get search query if provided
$search = isset($_GET['search']) ? trim($_GET['search']) : '';

try {
    $db = getDBConnection();
    
    // Build query based on search
    $whereClause = '';
    $params = [];
    
    if (!empty($search)) {
        $whereClause = "WHERE bp.title LIKE ? OR bp.content LIKE ?";
        $params = ["%$search%", "%$search%"];
    }
    
    // Get total count for pagination
    $countQuery = "SELECT COUNT(*) as total FROM blog_posts bp $whereClause";
    $countStmt = $db->prepare($countQuery);
    if (!empty($params)) {
        $countStmt->execute($params);
    } else {
        $countStmt->execute();
    }
    $totalPosts = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];
    $totalPages = ceil($totalPosts / $limit);
    
    // Get blog posts with author information
    $query = "SELECT bp.*, u.username as author_name 
              FROM blog_posts bp 
              JOIN users u ON bp.user_id = u.id 
              $whereClause
              ORDER BY bp.created_at DESC 
              LIMIT ? OFFSET ?";
    
    $stmt = $db->prepare($query);
    $executeParams = array_merge($params, [$limit, $offset]);
    $stmt->execute($executeParams);
    $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
} catch (PDOException $e) {
    error_log("Database error: " . $e->getMessage());
    $posts = [];
    $totalPages = 0;
}

// Check if user is logged in
$isLoggedIn = isLoggedIn();
$currentUser = $isLoggedIn ? getCurrentUser() : null;
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Blog Application - Home</title>
    <link rel="stylesheet" href="css/style.css">
    <meta name="description" content="A modern blog application with user authentication and content management">
</head>
<body>
    <!-- Header -->
    <header class="header">
        <div class="container">
            <nav class="navbar">
                <div class="logo">
                    <a href="index.php">BlogApp</a>
                </div>
                
                <button class="mobile-menu-toggle" id="mobileMenuToggle" aria-label="Open menu">
                    ☰
                </button>
                
                <ul class="nav-menu" id="navMenu">
                    <li><a href="index.php" class="nav-link active">Home</a></li>
                    <?php if ($isLoggedIn): ?>
                        <li><a href="pages/create.php" class="nav-link">Write Post</a></li>
                        <li><a href="pages/dashboard.php" class="nav-link">My Posts</a></li>
                        <li><a href="pages/profile.php" class="nav-link">Profile</a></li>
                        <li><a href="#" class="nav-link" onclick="logout(); return false;">Logout</a></li>
                        <li><span class="nav-link">Welcome, <?php echo sanitizeOutput($currentUser['username']); ?>!</span></li>
                    <?php else: ?>
                        <li><a href="pages/login.php" class="nav-link">Login</a></li>
                        <li><a href="pages/register.php" class="nav-link">Register</a></li>
                    <?php endif; ?>
                </ul>
            </nav>
        </div>
    </header>

    <!-- Main Content -->
    <main class="main-content">
        <div class="container">
            <!-- Hero Section -->
            <section class="hero text-center mb-4">
                <h1>Welcome to BlogApp</h1>
                <p>Discover amazing stories, share your thoughts, and connect with writers from around the world.</p>
                <?php if (!$isLoggedIn): ?>
                    <div class="mt-4">
                        <a href="pages/register.php" class="btn btn-primary btn-large">Get Started</a>
                        <a href="pages/login.php" class="btn btn-outline btn-large">Sign In</a>
                    </div>
                <?php endif; ?>
            </section>

            <!-- Search Section -->
            <section class="search-section mb-4">
                <div class="form-container" style="max-width: 600px;">
                    <form method="GET" action="index.php" class="flex gap-2">
                        <input 
                            type="text" 
                            name="search" 
                            class="form-input" 
                            placeholder="Search blog posts..." 
                            value="<?php echo sanitizeOutput($search); ?>"
                            style="margin-bottom: 0;"
                        >
                        <button type="submit" class="btn btn-primary">Search</button>
                        <?php if (!empty($search)): ?>
                            <a href="index.php" class="btn btn-secondary">Clear</a>
                        <?php endif; ?>
                    </form>
                </div>
            </section>

            <!-- Search Results Info -->
            <?php if (!empty($search)): ?>
                <div class="alert alert-info">
                    <?php if ($totalPosts > 0): ?>
                        Found <?php echo $totalPosts; ?> post<?php echo $totalPosts !== 1 ? 's' : ''; ?> for "<?php echo sanitizeOutput($search); ?>"
                    <?php else: ?>
                        No posts found for "<?php echo sanitizeOutput($search); ?>". <a href="index.php">View all posts</a>
                    <?php endif; ?>
                </div>
            <?php endif; ?>

            <!-- Blog Posts Grid -->
            <section class="blog-posts">
                <?php if (empty($posts)): ?>
                    <div class="text-center">
                        <h2>No Posts Yet</h2>
                        <p>Be the first to share your story!</p>
                        <?php if ($isLoggedIn): ?>
                            <a href="pages/create.php" class="btn btn-primary">Write Your First Post</a>
                        <?php else: ?>
                            <a href="pages/register.php" class="btn btn-primary">Join Us</a>
                        <?php endif; ?>
                    </div>
                <?php else: ?>
                    <div class="blog-grid">
                        <?php foreach ($posts as $post): ?>
                            <article class="blog-card">
                                <div class="blog-card-header">
                                    <h3 class="blog-card-title">
                                        <a href="pages/view.php?id=<?php echo $post['id']; ?>">
                                            <?php echo sanitizeOutput($post['title']); ?>
                                        </a>
                                    </h3>
                                    <div class="blog-card-meta">
                                        <span class="blog-card-author">
                                            By <?php echo sanitizeOutput($post['author_name']); ?>
                                        </span>
                                        <span>•</span>
                                        <time datetime="<?php echo $post['created_at']; ?>">
                                            <?php echo date('M j, Y', strtotime($post['created_at'])); ?>
                                        </time>
                                    </div>
                                </div>
                                
                                <div class="blog-card-body">
                                    <div class="blog-card-excerpt">
                                        <?php 
                                        // Create excerpt from content (strip HTML and limit length)
                                        $excerpt = strip_tags($post['content']);
                                        $excerpt = strlen($excerpt) > 150 ? substr($excerpt, 0, 150) . '...' : $excerpt;
                                        echo sanitizeOutput($excerpt);
                                        ?>
                                    </div>
                                </div>
                                
                                <div class="blog-card-footer">
                                    <a href="pages/view.php?id=<?php echo $post['id']; ?>" class="btn btn-primary btn-small">
                                        Read More
                                    </a>
                                    
                                    <?php if ($isLoggedIn && $currentUser['id'] == $post['user_id']): ?>
                                        <div class="flex gap-2">
                                            <a href="pages/edit.php?id=<?php echo $post['id']; ?>" class="btn btn-secondary btn-small">
                                                Edit
                                            </a>
                                            <button onclick="deletePost(<?php echo $post['id']; ?>)" class="btn btn-danger btn-small">
                                                Delete
                                            </button>
                                        </div>
                                    <?php endif; ?>
                                </div>
                            </article>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>
            </section>

            <!-- Pagination -->
            <?php if ($totalPages > 1): ?>
                <nav class="pagination">
                    <?php if ($page > 1): ?>
                        <a href="?page=<?php echo $page - 1; ?><?php echo !empty($search) ? '&search=' . urlencode($search) : ''; ?>" class="pagination-btn">
                            &laquo; Previous
                        </a>
                    <?php endif; ?>
                    
                    <?php
                    $startPage = max(1, $page - 2);
                    $endPage = min($totalPages, $page + 2);
                    
                    for ($i = $startPage; $i <= $endPage; $i++):
                    ?>
                        <a href="?page=<?php echo $i; ?><?php echo !empty($search) ? '&search=' . urlencode($search) : ''; ?>" 
                           class="pagination-btn <?php echo $i == $page ? 'active' : ''; ?>">
                            <?php echo $i; ?>
                        </a>
                    <?php endfor; ?>
                    
                    <?php if ($page < $totalPages): ?>
                        <a href="?page=<?php echo $page + 1; ?><?php echo !empty($search) ? '&search=' . urlencode($search) : ''; ?>" class="pagination-btn">
                            Next &raquo;
                        </a>
                    <?php endif; ?>
                </nav>
            <?php endif; ?>
        </div>
    </main>

    <!-- JavaScript -->
    <script src="js/main.js"></script>
    <script>
        // Mobile menu is now handled in main.js - no duplicate code needed here
        
        // Logout function
        function logout() {
            if (confirm('Are you sure you want to logout?')) {
                fetch('php/auth.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        action: 'logout'
                    })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        window.location.reload();
                    } else {
                        alert('Logout failed. Please try again.');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('An error occurred. Please try again.');
                });
            }
        }

        // Delete post function
        function deletePost(postId) {
            if (confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
                fetch('php/blog.php', {
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
                        window.location.reload();
                    } else {
                        alert(data.message || 'Failed to delete post. Please try again.');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('An error occurred. Please try again.');
                });
            }
        }
    </script>
</body>
</html>