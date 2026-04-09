import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

export function useBusinessAccess() {
  const [, setLocation] = useLocation();
  const { data: user, isLoading: userLoading } = trpc.auth.me.useQuery();
  const { data: businesses, isLoading: businessLoading } = trpc.business.getAll.useQuery(
    undefined,
    { enabled: !!user }
  );

  const handleBusinessAccess = async () => {
    if (userLoading || businessLoading) return;

    if (!user) {
      const loginUrl = new URL(window.location.origin);
      loginUrl.pathname = "/api/oauth/login";
      loginUrl.searchParams.set("returnTo", window.location.origin + "/admin");
      window.location.href = loginUrl.toString();
      return;
    }

    const myBusiness = businesses?.find(b => b.userId === user.id);
    if (myBusiness) {
      setLocation("/admin");
    } else {
      setLocation("/business-setup");
    }
  };

  return {
    handleBusinessAccess,
    isLoading: userLoading || businessLoading,
    hasUser: !!user,
    hasBusiness: !!businesses?.some(b => b.userId === user?.id),
  };
}
