import { useState } from "react";
import { Link } from "react-router-dom";
import { MessageCircle, X, Send } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface Post {
  id: string;
  user: {
    username: string;
    displayName: string;
    profilePicture?: string;
  };
  imageUrl: string;
  caption: string;
  createdAt: string;
  comments?: Comment[];
}

export interface Comment {
  id: string;
  user: {
    username: string;
    displayName: string;
    profilePicture?: string;
  };
  text: string;
  createdAt: string;
}

interface PostCardProps {
  post: Post;
  onComment?: (postId: string, commentText: string) => Promise<void>;
}

export default function PostCard({ post, onComment }: PostCardProps) {
  const [isCommenting, setIsCommenting] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCommentClick = () => {
    setIsCommenting(true);
  };

  const handleCancelComment = () => {
    setIsCommenting(false);
    setCommentText("");
  };

  const handleSendComment = async () => {
    if (!commentText.trim() || !onComment) return;

    setIsSubmitting(true);
    try {
      await onComment(post.id, commentText);
      setCommentText("");
      setIsCommenting(false);
    } catch (error) {
      console.error("Failed to post comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  return (
    <Card className="w-full overflow-hidden bg-card border-border">
      {/* Header Row */}
      <div className="p-4 flex items-center gap-3">
        <Link to={`/profile/${post.user.username}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 rounded-md bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center overflow-hidden">
            {post.user.profilePicture ? (
              <img src={post.user.profilePicture} alt={post.user.displayName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-white font-semibold">{post.user.displayName[0]}</span>
            )}
          </div>
          <span className="font-semibold text-foreground">{post.user.displayName}</span>
        </Link>
      </div>

      {/* Image Row */}
      <div className="w-full aspect-square bg-muted relative overflow-hidden">
        <img 
          src={post.imageUrl} 
          alt={post.caption} 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Footer Row */}
      <div className="p-4 space-y-3">
        {/* Caption */}
        <p className="text-foreground text-sm whitespace-pre-wrap break-words">{post.caption}</p>

        {/* Comment Input (when active) */}
        {isCommenting && (
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendComment();
                }
              }}
              className="w-full"
              autoFocus
              disabled={isSubmitting}
            />
          </div>
        )}

        {/* Action Buttons and Timestamp */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isCommenting ? (
              <>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleCancelComment}
                  disabled={isSubmitting}
                  className="gap-1"
                >
                  <X className="w-4 h-4" />
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleSendComment}
                  disabled={isSubmitting || !commentText.trim()}
                  className="gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Send</span>
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCommentClick}
                className="gap-2"
              >
                <MessageCircle className="w-4 h-4" />
              </Button>
            )}
          </div>
          <span className="text-xs text-muted-foreground">{formatDate(post.createdAt)}</span>
        </div>
      </div>
    </Card>
  );
}
