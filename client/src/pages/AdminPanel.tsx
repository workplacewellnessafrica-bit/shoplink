import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowLeft,
  Box,
  Edit,
  ExternalLink,
  Loader2,
  Package,
  Plus,
  ShoppingBag,
  Store,
  Trash2,
  Upload,
} from "lucide-react";
import { useRef, useState } from "react";
import { Link } from "wouter";

// ─── Image Upload Helper ───────────────────────────────────────────────────────
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-purple-100 text-purple-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

// ─── Setup Store Form ─────────────────────────────────────────────────────────
function SetupStoreForm({ onSuccess }: { onSuccess: () => void }) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const utils = trpc.useUtils();
  const createBusiness = trpc.business.create.useMutation({
    onSuccess: () => {
      toast.success("Store created successfully!");
      utils.business.getMine.invalidate();
      onSuccess();
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        createBusiness.mutate({ name, slug: slug || undefined, description, whatsappNumber: whatsapp });
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Store Name *</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="My Boutique" required />
        </div>
        <div className="space-y-1.5">
          <Label>Custom URL Slug</Label>
          <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="my-boutique (auto-generated)" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Description</Label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Tell customers about your store..." rows={3} />
      </div>
      <div className="space-y-1.5">
        <Label>WhatsApp Number *</Label>
        <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+1234567890" required />
        <p className="text-xs text-muted-foreground">Include country code. Orders will be sent here.</p>
      </div>
      <Button type="submit" className="w-full" disabled={createBusiness.isPending}>
        {createBusiness.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Store className="mr-2 h-4 w-4" />}
        Create My Store
      </Button>
    </form>
  );
}

// ─── Product Form ─────────────────────────────────────────────────────────────
function ProductForm({
  product,
  onSuccess,
  onClose,
}: {
  product?: any;
  onSuccess: () => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(product?.price ?? "");
  const [stock, setStock] = useState(product?.stock?.toString() ?? "0");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(product?.imageUrl ?? null);
  const fileRef = useRef<HTMLInputElement>(null);
  const utils = trpc.useUtils();

  const createProduct = trpc.product.create.useMutation({
    onSuccess: () => { toast.success("Product added!"); utils.product.listMine.invalidate(); onSuccess(); onClose(); },
    onError: (e) => toast.error(e.message),
  });
  const updateProduct = trpc.product.update.useMutation({
    onSuccess: () => { toast.success("Product updated!"); utils.product.listMine.invalidate(); onSuccess(); onClose(); },
    onError: (e) => toast.error(e.message),
  });

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let imageBase64: string | undefined;
    let imageMimeType: string | undefined;
    if (imageFile) {
      imageBase64 = await fileToBase64(imageFile);
      imageMimeType = imageFile.type;
    }
    if (product) {
      updateProduct.mutate({ id: product.id, name, description, price, stock: parseInt(stock), imageBase64, imageMimeType });
    } else {
      createProduct.mutate({ name, description, price, stock: parseInt(stock), imageBase64, imageMimeType });
    }
  };

  const isPending = createProduct.isPending || updateProduct.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Product Image</Label>
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
        >
          {preview ? (
            <img src={preview} alt="Preview" className="mx-auto h-32 object-contain rounded" />
          ) : (
            <div className="py-4">
              <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Click to upload image</p>
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
      </div>
      <div className="space-y-1.5">
        <Label>Product Name *</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="space-y-1.5">
        <Label>Description</Label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Price *</Label>
          <Input type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label>Stock Quantity *</Label>
          <Input type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} required />
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
        <Button type="submit" className="flex-1" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {product ? "Update Product" : "Add Product"}
        </Button>
      </div>
    </form>
  );
}

// ─── Store Profile Editor ─────────────────────────────────────────────────────
function StoreProfileEditor({ business }: { business: any }) {
  const [name, setName] = useState(business.name);
  const [description, setDescription] = useState(business.description ?? "");
  const [whatsapp, setWhatsapp] = useState(business.whatsappNumber);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(business.logoUrl);
  const [coverPreview, setCoverPreview] = useState<string | null>(business.coverUrl);
  const logoRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);
  const utils = trpc.useUtils();

  const updateBusiness = trpc.business.update.useMutation({
    onSuccess: () => { toast.success("Store updated!"); utils.business.getMine.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const uploadImage = trpc.business.uploadImage.useMutation({
    onSuccess: () => { toast.success("Image uploaded!"); utils.business.getMine.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const handleImageChange = (type: "logo" | "cover") => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (type === "logo") { setLogoFile(file); setLogoPreview(URL.createObjectURL(file)); }
    else { setCoverFile(file); setCoverPreview(URL.createObjectURL(file)); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateBusiness.mutateAsync({ name, description, whatsappNumber: whatsapp });
    if (logoFile) {
      const base64 = await fileToBase64(logoFile);
      await uploadImage.mutateAsync({ type: "logo", base64, mimeType: logoFile.type });
    }
    if (coverFile) {
      const base64 = await fileToBase64(coverFile);
      await uploadImage.mutateAsync({ type: "cover", base64, mimeType: coverFile.type });
    }
  };

  const isPending = updateBusiness.isPending || uploadImage.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-3">
        <Label className="text-sm font-medium">Cover Image</Label>
        <div
          onClick={() => coverRef.current?.click()}
          className="relative h-40 rounded-xl border-2 border-dashed border-border cursor-pointer overflow-hidden hover:border-primary/50 transition-colors bg-muted"
        >
          {coverPreview ? (
            <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Upload cover image</p>
            </div>
          )}
        </div>
        <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange("cover")} />
      </div>

      <div className="flex items-start gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Logo</Label>
          <div
            onClick={() => logoRef.current?.click()}
            className="w-20 h-20 rounded-xl border-2 border-dashed border-border cursor-pointer overflow-hidden hover:border-primary/50 transition-colors bg-muted flex items-center justify-center"
          >
            {logoPreview ? (
              <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <Upload className="h-6 w-6 text-muted-foreground" />
            )}
          </div>
          <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange("logo")} />
        </div>
        <div className="flex-1 space-y-3">
          <div className="space-y-1.5">
            <Label>Store Name *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label>WhatsApp Number *</Label>
            <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} required />
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Description</Label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
      </div>

      <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
        <Store className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Your store URL:</span>
        <Link href={`/store/${business.slug}`} className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
          /store/{business.slug} <ExternalLink className="h-3 w-3" />
        </Link>
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save Changes
      </Button>
    </form>
  );
}

// ─── Main Admin Panel ─────────────────────────────────────────────────────────
export default function AdminPanel() {
  const { user, loading, isAuthenticated } = useAuth();
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const utils = trpc.useUtils();

  const { data: business, isLoading: bizLoading } = trpc.business.getMine.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: products, isLoading: productsLoading } = trpc.product.listMine.useQuery(undefined, {
    enabled: isAuthenticated && !!business,
  });
  const { data: orders, isLoading: ordersLoading } = trpc.order.getByBusiness.useQuery(undefined, {
    enabled: isAuthenticated && !!business,
  });

  const deleteProduct = trpc.product.delete.useMutation({
    onSuccess: () => { toast.success("Product removed"); utils.product.listMine.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const updateStatus = trpc.order.updateStatus.useMutation({
    onSuccess: () => { toast.success("Order status updated"); utils.order.getByBusiness.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  if (loading || bizLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-8">
        <div className="text-center space-y-2">
          <Store className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-display font-semibold">Business Admin Panel</h1>
          <p className="text-muted-foreground">Sign in to manage your store, products, and orders.</p>
        </div>
        <Button size="lg" asChild>
          <a href={getLoginUrl()}>Sign In with Manus</a>
        </Button>
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
          <ArrowLeft className="h-3 w-3" /> Back to ShopLink
        </Link>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <Store className="h-12 w-12 text-primary mx-auto mb-4" />
            <h1 className="text-3xl font-display font-semibold">Create Your Store</h1>
            <p className="text-muted-foreground mt-2">Set up your storefront to start selling.</p>
          </div>
          <Card>
            <CardContent className="pt-6">
              <SetupStoreForm onSuccess={() => {}} />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const lowStockProducts = products?.filter((p) => p.stock < 5 && p.isActive) ?? [];
  const pendingOrders = orders?.filter((o) => o.status === "pending") ?? [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-40">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            {business.logoUrl ? (
              <img src={business.logoUrl} alt={business.name} className="h-8 w-8 rounded-lg object-cover" />
            ) : (
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Store className="h-4 w-4 text-primary" />
              </div>
            )}
            <div>
              <p className="font-semibold text-sm">{business.name}</p>
              <p className="text-xs text-muted-foreground">Admin Panel</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/store/${business.slug}`}>
                <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                View Store
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
                ShopLink Home
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-8">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{products?.filter((p) => p.isActive).length ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Active Products</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <ShoppingBag className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pendingOrders.length}</p>
                  <p className="text-xs text-muted-foreground">Pending Orders</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Box className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{orders?.length ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Total Orders</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{lowStockProducts.length}</p>
                  <p className="text-xs text-muted-foreground">Low Stock</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Low Stock Alert */}
        {lowStockProducts.length > 0 && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-amber-900">Low Stock Alert</p>
              <p className="text-sm text-amber-700 mt-0.5">
                {lowStockProducts.map((p) => `${p.name} (${p.stock} left)`).join(", ")}
              </p>
            </div>
          </div>
        )}

        {/* Main Tabs */}
        <Tabs defaultValue="products">
          <TabsList className="mb-6">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="store">Store Profile</TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-display font-semibold">Product Catalog</h2>
              <Dialog open={productDialogOpen} onOpenChange={(o) => { setProductDialogOpen(o); if (!o) setEditingProduct(null); }}>
                <DialogTrigger asChild>
                  <Button size="sm" onClick={() => setEditingProduct(null)}>
                    <Plus className="h-4 w-4 mr-1.5" /> Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
                  </DialogHeader>
                  <ProductForm
                    product={editingProduct}
                    onSuccess={() => {}}
                    onClose={() => { setProductDialogOpen(false); setEditingProduct(null); }}
                  />
                </DialogContent>
              </Dialog>
            </div>

            {productsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-48 bg-muted rounded-xl animate-pulse" />
                ))}
              </div>
            ) : products?.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No products yet</p>
                <p className="text-sm mt-1">Add your first product to start selling</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products?.map((product) => (
                  <Card key={product.id} className={`overflow-hidden ${!product.isActive ? "opacity-60" : ""}`}>
                    {product.imageUrl ? (
                      <div className="h-40 overflow-hidden bg-muted">
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="h-40 bg-muted flex items-center justify-center">
                        <Package className="h-10 w-10 text-muted-foreground/30" />
                      </div>
                    )}
                    <CardContent className="pt-3 pb-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold truncate">{product.name}</p>
                          <p className="text-primary font-bold">${parseFloat(product.price).toFixed(2)}</p>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => { setEditingProduct(product); setProductDialogOpen(true); }}
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => deleteProduct.mutate({ id: product.id })}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge
                          variant="secondary"
                          className={product.stock < 5 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}
                        >
                          {product.stock < 5 && <AlertTriangle className="h-3 w-3 mr-1" />}
                          {product.stock} in stock
                        </Badge>
                        {!product.isActive && <Badge variant="outline">Inactive</Badge>}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <h2 className="text-xl font-display font-semibold mb-4">Incoming Orders</h2>
            {ordersLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />)}
              </div>
            ) : orders?.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <ShoppingBag className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No orders yet</p>
                <p className="text-sm mt-1">Orders will appear here once customers check out</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders?.map((order) => (
                  <Card key={order.id}>
                    <CardContent className="pt-4 pb-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">Order #{order.id}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[order.status]}`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {order.customerName} · {order.customerPhone}
                          </p>
                          <p className="text-xs text-muted-foreground truncate max-w-xs">{order.deliveryAddress}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-primary">${parseFloat(order.totalAmount).toFixed(2)}</span>
                          <Select
                            value={order.status}
                            onValueChange={(val) =>
                              updateStatus.mutate({ orderId: order.id, status: val as "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" })
                            }
                          >
                            <SelectTrigger className="w-36 h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"].map((s) => (
                                <SelectItem key={s} value={s} className="text-xs">
                                  {s.charAt(0).toUpperCase() + s.slice(1)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Store Profile Tab */}
          <TabsContent value="store">
            <div className="max-w-2xl">
              <h2 className="text-xl font-display font-semibold mb-6">Store Profile</h2>
              <Card>
                <CardContent className="pt-6">
                  <StoreProfileEditor business={business} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
