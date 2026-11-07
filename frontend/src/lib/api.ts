import type { Post, PostPage, Stats, User } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "/blog-api";

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("blogapp_token") : null;
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const response = await fetch(`${API_URL}${path}`, { ...init, headers, cache: "no-store" });
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const message = payload?.message ?? payload?.detail ?? payload?.error;
    throw new ApiError(typeof message === "string" && message.length ? message : `Request failed (${response.status}). Please try again.`, response.status);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export type AuthResponse = { token: string; user: User };

export type PostFilters = { query?: string; page?: number; category?: string; tag?: string; author?: string; from?: string; to?: string; sort?: string };
export const getPosts = (filters: PostFilters = {}) => {
  const params = new URLSearchParams();
  params.set("query", filters.query ?? ""); params.set("category", filters.category ?? "");
  params.set("tag", filters.tag ?? ""); params.set("author", filters.author ?? "");
  params.set("page", String(filters.page ?? 0)); params.set("size", "9"); params.set("sort", filters.sort ?? "latest");
  if (filters.from) params.set("from", new Date(filters.from).toISOString());
  if (filters.to) params.set("to", new Date(`${filters.to}T23:59:59`).toISOString());
  return api<PostPage>(`/posts?${params.toString()}`);
};
export const getPost = (id: string) => api<Post>(`/posts/${id}`);
export const getMyPosts = () => api<Post[]>("/posts/mine");
export const getStats = () => api<Stats>("/posts/stats");
export const getTrendingPosts = () => api<Post[]>("/posts/trending");
export const getLatestPosts = () => api<Post[]>("/posts/latest");
export const getPublicTags = () => api<string[]>("/posts/tags");
export const getRelatedPosts = (id: string) => api<Post[]>(`/posts/${id}/related`);
export const getBookmarks = () => api<Post[]>("/bookmarks");
export const getFollowing = () => api<{ id: number; username: string; followedAt: string }[]>("/authors/following");
export type NotificationItem = { id:number; type:string; actorName:string; postId:number|null; postTitle:string|null; createdAt:string; readAt:string|null };
export const getNotifications = () => api<NotificationItem[]>("/notifications");
export const getUnreadNotificationCount = () => api<number>("/notifications/unread-count");
