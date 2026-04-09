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
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Navigation */}
      <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center">
              <span className="text-lg">🌿</span>
            </div>
            <span className="font-display font-bold text-lg text-white">ShopLink</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild className="text-slate-300 hover:text-white">
              <Link href="/customer/login">My Orders</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild className="text-slate-300 hover:text-white">
              <Link href="/tools">Tools</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild className="text-slate-300 hover:text-white">
              <Link href="/settings">Settings</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-950 py-20 md:py-28">
        <div className="container text-center max-w-3xl mx-auto">
          <Badge variant="secondary" className="mb-6 text-xs px-3 py-1 bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
            🇰🇪 BUILT FOR KENYAN BUSINESSES
          </Badge>
          <h1 className="text-5xl md:text-7xl font-display font-bold leading-tight mb-6">
            Record-keeping that
            <span className="text-emerald-400 block"> actually works</span>
            <span className="text-white">for you</span>
          </h1>
          <p className="text-lg text-slate-300 mb-8 leading-relaxed">
            From kibanda to supermarket. Track sales, expenses, stock and cash flow — with M-Pesa built in.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" asChild className="bg-emerald-500 hover:bg-emerald-600 text-white border-2 border-dashed border-emerald-400">
              <a href="#stores">
                🚀 Start Free — No credit card
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-2 border-dashed border-slate-600 text-white hover:bg-slate-900">
              <a href="#demo">
                👀 Try a demo
              </a>
            </Button>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-16 bg-slate-950 border-b border-slate-800">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-2">Try a Live Demo</h2>
            <p className="text-slate-400">Real data, real inventory — just click and explore.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                emoji: "🥬",
                type: "Kibanda",
                name: "Mama Amina's Kiosk",
                desc: "Solo operator, fresh veggies & essentials, M-Pesa heavy",
                color: "border-emerald-500/30 hover:border-emerald-500",
                buttonColor: "bg-emerald-500 hover:bg-emerald-600",
              },
              {
                emoji: "🏪",
                type: "General Store",
                name: "Kariuku General Stores",
                desc: "Small team, wide inventory, 2 cashiers",
                color: "border-amber-500/30 hover:border-amber-500",
                buttonColor: "bg-amber-500 hover:bg-amber-600",
              },
              {
                emoji: "🛒",
                type: "Supermarket",
                name: "FreshMart Supermarket",
                desc: "Barcode scanner, multiple staff, card + M-Pesa",
                color: "border-blue-500/30 hover:border-blue-500",
                buttonColor: "bg-blue-500 hover:bg-blue-600",
              },
            ].map(({ emoji, type, name, desc, color, buttonColor }) => (
              <Card key={name} className={`bg-slate-900 border-2 border-dashed ${color} transition-all`}>
                <CardContent className="pt-6">
                  <div className="text-4xl mb-3">{emoji}</div>
                  <p className="text-xs text-slate-400 mb-2">{type}</p>
                  <h3 className="font-display font-bold text-lg mb-2">{name}</h3>
                  <p className="text-sm text-slate-400 mb-4">{desc}</p>
                  <Button size="sm" asChild className={`w-full ${buttonColor} text-white border-2 border-dashed`}>
                    <a href="#stores">▶ Open Demo</a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-slate-950">
        <div className="container">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-12">Everything your business needs</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Smartphone, title: "Mobile POS", desc: "Emoji-based item selection designed for speed. Sell in seconds." },
              { icon: Monitor, title: "Desktop Dashboard", desc: "Barcode scanner-ready. Watch live sales as staff ring them up." },
              { icon: DollarSign, title: "Cash & M-Pesa", desc: "Track both payment methods. Variance detection on day close." },
              { icon: BarChart3, title: "Daily Reconciliation", desc: "Count your float, close the day, auto-generate Excel reports." },
              { icon: MessageSquare, title: "SMS Alerts", desc: "Low-stock and daily summary SMS via Africa's Talking." },
              { icon: Wifi, title: "Works Offline", desc: "Sell even without internet. Syncs automatically when back online." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-emerald-500/30 transition-all">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="h-6 w-6 text-emerald-400" />
                </div>
                <h3 className="font-display font-bold text-lg mb-2">{title}</h3>
                <p className="text-slate-400 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stores Grid */}
      <section id="stores" className="py-16 bg-slate-950 border-t border-slate-800">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-display font-bold">Featured Stores</h2>
              <p className="text-slate-400 mt-1">Discover businesses in your community</p>
            </div>
            {businesses && businesses.length > 0 && (
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">{businesses.length} store{businesses.length !== 1 ? "s" : ""}</Badge>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-slate-800 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : businesses?.length === 0 ? (
            <div className="text-center py-20">
              <Store className="h-16 w-16 mx-auto text-slate-600 mb-4" />
              <h3 className="text-xl font-display font-bold mb-2">No stores yet</h3>
              <p className="text-slate-400 mb-6">Be the first to list your business on ShopLink.</p>
              <Button asChild className="bg-emerald-500 hover:bg-emerald-600 text-white">
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
                  <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer border border-slate-800 hover:border-emerald-500/30 h-full bg-slate-900">
                    {/* Cover */}
                    <div className="h-40 bg-gradient-to-br from-emerald-500/10 to-slate-800 relative overflow-hidden">
                      {business.coverUrl ? (
                        <img
                          src={business.coverUrl}
                          alt={business.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Store className="h-12 w-12 text-slate-700" />
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
                          <div className="h-12 w-12 rounded-xl bg-emerald-500 shadow-md flex items-center justify-center">
                            <Store className="h-6 w-6 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                    <CardContent className="pt-4 pb-5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-display font-bold text-lg leading-tight group-hover:text-emerald-400 transition-colors">
                            {business.name}
                          </h3>
                          {business.description && (
                            <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                              {business.description}
                            </p>
                          )}
                        </div>
                        <ExternalLink className="h-4 w-4 text-slate-600 shrink-0 mt-1 group-hover:text-emerald-400 transition-colors" />
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <Badge className="text-xs bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
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
      <section className="py-16 bg-gradient-to-r from-emerald-900/20 to-slate-950 border-t border-slate-800">
        <div className="container text-center max-w-2xl mx-auto bg-slate-900 border-2 border-dashed border-emerald-500/30 rounded-2xl p-12">
          <h2 className="text-3xl font-display font-bold mb-4">Ready to take control?</h2>
          <p className="text-slate-400 mb-8">
            Join businesses across Kenya tracking every shilling.
          </p>
          <Button size="lg" asChild className="bg-emerald-500 hover:bg-emerald-600 text-white border-2 border-dashed border-emerald-400">
            <Link href="/admin">
              🌿 Create Your Account — Free
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 bg-slate-950">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-emerald-500 flex items-center justify-center">
              <span className="text-xs">🌿</span>
            </div>
            <span className="font-semibold text-white">ShopLink</span>
            <span>· Made in Kenya, 2026</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/admin" className="hover:text-emerald-400 transition-colors">For Businesses</Link>
            <Link href="/customer/login" className="hover:text-emerald-400 transition-colors">Track Orders</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
