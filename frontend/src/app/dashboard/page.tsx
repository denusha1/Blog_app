"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowRight, Bell, Bookmark, Eye, FileText, Heart, PenLine, Plus, Sparkles, TrendingUp, UserRound } from "lucide-react";
import { getMyPosts, getStats } from "@/lib/api";
import { useAuth } from "@/components/providers";
import type { Post, Stats } from "@/lib/types";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
    if (user) Promise.all([getMyPosts(), getStats()]).then(([mine, summary]) => {
      setPosts(mine); setStats(summary);
    }).catch((reason: Error) => setError(reason.message)).finally(() => setLoading(false));
  }, [user, authLoading, router]);

  if (authLoading || !user || loading) return <main className="page-wrap"><div className="shell dashboard-loading"><div className="skeleton-line shimmer title"/><div className="dashboard-loading-stats">{Array.from({length:6},(_,i)=><div className="stat-card" key={i}><div className="skeleton-line shimmer short"/><div className="skeleton-line shimmer title"/></div>)}</div><div className="dashboard-loading-body"><div className="panel"><div className="skeleton-line shimmer title"/><div className="skeleton-line shimmer"/><div className="skeleton-line shimmer medium"/></div><div className="panel"><div className="skeleton-cover shimmer"/></div></div></div></main>;
  const visiblePosts = filterStatus === "ALL" ? posts : posts.filter(post => post.status === filterStatus);
  return <main className="page-wrap"><div className="shell dashboard-layout">
    <aside className="dashboard-sidebar"><div className="dashboard-sidebar-label">Workspace</div><a className="active" href="#overview"><TrendingUp size={16}/> Overview</a><a href="#stories"><FileText size={16}/> My stories</a><a href="#analytics"><Eye size={16}/> Analytics</a><a href="#popular"><Heart size={16}/> Top articles</a><div className="dashboard-sidebar-label sidebar-label-spaced">Shortcuts</div><Link href="/posts/new"><Plus size={16}/> New story</Link><Link href="/bookmarks"><Bookmark size={16}/> Bookmarks</Link><Link href="/notifications"><Bell size={16}/> Activity</Link><Link href="/profile"><UserRound size={16}/> Author profile</Link></aside>
    <div className="dashboard-main" id="overview">
    <div className="dashboard-top"><div className="page-heading" style={{ margin: 0 }}><div className="section-kicker">Your corner</div><h1>Good to see you, {user.username}.</h1><p>Keep your ideas moving. Your stories are right here.</p></div><Link href="/posts/new" className="button button-dark"><Plus size={16} /> Write a story</Link></div>
    {error && <div className="form-error">{error}</div>}
    <div className="stat-grid management-stats analytics-stats"><div className="stat-card"><span>All stories</span><strong>{stats?.totalPosts ?? posts.length}</strong></div><div className="stat-card"><span>Total views</span><strong>{stats?.totalViews ?? 0}</strong></div><div className="stat-card"><span>Total likes</span><strong>{stats?.totalLikes ?? 0}</strong></div><div className="stat-card"><span>Comments</span><strong>{stats?.totalComments ?? 0}</strong></div><div className="stat-card"><span>Engagement rate</span><strong>{stats?.engagementRate ?? 0}%</strong></div><div className="stat-card"><span>Published</span><strong>{stats?.publishedPosts ?? posts.filter(post => post.status === "PUBLISHED").length}</strong></div></div>
    <div className="dashboard-grid">
      <section className="panel dashboard-panel" id="stories"><div className="management-heading"><div><h2>Your stories</h2><p>Draft, publish, and schedule your writing.</p></div><div className="status-filters">{["ALL", "DRAFT", "SCHEDULED", "PUBLISHED"].map(value => <button key={value} className={filterStatus === value ? "filter-chip active" : "filter-chip"} onClick={() => setFilterStatus(value)}>{value === "ALL" ? "All" : value.charAt(0) + value.slice(1).toLowerCase()}</button>)}</div></div>
        {visiblePosts.length ? visiblePosts.map(post => <div className="my-post-row" key={post.id}><div className="my-post-thumb">{post.imageUrl ? <img src={post.imageUrl} alt="" /> : <FileText size={19} />}</div><div className="my-post-info"><strong>{post.title}</strong><span>{post.status === "SCHEDULED" && post.scheduledAt ? `Goes live ${new Date(post.scheduledAt).toLocaleString()}` : new Date(post.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })}</span><div className="row-badges"><span className={`post-status status-${post.status.toLowerCase()}`}>{post.status.charAt(0) + post.status.slice(1).toLowerCase()}</span><span className={`post-status ${post.visibility === "PRIVATE" ? "status-private" : "status-public"}`}>{post.visibility.toLowerCase()}</span>{post.featured && <span className="post-status status-featured">Featured</span>}</div></div><div className="row-actions"><Link href={`/posts/${post.id}`} title="Preview"><ArrowRight size={15} /></Link><Link href={`/posts/${post.id}/edit`} title="Edit"><PenLine size={15} /></Link></div></div>) : posts.length ? <div className="empty-state" style={{ padding: "28px 15px", marginTop: 8 }}><p>No {filterStatus.toLowerCase()} stories.</p></div> : <div className="empty-state" style={{ padding: "30px 15px", marginTop: 8 }}><Sparkles size={20} /><h3>No stories yet</h3><p>Start with one thought worth sharing.</p><Link href="/posts/new" className="read-link">Write your first story <ArrowRight size={14} /></Link></div>}
      </section>
      <section className="panel dashboard-panel" id="analytics"><h2>Monthly readership</h2><p>Views over time across your published articles.</p>
        <div className="chart-box">{stats?.monthlyViews.length ? <ResponsiveContainer width="100%" height="100%"><BarChart data={stats.monthlyViews} margin={{ top: 8, right: 6, left: -22, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--line)" /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "var(--muted)", fontSize: 11 }} /><YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "var(--muted)", fontSize: 11 }} /><Tooltip cursor={{ fill: "#102838" }} contentStyle={{ borderRadius: 8, border: "1px solid var(--line)", fontSize: 12 }} /><Bar dataKey="count" name="Views" fill="var(--cerulean)" radius={[5, 5, 0, 0]} maxBarSize={34} /></BarChart></ResponsiveContainer> : <div className="empty-state" style={{ padding: 30 }}><p>Monthly readership will appear as readers visit your stories.</p></div>}</div>
      </section>
    </div>
    <section className="panel dashboard-panel popular-articles" id="popular"><h2><TrendingUp size={18}/> Most popular articles</h2>{stats?.popularPosts.length ? stats.popularPosts.map(post=><Link href={`/posts/${post.id}`} key={post.id} className="popular-article"><strong>{post.title}</strong><span><Eye size={14}/>{post.viewCount} views</span></Link>) : <p>Publish a story to start building your readership.</p>}</section>
    </div>
  </div></main>;
}
