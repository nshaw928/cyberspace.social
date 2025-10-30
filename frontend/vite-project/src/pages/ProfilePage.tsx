import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import AddPostModal from "@/components/AddPostModal";

interface UserProfile {
  username: string;
  displayName: string;
  bio: string;
  link: string;
  profilePicture?: string;
}

interface ProfilePost {
  id: string;
  imageUrl: string;
  caption: string;
  createdAt: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<ProfilePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddPost, setShowAddPost] = useState(false);

  useEffect(() => {
    fetchMockProfile();
  }, []);

  const fetchMockProfile = () => {
    setTimeout(() => {
      setProfile({
        username: "johndoe",
        displayName: "John Doe",
        bio: "Living in the cyberspace 🌐 | Tech enthusiast | Coffee lover ☕",
        link: "https://example.com",
        profilePicture: undefined,
      });

      setPosts(
        Array.from({ length: 12 }, (_, i) => ({
          id: `post-${i}`,
          imageUrl: `https://picsum.photos/seed/profile-${i}/600/600`,
          caption: `Post ${i + 1}`,
          createdAt: new Date(Date.now() - i * 86400000).toISOString(),
        }))
      );

      setLoading(false);
    }, 500);
  };

  const handlePostCreated = () => {
    // Refresh posts after creating a new one
    fetchMockProfile();
  };

  if (loading || !profile) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Information Section */}
      <div className="grid grid-cols-[auto_1fr] gap-4">
        {/* Profile Picture */}
        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center overflow-hidden">
          {profile.profilePicture ? (
            <img src={profile.profilePicture} alt={profile.displayName} className="w-full h-full object-cover" />
          ) : (
            <span className="text-white text-2xl md:text-3xl font-bold">{profile.displayName[0]}</span>
          )}
        </div>

        {/* User Info */}
        <div className="space-y-2 min-w-0">
          <h2 className="text-lg font-bold text-foreground truncate">{profile.displayName}</h2>
          <p className="text-sm text-foreground whitespace-pre-wrap break-words">{profile.bio}</p>
          {profile.link && (
            <a
              href={profile.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline block truncate"
            >
              {profile.link}
            </a>
          )}
        </div>
      </div>

      {/* Posts Section */}
      <div className="space-y-4">
        {/* Header with Post count and Add button */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">
            Your Posts ({posts.length})
          </h3>
          <Button
            variant="default"
            size="sm"
            onClick={() => setShowAddPost(true)}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Post</span>
          </Button>
        </div>

        {/* Posts Grid */}
        {posts.length > 0 ? (
          <div className="grid grid-cols-3 md:grid-cols-5 gap-1 md:gap-2">
            {posts.map((post) => (
              <button
                key={post.id}
                className="aspect-square bg-muted overflow-hidden hover:opacity-80 transition-opacity rounded-sm"
                onClick={() => {
                  // TODO: Open post detail modal
                  console.log("Open post:", post.id);
                }}
              >
                <img
                  src={post.imageUrl}
                  alt={post.caption}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-lg">
            <p className="text-lg font-semibold mb-2">No posts yet</p>
            <p className="text-sm mb-4">Share your first moment</p>
            <Button
              variant="outline"
              onClick={() => setShowAddPost(true)}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Post</span>
            </Button>
          </div>
        )}
      </div>

      {/* Add Post Modal */}
      <AddPostModal
        open={showAddPost}
        onOpenChange={setShowAddPost}
        onPostCreated={handlePostCreated}
      />
    </div>
  );
}
