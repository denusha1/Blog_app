export type User = {
  id: number;
  username: string;
  email: string;
  role: string;
  createdAt: string;
};

export type Post = {
  id: number;
  title: string;
  content: string;
  category: string;
  imageUrl: string | null;
  tags: string[];
  status: "DRAFT" | "SCHEDULED" | "PUBLISHED";
  visibility: "PUBLIC" | "PRIVATE";
  featured: boolean;
  viewCount: number;
  scheduledAt: string | null;
  publishedAt: string | null;
  authorId: number;
  authorName: string;
  createdAt: string;
  updatedAt: string;
};

export type PostPage = {
  content: Post[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type Stats = {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  scheduledPosts: number;
  monthlyPosts: { month: string; count: number }[];
};
