import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface ProductVariant {
  id: number;
  name: string;
  price: number;
  stock: number;
}

interface ProductDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: {
    id: number;
    name: string;
    description?: string;
    price: number;
    stock: number;
    imageUrl?: string;
  };
  variants: ProductVariant[];
  onAddToCart: (productId: number, variantId?: number, quantity?: number) => void;
}

export function ProductDetailModal({
  open,
  onOpenChange,
  product,
  variants,
  onAddToCart,
}: ProductDetailModalProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    variants.length > 0 ? variants[0] : null
  );
  const [quantity, setQuantity] = useState(1);

  const hasVariants = variants.length > 0;
  const currentPrice = selectedVariant?.price ?? product.price;
  const currentStock = selectedVariant?.stock ?? product.stock;
  const maxQuantity = Math.min(currentStock, 99);
  const isOutOfStock = currentStock === 0;

  const handleAddToCart = () => {
    onAddToCart(product.id, selectedVariant?.id, quantity);
    setQuantity(1);
    onOpenChange(false);
  };

  const handleQuantityChange = (delta: number) => {
    const newQty = quantity + delta;
    if (newQty >= 1 && newQty <= maxQuantity) {
      setQuantity(newQty);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{product.name}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          {/* Product Image */}
          <div className="flex items-center justify-center bg-muted rounded-lg p-4 min-h-[300px]">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="max-w-full max-h-full object-contain rounded"
              />
            ) : (
              <div className="text-muted-foreground text-center">
                <ShoppingCart className="h-16 w-16 mx-auto mb-2 opacity-50" />
                <p>No image available</p>
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="flex flex-col gap-4">
            {/* Stock Status */}
            <div>
              {isOutOfStock ? (
                <Badge variant="destructive" className="text-sm">
                  Out of Stock
                </Badge>
              ) : currentStock <= 10 ? (
                <Badge variant="secondary" className="text-sm bg-amber-100 text-amber-900">
                  Only {currentStock} left!
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-sm">
                  In Stock ({currentStock} available)
                </Badge>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <p className="text-sm text-muted-foreground">{product.description}</p>
              </div>
            )}

            {/* Variants */}
            {hasVariants && (
              <div>
                <label className="text-sm font-semibold mb-2 block">Size / Option</label>
                <div className="grid grid-cols-2 gap-2">
                  {variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      className={`p-3 rounded-lg border-2 transition-colors text-sm font-medium ${
                        selectedVariant?.id === variant.id
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/50"
                      } ${variant.stock === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                      disabled={variant.stock === 0}
                    >
                      <div>{variant.name}</div>
                      <div className="text-xs mt-1">KES {variant.price.toFixed(2)}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Price */}
            <div className="border-t pt-4">
              <div className="text-3xl font-bold text-primary">
                KES {currentPrice.toFixed(2)}
              </div>
            </div>

            {/* Quantity Selector */}
            {!isOutOfStock && (
              <div>
                <label className="text-sm font-semibold mb-2 block">Quantity</label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <input
                    type="number"
                    min="1"
                    max={maxQuantity}
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      if (val >= 1 && val <= maxQuantity) setQuantity(val);
                    }}
                    className="w-16 text-center border rounded-md py-2"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= maxQuantity}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <span className="text-xs text-muted-foreground ml-2">Max: {maxQuantity}</span>
                </div>
              </div>
            )}

            {/* Add to Cart Button */}
            <Button
              size="lg"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="w-full"
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              {isOutOfStock ? "Out of Stock" : "Add to Cart"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
