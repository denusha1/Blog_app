"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CalendarDays, LoaderCircle, Pencil, Trash2, UserRound, Clock3 } from "lucide-react";
import { api, getPost, getRelatedPosts } from "@/lib/api";
import { useAuth } from "@/components/providers";
import type { Post } from "@/lib/types";
import { MarkdownBody } from "@/components/markdown-body";
import { PostSocial } from "@/components/post-social";

export default function StoryPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [related, setRelated] = useState<Post[]>([]);

  useEffect(() => { getPost(id).then(setPost).catch((reason: Error) => setError(reason.message)); getRelatedPosts(id).then(setRelated).catch(() => {}); api<void>(`/posts/${id}/view`,{method:"POST"}).catch(()=>{}); }, [id]);
  useEffect(() => { const update=()=>{const el=document.querySelector(".story-content"); if(!el)return; const max=el.scrollHeight-window.innerHeight; const value=max<=0?100:Math.min(100,Math.max(0,Math.round((-el.getBoundingClientRect().top/max)*100))); setProgress(value); try{localStorage.setItem(`reading-${id}`,String(value));}catch{}}; window.addEventListener("scroll",update,{passive:true}); update(); return()=>window.removeEventListener("scroll",update); },[id,post]);

  async function remove() {
    if (!post || !window.confirm("Delete this story permanently?")) return;
    setDeleting(true);
    try { await api<void>(`/posts/${post.id}`, { method: "DELETE" }); router.push("/dashboard"); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Could not delete story"); setDeleting(false); }
  }

  if (error) return <main className="page-wrap"><div className="shell"><div className="form-error">{error}</div><Link href="/" className="read-link"><ArrowLeft size={15} /> Return to stories</Link></div></main>;
  if (!post) return <main className="page-wrap"><div className="shell story-skeleton"><div className="skeleton-line shimmer short"/><div className="skeleton-cover shimmer"/><div className="skeleton-line shimmer title"/><div className="skeleton-line shimmer medium"/><div className="skeleton-line shimmer"/><div className="skeleton-line shimmer"/><div className="skeleton-line shimmer medium"/></div></main>;
  const isAuthor = user?.id === post.authorId;
  const headings = post.content.split("\n").filter(line=>/^#{1,3}\s+/.test(line)).map(line=>{const title=line.replace(/^#+\s+/,"").trim();return {title,level:line.match(/^#+/)?.[0].length??1,id:title.toLowerCase().replace(/[^\p{L}\p{N}]+/gu,"-").replace(/^-|-$/g,"")};});
  const readingMinutes=Math.max(1,Math.ceil(post.content.replace(/[#*`>_\-[\]()]/g," ").trim().split(/\s+/).length/220));
  return <main className="page-wrap"><div className="reading-progress" style={{width:`${progress}%`}}/><article className="shell story-wrap">
    <Link href="/" className="read-link"><ArrowLeft size={15} /> All stories</Link>
    {post.imageUrl && <img className="story-cover" src={post.imageUrl} alt="" style={{ marginTop: 22 }} />}
    <h1 className="story-title">{post.title}</h1>
    <span className={`category-tag category-${(post.category || "Writing").toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}>{post.category || "Writing"}</span>
    <div className="story-meta"><Link href={`/authors/${post.authorId}`}><UserRound size={14} /> {post.authorName}</Link><span><CalendarDays size={14} /> {new Date(post.createdAt).toLocaleDateString(undefined, { dateStyle: "long" })}</span><span><Clock3 size={14}/> {readingMinutes} min read</span><span>{post.viewCount} reads</span>{post.status !== "PUBLISHED" && <span className={`post-status status-${post.status.toLowerCase()}`}>{post.status === "DRAFT" ? "Draft" : `Scheduled for ${new Date(post.scheduledAt ?? "").toLocaleString()}`}</span>}{post.visibility === "PRIVATE" && <span className="post-status status-private">Private</span>}</div>
    {headings.length>1 && <nav className="story-toc"><strong>In this article</strong>{headings.map((heading,index)=><a key={`${heading.id}-${index}`} style={{paddingLeft:(heading.level-1)*14}} href={`#${heading.id}`}>{heading.title}</a>)}</nav>}
    <div className="story-content"><MarkdownBody content={post.content} /></div>
    {post.status === "PUBLISHED" && post.visibility === "PUBLIC" && <PostSocial id={post.id} authorId={post.authorId}/>}
    {related.length>0 && <section className="related-section"><h2>Related stories</h2><div className="related-list">{related.map(item=><Link key={item.id} href={`/posts/${item.id}`}><strong>{item.title}</strong><span>{item.authorName} · {item.category}</span></Link>)}</div></section>}
    {error && <div className="form-error">{error}</div>}
    {isAuthor && <div className="story-actions"><Link className="button button-light button-small" href={`/posts/${post.id}/edit`}><Pencil size={15} /> Edit story</Link><button disabled={deleting} className="danger-button" onClick={remove}>{deleting ? <LoaderCircle size={15} className="animate-spin" /> : <Trash2 size={15} />} Delete</button></div>}
  </article></main>;
}
