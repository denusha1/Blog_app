<?php
session_start();
require_once '../php/config.php';

// Check if user is logged in
if (!isLoggedIn()) {
    redirect('login.php');
}

$currentUser = getCurrentUser();

try {
    $db = getDBConnection();
    
    // Get user statistics
    $statsQuery = "SELECT COUNT(*) as post_count FROM blog_posts WHERE user_id = ?";
    $statsStmt = $db->prepare($statsQuery);
    $statsStmt->execute([$currentUser['id']]);
    $stats = $statsStmt->fetch(PDO::FETCH_ASSOC);
    
} catch (PDOException $e) {
    error_log("Database error: " . $e->getMessage());
    $stats = ['post_count' => 0];
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Profile - <?php echo sanitizeOutput($currentUser['username']); ?></title>
    <link rel="stylesheet" href="../css/style.css">
    <meta name="description" content="Manage your profile and account settings">
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
                    <li><a href="profile.php" class="nav-link active">Profile</a></li>
                    <li><a href="#" class="nav-link" onclick="logout()">Logout</a></li>
                    <li><span class="nav-link">Welcome, <?php echo sanitizeOutput($currentUser['username']); ?>!</span></li>
                </ul>
            </nav>
        </div>
    </header>

    <!-- Main Content -->
    <main class="main-content">
        <div class="container">
            <div class="profile-container">
                <h1 class="text-center mb-4">My Profile</h1>
                
                <!-- Profile Info Card -->
                <div class="profile-card">
                    <div class="profile-header">
                        <div class="profile-avatar">
                            <?php echo strtoupper(substr($currentUser['username'], 0, 2)); ?>
                        </div>
                        <div class="profile-info">
                            <h2><?php echo sanitizeOutput($currentUser['username']); ?></h2>
                            <p class="profile-email"><?php echo sanitizeOutput($currentUser['email']); ?></p>
                            <p class="profile-role">Role: <?php echo ucfirst(sanitizeOutput($currentUser['role'])); ?></p>
                            <p class="profile-joined">
                                Member since <?php echo date('F j, Y', strtotime($currentUser['created_at'])); ?>
                            </p>
                        </div>
                    </div>
                    
                    <!-- Profile Stats -->
                    <div class="profile-stats">
                        <div class="stat-item">
                            <span class="stat-number"><?php echo $stats['post_count']; ?></span>
                            <span class="stat-label">Blog Posts</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-number"><?php echo date('j', strtotime($currentUser['created_at'])); ?></span>
                            <span class="stat-label">Days Active</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-number"><?php echo strlen($currentUser['username']); ?></span>
                            <span class="stat-label">Username Length</span>
                        </div>
                    </div>
                </div>
                
                <!-- Account Settings -->
                <div class="settings-section">
                    <h3>Account Settings</h3>
                    
                    <!-- Update Profile Form -->
                    <form id="updateProfileForm" class="settings-form" novalidate>
                        <div id="profileErrorContainer" class="mb-3"></div>
                        
                        <div class="form-group">
                            <label for="username" class="form-label">Username</label>
                            <input 
                                type="text" 
                                id="username" 
                                name="username" 
                                class="form-input" 
                                value="<?php echo sanitizeOutput($currentUser['username']); ?>"
                                required 
                                minlength="3"
                                maxlength="50"
                                pattern="[a-zA-Z0-9_]+"
                                title="Username can only contain letters, numbers, and underscores"
                            >
                            <small class="form-help">3-50 characters, letters, numbers, and underscores only</small>
                        </div>
                        
                        <div class="form-group">
                            <label for="email" class="form-label">Email Address</label>
                            <input 
                                type="email" 
                                id="email" 
                                name="email" 
                                class="form-input" 
                                value="<?php echo sanitizeOutput($currentUser['email']); ?>"
                                required
                            >
                            <small class="form-help">We'll never share your email with anyone else</small>
                        </div>
                        
                        <button type="submit" class="btn btn-primary">
                            Update Profile
                        </button>
                    </form>
                    
                    <!-- Change Password Form -->
                    <form id="changePasswordForm" class="settings-form" novalidate>
                        <h4>Change Password</h4>
                        
                        <div id="passwordErrorContainer" class="mb-3"></div>
                        
                        <div class="form-group">
                            <label for="currentPassword" class="form-label">Current Password</label>
                            <input 
                                type="password" 
                                id="currentPassword" 
                                name="currentPassword" 
                                class="form-input" 
                                required
                            >
                        </div>
                        
                        <div class="form-group">
                            <label for="newPassword" class="form-label">New Password</label>
                            <input 
                                type="password" 
                                id="newPassword" 
                                name="newPassword" 
                                class="form-input" 
                                required 
                                minlength="8"
                            >
                            <small class="form-help">At least 8 characters long</small>
                        </div>
                        
                        <div class="form-group">
                            <label for="confirmPassword" class="form-label">Confirm New Password</label>
                            <input 
                                type="password" 
                                id="confirmPassword" 
                                name="confirmPassword" 
                                class="form-input" 
                                required
                            >
                        </div>
                        
                        <button type="submit" class="btn btn-secondary">
                            Change Password
                        </button>
                    </form>
                    
                    <!-- Danger Zone -->
                    <div class="danger-zone">
                        <h4>Danger Zone</h4>
                        <p>Once you delete your account, there is no going back. Please be certain.</p>
                        <button onclick="deleteAccount()" class="btn btn-danger">
                            Delete Account
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <!-- JavaScript -->
    <script src="../js/main.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const updateProfileForm = document.getElementById('updateProfileForm');
            const changePasswordForm = document.getElementById('changePasswordForm');
            const profileErrorContainer = document.getElementById('profileErrorContainer');
            const passwordErrorContainer = document.getElementById('passwordErrorContainer');
            
            // Update Profile Form
            updateProfileForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const formData = new FormData(this);
                const data = {
                    action: 'update_profile',
                    username: formData.get('username').trim(),
                    email: formData.get('email').trim()
                };
                
                const submitButton = this.querySelector('button[type="submit"]');
                
                try {
                    BlogApp.setLoading(submitButton, true);
                    profileErrorContainer.innerHTML = '';
                    
                    // Client-side validation
                    if (!data.username || data.username.length < 3) {
                        throw new Error('Username must be at least 3 characters long');
                    }
                    
                    if (!FormValidator.validateEmail(data.email)) {
                        throw new Error('Please enter a valid email address');
                    }
                    
                    const response = await fetch('../php/auth.php', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(data)
                    });
                    
                    const result = await response.json();
                    
                    if (result.success) {
                        BlogApp.showAlert('Profile updated successfully!', 'success');
                        setTimeout(() => {
                            window.location.reload();
                        }, 1500);
                    } else {
                        throw new Error(result.message || 'Failed to update profile');
                    }
                    
                } catch (error) {
                    console.error('Error:', error);
                    profileErrorContainer.innerHTML = `<div class="alert alert-error">${error.message}</div>`;
                } finally {
                    BlogApp.setLoading(submitButton, false);
                }
            });
            
            // Change Password Form
            changePasswordForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const formData = new FormData(this);
                const data = {
                    action: 'change_password',
                    currentPassword: formData.get('currentPassword'),
                    newPassword: formData.get('newPassword'),
                    confirmPassword: formData.get('confirmPassword')
                };
                
                const submitButton = this.querySelector('button[type="submit"]');
                
                try {
                    BlogApp.setLoading(submitButton, true);
                    passwordErrorContainer.innerHTML = '';
                    
                    // Client-side validation
                    if (data.newPassword !== data.confirmPassword) {
                        throw new Error('New passwords do not match');
                    }
                    
                    if (data.newPassword.length < 8) {
                        throw new Error('New password must be at least 8 characters long');
                    }
                    
                    const response = await fetch('../php/auth.php', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(data)
                    });
                    
                    const result = await response.json();
                    
                    if (result.success) {
                        BlogApp.showAlert('Password changed successfully!', 'success');
                        this.reset();
                    } else {
                        throw new Error(result.message || 'Failed to change password');
                    }
                    
                } catch (error) {
                    console.error('Error:', error);
                    passwordErrorContainer.innerHTML = `<div class="alert alert-error">${error.message}</div>`;
                } finally {
                    BlogApp.setLoading(submitButton, false);
                }
            });
            
            // Form validation
            const usernameInput = document.getElementById('username');
            const emailInput = document.getElementById('email');
            
            usernameInput.addEventListener('input', function() {
                const isValid = this.value.length >= 3 && /^[a-zA-Z0-9_]+$/.test(this.value);
                this.style.borderColor = isValid ? '#10b981' : '#ef4444';
            });
            
            emailInput.addEventListener('input', function() {
                const isValid = FormValidator.validateEmail(this.value);
                this.style.borderColor = isValid ? '#10b981' : '#ef4444';
            });
        });
        
        // Delete Account Function
        function deleteAccount() {
            const confirmation = prompt('This action cannot be undone. Type "DELETE" to confirm:');
            
            if (confirmation === 'DELETE') {
                if (confirm('Are you absolutely sure? This will permanently delete your account and all your blog posts.')) {
                    fetch('../php/auth.php', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            action: 'delete_account'
                        })
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            BlogApp.showAlert('Account deleted successfully. Goodbye!', 'success');
                            setTimeout(() => {
                                window.location.href = '../index.php';
                            }, 2000);
                        } else {
                            BlogApp.showAlert(data.message || 'Failed to delete account.', 'error');
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        BlogApp.showAlert('An error occurred. Please try again.', 'error');
                    });
                }
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
        .profile-container {
            max-width: 800px;
            margin: 0 auto;
        }
        
        .profile-card {
            background: white;
            border-radius: 0.5rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            padding: 2rem;
            margin-bottom: 2rem;
        }
        
        .profile-header {
            display: flex;
            align-items: center;
            gap: 2rem;
            margin-bottom: 2rem;
        }
        
        .profile-avatar {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: linear-gradient(135deg, #2563eb, #3b82f6);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 2rem;
            font-weight: bold;
            flex-shrink: 0;
        }
        
        .profile-info h2 {
            margin: 0 0 0.5rem 0;
            color: #1f2937;
        }
        
        .profile-email {
            color: #6b7280;
            margin: 0 0 0.25rem 0;
            font-size: 1.1rem;
        }
        
        .profile-role,
        .profile-joined {
            color: #9ca3af;
            margin: 0;
            font-size: 0.875rem;
        }
        
        .profile-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 1rem;
            padding-top: 2rem;
            border-top: 1px solid #e5e7eb;
        }
        
        .stat-item {
            text-align: center;
        }
        
        .stat-number {
            display: block;
            font-size: 2rem;
            font-weight: bold;
            color: #2563eb;
        }
        
        .stat-label {
            font-size: 0.875rem;
            color: #6b7280;
        }
        
        .settings-section {
            background: white;
            border-radius: 0.5rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            padding: 2rem;
        }
        
        .settings-section h3 {
            margin: 0 0 2rem 0;
            color: #1f2937;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 1rem;
        }
        
        .settings-form {
            margin-bottom: 3rem;
        }
        
        .settings-form h4 {
            margin: 0 0 1.5rem 0;
            color: #374151;
            font-size: 1.125rem;
        }
        
        .form-help {
            font-size: 0.875rem;
            color: #6b7280;
            margin-top: 0.25rem;
            display: block;
        }
        
        .danger-zone {
            border: 1px solid #fecaca;
            border-radius: 0.5rem;
            padding: 1.5rem;
            background: #fef2f2;
        }
        
        .danger-zone h4 {
            color: #dc2626;
            margin: 0 0 0.5rem 0;
        }
        
        .danger-zone p {
            color: #7f1d1d;
            margin: 0 0 1rem 0;
            font-size: 0.875rem;
        }
        
        @media (max-width: 768px) {
            .profile-header {
                flex-direction: column;
                text-align: center;
                gap: 1rem;
            }
            
            .profile-stats {
                grid-template-columns: repeat(3, 1fr);
            }
            
            .profile-card,
            .settings-section {
                padding: 1.5rem;
            }
        }
        
        @media (max-width: 480px) {
            .profile-avatar {
                width: 60px;
                height: 60px;
                font-size: 1.5rem;
            }
            
            .profile-stats {
                grid-template-columns: 1fr;
            }
            
            .profile-card,
            .settings-section {
                padding: 1rem;
            }
        }
    </style>
</body>
</html>