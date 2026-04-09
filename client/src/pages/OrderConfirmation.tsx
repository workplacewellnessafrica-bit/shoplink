import { Button } from "@/components/ui/button";
import { formatPrice } from "@shared/currency";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, MessageCircle, Package, ShoppingBag } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";

interface OrderConfirmationState {
  orderId: number;
  totalAmount: string;
  whatsappUrl: string | null;
  businessName: string;
  customerName: string;
}

export default function OrderConfirmation() {
  const [, setLocation] = useLocation();
  const [orderData, setOrderData] = useState<OrderConfirmationState | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("shoplink_last_order");
    if (raw) {
      try {
        setOrderData(JSON.parse(raw));
      } catch {
        setLocation("/");
      }
    } else {
      setLocation("/");
    }
  }, [setLocation]);

  if (!orderData) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        {/* Success Icon */}
        <div className="text-center">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100 mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-display font-bold">Order Confirmed!</h1>
          <p className="text-muted-foreground mt-2">
            Thank you, <strong>{orderData.customerName}</strong>. Your order has been placed successfully.
          </p>
        </div>

        {/* Order Summary Card */}
        <Card>
          <CardContent className="pt-5 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Order Number</span>
              <span className="font-bold">#{orderData.orderId}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Store</span>
              <span className="font-medium">{orderData.businessName}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total Amount</span>
              <span className="font-bold text-primary text-base">{formatPrice(parseFloat(orderData.totalAmount))}</span>
            </div>
          </CardContent>
        </Card>

        {/* WhatsApp CTA */}
        {orderData.whatsappUrl && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-3">
            <div className="flex items-start gap-3">
              <MessageCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-green-900 text-sm">Connect via WhatsApp</p>
                <p className="text-green-700 text-xs mt-0.5">
                  Your order details have been prepared. Open WhatsApp to send them to the business and confirm your order.
                </p>
              </div>
            </div>
            <Button
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={() => window.open(orderData.whatsappUrl!, "_blank")}
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Open WhatsApp to Confirm Order
            </Button>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <Button variant="outline" asChild>
            <Link href="/orders">
              <Package className="mr-2 h-4 w-4" />
              Track My Orders
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Continue Shopping
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
