package com.blogapp.post;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController
@RequestMapping("/api/posts")
public class PostController {
    private final PostService posts;
    public PostController(PostService posts) { this.posts = posts; }

    @GetMapping
    public PostDtos.PageResponse<PostDtos.PostResponse> list(@RequestParam(defaultValue="") String query,
            @RequestParam(defaultValue="") String category,
            @RequestParam(defaultValue="0") int page, @RequestParam(defaultValue="9") int size) {
        return posts.list(query, category, page, size);
    }

    @GetMapping("/mine")
    @SecurityRequirement(name = "bearerAuth")
    public List<PostDtos.PostResponse> mine(@AuthenticationPrincipal UserDetails user) { return posts.mine(user.getUsername()); }

    @GetMapping("/stats")
    @SecurityRequirement(name = "bearerAuth")
    public PostDtos.Stats stats(@AuthenticationPrincipal UserDetails user) { return posts.stats(user.getUsername()); }

    @GetMapping("/{id}")
    public PostDtos.PostResponse get(@PathVariable Long id) { return posts.get(id); }

    @PostMapping
    @SecurityRequirement(name = "bearerAuth")
    public PostDtos.PostResponse create(@AuthenticationPrincipal UserDetails user,
                                        @Valid @RequestBody PostDtos.SaveRequest request) {
        return posts.create(user.getUsername(), request);
    }

    @PutMapping("/{id}")
    @SecurityRequirement(name = "bearerAuth")
    public PostDtos.PostResponse update(@AuthenticationPrincipal UserDetails user, @PathVariable Long id,
                                        @Valid @RequestBody PostDtos.SaveRequest request) {
        return posts.update(user.getUsername(), id, request);
    }

    @DeleteMapping("/{id}")
    @SecurityRequirement(name = "bearerAuth")
    public void delete(@AuthenticationPrincipal UserDetails user, @PathVariable Long id) {
        posts.delete(user.getUsername(), id);
    }
}
