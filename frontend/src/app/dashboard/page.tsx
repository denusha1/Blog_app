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

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
    if (user) Promise.all([getMyPosts(), getStats()]).then(([mine, summary]) => {
      setPosts(mine); setStats(summary);
    }).catch((reason: Error) => setError(reason.message)).finally(() => setLoading(false));
  }, [user, authLoading, router]);

  if (authLoading || !user || loading) return <main className="page-wrap"><div className="shell empty-state"><LoaderCircle size={22} className="animate-spin" /></div></main>;
  return <main className="page-wrap"><div className="shell">
    <div className="dashboard-top"><div className="page-heading" style={{ margin: 0 }}><div className="section-kicker">Your corner</div><h1>Good to see you, {user.username}.</h1><p>Keep your ideas moving. Your stories are right here.</p></div><Link href="/posts/new" className="button button-dark"><Plus size={16} /> Write a story</Link></div>
    {error && <div className="form-error">{error}</div>}
    <div className="stat-grid"><div className="stat-card"><span>Stories written</span><strong>{stats?.totalPosts ?? posts.length}</strong></div><div className="stat-card"><span>Published</span><strong>{stats?.publishedPosts ?? posts.length}</strong></div><div className="stat-card"><span>Member since</span><strong style={{ fontSize: 23 }}>{new Date(user.createdAt).toLocaleDateString(undefined, { month: "short", year: "numeric" })}</strong></div></div>
    <div className="dashboard-grid">
      <section className="panel dashboard-panel"><h2>Your stories</h2><p>A little progress adds up.</p>
        {posts.length ? posts.map(post => <div className="my-post-row" key={post.id}><div className="my-post-thumb">{post.imageUrl ? <img src={post.imageUrl} alt="" /> : <FileText size={19} />}</div><div className="my-post-info"><strong>{post.title}</strong><span>{new Date(post.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })}</span></div><div className="row-actions"><Link href={`/posts/${post.id}`} title="Read"><ArrowRight size={15} /></Link><Link href={`/posts/${post.id}/edit`} title="Edit"><PenLine size={15} /></Link></div></div>) : <div className="empty-state" style={{ padding: "30px 15px", marginTop: 8 }}><Sparkles size={20} /><h3>No stories yet</h3><p>Start with one thought worth sharing.</p><Link href="/posts/new" className="read-link">Write your first story <ArrowRight size={14} /></Link></div>}
      </section>
      <section className="panel dashboard-panel"><h2>Your rhythm</h2><p>Stories published over the last six months.</p>
        <div className="chart-box">{stats?.monthlyPosts.length ? <ResponsiveContainer width="100%" height="100%"><BarChart data={stats.monthlyPosts} margin={{ top: 8, right: 6, left: -22, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf0ec" /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#879189", fontSize: 11 }} /><YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "#879189", fontSize: 11 }} /><Tooltip cursor={{ fill: "#f5f7f2" }} contentStyle={{ borderRadius: 8, border: "1px solid #e7ebe6", fontSize: 12 }} /><Bar dataKey="count" name="Stories" fill="#6b8b6d" radius={[5, 5, 0, 0]} maxBarSize={34} /></BarChart></ResponsiveContainer> : <div className="empty-state" style={{ padding: 30 }}><p>Your publishing activity will appear here.</p></div>}</div>
      </section>
    </div>
  </div></main>;
}
