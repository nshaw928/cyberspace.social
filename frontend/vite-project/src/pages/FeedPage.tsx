import { useState, useEffect, useRef, useCallback } from "react";
import PostCard, { type Post } from "@/components/PostCard";

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);

  // Mock data for development
  const fetchMockPosts = (pageNum: number, isRefresh = false) => {
    if (loading || refreshing) return;

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setTimeout(() => {
      const mockPosts: Post[] = Array.from({ length: 10 }, (_, i) => ({
        id: `${pageNum}-${i}`,
        user: {
          username: `user${i}`,
          displayName: `User ${i}`,
          profilePicture: undefined,
        },
        imageUrl: `https://picsum.photos/seed/${pageNum}-${i}/600/600`,
        caption: `This is post ${i} from page ${pageNum}. Lorem ipsum dolor sit amet.`,
        createdAt: new Date(Date.now() - i * 3600000).toISOString(),
      }));

      if (isRefresh) {
        setPosts(mockPosts);
      } else {
        setPosts(prev => [...prev, ...mockPosts]);
      }

      setHasMore(pageNum < 5); // Mock: only 5 pages
      setLoading(false);
      setRefreshing(false);
    }, 1000);
  };

  // Load initial posts
  useEffect(() => {
    fetchMockPosts(1);
  }, []);

  // Intersection Observer for infinite scroll
  const lastPostElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return;
    
    if (observer.current) observer.current.disconnect();

    let currentPage = 1;
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        currentPage++;
        fetchMockPosts(currentPage);
      }
    });

    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  // Handle comment submission
  const handleComment = async (postId: string, commentText: string) => {
    try {
      // TODO: Replace with actual API call
      const response = await fetch(`http://127.0.0.1:8000/api/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ text: commentText }),
      });

      if (response.ok) {
        console.log("Comment posted successfully");
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
