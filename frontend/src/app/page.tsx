"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Search, Sparkles } from "lucide-react";
import { getPosts, getTrendingPosts, getLatestPosts, getPublicTags } from "@/lib/api";
import { PostCard, PostSkeleton } from "@/components/post-card";
import { useAuth } from "@/components/providers";
import type { PostPage } from "@/lib/types";

function DiscoveryRow({ title, posts }: { title: string; posts: import("@/lib/types").Post[] }) {
  if (!posts.length) return null;
  return <section className="discovery-row"><h3>{title}</h3><div className="discovery-list">{posts.slice(0, 4).map(post => <Link key={post.id} href={`/posts/${post.id}`}><strong>{post.title}</strong><span>{post.authorName} · {post.viewCount ?? 0} reads</span></Link>)}</div></section>;
}

export default function HomePage() {
  const { user } = useAuth();
  const [data, setData] = useState<PostPage | null>(null);
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sort, setSort] = useState("latest");
  const [tag, setTag] = useState("");
  const [author, setAuthor] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [trending, setTrending] = useState<import("@/lib/types").Post[]>([]);
  const [latest, setLatest] = useState<import("@/lib/types").Post[]>([]);

  useEffect(() => {
    setLoading(true);
    setError("");
    getPosts({ query: submittedQuery, page, category, tag, author, from, to, sort }).then(setData).catch((reason: Error) => setError(reason.message))
      .finally(() => setLoading(false));
  }, [submittedQuery, page, category, tag, author, from, to, sort]);

  useEffect(() => { getPublicTags().then(setTags).catch(() => {}); getTrendingPosts().then(setTrending).catch(() => {}); getLatestPosts().then(setLatest).catch(() => {}); }, []);

  function search(event: React.FormEvent) {
    event.preventDefault();
    setPage(0);
    setSubmittedQuery(query.trim());
  }

  return <>
    <section className="hero">
      <div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" />
      <div className="eyebrow"><Sparkles size={14} /> A home for thoughtful writing</div>
      <h1>Stories worth <em>sharing.</em></h1>
      <p className="hero-copy">A quiet corner of the internet for curious minds. Discover new perspectives, find your people, and put your ideas into words.</p>
      <div className="hero-cta">
        <Link href={user ? "/posts/new" : "/register"} className="button button-dark">Start writing <ArrowRight size={16} /></Link>
        <a href="#stories" className="button button-light">Explore stories</a>
      </div>
      <p className="hero-note">Good ideas deserve a place to grow.</p>
    </section>
    <main id="stories" className="shell feed-section">
      <div className="section-top">
        <div><div className="section-kicker">The journal</div><h2>Fresh perspectives</h2><p className="feed-subtitle">Small ideas. Big new ways of seeing.</p></div>
        <form className="search-box" onSubmit={search}><Search size={17} /><input aria-label="Search stories" placeholder="Search stories..." value={query} onChange={event => setQuery(event.target.value)} /></form>
      </div>
      <div className="category-filter" aria-label="Filter by category">{["", "Ideas", "Design", "Culture", "Travel", "Life", "Writing"].map(item => <button key={item || "all"} className={category === item ? "filter-chip active" : "filter-chip"} aria-pressed={category === item} onClick={() => { setPage(0); setCategory(item); }}>{item || "Everything"}</button>)}</div>
      <div className="discovery-filters"><select aria-label="Sort stories" value={sort} onChange={e => setSort(e.target.value)}><option value="latest">Latest</option><option value="trending">Trending</option></select><select aria-label="Filter by tag" value={tag} onChange={e => setTag(e.target.value)}><option value="">All tags</option>{tags.map(value => <option key={value}>{value}</option>)}</select><input aria-label="Author username" placeholder="Author username" value={author} onChange={e => setAuthor(e.target.value)} /><label>From <input type="date" value={from} onChange={e => setFrom(e.target.value)} /></label><label>To <input type="date" value={to} onChange={e => setTo(e.target.value)} /></label></div>
      {!submittedQuery && !tag && !author && !from && !to && <><DiscoveryRow title="Trending this week" posts={trending} /><DiscoveryRow title="Latest articles" posts={latest} /></>}
      {loading ? <div className="post-grid">{Array.from({ length: 6 }, (_, index) => <PostSkeleton key={index} />)}</div> : error ?
        <div className="form-error">{error}</div> : data?.content.length ? <>
          <div className="post-grid">{data.content.map(post => <PostCard key={post.id} post={post} />)}</div>
          {data.totalPages > 1 && <div className="pagination"><button disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</button><span>Page {page + 1} of {data.totalPages}</span><button disabled={page + 1 >= data.totalPages} onClick={() => setPage(page + 1)}>Next</button></div>}
        </> : <div className="empty-state"><div className="empty-illustration"><Sparkles size={24} /></div><h3>{submittedQuery || category ? "No stories found" : "The first page is still blank"}</h3><p>{submittedQuery || category ? "Try another topic or search, or browse all stories." : "Be the first to share an idea with the community."}</p>{submittedQuery || category ? <button className="button button-light" onClick={() => { setQuery(""); setSubmittedQuery(""); setCategory(""); }}>Clear filters</button> : user && <Link className="button button-dark" href="/posts/new">Write the first story</Link>}</div>}
    </main>
    <footer className="footer"><div className="shell footer-inner"><span className="footer-brand">Ink &amp; Ideas</span><span>Made for ideas that stay with you.</span></div></footer>
  </>;
}
