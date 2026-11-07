"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, BookOpen, Eye, EyeOff, LoaderCircle, PenLine, Sparkles } from "lucide-react";
import { api, type AuthResponse } from "@/lib/api";
import { useAuth } from "@/components/providers";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const isRegister = mode === "register";
  const router = useRouter();
  const { acceptAuth } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword,setShowPassword]=useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setError("");
    if (isRegister && !/^[A-Za-z0-9_]{3,50}$/.test(username.trim())) {
      setError("Username must be 3–50 characters and use only letters, numbers, or underscores.");
      return;
    }
    if (isRegister && !/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,100}$/.test(password)) {
      setError("Password needs at least 8 characters, including an uppercase letter, a lowercase letter, and a number.");
      return;
    }
    setSubmitting(true);
    try {
      const result = await api<AuthResponse>(`/auth/${mode}`, { method: "POST", body: JSON.stringify(isRegister ? { username, email, password } : { username, password }) });
      acceptAuth(result);
      router.push("/dashboard");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not sign in"); }
    finally { setSubmitting(false); }
  }

  return <main className={`auth-wrap auth-wrap-${mode}`}>
    <section className="auth-story-panel"><Link href="/" className="auth-story-brand"><span className="brand-icon"><BookOpen size={19}/></span><span>Ink <i>&amp;</i> Ideas</span></Link><div className="auth-story-copy"><div className="auth-kicker"><Sparkles size={14}/> THE WRITER'S EDITION</div><h2>{isRegister?<>Give your ideas<br/><em>a place to glow.</em></>:<>Good ideas<br/><em>find their way back.</em></>}</h2><p>{isRegister?"A thoughtful home for your writing, your readers, and the next idea you cannot stop thinking about.":"Return to your drafts, your reading list, and the conversations that keep your ideas moving."}</p><div className="auth-story-points"><span><i/> Write with intention</span><span><i/> Find your people</span><span><i/> Keep what inspires you</span></div></div><div className="auth-story-footer"><span>THINK <b>·</b> WRITE <b>·</b> SHARE</span><span className="auth-story-flare"><PenLine size={16}/></span></div></section>
    <section className="auth-card"><Link href="/" className="auth-mobile-brand"><span className="brand-icon"><BookOpen size={18}/></span> Ink &amp; Ideas</Link><div className="auth-card-heading"><div className="auth-form-kicker">{isRegister?"YOUR NEXT CHAPTER":"YOUR WRITING SPACE"}</div><h1>{isRegister?"Join the journal.":"Welcome back."}</h1><p>{isRegister?"Create an account and start sharing what matters to you.":"Sign in to pick up where your ideas left off."}</p></div>
      <form onSubmit={submit}>
        <div className="field"><label htmlFor="username">{isRegister ? "Username" : "Username or email"}</label><input id="username" required minLength={isRegister ? 3 : undefined} maxLength={isRegister ? 50 : undefined} pattern={isRegister ? "[A-Za-z0-9_]+" : undefined} autoComplete="username" value={username} onChange={e => setUsername(e.target.value)} placeholder={isRegister ? "yourname" : "you@example.com"} />{isRegister&&<div className="field-hint">3–50 characters · letters, numbers, and underscores only</div>}</div>
        {isRegister && <div className="field"><label htmlFor="email">Email address</label><input id="email" type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" /></div>}
        <div className="field"><label htmlFor="password">Password</label><div className="auth-password-field"><input id="password" type={showPassword?"text":"password"} required minLength={isRegister ? 8 : undefined} maxLength={isRegister ? 100 : undefined} autoComplete={isRegister ? "new-password" : "current-password"} value={password} onChange={e => setPassword(e.target.value)} placeholder={isRegister ? "At least 8 characters" : "Enter your password"} /><button type="button" aria-label={showPassword?"Hide password":"Show password"} onClick={()=>setShowPassword(value=>!value)}>{showPassword?<EyeOff size={16}/>:<Eye size={16}/>}</button></div>{isRegister && <div className="field-hint">At least 8 characters with uppercase, lowercase, and a number.</div>}</div>
        {error && <div className="form-error">{error}</div>}
        <button className="button button-dark full-width auth-submit" disabled={submitting}>{submitting ? <LoaderCircle size={16} className="animate-spin" /> : <>{isRegister ? "Create your account" : "Sign in to your space"} <ArrowRight size={16} /></>}</button>
      </form>
      <div className="auth-switch">{isRegister ? "Already have an account? " : "New to Ink & Ideas? "}<Link href={isRegister ? "/login" : "/register"}>{isRegister ? "Sign in" : "Join for free"}</Link></div><div className="auth-card-foot">A quiet corner of the internet for curious minds.</div>
    </section>
  </main>;
}
