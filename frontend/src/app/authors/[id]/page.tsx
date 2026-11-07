"use client";

import {useEffect,useState} from "react";
import {useParams,useRouter} from "next/navigation";
import Link from "next/link";
import {Globe,LoaderCircle,Users,Eye,PenLine,UserPlus,UserRoundCheck,Link2} from "lucide-react";
import {api} from "@/lib/api";
import {PostCard} from "@/components/post-card";
import {useAuth} from "@/components/providers";
import type {Post} from "@/lib/types";
type Profile={id:number;username:string;bio:string|null;avatarUrl:string|null;websiteUrl:string|null;socialLinks:string|null;followers:number;following:number;views:number;articles:Post[]};

export default function AuthorPage(){
  const params=useParams<{id:string}>();const router=useRouter();const {user}=useAuth();
  const [profile,setProfile]=useState<Profile|null>(null);const [following,setFollowing]=useState(false);const [error,setError]=useState("");const [busy,setBusy]=useState(false);
  useEffect(()=>{api<Profile>(`/authors/${params.id}`).then(setProfile).catch(e=>setError(e.message));if(user)api<{following:boolean}>(`/authors/${params.id}/follow`).then(value=>setFollowing(value.following)).catch(()=>{});},[params.id,user]);
  async function toggleFollow(){if(!user){router.push("/login");return;}if(!profile)return;setBusy(true);try{const result=await api<{following:boolean;followerCount:number}>(`/authors/${profile.id}/follow`,{method:following?"DELETE":"PUT"});setFollowing(result.following);setProfile(value=>value?{...value,followers:result.followerCount}:value);}catch(e){setError(e instanceof Error?e.message:"Could not update follow status");}finally{setBusy(false);}}
  if(error&&!profile)return <main className="page-wrap"><div className="shell form-error">{error}</div></main>;
  if(!profile)return <main className="page-wrap"><div className="shell author-profile-skeleton"><div className="skeleton-cover shimmer"/><div className="skeleton-line shimmer title"/><div className="skeleton-line shimmer medium"/><div className="post-grid">{Array.from({length:3},(_,i)=><div className="post-card" key={i}><div className="skeleton-cover shimmer"/><div className="post-card-body"><div className="skeleton-line shimmer short"/><div className="skeleton-line shimmer title"/></div></div>)}</div></div></main>;
  return <main className="page-wrap"><div className="shell">
    <section className="panel author-profile"><div className="author-cover-banner"><span>WRITER · STORYTELLER · CURIOUS MIND</span></div><div className="author-profile-main">{profile.avatarUrl?<img src={profile.avatarUrl} alt={`${profile.username} profile`} className="author-avatar"/>:<span className="author-avatar author-avatar-fallback">{profile.username.slice(0,1).toUpperCase()}</span>}<div className="author-profile-copy"><div className="section-kicker">Author profile</div><h1>{profile.username}</h1>{profile.bio&&<p>{profile.bio}</p>}<div className="author-profile-links">{profile.websiteUrl&&<a href={profile.websiteUrl} target="_blank" rel="noreferrer"><Globe size={15}/> Website</a>}{profile.socialLinks?.split(",").map((url,index)=>url.trim()&&<a key={url} href={url.trim()} target="_blank" rel="noreferrer"><Link2 size={15}/> Social {index+1}</a>)}</div></div><div className="author-profile-actions">{user?.id!==profile.id&&<button className={following?"button button-light button-small":"button button-dark button-small"} disabled={busy} onClick={toggleFollow}>{following?<UserRoundCheck size={15}/>:<UserPlus size={15}/>} {following?"Following":"Follow author"}</button>}{user?.id===profile.id&&<Link className="button button-light button-small" href="/profile"><PenLine size={15}/> Edit profile</Link>}</div></div>
      <div className="author-profile-stats"><span><strong>{profile.followers}</strong> followers</span><span><strong>{profile.following}</strong> following</span><span><strong>{profile.articles.length}</strong> published articles</span><span><Eye size={15}/><strong>{profile.views.toLocaleString()}</strong> views</span><span><Users size={15}/> Author</span></div>{error&&<div className="form-error">{error}</div>}
    </section>
    <section className="feed-section"><div className="section-top"><div><div className="section-kicker">Published writing</div><h2>Articles by {profile.username}</h2></div></div>{profile.articles.length?<div className="post-grid">{profile.articles.map(post=><PostCard key={post.id} post={post}/>)}</div>:<div className="empty-state"><div className="empty-illustration"><PenLine size={22}/></div><h3>No articles yet</h3><p>When {profile.username} publishes, their writing will appear here.</p></div>}</section>
  </div></main>;
}
