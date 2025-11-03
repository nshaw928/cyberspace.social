import { useState, useEffect, useRef } from "react";
import { getApiUrl } from "@/config/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Upload } from "lucide-react";

interface UserSettings {
  name: string;
  username: string;
  bio: string;
  link: string;
  email: string;
  profilePicture?: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings>({
    name: "",
    username: "",
    bio: "",
    link: "",
    email: "",
    profilePicture: undefined,
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch(getApiUrl("/api/profile/me/", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setSettings({
          name: data.display_name || "",
          username: data.username || "",
          bio: data.bio || "",
          link: data.link || "",
          email: data.email || "",
          profilePicture: data.profile_picture_base64 
            ? `data:image/jpeg;base64,${data.profile_picture_base64}` 
            : undefined,
        });
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching settings:", error);
      setLoading(false);
    }
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
      const response = await fetch(getApiUrl("/api/profile/me/", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          display_name: settings.name,
          bio: settings.bio,
          link: settings.link,
        }),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to save settings");
      }
    } catch (err) {
      setError("Network error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setUploadError("Please select an image file");
      return;
    }

    // Validate file size (500KB max)
    if (file.size > 500 * 1024) {
      setUploadError("Image must be smaller than 500KB");
      return;
    }

    setSelectedImage(file);
    setUploadError("");
    setUploadSuccess(false);
  };

  const handleUploadProfilePicture = async () => {
    if (!selectedImage) return;

    setUploading(true);
    setUploadError("");
    setUploadSuccess(false);

    try {
      const formData = new FormData();
      formData.append("image", selectedImage);

      const response = await fetch(getApiUrl("/api/profile/picture/", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (response.ok) {
        setUploadSuccess(true);
        setSelectedImage(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        // Refresh profile to show new picture
        await fetchSettings();
        setTimeout(() => setUploadSuccess(false), 3000);
      } else {
        const data = await response.json();
        setUploadError(data.error || "Failed to upload profile picture");
      }
    } catch (err) {
      setUploadError("Network error occurred");
    } finally {
      setUploading(false);
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

      {/* Profile Picture Upload */}
      <div className="space-y-4 bg-card border border-border rounded-lg p-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">Profile Picture</h3>
          <p className="text-xs text-muted-foreground mb-4">
            Upload a square image (max 500KB, JPEG/PNG only)
          </p>
        </div>

        {/* Profile Picture Preview */}
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center overflow-hidden">
            {settings.profilePicture ? (
              <img 
                src={settings.profilePicture} 
                alt="Profile" 
                className="w-full h-full object-cover" 
              />
            ) : (
              <span className="text-white text-2xl font-bold">
                {settings.name[0] || "?"}
              </span>
            )}
          </div>
          <div className="flex-1 space-y-2">
            <Input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleImageSelect}
              className="text-sm"
            />
            {selectedImage && (
              <p className="text-xs text-muted-foreground">
                Selected: {selectedImage.name} ({Math.round(selectedImage.size / 1024)}KB)
              </p>
            )}
          </div>
        </div>

        {/* Upload Error/Success */}
        {uploadError && (
          <div className="p-3 bg-destructive/10 border border-destructive rounded-md">
            <p className="text-sm text-destructive">{uploadError}</p>
          </div>
        )}
        {uploadSuccess && (
          <div className="p-3 bg-green-500/10 border border-green-500 rounded-md">
            <p className="text-sm text-green-500">Profile picture updated successfully!</p>
          </div>
        )}

        {/* Upload Button */}
        <Button
          onClick={handleUploadProfilePicture}
          disabled={!selectedImage || uploading}
          className="w-full gap-2"
          variant="outline"
        >
          <Upload className="w-4 h-4" />
          {uploading ? "Uploading..." : "Upload Profile Picture"}
        </Button>
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
