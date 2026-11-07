package com.blogapp.user;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NotificationRepository extends JpaRepository<Notification,Long> {
    @Query("select n from Notification n join fetch n.actor left join fetch n.post where n.recipient.id=:userId order by n.createdAt desc")
    List<Notification> findRecent(@Param("userId") Long userId);
    long countByRecipientIdAndReadAtIsNull(Long recipientId);
    @Modifying @Query("update Notification n set n.readAt=CURRENT_TIMESTAMP where n.recipient.id=:userId and n.readAt is null")
    void markAllRead(@Param("userId") Long userId);
}
