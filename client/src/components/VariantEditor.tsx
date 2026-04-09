import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  Edit,
  Loader2,
  Plus,
  Trash2,
  Upload,
  X,
  ZoomIn,
} from "lucide-react";
import { formatPrice } from "@shared/currency";

interface Variant {
  id: number;
  productId: number;
  name: string;
  sku: string | null;
  price: string;
  stock: number;
  size: string | null;
  color: string | null;
  quality: string | null;
  origin: string | null;
  materials: string | null;
  description: string | null;
  imageUrl: string | null;
  imageKey: string | null;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Fullscreen Image Gallery
function ImageGallery({
  images,
  open,
  onClose,
}: {
  images: string[];
  open: boolean;
  onClose: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!open || images.length === 0) return null;

  const currentImage = images[currentIndex];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-screen h-screen max-w-none max-h-none p-0 bg-black">
        <div className="w-full h-full flex items-center justify-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-50 bg-white/20 hover:bg-white/40 rounded-full p-2 transition-colors"
          >
            <X className="h-6 w-6 text-white" />
          </button>

          <img
            src={currentImage}
            alt="Gallery"
            className="max-w-full max-h-full object-contain"
          />

          {images.length > 1 && (
            <>
              <button
                onClick={() =>
                  setCurrentIndex((i) => (i - 1 + images.length) % images.length)
                }
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 rounded-full p-3 transition-colors"
              >
                <ChevronLeft className="h-6 w-6 text-white" />
              </button>
              <button
                onClick={() =>
                  setCurrentIndex((i) => (i + 1) % images.length)
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 rounded-full p-3 transition-colors"
              >
                <ChevronRight className="h-6 w-6 text-white" />
              </button>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 px-4 py-2 rounded-full text-white text-sm">
                {currentIndex + 1} / {images.length}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Variant Editor Modal
function VariantEditorModal({
  productId,
  variant,
  open,
  onClose,
  onSuccess,
}: {
  productId: number;
  variant?: Variant;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState(variant?.name ?? "");
  const [sku, setSku] = useState(variant?.sku ?? "");
  const [price, setPrice] = useState(variant?.price ?? "");
  const [stock, setStock] = useState(variant?.stock?.toString() ?? "0");
  const [size, setSize] = useState(variant?.size ?? "");
  const [color, setColor] = useState(variant?.color ?? "");
  const [quality, setQuality] = useState(variant?.quality ?? "");
  const [origin, setOrigin] = useState(variant?.origin ?? "");
  const [materials, setMaterials] = useState(variant?.materials ?? "");
  const [description, setDescription] = useState(variant?.description ?? "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(variant?.imageUrl ?? null);
  const fileRef = useRef<HTMLInputElement>(null);
  const utils = trpc.useUtils();

  const createVariant = trpc.variant.create.useMutation({
    onSuccess: () => {
      toast.success("Variant added!");
      utils.variant.listByProduct.invalidate({ productId });
      onSuccess();
      onClose();
    },
    onError: (e) => toast.error(e.message),
  });

  const updateVariant = trpc.variant.update.useMutation({
    onSuccess: () => {
      toast.success("Variant updated!");
      utils.variant.listByProduct.invalidate({ productId });
      onSuccess();
      onClose();
    },
    onError: (e) => toast.error(e.message),
  });

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let imageBase64: string | undefined;
    let imageMimeType: string | undefined;
    if (imageFile) {
      imageBase64 = await fileToBase64(imageFile);
      imageMimeType = imageFile.type;
    }

    if (variant) {
      updateVariant.mutate({
        id: variant.id,
        name,
        sku,
        price,
        stock: parseInt(stock),
        size,
        color,
        quality,
        origin,
        materials,
        description,
        imageBase64,
        imageMimeType,
      });
    } else {
      createVariant.mutate({
        productId,
        name,
        sku,
        price,
        stock: parseInt(stock),
        size,
        color,
        quality,
        origin,
        materials,
        description,
        imageBase64,
        imageMimeType,
      });
    }
  };

  const isPending = createVariant.isPending || updateVariant.isPending;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{variant ? "Edit Variant" : "Add Variant"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image Upload */}
          <div className="space-y-1.5">
            <Label>Variant Image</Label>
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
            >
              {preview ? (
                <div className="relative inline-block">
                  <img
                    src={preview}
                    alt="Preview"
                    className="mx-auto h-32 object-contain rounded"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreview(null);
                      setImageFile(null);
                    }}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="py-4">
                  <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Click to upload image</p>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImage}
            />
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Variant Name *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Small, Red, Premium"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>SKU</Label>
              <Input
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="e.g., PROD-001-SM"
              />
            </div>
          </div>

          {/* Price & Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Price *</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Stock Quantity *</Label>
              <Input
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Attributes */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Size</Label>
              <Input
                value={size}
                onChange={(e) => setSize(e.target.value)}
                placeholder="e.g., Small, Medium, Large"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Color</Label>
              <Input
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="e.g., Red, Blue, Black"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Quality</Label>
              <Input
                value={quality}
                onChange={(e) => setQuality(e.target.value)}
                placeholder="e.g., Premium, Standard"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Origin</Label>
              <Input
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="e.g., Kenya, Uganda, India"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Materials</Label>
            <Input
              value={materials}
              onChange={(e) => setMaterials(e.target.value)}
              placeholder="e.g., 100% Cotton, Polyester blend"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Variant-specific details..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {variant ? "Update Variant" : "Add Variant"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Main Variant Editor Component
export function VariantEditor({ productId }: { productId: number }) {
  const [editingVariant, setEditingVariant] = useState<Variant | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const utils = trpc.useUtils();

  const { data: variants, isLoading } = trpc.variant.listByProduct.useQuery({
    productId,
  });

  const deleteVariant = trpc.variant.delete.useMutation({
    onSuccess: () => {
      toast.success("Variant deleted!");
      utils.variant.listByProduct.invalidate({ productId });
    },
    onError: (e) => toast.error(e.message),
  });

  const handleEditVariant = (variant: Variant) => {
    setEditingVariant(variant);
    setEditorOpen(true);
  };

  const handleViewImages = (variant: Variant) => {
    if (variant.imageUrl) {
      setGalleryImages([variant.imageUrl]);
      setGalleryOpen(true);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Variants</h3>
        <Button
          size="sm"
          onClick={() => {
            setEditingVariant(null);
            setEditorOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-1.5" /> Add Variant
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : variants?.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">No variants yet. Add one to get started.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {variants?.map((variant) => (
            <Card key={variant.id} className="overflow-hidden">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start justify-between gap-4">
                  {/* Image */}
                  {variant.imageUrl ? (
                    <button
                      onClick={() => handleViewImages(variant)}
                      className="flex-shrink-0 relative group"
                    >
                      <img
                        src={variant.imageUrl}
                        alt={variant.name}
                        className="h-20 w-20 object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <ZoomIn className="h-5 w-5 text-white" />
                      </div>
                    </button>
                  ) : (
                    <div className="h-20 w-20 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                      <Upload className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold truncate">{variant.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatPrice(parseFloat(variant.price))}
                        </p>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={() => handleEditVariant(variant)}
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => deleteVariant.mutate({ id: variant.id })}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Attributes */}
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      {variant.size && <div>Size: {variant.size}</div>}
                      {variant.color && <div>Color: {variant.color}</div>}
                      {variant.quality && <div>Quality: {variant.quality}</div>}
                      {variant.origin && <div>Origin: {variant.origin}</div>}
                      {variant.materials && <div>Materials: {variant.materials}</div>}
                    </div>

                    {/* Stock */}
                    <div className="mt-2 text-xs">
                      <span className={variant.stock < 5 ? "text-red-600" : "text-green-600"}>
                        {variant.stock} in stock
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Editor Modal */}
      <VariantEditorModal
        productId={productId}
        variant={editingVariant ?? undefined}
        open={editorOpen}
        onClose={() => {
          setEditorOpen(false);
          setEditingVariant(null);
        }}
        onSuccess={() => {}}
      />

      {/* Image Gallery */}
      <ImageGallery
        images={galleryImages}
        open={galleryOpen}
        onClose={() => setGalleryOpen(false)}
      />
    </div>
  );
}
