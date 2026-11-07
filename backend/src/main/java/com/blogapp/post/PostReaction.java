package com.blogapp.post;

import com.blogapp.user.AppUser;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name="post_reactions", uniqueConstraints=@UniqueConstraint(name="uk_reaction_post_user", columnNames={"post_id", "user_id"}))
public class PostReaction {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="post_id", nullable=false) private BlogPost post;
    @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="user_id", nullable=false) private AppUser user;
    @Column(nullable=false, length=20) private String type;
    @Column(nullable=false) private Instant createdAt=Instant.now();
    protected PostReaction() {}
    public PostReaction(BlogPost post, AppUser user, String type) { this.post=post; this.user=user; this.type=type; }
    public void setType(String type) { this.type=type; this.createdAt=Instant.now(); }
    public Long getId() { return id; }
    public BlogPost getPost() { return post; }
    public AppUser getUser() { return user; }
    public String getType() { return type; }
    public Instant getCreatedAt() { return createdAt; }
}
