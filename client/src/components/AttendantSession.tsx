import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { LogOut, LogIn, Users } from "lucide-react";
import { toast } from "sonner";

interface AttendantSessionProps {
  businessId: number;
  onSessionChange?: (attendantId: number | null) => void;
}

export function AttendantSession({ businessId, onSessionChange }: AttendantSessionProps) {
  const [currentAttendant, setCurrentAttendant] = useState<number | null>(null);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [selectedAttendant, setSelectedAttendant] = useState<string>("");

  const { data: attendants } = trpc.attendant.list.useQuery();
  const loginMutation = trpc.attendant.create.useMutation({
    onSuccess: (result: any) => {
      setCurrentAttendant(result.id);
      onSessionChange?.(result.id);
      setShowLoginDialog(false);
      toast.success(`Welcome, ${result.name}!`);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const handleLogout = () => {
    setCurrentAttendant(null);
    onSessionChange?.(null);
    toast.success("Logged out successfully");
  };

  const handleLogin = () => {
    if (!selectedAttendant) {
      toast.error("Please select an attendant");
      return;
    }
    loginMutation.mutate({
      name: attendants?.find((a) => a.id === parseInt(selectedAttendant))?.name || "Attendant",
      role: "attendant",
    });
  };

  const currentAttendantData = attendants?.find((a) => a.id === currentAttendant);

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Users className="h-4 w-4" />
            Attendant Session
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentAttendant && currentAttendantData ? (
            <div className="space-y-3">
              <div className="bg-green-50 border border-green-200 rounded p-3">
                <p className="text-sm font-semibold text-green-900">{currentAttendantData.name}</p>
                <p className="text-xs text-green-700">{currentAttendantData.role}</p>
              </div>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="w-full gap-2 text-red-600 hover:text-red-700"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => setShowLoginDialog(true)}
              className="w-full gap-2"
            >
              <LogIn className="h-4 w-4" />
              Login Attendant
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Login Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Attendant Login</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold">Select Attendant</label>
              <Select value={selectedAttendant} onValueChange={setSelectedAttendant}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an attendant..." />
                </SelectTrigger>
                <SelectContent>
                  {attendants?.map((attendant) => (
                    <SelectItem key={attendant.id} value={attendant.id.toString()}>
                      {attendant.name} ({attendant.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowLoginDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleLogin}
                disabled={!selectedAttendant || loginMutation.isPending}
                className="flex-1"
              >
                {loginMutation.isPending ? "Logging in..." : "Login"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
