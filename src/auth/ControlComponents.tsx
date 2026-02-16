import { type ReactNode, useEffect } from "react";
import { useAuth } from "./KeycloakAuthProvider";

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
  returnUrl?: string;
}

/**
 * Redirects to the Keycloak sign in page.
 * Use this component to protect routes that require authentication.
 *
 * @example
 * ```tsx
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
export function RedirectToSignIn({ returnUrl }: RedirectToSignInProps) {
  const { isLoading, isAuthenticated, signIn } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      signIn({ redirectUri: returnUrl });
    }
  }, [isLoading, isAuthenticated, signIn, returnUrl]);

  return null;
}

RedirectToSignIn.displayName = "RedirectToSignIn";

export interface RedirectToSignUpProps {
  /** URL to redirect to after sign up (defaults to current URL) */
  returnUrl?: string;
}

/**
 * Redirects to the Keycloak registration page.
 *
 * @example
 * ```tsx
 * <RedirectToSignUp returnUrl="/welcome" />
 * ```
 */
export function RedirectToSignUp({ returnUrl }: RedirectToSignUpProps) {
  const { isLoading, isAuthenticated, signUp } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      signUp({ redirectUri: returnUrl });
    }
  }, [isLoading, isAuthenticated, signUp, returnUrl]);

  return null;
}

RedirectToSignUp.displayName = "RedirectToSignUp";

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
   */
  roles?: string[];
  /**
   * Required realm roles. User must have at least one of these realm roles.
   */
  realmRoles?: string[];
}

/**
 * Protects content, showing it only to authenticated users.
 * Optionally can require specific roles.
 *
 * @example
 * ```tsx
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
 * <Protect roles={['admin']}>
 *   <AdminPanel />
 * </Protect>
 * ```
 */
export function Protect({ 
  children, 
  fallback, 
  loading,
  roles,
  realmRoles,
}: ProtectProps) {
  const { isLoading, isAuthenticated, signIn, keycloak } = useAuth();

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
  if (roles && roles.length > 0 && keycloak) {
    const hasRole = roles.some(role => keycloak.hasResourceRole(role));
    if (!hasRole) {
      return null; // User doesn't have required role
    }
  }

  // Check realm roles if specified
  if (realmRoles && realmRoles.length > 0 && keycloak) {
    const hasRealmRole = realmRoles.some(role => keycloak.hasRealmRole(role));
    if (!hasRealmRole) {
      return null; // User doesn't have required realm role
    }
  }

  return <>{children}</>;
}

Protect.displayName = "Protect";
