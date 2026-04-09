import { useState, useMemo } from "react";
import { formatPrice } from "@shared/currency";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { useInventorySubscription } from "@/hooks/useInventorySubscription";
import {
    ShoppingCart,
    Plus,
    Minus,
    Trash2,
    Send,
    AlertCircle,
    TrendingUp,
    Clock,
    DollarSign,
    Wifi,
    WifiOff,
  } from "lucide-react";
import { toast } from "sonner";
import { useEffect } from "react";

// Emoji categories for quick product access
const PRODUCT_CATEGORIES = {
  "🍕": "Food",
  "👕": "Clothing",
  "📱": "Electronics",
  "💊": "Health",
  "🏠": "Home",
  "⚽": "Sports",
  "🔧": "Tools",
  "📦": "Other",
};

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  stock: number;
}

export default function MobilePOS() {
  const { hasAccess, userRole } = useRoleAccess(["admin", "attendant"]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchCode, setSearchCode] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "mpesa" | "card" | "credit">("cash");
  const [notes, setNotes] = useState("");
  const [wsConnected, setWsConnected] = useState(false);

  const { data: business } = trpc.business.getMine.useQuery();
  const { data: products } = trpc.product.listMine.useQuery(undefined, {
    enabled: !!business,
  });
  const { data: popularItems } = trpc.pos.getPopular.useQuery(
    { businessId: business?.id || 0 },
    { enabled: !!business }
  );

  const checkoutMutation = trpc.pos.checkout.useMutation({
    onSuccess: () => {
      toast.success("Sale completed! Order sent to WhatsApp.");
      setCart([]);
      setNotes("");
    },
    onError: (e) => toast.error(e.message),
  });

  // Subscribe to real-time inventory updates
  const { isConnected } = useInventorySubscription({
    businessId: business?.id || 0,
    onUpdate: (event) => {
      // Update cart items with new stock
      setCart((prev) =>
        prev.map((item) =>
          item.id === event.productId
            ? { ...item, stock: event.newStock }
            : item
        )
      );
      // Show toast for low stock
      if (event.newStock < 5 && event.newStock > 0) {
        toast.warning(`Low stock: Product #${event.productId} has ${event.newStock} items left`);
      }
    },
  });

  useEffect(() => {
    setWsConnected(isConnected);
  }, [isConnected]);

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">You don't have permission to access the POS system.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Filter products based on search and category
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter((p) => {
      const matchesSearch = searchCode === "" || p.name.toLowerCase().includes(searchCode.toLowerCase());
      return matchesSearch;
    });
  }, [products, searchCode]);

  // Get popular items
  const topItems = popularItems?.slice(0, 6) || [];

  const addToCart = (product: any) => {
    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
      if (existing.quantity < product.stock) {
        setCart(
          cart.map((item) =>
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          )
        );
      } else {
        toast.error("Not enough stock");
      }
    } else {
      setCart([
        ...cart,
        { id: product.id, name: product.name, price: product.price, quantity: 1, stock: product.stock },
      ]);
    }
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
    } else {
      const item = cart.find((i) => i.id === id);
      if (item && quantity <= item.stock) {
        setCart(
          cart.map((item) => (item.id === id ? { ...item, quantity } : item))
        );
      }
    }
  };

  const removeFromCart = (id: number) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    const items = cart.map((item) => ({
      productId: item.id,
      quantity: item.quantity,
      price: item.price.toString(),
    }));

    if (!business) {
      toast.error("Business not loaded");
      return;
    }
    checkoutMutation.mutate({
      businessId: business.id,
      items,
      paymentMethod,
      notes,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-display font-bold">Mobile POS</h1>
              <p className="text-sm text-gray-600">{business?.name}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-indigo-600">{formatPrice(total)}</div>
              <p className="text-sm text-gray-600">{itemCount} items</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main POS Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Search & Quick Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Search Products</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Search by product name or code..."
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                className="w-full"
              />

              {/* Quick Category Buttons */}
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(PRODUCT_CATEGORIES).map(([emoji, name]) => (
                  <Button
                    key={emoji}
                    variant={selectedCategory === emoji ? "default" : "outline"}
                    className="h-16 flex flex-col items-center justify-center"
                    onClick={() => setSelectedCategory(selectedCategory === emoji ? null : emoji)}
                  >
                    <span className="text-2xl mb-1">{emoji}</span>
                    <span className="text-xs">{name}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Popular Items */}
          {topItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Popular Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {topItems.map((product: any) => (
                    <Button
                      key={product.id}
                      variant="outline"
                      className="h-24 flex flex-col items-center justify-center hover:bg-indigo-50"
                      onClick={() => addToCart(product)}
                    >
                      <div className="text-sm font-semibold text-center line-clamp-2">{product.name}</div>
                       <div className="text-indigo-600 font-bold">{formatPrice(product.price)}</div>
                      {product.stock < 5 && (
                        <Badge variant="destructive" className="mt-1 text-xs">
                          Low Stock
                        </Badge>
                      )}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Product List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">All Products</CardTitle>
              <CardDescription>{filteredProducts.length} products available</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {filteredProducts.map((product: any) => (
                  <Button
                    key={product.id}
                    variant="outline"
                    className="h-24 flex flex-col items-center justify-center hover:bg-indigo-50 disabled:opacity-50"
                    onClick={() => addToCart(product)}
                    disabled={product.stock === 0}
                  >
                    <div className="text-sm font-semibold text-center line-clamp-2">{product.name}</div>
                     <div className="text-indigo-600 font-bold">{formatPrice(product.price)}</div>
                    {product.stock === 0 ? (
                      <Badge variant="secondary" className="mt-1 text-xs">
                        Out of Stock
                      </Badge>
                    ) : product.stock < 5 ? (
                      <Badge variant="destructive" className="mt-1 text-xs">
                        {product.stock} left
                      </Badge>
                    ) : null}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cart Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {/* Cart Items */}
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Cart ({itemCount})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">Cart is empty</p>
              ) : (
                <>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {cart.map((item) => (
                      <div key={item.id} className="border rounded-lg p-3 space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{item.name}</p>
                            <p className="text-xs text-gray-600">{formatPrice(item.price)}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center font-semibold">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= item.stock}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="font-bold text-sm">{formatPrice(item.price * item.quantity)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="border-t pt-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span className="text-indigo-600">{formatPrice(total)}</span>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Payment Method</label>
                    <Tabs value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as any)}>
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="cash">💵</TabsTrigger>
                        <TabsTrigger value="mpesa">📱</TabsTrigger>
                        <TabsTrigger value="card">💳</TabsTrigger>
                        <TabsTrigger value="credit">📝</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>

                  {/* Notes */}
                  <Input
                    placeholder="Add notes (optional)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="text-sm"
                  />

                  {/* Checkout Button */}
                  <Button
                    onClick={handleCheckout}
                    disabled={checkoutMutation.isPending || cart.length === 0}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                    size="lg"
                  >
                    {checkoutMutation.isPending ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Complete Sale
                      </>
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
