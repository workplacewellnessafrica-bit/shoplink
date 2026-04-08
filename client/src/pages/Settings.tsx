import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { LogOut, User, Settings as SettingsIcon, ArrowLeft, Loader2 } from "lucide-react";

export default function Settings() {
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const [displayName, setDisplayName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [isSaving, setIsSaving] = useState(false);

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      toast.success("Logged out successfully");
      logout();
      setTimeout(() => setLocation("/"), 500);
    },
    onError: () => {
      toast.error("Failed to logout");
    },
  });

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      // In a real app, you'd have an API endpoint to update profile
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/")}
          >
            <ArrowLeft size={20} />
          </Button>
          <div className="flex items-center gap-3">
            <SettingsIcon className="text-indigo-600" size={24} />
            <h1 className="text-2xl font-display font-bold">Settings</h1>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User size={20} />
              Profile Information
            </CardTitle>
            <CardDescription>Manage your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Display Name</Label>
              <Input
                id="name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={user?.email || ""}
                disabled
                className="mt-2 bg-gray-100"
              />
              <p className="text-sm text-gray-500 mt-2">Phone number cannot be changed</p>
            </div>
            <Button
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="w-full"
            >
              {isSaving ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
              Save Changes
            </Button>
          </CardContent>
        </Card>

        {/* Account Section */}
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Manage your account settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>Account Type:</strong> {user?.role === "admin" ? "Business Owner" : "Customer"}
              </p>
              <p className="text-sm text-blue-900 mt-2">
                <strong>Member Since:</strong> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Logout Section */}
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-900">Logout</CardTitle>
            <CardDescription className="text-red-800">Sign out of your account</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-800 mb-4">
              You will be logged out and redirected to the home page.
            </p>
            <Button
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              variant="destructive"
              className="w-full flex items-center justify-center gap-2"
            >
              {logoutMutation.isPending ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <LogOut size={16} />
              )}
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
