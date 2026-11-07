"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowRight, FileText, LoaderCircle, PenLine, Plus, Sparkles } from "lucide-react";
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

  if (authLoading || !user || loading) return <main className="page-wrap"><div className="shell empty-state"><LoaderCircle size={22} className="animate-spin" /></div></main>;
  const visiblePosts = filterStatus === "ALL" ? posts : posts.filter(post => post.status === filterStatus);
  return <main className="page-wrap"><div className="shell">
    <div className="dashboard-top"><div className="page-heading" style={{ margin: 0 }}><div className="section-kicker">Your corner</div><h1>Good to see you, {user.username}.</h1><p>Keep your ideas moving. Your stories are right here.</p></div><Link href="/posts/new" className="button button-dark"><Plus size={16} /> Write a story</Link></div>
    {error && <div className="form-error">{error}</div>}
    <div className="stat-grid management-stats"><div className="stat-card"><span>All stories</span><strong>{stats?.totalPosts ?? posts.length}</strong></div><div className="stat-card"><span>Published</span><strong>{stats?.publishedPosts ?? posts.filter(post => post.status === "PUBLISHED").length}</strong></div><div className="stat-card"><span>Drafts</span><strong>{stats?.draftPosts ?? posts.filter(post => post.status === "DRAFT").length}</strong></div><div className="stat-card"><span>Scheduled</span><strong>{stats?.scheduledPosts ?? posts.filter(post => post.status === "SCHEDULED").length}</strong></div></div>
    <div className="dashboard-grid">
      <section className="panel dashboard-panel"><div className="management-heading"><div><h2>Your stories</h2><p>Draft, publish, and schedule your writing.</p></div><div className="status-filters">{["ALL", "DRAFT", "SCHEDULED", "PUBLISHED"].map(value => <button key={value} className={filterStatus === value ? "filter-chip active" : "filter-chip"} onClick={() => setFilterStatus(value)}>{value === "ALL" ? "All" : value.charAt(0) + value.slice(1).toLowerCase()}</button>)}</div></div>
        {visiblePosts.length ? visiblePosts.map(post => <div className="my-post-row" key={post.id}><div className="my-post-thumb">{post.imageUrl ? <img src={post.imageUrl} alt="" /> : <FileText size={19} />}</div><div className="my-post-info"><strong>{post.title}</strong><span>{post.status === "SCHEDULED" && post.scheduledAt ? `Goes live ${new Date(post.scheduledAt).toLocaleString()}` : new Date(post.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })}</span><div className="row-badges"><span className={`post-status status-${post.status.toLowerCase()}`}>{post.status.charAt(0) + post.status.slice(1).toLowerCase()}</span><span className={`post-status ${post.visibility === "PRIVATE" ? "status-private" : "status-public"}`}>{post.visibility.toLowerCase()}</span>{post.featured && <span className="post-status status-featured">Featured</span>}</div></div><div className="row-actions"><Link href={`/posts/${post.id}`} title="Preview"><ArrowRight size={15} /></Link><Link href={`/posts/${post.id}/edit`} title="Edit"><PenLine size={15} /></Link></div></div>) : posts.length ? <div className="empty-state" style={{ padding: "28px 15px", marginTop: 8 }}><p>No {filterStatus.toLowerCase()} stories.</p></div> : <div className="empty-state" style={{ padding: "30px 15px", marginTop: 8 }}><Sparkles size={20} /><h3>No stories yet</h3><p>Start with one thought worth sharing.</p><Link href="/posts/new" className="read-link">Write your first story <ArrowRight size={14} /></Link></div>}
      </section>
      <section className="panel dashboard-panel"><h2>Your rhythm</h2><p>Stories published over the last six months.</p>
        <div className="chart-box">{stats?.monthlyPosts.length ? <ResponsiveContainer width="100%" height="100%"><BarChart data={stats.monthlyPosts} margin={{ top: 8, right: 6, left: -22, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--line)" /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "var(--muted)", fontSize: 11 }} /><YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "var(--muted)", fontSize: 11 }} /><Tooltip cursor={{ fill: "#102838" }} contentStyle={{ borderRadius: 8, border: "1px solid var(--line)", fontSize: 12 }} /><Bar dataKey="count" name="Stories" fill="var(--cerulean)" radius={[5, 5, 0, 0]} maxBarSize={34} /></BarChart></ResponsiveContainer> : <div className="empty-state" style={{ padding: 30 }}><p>Your publishing activity will appear here.</p></div>}</div>
      </section>
    </div>
  </div></main>;
}
