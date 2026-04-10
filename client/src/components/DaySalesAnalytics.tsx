import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { formatPrice } from "@shared/currency";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function DaySalesAnalytics() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const { data: sales, isLoading } = trpc.analytics.getDaySales.useQuery({
    date: selectedDate,
  });

  const previousDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() - 1);
    setSelectedDate(date.toISOString().split("T")[0]);
  };

  const nextDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + 1);
    setSelectedDate(date.toISOString().split("T")[0]);
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading sales data...</div>;
  }

  if (!sales) {
    return <div className="text-center py-8">No data available</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={previousDay}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>

        <Input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="max-w-xs"
        />

        <Button
          variant="outline"
          size="sm"
          onClick={nextDay}
          className="flex items-center gap-2"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPrice(sales.totalSales)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {sales.orderCount} orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Web Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPrice(sales.webSales)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {((sales.webSales / (sales.totalSales || 1)) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              POS Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPrice(sales.posSales)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {((sales.posSales / (sales.totalSales || 1)) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>
      </div>

      {sales.posSales > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">POS Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { method: "Cash", amount: sales.paymentBreakdown.cash },
                { method: "Card", amount: sales.paymentBreakdown.card },
                { method: "M-Pesa", amount: sales.paymentBreakdown.mpesa },
                { method: "Credit", amount: sales.paymentBreakdown.credit },
              ].map((item) => (
                <div key={item.method} className="flex justify-between items-center">
                  <span className="text-sm">{item.method}</span>
                  <div className="flex items-center gap-4">
                    <div className="w-32 bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{
                          width: `${
                            sales.posSales > 0
                              ? (item.amount / sales.posSales) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                    <span className="font-medium min-w-24 text-right">
                      {formatPrice(item.amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
