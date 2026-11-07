package com.blogapp.post;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name="post_views", indexes=@Index(name="idx_post_views_post_time", columnList="post_id, viewed_at"))
public class PostView {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="post_id", nullable=false) private BlogPost post;
    @Column(name="viewed_at", nullable=false, updatable=false) private Instant viewedAt=Instant.now();
    protected PostView() {}
    public PostView(BlogPost post) { this.post=post; }
}
