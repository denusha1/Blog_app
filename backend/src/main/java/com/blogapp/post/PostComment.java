package com.blogapp.post;

import com.blogapp.user.AppUser;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name="post_comments", indexes=@Index(name="idx_comments_post_created", columnList="post_id, created_at"))
public class PostComment {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="post_id", nullable=false) private BlogPost post;
    @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="user_id", nullable=false) private AppUser author;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="parent_id") private PostComment parent;
    @Column(nullable=false, columnDefinition="TEXT") private String content;
    @Column(nullable=false) private boolean deleted;
    @Column(nullable=false, updatable=false) private Instant createdAt=Instant.now();
    protected PostComment() {}
    public PostComment(BlogPost post, AppUser author, PostComment parent, String content) {
        this.post=post; this.author=author; this.parent=parent; this.content=content;
    }
    public void markDeleted() { this.deleted=true; this.content=""; }
    public Long getId() { return id; }
    public BlogPost getPost() { return post; }
    public AppUser getAuthor() { return author; }
    public PostComment getParent() { return parent; }
    public String getContent() { return content; }
    public boolean isDeleted() { return deleted; }
    public Instant getCreatedAt() { return createdAt; }
}
