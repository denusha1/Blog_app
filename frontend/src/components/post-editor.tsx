"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ImagePlus, LoaderCircle, UploadCloud } from "lucide-react";
import { api, getPost } from "@/lib/api";
import { useAuth } from "@/components/providers";
import type { Post } from "@/lib/types";

export function PostEditor({ postId }: { postId?: string }) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [postLoading, setPostLoading] = useState(Boolean(postId));
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Ideas");
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (postId) getPost(postId).then((post: Post) => {
      setTitle(post.title); setContent(post.content); setImageUrl(post.imageUrl ?? "");
      setCategory(post.category || "Ideas");
    }).catch((reason: Error) => setError(reason.message)).finally(() => setPostLoading(false));
  }, [postId]);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  async function upload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError(""); setUploading(true);
    const form = new FormData(); form.append("file", file);
    try {
      const result = await api<{ url: string }>("/uploads/images", { method: "POST", body: form });
      setImageUrl(result.url);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Image upload failed"); }
    finally { setUploading(false); event.target.value = ""; }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setError(""); setSubmitting(true);
    try {
      const post = await api<Post>(postId ? `/posts/${postId}` : "/posts", {
        method: postId ? "PUT" : "POST", body: JSON.stringify({ title, content, category, imageUrl: imageUrl || null }),
      });
      router.push(`/posts/${post.id}`);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not save your story"); }
    finally { setSubmitting(false); }
  }

  if (authLoading || postLoading) return <main className="page-wrap"><div className="shell empty-state"><LoaderCircle size={22} className="animate-spin" /></div></main>;
  if (!user) return null;
  return <main className="page-wrap"><div className="shell">
    <div className="page-heading"><Link className="read-link" href={postId ? `/posts/${postId}` : "/dashboard"}><ArrowLeft size={15} /> Back</Link><div className="section-kicker" style={{ marginTop: 19 }}>{postId ? "Your writing" : "New story"}</div><h1>{postId ? "Shape your story." : "What's on your mind?"}</h1><p>Write honestly. You can always come back and refine it.</p></div>
    <form className="panel form-card wide" onSubmit={submit}>
      <div className="field"><label htmlFor="title">Title</label><input id="title" required maxLength={180} value={title} onChange={e => setTitle(e.target.value)} placeholder="Give your story a title" /></div>
      <div className="field"><label htmlFor="category">Category</label><select id="category" value={category} onChange={e => setCategory(e.target.value)}><option>Ideas</option><option>Design</option><option>Culture</option><option>Travel</option><option>Life</option><option>Writing</option></select><div className="field-hint">Choose a topic. Each category has its own color in the journal.</div></div>
      <div className="field"><label htmlFor="content">Story</label><textarea id="content" required value={content} onChange={e => setContent(e.target.value)} placeholder="Start with the thought you can't stop thinking about…" /><div className="field-hint">Plain text is welcome. Line breaks are preserved.</div></div>
      <div className="field"><label>Cover image <span className="field-hint">(optional)</span></label><div className="upload-row">
        {imageUrl ? <img src={imageUrl} className="upload-preview" alt="Selected cover" /> : <div className="upload-preview" style={{ display: "grid", placeItems: "center", color: "#82927f" }}><ImagePlus size={23} /></div>}
        <label className="button button-light button-small">{uploading ? <><LoaderCircle size={15} className="animate-spin" /> Uploading</> : <><UploadCloud size={15} /> Choose image</>}<input type="file" accept="image/*" hidden disabled={uploading} onChange={upload} /></label>
        {imageUrl && <button type="button" className="danger-button" onClick={() => setImageUrl("")}>Remove</button>}
      </div><div className="field-hint">Images are stored on Cloudinary. Uploads need Cloudinary credentials configured in your environment.</div></div>
      {error && <div className="form-error">{error}</div>}
      <div className="form-actions"><button disabled={submitting || uploading} className="button button-dark">{submitting ? <><LoaderCircle size={16} className="animate-spin" /> Saving</> : postId ? "Save changes" : "Publish story"}</button><Link href={postId ? `/posts/${postId}` : "/dashboard"} className="button button-light">Cancel</Link></div>
    </form>
  </div></main>;
}
