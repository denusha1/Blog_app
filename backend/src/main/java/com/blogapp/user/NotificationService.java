package com.blogapp.user;

import com.blogapp.post.BlogPost;
import jakarta.transaction.Transactional;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {
    private final NotificationRepository notifications;
    public NotificationService(NotificationRepository notifications){this.notifications=notifications;}
    @Transactional public void create(AppUser recipient,AppUser actor,BlogPost post,String type){
        if(recipient!=null && actor!=null && !recipient.getId().equals(actor.getId())) notifications.save(new Notification(recipient,actor,post,type));
    }
    public List<Response> list(AppUser user){return notifications.findRecent(user.getId()).stream().limit(100).map(Response::from).toList();}
    public long unreadCount(AppUser user){return notifications.countByRecipientIdAndReadAtIsNull(user.getId());}
    @Transactional public void markAllRead(AppUser user){notifications.markAllRead(user.getId());}
    public record Response(Long id,String type,String actorName,Long postId,String postTitle,java.time.Instant createdAt,java.time.Instant readAt){
        static Response from(Notification n){return new Response(n.getId(),n.getType(),n.getActor().getUsername(),n.getPost()==null?null:n.getPost().getId(),n.getPost()==null?null:n.getPost().getTitle(),n.getCreatedAt(),n.getReadAt());}
    }
}
