import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Comment {
  id: string;
  username: string;
  display_name: string;
  comment_text: string;
  created_at: string;
}

interface PostDetail {
  id: string;
  username: string;
  display_name: string;
  profile_picture_base64?: string;
  image_path: string;
  caption: string;
  created_at: string;
  comments: Comment[];
}

interface PostDetailModalProps {
  postId: string;
  onClose: () => void;
}

export default function PostDetailModal({ postId, onClose }: PostDetailModalProps) {
  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPostDetails();
  }, [postId]);

  const fetchPostDetails = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/posts/${postId}/`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setPost(data);
      } else {
        setError("Failed to load post details");
      }
    } catch (err) {
      console.error("Error fetching post details:", err);
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto p-0">
        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-destructive">{error}</p>
            <Button onClick={onClose} className="mt-4">
              Close
            </Button>
          </div>
        ) : post ? (
          <div className="flex flex-col">
            {/* Post Image */}
            <div className="w-full aspect-square bg-muted relative overflow-hidden">
              <img
                src={`http://localhost:8000/media/${post.image_path}`}
                alt={post.caption}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Post Content */}
            <div className="p-6 space-y-4">
              {/* User Info */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center overflow-hidden">
                  {post.profile_picture_base64 ? (
                    <img
                      src={`data:image/jpeg;base64,${post.profile_picture_base64}`}
                      alt={post.display_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-semibold">{post.display_name[0]}</span>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{post.display_name}</p>
                  <p className="text-xs text-muted-foreground">@{post.username}</p>
                </div>
              </div>

              {/* Caption */}
              <div>
                <p className="text-sm text-foreground whitespace-pre-wrap break-words">
                  {post.caption}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {formatDate(post.created_at)}
                </p>
              </div>

              {/* Comments Section */}
              {post.comments && post.comments.length > 0 && (
                <div className="border-t border-border pt-4 space-y-3">
                  <h4 className="font-semibold text-sm text-foreground">
                    Your Comments ({post.comments.length})
                  </h4>
                  {post.comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="bg-accent/50 p-3 rounded-md space-y-1"
                    >
                      <p className="text-sm text-foreground">{comment.comment_text}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(comment.created_at)}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Close Button */}
              <div className="flex justify-end pt-2">
                <Button onClick={onClose} variant="outline">
                  Close
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
