"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Compass, Sparkles } from "lucide-react";
import { getPosts, getTrendingPosts } from "@/lib/api";
import { PostCard, PostSkeleton } from "@/components/post-card";
import type { Post } from "@/lib/types";

const categories = ["Ideas", "Design", "Culture", "Travel", "Life", "Writing"];

export default function ExplorePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [trending, setTrending] = useState<Post[]>([]);
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => { getTrendingPosts().then(setTrending).catch(() => {}); }, []);
  useEffect(() => {
    setLoading(true); setError("");
    getPosts({ category, sort: "trending" }).then(result => setPosts(result.content)).catch((reason: Error) => setError(reason.message)).finally(() => setLoading(false));
  }, [category]);

  return <main className="page-wrap"><div className="shell explore-page">
    <section className="explore-hero"><div className="section-kicker"><Compass size={14}/> A CURATED STARTING POINT</div><h1>Find your next<br/><em>favorite idea.</em></h1><p>Explore thoughtful writing across the subjects that make you curious.</p><div className="explore-tags">{categories.map((item,index)=><button className={category===item?`explore-tag active explore-tag-${index%2}`:"explore-tag"} key={item} onClick={()=>setCategory(category===item?"":item)}>{item}</button>)}</div></section>
    {trending.length>0&&<section className="explore-feature"><div><div className="section-kicker"><Sparkles size={13}/> TRENDING NOW</div><h2>{trending[0].title}</h2><p>{trending[0].authorName} · {trending[0].viewCount.toLocaleString()} reads</p></div><Link href={`/posts/${trending[0].id}`} className="button button-dark">Read the story <ArrowRight size={15}/></Link></section>}
    <div className="explore-results-head"><div><div className="section-kicker">THE READING ROOM</div><h2>{category||"Popular across every topic"}</h2></div><span>{posts.length} {posts.length===1?"story":"stories"}</span></div>
    {error?<div className="form-error">{error}</div>:loading?<div className="post-grid">{[1,2,3].map(i=><PostSkeleton key={i}/>)}</div>:posts.length?<div className="post-grid">{posts.map(post=><PostCard post={post} key={post.id}/>)}</div>:<div className="empty-state"><h3>No stories in this topic yet</h3><p>Try another subject or explore every story.</p><button className="button button-light" onClick={()=>setCategory("")}>Show all topics</button></div>}
  </div></main>;
}
