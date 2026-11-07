package com.blogapp.user;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name="author_follows", uniqueConstraints=@UniqueConstraint(name="uk_author_follow", columnNames={"author_id", "follower_id"}))
public class AuthorFollow {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="author_id", nullable=false) private AppUser author;
    @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="follower_id", nullable=false) private AppUser follower;
    @Column(nullable=false, updatable=false) private Instant createdAt=Instant.now();
    protected AuthorFollow() {}
    public AuthorFollow(AppUser author, AppUser follower) { this.author=author; this.follower=follower; }
    public Long getId() { return id; }
    public AppUser getAuthor() { return author; }
    public AppUser getFollower() { return follower; }
    public Instant getCreatedAt() { return createdAt; }
}
