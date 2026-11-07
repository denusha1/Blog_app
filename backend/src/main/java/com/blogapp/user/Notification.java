package com.blogapp.user;

import com.blogapp.post.BlogPost;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name="notifications", indexes=@Index(name="idx_notifications_recipient_created", columnList="recipient_id, created_at"))
public class Notification {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="recipient_id", nullable=false) private AppUser recipient;
    @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="actor_id", nullable=false) private AppUser actor;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="post_id") private BlogPost post;
    @Column(nullable=false, length=30) private String type;
    @Column(nullable=false, updatable=false) private Instant createdAt=Instant.now();
    private Instant readAt;
    protected Notification() {}
    public Notification(AppUser recipient, AppUser actor, BlogPost post, String type) { this.recipient=recipient; this.actor=actor; this.post=post; this.type=type; }
    public Long getId(){return id;} public AppUser getRecipient(){return recipient;} public AppUser getActor(){return actor;}
    public BlogPost getPost(){return post;} public String getType(){return type;} public Instant getCreatedAt(){return createdAt;}
    public Instant getReadAt(){return readAt;} public void markRead(){if(readAt==null)readAt=Instant.now();}
}
