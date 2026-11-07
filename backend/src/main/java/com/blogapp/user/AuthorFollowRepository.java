package com.blogapp.user;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AuthorFollowRepository extends JpaRepository<AuthorFollow, Long> {
    Optional<AuthorFollow> findByAuthorIdAndFollowerId(Long authorId, Long followerId);
    long countByAuthorId(Long authorId);
    void deleteByAuthorIdAndFollowerId(Long authorId, Long followerId);
    @Query("select f from AuthorFollow f join fetch f.author where f.follower.id=:followerId order by f.createdAt desc")
    List<AuthorFollow> findDetailedByFollowerId(@Param("followerId") Long followerId);
}
