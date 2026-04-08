import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Send,
  BarChart3,
  Clock,
  DollarSign,
  Users,
  TrendingUp,
  AlertCircle,
  Lock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  stock: number;
}

interface TransactionLog {
  id: number;
  attendantName: string;
  itemCount: number;
  total: number;
  paymentMethod: string;
  timestamp: Date;
  notes?: string;
  items?: { name: string; quantity: number; price: number }[];
}

interface TopSeller {
  name: string;
  quantity: number;
  revenue: number;
}

export default function DesktopPOS() {
  const { hasAccess, userRole } = useRoleAccess(["admin", "attendant"]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchCode, setSearchCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "mpesa" | "card" | "credit">("cash");
  const [notes, setNotes] = useState("");
  const [adminPinOpen, setAdminPinOpen] = useState(false);
  const [adminPin, setAdminPin] = useState("");
  const [pinAttempts, setPinAttempts] = useState(0);
  const [transactionLogs, setTransactionLogs] = useState<TransactionLog[]>([]);
  const [showPinInput, setShowPinInput] = useState(false);
  const [expandedTransaction, setExpandedTransaction] = useState<number | null>(null);

  const { data: business } = trpc.business.getMine.useQuery();
  const { data: products } = trpc.product.listMine.useQuery(undefined, {
    enabled: !!business,
  });

  const checkoutMutation = trpc.pos.checkout.useMutation({
    onSuccess: () => {
      toast.success("Sale completed! Order sent to WhatsApp.");
      const newTransaction: TransactionLog = {
        id: transactionLogs.length + 1,
        attendantName: "Current User",
        itemCount: cart.reduce((sum, item) => sum + item.quantity, 0),
        total: total,
        paymentMethod,
        timestamp: new Date(),
        notes,
        items: cart.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
      };
      setTransactionLogs([newTransaction, ...transactionLogs]);
      setCart([]);
      setNotes("");
    },
    onError: (e) => toast.error(e.message),
  });

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

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter((p) =>
      searchCode === "" || p.name.toLowerCase().includes(searchCode.toLowerCase())
    );
  }, [products, searchCode]);

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

    if (!business) {
      toast.error("Business not loaded");
      return;
    }

    const items = cart.map((item) => ({
      productId: item.id,
      quantity: item.quantity,
      price: item.price.toString(),
    }));

    checkoutMutation.mutate({
      businessId: business.id,
      items,
      paymentMethod,
      notes,
    });
  };

  const handleAdminAction = async (pin: string) => {
    // In production, this would call a backend endpoint to verify the PIN securely
    // For now, we'll use a simple client-side check with attempt throttling
    const correctPin = "1234"; // This should be stored securely on the backend
    if (pin === correctPin) {
      setAdminPinOpen(false);
      setAdminPin("");
      setPinAttempts(0);
      toast.success("Admin access granted");
    } else {
      setPinAttempts(pinAttempts + 1);
      if (pinAttempts >= 2) {
        toast.error("Too many failed attempts. Access locked for 5 minutes.");
        setShowPinInput(false);
        setTimeout(() => setPinAttempts(0), 300000); // 5 minute lockout
      } else {
        toast.error(`Incorrect PIN. ${3 - pinAttempts - 1} attempts remaining.`);
      }
    }
  };

  // Calculate analytics
  const totalRevenue = transactionLogs.reduce((sum, log) => sum + log.total, 0);
  const avgTransaction = transactionLogs.length > 0 ? totalRevenue / transactionLogs.length : 0;
  const paymentBreakdown = {
    cash: transactionLogs.filter((l) => l.paymentMethod === "cash").reduce((sum, l) => sum + l.total, 0),
    mpesa: transactionLogs.filter((l) => l.paymentMethod === "mpesa").reduce((sum, l) => sum + l.total, 0),
    card: transactionLogs.filter((l) => l.paymentMethod === "card").reduce((sum, l) => sum + l.total, 0),
    credit: transactionLogs.filter((l) => l.paymentMethod === "credit").reduce((sum, l) => sum + l.total, 0),
  };

  // Calculate top sellers
  const topSellers = useMemo(() => {
    const productMap = new Map<string, { quantity: number; revenue: number }>();
    transactionLogs.forEach((log) => {
      log.items?.forEach((item) => {
        const existing = productMap.get(item.name) || { quantity: 0, revenue: 0 };
        productMap.set(item.name, {
          quantity: existing.quantity + item.quantity,
          revenue: existing.revenue + item.price * item.quantity,
        });
      });
    });
    return Array.from(productMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [transactionLogs]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-display font-bold">Desktop POS</h1>
              <p className="text-sm text-gray-600">{business?.name}</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-4xl font-bold text-indigo-600">KES {total.toFixed(2)}</div>
                <p className="text-sm text-gray-600">{itemCount} items</p>
              </div>
              {userRole === "admin" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAdminPinOpen(true)}
                  className="gap-2"
                >
                  <Lock className="h-4 w-4" />
                  Admin
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <Tabs defaultValue="sales" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="sales">Sales</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>

          {/* Sales Tab */}
          <TabsContent value="sales" className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Product Search & List */}
            <div className="lg:col-span-3 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Search Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <Input
                    placeholder="Search by product name..."
                    value={searchCode}
                    onChange={(e) => setSearchCode(e.target.value)}
                    className="w-full"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Available Products</CardTitle>
                  <CardDescription>{filteredProducts.length} products</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                    {filteredProducts.map((product: any) => (
                      <Button
                        key={product.id}
                        variant="outline"
                        className="h-20 flex flex-col items-center justify-center hover:bg-indigo-50"
                        onClick={() => addToCart(product)}
                        disabled={product.stock === 0}
                      >
                        <div className="text-sm font-semibold text-center line-clamp-2">{product.name}</div>
                        <div className="text-indigo-600 font-bold text-sm">KES {product.price}</div>
                        {product.stock < 5 && product.stock > 0 && (
                          <Badge variant="destructive" className="mt-1 text-xs">
                            {product.stock} left
                          </Badge>
                        )}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Cart Sidebar */}
            <div className="space-y-4">
              <Card className="sticky top-32">
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
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {cart.map((item) => (
                          <div key={item.id} className="border rounded p-2 text-sm">
                            <div className="flex justify-between items-start mb-1">
                              <span className="font-semibold line-clamp-1">{item.name}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFromCart(item.id)}
                                className="h-6 w-6 p-0"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Minus className="h-2 w-2" />
                                </Button>
                                <span className="w-6 text-center text-xs font-semibold">{item.quantity}</span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  disabled={item.quantity >= item.stock}
                                  className="h-6 w-6 p-0"
                                >
                                  <Plus className="h-2 w-2" />
                                </Button>
                              </div>
                              <span className="font-bold text-xs">KES {(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="border-t pt-2 space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>KES {total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold">
                          <span>Total:</span>
                          <span className="text-indigo-600">KES {total.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold">Payment Method</label>
                        <Tabs value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as any)}>
                          <TabsList className="grid w-full grid-cols-4 text-xs">
                            <TabsTrigger value="cash">Cash</TabsTrigger>
                            <TabsTrigger value="mpesa">M-Pesa</TabsTrigger>
                            <TabsTrigger value="card">Card</TabsTrigger>
                            <TabsTrigger value="credit">Credit</TabsTrigger>
                          </TabsList>
                        </Tabs>
                      </div>

                      <Input
                        placeholder="Notes (optional)"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="text-xs"
                      />

                      <Button
                        onClick={handleCheckout}
                        disabled={checkoutMutation.isPending || cart.length === 0}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
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
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">KES {totalRevenue.toFixed(2)}</div>
                  <p className="text-xs text-gray-600">{transactionLogs.length} transactions</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Avg Transaction</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">KES {avgTransaction.toFixed(2)}</div>
                  <p className="text-xs text-gray-600">Per sale</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Cash Sales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">KES {paymentBreakdown.cash.toFixed(2)}</div>
                  <p className="text-xs text-gray-600">{((paymentBreakdown.cash / totalRevenue) * 100 || 0).toFixed(0)}% of total</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">M-Pesa Sales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">KES {paymentBreakdown.mpesa.toFixed(2)}</div>
                  <p className="text-xs text-gray-600">{((paymentBreakdown.mpesa / totalRevenue) * 100 || 0).toFixed(0)}% of total</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Card Sales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">KES {paymentBreakdown.card.toFixed(2)}</div>
                  <p className="text-xs text-gray-600">{((paymentBreakdown.card / totalRevenue) * 100 || 0).toFixed(0)}% of total</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Credit Sales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">KES {paymentBreakdown.credit.toFixed(2)}</div>
                  <p className="text-xs text-gray-600">{((paymentBreakdown.credit / totalRevenue) * 100 || 0).toFixed(0)}% of total</p>
                </CardContent>
              </Card>
            </div>

            {/* Top Sellers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Top Sellers Today
                </CardTitle>
              </CardHeader>
              <CardContent>
                {topSellers.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No sales yet</p>
                ) : (
                  <div className="space-y-3">
                    {topSellers.map((seller, idx) => (
                      <div key={idx} className="flex items-center justify-between pb-3 border-b last:border-0">
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{seller.name}</p>
                          <p className="text-xs text-gray-600">{seller.quantity} units sold</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm">KES {seller.revenue.toFixed(2)}</p>
                          <Badge variant="secondary" className="text-xs mt-1">#{idx + 1}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>{transactionLogs.length} transactions today</CardDescription>
              </CardHeader>
              <CardContent>
                {transactionLogs.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">No transactions yet</p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {transactionLogs.map((log) => (
                      <div key={log.id} className="border rounded-lg overflow-hidden">
                        <button
                          onClick={() => setExpandedTransaction(expandedTransaction === log.id ? null : log.id)}
                          className="w-full p-3 hover:bg-gray-50 text-left flex items-center justify-between"
                        >
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{log.attendantName}</p>
                            <p className="text-xs text-gray-600">{log.itemCount} items • {log.paymentMethod}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="font-bold">KES {log.total.toFixed(2)}</p>
                              <p className="text-xs text-gray-600">{log.timestamp.toLocaleTimeString()}</p>
                            </div>
                            {expandedTransaction === log.id ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </div>
                        </button>
                        {expandedTransaction === log.id && (
                          <div className="bg-gray-50 border-t p-3 space-y-2">
                            {log.items?.map((item, idx) => (
                              <div key={idx} className="flex justify-between text-xs">
                                <span>{item.quantity}x {item.name}</span>
                                <span>KES {(item.price * item.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                            {log.notes && (
                              <p className="text-xs text-gray-600 border-t pt-2 mt-2">Note: {log.notes}</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Admin PIN Dialog */}
      <Dialog open={adminPinOpen} onOpenChange={setAdminPinOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Admin Access</DialogTitle>
          </DialogHeader>
          {showPinInput ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Enter your 4-digit PIN</p>
              <Input
                type="password"
                placeholder="••••"
                value={adminPin}
                onChange={(e) => setAdminPin(e.target.value)}
                maxLength={4}
                className="text-center text-2xl tracking-widest"
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPinInput(false);
                    setAdminPin("");
                    setPinAttempts(0);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleAdminAction(adminPin)}
                  disabled={adminPin.length !== 4}
                  className="flex-1"
                >
                  Verify
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Select an admin action:</p>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setShowPinInput(true)}
                >
                  <Lock className="h-4 w-4 mr-2" />
                  View Admin Settings
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setShowPinInput(true)}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Detailed Reports
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
