export type User = {
  id: number;
  username: string;
  email: string;
  role: string;
  enabled: boolean;
  createdAt: string;
  bio: string | null;
  avatarUrl: string | null;
  websiteUrl: string | null;
  socialLinks: string | null;
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
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  engagementRate: number;
  monthlyViews: { month: string; count: number }[];
  popularPosts: Post[];
};
