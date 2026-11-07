package com.blogapp.user;

import com.blogapp.common.ApiException;
import com.blogapp.post.*;
import jakarta.transaction.Transactional;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/admin") @PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    private final UserRepository users;private final PostRepository posts;private final PostReactionRepository reactions;private final ContentReportRepository reports;
    public AdminController(UserRepository users,PostRepository posts,PostReactionRepository reactions,ContentReportRepository reports){this.users=users;this.posts=posts;this.reactions=reactions;this.reports=reports;}
    @GetMapping("/users") public List<UserDto> users(){return users.findAll().stream().map(UserDto::from).toList();}
    @PatchMapping("/users/{id}") @Transactional public UserDto updateUser(@PathVariable Long id,@RequestBody UserUpdate request,@AuthenticationPrincipal UserDetails principal){
        AppUser user=users.findById(id).orElseThrow(()->ApiException.notFound("User not found"));
        if(user.getUsername().equalsIgnoreCase(principal.getUsername())&&(Boolean.FALSE.equals(request.enabled())||"USER".equalsIgnoreCase(request.role())))throw ApiException.badRequest("You cannot remove your own administrator access");
        if(request.role()!=null){String role=request.role().toUpperCase();if(!List.of("USER","ADMIN").contains(role))throw ApiException.badRequest("Role must be USER or ADMIN");user.setRole(role);}
        if(request.enabled()!=null)user.setEnabled(request.enabled());return UserDto.from(user);
    }
    @GetMapping("/posts") @Transactional public List<PostDtos.PostResponse> posts(){return posts.findAll().stream().map(PostDtos.PostResponse::from).toList();}
    @PatchMapping("/posts/{id}/moderation") @Transactional public PostDtos.PostResponse moderate(@PathVariable Long id,@RequestBody Moderation request){
        BlogPost post=posts.findDetailedById(id).orElseThrow(()->ApiException.notFound("Post not found"));
        if(request.category()!=null&&!request.category().isBlank())post.setCategory(request.category());
        if(request.approved()!=null)post.moderate(request.approved());return PostDtos.PostResponse.from(post);
    }
    @PatchMapping("/posts/{id}/category") @Transactional public PostDtos.PostResponse setCategory(@PathVariable Long id,@RequestBody CategoryUpdate request){
        BlogPost post=posts.findDetailedById(id).orElseThrow(()->ApiException.notFound("Article not found"));
        if(request.category()==null||request.category().isBlank()||request.category().length()>40)throw ApiException.badRequest("Category must contain 1 to 40 characters");
        post.setCategory(request.category());return PostDtos.PostResponse.from(post);
    }
    @GetMapping("/categories") public List<String> categories(){return posts.allCategories();}
    @GetMapping("/reports") @Transactional public List<ReportResponse> reports(){return reports.findForModeration().stream().map(r->new ReportResponse(r.getId(),r.getPost().getId(),r.getPost().getTitle(),r.getPost().getAuthor().getUsername(),r.getReporter().getUsername(),r.getReason(),r.isResolved(),r.getCreatedAt())).toList();}
    @PatchMapping("/reports/{id}/resolve") @Transactional public void resolve(@PathVariable Long id){reports.findById(id).orElseThrow(()->ApiException.notFound("Report not found")).resolve();}
    @GetMapping("/analytics") public PlatformAnalytics analytics(){return new PlatformAnalytics(users.count(),posts.count(),posts.totalPlatformViews(),reactions.totalReactions(),reports.count());}
    public record UserUpdate(String role,Boolean enabled){}
    public record Moderation(Boolean approved,String category){}
    public record CategoryUpdate(String category){}
    public record ReportResponse(Long id,Long postId,String postTitle,String author,String reporter,String reason,boolean resolved,java.time.Instant createdAt){}
    public record PlatformAnalytics(long users,long articles,long views,long reactions,long reports){}
}
