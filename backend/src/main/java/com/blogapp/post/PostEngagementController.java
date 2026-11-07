package com.blogapp.post;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/posts/{postId}")
public class PostEngagementController {
    private final PostEngagementService engagement;
    public PostEngagementController(PostEngagementService engagement) { this.engagement=engagement; }

    @GetMapping("/reactions")
    public PostDtos.ReactionSummary reactions(@PathVariable Long postId, Authentication authentication) {
        String username=authentication==null || authentication instanceof AnonymousAuthenticationToken ? null : authentication.getName();
        return engagement.reactionSummary(postId,username);
    }

    @PutMapping("/reactions") @SecurityRequirement(name="bearerAuth")
    public PostDtos.ReactionSummary react(@PathVariable Long postId, @RequestBody ReactionRequest request,
            @AuthenticationPrincipal UserDetails user) { return engagement.react(postId,user.getUsername(),request.type()); }

    @DeleteMapping("/reactions") @SecurityRequirement(name="bearerAuth")
    public PostDtos.ReactionSummary removeReaction(@PathVariable Long postId,@AuthenticationPrincipal UserDetails user) {
        return engagement.removeReaction(postId,user.getUsername());
    }

    @GetMapping("/comments")
    public List<PostDtos.CommentResponse> comments(@PathVariable Long postId) { return engagement.listComments(postId); }

    @PostMapping("/comments") @SecurityRequirement(name="bearerAuth")
    public PostDtos.CommentResponse addComment(@PathVariable Long postId,@Valid @RequestBody PostDtos.CommentRequest request,
            @AuthenticationPrincipal UserDetails user) { return engagement.addComment(postId,user.getUsername(),request); }

    @DeleteMapping("/comments/{commentId}") @SecurityRequirement(name="bearerAuth")
    public void deleteComment(@PathVariable Long postId,@PathVariable Long commentId,@AuthenticationPrincipal UserDetails user) {
        engagement.deleteComment(postId,commentId,user.getUsername());
    }

    @GetMapping("/bookmark") @SecurityRequirement(name="bearerAuth")
    public PostDtos.BookmarkState bookmark(@PathVariable Long postId,@AuthenticationPrincipal UserDetails user) {
        return engagement.bookmarkState(postId,user.getUsername());
    }

    @PutMapping("/bookmark") @SecurityRequirement(name="bearerAuth")
    public PostDtos.BookmarkState addBookmark(@PathVariable Long postId,@AuthenticationPrincipal UserDetails user) {
        return engagement.addBookmark(postId,user.getUsername());
    }

    @DeleteMapping("/bookmark") @SecurityRequirement(name="bearerAuth")
    public PostDtos.BookmarkState removeBookmark(@PathVariable Long postId,@AuthenticationPrincipal UserDetails user) {
        return engagement.removeBookmark(postId,user.getUsername());
    }

    public record ReactionRequest(String type) {}
}
