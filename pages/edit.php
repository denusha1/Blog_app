<?php
session_start();
require_once '../php/config.php';

// Check if user is logged in
if (!isLoggedIn()) {
    redirect('login.php');
}

$currentUser = getCurrentUser();

// Get post ID from URL
$postId = isset($_GET['id']) ? intval($_GET['id']) : 0;

if (!$postId) {
    redirect('../index.php');
}

try {
    $db = getDBConnection();
    
    // Get blog post
    $query = "SELECT * FROM blog_posts WHERE id = ? AND user_id = ?";
    $stmt = $db->prepare($query);
    $stmt->execute([$postId, $currentUser['id']]);
    $post = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$post) {
        redirect('../index.php');
    }
    
} catch (PDOException $e) {
    error_log("Database error: " . $e->getMessage());
    redirect('../index.php');
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Edit Post - <?php echo sanitizeOutput($post['title']); ?></title>
    <link rel="stylesheet" href="../css/style.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/easymde@2.18.0/dist/easymde.min.css">
    <meta name="description" content="Edit your blog post">
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
                    <li><a href="dashboard.php" class="nav-link">My Posts</a></li>
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
            <div class="blog-content">
                <h1 class="text-center mb-4">Edit Post</h1>
                
                <!-- Beginner-friendly instructions -->
                <div class="instruction-card mb-4">
                    <h3>✏️ Editing Your Blog Post</h3>
                    <ul class="instruction-list">
                        <li><strong>Make your changes</strong> - Update the title or content as needed</li>
                        <li><strong>Use the toolbar</strong> - Add formatting with the buttons above</li>
                        <li><strong>Preview changes</strong> - Click "Show Preview" to see your updates</li>
                        <li><strong>Save changes</strong> - Click "Update Post" to save your edits</li>
                        <li><strong>Need help?</strong> - Use the Markdown guide below for formatting tips</li>
                    </ul>
                </div>
                
                <form id="editPostForm" novalidate>
                    <input type="hidden" id="postId" name="postId" value="<?php echo $post['id']; ?>">
                    
                    <div id="errorContainer" class="mb-3"></div>
                    
                    <div class="form-group">
                        <label for="title" class="form-label">
                            Post Title 
                            <span class="required-indicator" title="This field is required">*</span>
                        </label>
                        <input 
                            type="text" 
                            id="title" 
                            name="title" 
                            class="form-input" 
                            required 
                            placeholder="Enter an engaging title for your post"
                            maxlength="255"
                            value="<?php echo sanitizeOutput($post['title']); ?>"
                            title="Enter a descriptive title between 5-255 characters"
                        >
                        <small class="form-help">
                            💡 <strong>Tip:</strong> A compelling title helps readers discover your content. 
                            Make it descriptive and engaging!
                        </small>
                    </div>
                    
                    <div class="form-group">
                        <label for="content" class="form-label">
                            Post Content 
                            <span class="required-indicator" title="This field is required">*</span>
                        </label>
                        <textarea 
                            id="content" 
                            name="content" 
                            class="form-input form-textarea" 
                            required 
                            placeholder="Write your post content here... Share your thoughts, experiences, or knowledge with your readers!"
                            rows="15"
                            title="Write at least 50 characters to create a meaningful post"
                        ><?php echo sanitizeOutput($post['content']); ?></textarea>
                        <small class="form-help">
                            ✍️ <strong>Markdown Guide:</strong> Use **bold**, *italic*, # headers, [links](url), `code`, 
                            ```code blocks```, > quotes, and - lists to format your content beautifully!
                        </small>
                    </div>
                    
                    <!-- Markdown Toolbar -->
                    <div class="markdown-toolbar mb-3">
                        <button type="button" class="btn btn-small btn-outline" onclick="insertMarkdown('**', '**', 'bold text')">
                            <strong>B</strong>
                        </button>
                        <button type="button" class="btn btn-small btn-outline" onclick="insertMarkdown('*', '*', 'italic text')">
                            <em>I</em>
                        </button>
                        <button type="button" class="btn btn-small btn-outline" onclick="insertMarkdown('# ', '', 'Header')">
                            H1
                        </button>
                        <button type="button" class="btn btn-small btn-outline" onclick="insertMarkdown('## ', '', 'Header')">
                            H2
                        </button>
                        <button type="button" class="btn btn-small btn-outline" onclick="insertMarkdown('[', '](url)', 'link text')">
                            Link
                        </button>
                        <button type="button" class="btn btn-small btn-outline" onclick="insertMarkdown('`', '`', 'code')">
                            Code
                        </button>
                        <button type="button" class="btn btn-small btn-outline" onclick="insertMarkdown('```\n', '\n```', 'code block')">
                            Block
                        </button>
                    </div>
                    
                    <!-- Preview Toggle -->
                    <div class="form-group">
                        <button type="button" id="previewToggle" class="btn btn-secondary btn-small" title="Preview how your post will look when published">
                            👁️ Show Preview
                        </button>
                    </div>
                    
                    <!-- Preview Container -->
                    <div id="previewContainer" class="form-group" style="display: none;">
                        <label class="form-label">Preview</label>
                        <div id="previewContent" class="markdown-content" style="border: 1px solid #d1d5db; border-radius: 0.5rem; padding: 1rem; background: #f9fafb; min-height: 200px;">
                        </div>
                    </div>
                    
                    <div class="form-group flex gap-3">
                        <button type="submit" class="btn btn-primary" title="Save your changes and update the post">
                            ✅ Update Post
                        </button>
                        <a href="view.php?id=<?php echo $post['id']; ?>" class="btn btn-outline" title="Go back to view the post without saving changes">
                            ❌ Cancel
                        </a>
                        <button type="button" onclick="deletePost(<?php echo $post['id']; ?>)" class="btn btn-danger" title="Permanently delete this post (cannot be undone)">
                            🗑️ Delete Post
                        </button>
                    </div>
                </form>
                
                <!-- Post Info -->
                <div class="alert alert-info mt-4">
                    <strong>Post Information:</strong><br>
                    Created: <?php echo date('F j, Y \a\t g:i A', strtotime($post['created_at'])); ?><br>
                    <?php if ($post['updated_at'] && $post['updated_at'] !== $post['created_at']): ?>
                        Last Updated: <?php echo date('F j, Y \a\t g:i A', strtotime($post['updated_at'])); ?>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </main>

    <!-- JavaScript -->
    <script src="../js/main.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/easymde@2.18.0/dist/easymde.min.js"></script>
    <script>
        let easyMDE;
        
        document.addEventListener('DOMContentLoaded', function() {
            const editPostForm = document.getElementById('editPostForm');
            const errorContainer = document.getElementById('errorContainer');
            const titleInput = document.getElementById('title');
            const contentTextarea = document.getElementById('content');
            const previewToggle = document.getElementById('previewToggle');
            const previewContainer = document.getElementById('previewContainer');
            const previewContent = document.getElementById('previewContent');
            const postId = document.getElementById('postId').value;
            
            // Initialize EasyMDE
            easyMDE = new EasyMDE({
                element: contentTextarea,
                spellChecker: false,
                placeholder: "Write your post content here... You can use Markdown formatting!",
                toolbar: [
                    "bold", "italic", "heading", "|",
                    "quote", "unordered-list", "ordered-list", "|",
                    "link", "image", "|",
                    "code", "table", "|",
                    "preview", "side-by-side", "fullscreen", "|",
                    "guide"
                ],
                status: ["autosave", "lines", "words", "cursor"],
                autosave: {
                    enabled: true,
                    uniqueId: "blog_post_edit_" + postId,
                    delay: 1000,
                },
                renderingConfig: {
                    singleLineBreaks: false,
                    codeSyntaxHighlighting: true,
                }
            });
            
            // Simple Markdown to HTML converter for preview
            function markdownToHtml(text) {
                // Headers
                text = text.replace(/^### (.*$)/gm, '<h3>$1</h3>');
                text = text.replace(/^## (.*$)/gm, '<h2>$1</h2>');
                text = text.replace(/^# (.*$)/gm, '<h1>$1</h1>');
                
                // Bold and Italic
                text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
                
                // Links
                text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
                
                // Code blocks
                text = text.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
                text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
                
                // Line breaks
                text = text.replace(/\n/g, '<br>');
                
                return text;
            }
            
            // Preview toggle functionality
            previewToggle.addEventListener('click', function() {
                if (previewContainer.style.display === 'none') {
                    const content = easyMDE.value();
                    previewContent.innerHTML = markdownToHtml(content);
                    previewContainer.style.display = 'block';
                    previewToggle.textContent = 'Hide Preview';
                } else {
                    previewContainer.style.display = 'none';
                    previewToggle.textContent = 'Show Preview';
                }
            });
            
            // Form validation
            titleInput.addEventListener('blur', function() {
                if (this.value.trim().length < 5) {
                    this.style.borderColor = '#ef4444';
                } else {
                    this.style.borderColor = '#10b981';
                }
            });
            
            titleInput.addEventListener('focus', function() {
                this.style.borderColor = '#2563eb';
            });
            
            // Form submission
            editPostForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const title = titleInput.value.trim();
                const content = easyMDE.value().trim();
                
                const data = {
                    id: postId,
                    title: title,
                    content: content
                };
                
                const submitButton = editPostForm.querySelector('button[type="submit"]');
                
                // Use the Blog.saveBlogPost function from main.js
                await Blog.saveBlogPost(data, submitButton, errorContainer, true);
            });
            
            // Auto-focus on title
            titleInput.focus();
        });
        
        // Markdown insertion helper
        function insertMarkdown(before, after, placeholder) {
            const textarea = document.getElementById('content');
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const selectedText = textarea.value.substring(start, end);
            const replacement = before + (selectedText || placeholder) + after;
            
            textarea.value = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
            
            // Set cursor position
            const newCursorPos = start + before.length + (selectedText || placeholder).length;
            textarea.setSelectionRange(newCursorPos, newCursorPos);
            textarea.focus();
        }
        
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
    
    <style>
        .markdown-toolbar {
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
            margin-bottom: 1rem;
        }
        
        .form-help {
            font-size: 0.875rem;
            color: #6b7280;
            margin-top: 0.25rem;
            display: block;
        }
        
        .EasyMDEContainer .CodeMirror {
            border: 1px solid #d1d5db;
            border-radius: 0.5rem;
            font-size: 14px;
            min-height: 300px;
        }
        
        .EasyMDEContainer .CodeMirror-focused {
            border-color: #2563eb;
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }
        
        .editor-toolbar {
            border: 1px solid #d1d5db;
            border-bottom: none;
            border-radius: 0.5rem 0.5rem 0 0;
        }
        
        .editor-toolbar.fullscreen {
            border-radius: 0;
        }
        
        .CodeMirror {
            border-radius: 0 0 0.5rem 0.5rem;
        }
        
        .CodeMirror.CodeMirror-fullscreen {
            border-radius: 0;
        }
    </style>
</body>
</html>