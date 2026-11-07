package com.blogapp.post;

import com.blogapp.user.AppUser;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "blog_posts", indexes = {
        @Index(name = "idx_posts_created_at", columnList = "created_at"),
        @Index(name = "idx_posts_user_id", columnList = "user_id")
})
public class BlogPost {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser author;
    @Column(nullable = false, length = 180)
    private String title;
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;
    @Column(length = 40)
    private String category = "Writing";
    @Column(length = 1000)
    private String imageUrl;
    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();
    @Column(nullable = false)
    private Instant updatedAt = Instant.now();

    protected BlogPost() {}

    public BlogPost(AppUser author, String title, String content, String category, String imageUrl) {
        this.author = author;
        this.title = title;
        this.content = content;
        this.category = category == null || category.isBlank() ? "Writing" : category;
        this.imageUrl = imageUrl;
    }

    public void update(String title, String content, String category, String imageUrl) {
        this.title = title;
        this.content = content;
        this.category = category == null || category.isBlank() ? "Writing" : category;
        this.imageUrl = imageUrl;
        this.updatedAt = Instant.now();
    }

    public Long getId() { return id; }
    public AppUser getAuthor() { return author; }
    public String getTitle() { return title; }
    public String getContent() { return content; }
    public String getCategory() { return category; }
    public String getImageUrl() { return imageUrl; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
