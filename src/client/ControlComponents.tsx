"use client";

import { type ReactNode, useEffect } from "react";
import { useAuth, useHasAnyRole } from "./AuthProvider";

export interface SignedInProps {
  /** Content to render when the user is signed in */
  children: ReactNode;
  /**
   * Optional fallback to render while loading.
   * If not provided, nothing is rendered during loading.
   */
  fallback?: ReactNode;
}

/**
 * Renders its children only when the user is signed in.
 *
 * @example
 * ```tsx
 * "use client";
 *
 * <SignedIn>
 *   <UserButton />
 *   <p>Welcome back!</p>
 * </SignedIn>
 * ```
 */
export function SignedIn({ children, fallback }: SignedInProps) {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return fallback ? <>{fallback}</> : null;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

SignedIn.displayName = "SignedIn";

export interface SignedOutProps {
  /** Content to render when the user is signed out */
  children: ReactNode;
  /**
   * Optional fallback to render while loading.
   * If not provided, nothing is rendered during loading.
   */
  fallback?: ReactNode;
}

/**
 * Renders its children only when the user is signed out.
 *
 * @example
 * ```tsx
 * "use client";
 *
 * <SignedOut>
 *   <SignInButton />
 *   <p>Please sign in to continue.</p>
 * </SignedOut>
 * ```
 */
export function SignedOut({ children, fallback }: SignedOutProps) {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return fallback ? <>{fallback}</> : null;
  }

  if (isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

SignedOut.displayName = "SignedOut";

export interface RedirectToSignInProps {
  /** URL to redirect to after sign in (defaults to current URL) */
  callbackUrl?: string;
}

/**
 * Redirects to the Auth.js sign in page.
 * Use this component to protect routes that require authentication.
 *
 * @example
 * ```tsx
 * "use client";
 *
 * function ProtectedPage() {
 *   const { isAuthenticated } = useAuth();
 *
 *   if (!isAuthenticated) {
 *     return <RedirectToSignIn />;
 *   }
 *
 *   return <div>Protected content</div>;
 * }
 * ```
 */
export function RedirectToSignIn({ callbackUrl }: RedirectToSignInProps) {
  const { isLoading, isAuthenticated, signIn } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      signIn({ callbackUrl });
    }
  }, [isLoading, isAuthenticated, signIn, callbackUrl]);

  return null;
}

RedirectToSignIn.displayName = "RedirectToSignIn";

export interface ProtectProps {
  /** Content to render when the user is authenticated */
  children: ReactNode;
  /**
   * What to render when the user is not authenticated.
   * Can be a ReactNode or a function that receives signIn.
   * @default Redirects to sign in
   */
  fallback?: ReactNode | ((signIn: () => void) => ReactNode);
  /**
   * What to render while checking authentication status.
   */
  loading?: ReactNode;
  /**
   * Required roles. User must have at least one of these roles.
   * Checks both resource roles and realm roles.
   */
  roles?: string[];
  /**
   * What to render when user doesn't have required roles.
   */
  unauthorizedFallback?: ReactNode;
}

/**
 * Protects content, showing it only to authenticated users.
 * Optionally can require specific roles.
 *
 * @example
 * ```tsx
 * "use client";
 *
 * // Basic protection
 * <Protect>
 *   <Dashboard />
 * </Protect>
 *
 * // With custom fallback
 * <Protect fallback={<SignIn />}>
 *   <Dashboard />
 * </Protect>
 *
 * // With role requirement
 * <Protect roles={['admin']} unauthorizedFallback={<AccessDenied />}>
 *   <AdminPanel />
 * </Protect>
 * ```
 */
export function Protect({
  children,
  fallback,
  loading,
  roles,
  unauthorizedFallback,
}: ProtectProps) {
  const { isLoading, isAuthenticated, signIn } = useAuth();
  const hasRequiredRole = useHasAnyRole(roles ?? []);

  if (isLoading) {
    return loading ? <>{loading}</> : null;
  }

  if (!isAuthenticated) {
    if (fallback === undefined) {
      // Default: redirect to sign in
      signIn();
      return null;
    }
    if (typeof fallback === "function") {
      return <>{fallback(() => signIn())}</>;
    }
    return <>{fallback}</>;
  }

  // Check roles if specified
  if (roles && roles.length > 0 && !hasRequiredRole) {
    return unauthorizedFallback ? <>{unauthorizedFallback}</> : null;
  }

  return <>{children}</>;
}

Protect.displayName = "Protect";
