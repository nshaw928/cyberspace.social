import { useState, useRef } from "react";
import { getApiUrl } from "@/config/api";
import { Upload, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AddPostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPostCreated?: () => void;
}

export default function AddPostModal({ open, onOpenChange, onPostCreated }: AddPostModalProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match(/image\/(jpeg|png)/)) {
      setError("Only JPEG and PNG images are supported");
      return;
    }

    // Validate file size (max 10MB before compression)
    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be less than 10MB");
      return;
    }

    setError("");
    setSelectedImage(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const compressImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }

        // Target dimensions: 1080x1080 (square)
        const targetSize = 1080;
        canvas.width = targetSize;
        canvas.height = targetSize;

        // Calculate dimensions to maintain aspect ratio
        const size = Math.min(img.width, img.height);
        const x = (img.width - size) / 2;
        const y = (img.height - size) / 2;

        // Draw image centered and cropped to square
        ctx.drawImage(img, x, y, size, size, 0, 0, targetSize, targetSize);

        // Convert to blob with compression
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Could not compress image"));
            }
          },
          "image/jpeg",
          0.85 // 85% quality
        );
      };

      img.onerror = () => {
        reject(new Error("Could not load image"));
      };

      reader.readAsDataURL(file);
    });
  };

  const handlePost = async () => {
    if (!selectedImage) {
      setError("Please select an image");
      return;
    }

    if (caption.length > 255) {
      setError("Caption must be 255 characters or less");
      return;
    }

    setUploading(true);
    setError("");

    try {
      // Compress image
      const compressedImage = await compressImage(selectedImage);

      // Create form data
      const formData = new FormData();
      formData.append("image", compressedImage, "post.jpg");
      formData.append("caption", caption);

      // TODO: Replace with actual API call
      const response = await fetch(getApiUrl("/api/posts/", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (response.ok) {
        // Reset form
        setSelectedImage(null);
        setImagePreview(null);
        setCaption("");
        onOpenChange(false);
        onPostCreated?.();
      } else {
        const data = await response.json();
        setError(data.message || "Failed to create post");
      }
    } catch (err) {
      setError("An error occurred while posting");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Post</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="image">Image</Label>
            {imagePreview ? (
              <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 p-2 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors"
                  type="button"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
              >
                <Upload className="w-12 h-12 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Click to upload image</p>
                <p className="text-xs text-muted-foreground mt-1">JPEG or PNG, max 10MB</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              id="image"
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleImageSelect}
              className="hidden"
            />
          </div>

          {/* Caption */}
          <div className="space-y-2">
            <Label htmlFor="caption">Caption (max 255 characters)</Label>
            <Input
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write a caption..."
              maxLength={255}
              disabled={uploading}
            />
            <p className="text-xs text-muted-foreground text-right">
              {caption.length} / 255
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive rounded-md">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Post Button */}
          <Button
            onClick={handlePost}
            disabled={!selectedImage || uploading}
            className="w-full"
          >
            {uploading ? "Posting..." : "Post"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
