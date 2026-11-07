package com.blogapp.post;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.Authentication;
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
import java.time.Instant;

@RestController
@RequestMapping("/api/posts")
public class PostController {
    private final PostService posts;
    public PostController(PostService posts) { this.posts = posts; }

    @GetMapping
    public PostDtos.PageResponse<PostDtos.PostResponse> list(@RequestParam(defaultValue="") String query,
            @RequestParam(defaultValue="") String category,
            @RequestParam(defaultValue="") String tag, @RequestParam(defaultValue="") String author,
            @RequestParam(required=false) Instant from, @RequestParam(required=false) Instant to,
            @RequestParam(defaultValue="latest") String sort,
            @RequestParam(defaultValue="0") int page, @RequestParam(defaultValue="9") int size) {
        return posts.list(query, category, tag, author, from, to, sort, page, size);
    }

    @GetMapping("/trending")
    public List<PostDtos.PostResponse> trending() { return posts.trending(); }

    @GetMapping("/latest")
    public List<PostDtos.PostResponse> latest() { return posts.latest(); }

    @GetMapping("/tags")
    public List<String> tags() { return posts.publicTags(); }

    @GetMapping("/{id}/related")
    public List<PostDtos.PostResponse> related(@PathVariable Long id) { return posts.related(id); }

    @PostMapping("/{id}/view")
    public void recordView(@PathVariable Long id) { posts.recordView(id); }

    @GetMapping("/mine")
    @SecurityRequirement(name = "bearerAuth")
    public List<PostDtos.PostResponse> mine(@AuthenticationPrincipal UserDetails user) { return posts.mine(user.getUsername()); }

    @GetMapping("/stats")
    @SecurityRequirement(name = "bearerAuth")
    public PostDtos.Stats stats(@AuthenticationPrincipal UserDetails user) { return posts.stats(user.getUsername()); }

    @GetMapping("/{id}")
    public PostDtos.PostResponse get(@PathVariable Long id, Authentication authentication) {
        String username = authentication == null ? null : authentication.getName();
        return posts.get(id, username);
    }

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
