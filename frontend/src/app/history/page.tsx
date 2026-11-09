"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock3, Trash2 } from "lucide-react";
import { getPost } from "@/lib/api";
import { PostCard, PostSkeleton } from "@/components/post-card";
import type { Post } from "@/lib/types";

const HISTORY_KEY = "ink-reading-history";
type HistoryEntry = { id: string; at: number };

export default function ReadingHistoryPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    let entries: HistoryEntry[] = [];
    try { entries = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); } catch { entries = []; }
    Promise.all(entries.slice(0, 30).map(entry => getPost(entry.id).catch(() => null))).then(results => {
      if (!cancelled) setPosts(results.filter((post): post is Post => post !== null));
    }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);
  function clearHistory() { localStorage.removeItem(HISTORY_KEY); setPosts([]); }
  return <main className="page-wrap"><section className="shell feed-section"><div className="dashboard-top"><div className="page-heading"><div className="section-kicker">YOUR READING TRAIL</div><h1>Reading history</h1><p>Stories you’ve recently opened, saved on this device.</p></div>{posts.length>0&&<button className="button button-light" onClick={clearHistory}><Trash2 size={15}/> Clear history</button>}</div>
    {loading?<div className="post-grid">{[1,2,3].map(i=><PostSkeleton key={i}/>)}</div>:posts.length?<div className="post-grid">{posts.map(post=><PostCard key={post.id} post={post}/>)}</div>:<div className="empty-state"><div className="empty-illustration"><Clock3/></div><h3>Your reading trail starts here</h3><p>Open a story and it will show up here for your next visit.</p><Link href="/explore" className="button button-light">Explore stories</Link></div>}
  </section></main>;
}
