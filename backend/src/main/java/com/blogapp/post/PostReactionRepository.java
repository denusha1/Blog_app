package com.blogapp.post;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PostReactionRepository extends JpaRepository<PostReaction, Long> {
    Optional<PostReaction> findByPostIdAndUserId(Long postId, Long userId);
    long countByPostIdAndType(Long postId, String type);
    @Query("select count(r) from PostReaction r where r.post.author.id=:authorId")
    long countForAuthor(@Param("authorId") Long authorId);
    @Query("select count(r) from PostReaction r")
    long totalReactions();
    void deleteByPostIdAndUserId(Long postId, Long userId);
    @Query("select r.type, count(r) from PostReaction r where r.post.id=:postId group by r.type")
    List<Object[]> counts(@Param("postId") Long postId);
}
