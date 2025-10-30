import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface UserSettings {
  name: string;
  username: string;
  bio: string;
  link: string;
  email: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings>({
    name: "",
    username: "",
    bio: "",
    link: "",
    email: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // TODO: Fetch user settings from API
    fetchMockSettings();
  }, []);

  const fetchMockSettings = () => {
    setTimeout(() => {
      setSettings({
        name: "John Doe",
        username: "johndoe",
        bio: "Living in the cyberspace 🌐 | Tech enthusiast | Coffee lover ☕",
        link: "https://example.com",
        email: "john.doe@example.com",
      });
      setLoading(false);
    }, 500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
    setError("");
    setSuccess(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      // TODO: Replace with actual API call
      const response = await fetch("http://127.0.0.1:8000/api/profile/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError("Failed to save settings");
      }
    } catch (err) {
      setError("Network error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Account Settings</h2>
        <p className="text-sm text-muted-foreground">
          Update your profile information and account settings
        </p>
      </div>

      {/* Settings Form */}
      <div className="space-y-4 bg-card border border-border rounded-lg p-6">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Display Name</Label>
          <Input
            id="name"
            name="name"
            value={settings.name}
            onChange={handleChange}
            placeholder="Your display name"
          />
        </div>

        {/* Username */}
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            name="username"
            value={settings.username}
            onChange={handleChange}
            placeholder="Your username"
          />
          <p className="text-xs text-muted-foreground">
            This will be your unique identifier
          </p>
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <textarea
            id="bio"
            name="bio"
            value={settings.bio}
            onChange={handleChange}
            placeholder="Tell us about yourself"
            maxLength={255}
            rows={3}
            className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <p className="text-xs text-muted-foreground text-right">
            {settings.bio.length} / 255
          </p>
        </div>

        {/* Link */}
        <div className="space-y-2">
          <Label htmlFor="link">Website/Link</Label>
          <Input
            id="link"
            name="link"
            type="url"
            value={settings.link}
            onChange={handleChange}
            placeholder="https://example.com"
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={settings.email}
            onChange={handleChange}
            placeholder="your.email@example.com"
          />
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive rounded-md">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}
        {success && (
          <div className="p-3 bg-green-500/10 border border-green-500 rounded-md">
            <p className="text-sm text-green-500">Settings saved successfully!</p>
          </div>
        )}

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full"
        >
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* Logout Section */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="space-y-2 mb-4">
          <h3 className="text-lg font-semibold text-foreground">Sign Out</h3>
          <p className="text-sm text-muted-foreground">
            Sign out of your account on this device
          </p>
        </div>
        <Button
          onClick={handleLogout}
          variant="destructive"
          className="w-full"
        >
          Log Out
        </Button>
      </div>
    </div>
  );
}
