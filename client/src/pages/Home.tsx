import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  ExternalLink,
  Loader2,
  Package,
  ShoppingBag,
  Store,
  Zap,
  Smartphone,
  Monitor,
  DollarSign,
  BarChart3,
  MessageSquare,
  Wifi,
} from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { data: businesses, isLoading } = trpc.business.getAll.useQuery();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <ShoppingBag className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display font-semibold text-lg">ShopLink</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/customer/login">My Orders</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/tools">Tools</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/business-setup">Create Business</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/settings">Settings</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/20 py-20 md:py-28">
        <div className="container text-center max-w-3xl mx-auto">
          <Badge variant="secondary" className="mb-6 text-xs px-3 py-1">
            Multi-tenant Commerce Platform
          </Badge>
          <h1 className="text-5xl md:text-6xl font-display font-bold leading-tight mb-6">
            Discover Local
            <span className="text-primary italic"> Businesses</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            Browse curated storefronts from independent businesses. Shop directly, checkout via WhatsApp, and support your community.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" asChild>
              <a href="#stores">
                Start Shopping <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="#features">
                Learn More
              </a>
            </Button>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-accent/30 rounded-full blur-3xl" />
      </section>

      {/* Feature Highlights */}
      <section id="features" className="py-16 border-b bg-card">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold mb-2">Everything Your Business Needs</h2>
            <p className="text-muted-foreground">Complete commerce platform for modern businesses</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: ShoppingBag, title: "Browse & Shop", desc: "Explore products from multiple local businesses in one place." },
              { icon: Zap, title: "WhatsApp Checkout", desc: "Place orders instantly — your cart is sent directly to the business." },
              { icon: Package, title: "Track Orders", desc: "Register with your phone number to view your order history anytime." },
              { icon: Smartphone, title: "Mobile POS", desc: "Fast, intuitive point-of-sale system designed for speed and accuracy." },
              { icon: Monitor, title: "Desktop Dashboard", desc: "Comprehensive analytics and inventory management for your business." },
              { icon: DollarSign, title: "Payment Methods", desc: "Support multiple payment options including M-Pesa and cash." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4 p-6 bg-background rounded-xl border hover:border-primary/30 transition-colors">
                <div className="p-2.5 bg-primary/10 rounded-xl shrink-0">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{title}</h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stores Grid */}
      <section id="stores" className="py-16">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-display font-semibold">Featured Stores</h2>
              <p className="text-muted-foreground mt-1">From small kiosks to established businesses — find what you need</p>
            </div>
            {businesses && businesses.length > 0 && (
              <Badge variant="secondary">{businesses.length} store{businesses.length !== 1 ? "s" : ""}</Badge>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-muted rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : businesses?.length === 0 ? (
            <div className="text-center py-20">
              <Store className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-xl font-display font-semibold mb-2">No stores yet</h3>
              <p className="text-muted-foreground mb-6">Be the first to list your business on ShopLink.</p>
              <Button asChild>
                <Link href="/admin">
                  <Store className="mr-2 h-4 w-4" />
                  Create Your Store
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {businesses?.map((business) => (
                <Link key={business.id} href={`/store/${business.slug}`}>
                  <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer border hover:border-primary/30 h-full">
                    {/* Cover */}
                    <div className="h-40 bg-gradient-to-br from-primary/10 to-accent/20 relative overflow-hidden">
                      {business.coverUrl ? (
                        <img
                          src={business.coverUrl}
                          alt={business.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Store className="h-12 w-12 text-primary/20" />
                        </div>
                      )}
                      {/* Logo overlay */}
                      <div className="absolute bottom-3 left-3">
                        {business.logoUrl ? (
                          <img
                            src={business.logoUrl}
                            alt={business.name}
                            className="h-12 w-12 rounded-xl object-cover border-2 border-white shadow-md"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-xl bg-white shadow-md flex items-center justify-center">
                            <Store className="h-6 w-6 text-primary" />
                          </div>
                        )}
                      </div>
                    </div>
                    <CardContent className="pt-4 pb-5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-display font-semibold text-lg leading-tight group-hover:text-primary transition-colors">
                            {business.name}
                          </h3>
                          {business.description && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {business.description}
                            </p>
                          )}
                        </div>
                        <ExternalLink className="h-4 w-4 text-muted-foreground/50 shrink-0 mt-1 group-hover:text-primary transition-colors" />
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          Visit Store
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA for businesses */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-display font-bold mb-4">Ready to Take Control?</h2>
          <p className="text-primary-foreground/80 mb-8">
            Join businesses across the region managing sales, inventory, and cash flow seamlessly. Create your free storefront in minutes.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/admin">
              <Store className="mr-2 h-4 w-4" />
              Create Your Store — Free
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 bg-card">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
              <ShoppingBag className="h-3 w-3 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">ShopLink</span>
            <span>· Multi-Business Commerce Platform</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/admin" className="hover:text-foreground transition-colors">For Businesses</Link>
            <Link href="/orders" className="hover:text-foreground transition-colors">Track Orders</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
