package com.blogapp.post;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ContentReportRepository extends JpaRepository<ContentReport,Long>{
    @Query("select r from ContentReport r join fetch r.reporter join fetch r.post p join fetch p.author order by r.resolved asc,r.createdAt desc")
    List<ContentReport> findForModeration();
    boolean existsByPost_IdAndReporter_IdAndResolvedFalse(Long postId,Long reporterId);
}
