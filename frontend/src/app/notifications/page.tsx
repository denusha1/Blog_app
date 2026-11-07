"use client";

import { useEffect,useState } from "react";
import Link from "next/link";
import { Bell,Heart,MessageCircle,UserPlus,Newspaper,CheckCheck } from "lucide-react";
import { api,getNotifications,type NotificationItem } from "@/lib/api";
import { useAuth } from "@/components/providers";

const details:Record<string,{text:string;icon:typeof Heart}>={LIKE:{text:"liked your article",icon:Heart},COMMENT:{text:"commented on your article",icon:MessageCircle},FOLLOW:{text:"started following you",icon:UserPlus},NEW_POST:{text:"published a new article",icon:Newspaper}};
export default function NotificationsPage(){
  const {user,loading}=useAuth(); const [items,setItems]=useState<NotificationItem[]>([]); const [error,setError]=useState("");
  useEffect(()=>{if(user)getNotifications().then(setItems).catch(e=>setError(e.message));},[user]);
  async function markAll(){try{await api("/notifications/read-all",{method:"PUT"});setItems(values=>values.map(item=>({...item,readAt:item.readAt||new Date().toISOString()})));}catch(e){setError(e instanceof Error?e.message:"Could not update notifications");}}
  if(loading)return <main className="page-wrap"><div className="shell"><div className="page-heading"><div className="skeleton-line shimmer short"/><div className="skeleton-line shimmer title"/></div><div className="notification-skeletons">{Array.from({length:4},(_,index)=><div className="notification-item" key={index}><span className="skeleton-avatar shimmer"/><div><div className="skeleton-line shimmer medium"/><div className="skeleton-line shimmer short"/></div></div>)}</div></div></main>;
  if(!user)return <main className="page-wrap"><div className="shell empty-state"><Bell/><h1>Sign in to see activity</h1><Link className="button button-dark" href="/login">Sign in</Link></div></main>;
  return <main className="page-wrap"><div className="shell"><div className="dashboard-top"><div className="page-heading"><div className="section-kicker">Your community</div><h1>Notifications</h1><p>Likes, comments, follows, and new stories from writers you follow.</p></div>{items.some(item=>!item.readAt)&&<button className="button button-light" onClick={markAll}><CheckCheck size={16}/> Mark all read</button>}</div>{error&&<div className="form-error">{error}</div>}{items.length?<div className="notification-list">{items.map(item=>{const info=details[item.type]||{text:"interacted with your account",icon:Bell};const Icon=info.icon;return <article className={item.readAt?"notification-item":"notification-item unread"} key={item.id}><span className="notification-icon"><Icon size={17}/></span><div><p><strong>{item.actorName}</strong> {info.text}{item.postTitle&&<>: <strong>{item.postTitle}</strong></>}</p><small>{new Date(item.createdAt).toLocaleString()}</small></div>{item.postId&&<Link href={`/posts/${item.postId}`} className="read-link">View</Link>}</article>})}</div>:<div className="empty-state"><Bell size={23}/><h3>You’re all caught up</h3><p>New activity from your readers and followed authors will show up here.</p></div>}</div></main>;
}
