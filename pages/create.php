<?php
session_start();
require_once '../php/config.php';

// Check if user is logged in
if (!isLoggedIn()) {
    redirect('login.php');
}

$currentUser = getCurrentUser();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Create New Post - Blog Application</title>
    <link rel="stylesheet" href="../css/style.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/easymde@2.18.0/dist/easymde.min.css">
    <meta name="description" content="Create a new blog post">
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
                    <li><a href="create.php" class="nav-link active">Write Post</a></li>
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
                <h1 class="text-center mb-4">Create New Post</h1>
                
                <!-- Beginner-friendly instructions -->
                <div class="instruction-card mb-4">
                    <h3>📝 How to Create Your Blog Post</h3>
                    <ol class="instruction-list">
                        <li><strong>Write a catchy title</strong> - This is what readers see first!</li>
                        <li><strong>Add your content</strong> - Share your thoughts, stories, or knowledge</li>
                        <li><strong>Use formatting</strong> - Click the toolbar buttons or use Markdown syntax</li>
                        <li><strong>Preview your post</strong> - Click "Show Preview" to see how it looks</li>
                        <li><strong>Save drafts</strong> - Click "Save Draft" to save your work</li>
                        <li><strong>Publish</strong> - Click "Publish Post" when you're ready!</li>
                    </ol>
                </div>
                
                <form id="createPostForm" novalidate>
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
                            placeholder="Enter an engaging title for your post (e.g., 'My First Blog Post')"
                            maxlength="255"
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
                        ></textarea>
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
                        <button type="submit" class="btn btn-primary" title="Publish your post for everyone to see">
                            🚀 Publish Post
                        </button>
                        <button type="button" id="saveDraft" class="btn btn-secondary" title="Save your work as a draft to continue later">
                            💾 Save Draft
                        </button>
                        <a href="../index.php" class="btn btn-outline" title="Go back without saving">
                            ❌ Cancel
                        </a>
                    </div>
                </form>
            </div>
        </div>
    </main>

    <!-- JavaScript -->
    <script src="../js/main.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/easymde@2.18.0/dist/easymde.min.js"></script>
    <script>
        let easyMDE;
        
        document.addEventListener('DOMContentLoaded', function() {
            const createPostForm = document.getElementById('createPostForm');
            const errorContainer = document.getElementById('errorContainer');
            const titleInput = document.getElementById('title');
            const contentTextarea = document.getElementById('content');
            const previewToggle = document.getElementById('previewToggle');
            const previewContainer = document.getElementById('previewContainer');
            const previewContent = document.getElementById('previewContent');
            
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
                    uniqueId: "blog_post_draft",
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
            createPostForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const title = titleInput.value.trim();
                const content = easyMDE.value().trim();
                
                const data = {
                    title: title,
                    content: content
                };
                
                const submitButton = createPostForm.querySelector('button[type="submit"]');
                
                // Use the Blog.saveBlogPost function from main.js
                await Blog.saveBlogPost(data, submitButton, errorContainer, false);
            });
            
            // Save draft functionality
            document.getElementById('saveDraft').addEventListener('click', function() {
                const title = titleInput.value.trim();
                const content = easyMDE.value().trim();
                
                if (title || content) {
                    localStorage.setItem('blog_draft', JSON.stringify({
                        title: title,
                        content: content,
                        timestamp: new Date().toISOString()
                    }));
                    
                    BlogApp.showAlert('Draft saved successfully!', 'success');
                } else {
                    BlogApp.showAlert('Nothing to save!', 'warning');
                }
            });
            
            // Load draft if exists
            const savedDraft = localStorage.getItem('blog_draft');
            if (savedDraft) {
                try {
                    const draft = JSON.parse(savedDraft);
                    if (confirm('You have a saved draft. Would you like to load it?')) {
                        titleInput.value = draft.title || '';
                        easyMDE.value(draft.content || '');
                    }
                } catch (e) {
                    console.error('Error loading draft:', e);
                }
            }
            
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