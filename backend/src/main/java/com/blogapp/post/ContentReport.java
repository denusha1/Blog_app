package com.blogapp.post;

import com.blogapp.user.AppUser;
import jakarta.persistence.*;
import java.time.Instant;

@Entity @Table(name="content_reports",indexes=@Index(name="idx_reports_created",columnList="created_at"))
public class ContentReport {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="post_id",nullable=false) private BlogPost post;
    @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="reporter_id",nullable=false) private AppUser reporter;
    @Column(nullable=false,length=500) private String reason;
    @Column(nullable=false) private boolean resolved;
    @Column(nullable=false,updatable=false) private Instant createdAt=Instant.now();
    protected ContentReport(){}
    public ContentReport(BlogPost post,AppUser reporter,String reason){this.post=post;this.reporter=reporter;this.reason=reason;}
    public Long getId(){return id;} public BlogPost getPost(){return post;} public AppUser getReporter(){return reporter;}
    public String getReason(){return reason;} public boolean isResolved(){return resolved;} public Instant getCreatedAt(){return createdAt;} public void resolve(){resolved=true;}
}
