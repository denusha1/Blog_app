package com.blogapp.post;

import com.blogapp.user.AppUser;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.Set;
import org.hibernate.annotations.ColumnDefault;

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
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "blog_post_tags", joinColumns = @JoinColumn(name = "post_id"))
    @Column(name = "tag", nullable = false, length = 40)
    private Set<String> tags = new LinkedHashSet<>();
    @Column(nullable = false, length = 20)
    @ColumnDefault("'PUBLISHED'")
    private String status = "PUBLISHED";
    @Column(nullable = false, length = 20)
    @ColumnDefault("'PUBLIC'")
    private String visibility = "PUBLIC";
    @Column(nullable = false)
    @ColumnDefault("false")
    private boolean featured;
    @Column(nullable = false)
    @ColumnDefault("0")
    private long viewCount;
    private Instant scheduledAt;
    private Instant publishedAt = Instant.now();
    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();
    @Column(nullable = false)
    private Instant updatedAt = Instant.now();

    protected BlogPost() {}

    public BlogPost(AppUser author, String title, String content, String category, String imageUrl,
                    Set<String> tags, String status, String visibility, boolean featured, Instant scheduledAt) {
        this.author = author;
        this.title = title;
        this.content = content;
        this.category = category == null || category.isBlank() ? "Writing" : category;
        this.imageUrl = imageUrl;
        this.tags = tags == null ? new LinkedHashSet<>() : new LinkedHashSet<>(tags);
        this.featured = featured;
        applyStatus(status, visibility, scheduledAt, true);
    }

    public void update(String title, String content, String category, String imageUrl,
                       Set<String> tags, String status, String visibility, boolean featured, Instant scheduledAt) {
        this.title = title;
        this.content = content;
        this.category = category == null || category.isBlank() ? "Writing" : category;
        this.imageUrl = imageUrl;
        this.tags = tags == null ? new LinkedHashSet<>() : new LinkedHashSet<>(tags);
        this.featured = featured;
        applyStatus(status, visibility, scheduledAt, false);
        this.updatedAt = Instant.now();
    }

    public void publishScheduled() {
        this.status = "PUBLISHED";
        this.publishedAt = Instant.now();
        this.scheduledAt = null;
        this.updatedAt = Instant.now();
    }
    public void moderate(boolean approved) {
        this.status=approved?"PUBLISHED":"DRAFT";
        this.visibility="PUBLIC";
        this.publishedAt=approved?Instant.now():null;
        this.scheduledAt=null;
        this.updatedAt=Instant.now();
    }
    public void setCategory(String category){if(category!=null&&!category.isBlank())this.category=category.trim();this.updatedAt=Instant.now();}

    public void recordView() { this.viewCount++; }

    private void applyStatus(String nextStatus, String nextVisibility, Instant nextScheduledAt, boolean creating) {
        String normalizedStatus = nextStatus == null || nextStatus.isBlank() ? "PUBLISHED" : nextStatus.toUpperCase();
        String normalizedVisibility = nextVisibility == null || nextVisibility.isBlank() ? "PUBLIC" : nextVisibility.toUpperCase();
        if (!java.util.Set.of("DRAFT", "SCHEDULED", "PUBLISHED").contains(normalizedStatus)) {
            throw new IllegalArgumentException("Status must be DRAFT, SCHEDULED, or PUBLISHED");
        }
        if (!java.util.Set.of("PUBLIC", "PRIVATE").contains(normalizedVisibility)) {
            throw new IllegalArgumentException("Visibility must be PUBLIC or PRIVATE");
        }
        if (normalizedStatus.equals("SCHEDULED") && (nextScheduledAt == null || !nextScheduledAt.isAfter(Instant.now()))) {
            throw new IllegalArgumentException("Scheduled publishing needs a future date and time");
        }
        if (!creating && normalizedStatus.equals("PUBLISHED") && !"PUBLISHED".equals(this.status)) {
            this.publishedAt = Instant.now();
        } else if (normalizedStatus.equals("DRAFT") || normalizedStatus.equals("SCHEDULED")) {
            this.publishedAt = null;
        } else if (creating) {
            this.publishedAt = Instant.now();
        }
        this.status = normalizedStatus;
        this.visibility = normalizedVisibility;
        this.scheduledAt = normalizedStatus.equals("SCHEDULED") ? nextScheduledAt : null;
    }

    public Long getId() { return id; }
    public AppUser getAuthor() { return author; }
    public String getTitle() { return title; }
    public String getContent() { return content; }
    public String getCategory() { return category; }
    public String getImageUrl() { return imageUrl; }
    public Set<String> getTags() { return Set.copyOf(tags); }
    public String getStatus() { return status; }
    public String getVisibility() { return visibility; }
    public boolean isFeatured() { return featured; }
    public long getViewCount() { return viewCount; }
    public Instant getScheduledAt() { return scheduledAt; }
    public Instant getPublishedAt() { return publishedAt; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
