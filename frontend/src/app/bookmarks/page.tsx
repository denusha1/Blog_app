"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {Bookmark as BookmarkIcon} from "lucide-react";
import { getBookmarks } from "@/lib/api";
import { PostCard } from "@/components/post-card";
import type { Post } from "@/lib/types";
export default function BookmarksPage(){const [posts,setPosts]=useState<Post[]>([]);const [error,setError]=useState("");const [loading,setLoading]=useState(true);useEffect(()=>{getBookmarks().then(setPosts).catch(e=>setError(e.message)).finally(()=>setLoading(false));},[]);return <main className="page-wrap"><section className="shell feed-section"><div className="section-kicker">Your library</div><h1>Bookmarked stories</h1>{loading?<div className="post-grid">{Array.from({length:3},(_,i)=><PostCardSkeleton key={i}/>)}</div>:error?<div className="empty-state"><div className="empty-illustration"><BookmarkIcon/></div><h3>Sign in to view your library</h3><p>Your saved stories will be here when you sign in.</p><Link href="/login" className="button button-dark">Sign in</Link></div>:posts.length?<div className="post-grid">{posts.map(post=><PostCard key={post.id} post={post}/>)}</div>:<div className="empty-state"><div className="empty-illustration"><BookmarkIcon/></div><h3>Your reading list is waiting</h3><p>Bookmark articles and they’ll be saved here.</p><Link href="/" className="button button-light">Discover stories</Link></div>}</section></main>}
function PostCardSkeleton(){return <div className="post-card skeleton-card" aria-hidden="true"><div className="skeleton-cover shimmer"/><div className="post-card-body"><div className="skeleton-line shimmer short"/><div className="skeleton-line shimmer title"/><div className="skeleton-line shimmer"/></div></div>}
