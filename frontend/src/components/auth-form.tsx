"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, BookOpen, LoaderCircle } from "lucide-react";
import { api, type AuthResponse } from "@/lib/api";
import { useAuth } from "@/components/providers";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const isRegister = mode === "register";
  const router = useRouter();
  const { acceptAuth } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setError(""); setSubmitting(true);
    try {
      const result = await api<AuthResponse>(`/auth/${mode}`, { method: "POST", body: JSON.stringify(isRegister ? { username, email, password } : { username, password }) });
      acceptAuth(result);
      router.push("/dashboard");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not sign in"); }
    finally { setSubmitting(false); }
  }

  return <main className="auth-wrap"><section className="auth-card">
    <span className="brand-icon"><BookOpen size={20} /></span>
    <h1>{isRegister ? "Make yourself at home." : "Welcome back."}</h1>
    <p>{isRegister ? "Create a free account and give your ideas a place to land." : "Sign in and pick up where your ideas left off."}</p>
    <form onSubmit={submit}>
      <div className="field"><label htmlFor="username">{isRegister ? "Username" : "Username or email"}</label><input id="username" required minLength={isRegister ? 3 : undefined} autoComplete="username" value={username} onChange={e => setUsername(e.target.value)} placeholder={isRegister ? "yourname" : "you@example.com"} /></div>
      {isRegister && <div className="field"><label htmlFor="email">Email</label><input id="email" type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" /></div>}
      <div className="field"><label htmlFor="password">Password</label><input id="password" type="password" required minLength={isRegister ? 8 : undefined} autoComplete={isRegister ? "new-password" : "current-password"} value={password} onChange={e => setPassword(e.target.value)} placeholder={isRegister ? "At least 8 characters" : "Your password"} />{isRegister && <div className="field-hint">Use uppercase and lowercase letters, plus a number.</div>}</div>
      {error && <div className="form-error">{error}</div>}
      <button className="button button-dark full-width" disabled={submitting}>{submitting ? <LoaderCircle size={16} className="animate-spin" /> : <>{isRegister ? "Create account" : "Sign in"} <ArrowRight size={16} /></>}</button>
    </form>
    <div className="auth-switch">{isRegister ? "Already have an account? " : "New to Ink & Ideas? "}<Link href={isRegister ? "/login" : "/register"}>{isRegister ? "Sign in" : "Join free"}</Link></div>
  </section></main>;
}
