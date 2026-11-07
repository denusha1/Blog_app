package com.blogapp.post;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PostRepository extends JpaRepository<BlogPost, Long> {
    @Query("select p from BlogPost p join fetch p.author where " +
           "(:query = '' or lower(p.title) like lower(concat('%', :query, '%')) or lower(p.content) like lower(concat('%', :query, '%'))) " +
           "and (:category = '' or lower(p.category) = lower(:category)) " +
           "order by p.createdAt desc")
    Page<BlogPost> search(@Param("query") String query, @Param("category") String category, Pageable pageable);

    @Query("select p from BlogPost p join fetch p.author where p.id = :id")
    java.util.Optional<BlogPost> findDetailedById(@Param("id") Long id);

    @Query("select p from BlogPost p join fetch p.author where p.author.id = :authorId order by p.createdAt desc")
    List<BlogPost> findDetailedByAuthorId(@Param("authorId") Long authorId);
    long countByAuthorId(Long authorId);
    void deleteByAuthorId(Long authorId);

    @Query(value = "select to_char(date_trunc('month', created_at), 'Mon') as month, count(*) as count " +
            "from blog_posts where user_id = :userId and created_at >= date_trunc('month', current_date) - interval '5 months' " +
            "group by date_trunc('month', created_at) order by date_trunc('month', created_at)", nativeQuery = true)
    List<Object[]> monthlyPostCounts(@Param("userId") Long userId);
}
