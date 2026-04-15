import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useRoutePersistence } from "./hooks/useRoutePersistence";
import { lazy, Suspense } from "react";
import Home from "./pages/Home";
import Storefront from "./pages/Storefront";
import { Loader2 } from "lucide-react";
import { Toaster } from "sonner";

// Lazy load heavy pages for better initial load time
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const CustomerPortal = lazy(() => import("./pages/CustomerPortal"));
const POSSystem = lazy(() => import("./pages/POSSystem"));
const DayEndReconciliation = lazy(() => import("./pages/DayEndReconciliation"));
const MobilePOS = lazy(() => import("./pages/MobilePOS"));
const DesktopPOS = lazy(() => import("./pages/DesktopPOS"));

// Regular imports for lighter pages
import OrderConfirmation from "./pages/OrderConfirmation";
import CustomerOTPPortal from "./pages/CustomerOTPPortal";
import Settings from "./pages/Settings";
import StoreOnboarding from "./pages/StoreOnboarding";
import POSDownload from "./pages/POSDownload";
import Tools from "./pages/Tools";
import BusinessSetup from "./pages/BusinessSetup";
import { Downloads } from "./pages/Downloads";

// Loading fallback component
function PageLoader() {
  return (
    <div className="flex items-center justify-center h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

function Router() {
  // Persist current route to localStorage
  useRoutePersistence();

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/admin">
        <Suspense fallback={<PageLoader />}>
          <AdminPanel />
        </Suspense>
      </Route>
      <Route path="/store/:slug" component={Storefront} />
      <Route path="/orders">
        <Suspense fallback={<PageLoader />}>
          <CustomerPortal />
        </Suspense>
      </Route>
      <Route path="/order/confirmation" component={OrderConfirmation} />
      <Route path="/customer/login" component={CustomerOTPPortal} />
      <Route path="/customer/orders">
        <Suspense fallback={<PageLoader />}>
          <CustomerPortal />
        </Suspense>
      </Route>
      <Route path="/pos">
        <Suspense fallback={<PageLoader />}>
          <POSSystem />
        </Suspense>
      </Route>
      <Route path="/reconciliation">
        <Suspense fallback={<PageLoader />}>
          <DayEndReconciliation />
        </Suspense>
      </Route>
      <Route path="/settings" component={Settings} />
      <Route path="/onboarding" component={StoreOnboarding} />
      <Route path="/pos-download" component={POSDownload} />
      <Route path="/tools" component={Tools} />
      <Route path="/mobile-pos">
        <Suspense fallback={<PageLoader />}>
          <MobilePOS />
        </Suspense>
      </Route>
      <Route path="/desktop-pos">
        <Suspense fallback={<PageLoader />}>
          <DesktopPOS />
        </Suspense>
      </Route>
      <Route path="/business-setup" component={BusinessSetup} />
      <Route path="/downloads" component={Downloads} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster richColors position="top-right" />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
