import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  Smartphone,
  Monitor,
  Zap,
  BarChart3,
  Wifi,
  Smartphone as MobileIcon,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";

export default function POSDownload() {
  const [, setLocation] = useLocation();
  const [selectedApp, setSelectedApp] = useState<"mobile" | "desktop" | null>(null);

  const mobileFeatures = [
    { icon: Zap, text: "Quick sale interface with emoji categories" },
    { icon: Wifi, text: "Works offline - sync when online" },
    { icon: Smartphone, text: "Optimized for touch and small screens" },
    { icon: CheckCircle2, text: "Real-time inventory deduction" },
    { icon: BarChart3, text: "Daily sales summary" },
    { icon: CheckCircle2, text: "Low-stock alerts" },
  ];

  const desktopFeatures = [
    { icon: Monitor, text: "Full-featured POS system" },
    { icon: BarChart3, text: "Advanced analytics and reporting" },
    { icon: CheckCircle2, text: "Multi-attendant management" },
    { icon: Zap, text: "Barcode scanning and product search" },
    { icon: CheckCircle2, text: "Day-end reconciliation" },
    { icon: CheckCircle2, text: "Export to Excel/PDF" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/")}
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-display font-bold">POS System</h1>
            <p className="text-sm text-gray-600">Choose your platform and download</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero Section */}
        {!selectedApp && (
          <>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-display font-bold mb-4">
                Download Your POS System
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Choose between mobile and desktop versions optimized for your business needs
              </p>
            </div>

            {/* Platform Selection */}
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {/* Mobile Option */}
              <Card
                onClick={() => setSelectedApp("mobile")}
                className="cursor-pointer hover:shadow-lg transition-all hover:border-indigo-600"
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <Smartphone className="h-12 w-12 text-indigo-600" />
                    <Badge className="bg-green-100 text-green-800">Popular</Badge>
                  </div>
                  <CardTitle className="text-2xl">Mobile POS</CardTitle>
                  <CardDescription>For in-store sales on the go</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    {mobileFeatures.map((feature, i) => {
                      const Icon = feature.icon;
                      return (
                        <div key={i} className="flex items-center gap-3">
                          <Icon className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{feature.text}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-900">
                      <strong>Perfect for:</strong> Small stores, mobile vendors, quick transactions
                    </p>
                  </div>

                  <Button className="w-full" size="lg">
                    <Download className="mr-2 h-4 w-4" />
                    Download Mobile App
                  </Button>
                </CardContent>
              </Card>

              {/* Desktop Option */}
              <Card
                onClick={() => setSelectedApp("desktop")}
                className="cursor-pointer hover:shadow-lg transition-all hover:border-indigo-600"
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <Monitor className="h-12 w-12 text-indigo-600" />
                    <Badge className="bg-purple-100 text-purple-800">Full-Featured</Badge>
                  </div>
                  <CardTitle className="text-2xl">Desktop POS</CardTitle>
                  <CardDescription>For comprehensive store management</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    {desktopFeatures.map((feature, i) => {
                      const Icon = feature.icon;
                      return (
                        <div key={i} className="flex items-center gap-3">
                          <Icon className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{feature.text}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <p className="text-sm text-purple-900">
                      <strong>Perfect for:</strong> Large stores, multiple attendants, detailed analytics
                    </p>
                  </div>

                  <Button className="w-full" size="lg">
                    <Download className="mr-2 h-4 w-4" />
                    Download Desktop App
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Comparison Table */}
            <Card>
              <CardHeader>
                <CardTitle>Feature Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold">Feature</th>
                        <th className="text-center py-3 px-4 font-semibold">Mobile</th>
                        <th className="text-center py-3 px-4 font-semibold">Desktop</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { feature: "Quick Sales", mobile: true, desktop: true },
                        { feature: "Barcode Scanning", mobile: true, desktop: true },
                        { feature: "Offline Mode", mobile: true, desktop: false },
                        { feature: "Multi-Attendant", mobile: false, desktop: true },
                        { feature: "Advanced Analytics", mobile: false, desktop: true },
                        { feature: "Day-End Reconciliation", mobile: false, desktop: true },
                        { feature: "Inventory Management", mobile: true, desktop: true },
                        { feature: "Low-Stock Alerts", mobile: true, desktop: true },
                        { feature: "Export Reports", mobile: false, desktop: true },
                        { feature: "Touch Optimized", mobile: true, desktop: false },
                      ].map((row, i) => (
                        <tr key={i} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">{row.feature}</td>
                          <td className="text-center py-3 px-4">
                            {row.mobile ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto" />
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>
                          <td className="text-center py-3 px-4">
                            {row.desktop ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto" />
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Mobile App Details */}
        {selectedApp === "mobile" && (
          <div className="space-y-8">
            <Button
              variant="outline"
              onClick={() => setSelectedApp(null)}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Options
            </Button>

            <Card>
              <CardHeader>
                <CardTitle className="text-3xl">Mobile POS App</CardTitle>
                <CardDescription>Lightweight, fast, and offline-capable</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-semibold text-lg mb-4">System Requirements</h3>
                    <ul className="space-y-2 text-sm">
                      <li>• iOS 12+ or Android 8+</li>
                      <li>• Minimum 50MB storage</li>
                      <li>• Touch screen (recommended)</li>
                      <li>• Camera (for barcode scanning)</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-4">Installation</h3>
                    <ol className="space-y-2 text-sm">
                      <li>1. Download the app from your app store</li>
                      <li>2. Install and open the app</li>
                      <li>3. Log in with your business credentials</li>
                      <li>4. Start taking sales immediately</li>
                    </ol>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h4 className="font-semibold text-blue-900 mb-2">Offline Capability</h4>
                  <p className="text-sm text-blue-800">
                    The mobile app works completely offline. All sales are stored locally and synced to your account when you're back online. Perfect for areas with unreliable connectivity.
                  </p>
                </div>

                <Button size="lg" className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Download Mobile App (v1.0.0)
                </Button>

                <div className="text-sm text-gray-600">
                  <p>File size: ~45MB | Last updated: Apr 8, 2026</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Desktop App Details */}
        {selectedApp === "desktop" && (
          <div className="space-y-8">
            <Button
              variant="outline"
              onClick={() => setSelectedApp(null)}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Options
            </Button>

            <Card>
              <CardHeader>
                <CardTitle className="text-3xl">Desktop POS App</CardTitle>
                <CardDescription>Full-featured system for comprehensive management</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-semibold text-lg mb-4">System Requirements</h3>
                    <ul className="space-y-2 text-sm">
                      <li>• Windows 10+ or macOS 10.13+</li>
                      <li>• Minimum 200MB storage</li>
                      <li>• 4GB RAM recommended</li>
                      <li>• Internet connection required</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-4">Installation</h3>
                    <ol className="space-y-2 text-sm">
                      <li>1. Download the installer for your OS</li>
                      <li>2. Run the installer and follow prompts</li>
                      <li>3. Launch the application</li>
                      <li>4. Log in with your business credentials</li>
                    </ol>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
                    <CardContent className="pt-6">
                      <BarChart3 className="h-8 w-8 text-blue-600 mb-2" />
                      <h4 className="font-semibold text-sm mb-1">Advanced Analytics</h4>
                      <p className="text-xs text-gray-700">Real-time sales trends and insights</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
                    <CardContent className="pt-6">
                      <Users className="h-8 w-8 text-purple-600 mb-2" />
                      <h4 className="font-semibold text-sm mb-1">Team Management</h4>
                      <p className="text-xs text-gray-700">Track attendant performance</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-green-50 to-green-100">
                    <CardContent className="pt-6">
                      <Download className="h-8 w-8 text-green-600 mb-2" />
                      <h4 className="font-semibold text-sm mb-1">Export Reports</h4>
                      <p className="text-xs text-gray-700">CSV, PDF, and Excel formats</p>
                    </CardContent>
                  </Card>
                </div>

                <Button size="lg" className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Download Desktop App (v1.0.0)
                </Button>

                <div className="text-sm text-gray-600">
                  <p>Windows: ~120MB | macOS: ~130MB | Last updated: Apr 8, 2026</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

// Missing import - add to imports
const Users = ({ className }: { className: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4.354a4 4 0 110 5.292M15 12H9m6 0a6 6 0 11-12 0 6 6 0 0112 0z"
    />
  </svg>
);
