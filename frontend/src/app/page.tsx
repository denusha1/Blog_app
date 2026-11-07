"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Search, Sparkles } from "lucide-react";
import { getPosts } from "@/lib/api";
import { PostCard, PostSkeleton } from "@/components/post-card";
import { useAuth } from "@/components/providers";
import type { PostPage } from "@/lib/types";

export default function HomePage() {
  const { user } = useAuth();
  const [data, setData] = useState<PostPage | null>(null);
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    getPosts(submittedQuery, page, category).then(setData).catch((reason: Error) => setError(reason.message))
      .finally(() => setLoading(false));
  }, [submittedQuery, page, category]);

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
      {loading ? <div className="post-grid">{Array.from({ length: 6 }, (_, index) => <PostSkeleton key={index} />)}</div> : error ?
        <div className="form-error">{error}</div> : data?.content.length ? <>
          <div className="post-grid">{data.content.map(post => <PostCard key={post.id} post={post} />)}</div>
          {data.totalPages > 1 && <div className="pagination"><button disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</button><span>Page {page + 1} of {data.totalPages}</span><button disabled={page + 1 >= data.totalPages} onClick={() => setPage(page + 1)}>Next</button></div>}
        </> : <div className="empty-state"><div className="empty-illustration"><Sparkles size={24} /></div><h3>{submittedQuery || category ? "No stories found" : "The first page is still blank"}</h3><p>{submittedQuery || category ? "Try another topic or search, or browse all stories." : "Be the first to share an idea with the community."}</p>{submittedQuery || category ? <button className="button button-light" onClick={() => { setQuery(""); setSubmittedQuery(""); setCategory(""); }}>Clear filters</button> : user && <Link className="button button-dark" href="/posts/new">Write the first story</Link>}</div>}
    </main>
    <footer className="footer"><div className="shell footer-inner"><span className="footer-brand">Ink &amp; Ideas</span><span>Made for ideas that stay with you.</span></div></footer>
  </>;
}
