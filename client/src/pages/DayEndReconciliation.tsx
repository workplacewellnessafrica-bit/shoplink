import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, DollarSign, TrendingUp, CheckCircle2, AlertCircle, Download } from "lucide-react";
import * as XLSX from "xlsx";

export default function DayEndReconciliation() {
  const [cashAtHand, setCashAtHand] = useState("");
  const [mpesaTotal, setMpesaTotal] = useState("");
  const [cardTotal, setCardTotal] = useState("");
  const [credits, setCredits] = useState("");
  const [expenditures, setExpenditures] = useState("");
  const [reconciliation, setReconciliation] = useState<any>(null);
  const [isVerified, setIsVerified] = useState(false);

  const getTodayQuery = trpc.reconciliation.getTodayOrCreate.useQuery();
  const getHistoryQuery = trpc.reconciliation.getHistory.useQuery();
  const updateMutation = trpc.reconciliation.update.useMutation();
  const verifyMutation = trpc.reconciliation.verify.useMutation();
  const closeMutation = trpc.reconciliation.close.useMutation();

  useEffect(() => {
    if (getTodayQuery.data) {
      setReconciliation(getTodayQuery.data);
      if (getTodayQuery.data.cashAtHand) setCashAtHand(getTodayQuery.data.cashAtHand);
      if (getTodayQuery.data.mpesaTotal) setMpesaTotal(getTodayQuery.data.mpesaTotal);
      if (getTodayQuery.data.cardTotal) setCardTotal(getTodayQuery.data.cardTotal);
      if (getTodayQuery.data.credits) setCredits(getTodayQuery.data.credits);
      if (getTodayQuery.data.expenditures) setExpenditures(getTodayQuery.data.expenditures);
    }
  }, [getTodayQuery.data]);

  const calculateDaysSales = () => {
    return (
      parseFloat(mpesaTotal || "0") +
      parseFloat(cardTotal || "0") +
      parseFloat(cashAtHand || "0")
    ).toFixed(2);
  };

  const calculateClosingBalance = () => {
    const daysSales = calculateDaysSales();
    const expend = parseFloat(expenditures || "0");
    const opening = parseFloat(reconciliation?.openingBalance || "0");
    return (opening + parseFloat(daysSales) - expend).toFixed(2);
  };

  const handleExportToExcel = () => {
    if (!getHistoryQuery.data || getHistoryQuery.data.length === 0) {
      toast.error("No reconciliation records to export");
      return;
    }

    const data = getHistoryQuery.data.map((rec: any) => ({
      Date: rec.date,
      "Opening Balance": rec.openingBalance,
      "Days Sales": rec.daysSales,
      Expenditures: rec.expenditures,
      "Closing Balance": rec.closingBalance,
      "Cash at Hand": rec.cashAtHand || 0,
      "M-Pesa Total": rec.mpesaTotal || 0,
      "Card Total": rec.cardTotal || 0,
      Credits: rec.credits || 0,
      Status: rec.status,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reconciliation");
    XLSX.writeFile(wb, `reconciliation-${new Date().toISOString().split("T")[0]}.xlsx`);
    toast.success("Reconciliation exported to Excel");
  };

  const handleSaveReconciliation = async () => {
    if (!reconciliation) return;

    try {
      await updateMutation.mutateAsync({
        id: reconciliation.id,
        cashAtHand: cashAtHand || "0",
        mpesaTotal: mpesaTotal || "0",
        cardTotal: cardTotal || "0",
        credits: credits || "0",
        expenditures: expenditures || "0",
      });

      toast.success("Reconciliation saved");
      getTodayQuery.refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to save");
    }
  };

  const handleVerify = async () => {
    if (!reconciliation) return;

    try {
      await verifyMutation.mutateAsync({ id: reconciliation.id });
      setIsVerified(true);
      toast.success("Reconciliation verified");
      getTodayQuery.refetch();
    } catch (error: any) {
      toast.error(error.message || "Verification failed");
    }
  };

  const handleClose = async () => {
    if (!reconciliation) return;

    try {
      await closeMutation.mutateAsync({ id: reconciliation.id });
      toast.success("Day closed successfully");
      getTodayQuery.refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to close day");
    }
  };

  if (getTodayQuery.isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  const daysSales = calculateDaysSales();
  const closingBalance = calculateClosingBalance();
  const isBalanced = Math.abs(parseFloat(closingBalance) - parseFloat(reconciliation?.closingBalance || "0")) < 0.01;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-display">Day End Reconciliation</h1>
            <p className="text-gray-600">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleExportToExcel}
              className="flex items-center gap-2"
            >
              <Download size={18} />
              Export Excel
            </Button>
            {reconciliation?.status === "closed" && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                <CheckCircle2 className="text-green-600" size={20} />
                <span className="font-medium text-green-700">Day Closed</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Input Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Opening Balance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign size={20} />
                  Opening Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-indigo-600">
                  KES {reconciliation?.openingBalance || "0"}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  From previous day closing balance
                </p>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card>
              <CardHeader>
                <CardTitle>Today's Sales by Payment Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">💵 Cash at Hand</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={cashAtHand}
                    onChange={(e) => setCashAtHand(e.target.value)}
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">📱 M-Pesa Total</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={mpesaTotal}
                    onChange={(e) => setMpesaTotal(e.target.value)}
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">💳 Card Payments</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={cardTotal}
                    onChange={(e) => setCardTotal(e.target.value)}
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">📝 Credits Given</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={credits}
                    onChange={(e) => setCredits(e.target.value)}
                    step="0.01"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Expenditures */}
            <Card>
              <CardHeader>
                <CardTitle>Expenditures</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={expenditures}
                  onChange={(e) => setExpenditures(e.target.value)}
                  step="0.01"
                />
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleSaveReconciliation}
                disabled={updateMutation.isPending}
                variant="outline"
              >
                {updateMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : null}
                Save
              </Button>
              <Button
                onClick={handleVerify}
                disabled={verifyMutation.isPending || isVerified}
              >
                {verifyMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : null}
                Verify
              </Button>
              <Button
                onClick={handleClose}
                disabled={closeMutation.isPending || !isVerified}
                className="bg-green-600 hover:bg-green-700"
              >
                {closeMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : null}
                Close Day
              </Button>
            </div>
          </div>

          {/* Right: Summary */}
          <div className="space-y-4">
            {/* Daily Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp size={20} />
                  Daily Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Day's Sales</p>
                  <p className="text-2xl font-bold text-green-600">KES {daysSales}</p>
                </div>
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-600">Expenditures</p>
                  <p className="text-2xl font-bold text-red-600">KES {expenditures || "0"}</p>
                </div>
              </CardContent>
            </Card>

            {/* Closing Balance */}
            <Card className={isBalanced ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {isBalanced ? (
                    <CheckCircle2 className="text-green-600" size={20} />
                  ) : (
                    <AlertCircle className="text-red-600" size={20} />
                  )}
                  Closing Balance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-3xl font-bold" style={{ color: isBalanced ? "#16a34a" : "#dc2626" }}>
                  KES {closingBalance}
                </div>
                <p className="text-sm" style={{ color: isBalanced ? "#16a34a" : "#dc2626" }}>
                  {isBalanced ? "✓ Balanced" : "⚠ Verify amounts"}
                </p>
              </CardContent>
            </Card>

            {/* Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Calculation</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span>Opening:</span>
                  <span>KES {reconciliation?.openingBalance || "0"}</span>
                </div>
                <div className="flex justify-between">
                  <span>+ Sales:</span>
                  <span>KES {daysSales}</span>
                </div>
                <div className="flex justify-between">
                  <span>- Expenditures:</span>
                  <span>KES {expenditures || "0"}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold">
                  <span>= Closing:</span>
                  <span>KES {closingBalance}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
