import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, X, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

// Common emoji categories for POS
const EMOJI_CATEGORIES = {
  food: {
    name: "Food & Beverage",
    emojis: ["🍕", "🍔", "🍟", "🌮", "🍜", "🍱", "🥗", "🍰", "☕", "🥤", "🍷", "🍺"],
  },
  fashion: {
    name: "Fashion & Clothing",
    emojis: ["👕", "👔", "👗", "👠", "👜", "🧥", "👖", "🧢", "👞", "🕶️", "⌚", "💍"],
  },
  electronics: {
    name: "Electronics",
    emojis: ["📱", "💻", "⌨️", "🖱️", "🖥️", "📷", "🎧", "📺", "⚡", "🔋", "🔌", "📡"],
  },
  health: {
    name: "Health & Beauty",
    emojis: ["💊", "💉", "🧴", "🧼", "🧽", "💄", "💅", "🧴", "🧼", "🧽", "🧴", "🧼"],
  },
  home: {
    name: "Home & Garden",
    emojis: ["🛋️", "🛏️", "🚪", "🪟", "🛁", "🚿", "🧹", "🧺", "🧻", "🪴", "💡", "🔦"],
  },
  sports: {
    name: "Sports & Fitness",
    emojis: ["⚽", "🏀", "🎾", "🏐", "⛳", "🏋️", "🤸", "🧘", "🚴", "🏃", "🤾", "🏊"],
  },
  tools: {
    name: "Tools & Hardware",
    emojis: ["🔨", "🔧", "🔩", "⚙️", "🪛", "🪚", "⛏️", "🪓", "🔪", "⚒️", "🛠️", "⛓️"],
  },
  other: {
    name: "Other",
    emojis: ["📦", "🎁", "🎀", "🎊", "🎉", "✨", "⭐", "🌟", "💫", "🔥", "❤️", "👍"],
  },
};

interface IconImagePickerProps {
  value?: string;
  onChange: (value: string) => void;
  onImageUpload?: (file: File) => Promise<string>;
  label?: string;
  description?: string;
  allowEmoji?: boolean;
  allowImageUpload?: boolean;
}

export default function IconImagePicker({
  value = "",
  onChange,
  onImageUpload,
  label = "Select Icon or Image",
  description,
  allowEmoji = true,
  allowImageUpload = true,
}: IconImagePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleEmojiSelect = (emoji: string) => {
    onChange(emoji);
    setIsOpen(false);
    toast.success("Icon selected");
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setIsUploading(true);
    try {
      if (onImageUpload) {
        const url = await onImageUpload(file);
        onChange(url);
        setUploadedImage(url);
        setIsOpen(false);
        toast.success("Image uploaded successfully");
      } else {
        // Fallback: create data URL
        const reader = new FileReader();
        reader.onload = (event) => {
          const url = event.target?.result as string;
          onChange(url);
          setUploadedImage(url);
          setIsOpen(false);
          toast.success("Image selected");
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      toast.error("Failed to upload image");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const displayValue = value || uploadedImage;
  const isEmoji = displayValue && displayValue.length <= 2;

  return (
    <div className="space-y-3">
      {label && <Label>{label}</Label>}
      {description && <p className="text-xs text-gray-600">{description}</p>}

      {/* Display Current Selection */}
      <div className="flex items-center gap-3">
        {displayValue && (
          <div className="h-16 w-16 rounded-lg border-2 border-gray-200 flex items-center justify-center bg-gray-50">
            {isEmoji ? (
              <span className="text-4xl">{displayValue}</span>
            ) : (
              <img src={displayValue} alt="Selected" className="h-full w-full object-cover rounded-lg" />
            )}
          </div>
        )}
        <div className="flex-1">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full"
          >
            {displayValue ? "Change" : "Select"} Icon or Image
          </Button>
          {displayValue && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                onChange("");
                setUploadedImage(null);
              }}
              className="mt-2 w-full"
            >
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Picker Modal */}
      {isOpen && (
        <Card className="mt-4 border-2 border-indigo-200">
          <CardHeader>
            <CardTitle className="text-lg">Choose Icon or Image</CardTitle>
            <CardDescription>Select an emoji or upload a custom image</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={allowEmoji ? "emoji" : "upload"} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                {allowEmoji && <TabsTrigger value="emoji">Emojis</TabsTrigger>}
                {allowImageUpload && <TabsTrigger value="upload">Upload Image</TabsTrigger>}
              </TabsList>

              {/* Emoji Tab */}
              {allowEmoji && (
                <TabsContent value="emoji" className="space-y-4">
                  {Object.entries(EMOJI_CATEGORIES).map(([key, category]) => (
                    <div key={key}>
                      <h3 className="font-semibold text-sm mb-2 text-gray-700">{category.name}</h3>
                      <div className="grid grid-cols-6 gap-2">
                        {category.emojis.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => handleEmojiSelect(emoji)}
                            className="h-10 flex items-center justify-center text-2xl hover:bg-indigo-100 rounded-lg transition-colors border border-gray-200 hover:border-indigo-400"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </TabsContent>
              )}

              {/* Upload Tab */}
              {allowImageUpload && (
                <TabsContent value="upload" className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-700 mb-2">Upload an image</p>
                    <p className="text-xs text-gray-500 mb-4">
                      PNG, JPG, or GIF (max 5MB)
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Choose File
                        </>
                      )}
                    </Button>
                  </div>
                </TabsContent>
              )}
            </Tabs>

            <div className="mt-4 flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
