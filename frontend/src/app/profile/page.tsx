"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Save, ShieldCheck, Trash2 } from "lucide-react";
import { api, type AuthResponse } from "@/lib/api";
import { useAuth } from "@/components/providers";
import type { User } from "@/lib/types";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, acceptAuth, logout } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) { setUsername(user.username); setEmail(user.email); }
    else if (!loading) router.replace("/login");
  }, [user, loading, router]);

  if (loading || !user) return <main className="page-wrap"><div className="shell empty-state"><LoaderCircle size={22} className="animate-spin" /></div></main>;

  async function saveProfile(event: React.FormEvent) {
    event.preventDefault(); setError(""); setMessage(""); setSaving(true);
    try {
      const response = await api<AuthResponse>("/auth/me", { method: "PUT", body: JSON.stringify({ username, email }) });
      acceptAuth(response); setMessage("Your profile has been updated.");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not update profile"); }
    finally { setSaving(false); }
  }

  async function changePassword(event: React.FormEvent) {
    event.preventDefault(); setError(""); setMessage(""); setSaving(true);
    try {
      await api("/auth/change-password", { method: "POST", body: JSON.stringify({ currentPassword, newPassword }) });
      setCurrentPassword(""); setNewPassword(""); setMessage("Password changed.");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not change password"); }
    finally { setSaving(false); }
  }

  async function deleteAccount() {
    if (!window.confirm("Delete your account and all your stories? This cannot be undone.")) return;
    try { await api("/auth/me", { method: "DELETE" }); logout(); router.push("/"); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Could not delete account"); }
  }

  return <main className="page-wrap"><div className="shell">
    <div className="page-heading"><div className="section-kicker">Account</div><h1>Your profile</h1><p>Keep your details up to date and your account secure.</p></div>
    {message && <div className="form-success">{message}</div>}{error && <div className="form-error">{error}</div>}
    <div className="dashboard-grid">
      <form className="panel" onSubmit={saveProfile}><h2>Personal details</h2><div className="field"><label htmlFor="username">Username</label><input id="username" minLength={3} maxLength={50} required value={username} onChange={e => setUsername(e.target.value)} /></div><div className="field"><label htmlFor="email">Email</label><input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} /></div><button disabled={saving} className="button button-dark button-small"><Save size={15} /> Save profile</button></form>
      <form className="panel" onSubmit={changePassword}><h2>Change password</h2><div className="field"><label htmlFor="current">Current password</label><input id="current" type="password" required value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} /></div><div className="field"><label htmlFor="next">New password</label><input id="next" type="password" required minLength={8} value={newPassword} onChange={e => setNewPassword(e.target.value)} /><div className="field-hint">At least 8 characters, with uppercase, lowercase and a number.</div></div><button disabled={saving} className="button button-light button-small"><ShieldCheck size={15} /> Update password</button></form>
    </div>
    <section className="panel" style={{ marginTop: 18, borderColor: "var(--line)" }}><h2>Delete account</h2><p style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.6 }}>Your account and all published stories will be permanently removed.</p><button className="danger-button" onClick={deleteAccount}><Trash2 size={15} /> Delete account</button></section>
  </div></main>;
}
