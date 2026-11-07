package com.blogapp.post;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import com.blogapp.common.ApiException;
import com.blogapp.user.AppUser;
import com.blogapp.user.UserRepository;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class PostServiceTest {
    @Mock PostRepository posts;
    @Mock UserRepository users;
    @InjectMocks PostService service;

    @Test
    void rejectsEditingAnotherAuthorsPost() {
        AppUser owner = new AppUser("owner", "owner@example.com", "hash");
        BlogPost post = new BlogPost(owner, "Title", "Content", "Writing", null, java.util.Set.of(), "PUBLISHED", "PUBLIC", false, null);
        when(posts.findDetailedById(5L)).thenReturn(Optional.of(post));

        assertThatThrownBy(() -> service.update("someone-else", 5L,
                new PostDtos.SaveRequest("Changed", "Content", "Writing", null, java.util.Set.of(), "PUBLISHED", "PUBLIC", false, null)))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("another author's post");
    }
}
