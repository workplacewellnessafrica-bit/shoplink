import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Search, Barcode, Trash2, ShoppingCart, Plus, Minus } from "lucide-react";

interface CartItem {
  productId: number;
  name: string;
  price: string;
  quantity: number;
}

export default function POSSystem() {
  const [businessId] = useState(1); // TODO: Get from context
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [searchCode, setSearchCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "mpesa" | "card" | "credit">("cash");
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const searchProductMutation = trpc.pos.searchByCode.useMutation();
  const { data: popularItems, isLoading: isLoadingPopular } = trpc.pos.getPopular.useQuery({ businessId });
  const checkoutMutation = trpc.pos.checkout.useMutation();

  useEffect(() => {
    // Focus barcode input on mount
    barcodeInputRef.current?.focus();
  }, []);

  const handleSearchProduct = async () => {
    if (!searchCode.trim()) {
      toast.error("Please enter a product code");
      return;
    }

    try {
      const product = await searchProductMutation.mutateAsync({
        businessId,
        productCode: searchCode,
      });

      if (product) {
        addToCart(product);
        setSearchCode("");
        searchInputRef.current?.focus();
      }
    } catch (error: any) {
      toast.error("Product not found");
    }
  };

  const handleBarcodeScanned = async (barcode: string) => {
    try {
      const product = await searchProductMutation.mutateAsync({
        businessId,
        productCode: barcode,
      });
      if (product) {
        addToCart(product);
      }
    } catch {
      toast.error("Barcode not found");
    }
  };

  const addToCart = (product: any) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
        },
      ];
    });
    toast.success(`${product.name} added to cart`);
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.productId === productId
            ? { ...item, quantity: Math.max(1, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: number) => {
    setCartItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  const calculateTotal = () => {
    return cartItems
      .reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0)
      .toFixed(2);
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    try {
      const result = await checkoutMutation.mutateAsync({
        businessId,
        items: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
        paymentMethod,
      });

      toast.success(`Sale completed: KES ${result.totalAmount}`);
      setCartItems([]);
      setPaymentMethod("cash");
    } catch (error: any) {
      toast.error(error.message || "Checkout failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Product Search & Popular Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Search by Code */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search size={20} />
                Search Product
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Enter product code..."
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearchProduct()}
                />
                <Button onClick={handleSearchProduct} disabled={searchProductMutation.isPending}>
                  <Search size={16} />
                </Button>
              </div>
              <div className="text-sm text-gray-500">
                Or scan barcode below
              </div>
              <Input
                ref={barcodeInputRef}
                type="text"
                placeholder="Barcode scanner input..."
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    const input = e.currentTarget;
                    const barcode = input.value.trim();
                    if (barcode) {
                      handleBarcodeScanned(barcode);
                      input.value = "";
                    }
                  }
                }}
                className="hidden"
              />
            </CardContent>
          </Card>

          {/* Popular Items */}
          <Card>
            <CardHeader>
              <CardTitle>Popular Items</CardTitle>
              <CardDescription>Quick add frequently sold products</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingPopular ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {popularItems?.map((product: any) => (
                    <Button
                      key={product.id}
                      variant="outline"
                      className="h-auto flex-col py-4"
                      onClick={() => addToCart(product)}
                    >
                      <div className="text-2xl mb-2">📦</div>
                      <div className="text-sm font-medium text-center">{product.name}</div>
                      <div className="text-xs text-gray-500">KES {product.price}</div>
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Cart & Checkout */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart size={20} />
                Cart ({cartItems.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Cart Items */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {cartItems.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <ShoppingCart size={32} className="mx-auto mb-2 opacity-50" />
                    <p>Cart is empty</p>
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <div key={item.productId} className="border rounded p-2 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-gray-500">KES {item.price}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.productId)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.productId, -1)}
                        >
                          <Minus size={14} />
                        </Button>
                        <span className="font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.productId, 1)}
                        >
                          <Plus size={14} />
                        </Button>
                      </div>
                      <div className="text-right text-sm font-medium">
                        KES {(parseFloat(item.price) * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Divider */}
              {cartItems.length > 0 && <div className="border-t pt-4" />}

              {/* Total */}
              {cartItems.length > 0 && (
                <>
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total:</span>
                    <span>KES {calculateTotal()}</span>
                  </div>

                  {/* Payment Method */}
                  <Select value={paymentMethod} onValueChange={(v: any) => setPaymentMethod(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">💵 Cash</SelectItem>
                      <SelectItem value="mpesa">📱 M-Pesa</SelectItem>
                      <SelectItem value="card">💳 Card</SelectItem>
                      <SelectItem value="credit">📝 Credit</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Checkout Button */}
                  <Button
                    onClick={handleCheckout}
                    disabled={checkoutMutation.isPending}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {checkoutMutation.isPending ? (
                      <Loader2 className="animate-spin mr-2" />
                    ) : null}
                    Complete Sale
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
