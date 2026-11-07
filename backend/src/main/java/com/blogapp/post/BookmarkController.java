package com.blogapp.post;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import java.util.List;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/bookmarks")
@SecurityRequirement(name="bearerAuth")
public class BookmarkController {
    private final PostEngagementService engagement;
    public BookmarkController(PostEngagementService engagement) { this.engagement=engagement; }
    @GetMapping public List<PostDtos.PostResponse> list(@AuthenticationPrincipal UserDetails user) {
        return engagement.bookmarkedPosts(user.getUsername());
    }
}
