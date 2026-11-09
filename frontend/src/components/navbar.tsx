"use client";

import {useEffect,useState} from "react";
import Link from "next/link";
import { Bell, BookOpen, Compass, Home, LogOut, PenLine, UserPlus, UserRound } from "lucide-react";
import {usePathname} from "next/navigation";
import { useAuth } from "@/components/providers";
import {api,getNotifications,getUnreadNotificationCount,type NotificationItem} from "@/lib/api";

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname=usePathname();
  const [unread,setUnread]=useState(0);
  const [noticeOpen,setNoticeOpen]=useState(false);
  const [recent,setRecent]=useState<NotificationItem[]>([]);
  useEffect(()=>{if(!user){setUnread(0);return;}const load=()=>getUnreadNotificationCount().then(setUnread).catch(()=>{});load();const timer=setInterval(load,30000);return()=>clearInterval(timer);},[user]);
  async function toggleNotifications(){const open=!noticeOpen;setNoticeOpen(open);if(open&&user){try{setRecent((await getNotifications()).slice(0,5));}catch{setRecent([]);}}}
  async function markNotificationsRead(){try{await api("/notifications/read-all",{method:"PUT"});setUnread(0);setRecent(items=>items.map(item=>({...item,readAt:item.readAt||new Date().toISOString()})));}catch{}}
  return (
    <>
    <header className="site-header">
      <div className="shell nav-wrap">
        <Link href="/" className="brand"><span className="brand-icon"><BookOpen size={20} /></span> Ink &amp; Ideas</Link>
        <nav className="nav-links">
          <Link href="/">Discover</Link>
          <Link href="/explore">Explore</Link>
          {user && <><Link href="/dashboard">Dashboard</Link><Link href="/bookmarks">Bookmarks</Link><Link href="/history">History</Link><Link href="/following">Following</Link>{user.role === "ADMIN" && <Link href="/admin">Admin</Link>}</>}
        </nav>
        <div className="nav-actions">
          {user ? <>
            <div className="notification-menu"><button className="notification-trigger" type="button" aria-label={`Notifications${unread?`, ${unread} unread`:""}`} aria-expanded={noticeOpen} onClick={toggleNotifications}><Bell size={18}/>{unread>0&&<span>{unread>99?"99+":unread}</span>}</button>{noticeOpen&&<section className="notification-dropdown"><div className="notification-dropdown-head"><strong>Notifications</strong><button onClick={markNotificationsRead} disabled={!unread}>Mark read</button></div>{recent.length?recent.map(item=><Link href={item.postId?`/posts/${item.postId}`:"/notifications"} onClick={()=>setNoticeOpen(false)} className={item.readAt?"notification-preview":"notification-preview unread"} key={item.id}><span><b>{item.actorName}</b> {item.type==="LIKE"?"liked your story":item.type==="COMMENT"?"commented on your story":item.type==="FOLLOW"?"followed you":"published a new article"}</span><small>{item.postTitle||new Date(item.createdAt).toLocaleDateString()}</small></Link>):<div className="notification-dropdown-empty">You’re all caught up.</div>}<Link href="/notifications" className="notification-dropdown-all" onClick={()=>setNoticeOpen(false)}>View all activity</Link></section>}</div>
            <Link href="/posts/new" className="button button-dark button-small"><PenLine size={15} /> Write</Link>
            <Link href="/profile" className="avatar-link" title="Profile"><span className="avatar">{user.avatarUrl?<img src={user.avatarUrl} alt=""/>:user.username.slice(0, 1).toUpperCase()}</span><span className="nav-username">{user.username}</span></Link>
            <button className="icon-button" title="Sign out" onClick={logout}><LogOut size={17} /></button>
          </> : <>
            <Link href="/login" className="nav-login"><UserRound size={16} /> Sign in</Link>
            <Link href="/register" className="button button-dark button-small">Join free</Link>
          </>}
        </div>
      </div>
    </header>
    <nav className="mobile-bottom-nav" aria-label="Mobile navigation"><Link className={pathname==="/"?"active":""} href="/"><Compass size={19}/><span>Discover</span></Link>{user?<><Link className={pathname==="/dashboard"?"active":""} href="/dashboard"><Home size={19}/><span>Dashboard</span></Link><Link className="mobile-write" href="/posts/new"><PenLine size={19}/><span>Write</span></Link><Link className={pathname==="/notifications"?"active":""} href="/notifications"><span className="mobile-bell"><Bell size={19}/>{unread>0&&<i/>}</span><span>Activity</span></Link><Link className={pathname==="/profile"?"active":""} href="/profile"><UserRound size={19}/><span>Profile</span></Link></>:<><Link className={pathname==="/login"?"active":""} href="/login"><UserRound size={19}/><span>Sign in</span></Link><Link className="mobile-write" href="/register"><UserPlus size={19}/><span>Join</span></Link></>}</nav>
    </>
  );
}
