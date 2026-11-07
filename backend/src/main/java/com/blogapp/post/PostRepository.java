package com.blogapp.post;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PostRepository extends JpaRepository<BlogPost, Long> {
    String PUBLIC_FILTER = "p.status = 'PUBLISHED' and p.visibility = 'PUBLIC' and (p.publishedAt is null or p.publishedAt <= CURRENT_TIMESTAMP)";

    @Query("select p from BlogPost p join fetch p.author where " + PUBLIC_FILTER + " and " +
           "(:query = '' or lower(p.title) like lower(concat('%', :query, '%')) or lower(p.content) like lower(concat('%', :query, '%'))) and " +
           "(:category = '' or lower(p.category) = lower(:category)) and (:tag = '' or exists (select t from BlogPost p2 join p2.tags t where p2.id = p.id and lower(t) = lower(:tag))) and " +
           "(:author = '' or lower(p.author.username) = lower(:author)) and coalesce(p.publishedAt, p.createdAt) >= :fromDate and coalesce(p.publishedAt, p.createdAt) <= :toDate " +
           "order by p.featured desc, p.publishedAt desc, p.createdAt desc")
    Page<BlogPost> search(@Param("query") String query, @Param("category") String category, @Param("tag") String tag,
                          @Param("author") String author, @Param("fromDate") java.time.Instant fromDate,
                          @Param("toDate") java.time.Instant toDate, Pageable pageable);

    @Query("select p from BlogPost p join fetch p.author where " + PUBLIC_FILTER + " and " +
           "(:query = '' or lower(p.title) like lower(concat('%', :query, '%')) or lower(p.content) like lower(concat('%', :query, '%'))) and " +
           "(:category = '' or lower(p.category) = lower(:category)) and (:tag = '' or exists (select t from BlogPost p2 join p2.tags t where p2.id = p.id and lower(t) = lower(:tag))) and " +
           "(:author = '' or lower(p.author.username) = lower(:author)) and coalesce(p.publishedAt, p.createdAt) >= :fromDate and coalesce(p.publishedAt, p.createdAt) <= :toDate " +
           "order by p.viewCount desc, p.publishedAt desc")
    Page<BlogPost> searchTrending(@Param("query") String query, @Param("category") String category, @Param("tag") String tag,
                                  @Param("author") String author, @Param("fromDate") java.time.Instant fromDate,
                                  @Param("toDate") java.time.Instant toDate, Pageable pageable);

    @Query("select p from BlogPost p join fetch p.author where p.id = :id")
    java.util.Optional<BlogPost> findDetailedById(@Param("id") Long id);

    @Query("select p from BlogPost p join fetch p.author where p.status = 'PUBLISHED' and p.visibility = 'PUBLIC' and " +
            "(p.publishedAt is null or p.publishedAt <= CURRENT_TIMESTAMP) order by p.viewCount desc, p.publishedAt desc")
    List<BlogPost> findTrending(Pageable pageable);

    @Query("select p from BlogPost p join fetch p.author where p.status = 'PUBLISHED' and p.visibility = 'PUBLIC' and " +
            "(p.publishedAt is null or p.publishedAt <= CURRENT_TIMESTAMP) order by p.featured desc, p.publishedAt desc")
    List<BlogPost> findLatest(Pageable pageable);

    @Query("select distinct tag from BlogPost p join p.tags tag where p.status = 'PUBLISHED' and p.visibility = 'PUBLIC' " +
            "and (p.publishedAt is null or p.publishedAt <= CURRENT_TIMESTAMP) order by tag")
    List<String> findPublicTags();

    @Query("select p from BlogPost p join fetch p.author where p.id <> :id and p.status = 'PUBLISHED' and p.visibility = 'PUBLIC' " +
            "and (p.publishedAt is null or p.publishedAt <= CURRENT_TIMESTAMP) and (p.category = :category or p.author.id = :authorId) " +
            "order by p.category desc, p.viewCount desc, p.publishedAt desc")
    List<BlogPost> findRelated(@Param("id") Long id, @Param("category") String category,
                               @Param("authorId") Long authorId, Pageable pageable);

    @Query("select p from BlogPost p join fetch p.author where p.author.id = :authorId order by p.createdAt desc")
    List<BlogPost> findDetailedByAuthorId(@Param("authorId") Long authorId);
    long countByAuthorId(Long authorId);
    long countByAuthorIdAndStatus(Long authorId, String status);
    long countByAuthorIdAndStatusAndVisibility(Long authorId, String status, String visibility);
    void deleteByAuthorId(Long authorId);

    @Query("select p from BlogPost p where p.status = 'SCHEDULED' and p.scheduledAt <= :now")
    List<BlogPost> findScheduledToPublish(@Param("now") java.time.Instant now);

    @Query(value = "select to_char(date_trunc('month', created_at), 'Mon') as month, count(*) as count " +
            "from blog_posts where user_id = :userId and status = 'PUBLISHED' and created_at >= date_trunc('month', current_date) - interval '5 months' " +
            "group by date_trunc('month', created_at) order by date_trunc('month', created_at)", nativeQuery = true)
    List<Object[]> monthlyPostCounts(@Param("userId") Long userId);

    @Query("select distinct p.category from BlogPost p order by p.category")
    List<String> allCategories();
    @Query("select coalesce(sum(p.viewCount),0) from BlogPost p")
    long totalPlatformViews();
}
