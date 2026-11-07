package com.blogapp.user;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import java.util.List;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/notifications") @SecurityRequirement(name="bearerAuth")
public class NotificationController {
    private final NotificationService notifications; private final UserRepository users;
    public NotificationController(NotificationService notifications,UserRepository users){this.notifications=notifications;this.users=users;}
    @GetMapping public List<NotificationService.Response> list(@AuthenticationPrincipal UserDetails user){return notifications.list(find(user));}
    @GetMapping("/unread-count") public long unread(@AuthenticationPrincipal UserDetails user){return notifications.unreadCount(find(user));}
    @PutMapping("/read-all") public void readAll(@AuthenticationPrincipal UserDetails user){notifications.markAllRead(find(user));}
    private AppUser find(UserDetails principal){return users.findByUsernameIgnoreCase(principal.getUsername()).orElseThrow();}
}
