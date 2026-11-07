package com.blogapp.post;

import com.blogapp.common.ApiException;
import com.blogapp.user.AppUser;
import com.blogapp.user.UserRepository;
import com.blogapp.user.NotificationService;
import jakarta.transaction.Transactional;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class PostEngagementService {
    private static final List<String> REACTION_TYPES = List.of("LIKE", "LOVE", "INSIGHTFUL", "CLAP");
    private final PostRepository posts;
    private final UserRepository users;
    private final PostReactionRepository reactions;
    private final PostCommentRepository comments;
    private final PostBookmarkRepository bookmarks;
    private final NotificationService notifications;

    public PostEngagementService(PostRepository posts, UserRepository users, PostReactionRepository reactions,
                                 PostCommentRepository comments, PostBookmarkRepository bookmarks, NotificationService notifications) {
        this.posts=posts; this.users=users; this.reactions=reactions; this.comments=comments; this.bookmarks=bookmarks; this.notifications=notifications;
    }

    public PostDtos.ReactionSummary reactionSummary(Long postId, String username) {
        ensurePublicPost(postId);
        Map<String,Long> counts=new LinkedHashMap<>();
        REACTION_TYPES.forEach(type -> counts.put(type, 0L));
        reactions.counts(postId).forEach(row -> counts.put((String)row[0], ((Number)row[1]).longValue()));
        String own=null;
        if (username != null) {
            AppUser user=findUser(username);
            own=reactions.findByPostIdAndUserId(postId,user.getId()).map(PostReaction::getType).orElse(null);
        }
        return new PostDtos.ReactionSummary(counts,own);
    }

    @Transactional
    public PostDtos.ReactionSummary react(Long postId, String username, String type) {
        BlogPost post=ensurePublicPost(postId);
        String normalized=type == null ? "" : type.toUpperCase();
        if (!REACTION_TYPES.contains(normalized)) throw ApiException.badRequest("Choose a supported reaction");
        AppUser user=findUser(username);
        PostReaction reaction=reactions.findByPostIdAndUserId(postId,user.getId()).orElse(null);
        if (reaction == null) { reactions.save(new PostReaction(post,user,normalized)); if(normalized.equals("LIKE")) notifications.create(post.getAuthor(),user,post,"LIKE"); }
        else reaction.setType(normalized);
        return reactionSummary(postId,username);
    }

    @Transactional
    public PostDtos.ReactionSummary removeReaction(Long postId, String username) {
        ensurePublicPost(postId);
        reactions.deleteByPostIdAndUserId(postId,findUser(username).getId());
        return reactionSummary(postId,username);
    }

    public List<PostDtos.CommentResponse> listComments(Long postId) {
        ensurePublicPost(postId);
        List<PostComment> all=comments.findAllForPost(postId);
        Map<Long,List<PostComment>> children=new LinkedHashMap<>();
        all.stream().filter(c -> c.getParent()!=null).forEach(c -> children.computeIfAbsent(c.getParent().getId(),ignored -> new ArrayList<>()).add(c));
        return all.stream().filter(c -> c.getParent()==null).map(c -> commentDto(c,children)).toList();
    }

    @Transactional
    public PostDtos.CommentResponse addComment(Long postId, String username, PostDtos.CommentRequest request) {
        BlogPost post=ensurePublicPost(postId);
        AppUser author=findUser(username);
        PostComment parent=null;
        if (request.parentId()!=null) {
            parent=comments.findByIdAndPostId(request.parentId(),postId)
                    .orElseThrow(() -> ApiException.notFound("Parent comment not found"));
            if (parent.isDeleted()) throw ApiException.badRequest("You cannot reply to a deleted comment");
        }
        PostComment saved=comments.save(new PostComment(post,author,parent,request.content().trim()));
        notifications.create(post.getAuthor(),author,post,"COMMENT");
        return commentDto(saved,Map.of());
    }

    @Transactional
    public void deleteComment(Long postId, Long commentId, String username) {
        PostComment comment=comments.findByIdAndPostId(commentId,postId)
                .orElseThrow(() -> ApiException.notFound("Comment not found"));
        AppUser user=findUser(username);
        boolean ownsComment=comment.getAuthor().getId().equals(user.getId());
        boolean ownsPost=comment.getPost().getAuthor().getId().equals(user.getId());
        if (!ownsComment && !ownsPost) throw ApiException.forbidden("You cannot delete this comment");
        comment.markDeleted();
    }

    public PostDtos.BookmarkState bookmarkState(Long postId, String username) {
        ensurePublicPost(postId);
        return new PostDtos.BookmarkState(bookmarks.findByPostIdAndUserId(postId,findUser(username).getId()).isPresent());
    }

    @Transactional
    public PostDtos.BookmarkState addBookmark(Long postId, String username) {
        BlogPost post=ensurePublicPost(postId);
        AppUser user=findUser(username);
        if (bookmarks.findByPostIdAndUserId(postId,user.getId()).isEmpty()) bookmarks.save(new PostBookmark(post,user));
        return new PostDtos.BookmarkState(true);
    }

    @Transactional
    public PostDtos.BookmarkState removeBookmark(Long postId, String username) {
        ensurePublicPost(postId);
        bookmarks.deleteByPostIdAndUserId(postId,findUser(username).getId());
        return new PostDtos.BookmarkState(false);
    }

    public List<PostDtos.PostResponse> bookmarkedPosts(String username) {
        return bookmarks.findAllDetailedByUserId(findUser(username).getId()).stream()
                .map(PostBookmark::getPost).filter(this::isPublicPost).map(PostDtos.PostResponse::from).toList();
    }

    public long commentCount(Long postId) { return comments.countByPostId(postId); }

    private PostDtos.CommentResponse commentDto(PostComment comment, Map<Long,List<PostComment>> children) {
        List<PostDtos.CommentResponse> replies=children.getOrDefault(comment.getId(),List.of()).stream()
                .map(child -> commentDto(child,children)).toList();
        return new PostDtos.CommentResponse(comment.getId(),comment.isDeleted()?"This comment was removed":comment.getContent(),
                comment.getAuthor().getId(),comment.isDeleted()?"Former reader":comment.getAuthor().getUsername(),comment.getCreatedAt(),replies);
    }

    private BlogPost ensurePublicPost(Long postId) {
        BlogPost post=posts.findDetailedById(postId).orElseThrow(() -> ApiException.notFound("Post not found"));
        if (!isPublicPost(post)) throw ApiException.notFound("Post not found");
        return post;
    }

    private boolean isPublicPost(BlogPost post) {
        return post.getStatus().equals("PUBLISHED") && post.getVisibility().equals("PUBLIC") &&
                (post.getPublishedAt()==null || !post.getPublishedAt().isAfter(java.time.Instant.now()));
    }

    private AppUser findUser(String username) {
        return users.findByUsernameIgnoreCase(username).orElseThrow(() -> ApiException.notFound("Account not found"));
    }
}
