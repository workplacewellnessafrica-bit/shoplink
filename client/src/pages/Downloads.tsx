import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Smartphone, Monitor, Package } from "lucide-react";

export function Downloads() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Download ShopLink Apps</h1>
          <p className="text-lg text-muted-foreground">
            Get the tools you need to manage your business on any device
          </p>
        </div>

        {/* Apps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Mobile POS */}
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Smartphone className="w-8 h-8 text-primary" />
                <CardTitle>Mobile POS</CardTitle>
              </div>
              <p className="text-sm text-muted-foreground">
                Fast, intuitive point-of-sale system for your phone
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold">Features:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>✓ Offline mode support</li>
                  <li>✓ Multiple payment methods</li>
                  <li>✓ Real-time inventory sync</li>
                  <li>✓ Receipt printing</li>
                  <li>✓ Sales analytics</li>
                </ul>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">System Requirements:</p>
                <p className="text-xs text-muted-foreground">
                  Android 8.0+ | iOS 13.0+
                </p>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Play Store
                </Button>
                <Button variant="outline" className="flex-1" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  App Store
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Customer App */}
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Smartphone className="w-8 h-8 text-primary" />
                <CardTitle>Customer App</CardTitle>
              </div>
              <p className="text-sm text-muted-foreground">
                Browse and shop from local businesses
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold">Features:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>✓ Browse local stores</li>
                  <li>✓ Easy checkout via WhatsApp</li>
                  <li>✓ Order tracking</li>
                  <li>✓ Saved favorites</li>
                  <li>✓ Order history</li>
                </ul>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">System Requirements:</p>
                <p className="text-xs text-muted-foreground">
                  Android 8.0+ | iOS 13.0+
                </p>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Play Store
                </Button>
                <Button variant="outline" className="flex-1" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  App Store
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Desktop Dashboard */}
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Monitor className="w-8 h-8 text-primary" />
                <CardTitle>Desktop Dashboard</CardTitle>
              </div>
              <p className="text-sm text-muted-foreground">
                Comprehensive business management for Windows & Mac
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold">Features:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>✓ Advanced analytics</li>
                  <li>✓ Inventory management</li>
                  <li>✓ Team management</li>
                  <li>✓ Sales reports</li>
                  <li>✓ Multi-store support</li>
                </ul>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">System Requirements:</p>
                <p className="text-xs text-muted-foreground">
                  Windows 10+ | macOS 10.13+
                </p>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Windows
                </Button>
                <Button variant="outline" className="flex-1" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  macOS
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Web App */}
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Package className="w-8 h-8 text-primary" />
                <CardTitle>Web App</CardTitle>
              </div>
              <p className="text-sm text-muted-foreground">
                Access ShopLink from any browser
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold">Features:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>✓ No installation required</li>
                  <li>✓ Works on any device</li>
                  <li>✓ Always up-to-date</li>
                  <li>✓ Full feature access</li>
                  <li>✓ Responsive design</li>
                </ul>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">System Requirements:</p>
                <p className="text-xs text-muted-foreground">
                  Modern web browser with JavaScript enabled
                </p>
              </div>
              <Button className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Open Web App
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Release Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Latest Releases</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-l-4 border-primary pl-4">
              <h4 className="font-semibold">Version 1.0.0 - April 10, 2026</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Initial release with core features: product management, POS system, customer portal, team management, and analytics.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Support */}
        <div className="mt-12 text-center">
          <h3 className="text-lg font-semibold mb-4">Need Help?</h3>
          <p className="text-muted-foreground mb-4">
            Check out our documentation or contact support
          </p>
          <div className="flex gap-4 justify-center">
            <Button variant="outline">Documentation</Button>
            <Button variant="outline">Contact Support</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
