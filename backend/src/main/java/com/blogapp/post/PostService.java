package com.blogapp.post;

import com.blogapp.common.ApiException;
import com.blogapp.user.AppUser;
import com.blogapp.user.UserRepository;
import com.blogapp.user.AuthorFollowRepository;
import com.blogapp.user.NotificationService;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;
import java.time.Instant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

@Service
public class PostService {
    private final PostRepository posts;
    private final UserRepository users;
    private final PostViewRepository views;
    private final PostReactionRepository reactions;
    private final PostCommentRepository comments;
    private final AuthorFollowRepository follows;
    private final NotificationService notifications;
    public PostService(PostRepository posts, UserRepository users, PostViewRepository views,
                       PostReactionRepository reactions, PostCommentRepository comments,
                       AuthorFollowRepository follows, NotificationService notifications) {
        this.posts = posts; this.users = users; this.views=views; this.reactions=reactions; this.comments=comments;
        this.follows=follows; this.notifications=notifications;
    }

    public PostDtos.PageResponse<PostDtos.PostResponse> list(String query, String category, String tag, String author,
            Instant fromDate, Instant toDate, String sort, int page, int size) {
        int safePage = Math.max(0, page);
        int safeSize = Math.min(50, Math.max(1, size));
        PageRequest pageable = PageRequest.of(safePage, safeSize);
        String normalizedQuery = query == null ? "" : query.trim();
        String normalizedCategory = category == null ? "" : category.trim();
        String normalizedTag = tag == null ? "" : tag.trim();
        String normalizedAuthor = author == null ? "" : author.trim();
        Instant safeFrom = fromDate == null ? Instant.parse("0001-01-01T00:00:00Z") : fromDate;
        Instant safeTo = toDate == null ? Instant.parse("9999-12-31T23:59:59Z") : toDate;
        Page<BlogPost> result = "trending".equalsIgnoreCase(sort)
                ? posts.searchTrending(normalizedQuery, normalizedCategory, normalizedTag, normalizedAuthor, safeFrom, safeTo, pageable)
                : posts.search(normalizedQuery, normalizedCategory, normalizedTag, normalizedAuthor, safeFrom, safeTo, pageable);
        return new PostDtos.PageResponse<>(result.getContent().stream().map(PostDtos.PostResponse::from).toList(),
                result.getNumber(), result.getSize(), result.getTotalElements(), result.getTotalPages());
    }

    public PostDtos.PostResponse get(Long id, String requestingUsername) {
        BlogPost post = posts.findDetailedById(id).orElseThrow(() -> ApiException.notFound("Post not found"));
        boolean publicPost = post.getStatus().equals("PUBLISHED") && post.getVisibility().equals("PUBLIC") &&
                (post.getPublishedAt() == null || !post.getPublishedAt().isAfter(java.time.Instant.now()));
        boolean owner = requestingUsername != null && post.getAuthor().getUsername().equalsIgnoreCase(requestingUsername);
        if (!publicPost && !owner) throw ApiException.notFound("Post not found");
        return PostDtos.PostResponse.from(post);
    }

    public List<PostDtos.PostResponse> trending() {
        return posts.findTrending(PageRequest.of(0, 6)).stream().map(PostDtos.PostResponse::from).toList();
    }

    public List<PostDtos.PostResponse> latest() {
        return posts.findLatest(PageRequest.of(0, 6)).stream().map(PostDtos.PostResponse::from).toList();
    }

    public List<PostDtos.PostResponse> related(Long id) {
        BlogPost post = posts.findDetailedById(id).filter(this::isPublicPost)
                .orElseThrow(() -> ApiException.notFound("Post not found"));
        return posts.findRelated(id, post.getCategory(), post.getAuthor().getId(), PageRequest.of(0, 3))
                .stream().map(PostDtos.PostResponse::from).toList();
    }

    public List<String> publicTags() { return posts.findPublicTags(); }

    @Transactional
    public void recordView(Long id) {
        BlogPost post = posts.findDetailedById(id).filter(this::isPublicPost)
                .orElseThrow(() -> ApiException.notFound("Post not found"));
        post.recordView();
        views.save(new PostView(post));
    }

    public List<PostDtos.PostResponse> mine(String username) {
        AppUser author = user(username);
        return posts.findDetailedByAuthorId(author.getId()).stream().map(PostDtos.PostResponse::from).toList();
    }

    public PostDtos.Stats stats(String username) {
        AppUser author = user(username);
        List<BlogPost> authorPosts=posts.findDetailedByAuthorId(author.getId());
        List<PostDtos.MonthCount> months = posts.monthlyPostCounts(author.getId()).stream()
                .map(row -> new PostDtos.MonthCount((String) row[0], ((Number) row[1]).longValue())).toList();
        List<PostDtos.MonthCount> readership=views.monthlyViews(author.getId()).stream()
                .map(row -> new PostDtos.MonthCount((String) row[0], ((Number) row[1]).longValue())).toList();
        long count = posts.countByAuthorId(author.getId());
        long totalViews=authorPosts.stream().mapToLong(BlogPost::getViewCount).sum();
        long likes=reactions.countForAuthor(author.getId());
        long commentsCount=comments.countForAuthor(author.getId());
        List<PostDtos.PostResponse> popular=authorPosts.stream().filter(p -> p.getStatus().equals("PUBLISHED"))
                .sorted(java.util.Comparator.comparingLong(BlogPost::getViewCount).reversed()).limit(5)
                .map(PostDtos.PostResponse::from).toList();
        double engagement=totalViews==0?0:Math.round((likes+commentsCount)*10000.0/totalViews)/100.0;
        return new PostDtos.Stats(count, posts.countByAuthorIdAndStatus(author.getId(), "PUBLISHED"),
                posts.countByAuthorIdAndStatus(author.getId(), "DRAFT"),
                posts.countByAuthorIdAndStatus(author.getId(), "SCHEDULED"), months,totalViews,likes,
                commentsCount,engagement,readership,popular);
    }

    @Transactional
    public PostDtos.PostResponse create(String username, PostDtos.SaveRequest request) {
        AppUser author = user(username);
        validateSaveRequest(request);
        BlogPost saved = posts.save(new BlogPost(author, request.title().trim(), request.content().trim(), request.category(),
                request.imageUrl(), normalizeTags(request.tags()), request.status(), request.visibility(), request.featured(), request.scheduledAt()));
        if(isPublicPost(saved)) notifyFollowers(saved);
        return PostDtos.PostResponse.from(saved);
    }

    @Transactional
    public PostDtos.PostResponse update(String username, Long id, PostDtos.SaveRequest request) {
        BlogPost post = ownedPost(username, id);
        boolean wasPublic=isPublicPost(post);
        validateSaveRequest(request);
        post.update(request.title().trim(), request.content().trim(), request.category(), request.imageUrl(), normalizeTags(request.tags()),
                request.status(), request.visibility(), request.featured(), request.scheduledAt());
        if(!wasPublic && isPublicPost(post)) notifyFollowers(post);
        return PostDtos.PostResponse.from(post);
    }

    @Transactional
    public void delete(String username, Long id) { posts.delete(ownedPost(username, id)); }

    private BlogPost ownedPost(String username, Long id) {
        BlogPost post = posts.findDetailedById(id).orElseThrow(() -> ApiException.notFound("Post not found"));
        if (!post.getAuthor().getUsername().equalsIgnoreCase(username)) throw ApiException.forbidden("You cannot change another author's post");
        return post;
    }

    @Transactional
    public int publishScheduledPosts() {
        List<BlogPost> ready = posts.findScheduledToPublish(java.time.Instant.now());
        ready.forEach(post -> { post.publishScheduled(); if(isPublicPost(post)) notifyFollowers(post); });
        return ready.size();
    }

    private void validateSaveRequest(PostDtos.SaveRequest request) {
        String status = request.status() == null ? "PUBLISHED" : request.status().toUpperCase();
        String visibility = request.visibility() == null ? "PUBLIC" : request.visibility().toUpperCase();
        if (!List.of("DRAFT", "SCHEDULED", "PUBLISHED").contains(status)) {
            throw ApiException.badRequest("Choose draft, scheduled, or published");
        }
        if (!List.of("PUBLIC", "PRIVATE").contains(visibility)) {
            throw ApiException.badRequest("Choose public or private visibility");
        }
        if (status.equals("SCHEDULED") && (request.scheduledAt() == null || !request.scheduledAt().isAfter(java.time.Instant.now()))) {
            throw ApiException.badRequest("Choose a future publishing date and time");
        }
        if (request.tags() != null && request.tags().size() > 8) throw ApiException.badRequest("Choose up to 8 tags");
        if (request.tags() != null && request.tags().stream().anyMatch(tag -> tag == null || tag.trim().isEmpty() || tag.trim().length() > 40)) {
            throw ApiException.badRequest("Each tag must contain 1 to 40 characters");
        }
    }

    private Set<String> normalizeTags(Set<String> tags) {
        if (tags == null) return Set.of();
        return tags.stream().map(tag -> tag.trim().replaceFirst("^#", "").toLowerCase(Locale.ROOT))
                .filter(tag -> !tag.isBlank()).collect(Collectors.toCollection(java.util.LinkedHashSet::new));
    }

    private boolean isPublicPost(BlogPost post) {
        return post.getStatus().equals("PUBLISHED") && post.getVisibility().equals("PUBLIC") &&
                (post.getPublishedAt() == null || !post.getPublishedAt().isAfter(Instant.now()));
    }

    private void notifyFollowers(BlogPost post) {
        follows.findDetailedFollowersByAuthorId(post.getAuthor().getId()).forEach(follow ->
                notifications.create(follow.getFollower(),post.getAuthor(),post,"NEW_POST"));
    }

    private AppUser user(String username) {
        return users.findByUsernameIgnoreCase(username).orElseThrow(() -> ApiException.notFound("Account not found"));
    }
}
