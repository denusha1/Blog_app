package com.blogapp.user;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "users", uniqueConstraints = {
        @UniqueConstraint(name = "uk_users_username", columnNames = "username"),
        @UniqueConstraint(name = "uk_users_email", columnNames = "email")
})
public class AppUser {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, length = 50)
    private String username;
    @Column(nullable = false, length = 255)
    private String email;
    @Column(nullable = false)
    private String password;
    @Column(nullable = false, length = 20)
    private String role = "USER";
    @Column(nullable=false) private boolean enabled=true;
    @Column(length=500) private String bio;
    @Column(length=1000) private String avatarUrl;
    @Column(length=300) private String websiteUrl;
    @Column(length=300) private String socialLinks;
    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    protected AppUser() {}

    public AppUser(String username, String email, String password) {
        this.username = username;
        this.email = email;
        this.password = password;
    }

    public Long getId() { return id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getRole() { return role; }
    public void setRole(String role){this.role=role;} public boolean isEnabled(){return enabled;} public void setEnabled(boolean enabled){this.enabled=enabled;}
    public String getBio(){return bio;} public void setBio(String bio){this.bio=bio;}
    public String getAvatarUrl(){return avatarUrl;} public void setAvatarUrl(String avatarUrl){this.avatarUrl=avatarUrl;}
    public String getWebsiteUrl(){return websiteUrl;} public void setWebsiteUrl(String websiteUrl){this.websiteUrl=websiteUrl;}
    public String getSocialLinks(){return socialLinks;} public void setSocialLinks(String socialLinks){this.socialLinks=socialLinks;}
    public Instant getCreatedAt() { return createdAt; }
}
