import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, X, Check } from "lucide-react";

interface Friend {
  id: string;
  username: string;
  displayName: string;
  profilePicture?: string;
}

interface FriendRequest {
  id: string;
  requester: {
    id: string;
    username: string;
    display_name: string;
    profile_picture_base64?: string;
  };
  created_at: string;
}

interface SentRequest {
  id: string;
  friend: {
    id: string;
    username: string;
    display_name: string;
    profile_picture_base64?: string;
  };
  status: string;
  created_at: string;
}

export default function FriendManagementPage() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<SentRequest[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);

  // Fetch initial data
  useEffect(() => {
    fetchFriends();
    fetchFriendRequests();
    fetchSentRequests();
  }, []);

  const fetchFriends = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/friends/", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setFriends(data.friends.map((f: any) => ({
          id: f.id,
          username: f.friend.username,
          displayName: f.friend.display_name,
          profilePicture: f.friend.profile_picture_base64 
            ? `data:image/jpeg;base64,${f.friend.profile_picture_base64}` 
            : undefined,
        })));
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  };

  const fetchFriendRequests = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/friends/requests/", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setFriendRequests(data);
      }
    } catch (error) {
      console.error("Error fetching friend requests:", error);
    }
  };

  const fetchSentRequests = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/friends/sent/", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setSentRequests(data);
      }
    } catch (error) {
      console.error("Error fetching sent requests:", error);
    }
  };

  const handleAddFriend = async () => {
    if (!username.trim()) {
      setError("Please enter a username");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`http://localhost:8000/api/friends/request/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username: username.trim() }),
      });

      if (response.ok) {
        setSuccess(`Friend request sent to @${username}!`);
        setUsername("");
        fetchSentRequests(); // Refresh sent requests
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to send friend request");
      }
    } catch (err) {
      console.error("Error sending friend request:", err);
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/friends/accept/${requestId}/`, {
        method: "PUT",
        credentials: "include",
      });

      if (response.ok) {
        setFriendRequests(prev => prev.filter(req => req.id !== requestId));
        fetchFriends(); // Refresh friends list
      } else {
        const data = await response.json();
        setError(data.error || "Failed to accept friend request");
      }
    } catch (error) {
      console.error("Error accepting friend request:", error);
      setError("Network error occurred");
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/friends/decline/${requestId}/`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        setFriendRequests(prev => prev.filter(req => req.id !== requestId));
      } else {
        const data = await response.json();
        setError(data.error || "Failed to decline friend request");
      }
    } catch (error) {
      console.error("Error declining friend request:", error);
      setError("Network error occurred");
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/friends/cancel/${requestId}/`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        setSentRequests(prev => prev.filter(req => req.id !== requestId));
      } else {
        const data = await response.json();
        setError(data.error || "Failed to cancel friend request");
      }
    } catch (error) {
      console.error("Error canceling friend request:", error);
      setError("Network error occurred");
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    if (confirm("Are you sure you want to remove this friend?")) {
      try {
        const response = await fetch(`http://localhost:8000/api/friends/${friendId}/`, {
          method: "DELETE",
          credentials: "include",
        });

        if (response.ok) {
          setFriends(prev => prev.filter(f => f.id !== friendId));
        } else {
          const data = await response.json();
          setError(data.error || "Failed to remove friend");
        }
      } catch (error) {
        console.error("Error removing friend:", error);
        setError("Network error occurred");
      }
    }
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      {/* Global Error/Success Messages */}
      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive rounded-md">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}
      {success && (
        <div className="p-3 bg-green-500/10 border border-green-500 rounded-md">
          <p className="text-sm text-green-500">{success}</p>
        </div>
      )}

      {/* Add Friend Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Add Friend</h2>
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <div className="flex gap-2">
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddFriend()}
                placeholder="Enter exact username"
                disabled={loading}
              />
              <Button
                onClick={handleAddFriend}
                disabled={loading || !username.trim()}
                className="gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>{loading ? "Sending..." : "Add Friend"}</span>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Enter the exact username to send a friend request
            </p>
          </div>
        </div>
      </div>

      {/* Pending Requests (Sent by You) Section */}
      {sentRequests.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Pending Requests ({sentRequests.length})</h2>
          <div className="bg-card border border-border rounded-lg p-6 space-y-3">
            <p className="text-sm text-muted-foreground mb-2">
              Friend requests you've sent
            </p>
            {sentRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-4 bg-accent/30 rounded-md">
                <Link 
                  to={`/profile/${request.friend.username}`} 
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                    {request.friend.profile_picture_base64 ? (
                      <img 
                        src={`data:image/jpeg;base64,${request.friend.profile_picture_base64}`} 
                        alt={request.friend.display_name} 
                        className="w-full h-full rounded-full object-cover" 
                      />
                    ) : (
                      <span className="text-white font-semibold">{request.friend.display_name[0]}</span>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{request.friend.display_name}</p>
                    <p className="text-sm text-muted-foreground">@{request.friend.username}</p>
                  </div>
                </Link>
                <Button
                  onClick={() => handleCancelRequest(request.id)}
                  variant="outline"
                  size="sm"
                  className="gap-1"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friend Requests Section */}
      {friendRequests.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Friend Requests ({friendRequests.length})</h2>
          <div className="bg-card border border-border rounded-lg p-6 space-y-3">
            <p className="text-sm text-muted-foreground mb-2">
              People who want to be your friend
            </p>
            {friendRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-4 bg-accent/30 rounded-md">
                <Link 
                  to={`/profile/${request.requester.username}`} 
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                    {request.requester.profile_picture_base64 ? (
                      <img 
                        src={`data:image/jpeg;base64,${request.requester.profile_picture_base64}`} 
                        alt={request.requester.display_name} 
                        className="w-full h-full rounded-full object-cover" 
                      />
                    ) : (
                      <span className="text-white font-semibold">{request.requester.display_name[0]}</span>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{request.requester.display_name}</p>
                    <p className="text-sm text-muted-foreground">@{request.requester.username}</p>
                  </div>
                </Link>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleDeclineRequest(request.id)}
                    variant="destructive"
                    size="sm"
                    className="gap-1"
                  >
                    <X className="w-4 h-4" />
                    <span>Decline</span>
                  </Button>
                  <Button
                    onClick={() => handleAcceptRequest(request.id)}
                    variant="default"
                    size="sm"
                    className="gap-1"
                  >
                    <Check className="w-4 h-4" />
                    <span>Accept</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Your Friends Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Your Friends ({friends.length})</h2>
        <div className="bg-card border border-border rounded-lg p-6">
          {friends.length > 0 ? (
            <div className="space-y-3">
              {friends.map((friend) => (
                <div key={friend.id} className="flex items-center justify-between p-4 bg-accent/30 rounded-md">
                  <Link 
                    to={`/profile/${friend.username}`} 
                    className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                      {friend.profilePicture ? (
                        <img src={friend.profilePicture} alt={friend.displayName} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span className="text-white font-semibold">{friend.displayName[0]}</span>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{friend.displayName}</p>
                      <p className="text-sm text-muted-foreground">@{friend.username}</p>
                    </div>
                  </Link>
                  <Button
                    onClick={() => handleRemoveFriend(friend.id)}
                    variant="destructive"
                    size="sm"
                    className="gap-1"
                  >
                    <X className="w-4 h-4" />
                    <span>Remove</span>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-lg font-semibold mb-2">No friends yet</p>
              <p className="text-sm">Add friends by entering their username above</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
