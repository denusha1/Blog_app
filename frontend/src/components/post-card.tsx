import Link from "next/link";
import { ArrowUpRight, CalendarDays, UserRound } from "lucide-react";
import type { Post } from "@/lib/types";

export function PostCard({ post }: { post: Post }) {
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
        <Link href={`/posts/${post.id}`} className="read-link">Read story <ArrowUpRight size={15} /></Link>
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
