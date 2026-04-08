import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  Smartphone,
  Monitor,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Zap,
  Wifi,
  Database,
  RefreshCw,
  AlertCircle,
  Store,
} from "lucide-react";

export default function Tools() {
  const [expandedGuide, setExpandedGuide] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">Tools & Resources</h1>
            <p className="text-gray-600 mt-2">Download POS systems and learn how to integrate your inventory</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12 space-y-12">
        {/* My Store Section */}
        <section className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-lg p-8 text-white mb-12">
          <h2 className="text-2xl font-display font-bold mb-4">Ready to Start Selling?</h2>
          <p className="mb-6 text-indigo-100">
            Set up your store and start accepting orders from customers. Use the Desktop POS for full store management.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <a href="/admin" className="flex items-center gap-2">
              <Store className="h-4 w-4" />
              Go to My Store
            </a>
          </Button>
        </section>

        {/* POS Downloads Section */}
        <section>
          <div className="mb-8">
            <h2 className="text-2xl font-display font-bold mb-2">POS Systems</h2>
            <p className="text-gray-600">Choose the version that fits your business needs</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Mobile POS */}
            <Card className="hover:shadow-lg transition-all">
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <Smartphone className="h-12 w-12 text-indigo-600" />
                  <Badge className="bg-green-100 text-green-800">Android</Badge>
                </div>
                <CardTitle className="text-2xl">Mobile POS</CardTitle>
                <CardDescription>For on-the-go sales</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Zap className="h-5 w-5 text-indigo-600" />
                    <span className="text-sm">Quick sale interface with emoji categories</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Wifi className="h-5 w-5 text-indigo-600" />
                    <span className="text-sm">Works offline - sync when online</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Database className="h-5 w-5 text-indigo-600" />
                    <span className="text-sm">Real-time inventory deduction</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-indigo-600" />
                    <span className="text-sm">Low-stock alerts</span>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-xs text-blue-900">
                    <strong>Note:</strong> Mobile POS has read-only access to store settings. Use Desktop POS for full store management.
                  </p>
                </div>

                <Button className="w-full" size="lg">
                  <Download className="mr-2 h-4 w-4" />
                  Download Android App
                </Button>

                <p className="text-xs text-gray-600">File size: ~45MB | Requires Android 8+</p>
              </CardContent>
            </Card>

            {/* Desktop POS */}
            <Card className="hover:shadow-lg transition-all border-indigo-200 bg-gradient-to-br from-indigo-50 to-transparent">
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <Monitor className="h-12 w-12 text-indigo-600" />
                  <Badge className="bg-purple-100 text-purple-800">Full Access</Badge>
                </div>
                <CardTitle className="text-2xl">Desktop POS</CardTitle>
                <CardDescription>Complete store management</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <RefreshCw className="h-5 w-5 text-indigo-600" />
                    <span className="text-sm">Full inventory sync with web catalogue</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Database className="h-5 w-5 text-indigo-600" />
                    <span className="text-sm">Advanced inventory management</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-indigo-600" />
                    <span className="text-sm">Access to store admin section</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Zap className="h-5 w-5 text-indigo-600" />
                    <span className="text-sm">Day-end reconciliation & analytics</span>
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <p className="text-xs text-purple-900">
                    <strong>Recommended:</strong> Desktop POS gives you full control over your store and inventory.
                  </p>
                </div>

                <Button className="w-full" size="lg">
                  <Download className="mr-2 h-4 w-4" />
                  Download Windows/macOS
                </Button>

                <p className="text-xs text-gray-600">Windows: ~120MB | macOS: ~130MB | Requires Windows 10+ or macOS 10.13+</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Integration Guidelines Section */}
        <section>
          <div className="mb-8">
            <h2 className="text-2xl font-display font-bold mb-2">Integration Guidelines</h2>
            <p className="text-gray-600">Learn how to link your web catalogue and inventory with your POS system</p>
          </div>

          <div className="space-y-4">
            {[
              {
                id: "sync",
                title: "Inventory Sync Between Web & POS",
                icon: RefreshCw,
                content: (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-700">
                      Your web catalogue and POS system share the same inventory database. Here's how it works:
                    </p>
                    <ol className="space-y-3 text-sm">
                      <li className="flex gap-3">
                        <span className="font-semibold text-indigo-600 flex-shrink-0">1.</span>
                        <span>
                          <strong>Add products to your web store</strong> — Upload products with images, prices, and stock quantities through the web admin panel.
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <span className="font-semibold text-indigo-600 flex-shrink-0">2.</span>
                        <span>
                          <strong>Products appear in POS</strong> — Within seconds, all products are available in your POS system (both mobile and desktop).
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <span className="font-semibold text-indigo-600 flex-shrink-0">3.</span>
                        <span>
                          <strong>Sales deduct inventory</strong> — When you make a sale in POS, stock is automatically deducted from both POS and web systems.
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <span className="font-semibold text-indigo-600 flex-shrink-0">4.</span>
                        <span>
                          <strong>Real-time updates</strong> — All systems stay in sync. If stock runs out in POS, it's immediately unavailable on the web.
                        </span>
                      </li>
                    </ol>
                  </div>
                ),
              },
              {
                id: "desktop",
                title: "Desktop POS - Full Store Access",
                icon: Monitor,
                content: (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-700">
                      The Desktop POS application gives you complete access to your store management:
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-sm mb-2">Store Admin Access</h4>
                        <ul className="text-xs space-y-1 text-gray-700">
                          <li>• Add/edit/delete products</li>
                          <li>• Upload product images</li>
                          <li>• Set prices and stock levels</li>
                          <li>• Create product categories</li>
                        </ul>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-sm mb-2">Store Settings</h4>
                        <ul className="text-xs space-y-1 text-gray-700">
                          <li>• Configure payment methods</li>
                          <li>• Set tax rates</li>
                          <li>• Manage attendants</li>
                          <li>• View analytics</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                ),
              },
              {
                id: "mobile",
                title: "Mobile POS - Sales Only",
                icon: Smartphone,
                content: (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-700">
                      The Mobile POS is optimized for quick sales with limited store management:
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                      <div className="flex gap-3">
                        <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-sm">What you can do</p>
                          <p className="text-xs text-gray-700">Make sales, view products, check stock levels, see low-stock alerts</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-sm">What you cannot do</p>
                          <p className="text-xs text-gray-700">Add products, change prices, access store settings, view analytics</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ),
              },
              {
                id: "offline",
                title: "Offline Mode & Syncing",
                icon: RefreshCw,
                content: (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-700">
                      Mobile POS works offline, with automatic syncing when you're back online:
                    </p>
                    <div className="space-y-3">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h4 className="font-semibold text-sm text-green-900 mb-2">Offline Sales</h4>
                        <p className="text-xs text-green-800">
                          All sales made offline are stored locally. Once you reconnect, they automatically sync to your account and inventory is updated.
                        </p>
                      </div>
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <h4 className="font-semibold text-sm text-amber-900 mb-2">Important</h4>
                        <p className="text-xs text-amber-800">
                          Ensure your device has sufficient storage for offline sales. Sync regularly to keep inventory accurate across all systems.
                        </p>
                      </div>
                    </div>
                  </div>
                ),
              },
            ].map((guide) => {
              const Icon = guide.icon;
              const isExpanded = expandedGuide === guide.id;
              return (
                <Card
                  key={guide.id}
                  className="cursor-pointer hover:shadow-md transition-all"
                  onClick={() => setExpandedGuide(isExpanded ? null : guide.id)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon className="h-6 w-6 text-indigo-600" />
                        <CardTitle className="text-lg">{guide.title}</CardTitle>
                      </div>
                      <ArrowRight
                        className={`h-5 w-5 text-gray-400 transition-transform ${
                          isExpanded ? "rotate-90" : ""
                        }`}
                      />
                    </div>
                  </CardHeader>
                  {isExpanded && <CardContent>{guide.content}</CardContent>}
                </Card>
              );
            })}
          </div>
        </section>

        {/* Quick Start Section */}
        <section className="bg-white rounded-lg border p-8">
          <h2 className="text-2xl font-display font-bold mb-4">Quick Start</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-lg font-bold text-indigo-600">1</span>
              </div>
              <h3 className="font-semibold mb-2">Download POS</h3>
              <p className="text-sm text-gray-600">Choose Mobile or Desktop version above</p>
            </div>
            <div className="text-center">
              <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-lg font-bold text-indigo-600">2</span>
              </div>
              <h3 className="font-semibold mb-2">Install & Login</h3>
              <p className="text-sm text-gray-600">Use your business credentials</p>
            </div>
            <div className="text-center">
              <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-lg font-bold text-indigo-600">3</span>
              </div>
              <h3 className="font-semibold mb-2">Start Selling</h3>
              <p className="text-sm text-gray-600">Your inventory syncs automatically</p>
            </div>
          </div>
        </section>

        {/* Support Section */}
        <section className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-lg p-8 text-white">
          <h2 className="text-2xl font-display font-bold mb-4">Need Help?</h2>
          <p className="mb-6">
            Check our documentation or contact support for assistance with POS setup and inventory integration.
          </p>
          <div className="flex gap-4">
            <Button variant="secondary" size="lg">
              <BookOpen className="mr-2 h-4 w-4" />
              Read Documentation
            </Button>
            <Button variant="outline" size="lg" className="text-white border-white hover:bg-white/10">
              Contact Support
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
