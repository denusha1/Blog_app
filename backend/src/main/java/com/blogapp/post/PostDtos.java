package com.blogapp.post;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.List;
import java.util.Set;

public final class PostDtos {
    private PostDtos() {}
    public record SaveRequest(@NotBlank @Size(max=180) String title, @NotBlank String content,
                              @Size(max=40) String category, String imageUrl, Set<@Size(max=40) String> tags, String status,
                              String visibility, boolean featured, Instant scheduledAt) {}
    public record PostResponse(Long id, String title, String content, String category, String imageUrl,
                               Set<String> tags, String status, String visibility, boolean featured, long viewCount, Instant scheduledAt,
                               Instant publishedAt, Long authorId, String authorName, Instant createdAt, Instant updatedAt) {
        public static PostResponse from(BlogPost post) {
            return new PostResponse(post.getId(), post.getTitle(), post.getContent(), post.getCategory(), post.getImageUrl(),
                    post.getTags(), post.getStatus(), post.getVisibility(), post.isFeatured(), post.getViewCount(), post.getScheduledAt(), post.getPublishedAt(),
                    post.getAuthor().getId(), post.getAuthor().getUsername(), post.getCreatedAt(), post.getUpdatedAt());
        }
    }
    public record PageResponse<T>(List<T> content, int page, int size, long totalElements, int totalPages) {}
    public record MonthCount(String month, long count) {}
    public record Stats(long totalPosts, long publishedPosts, long draftPosts, long scheduledPosts,
                        List<MonthCount> monthlyPosts) {}
    public record ReactionSummary(java.util.Map<String, Long> counts, String myReaction) {}
    public record CommentRequest(@NotBlank @Size(max=5000) String content, Long parentId) {}
    public record CommentResponse(Long id, String content, Long authorId, String authorName,
                                  Instant createdAt, List<CommentResponse> replies) {}
    public record BookmarkState(boolean bookmarked) {}
    public record FollowState(boolean following, long followerCount) {}
    public record FollowedAuthor(Long id, String username, java.time.Instant followedAt) {}
}
