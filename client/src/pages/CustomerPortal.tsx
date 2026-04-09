import { trpc } from "@/lib/trpc";
import { formatPrice } from "@shared/currency";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  ArrowLeft,
  ClipboardList,
  Loader2,
  LogOut,
  Package,
  Phone,
  ShoppingBag,
  User,
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

// ─── Status Colors ────────────────────────────────────────────────────────────
const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  processing: "bg-purple-100 text-purple-800 border-purple-200",
  shipped: "bg-indigo-100 text-indigo-800 border-indigo-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

// ─── Order Detail Dialog ──────────────────────────────────────────────────────
function OrderDetailDialog({
  orderId,
  customerId,
  open,
  onClose,
}: {
  orderId: number;
  customerId: number;
  open: boolean;
  onClose: () => void;
}) {
  const { data, isLoading } = trpc.customer.orderDetails.useQuery(
    { orderId, customerId },
    { enabled: open }
  );

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">Order #{orderId}</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : data ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className={`text-sm px-3 py-1 rounded-full font-medium border ${statusColors[data.order.status]}`}>
                {data.order.status.charAt(0).toUpperCase() + data.order.status.slice(1)}
              </span>
              <span className="text-sm text-muted-foreground">
                {new Date(data.order.createdAt).toLocaleDateString()}
              </span>
            </div>

            {data.business && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ShoppingBag className="h-4 w-4" />
                <span>From <strong className="text-foreground">{data.business.name}</strong></span>
              </div>
            )}

            <div className="bg-muted/50 rounded-xl p-3 space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Items</p>
              {data.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.productName} × {item.quantity}</span>
                  <span className="font-medium">{formatPrice(parseFloat(item.subtotal))}</span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-primary">{formatPrice(parseFloat(data.order.totalAmount))}</span>
              </div>
            </div>

            <div className="space-y-1.5 text-sm">
              <p className="font-medium">Delivery Details</p>
              <p className="text-muted-foreground">{data.order.deliveryAddress}</p>
              {data.order.deliveryNotes && (
                <p className="text-muted-foreground italic">Note: {data.order.deliveryNotes}</p>
              )}
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

// ─── Auth Forms ───────────────────────────────────────────────────────────────
function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const utils = trpc.useUtils();

  const login = trpc.customer.login.useMutation({
    onSuccess: () => {
      toast.success("Welcome back!");
      utils.customer.me.invalidate();
      onSuccess();
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        login.mutate({ phone, password });
      }}
      className="space-y-4"
    >
      <div className="space-y-1.5">
        <Label>Phone Number</Label>
        <Input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+1234567890"
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label>Password</Label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={login.isPending}>
        {login.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Sign In
      </Button>
    </form>
  );
}

function RegisterForm({ onSuccess }: { onSuccess: () => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const utils = trpc.useUtils();

  const register = trpc.customer.register.useMutation({
    onSuccess: () => {
      toast.success("Account created! Welcome to ShopLink.");
      utils.customer.me.invalidate();
      onSuccess();
    },
    onError: (e) => toast.error(e.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    register.mutate({ name, phone, password });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Full Name</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" required />
      </div>
      <div className="space-y-1.5">
        <Label>Phone Number</Label>
        <Input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+1234567890"
          required
        />
        <p className="text-xs text-muted-foreground">This is your unique login identifier.</p>
      </div>
      <div className="space-y-1.5">
        <Label>Password</Label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label>Confirm Password</Label>
        <Input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={register.isPending}>
        {register.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Create Account
      </Button>
    </form>
  );
}

// ─── Order History ────────────────────────────────────────────────────────────
function OrderHistory({ customerId }: { customerId: number }) {
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const { data: orders, isLoading } = trpc.customer.myOrders.useQuery({ customerId });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-30" />
        <p className="font-medium">No orders yet</p>
        <p className="text-sm mt-1">Your orders will appear here after you checkout</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/">Browse Stores</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {orders.map((order) => (
          <Card
            key={order.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setSelectedOrderId(order.id)}
          >
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">Order #{order.id}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${statusColors[order.status]}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-xs text-muted-foreground truncate max-w-xs">{order.deliveryAddress}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-primary">{formatPrice(parseFloat(order.totalAmount))}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">View details →</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedOrderId && (
        <OrderDetailDialog
          orderId={selectedOrderId}
          customerId={customerId}
          open={!!selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
        />
      )}
    </>
  );
}

// ─── Main Customer Portal ─────────────────────────────────────────────────────
export default function CustomerPortal() {
  const utils = trpc.useUtils();
  const { data: customer, isLoading } = trpc.customer.me.useQuery();

  const logout = trpc.customer.logout.useMutation({
    onSuccess: () => {
      toast.success("Signed out");
      utils.customer.me.invalidate();
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-40">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">ShopLink</span>
            </Link>
            <Separator orientation="vertical" className="h-4" />
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-primary" />
              <span className="font-semibold text-sm">Order History</span>
            </div>
          </div>
          {customer && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => logout.mutate()}
              className="text-muted-foreground"
            >
              <LogOut className="h-3.5 w-3.5 mr-1.5" />
              Sign Out
            </Button>
          )}
        </div>
      </header>

      <div className="container py-10 max-w-2xl mx-auto">
        {!customer ? (
          <div className="space-y-6">
            <div className="text-center">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Package className="h-7 w-7 text-primary" />
              </div>
              <h1 className="text-3xl font-display font-bold">Track Your Orders</h1>
              <p className="text-muted-foreground mt-2">
                Sign in or create an account using your phone number to view your order history.
              </p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <Tabs defaultValue="login">
                  <TabsList className="w-full mb-6">
                    <TabsTrigger value="login" className="flex-1">
                      <Phone className="h-3.5 w-3.5 mr-1.5" />
                      Sign In
                    </TabsTrigger>
                    <TabsTrigger value="register" className="flex-1">
                      <User className="h-3.5 w-3.5 mr-1.5" />
                      Create Account
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="login">
                    <LoginForm onSuccess={() => {}} />
                  </TabsContent>
                  <TabsContent value="register">
                    <RegisterForm onSuccess={() => {}} />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <p className="text-center text-sm text-muted-foreground">
              No email required — just your phone number and a password.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-display font-bold">Your Orders</h1>
                <p className="text-muted-foreground text-sm mt-0.5 flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" />
                  {customer.phone} · {customer.name}
                </p>
              </div>
            </div>
            <OrderHistory customerId={customer.id} />
          </div>
        )}
      </div>
    </div>
  );
}
