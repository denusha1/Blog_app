package com.blogapp.post;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PostBookmarkRepository extends JpaRepository<PostBookmark, Long> {
    Optional<PostBookmark> findByPostIdAndUserId(Long postId, Long userId);
    void deleteByPostIdAndUserId(Long postId, Long userId);
    @Query("select b from PostBookmark b join fetch b.post p join fetch p.author where b.user.id=:userId order by b.createdAt desc")
    List<PostBookmark> findAllDetailedByUserId(@Param("userId") Long userId);
}
