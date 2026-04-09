import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowLeft,
  Loader2,
  MessageCircle,
  Minus,
  Package,
  Plus,
  ShoppingBag,
  ShoppingCart,
  Store,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { formatPrice } from "@shared/currency";

// ─── Types ────────────────────────────────────────────────────────────────────
interface CartItem {
  productId: number;
  name: string;
  price: number;
  imageUrl: string | null;
  quantity: number;
  stock: number;
}

// ─── Cart Sidebar ─────────────────────────────────────────────────────────────
function CartSidebar({
  cart,
  businessId,
  businessName,
  onUpdate,
  onRemove,
  onClose,
  customerId,
}: {
  cart: CartItem[];
  businessId: number;
  businessName: string;
  onUpdate: (id: number, qty: number) => void;
  onRemove: (id: number) => void;
  onClose: () => void;
  customerId?: number;
}) {
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const utils = trpc.useUtils();

  const [, setLocation] = useLocation();
  const createOrder = trpc.order.create.useMutation({
    onSuccess: (data) => {
      // Save order data for confirmation page
      sessionStorage.setItem("shoplink_last_order", JSON.stringify({
        orderId: data.orderId,
        totalAmount: data.totalAmount,
        whatsappUrl: data.whatsappUrl,
        businessName,
        customerName: name,
      }));
      onClose();
      setCheckoutOpen(false);
      setLocation("/order/confirmation");
    },
    onError: (e) => toast.error(e.message),
  });

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    createOrder.mutate({
      businessId,
      customerName: name,
      customerPhone: phone,
      deliveryAddress: address,
      deliveryNotes: notes || undefined,
      items: cart.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      customerId,
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="font-display font-semibold text-lg flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Your Cart
        </h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {cart.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8">
          <ShoppingBag className="h-12 w-12 mb-3 opacity-30" />
          <p className="font-medium">Your cart is empty</p>
          <p className="text-sm mt-1">Add products to get started</p>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.map((item) => (
              <div key={item.productId} className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="h-14 w-14 rounded-lg object-cover shrink-0" />
                ) : (
                  <div className="h-14 w-14 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Package className="h-6 w-6 text-muted-foreground/30" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{item.name}</p>
                  <p className="text-primary font-semibold text-sm">{formatPrice(item.price)}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-6 w-6"
                    onClick={() => onUpdate(item.productId, item.quantity - 1)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-6 w-6"
                    onClick={() => onUpdate(item.productId, item.quantity + 1)}
                    disabled={item.quantity >= item.stock}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 text-destructive hover:text-destructive ml-1"
                    onClick={() => onRemove(item.productId)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t space-y-4">
            <div className="flex items-center justify-between font-semibold">
              <span>Total</span>
              <span className="text-primary text-lg">{formatPrice(total)}</span>
            </div>
            <Button className="w-full" size="lg" onClick={() => setCheckoutOpen(true)}>
              <MessageCircle className="mr-2 h-4 w-4" />
              Checkout via WhatsApp
            </Button>
          </div>
        </>
      )}

      {/* Checkout Dialog */}
      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Complete Your Order</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCheckout} className="space-y-4">
            <div className="bg-muted/50 rounded-xl p-3 space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Order Summary</p>
              {cart.map((i) => (
                <div key={i.productId} className="flex justify-between text-sm">
                  <span>{i.name} × {i.quantity}</span>
                  <span className="font-medium">{formatPrice(i.price * i.quantity)}</span>
                </div>
              ))}
              <Separator className="my-1" />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-primary">{formatPrice(total)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Your Name *</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label>Phone Number *</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} required />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Delivery Address *</Label>
              <Textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={2} required />
            </div>
            <div className="space-y-1.5">
              <Label>Delivery Notes</Label>
              <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any special instructions..." />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800 space-y-2">
              <div className="flex items-start gap-2">
                <MessageCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Confirm Order with {businessName}</p>
                  <p className="text-xs mt-1">Your order details will open in WhatsApp. Send them to the business to confirm and complete your order.</p>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold" disabled={createOrder.isPending} size="lg">
              {createOrder.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <MessageCircle className="mr-2 h-4 w-4" />
              )}
              Confirm Order on WhatsApp
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Main Storefront ──────────────────────────────────────────────────────────
export default function Storefront({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const { data: business, isLoading: bizLoading } = trpc.business.getBySlug.useQuery(
    { slug },
    { retry: false }
  );
  const { data: products, isLoading: productsLoading } = trpc.product.listByBusiness.useQuery(
    { businessId: business?.id ?? 0 },
    { enabled: !!business }
  );

  // Customer session
  const { data: customer } = trpc.customer.me.useQuery();

  const addToCart = (product: any) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          toast.error("Not enough stock");
          return prev;
        }
        return prev.map((i) =>
          i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price: parseFloat(product.price),
          imageUrl: product.imageUrl,
          quantity: 1,
          stock: product.stock,
        },
      ];
    });
    toast.success(`${product.name} added to cart`);
  };

  const updateCart = (productId: number, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((i) => i.productId !== productId));
    } else {
      setCart((prev) =>
        prev.map((i) => (i.productId === productId ? { ...i, quantity: qty } : i))
      );
    }
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  };

  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  if (bizLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8">
        <Store className="h-16 w-16 text-muted-foreground/30" />
        <h1 className="text-2xl font-display font-semibold">Store Not Found</h1>
        <p className="text-muted-foreground">This store doesn't exist or has been removed.</p>
        <Button asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to ShopLink
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Store Header */}
      <div className="relative">
        {/* Cover */}
        <div className="h-48 md:h-64 bg-gradient-to-br from-primary/15 to-accent/30 overflow-hidden">
          {business.coverUrl ? (
            <img src={business.coverUrl} alt={business.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Store className="h-20 w-20 text-primary/10" />
            </div>
          )}
        </div>

        {/* Nav overlay */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4">
          <Button variant="secondary" size="sm" className="bg-white/90 hover:bg-white shadow-sm" asChild>
            <Link href="/">
              <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
              ShopLink
            </Link>
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="bg-white/90 hover:bg-white shadow-sm relative"
            onClick={() => setCartOpen(true)}
          >
            <ShoppingCart className="h-4 w-4 mr-1.5" />
            Cart
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </Button>
        </div>

        {/* Store info */}
        <div className="container pb-6">
          <div className="flex items-end gap-4 -mt-8 relative z-10">
            {business.logoUrl ? (
              <img
                src={business.logoUrl}
                alt={business.name}
                className="h-20 w-20 rounded-2xl object-cover border-4 border-background shadow-lg"
              />
            ) : (
              <div className="h-20 w-20 rounded-2xl bg-card border-4 border-background shadow-lg flex items-center justify-center">
                <Store className="h-10 w-10 text-primary" />
              </div>
            )}
            <div className="pb-1">
              <h1 className="text-2xl md:text-3xl font-display font-bold">{business.name}</h1>
              {business.description && (
                <p className="text-muted-foreground text-sm mt-0.5 max-w-lg">{business.description}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-display font-semibold">
            Products
            {products && <span className="text-muted-foreground font-normal text-base ml-2">({products.length})</span>}
          </h2>
          <Button
            className="relative"
            onClick={() => setCartOpen(true)}
            variant={cartCount > 0 ? "default" : "outline"}
          >
            <ShoppingCart className="h-4 w-4 mr-1.5" />
            {cartCount > 0 ? `Cart (${cartCount})` : "Cart"}
          </Button>
        </div>

        {productsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-64 bg-muted rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : products?.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No products available yet</p>
            <p className="text-sm mt-1">Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products?.map((product) => {
              const inCart = cart.find((i) => i.productId === product.id);
              const outOfStock = product.stock === 0;
              const lowStock = product.stock > 0 && product.stock < 5;

              return (
                <Card
                  key={product.id}
                  className="group overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer"
                  onClick={() => setSelectedProduct(product)}
                >
                  <div className="relative aspect-square bg-muted overflow-hidden">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-10 w-10 text-muted-foreground/20" />
                      </div>
                    )}
                    {outOfStock && (
                      <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
                        <Badge variant="secondary" className="text-xs">Out of Stock</Badge>
                      </div>
                    )}
                    {lowStock && !outOfStock && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-amber-500 text-white text-xs px-1.5">
                          <AlertTriangle className="h-2.5 w-2.5 mr-1" />
                          {product.stock} left
                        </Badge>
                      </div>
                    )}
                    {inCart && (
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-primary text-xs px-1.5">{inCart.quantity} in cart</Badge>
                      </div>
                    )}
                  </div>
                  <CardContent className="pt-3 pb-4">
                    <p className="font-medium text-sm leading-tight line-clamp-2 mb-1">{product.name}</p>
                    <p className="text-primary font-bold">{formatPrice(parseFloat(product.price))}</p>
                    <Button
                      size="sm"
                      className="w-full mt-2 h-8 text-xs"
                      disabled={outOfStock}
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product);
                      }}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      {outOfStock ? "Out of Stock" : "Add to Cart"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      <Dialog open={!!selectedProduct} onOpenChange={(o) => !o && setSelectedProduct(null)}>
        <DialogContent className="max-w-lg">
          {selectedProduct && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display">{selectedProduct.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {selectedProduct.imageUrl && (
                  <div className="aspect-video rounded-xl overflow-hidden bg-muted">
                    <img src={selectedProduct.imageUrl} alt={selectedProduct.name} className="w-full h-full object-cover" />
                  </div>
                )}
                {selectedProduct.description && (
                  <p className="text-muted-foreground text-sm leading-relaxed">{selectedProduct.description}</p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary">{formatPrice(parseFloat(selectedProduct.price))}</span>
                  <div className="flex items-center gap-2">
                    {selectedProduct.stock === 0 ? (
                      <Badge variant="secondary">Out of Stock</Badge>
                    ) : selectedProduct.stock < 5 ? (
                      <Badge className="bg-amber-500 text-white">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Only {selectedProduct.stock} left
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-green-100 text-green-700">In Stock</Badge>
                    )}
                  </div>
                </div>
                <Button
                  className="w-full"
                  size="lg"
                  disabled={selectedProduct.stock === 0}
                  onClick={() => {
                    addToCart(selectedProduct);
                    setSelectedProduct(null);
                    setCartOpen(true);
                  }}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to Cart
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Cart Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40" onClick={() => setCartOpen(false)} />
          <div className="w-full max-w-sm bg-card shadow-2xl flex flex-col">
            <CartSidebar
              cart={cart}
              businessId={business.id}
              businessName={business.name}
              onUpdate={updateCart}
              onRemove={removeFromCart}
              onClose={() => setCartOpen(false)}
              customerId={customer?.id}
            />
          </div>
        </div>
      )}
    </div>
  );
}
