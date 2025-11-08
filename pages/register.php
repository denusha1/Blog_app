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
    <title>Register - Blog Application</title>
    <link rel="stylesheet" href="../css/style.css">
    <meta name="description" content="Create a new blog account">
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
                    <li><a href="login.php" class="nav-link">Login</a></li>
                    <li><a href="register.php" class="nav-link active">Register</a></li>
                </ul>
            </nav>
        </div>
    </header>

    <!-- Main Content -->
    <main class="main-content">
        <div class="container">
            <div class="form-container">
                <h1 class="text-center mb-4">Join BlogApp</h1>
                <p class="text-center mb-4">Create your account and start sharing your stories</p>
                
                <form id="registerForm" novalidate>
                    <div id="errorContainer" class="mb-3"></div>
                    
                    <!-- CSRF Token for security -->
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
                            placeholder="Choose a unique username"
                            minlength="3"
                            maxlength="50"
                        >
                        <small class="form-help">At least 3 characters, letters, numbers, and underscores only</small>
                    </div>
                    
                    <div class="form-group">
                        <label for="email" class="form-label">Email Address</label>
                        <input 
                            type="email" 
                            id="email" 
                            name="email" 
                            class="form-input" 
                            required 
                            autocomplete="email"
                            placeholder="Enter your email address"
                        >
                        <small class="form-help">We'll never share your email with anyone</small>
                    </div>
                    
                    <div class="form-group">
                        <label for="password" class="form-label">Password</label>
                        <input 
                            type="password" 
                            id="password" 
                            name="password" 
                            class="form-input" 
                            required 
                            autocomplete="new-password"
                            placeholder="Create a strong password"
                            minlength="8"
                        >
                        <small class="form-help">At least 8 characters with uppercase, lowercase, and numbers</small>
                    </div>
                    
                    <div class="form-group">
                        <label for="confirmPassword" class="form-label">Confirm Password</label>
                        <input 
                            type="password" 
                            id="confirmPassword" 
                            name="confirmPassword" 
                            class="form-input" 
                            required 
                            autocomplete="new-password"
                            placeholder="Confirm your password"
                        >
                    </div>
                    
                    <!-- Password Strength Indicator -->
                    <div class="form-group">
                        <div class="password-strength" id="passwordStrength" style="display: none;">
                            <div class="strength-bar">
                                <div class="strength-fill" id="strengthFill"></div>
                            </div>
                            <div class="strength-text" id="strengthText"></div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <button type="submit" class="btn btn-primary" style="width: 100%;">
                            Create Account
                        </button>
                    </div>
                </form>
                
                <div class="text-center mt-4">
                    <p>Already have an account? <a href="login.php">Sign in here</a></p>
                </div>
            </div>
        </div>
    </main>

    <!-- JavaScript -->
    <script src="../js/main.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const registerForm = document.getElementById('registerForm');
            const errorContainer = document.getElementById('errorContainer');
            const passwordInput = document.getElementById('password');
            const confirmPasswordInput = document.getElementById('confirmPassword');
            const strengthIndicator = document.getElementById('passwordStrength');
            const strengthFill = document.getElementById('strengthFill');
            const strengthText = document.getElementById('strengthText');
            
            // Password strength checker
            function checkPasswordStrength(password) {
                let strength = 0;
                let feedback = [];
                
                if (password.length >= 8) strength += 1;
                else feedback.push('At least 8 characters');
                
                if (/[a-z]/.test(password)) strength += 1;
                else feedback.push('Lowercase letter');
                
                if (/[A-Z]/.test(password)) strength += 1;
                else feedback.push('Uppercase letter');
                
                if (/\d/.test(password)) strength += 1;
                else feedback.push('Number');
                
                if (/[^a-zA-Z\d]/.test(password)) strength += 1;
                
                const levels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
                const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'];
                
                return {
                    score: strength,
                    level: levels[Math.min(strength, 4)],
                    color: colors[Math.min(strength, 4)],
                    feedback: feedback
                };
            }
            
            // Update password strength indicator
            passwordInput.addEventListener('input', function() {
                const password = this.value;
                
                if (password.length > 0) {
                    strengthIndicator.style.display = 'block';
                    const strength = checkPasswordStrength(password);
                    
                    strengthFill.style.width = `${(strength.score / 5) * 100}%`;
                    strengthFill.style.backgroundColor = strength.color;
                    strengthText.textContent = strength.level;
                    strengthText.style.color = strength.color;
                } else {
                    strengthIndicator.style.display = 'none';
                }
            });
            
            // Real-time validation
            const inputs = {
                username: document.getElementById('username'),
                email: document.getElementById('email'),
                password: passwordInput,
                confirmPassword: confirmPasswordInput
            };
            
            // Username validation
            inputs.username.addEventListener('blur', function() {
                const value = this.value.trim();
                if (value.length < 3) {
                    this.style.borderColor = '#ef4444';
                } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
                    this.style.borderColor = '#ef4444';
                } else {
                    this.style.borderColor = '#10b981';
                }
            });
            
            // Email validation
            inputs.email.addEventListener('blur', function() {
                const value = this.value.trim();
                if (!BlogApp.isValidEmail(value)) {
                    this.style.borderColor = '#ef4444';
                } else {
                    this.style.borderColor = '#10b981';
                }
            });
            
            // Password validation
            inputs.password.addEventListener('blur', function() {
                const strength = checkPasswordStrength(this.value);
                if (strength.score < 3) {
                    this.style.borderColor = '#ef4444';
                } else {
                    this.style.borderColor = '#10b981';
                }
            });
            
            // Confirm password validation
            inputs.confirmPassword.addEventListener('blur', function() {
                if (this.value !== inputs.password.value) {
                    this.style.borderColor = '#ef4444';
                } else if (this.value.length > 0) {
                    this.style.borderColor = '#10b981';
                }
            });
            
            // Reset border color on focus
            Object.values(inputs).forEach(input => {
                input.addEventListener('focus', function() {
                    this.style.borderColor = '#2563eb';
                });
            });
            
            // Form submission
            registerForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const formData = new FormData(registerForm);
                
                // IMPORTANT: Include CSRF token in the data object
                const data = {
                    username: formData.get('username').trim(),
                    email: formData.get('email').trim(),
                    password: formData.get('password'),
                    confirmPassword: formData.get('confirmPassword'),
                    csrf_token: formData.get('csrf_token')  // ← FIX: Include CSRF token
                };
                
                const submitButton = registerForm.querySelector('button[type="submit"]');
                
                // Use the Auth.register function from main.js
                await Auth.register(data, submitButton, errorContainer);
            });
            
            // Auto-focus on username field
            inputs.username.focus();
        });
    </script>
    
    <style>
        .form-help {
            font-size: 0.875rem;
            color: #6b7280;
            margin-top: 0.25rem;
            display: block;
        }
        
        .password-strength {
            margin-top: 0.5rem;
        }
        
        .strength-bar {
            width: 100%;
            height: 4px;
            background-color: #e5e7eb;
            border-radius: 2px;
            overflow: hidden;
        }
        
        .strength-fill {
            height: 100%;
            width: 0%;
            transition: all 0.3s ease;
            border-radius: 2px;
        }
        
        .strength-text {
            font-size: 0.875rem;
            font-weight: 500;
            margin-top: 0.25rem;
        }
    </style>
</body>
</html>