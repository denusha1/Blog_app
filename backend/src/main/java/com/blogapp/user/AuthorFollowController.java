package com.blogapp.user;

import com.blogapp.post.PostDtos;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import java.util.List;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/authors")
public class AuthorFollowController {
    private final AuthorFollowService follows;
    public AuthorFollowController(AuthorFollowService follows) { this.follows=follows; }

    @GetMapping("/following") @SecurityRequirement(name="bearerAuth")
    public List<PostDtos.FollowedAuthor> following(@AuthenticationPrincipal UserDetails user) { return follows.following(user.getUsername()); }

    @GetMapping("/{authorId}/follow")
    public PostDtos.FollowState state(@PathVariable Long authorId, Authentication authentication) {
        String username=authentication==null || authentication instanceof AnonymousAuthenticationToken ? null : authentication.getName();
        return follows.state(authorId,username);
    }

    @PutMapping("/{authorId}/follow") @SecurityRequirement(name="bearerAuth")
    public PostDtos.FollowState follow(@PathVariable Long authorId,@AuthenticationPrincipal UserDetails user) {
        return follows.follow(authorId,user.getUsername());
    }

    @DeleteMapping("/{authorId}/follow") @SecurityRequirement(name="bearerAuth")
    public PostDtos.FollowState unfollow(@PathVariable Long authorId,@AuthenticationPrincipal UserDetails user) {
        return follows.unfollow(authorId,user.getUsername());
    }
}
