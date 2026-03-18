import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type BlogCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  category_id: string | null;
  author_name: string;
  status: string;
  published_at: string | null;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
  category?: BlogCategory | null;
};

type BlogPostWithCategoryRow = Tables<"blog_posts"> & {
  blog_categories: Tables<"blog_categories"> | null;
};

function mapBlogPost(post: BlogPostWithCategoryRow): BlogPost {
  return {
    ...post,
    category: post.blog_categories,
  };
}

export function useBlogCategories() {
  return useQuery({
    queryKey: ["blog-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_categories")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as BlogCategory[];
    },
  });
}

export function useBlogPosts(categorySlug?: string) {
  return useQuery({
    queryKey: ["blog-posts", categorySlug],
    queryFn: async () => {
      let query = supabase
        .from("blog_posts")
        .select("*, blog_categories(*)")
        .eq("status", "published")
        .order("published_at", { ascending: false });

      if (categorySlug) {
        // Get category id first
        const { data: cat } = await supabase
          .from("blog_categories")
          .select("id")
          .eq("slug", categorySlug)
          .single();
        if (cat) {
          query = query.eq("category_id", cat.id);
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      return ((data || []) as BlogPostWithCategoryRow[]).map(mapBlogPost);
    },
  });
}

export function useBlogPost(slug: string) {
  return useQuery({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*, blog_categories(*)")
        .eq("slug", slug)
        .single();
      if (error) throw error;
      return mapBlogPost(data as BlogPostWithCategoryRow);
    },
    enabled: !!slug,
  });
}

export function useAdminBlogPosts() {
  return useQuery({
    queryKey: ["admin-blog-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*, blog_categories(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return ((data || []) as BlogPostWithCategoryRow[]).map(mapBlogPost);
    },
  });
}
