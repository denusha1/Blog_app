package com.blogapp.post;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.List;

public final class PostDtos {
    private PostDtos() {}
    public record SaveRequest(@NotBlank @Size(max=180) String title, @NotBlank String content,
                              @Size(max=40) String category, String imageUrl) {}
    public record PostResponse(Long id, String title, String content, String category, String imageUrl, Long authorId,
                               String authorName, Instant createdAt, Instant updatedAt) {
        public static PostResponse from(BlogPost post) {
            return new PostResponse(post.getId(), post.getTitle(), post.getContent(), post.getCategory(), post.getImageUrl(),
                    post.getAuthor().getId(), post.getAuthor().getUsername(), post.getCreatedAt(), post.getUpdatedAt());
        }
    }
    public record PageResponse<T>(List<T> content, int page, int size, long totalElements, int totalPages) {}
    public record MonthCount(String month, long count) {}
    public record Stats(long totalPosts, long publishedPosts, List<MonthCount> monthlyPosts) {}
}
