import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { Loader2, Phone, Lock, CheckCircle2 } from "lucide-react";

type Step = "phone" | "otp" | "password" | "success" | "orders";

export default function CustomerOTPPortal() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [deviceId] = useState(() => {
    const stored = localStorage.getItem("deviceId");
    if (stored) return stored;
    const newId = `device-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem("deviceId", newId);
    return newId;
  });

  const sendOtpMutation = trpc.otp.send.useMutation();
  const verifyOtpMutation = trpc.otp.verify.useMutation();
  // Detect if account exists by attempting login
  const detectAccountMutation = { data: undefined };
  const setupPasswordMutation = trpc.customer.register.useMutation();
  const loginMutation = trpc.customer.login.useMutation();

  const handleSendOTP = async () => {
    if (!phone || phone.length < 7) {
      toast.error("Please enter a valid phone number");
      return;
    }

    try {
      await sendOtpMutation.mutateAsync({ phone });
      toast.success("OTP sent to your WhatsApp");
      setStep("otp");
    } catch (error: any) {
      toast.error(error.message || "Failed to send OTP");
    }
  };

  const handleVerifyOTP = async () => {
    if (!otpCode || otpCode.length !== 6) {
      toast.error("Please enter a 6-digit OTP");
      return;
    }

    try {
      await verifyOtpMutation.mutateAsync({ phone, otpCode });
      // After OTP verification, go to password step
      setStep("password");
      toast.success("OTP verified!");
    } catch (error: any) {
      toast.error(error.message || "Invalid OTP");
    }
  };

  const handleSetupPassword = async () => {
    if (!password || password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    try {
      const result = await setupPasswordMutation.mutateAsync({
        phone,
        name: phone,
        password,
      });

      // Save customer session
      localStorage.setItem("customerSession", JSON.stringify(result));
      toast.success("Account created! Redirecting...");
      setStep("success");
      setTimeout(() => setLocation("/customer/orders"), 1500);
    } catch (error: any) {
      toast.error(error.message || "Failed to setup password");
    }
  };

  const handleLogin = async () => {
    if (!password) {
      toast.error("Please enter your password");
      return;
    }

    try {
      const result = await loginMutation.mutateAsync({
        phone,
        password,
      });

      localStorage.setItem("customerSession", JSON.stringify(result));
      toast.success("Logged in successfully!");
      setStep("success");
      setTimeout(() => setLocation("/customer/orders"), 1500);
    } catch (error: any) {
      toast.error(error.message || "Invalid password");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        {/* Step: Phone */}
        {step === "phone" && (
          <>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-display">Enter Your Phone</CardTitle>
              <CardDescription>We'll send you an OTP to verify your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Phone className="absolute left-3 top-3 text-gray-400" size={20} />
                <Input
                  type="tel"
                  placeholder="+254712345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                onClick={handleSendOTP}
                disabled={sendOtpMutation.isPending}
                className="w-full"
              >
                {sendOtpMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : null}
                Send OTP
              </Button>
            </CardContent>
          </>
        )}

        {/* Step: OTP Verification */}
        {step === "otp" && (
          <>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-display">Enter OTP</CardTitle>
              <CardDescription>Check your WhatsApp for the 6-digit code</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                type="text"
                placeholder="000000"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.slice(0, 6))}
                maxLength={6}
                className="text-center text-2xl tracking-widest"
              />
              <Button
                onClick={handleVerifyOTP}
                disabled={verifyOtpMutation.isPending}
                className="w-full"
              >
                {verifyOtpMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : null}
                Verify OTP
              </Button>
              <Button variant="outline" onClick={() => setStep("phone")} className="w-full">
                Back
              </Button>
            </CardContent>
          </>
        )}

        {/* Step: Password Setup/Login */}
        {step === "password" && (
          <>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-display">Create Password</CardTitle>
              <CardDescription>Set a password to secure your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                <Input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10"
                />
              </div>
            <Button
              onClick={handleSetupPassword}
              disabled={setupPasswordMutation.isPending}
              className="w-full"
            >
              {setupPasswordMutation.isPending ? (
                <Loader2 className="animate-spin mr-2" />
              ) : null}
              Create Account
            </Button>
              <Button variant="outline" onClick={() => setStep("otp")} className="w-full">
                Back
              </Button>
            </CardContent>
          </>
        )}

        {/* Step: Success */}
        {step === "success" && (
          <>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle2 className="text-green-500" size={48} />
              </div>
              <CardTitle className="text-2xl font-display">Welcome!</CardTitle>
              <CardDescription>Redirecting to your orders...</CardDescription>
            </CardHeader>
          </>
        )}
      </Card>
    </div>
  );
}
