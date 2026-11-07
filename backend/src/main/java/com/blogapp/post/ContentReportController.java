package com.blogapp.post;

import com.blogapp.common.ApiException;
import com.blogapp.user.AppUser;
import com.blogapp.user.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/posts/{postId}/reports")
public class ContentReportController {
    private final PostRepository posts;private final UserRepository users;private final ContentReportRepository reports;
    public ContentReportController(PostRepository posts,UserRepository users,ContentReportRepository reports){this.posts=posts;this.users=users;this.reports=reports;}
    @PostMapping public void report(@PathVariable Long postId,@Valid @RequestBody Request request,@AuthenticationPrincipal UserDetails principal){
        BlogPost post=posts.findDetailedById(postId).filter(p->p.getStatus().equals("PUBLISHED")&&p.getVisibility().equals("PUBLIC")).orElseThrow(()->ApiException.notFound("Post not found"));
        AppUser reporter=users.findByUsernameIgnoreCase(principal.getUsername()).orElseThrow(()->ApiException.notFound("Account not found"));
        if(post.getAuthor().getId().equals(reporter.getId()))throw ApiException.badRequest("You cannot report your own article");
        if(reports.existsByPost_IdAndReporter_IdAndResolvedFalse(postId,reporter.getId()))throw ApiException.conflict("You have already reported this article");
        reports.save(new ContentReport(post,reporter,request.reason().trim()));
    }
    public record Request(@NotBlank @Size(max=500) String reason){}
}
