import { useState, useEffect, useRef, useCallback } from "react";
import { getApiUrl } from "@/config/api";
import PostCard, { type Post } from "@/components/PostCard";

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const observer = useRef<IntersectionObserver | null>(null);
  const hasInitialized = useRef(false);

  // Fetch posts from API
  const fetchPosts = async (pageNum: number, isRefresh = false) => {
    if (loading || refreshing) return;

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await fetch(getApiUrl(`/api/posts/feed/?page=${pageNum}`), {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        
        // Map backend response to frontend Post type
        const mappedPosts = data.posts.map((post: any) => ({
          id: post.id,
          user: {
            username: post.username,
            displayName: post.display_name,
            profilePicture: post.profile_picture_base64 
              ? `data:image/jpeg;base64,${post.profile_picture_base64}` 
              : undefined,
          },
          imageUrl: `${getApiUrl("/media/")}${post.image_path}`,
          caption: post.caption,
          createdAt: post.created_at,
          comments: post.comments?.map((comment: any) => ({
            id: comment.id,
            user: {
              username: comment.username,
              displayName: comment.display_name,
            },
            text: comment.comment_text,
            createdAt: comment.created_at,
          })),
        }));
        
        if (isRefresh) {
          setPosts(mappedPosts);
          setPage(1);
        } else {
          setPosts(prev => [...prev, ...mappedPosts]);
        }

        setHasMore(data.hasMore);
      } else {
        console.error("Failed to fetch posts");
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load initial posts
  useEffect(() => {
    // Prevent double-fetch in React Strict Mode
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    
    fetchPosts(1);
  }, []);

  // Intersection Observer for infinite scroll
  const lastPostElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return;
    
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchPosts(nextPage);
      }
    });

    if (node) observer.current.observe(node);
  }, [loading, hasMore, page]);

  // Handle comment submission
  const handleComment = async (postId: string, commentText: string) => {
    try {
      const response = await fetch(getApiUrl(`/api/posts/${postId}/comments/create/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ text: commentText }),
      });

      if (response.ok) {
        console.log("Comment posted successfully");
        // Optionally refresh the feed to show the new comment
      }
    } catch (error) {
      console.error("Error posting comment:", error);
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      {/* Pull to refresh indicator */}
      {refreshing && (
        <div className="flex justify-center py-4">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Posts */}
      {posts.map((post, index) => {
        if (posts.length === index + 1) {
          return (
            <div key={post.id} ref={lastPostElementRef}>
              <PostCard post={post} onComment={handleComment} />
            </div>
          );
        } else {
          return <PostCard key={post.id} post={post} onComment={handleComment} />;
        }
      })}

      {/* Loading indicator */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* No more posts */}
      {!hasMore && posts.length > 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No more posts to load
        </div>
      )}

      {/* Empty state */}
      {!loading && !refreshing && posts.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg font-semibold mb-2">No posts yet</p>
          <p className="text-sm">Start following friends to see their posts here</p>
        </div>
      )}
    </div>
  );
}
