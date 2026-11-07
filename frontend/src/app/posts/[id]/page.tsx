"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CalendarDays, LoaderCircle, Pencil, Trash2, UserRound } from "lucide-react";
import { api, getPost } from "@/lib/api";
import { useAuth } from "@/components/providers";
import type { Post } from "@/lib/types";

export default function StoryPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { getPost(id).then(setPost).catch((reason: Error) => setError(reason.message)); }, [id]);

  async function remove() {
    if (!post || !window.confirm("Delete this story permanently?")) return;
    setDeleting(true);
    try { await api<void>(`/posts/${post.id}`, { method: "DELETE" }); router.push("/dashboard"); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Could not delete story"); setDeleting(false); }
  }

  if (error) return <main className="page-wrap"><div className="shell"><div className="form-error">{error}</div><Link href="/" className="read-link"><ArrowLeft size={15} /> Return to stories</Link></div></main>;
  if (!post) return <main className="page-wrap"><div className="shell empty-state"><LoaderCircle size={22} className="animate-spin" /></div></main>;
  const isAuthor = user?.id === post.authorId;
  return <main className="page-wrap"><article className="shell story-wrap">
    <Link href="/" className="read-link"><ArrowLeft size={15} /> All stories</Link>
    {post.imageUrl && <img className="story-cover" src={post.imageUrl} alt="" style={{ marginTop: 22 }} />}
    <h1 className="story-title">{post.title}</h1>
    <span className={`category-tag category-${(post.category || "Writing").toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}>{post.category || "Writing"}</span>
    <div className="story-meta"><span><UserRound size={14} /> {post.authorName}</span><span><CalendarDays size={14} /> {new Date(post.createdAt).toLocaleDateString(undefined, { dateStyle: "long" })}</span></div>
    <div className="story-content">{post.content}</div>
    {error && <div className="form-error">{error}</div>}
    {isAuthor && <div className="story-actions"><Link className="button button-light button-small" href={`/posts/${post.id}/edit`}><Pencil size={15} /> Edit story</Link><button disabled={deleting} className="danger-button" onClick={remove}>{deleting ? <LoaderCircle size={15} className="animate-spin" /> : <Trash2 size={15} />} Delete</button></div>}
  </article></main>;
}
