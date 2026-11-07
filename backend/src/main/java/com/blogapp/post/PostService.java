package com.blogapp.post;

import com.blogapp.common.ApiException;
import com.blogapp.user.AppUser;
import com.blogapp.user.UserRepository;
import jakarta.transaction.Transactional;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

@Service
public class PostService {
    private final PostRepository posts;
    private final UserRepository users;
    public PostService(PostRepository posts, UserRepository users) { this.posts = posts; this.users = users; }

    public PostDtos.PageResponse<PostDtos.PostResponse> list(String query, String category, int page, int size) {
        int safePage = Math.max(0, page);
        int safeSize = Math.min(50, Math.max(1, size));
        Page<BlogPost> result = posts.search(query == null ? "" : query.trim(),
                category == null ? "" : category.trim(), PageRequest.of(safePage, safeSize));
        return new PostDtos.PageResponse<>(result.getContent().stream().map(PostDtos.PostResponse::from).toList(),
                result.getNumber(), result.getSize(), result.getTotalElements(), result.getTotalPages());
    }

    public PostDtos.PostResponse get(Long id) {
        return posts.findDetailedById(id).map(PostDtos.PostResponse::from)
                .orElseThrow(() -> ApiException.notFound("Post not found"));
    }

    public List<PostDtos.PostResponse> mine(String username) {
        AppUser author = user(username);
        return posts.findDetailedByAuthorId(author.getId()).stream().map(PostDtos.PostResponse::from).toList();
    }

    public PostDtos.Stats stats(String username) {
        AppUser author = user(username);
        List<PostDtos.MonthCount> months = posts.monthlyPostCounts(author.getId()).stream()
                .map(row -> new PostDtos.MonthCount((String) row[0], ((Number) row[1]).longValue())).toList();
        long count = posts.countByAuthorId(author.getId());
        return new PostDtos.Stats(count, count, months);
    }

    @Transactional
    public PostDtos.PostResponse create(String username, PostDtos.SaveRequest request) {
        AppUser author = user(username);
        BlogPost saved = posts.save(new BlogPost(author, request.title().trim(), request.content().trim(), request.category(), request.imageUrl()));
        return PostDtos.PostResponse.from(saved);
    }

    @Transactional
    public PostDtos.PostResponse update(String username, Long id, PostDtos.SaveRequest request) {
        BlogPost post = ownedPost(username, id);
        post.update(request.title().trim(), request.content().trim(), request.category(), request.imageUrl());
        return PostDtos.PostResponse.from(post);
    }

    @Transactional
    public void delete(String username, Long id) { posts.delete(ownedPost(username, id)); }

    private BlogPost ownedPost(String username, Long id) {
        BlogPost post = posts.findDetailedById(id).orElseThrow(() -> ApiException.notFound("Post not found"));
        if (!post.getAuthor().getUsername().equalsIgnoreCase(username)) throw ApiException.forbidden("You cannot change another author's post");
        return post;
    }

    private AppUser user(String username) {
        return users.findByUsernameIgnoreCase(username).orElseThrow(() -> ApiException.notFound("Account not found"));
    }
}
