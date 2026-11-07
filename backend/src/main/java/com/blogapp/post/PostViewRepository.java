package com.blogapp.post;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PostViewRepository extends JpaRepository<PostView, Long> {
    @Query(value="select to_char(date_trunc('month', v.viewed_at), 'Mon') as month, count(*) as count " +
            "from post_views v join blog_posts p on p.id=v.post_id where p.user_id=:userId and " +
            "v.viewed_at >= date_trunc('month', current_date) - interval '5 months' " +
            "group by date_trunc('month', v.viewed_at) order by date_trunc('month', v.viewed_at)", nativeQuery=true)
    List<Object[]> monthlyViews(@Param("userId") Long userId);
}
