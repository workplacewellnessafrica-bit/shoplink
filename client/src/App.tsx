import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useRoutePersistence } from "./hooks/useRoutePersistence";
import Home from "./pages/Home";
import AdminPanel from "./pages/AdminPanel";
import Storefront from "./pages/Storefront";
import CustomerPortal from "./pages/CustomerPortal";
import OrderConfirmation from "./pages/OrderConfirmation";
import CustomerOTPPortal from "./pages/CustomerOTPPortal";
import POSSystem from "./pages/POSSystem";
import DayEndReconciliation from "./pages/DayEndReconciliation";
import Settings from "./pages/Settings";
import StoreOnboarding from "./pages/StoreOnboarding";
import POSDownload from "./pages/POSDownload";
import Tools from "./pages/Tools";
import MobilePOS from "./pages/MobilePOS";
import DesktopPOS from "./pages/DesktopPOS";
import BusinessSetup from "./pages/BusinessSetup";
import { Downloads } from "./pages/Downloads";

function Router() {
  // Persist current route to localStorage
  useRoutePersistence();

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/admin" component={AdminPanel} />
      <Route path="/store/:slug" component={Storefront} />
      <Route path="/orders" component={CustomerPortal} />
      <Route path="/order/confirmation" component={OrderConfirmation} />
      <Route path="/customer/login" component={CustomerOTPPortal} />
      <Route path="/customer/orders" component={CustomerPortal} />
      <Route path="/pos" component={POSSystem} />
      <Route path="/reconciliation" component={DayEndReconciliation} />
      <Route path="/settings" component={Settings} />
      <Route path="/onboarding" component={StoreOnboarding} />
      <Route path="/pos-download" component={POSDownload} />
      <Route path="/tools" component={Tools} />
      <Route path="/mobile-pos" component={MobilePOS} />
      <Route path="/desktop-pos" component={DesktopPOS} />
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
