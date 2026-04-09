import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Loader2, Store, ArrowRight } from "lucide-react";

export default function BusinessSetup() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<"welcome" | "details" | "features">("welcome");
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    whatsappNumber: "",
  });
  const [selectedFeatures, setSelectedFeatures] = useState({
    pos: true,
    analytics: true,
    inventory: true,
  });

  const createBusinessMutation = trpc.business.create.useMutation();
  const { data: user } = trpc.auth.me.useQuery();

  const handleCreateBusiness = async () => {
    if (!formData.name.trim()) {
      toast.error("Business name is required");
      return;
    }

    if (!formData.slug.trim()) {
      toast.error("Business slug is required");
      return;
    }

    try {
      const result = await createBusinessMutation.mutateAsync({
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        whatsappNumber: formData.whatsappNumber,
      });

      toast.success("Business created successfully!");
      setLocation(`/admin`);
    } catch (error: any) {
      toast.error(error.message || "Failed to create business");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/20 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {step === "welcome" && (
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Store className="h-8 w-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-3xl">Welcome to ShopLink!</CardTitle>
              <CardDescription className="text-lg mt-2">
                Set up your business storefront in just a few steps
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-2">What you'll get:</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-primary" />
                    Your own online storefront
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-primary" />
                    WhatsApp checkout integration
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-primary" />
                    POS system for in-store sales
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-primary" />
                    Real-time inventory management
                  </li>
                </ul>
              </div>
              <Button size="lg" onClick={() => setStep("details")} className="w-full">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {step === "details" && (
          <Card>
            <CardHeader>
              <CardTitle>Business Details</CardTitle>
              <CardDescription>Tell us about your business</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Business Name *</label>
                <Input
                  placeholder="e.g., Mama Amina's Grocery"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Store URL Slug *</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">shoplink.com/store/</span>
                  <Input
                    placeholder="mama-amina"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Textarea
                  placeholder="Tell customers about your business..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">WhatsApp Number</label>
                <Input
                  placeholder="+254712345678"
                  value={formData.whatsappNumber}
                  onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setStep("welcome")} className="flex-1">
                  Back
                </Button>
                <Button onClick={() => setStep("features")} className="flex-1">
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === "features" && (
          <Card>
            <CardHeader>
              <CardTitle>Choose Features</CardTitle>
              <CardDescription>Select the features you want to enable</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {[
                  { id: "pos", label: "POS System", desc: "In-store point of sale system" },
                  { id: "analytics", label: "Analytics", desc: "Sales reports and insights" },
                  { id: "inventory", label: "Inventory Management", desc: "Track stock levels" },
                ].map((feature) => (
                  <label
                    key={feature.id}
                    className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedFeatures[feature.id as keyof typeof selectedFeatures]}
                      onChange={(e) =>
                        setSelectedFeatures({
                          ...selectedFeatures,
                          [feature.id]: e.target.checked,
                        })
                      }
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="font-medium">{feature.label}</div>
                      <div className="text-sm text-muted-foreground">{feature.desc}</div>
                    </div>
                  </label>
                ))}
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setStep("details")} className="flex-1">
                  Back
                </Button>
                <Button
                  onClick={handleCreateBusiness}
                  disabled={createBusinessMutation.isPending}
                  className="flex-1"
                >
                  {createBusinessMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Business
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
