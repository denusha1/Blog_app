package com.blogapp.post;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PostCommentRepository extends JpaRepository<PostComment, Long> {
    @Query("select c from PostComment c join fetch c.author where c.post.id=:postId order by c.createdAt asc")
    List<PostComment> findAllForPost(@Param("postId") Long postId);
    Optional<PostComment> findByIdAndPostId(Long id, Long postId);
    long countByPostId(Long postId);
}
