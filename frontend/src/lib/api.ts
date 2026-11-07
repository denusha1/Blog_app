import type { Post, PostPage, Stats, User } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api";

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
    throw new ApiError(payload?.message ?? "Something went wrong. Please try again.", response.status);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export type AuthResponse = { token: string; user: User };

export const getPosts = (query = "", page = 0, category = "") =>
  api<PostPage>(`/posts?query=${encodeURIComponent(query)}&category=${encodeURIComponent(category)}&page=${page}&size=9`);
export const getPost = (id: string) => api<Post>(`/posts/${id}`);
export const getMyPosts = () => api<Post[]>("/posts/mine");
export const getStats = () => api<Stats>("/posts/stats");
