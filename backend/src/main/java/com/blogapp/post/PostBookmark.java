package com.blogapp.post;

import com.blogapp.user.AppUser;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name="post_bookmarks", uniqueConstraints=@UniqueConstraint(name="uk_bookmark_post_user", columnNames={"post_id", "user_id"}))
public class PostBookmark {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="post_id", nullable=false) private BlogPost post;
    @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="user_id", nullable=false) private AppUser user;
    @Column(nullable=false, updatable=false) private Instant createdAt=Instant.now();
    protected PostBookmark() {}
    public PostBookmark(BlogPost post, AppUser user) { this.post=post; this.user=user; }
    public Long getId() { return id; }
    public BlogPost getPost() { return post; }
    public AppUser getUser() { return user; }
}
