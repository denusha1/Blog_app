package com.blogapp.post;

import static org.assertj.core.api.Assertions.assertThat;

import com.blogapp.user.AppUser;
import java.time.Instant;
import org.junit.jupiter.api.Test;

class BlogPostTest {
    private final AppUser author = new AppUser("writer", "writer@example.com", "hash");

    @Test
    void draftHasNoPublicationTimestamp() {
        BlogPost post = new BlogPost(author, "A draft", "Notes", "Ideas", null, java.util.Set.of(), "DRAFT", "PRIVATE", false, null);

        assertThat(post.getStatus()).isEqualTo("DRAFT");
        assertThat(post.getVisibility()).isEqualTo("PRIVATE");
        assertThat(post.getPublishedAt()).isNull();
    }

    @Test
    void scheduledPostBecomesPublishedWhenTheSchedulerRunsIt() {
        BlogPost post = new BlogPost(author, "Soon", "Notes", "Ideas", null, java.util.Set.of(), "SCHEDULED", "PUBLIC", true,
                Instant.now().plusSeconds(60));

        post.publishScheduled();

        assertThat(post.getStatus()).isEqualTo("PUBLISHED");
        assertThat(post.getPublishedAt()).isNotNull();
        assertThat(post.getScheduledAt()).isNull();
    }
}
