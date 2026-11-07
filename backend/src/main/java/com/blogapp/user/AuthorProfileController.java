package com.blogapp.user;

import com.blogapp.common.ApiException;
import com.blogapp.post.PostDtos;
import com.blogapp.post.PostRepository;
import java.time.Instant;
import java.util.List;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/authors")
public class AuthorProfileController {
    private final UserRepository users; private final AuthorFollowRepository follows; private final PostRepository posts;
    public AuthorProfileController(UserRepository users,AuthorFollowRepository follows,PostRepository posts){this.users=users;this.follows=follows;this.posts=posts;}
    @GetMapping("/{authorId}") public Profile get(@PathVariable Long authorId){
        AppUser author=users.findById(authorId).orElseThrow(()->ApiException.notFound("Author not found"));
        List<PostDtos.PostResponse> published=posts.findDetailedByAuthorId(authorId).stream()
                .filter(p->p.getStatus().equals("PUBLISHED")&&p.getVisibility().equals("PUBLIC")&&(p.getPublishedAt()==null||!p.getPublishedAt().isAfter(Instant.now())))
                .map(PostDtos.PostResponse::from).toList();
        long views=published.stream().mapToLong(PostDtos.PostResponse::viewCount).sum();
        return new Profile(author.getId(),author.getUsername(),author.getBio(),author.getAvatarUrl(),author.getWebsiteUrl(),author.getSocialLinks(),
                follows.countByAuthorId(authorId),follows.countByFollowerId(authorId),views,published);
    }
    public record Profile(Long id,String username,String bio,String avatarUrl,String websiteUrl,String socialLinks,
                          long followers,long following,long views,List<PostDtos.PostResponse> articles){}
}
