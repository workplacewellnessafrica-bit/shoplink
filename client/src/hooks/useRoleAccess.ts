import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";

export type UserRole = "admin" | "user" | "attendant" | "accountant";

interface RolePermissions {
  admin: string[];
  user: string[];
  attendant: string[];
  accountant: string[];
}

const ROLE_PERMISSIONS: RolePermissions = {
  admin: [
    "/admin",
    "/store",
    "/pos",
    "/reconciliation",
    "/settings",
    "/tools",
  ],
  user: [
    "/",
    "/store",
    "/customer/login",
    "/customer/orders",
    "/settings",
    "/tools",
  ],
  attendant: [
    "/pos",
    "/settings",
  ],
  accountant: [
    "/reconciliation",
    "/settings",
  ],
};

export function useRoleAccess(requiredRole?: UserRole | UserRole[]) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const userRole = (user?.role as UserRole) || "user";
  const requiredRoles = Array.isArray(requiredRole) ? requiredRole : requiredRole ? [requiredRole] : [];

  const hasAccess = requiredRoles.length === 0 || requiredRoles.includes(userRole);

  useEffect(() => {
    if (!hasAccess && requiredRoles.length > 0) {
      setLocation("/");
    }
  }, [hasAccess, requiredRoles, setLocation]);

  return {
    hasAccess,
    userRole,
    canAccess: (path: string) => {
      const permissions = ROLE_PERMISSIONS[userRole] || [];
      return permissions.some((p) => path.startsWith(p));
    },
  };
}

export function checkRoleAccess(role: UserRole, requiredRole?: UserRole | UserRole[]): boolean {
  if (!requiredRole) return true;
  const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  return requiredRoles.includes(role);
}
