package com.blogapp.user;

import com.blogapp.common.ApiException;
import com.blogapp.post.PostDtos;
import jakarta.transaction.Transactional;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class AuthorFollowService {
    private final UserRepository users;
    private final AuthorFollowRepository follows;
    private final NotificationService notifications;
    public AuthorFollowService(UserRepository users, AuthorFollowRepository follows, NotificationService notifications) { this.users=users; this.follows=follows; this.notifications=notifications; }

    public PostDtos.FollowState state(Long authorId, String followerUsername) {
        AppUser author=findUser(authorId);
        boolean following=followerUsername!=null && users.findByUsernameIgnoreCase(followerUsername)
                .flatMap(user -> follows.findByAuthorIdAndFollowerId(authorId,user.getId())).isPresent();
        return new PostDtos.FollowState(following,follows.countByAuthorId(author.getId()));
    }

    @Transactional
    public PostDtos.FollowState follow(Long authorId,String followerUsername) {
        AppUser author=findUser(authorId); AppUser follower=findUser(followerUsername);
        if (author.getId().equals(follower.getId())) throw ApiException.badRequest("You cannot follow yourself");
        if (follows.findByAuthorIdAndFollowerId(authorId,follower.getId()).isEmpty()) { follows.save(new AuthorFollow(author,follower)); notifications.create(author,follower,null,"FOLLOW"); }
        return state(authorId,followerUsername);
    }

    @Transactional
    public PostDtos.FollowState unfollow(Long authorId,String followerUsername) {
        findUser(authorId); AppUser follower=findUser(followerUsername);
        follows.deleteByAuthorIdAndFollowerId(authorId,follower.getId());
        return state(authorId,followerUsername);
    }

    public List<PostDtos.FollowedAuthor> following(String username) {
        AppUser follower=users.findByUsernameIgnoreCase(username).orElseThrow(() -> ApiException.notFound("Account not found"));
        return follows.findDetailedByFollowerId(follower.getId()).stream()
                .map(item -> new PostDtos.FollowedAuthor(item.getAuthor().getId(),item.getAuthor().getUsername(),item.getCreatedAt())).toList();
    }

    private AppUser findUser(Long id) { return users.findById(id).orElseThrow(() -> ApiException.notFound("Author not found")); }
    private AppUser findUser(String username) { return users.findByUsernameIgnoreCase(username).orElseThrow(() -> ApiException.notFound("Account not found")); }
}
