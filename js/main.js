// Blog Application - Main JavaScript File

// Utility Functions
const BlogApp = {
    // Get correct API path based on current location
    getApiPath: function(endpoint) {
        const currentPath = window.location.pathname;
        const isInPagesDir = currentPath.includes('/pages/');
        return isInPagesDir ? `../${endpoint}` : endpoint;
    },
    // Show loading state on button
    showButtonLoading: function(button, originalText) {
        button.disabled = true;
        button.classList.add('btn-loading');
        button.setAttribute('data-original-text', originalText || button.textContent);
        button.textContent = 'Loading...';
    },

    // Hide loading state on button
    hideButtonLoading: function(button) {
        button.disabled = false;
        button.classList.remove('btn-loading');
        const originalText = button.getAttribute('data-original-text');
        if (originalText) {
            button.textContent = originalText;
            button.removeAttribute('data-original-text');
        }
    },

    // Show alert message
    showAlert: function(message, type = 'info', container = null) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type}`;
        alertDiv.textContent = message;
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.parentNode.removeChild(alertDiv);
            }
        }, 5000);
        
        if (container) {
            container.insertBefore(alertDiv, container.firstChild);
        } else {
            // Insert at the top of main content
            const mainContent = document.querySelector('.main-content .container');
            if (mainContent) {
                mainContent.insertBefore(alertDiv, mainContent.firstChild);
            }
        }
        
        return alertDiv;
    },

    // Validate email format
    isValidEmail: function(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // Validate password strength
    isValidPassword: function(password) {
        // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
        return passwordRegex.test(password);
    },

    // Format date
    formatDate: function(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    // Debounce function for search
    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Make API request
    apiRequest: async function(url, options = {}) {
        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API Request Error:', error);
            throw new Error('Network error occurred. Please try again.');
        }
    }
};

// Form Validation
const FormValidator = {
    // Validate login form
    validateLogin: function(formData) {
        const errors = [];
        
        if (!formData.username || formData.username.trim().length < 3) {
            errors.push('Username must be at least 3 characters long');
        }
        
        if (!formData.password || formData.password.length < 6) {
            errors.push('Password must be at least 6 characters long');
        }
        
        return errors;
    },

    // Validate registration form
    validateRegistration: function(formData) {
        const errors = [];
        
        if (!formData.username || formData.username.trim().length < 3) {
            errors.push('Username must be at least 3 characters long');
        }
        
        if (!formData.email || !BlogApp.isValidEmail(formData.email)) {
            errors.push('Please enter a valid email address');
        }
        
        if (!formData.password || formData.password.length < 8) {
            errors.push('Password must be at least 8 characters long');
        }
        
        if (!BlogApp.isValidPassword(formData.password)) {
            errors.push('Password must contain at least one uppercase letter, one lowercase letter, and one number');
        }
        
        if (formData.password !== formData.confirmPassword) {
            errors.push('Passwords do not match');
        }
        
        // CSRF Token check (optional in client-side validation, but good to debug if missing)
        if (!formData.csrf_token || formData.csrf_token.length < 32) {
             console.warn("CSRF token appears to be missing or invalid in client-side data.");
        }
        
        return errors;
    },

    // Validate blog post form
    validateBlogPost: function(formData) {
        const errors = [];
        
        // Title validation
        if (!formData.title || formData.title.trim().length === 0) {
            errors.push('📝 Please enter a title for your blog post');
        } else if (formData.title.trim().length < 5) {
            errors.push(`📝 Title is too short (${formData.title.trim().length} characters). Please use at least 5 characters to make it more descriptive`);
        } else if (formData.title.trim().length > 255) {
            errors.push('📝 Title is too long. Please keep it under 255 characters');
        }
        
        // Content validation
        if (!formData.content || formData.content.trim().length === 0) {
            errors.push('✍️ Please write some content for your blog post');
        } else if (formData.content.trim().length < 50) {
            errors.push(`✍️ Content is too short (${formData.content.trim().length} characters). Please write at least 50 characters to create a meaningful post`);
        } else if (formData.content.trim().length > 50000) {
            errors.push('✍️ Content is too long. Please keep it under 50,000 characters');
        }
        
        return errors;
    },

    // Show form errors
    showErrors: function(errors, container) {
        if (!container) {
            console.error('Error container not found');
            return;
        }
        
        // Clear existing errors
        const existingErrors = container.querySelectorAll('.form-error, .alert-error');
        existingErrors.forEach(error => error.remove());
        
        // Show new errors with better styling
        errors.forEach(error => {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'alert alert-error form-error';
            errorDiv.innerHTML = `
                <span class="alert-icon">⚠️</span>
                <span class="alert-message">${error}</span>
            `;
            container.appendChild(errorDiv);
        });
        
        // Scroll to first error
        if (errors.length > 0) {
            container.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    },

    // Clear form errors
    clearErrors: function(container) {
        if (!container) return;
        const errors = container.querySelectorAll('.form-error, .alert-error');
        errors.forEach(error => error.remove());
    },

    // Show success message
    showSuccess: function(message, container) {
        if (!container) return;
        
        this.clearErrors(container);
        
        const successDiv = document.createElement('div');
        successDiv.className = 'alert alert-success';
        successDiv.innerHTML = `
            <span class="alert-icon">✅</span>
            <span class="alert-message">${message}</span>
        `;
        container.appendChild(successDiv);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.remove();
            }
        }, 3000);
    }
};

// Authentication Functions
const Auth = {
    // Login user
    login: async function(formData, button, errorContainer) {
        const errors = FormValidator.validateLogin(formData);
        
        if (errors.length > 0) {
            FormValidator.showErrors(errors, errorContainer);
            return false;
        }
        
        FormValidator.clearErrors(errorContainer);
        BlogApp.showButtonLoading(button);
        
        try {
            const data = await BlogApp.apiRequest(BlogApp.getApiPath('php/auth.php'), {
                method: 'POST',
                body: JSON.stringify({
                    action: 'login',
                    username: formData.username,
                    password: formData.password,
                    csrf_token: formData.csrf_token
                })
            });
            
            BlogApp.hideButtonLoading(button);
            
            if (data.success) {
                BlogApp.showAlert('Login successful! Redirecting...', 'success');
                setTimeout(() => {
                    // Check if we're in a subdirectory (like /pages/) and redirect accordingly
                    const currentPath = window.location.pathname;
                    if (currentPath.includes('/pages/')) {
                        window.location.href = '../index.php';
                    } else {
                        window.location.href = 'index.php';
                    }
                }, 1500);
                return true;
            } else {
                FormValidator.showErrors([data.message], errorContainer);
                return false;
            }
        } catch (error) {
            BlogApp.hideButtonLoading(button);
            FormValidator.showErrors([error.message], errorContainer);
            return false;
        }
    },

    // Register user
    register: async function(formData, button, errorContainer) {
        const errors = FormValidator.validateRegistration(formData);
        
        if (errors.length > 0) {
            FormValidator.showErrors(errors, errorContainer);
            return false;
        }
        
        FormValidator.clearErrors(errorContainer);
        BlogApp.showButtonLoading(button);
        
        try {
            const data = await BlogApp.apiRequest(BlogApp.getApiPath('php/auth.php'), {
                method: 'POST',
                body: JSON.stringify({
                    action: 'register',
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                    csrf_token: formData.csrf_token
                })
            });
            
            BlogApp.hideButtonLoading(button);
            
            if (data.success) {
                BlogApp.showAlert('Registration successful! Redirecting to login...', 'success');
                setTimeout(() => {
                    window.location.href = 'login.php';
                }, 1500);
                return true;
            } else {
                FormValidator.showErrors([data.message], errorContainer);
                return false;
            }
        } catch (error) {
            BlogApp.hideButtonLoading(button);
            FormValidator.showErrors([error.message], errorContainer);
            return false;
        }
    },

    // Logout user
    logout: async function() {
        if (!confirm('Are you sure you want to logout?')) {
            return false;
        }

        try {
            const data = await BlogApp.apiRequest(BlogApp.getApiPath('php/auth.php'), {
                method: 'POST',
                body: JSON.stringify({
                    action: 'logout'
                })
            });
            
            if (data.success) {
                BlogApp.showAlert('Logged out successfully!', 'success');
                setTimeout(() => {
                    const currentPath = window.location.pathname;
                    if (currentPath.includes('/pages/')) {
                        window.location.href = '../index.php';
                    } else {
                        window.location.href = 'index.php';
                    }
                }, 1000);
                return true;
            } else {
                BlogApp.showAlert('Logout failed. Please try again.', 'error');
                return false;
            }
        } catch (error) {
            BlogApp.showAlert(error.message, 'error');
            return false;
        }
    }
};

// Blog Functions
const Blog = {
    // Create or update blog post
    saveBlogPost: async function(formData, button, errorContainer, isEdit = false) {
        const errors = FormValidator.validateBlogPost(formData);
        
        if (errors.length > 0) {
            FormValidator.showErrors(errors, errorContainer);
            return false;
        }
        
        FormValidator.clearErrors(errorContainer);
        
        const originalText = button.textContent;
        BlogApp.showButtonLoading(button, originalText);
        
        try {
            const requestData = {
                action: isEdit ? 'update' : 'create',
                title: formData.title.trim(),
                content: formData.content.trim(),
            };
            
            if (isEdit && formData.id) {
                requestData.id = formData.id;
            }
            
            console.log('Sending request:', requestData);
            
            const data = await BlogApp.apiRequest(BlogApp.getApiPath('php/blog.php'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });
            
            console.log('Received response:', data);
            
            BlogApp.hideButtonLoading(button);
            
            if (data.success) {
                const message = isEdit ? 
                    '🎉 Your blog post has been updated successfully!' : 
                    '🎉 Your blog post has been published successfully!';
                
                FormValidator.showSuccess(message, errorContainer);
                
                if (!isEdit) {
                    localStorage.removeItem('blog_draft');
                }
                
                setTimeout(() => {
                    const postId = data.post_id || formData.id;
                    window.location.href = `view.php?id=${postId}`;
                }, 2000);
                return true;
            } else {
                const errorMessage = data.message || (isEdit ? 'Failed to update post' : 'Failed to create post');
                FormValidator.showErrors([`❌ ${errorMessage}`], errorContainer);
                return false;
            }
        } catch (error) {
            BlogApp.hideButtonLoading(button);
            console.error('Blog save error:', error);
            
            let errorMessage = 'An unexpected error occurred. Please try again.';
            if (error.message.includes('fetch')) {
                errorMessage = 'Network error. Please check your connection and try again.';
            } else if (error.message.includes('JSON')) {
                errorMessage = 'Server response error. Please try again.';
            }
            
            FormValidator.showErrors([`❌ ${errorMessage}`], errorContainer);
            return false;
        }
    },

    // Delete blog post
    deleteBlogPost: async function(postId) {
        const confirmMessage = `🗑️ Are you sure you want to delete this blog post?\n\n` +
                                 `This action cannot be undone and the post will be permanently removed.\n\n` +
                                 `Click OK to delete or Cancel to keep the post.`;
        
        if (!confirm(confirmMessage)) {
            return false;
        }
        
        const deleteButtons = document.querySelectorAll('button[onclick*="deletePost"]');
        deleteButtons.forEach(btn => {
            BlogApp.showButtonLoading(btn, 'Delete Post');
        });
        
        try {
            console.log('Deleting post:', postId);
            
            const data = await BlogApp.apiRequest(BlogApp.getApiPath('php/blog.php'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'delete',
                    id: postId
                })
            });
            
            console.log('Delete response:', data);
            
            deleteButtons.forEach(btn => {
                BlogApp.hideButtonLoading(btn);
            });
            
            if (data.success) {
                BlogApp.showAlert('🗑️ ' + (data.message || 'Post deleted successfully!'), 'success');
                setTimeout(() => {
                    const currentPath = window.location.pathname;
                    if (currentPath.includes('/pages/')) {
                        window.location.href = '../index.php';
                    } else {
                        window.location.href = 'index.php';
                    }
                }, 1500);
                return true;
            } else {
                const errorMessage = data.message || 'Failed to delete post. Please try again.';
                BlogApp.showAlert('❌ ' + errorMessage, 'error');
                return false;
            }
        } catch (error) {
            deleteButtons.forEach(btn => {
                BlogApp.hideButtonLoading(btn);
            });
            
            console.error('Delete error:', error);
            
            let errorMessage = 'An unexpected error occurred while deleting the post.';
            if (error.message.includes('fetch')) {
                errorMessage = 'Network error. Please check your connection and try again.';
            } else if (error.message.includes('JSON')) {
                errorMessage = 'Server response error. Please try again.';
            }
            
            BlogApp.showAlert('❌ ' + errorMessage, 'error');
            return false;
        }
    }
};

// Mobile Navigation - UPDATED WITH ICON CHANGE
const MobileNav = {
    init: function() {
        const toggleButton = document.getElementById('mobileMenuToggle');
        const navMenu = document.getElementById('navMenu');
        
        if (toggleButton && navMenu) {
            // Toggle menu on button click
            toggleButton.addEventListener('click', function(e) {
                e.stopPropagation(); // Prevent event from bubbling
                navMenu.classList.toggle('active');
                
                // Change icon when menu is toggled
                if (navMenu.classList.contains('active')) {
                    toggleButton.textContent = '✕';
                    toggleButton.setAttribute('aria-label', 'Close menu');
                } else {
                    toggleButton.textContent = '☰';
                    toggleButton.setAttribute('aria-label', 'Open menu');
                }
            });
            
            // Close menu when clicking outside
            document.addEventListener('click', function(event) {
                if (!toggleButton.contains(event.target) && !navMenu.contains(event.target)) {
                    if (navMenu.classList.contains('active')) {
                        navMenu.classList.remove('active');
                        toggleButton.textContent = '☰';
                        toggleButton.setAttribute('aria-label', 'Open menu');
                    }
                }
            });
            
            // Close menu when clicking on a link
            const navLinks = navMenu.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                link.addEventListener('click', function() {
                    navMenu.classList.remove('active');
                    toggleButton.textContent = '☰';
                    toggleButton.setAttribute('aria-label', 'Open menu');
                });
            });
            
            // Close menu on window resize if open
            window.addEventListener('resize', function() {
                if (window.innerWidth > 768 && navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    toggleButton.textContent = '☰';
                }
            });
        }
    }
};

// Search Functionality
const Search = {
    init: function() {
        const searchInput = document.querySelector('input[name="search"]');
        if (searchInput) {
            const debouncedSearch = BlogApp.debounce(this.performSearch, 300);
            searchInput.addEventListener('input', debouncedSearch);
        }
    },
    
    performSearch: function(event) {
        const query = event.target.value.trim();
        if (query.length < 3) return;
        console.log('Searching for:', query);
    }
};

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize mobile navigation
    MobileNav.init();
    
    // Initialize search functionality
    Search.init();
    
    // Add smooth scrolling to anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            if (href === '#') return;
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Auto-dismiss alerts after 5 seconds
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        setTimeout(() => {
            if (alert.parentNode) {
                alert.style.opacity = '0';
                alert.style.transition = 'opacity 0.3s ease';
                setTimeout(() => {
                    if (alert.parentNode) {
                        alert.parentNode.removeChild(alert);
                    }
                }, 300);
            }
        }, 5000);
    });
});

// Global functions for inline event handlers
window.logout = Auth.logout;
window.deletePost = Blog.deleteBlogPost;
window.BlogApp = BlogApp;
window.Auth = Auth;
window.Blog = Blog;
window.FormValidator = FormValidator;