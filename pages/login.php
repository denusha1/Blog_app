<?php
session_start();
require_once '../php/config.php';

// Redirect if already logged in
if (isLoggedIn()) {
    redirect('../index.php');
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Blog Application</title>
    <link rel="stylesheet" href="../css/style.css">
    <meta name="description" content="Login to your blog account">
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
                    <li><a href="login.php" class="nav-link active">Login</a></li>
                    <li><a href="register.php" class="nav-link">Register</a></li>
                </ul>
            </nav>
        </div>
    </header>

    <!-- Main Content -->
    <main class="main-content">
        <div class="container">
            <div class="form-container">
                <h1 class="text-center mb-4">Welcome Back</h1>
                <p class="text-center mb-4">Sign in to your account to continue</p>
                
                <form id="loginForm" novalidate>
                    <div id="errorContainer" class="mb-3"></div>
                    <input type="hidden" name="csrf_token" value="<?php echo generateCSRFToken(); ?>">
                    
                    <div class="form-group">
                        <label for="username" class="form-label">Username</label>
                        <input 
                            type="text" 
                            id="username" 
                            name="username" 
                            class="form-input" 
                            required 
                            autocomplete="username"
                            placeholder="Enter your username"
                        >
                    </div>
                    
                    <div class="form-group">
                        <label for="password" class="form-label">Password</label>
                        <input 
                            type="password" 
                            id="password" 
                            name="password" 
                            class="form-input" 
                            required 
                            autocomplete="current-password"
                            placeholder="Enter your password"
                        >
                    </div>
                    
                    <div class="form-group">
                        <button type="submit" class="btn btn-primary" style="width: 100%;">
                            Sign In
                        </button>
                    </div>
                </form>
                
                <div class="text-center mt-4">
                    <p>Don't have an account? <a href="register.php">Create one here</a></p>
                </div>
                
                <!-- Demo Accounts Info -->
                <div class="alert alert-info mt-4">
                    <strong>Demo Accounts:</strong><br>
                    <strong>Admin:</strong> admin / admin123<br>
                    <strong>User:</strong> john_doe / password123
                </div>
            </div>
        </div>
    </main>

    <!-- JavaScript -->
    <script src="../js/main.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const loginForm = document.getElementById('loginForm');
            const errorContainer = document.getElementById('errorContainer');
            
            loginForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const formData = new FormData(loginForm);
                const data = {
                    username: formData.get('username').trim(),
                    password: formData.get('password'),
                    csrf_token: formData.get('csrf_token')
                };
                
                const submitButton = loginForm.querySelector('button[type="submit"]');
                
                // Use the Auth.login function from main.js
                await Auth.login(data, submitButton, errorContainer);
            });
            
            // Auto-focus on username field
            document.getElementById('username').focus();
            
            // Add real-time validation
            const usernameInput = document.getElementById('username');
            const passwordInput = document.getElementById('password');
            
            usernameInput.addEventListener('blur', function() {
                if (this.value.trim().length < 3) {
                    this.style.borderColor = '#ef4444';
                } else {
                    this.style.borderColor = '#10b981';
                }
            });
            
            passwordInput.addEventListener('blur', function() {
                if (this.value.length < 6) {
                    this.style.borderColor = '#ef4444';
                } else {
                    this.style.borderColor = '#10b981';
                }
            });
            
            // Reset border color on focus
            [usernameInput, passwordInput].forEach(input => {
                input.addEventListener('focus', function() {
                    this.style.borderColor = '#2563eb';
                });
            });
        });
    </script>
</body>
</html>