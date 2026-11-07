"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Bold, Eye, FileCode2, Heading1, Heading2, Heading3, ImagePlus, Italic, List, ListOrdered, LoaderCircle, Save, UploadCloud, Video } from "lucide-react";
import { api, getPost } from "@/lib/api";
import { useAuth } from "@/components/providers";
import { MarkdownBody } from "@/components/markdown-body";
import type { Post } from "@/lib/types";

type PostStatus = "DRAFT" | "SCHEDULED" | "PUBLISHED";
type Visibility = "PUBLIC" | "PRIVATE";
type DraftFields = { title: string; content: string; category: string; imageUrl: string | null; tags: string[]; visibility: Visibility; featured: boolean };

function toLocalDateTime(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

export function PostEditor({ postId }: { postId?: string }) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [activeId, setActiveId] = useState<string | null>(postId ?? null);
  const [postLoading, setPostLoading] = useState(Boolean(postId));
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Ideas");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [status, setStatus] = useState<PostStatus>("DRAFT");
  const [visibility, setVisibility] = useState<Visibility>("PUBLIC");
  const [featured, setFeatured] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");
  const [preview, setPreview] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [saveState, setSaveState] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastSavedSnapshot = useRef("");

  useEffect(() => {
    if (!postId) {
      const backup = localStorage.getItem("blogapp_new_editor_backup");
      if (backup) {
        try {
          const saved = JSON.parse(backup) as { fields: DraftFields; updatedAt: string };
          setTitle(saved.fields.title); setContent(saved.fields.content); setCategory(saved.fields.category);
          setImageUrl(saved.fields.imageUrl ?? ""); setTags(saved.fields.tags ?? []); setVisibility(saved.fields.visibility); setFeatured(saved.fields.featured);
          setSaveState("Recovered your unsaved changes");
        } catch { localStorage.removeItem("blogapp_new_editor_backup"); }
      }
      setPostLoading(false); return;
    }
    setActiveId(postId);
    getPost(postId).then((post: Post) => {
      setTitle(post.title); setContent(post.content); setImageUrl(post.imageUrl ?? "");
      setCategory(post.category || "Ideas"); setStatus(post.status || "PUBLISHED");
      setTags(post.tags ?? []);
      setVisibility(post.visibility || "PUBLIC"); setFeatured(post.featured);
      setScheduledAt(toLocalDateTime(post.scheduledAt));
      const fields: DraftFields = { title: post.title, content: post.content, category: post.category || "Ideas", imageUrl: post.imageUrl, tags: post.tags ?? [], visibility: post.visibility || "PUBLIC", featured: post.featured };
      lastSavedSnapshot.current = JSON.stringify(fields);
      const backupKey = `blogapp_editor_backup_${post.id}`;
      const backup = localStorage.getItem(backupKey);
      if (backup) {
        try {
          const saved = JSON.parse(backup) as { fields: DraftFields; updatedAt: string };
          if (new Date(saved.updatedAt) > new Date(post.updatedAt)) {
            setTitle(saved.fields.title); setContent(saved.fields.content); setCategory(saved.fields.category);
            setImageUrl(saved.fields.imageUrl ?? ""); setTags(saved.fields.tags ?? []); setVisibility(saved.fields.visibility); setFeatured(saved.fields.featured);
            setSaveState("Recovered your unsaved changes");
          }
        } catch { localStorage.removeItem(backupKey); }
      }
    }).catch((reason: Error) => setError(reason.message)).finally(() => setPostLoading(false));
  }, [postId]);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  const draftFields: DraftFields = { title, content, category, imageUrl: imageUrl || null, tags, visibility, featured };
  const snapshot = JSON.stringify(draftFields);

  useEffect(() => {
    if (!user || postLoading || submitting || !title.trim() || !content.trim() || snapshot === lastSavedSnapshot.current) return;
    const timer = window.setTimeout(async () => {
      const currentFields: DraftFields = { title, content, category, imageUrl: imageUrl || null, tags, visibility, featured };
      if (status !== "DRAFT") {
        if (activeId) localStorage.setItem(`blogapp_editor_backup_${activeId}`, JSON.stringify({ fields: currentFields, updatedAt: new Date().toISOString() }));
        else localStorage.setItem("blogapp_new_editor_backup", JSON.stringify({ fields: currentFields, updatedAt: new Date().toISOString() }));
        lastSavedSnapshot.current = snapshot;
        setSaveState("Changes saved on this device");
        return;
      }
      setSaveState("Saving draft…");
      try {
        const saved = await api<Post>(activeId ? `/posts/${activeId}` : "/posts", {
          method: activeId ? "PUT" : "POST",
          body: JSON.stringify({ ...currentFields, status: "DRAFT", scheduledAt: null }),
        });
        lastSavedSnapshot.current = snapshot;
        setSaveState(`Draft saved at ${new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`);
        if (!activeId) {
          setActiveId(String(saved.id));
          router.replace(`/posts/${saved.id}/edit`);
        }
      } catch (reason) {
        setSaveState(reason instanceof Error ? "Draft autosave paused" : "Draft autosave failed");
      }
    }, 900);
    return () => window.clearTimeout(timer);
  }, [user, postLoading, submitting, title, content, category, imageUrl, tags, visibility, featured, status, activeId, router, snapshot]);

  function insertMarkdown(before: string, after = "", fallback = "your text") {
    const field = textareaRef.current;
    if (!field) return;
    const start = field.selectionStart;
    const end = field.selectionEnd;
    const current = field.value;
    const selected = current.slice(start, end) || fallback;
    const replacement = `${before}${selected}${after}`;
    const next = current.slice(0, start) + replacement + current.slice(end);
    setContent(next);
    requestAnimationFrame(() => {
      field.focus();
      field.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  }

  function insertLinePrefix(prefix: string) {
    const field = textareaRef.current;
    if (!field) return;
    const start = field.selectionStart;
    const end = field.selectionEnd;
    const current = field.value;
    const selected = current.slice(start, end) || "List item";
    const replacement = selected.split("\n").map(line => `${prefix}${line}`).join("\n");
    setContent(current.slice(0, start) + replacement + current.slice(end));
    requestAnimationFrame(() => { field.focus(); field.setSelectionRange(start, start + replacement.length); });
  }

  async function uploadFile(file: File) {
    setError(""); setUploading(true);
    const form = new FormData(); form.append("file", file);
    try { return (await api<{ url: string }>("/uploads/images", { method: "POST", body: form })).url; }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Image upload failed"); return null; }
    finally { setUploading(false); }
  }

  async function uploadCover(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) { const url = await uploadFile(file); if (url) setImageUrl(url); }
    event.target.value = "";
  }

  async function insertImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      const url = await uploadFile(file);
      if (url) insertMarkdown(`![${file.name.replace(/[\[\]]/g, "")}](`, ")", url);
    }
    event.target.value = "";
  }

  function insertVideo() {
    const url = videoUrl.trim();
    if (!/^https:\/\//i.test(url)) { setError("Paste an https YouTube, Vimeo, or MP4 link first."); return; }
    setError(""); insertMarkdown("![video](", ")", url); setVideoUrl("");
  }

  async function savePost(nextStatus: PostStatus) {
    setError(""); setSubmitting(true); setSaveState("Saving…");
    try {
      const scheduleIso = nextStatus === "SCHEDULED" && scheduledAt ? new Date(scheduledAt).toISOString() : null;
      const saved = await api<Post>(activeId ? `/posts/${activeId}` : "/posts", {
        method: activeId ? "PUT" : "POST",
        body: JSON.stringify({ ...draftFields, status: nextStatus, scheduledAt: scheduleIso }),
      });
      setStatus(nextStatus); setActiveId(String(saved.id));
      localStorage.removeItem(`blogapp_editor_backup_${saved.id}`); localStorage.removeItem("blogapp_new_editor_backup");
      lastSavedSnapshot.current = snapshot;
      setSaveState(nextStatus === "SCHEDULED" ? "Scheduled" : nextStatus === "DRAFT" ? "Draft saved" : "Published");
      if (nextStatus === "PUBLISHED") router.push(`/posts/${saved.id}`);
      else router.push("/dashboard");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not save your story"); setSaveState(""); }
    finally { setSubmitting(false); }
  }

  function submit(event: React.FormEvent) { event.preventDefault(); void savePost(status); }
  function addTags(raw: string) { const next=raw.split(",").map(v=>v.trim().replace(/^#/ ,"").toLowerCase()).filter(Boolean); if(next.length)setTags(current=>Array.from(new Set([...current,...next])).slice(0,8)); setTagInput(""); }

  if (authLoading || postLoading) return <main className="page-wrap"><div className="shell editor-skeleton"><div className="skeleton-line shimmer title" /><div className="skeleton-cover shimmer" /></div></main>;
  if (!user) return null;

  const statusLabel = status === "DRAFT" ? "Save draft" : status === "SCHEDULED" ? "Schedule story" : "Publish story";
  return <main className="page-wrap"><div className="shell">
    <div className="page-heading"><Link className="read-link" href={activeId ? "/dashboard" : "/dashboard"}><ArrowLeft size={15} /> Back to dashboard</Link><div className="section-kicker" style={{ marginTop: 19 }}>{activeId ? "Your writing" : "New story"}</div><h1>{activeId ? "Shape your story." : "What's on your mind?"}</h1><p>Write in Markdown, preview as you go, and choose when your story goes live.</p></div>
    <form className="panel form-card wide editor-panel" onSubmit={submit}>
      <div className="editor-topline"><span className={`status-dot status-${status.toLowerCase()}`} /> {status === "DRAFT" ? "Draft" : status === "SCHEDULED" ? "Scheduled" : "Published"}<span className="autosave-status"><Save size={13} /> {saveState || (status === "DRAFT" ? "Draft autosaves as you write" : "Changes autosave on this device")}</span></div>
      <div className="field"><label htmlFor="title">Title</label><input id="title" required maxLength={180} value={title} onChange={e => setTitle(e.target.value)} placeholder="Give your story a title" /></div>
      <div className="editor-options">
        <div className="field"><label htmlFor="category">Category</label><select id="category" value={category} onChange={e => setCategory(e.target.value)}><option>Ideas</option><option>Design</option><option>Culture</option><option>Travel</option><option>Life</option><option>Writing</option></select></div>
        <div className="field"><label htmlFor="visibility">Visibility</label><select id="visibility" value={visibility} onChange={e => setVisibility(e.target.value as Visibility)}><option value="PUBLIC">Public</option><option value="PRIVATE">Private — only you</option></select></div>
      </div>
      <div className="field"><label htmlFor="tags">Tags <span className="field-hint">(up to 8, comma separated)</span></label><input id="tags" value={tagInput} onChange={e=>setTagInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"||e.key===","){e.preventDefault();addTags(tagInput)}}} onBlur={()=>tagInput.trim()&&addTags(tagInput)} placeholder="e.g. creativity, habits"/><div className="editor-tag-list">{tags.map(tag=><button type="button" key={tag} onClick={()=>setTags(tags.filter(item=>item!==tag))}>#{tag} ×</button>)}</div></div>
      <div className="field"><div className="editor-label-row"><label htmlFor="content">Story</label><button type="button" className={preview ? "preview-toggle active" : "preview-toggle"} onClick={() => setPreview(!preview)}><Eye size={14} /> {preview ? "Edit Markdown" : "Preview"}</button></div>
        <div className="markdown-toolbar" aria-label="Formatting tools">
          <button type="button" title="Heading 1" onClick={() => insertMarkdown("# ", "", "Heading")}><Heading1 size={17} /></button>
          <button type="button" title="Heading 2" onClick={() => insertMarkdown("## ", "", "Heading")}><Heading2 size={17} /></button>
          <button type="button" title="Heading 3" onClick={() => insertMarkdown("### ", "", "Heading")}><Heading3 size={17} /></button>
          <span className="toolbar-divider" />
          <button type="button" title="Bold" onClick={() => insertMarkdown("**", "**")}><Bold size={16} /></button>
          <button type="button" title="Italic" onClick={() => insertMarkdown("*", "*")}><Italic size={16} /></button>
          <button type="button" title="Code block" onClick={() => insertMarkdown("```\n", "\n```", "code goes here")}><FileCode2 size={16} /></button>
          <span className="toolbar-divider" />
          <button type="button" title="Bullet list" onClick={() => insertLinePrefix("- ")}><List size={17} /></button>
          <button type="button" title="Numbered list" onClick={() => insertLinePrefix("1. ")}><ListOrdered size={17} /></button>
          <label className="toolbar-upload" title="Insert image"><ImagePlus size={16} /><input type="file" accept="image/*" hidden disabled={uploading} onChange={insertImage} /></label>
          {uploading && <span className="toolbar-hint"><LoaderCircle size={13} className="animate-spin" /> Uploading</span>}
        </div>
        {preview ? <div className="markdown-preview"><MarkdownBody content={content || "Your story preview will appear here."} /></div> : <textarea ref={textareaRef} id="content" required value={content} onChange={e => setContent(e.target.value)} placeholder={"## Begin with a thought\n\nWrite naturally, or use the toolbar to format your story…"} />}
        {!preview && <div className="video-insert-row"><Video size={15} /><input aria-label="Video URL" type="url" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="YouTube, Vimeo, or MP4 link" /><button type="button" onClick={insertVideo}>Insert video</button><span>Markdown + GFM supported</span></div>}
      </div>
      <div className="field"><label>Cover image <span className="field-hint">(optional)</span></label><div className="upload-row">
        {imageUrl ? <img src={imageUrl} className="upload-preview" alt="Selected cover" /> : <div className="upload-preview" style={{ display: "grid", placeItems: "center", color: "var(--cerulean)" }}><ImagePlus size={23} /></div>}
        <label className="button button-light button-small">{uploading ? <><LoaderCircle size={15} className="animate-spin" /> Uploading</> : <><UploadCloud size={15} /> Choose cover</>}<input type="file" accept="image/*" hidden disabled={uploading} onChange={uploadCover} /></label>
        {imageUrl && <button type="button" className="danger-button" onClick={() => setImageUrl("")}>Remove</button>}
      </div><div className="field-hint">Inline images and cover images are stored on Cloudinary.</div></div>
      <label className="featured-option"><input type="checkbox" checked={featured} onChange={e => setFeatured(e.target.checked)} /><span><strong>Feature this story</strong><small>Give it extra visibility in the public journal.</small></span></label>
      <div className="publish-options">
        <div className="field"><label htmlFor="publish-status">Publishing</label><select id="publish-status" value={status} onChange={e => setStatus(e.target.value as PostStatus)}><option value="DRAFT">Save as draft</option><option value="PUBLISHED">Publish now</option><option value="SCHEDULED">Schedule for later</option></select></div>
        {status === "SCHEDULED" && <div className="field"><label htmlFor="scheduledAt">Publish date and time</label><input id="scheduledAt" type="datetime-local" required value={scheduledAt} min={new Date(Date.now() + 60_000 - new Date().getTimezoneOffset() * 60_000).toISOString().slice(0, 16)} onChange={e => setScheduledAt(e.target.value)} /></div>}
      </div>
      {error && <div className="form-error">{error}</div>}
      <div className="form-actions editor-actions"><button type="button" className="button button-light" disabled={submitting || uploading} onClick={() => void savePost("DRAFT")}><Save size={15} /> Save draft</button><button disabled={submitting || uploading} className="button button-dark">{submitting ? <><LoaderCircle size={16} className="animate-spin" /> Saving</> : statusLabel}</button>{activeId && <Link href={`/posts/${activeId}`} className="button button-light">Preview post</Link>}</div>
    </form>
  </div></main>;
}
