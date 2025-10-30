import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, X, Check } from "lucide-react";

interface Friend {
  id: string;
  username: string;
  displayName: string;
  profilePicture?: string;
}

interface FriendRequest {
  id: string;
  username: string;
  displayName: string;
  profilePicture?: string;
}

export default function FriendManagementPage() {
  const [searchUsername, setSearchUsername] = useState("");
  const [searchResult, setSearchResult] = useState<Friend | null>(null);
  const [searching, setSearching] = useState(false);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([
    { id: "1", username: "alice", displayName: "Alice Smith" },
    { id: "2", username: "bob", displayName: "Bob Johnson" },
  ]);
  const [friends, setFriends] = useState<Friend[]>([
    { id: "1", username: "charlie", displayName: "Charlie Brown" },
    { id: "2", username: "diana", displayName: "Diana Prince" },
    { id: "3", username: "eve", displayName: "Eve Adams" },
  ]);

  const handleSearch = async () => {
    if (!searchUsername.trim()) return;

    setSearching(true);
    try {
      // TODO: Replace with actual API call
      const response = await fetch(`http://127.0.0.1:8000/api/friends/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username: searchUsername }),
      });

      if (response.ok) {
        const data = await response.json();
        setSearchResult(data);
      } else {
        setSearchResult(null);
      }
    } catch (err) {
      console.error("Search failed:", err);
      setSearchResult(null);
    } finally {
      setSearching(false);
    }
  };

  const handleSendRequest = (userId: string) => {
    console.log("Send friend request to:", userId);
    // TODO: Implement API call
  };

  const handleAcceptRequest = (requestId: string) => {
    setFriendRequests(prev => prev.filter(req => req.id !== requestId));
    console.log("Accept request:", requestId);
    // TODO: Implement API call
  };

  const handleDeclineRequest = (requestId: string) => {
    setFriendRequests(prev => prev.filter(req => req.id !== requestId));
    console.log("Decline request:", requestId);
    // TODO: Implement API call
  };

  const handleRemoveFriend = (friendId: string) => {
    if (confirm("Are you sure you want to remove this friend?")) {
      setFriends(prev => prev.filter(f => f.id !== friendId));
      console.log("Remove friend:", friendId);
      // TODO: Implement API call
    }
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      {/* Find Friends Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Find Friends</h2>
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="search">Search by username</Label>
            <div className="flex gap-2">
              <Input
                id="search"
                value={searchUsername}
                onChange={(e) => setSearchUsername(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Enter exact username"
              />
              <Button
                onClick={handleSearch}
                disabled={searching || !searchUsername.trim()}
                className="gap-2"
              >
                <Search className="w-4 h-4" />
                <span>Search</span>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Enter the exact username (no autocomplete)
            </p>
          </div>

          {/* Search Result */}
          {searchResult && (
            <div className="flex items-center justify-between p-4 bg-accent/50 rounded-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                  {searchResult.profilePicture ? (
                    <img src={searchResult.profilePicture} alt={searchResult.displayName} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-white font-semibold">{searchResult.displayName[0]}</span>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{searchResult.displayName}</p>
                  <p className="text-sm text-muted-foreground">@{searchResult.username}</p>
                </div>
              </div>
              <Button onClick={() => handleSendRequest(searchResult.id)}>
                Add Friend
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Friend Requests Section */}
      {friendRequests.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Friend Requests</h2>
          <div className="bg-card border border-border rounded-lg p-6 space-y-3">
            {friendRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-4 bg-accent/30 rounded-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                    {request.profilePicture ? (
                      <img src={request.profilePicture} alt={request.displayName} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span className="text-white font-semibold">{request.displayName[0]}</span>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{request.displayName}</p>
                    <p className="text-sm text-muted-foreground">@{request.username}</p>
                  </div>
                </div>
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
                  <div className="flex items-center gap-3">
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
                  </div>
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
              <p className="text-sm">Search for users to add as friends</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
