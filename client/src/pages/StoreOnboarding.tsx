import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Store,
  Zap,
  BarChart3,
  Users,
  ShoppingCart,
  Settings,
} from "lucide-react";

type Step = "welcome" | "basic" | "features" | "customization" | "review" | "complete";

interface OnboardingData {
  storeName: string;
  storeSlug: string;
  description: string;
  whatsappNumber: string;
  features: {
    pos: boolean;
    analytics: boolean;
    multiAttendant: boolean;
    inventory: boolean;
    customerPortal: boolean;
  };
  settings: {
    currency: string;
    taxRate: string;
    paymentMethods: string[];
  };
}

const FEATURES = [
  {
    id: "pos",
    name: "POS System",
    description: "In-store sales with barcode scanning and inventory deduction",
    icon: ShoppingCart,
    recommended: true,
  },
  {
    id: "analytics",
    name: "Analytics & Reporting",
    description: "Sales trends, top products, revenue insights",
    icon: BarChart3,
    recommended: false,
  },
  {
    id: "multiAttendant",
    name: "Multi-Attendant",
    description: "Manage multiple staff members and track individual sales",
    icon: Users,
    recommended: false,
  },
  {
    id: "inventory",
    name: "Inventory Management",
    description: "Advanced stock tracking, low-stock alerts, and forecasting",
    icon: Zap,
    recommended: true,
  },
  {
    id: "customerPortal",
    name: "Customer Portal",
    description: "Customers can view order history and track orders",
    icon: Users,
    recommended: false,
  },
];

const PAYMENT_METHODS = ["Cash", "M-Pesa", "Card", "Credit"];

export default function StoreOnboarding() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<Step>("welcome");
  const [data, setData] = useState<OnboardingData>({
    storeName: "",
    storeSlug: "",
    description: "",
    whatsappNumber: "",
    features: {
      pos: true,
      analytics: false,
      multiAttendant: false,
      inventory: true,
      customerPortal: false,
    },
    settings: {
      currency: "KES",
      taxRate: "0",
      paymentMethods: ["Cash", "M-Pesa"],
    },
  });

  const createBusinessMutation = trpc.business.create.useMutation({
    onSuccess: () => {
      toast.success("Store setup complete!");
      setStep("complete");
      setTimeout(() => setLocation("/admin"), 2000);
    },
    onError: (e) => toast.error(e.message || "Failed to create store"),
  });

  const handleNext = () => {
    if (step === "welcome") setStep("basic");
    else if (step === "basic") {
      if (!data.storeName || !data.storeSlug || !data.whatsappNumber) {
        toast.error("Please fill in all required fields");
        return;
      }
      setStep("features");
    } else if (step === "features") setStep("customization");
    else if (step === "customization") setStep("review");
    else if (step === "review") {
      createBusinessMutation.mutate({
        name: data.storeName,
        slug: data.storeSlug,
        description: data.description,
        whatsappNumber: data.whatsappNumber,
      });
    }
  };

  const handleBack = () => {
    if (step === "basic") setStep("welcome");
    else if (step === "features") setStep("basic");
    else if (step === "customization") setStep("features");
    else if (step === "review") setStep("customization");
  };

  const toggleFeature = (featureId: string) => {
    setData((prev) => ({
      ...prev,
      features: {
        ...prev.features,
        [featureId]: !prev.features[featureId as keyof typeof prev.features],
      },
    }));
  };

  const togglePaymentMethod = (method: string) => {
    setData((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        paymentMethods: prev.settings.paymentMethods.includes(method)
          ? prev.settings.paymentMethods.filter((m) => m !== method)
          : [...prev.settings.paymentMethods, method],
      },
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-semibold text-gray-600">
              {step === "welcome" && "Step 1 of 5"}
              {step === "basic" && "Step 2 of 5"}
              {step === "features" && "Step 3 of 5"}
              {step === "customization" && "Step 4 of 5"}
              {step === "review" && "Step 5 of 5"}
              {step === "complete" && "Complete!"}
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{
                width:
                  step === "welcome"
                    ? "20%"
                    : step === "basic"
                      ? "40%"
                      : step === "features"
                        ? "60%"
                        : step === "customization"
                          ? "80%"
                          : step === "review"
                            ? "95%"
                            : "100%",
              }}
            />
          </div>
        </div>

        {/* Welcome Step */}
        {step === "welcome" && (
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center">
                  <Store className="h-8 w-8 text-indigo-600" />
                </div>
              </div>
              <CardTitle className="text-3xl font-display">Welcome to ShopLink</CardTitle>
              <CardDescription className="text-base mt-2">
                Let's set up your store and customize it for your business needs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">What you'll set up:</h3>
                <ul className="space-y-2">
                  {[
                    "Store name and branding",
                    "Choose features that fit your business",
                    "Configure payment methods and settings",
                    "Review and launch your store",
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-700">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <Button onClick={handleNext} size="lg" className="w-full">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Basic Info Step */}
        {step === "basic" && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-display">Store Information</CardTitle>
              <CardDescription>Tell us about your store</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="storeName">Store Name *</Label>
                <Input
                  id="storeName"
                  value={data.storeName}
                  onChange={(e) => setData((prev) => ({ ...prev, storeName: e.target.value }))}
                  placeholder="e.g., Fresh Groceries"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="storeSlug">Store URL Slug *</Label>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-gray-600">/store/</span>
                  <Input
                    id="storeSlug"
                    value={data.storeSlug}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        storeSlug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                      }))
                    }
                    placeholder="fresh-groceries"
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  This is your unique store URL. Can't be changed later.
                </p>
              </div>

              <div>
                <Label htmlFor="description">Store Description</Label>
                <textarea
                  id="description"
                  value={data.description}
                  onChange={(e) => setData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Tell customers about your store..."
                  className="w-full mt-2 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="whatsapp">WhatsApp Number *</Label>
                <Input
                  id="whatsapp"
                  type="tel"
                  value={data.whatsappNumber}
                  onChange={(e) => setData((prev) => ({ ...prev, whatsappNumber: e.target.value }))}
                  placeholder="+254712345678"
                  className="mt-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Orders will be sent to this WhatsApp number
                </p>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleBack} variant="outline" className="flex-1">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button onClick={handleNext} className="flex-1">
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Features Step */}
        {step === "features" && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-display">Choose Your Features</CardTitle>
              <CardDescription>Select the features you need. You can always add more later.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                {FEATURES.map((feature) => {
                  const FeatureIcon = feature.icon;
                  const isEnabled = data.features[feature.id as keyof typeof data.features];
                  return (
                    <div
                      key={feature.id}
                      onClick={() => toggleFeature(feature.id)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        isEnabled
                          ? "border-indigo-600 bg-indigo-50"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <Checkbox
                          checked={isEnabled}
                          onChange={() => {}}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <FeatureIcon className="h-5 w-5 text-indigo-600" />
                            <h3 className="font-semibold text-gray-900">{feature.name}</h3>
                            {feature.recommended && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                Recommended
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-3">
                <Button onClick={handleBack} variant="outline" className="flex-1">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button onClick={handleNext} className="flex-1">
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Customization Step */}
        {step === "customization" && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-display">Customize Settings</CardTitle>
              <CardDescription>Configure payment methods and other preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Accepted Payment Methods</Label>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  {PAYMENT_METHODS.map((method) => (
                    <div
                      key={method}
                      onClick={() => togglePaymentMethod(method)}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all text-center ${
                        data.settings.paymentMethods.includes(method)
                          ? "border-indigo-600 bg-indigo-50"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <Checkbox
                        checked={data.settings.paymentMethods.includes(method)}
                        onChange={() => {}}
                      />
                      <p className="text-sm font-medium mt-2">{method}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="taxRate">Tax Rate (%)</Label>
                <Input
                  id="taxRate"
                  type="number"
                  value={data.settings.taxRate}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      settings: { ...prev.settings, taxRate: e.target.value },
                    }))
                  }
                  placeholder="0"
                  min="0"
                  max="100"
                  step="0.1"
                  className="mt-2"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>Tip:</strong> You can modify these settings anytime from your store dashboard.
                </p>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleBack} variant="outline" className="flex-1">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button onClick={handleNext} className="flex-1">
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Review Step */}
        {step === "review" && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-display">Review Your Setup</CardTitle>
              <CardDescription>Make sure everything looks good before launching</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">Store Information</h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="text-gray-600">Name:</span>{" "}
                      <span className="font-medium">{data.storeName}</span>
                    </p>
                    <p>
                      <span className="text-gray-600">URL:</span>{" "}
                      <span className="font-medium">/store/{data.storeSlug}</span>
                    </p>
                    <p>
                      <span className="text-gray-600">WhatsApp:</span>{" "}
                      <span className="font-medium">{data.whatsappNumber}</span>
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">Enabled Features</h3>
                  <div className="space-y-1 text-sm">
                    {Object.entries(data.features).map(([key, enabled]) => (
                      <p key={key}>
                        <span className={enabled ? "text-green-600" : "text-gray-400"}>
                          {enabled ? "✓" : "○"}
                        </span>{" "}
                        {FEATURES.find((f) => f.id === key)?.name}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">Payment Methods</h3>
                  <p className="text-sm">{data.settings.paymentMethods.join(", ")}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleBack} variant="outline" className="flex-1">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={createBusinessMutation.isPending}
                  className="flex-1"
                >
                  {createBusinessMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      Launch Store <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Complete Step */}
        {step === "complete" && (
          <Card className="shadow-lg">
            <CardContent className="pt-12 pb-12 text-center">
              <div className="flex justify-center mb-6">
                <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="h-10 w-10 text-green-600" />
                </div>
              </div>
              <h2 className="text-3xl font-display font-bold text-gray-900 mb-2">
                Store Created Successfully!
              </h2>
              <p className="text-gray-600 mb-8">
                Your store is now live. Redirecting to your dashboard...
              </p>
              <div className="flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
