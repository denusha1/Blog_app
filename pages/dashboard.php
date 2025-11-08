<?php
session_start();
require_once '../php/config.php';

// Check if user is logged in
if (!isLoggedIn()) {
    redirect('login.php');
}

$currentUser = getCurrentUser();

// Pagination settings
$postsPerPage = 10;
$page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
$offset = ($page - 1) * $postsPerPage;

try {
    $db = getDBConnection();
    
    // Get total posts count for current user
    $countQuery = "SELECT COUNT(*) FROM blog_posts WHERE user_id = ?";
    $countStmt = $db->prepare($countQuery);
    $countStmt->execute([$currentUser['id']]);
    $totalPosts = $countStmt->fetchColumn();
    
    // Calculate total pages
    $totalPages = ceil($totalPosts / $postsPerPage);
    
    // Get user's blog posts
    $query = "SELECT id, title, content, created_at, updated_at 
              FROM blog_posts 
              WHERE user_id = ? 
              ORDER BY created_at DESC 
              LIMIT ? OFFSET ?";
    $stmt = $db->prepare($query);
    $stmt->execute([$currentUser['id'], $postsPerPage, $offset]);
    $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
} catch (PDOException $e) {
    error_log("Database error: " . $e->getMessage());
    $posts = [];
    $totalPosts = 0;
    $totalPages = 0;
}

// Function to generate excerpt
function generateExcerpt($content, $length = 150) {
    $content = strip_tags($content);
    if (strlen($content) <= $length) {
        return $content;
    }
    return substr($content, 0, $length) . '...';
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Posts - BlogApp</title>
    <link rel="stylesheet" href="../css/style.css">
    <meta name="description" content="Manage your blog posts">
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
                    <li><a href="create.php" class="nav-link">Write Post</a></li>
                    <li><a href="dashboard.php" class="nav-link active">My Posts</a></li>
                    <li><a href="profile.php" class="nav-link">Profile</a></li>
                    <li><a href="#" class="nav-link" onclick="logout()">Logout</a></li>
                    <li><span class="nav-link">Welcome, <?php echo sanitizeOutput($currentUser['username']); ?>!</span></li>
                </ul>
            </nav>
        </div>
    </header>

    <!-- Main Content -->
    <main class="main-content">
        <div class="container">
            <!-- Dashboard Header -->
            <div class="dashboard-header mb-4">
                <h1>My Posts</h1>
                <div class="dashboard-stats">
                    <div class="stat-card">
                        <h3><?php echo $totalPosts; ?></h3>
                        <p>Total Posts</p>
                    </div>
                    <div class="stat-card">
                        <h3><?php echo $currentUser['role']; ?></h3>
                        <p>Role</p>
                    </div>
                    <div class="stat-card">
                        <h3><?php echo date('M Y', strtotime($currentUser['created_at'])); ?></h3>
                        <p>Member Since</p>
                    </div>
                </div>
            </div>
            
            <!-- Action Bar -->
            <div class="action-bar mb-4">
                <a href="create.php" class="btn btn-primary">
                    ✏️ Write New Post
                </a>
                <div class="action-bar-right">
                    <span class="text-muted">
                        Showing <?php echo count($posts); ?> of <?php echo $totalPosts; ?> posts
                    </span>
                </div>
            </div>
            
            <!-- Posts List -->
            <?php if (empty($posts)): ?>
                <div class="empty-state">
                    <div class="empty-state-content">
                        <h2>No posts yet</h2>
                        <p>You haven't written any blog posts yet. Start sharing your thoughts with the world!</p>
                        <a href="create.php" class="btn btn-primary">Write Your First Post</a>
                    </div>
                </div>
            <?php else: ?>
                <div class="posts-list">
                    <?php foreach ($posts as $post): ?>
                        <div class="post-item">
                            <div class="post-item-content">
                                <h3 class="post-item-title">
                                    <a href="view.php?id=<?php echo $post['id']; ?>">
                                        <?php echo sanitizeOutput($post['title']); ?>
                                    </a>
                                </h3>
                                <p class="post-item-excerpt">
                                    <?php echo sanitizeOutput(generateExcerpt($post['content'])); ?>
                                </p>
                                <div class="post-item-meta">
                                    <span class="post-date">
                                        Created: <?php echo date('M j, Y', strtotime($post['created_at'])); ?>
                                    </span>
                                    <?php if ($post['updated_at'] && $post['updated_at'] !== $post['created_at']): ?>
                                        <span class="post-date">
                                            • Updated: <?php echo date('M j, Y', strtotime($post['updated_at'])); ?>
                                        </span>
                                    <?php endif; ?>
                                </div>
                            </div>
                            <div class="post-item-actions">
                                <a href="view.php?id=<?php echo $post['id']; ?>" class="btn btn-small btn-outline">
                                    👁️ View
                                </a>
                                <a href="edit.php?id=<?php echo $post['id']; ?>" class="btn btn-small btn-secondary">
                                    ✏️ Edit
                                </a>
                                <button onclick="deletePost(<?php echo $post['id']; ?>)" class="btn btn-small btn-danger">
                                    🗑️ Delete
                                </button>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
                
                <!-- Pagination -->
                <?php if ($totalPages > 1): ?>
                    <div class="pagination">
                        <?php if ($page > 1): ?>
                            <a href="?page=<?php echo $page - 1; ?>" class="pagination-link">
                                ← Previous
                            </a>
                        <?php endif; ?>
                        
                        <?php for ($i = 1; $i <= $totalPages; $i++): ?>
                            <?php if ($i == $page): ?>
                                <span class="pagination-link active"><?php echo $i; ?></span>
                            <?php else: ?>
                                <a href="?page=<?php echo $i; ?>" class="pagination-link"><?php echo $i; ?></a>
                            <?php endif; ?>
                        <?php endfor; ?>
                        
                        <?php if ($page < $totalPages): ?>
                            <a href="?page=<?php echo $page + 1; ?>" class="pagination-link">
                                Next →
                            </a>
                        <?php endif; ?>
                    </div>
                <?php endif; ?>
            <?php endif; ?>
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
                            window.location.reload();
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
    
    <style>
        .dashboard-header {
            text-align: center;
            margin-bottom: 2rem;
        }
        
        .dashboard-header h1 {
            margin-bottom: 1rem;
            color: #1f2937;
        }
        
        .dashboard-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 1rem;
            max-width: 600px;
            margin: 0 auto;
        }
        
        .stat-card {
            background: white;
            padding: 1.5rem;
            border-radius: 0.5rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            text-align: center;
        }
        
        .stat-card h3 {
            font-size: 2rem;
            font-weight: bold;
            color: #2563eb;
            margin: 0 0 0.5rem 0;
        }
        
        .stat-card p {
            color: #6b7280;
            margin: 0;
            font-size: 0.875rem;
        }
        
        .action-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 1rem;
        }
        
        .action-bar-right {
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        
        .posts-list {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }
        
        .post-item {
            background: white;
            border-radius: 0.5rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            padding: 1.5rem;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 1rem;
        }
        
        .post-item-content {
            flex: 1;
        }
        
        .post-item-title {
            margin: 0 0 0.5rem 0;
        }
        
        .post-item-title a {
            color: #1f2937;
            text-decoration: none;
            font-size: 1.25rem;
            font-weight: 600;
        }
        
        .post-item-title a:hover {
            color: #2563eb;
        }
        
        .post-item-excerpt {
            color: #6b7280;
            margin: 0 0 1rem 0;
            line-height: 1.5;
        }
        
        .post-item-meta {
            font-size: 0.875rem;
            color: #9ca3af;
        }
        
        .post-item-actions {
            display: flex;
            gap: 0.5rem;
            flex-shrink: 0;
        }
        
        .empty-state {
            text-align: center;
            padding: 4rem 2rem;
        }
        
        .empty-state-content h2 {
            color: #6b7280;
            margin-bottom: 1rem;
        }
        
        .empty-state-content p {
            color: #9ca3af;
            margin-bottom: 2rem;
            max-width: 400px;
            margin-left: auto;
            margin-right: auto;
        }
        
        .text-muted {
            color: #6b7280;
            font-size: 0.875rem;
        }
        
        @media (max-width: 768px) {
            .dashboard-stats {
                grid-template-columns: 1fr;
            }
            
            .action-bar {
                flex-direction: column;
                align-items: stretch;
            }
            
            .action-bar-right {
                justify-content: center;
            }
            
            .post-item {
                flex-direction: column;
                align-items: stretch;
            }
            
            .post-item-actions {
                justify-content: center;
                margin-top: 1rem;
            }
        }
        
        @media (max-width: 480px) {
            .post-item-actions {
                flex-direction: column;
            }
            
            .dashboard-header {
                margin-bottom: 1rem;
            }
            
            .stat-card {
                padding: 1rem;
            }
        }
    </style>
</body>
</html>