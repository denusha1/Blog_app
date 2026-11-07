"use client";

import {useEffect,useState} from "react";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, Clock3, Eye, Heart, UserRound } from "lucide-react";
import {api} from "@/lib/api";
import type { Post } from "@/lib/types";

export function PostCard({ post }: { post: Post }) {
  const [likes,setLikes]=useState<number|null>(null);
  useEffect(()=>{api<{counts:Record<string,number>}>(`/posts/${post.id}/reactions`).then(value=>setLikes(Object.values(value.counts??{}).reduce((sum,count)=>sum+count,0))).catch(()=>{});},[post.id]);
  const readingMinutes=Math.max(1,Math.ceil(post.content.replace(/[#*`>_\-[\]()]/g," ").trim().split(/\s+/).filter(Boolean).length/220));
  const category = post.category || "Writing";
  const categoryClass = `category-${category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <article className="post-card" style={{ animationDelay: `${Math.min(post.id % 6, 5) * 60}ms` }}>
      <Link href={`/posts/${post.id}`} className="post-cover">
        {post.imageUrl ? <img src={post.imageUrl} alt="" /> : <div className="cover-placeholder"><span>✳</span></div>}
        {post.featured && <span className="featured-badge">✦ Featured</span>}
        <span className="cover-arrow"><ArrowUpRight size={18} /></span>
      </Link>
      <div className="post-card-body">
        <span className={`category-tag ${categoryClass}`}>{category}</span>
        {post.featured && <span className="featured-tag">✦ Featured</span>}
        <div className="post-meta"><span><UserRound size={13} /> {post.authorName}</span><span><CalendarDays size={13} /> {new Date(post.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span></div>
        {!!post.tags?.length && <div className="post-tags">{post.tags.slice(0,4).map(tag=><span key={tag}>#{tag}</span>)}</div>}
        <Link href={`/posts/${post.id}`}><h2>{post.title}</h2></Link>
        <p>{post.content.replace(/[#*`>_]/g, "").slice(0, 150)}{post.content.length > 150 ? "…" : ""}</p>
        <div className="post-card-footer"><div className="post-card-stats"><span><Clock3 size={13}/>{readingMinutes} min</span><span><Eye size={13}/>{post.viewCount.toLocaleString()}</span><span><Heart size={13}/>{likes===null?"—":likes.toLocaleString()}</span></div><Link href={`/posts/${post.id}`} className="read-link">Read story <ArrowUpRight size={15} /></Link></div>
      </div>
    </article>
  );
}

export function PostSkeleton() {
  return <article className="post-card skeleton-card" aria-hidden="true">
    <div className="skeleton-cover shimmer" />
    <div className="post-card-body"><div className="skeleton-line shimmer short" /><div className="skeleton-line shimmer title" /><div className="skeleton-line shimmer" /><div className="skeleton-line shimmer medium" /></div>
  </article>;
}
