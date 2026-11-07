"use client";

import Link from "next/link";
import { BookOpen, LogOut, PenLine, UserRound } from "lucide-react";
import { useAuth } from "@/components/providers";
import { ThemeToggle } from "@/components/theme-toggle";

export function Navbar() {
  const { user, logout } = useAuth();
  return (
    <header className="site-header">
      <div className="shell nav-wrap">
        <Link href="/" className="brand"><span className="brand-icon"><BookOpen size={20} /></span> Ink &amp; Ideas</Link>
        <nav className="nav-links">
          <Link href="/">Discover</Link>
          {user && <><Link href="/dashboard">Dashboard</Link><Link href="/bookmarks">Bookmarks</Link><Link href="/following">Following</Link></>}
        </nav>
        <div className="nav-actions">
          <ThemeToggle />
          {user ? <>
            <Link href="/posts/new" className="button button-dark button-small"><PenLine size={15} /> Write</Link>
            <Link href="/profile" className="avatar-link" title="Profile"><span className="avatar">{user.username.slice(0, 1).toUpperCase()}</span><span className="nav-username">{user.username}</span></Link>
            <button className="icon-button" title="Sign out" onClick={logout}><LogOut size={17} /></button>
          </> : <>
            <Link href="/login" className="nav-login"><UserRound size={16} /> Sign in</Link>
            <Link href="/register" className="button button-dark button-small">Join free</Link>
          </>}
        </div>
      </div>
    </header>
  );
}
