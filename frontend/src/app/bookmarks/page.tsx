"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getBookmarks } from "@/lib/api";
import { PostCard } from "@/components/post-card";
import type { Post } from "@/lib/types";
export default function BookmarksPage(){const [posts,setPosts]=useState<Post[]>([]);const [error,setError]=useState("");useEffect(()=>{getBookmarks().then(setPosts).catch(e=>setError(e.message));},[]);return <main className="page-wrap"><section className="shell feed-section"><div className="section-kicker">Your library</div><h1>Bookmarked stories</h1>{error?<div className="empty-state"><p>{error}</p><Link href="/login" className="button button-dark">Sign in</Link></div>:posts.length?<div className="post-grid">{posts.map(post=><PostCard key={post.id} post={post}/>)}</div>:<div className="empty-state"><h3>Your reading list is waiting</h3><p>Bookmark articles and they’ll be saved here.</p><Link href="/" className="button button-light">Discover stories</Link></div>}</section></main>}
