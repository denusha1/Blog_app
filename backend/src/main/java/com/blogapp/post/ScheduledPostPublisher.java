package com.blogapp.post;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class ScheduledPostPublisher {
    private final PostService posts;
    public ScheduledPostPublisher(PostService posts) { this.posts = posts; }

    @Scheduled(fixedDelayString = "${app.posts.schedule-check-ms:30000}")
    public void publishDuePosts() { posts.publishScheduledPosts(); }
}
