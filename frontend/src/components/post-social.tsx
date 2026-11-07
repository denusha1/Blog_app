"use client";

import { useEffect, useState } from "react";
import { Bookmark, Copy, Heart, MessageCircle, Share2, UserPlus } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/components/providers";

type Reaction = { counts: Record<string, number>; myReaction: string | null };
type Comment = { id: number; authorName: string; content: string; createdAt: string; deleted: boolean; replies: Comment[] };

export function PostSocial({ id, authorId }: { id: number; authorId: number }) {
  const { user } = useAuth();
  const [reaction, setReaction] = useState<Reaction | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [bookmarked, setBookmarked] = useState(false);
  const [following, setFollowing] = useState(false);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [notice, setNotice] = useState("");
  const refresh = async () => { const [r,c] = await Promise.all([api<Reaction>(`/posts/${id}/reactions`), api<Comment[]>(`/posts/${id}/comments`)]); setReaction(r); setComments(c); };
  useEffect(() => { refresh().catch(() => {}); if (user) { api<{bookmarked:boolean}>(`/posts/${id}/bookmark`).then(v => setBookmarked(v.bookmarked)).catch(() => {}); api<{following:boolean}>(`/authors/${authorId}/follow`).then(v => setFollowing(v.following)).catch(() => {}); } }, [id, user, authorId]);
  async function toggleReaction() { if (!user) { setNotice("Sign in to react or comment."); return; } setReaction(await api<Reaction>(`/posts/${id}/reactions`, { method: reaction?.myReaction ? "DELETE" : "PUT", ...(reaction?.myReaction ? {} : { body: JSON.stringify({ type: "LIKE" }) }) })); }
  async function toggleBookmark() { if (!user) { setNotice("Sign in to save this article."); return; } const result=await api<{bookmarked:boolean}>(`/posts/${id}/bookmark`,{method:bookmarked?"DELETE":"PUT"}); setBookmarked(result.bookmarked); }
  async function toggleFollow() { if (!user) { setNotice("Sign in to follow this author."); return; } const result=await api<{following:boolean}>(`/authors/${authorId}/follow`,{method:following?"DELETE":"PUT"}); setFollowing(result.following); }
  async function submitComment(parentId: number | null = null) { if (!user) { setNotice("Sign in to join the conversation."); return; } if (!text.trim()) return; await api(`/posts/${id}/comments`,{method:"POST",body:JSON.stringify({content:text.trim(),parentId})}); setText(""); setReplyTo(null); await refresh(); }
  async function share() { try { if (navigator.share) await navigator.share({title:document.title,url:location.href}); else { await navigator.clipboard.writeText(location.href); setNotice("Link copied."); } } catch {} }
  return <section className="social-panel"><div className="social-toolbar"><button onClick={toggleReaction}><Heart size={17} fill={reaction?.myReaction ? "currentColor" : "none"}/> Like {Object.values(reaction?.counts ?? {}).reduce((a,b)=>a+b,0)}</button><button onClick={toggleBookmark}><Bookmark size={17} fill={bookmarked ? "currentColor" : "none"}/> {bookmarked ? "Saved" : "Bookmark"}</button><button onClick={share}><Share2 size={17}/> Share</button><button onClick={async()=>{await navigator.clipboard.writeText(location.href);setNotice("Link copied.")}}><Copy size={16}/> Copy link</button><button onClick={toggleFollow} disabled={user?.id===authorId}><UserPlus size={17}/> {following?"Following":"Follow author"}</button></div>
    {notice && <p className="social-notice">{notice}</p>}<h3><MessageCircle size={19}/> Conversation ({comments.length})</h3><div className="comment-compose"><textarea value={replyTo ? text : text} onChange={e=>setText(e.target.value)} placeholder={user?"Share a thoughtful response…":"Sign in to comment"}/><button className="button button-dark button-small" onClick={()=>submitComment(replyTo)}>Post comment</button></div>
    <div className="comment-list">{comments.map(comment=><CommentItem key={comment.id} comment={comment} onReply={id=>{setReplyTo(id);document.querySelector(".comment-compose")?.scrollIntoView({behavior:"smooth"})}}/>)}</div></section>;
}
function CommentItem({ comment, onReply }: { comment: Comment; onReply: (id:number)=>void }) { return <article className="comment-item"><div className="comment-by"><strong>{comment.deleted?"Former reader":comment.authorName}</strong><time>{new Date(comment.createdAt).toLocaleDateString()}</time></div><p>{comment.content}</p>{!comment.deleted&&<button className="comment-reply" onClick={()=>onReply(comment.id)}>Reply</button>}{comment.replies?.length>0&&<div className="comment-replies">{comment.replies.map(reply=><CommentItem key={reply.id} comment={reply} onReply={onReply}/>)}</div>}</article>; }
