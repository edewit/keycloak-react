"use client";

import {
  useContext,
  useMemo,
  useCallback,
  type ReactNode,
} from "react";
import { SessionProvider, useSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from "next-auth/react";
import type { Session } from "next-auth";
import {
  AuthContext,
  type User,
  type AuthContextValue,
  type SignInOptions,
  type SignOutOptions,
} from "./AuthContext";

// Re-export types
export type { User, AuthContextValue, SignInOptions, SignOutOptions };

export interface KeycloakAuthProviderProps {
  /** 
   * Initial session from the server.
   * Pass this from your server component for immediate hydration.
   */
  session?: Session | null;
  /**
   * Base path for auth routes.
   * @default "/api/auth"
   */
  basePath?: string;
  /**
   * Refresh interval in seconds.
   * Set to 0 to disable.
   * @default 0
   */
  refetchInterval?: number;
  /**
   * Refetch session when window gains focus.
   * @default true
   */
  refetchOnWindowFocus?: boolean;
  /** Child components */
  children: ReactNode;
}

/**
 * Extended user type with Keycloak-specific claims
 */
interface KeycloakUser {
  id?: string;
  sub?: string;
  email?: string | null;
  email_verified?: boolean;
  name?: string | null;
  given_name?: string;
  family_name?: string;
  preferred_username?: string;
  image?: string | null;
}

/**
 * Extended session with Keycloak-specific fields
 */
interface KeycloakSessionExtended extends Session {
  roles?: string[];
  realmRoles?: string[];
  error?: string;
  user?: KeycloakUser;
}

/**
 * Extract user from NextAuth session.
 */
function extractUser(session: Session | null): User | null {
  if (!session?.user) return null;

  const keycloakSession = session as KeycloakSessionExtended;
  const user = keycloakSession.user as KeycloakUser;

  return {
    id: user.id ?? user.sub ?? "",
    email: user.email ?? undefined,
    emailVerified: user.email_verified,
    name: user.name ?? undefined,
    firstName: user.given_name,
    lastName: user.family_name,
    username: user.preferred_username,
    imageUrl: user.image ?? undefined,
    roles: keycloakSession.roles ?? [],
    realmRoles: keycloakSession.realmRoles ?? [],
  };
}

/**
 * Internal provider that uses the session context.
 */
function AuthProviderInner({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();

  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";
  const user = useMemo(() => extractUser(session), [session]);

  const { roles, realmRoles, error } = useMemo(() => {
    const sessionWithRoles = session as KeycloakSessionExtended | null;
    return {
      roles: sessionWithRoles?.roles ?? [],
      realmRoles: sessionWithRoles?.realmRoles ?? [],
      error: sessionWithRoles?.error,
    };
  }, [session]);

  const signIn = useCallback(async (options?: SignInOptions) => {
    await nextAuthSignIn("keycloak", {
      callbackUrl: options?.callbackUrl ?? window.location.href,
    });
  }, []);

  const signOut = useCallback(async (options?: SignOutOptions) => {
    await nextAuthSignOut({
      callbackUrl: options?.callbackUrl ?? window.location.origin,
    });
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    isLoading,
    isAuthenticated,
    user,
    roles,
    realmRoles,
    signIn,
    signOut,
    error,
  }), [isLoading, isAuthenticated, user, roles, realmRoles, signIn, signOut, error]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Provides Keycloak authentication context to your application via Auth.js.
 * This is an SSR-compatible provider that keeps tokens server-side only.
 *
 * @example
 * ```tsx
 * // app/layout.tsx
 * import { KeycloakAuthProvider } from "keycloak-react/client";
 * import { auth } from "@/auth";
 *
 * export default async function RootLayout({ children }) {
 *   const session = await auth();
 *
 *   return (
 *     <html>
 *       <body>
 *         <KeycloakAuthProvider session={session}>
 *           {children}
 *         </KeycloakAuthProvider>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export function KeycloakAuthProvider({
  session,
  basePath = "/api/auth",
  refetchInterval = 0,
  refetchOnWindowFocus = true,
  children,
}: KeycloakAuthProviderProps) {
  return (
    <SessionProvider
      session={session}
      basePath={basePath}
      refetchInterval={refetchInterval}
      refetchOnWindowFocus={refetchOnWindowFocus}
    >
      <AuthProviderInner>
        {children}
      </AuthProviderInner>
    </SessionProvider>
  );
}

KeycloakAuthProvider.displayName = "KeycloakAuthProvider";

/**
 * Hook to access the authentication context.
 * Must be used within a KeycloakAuthProvider.
 *
 * Note: Unlike the CSR version, this hook does NOT provide access to tokens.
 * Tokens are only available on the server via getServerSession().
 *
 * @example
 * ```tsx
 * "use client";
 *
 * function MyComponent() {
 *   const { isAuthenticated, user, signIn, signOut } = useAuth();
 *
 *   if (!isAuthenticated) {
 *     return <button onClick={() => signIn()}>Sign In</button>;
 *   }
 *
 *   return (
 *     <div>
 *       <p>Welcome, {user?.name}!</p>
 *       <button onClick={() => signOut()}>Sign Out</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within a KeycloakAuthProvider");
  }
  return context;
}

/**
 * Hook to get the current user.
 * Returns null if not authenticated.
 *
 * @example
 * ```tsx
 * "use client";
 *
 * function Profile() {
 *   const user = useUser();
 *   if (!user) return null;
 *   return <p>Hello, {user.firstName}!</p>;
 * }
 * ```
 */
export function useUser(): User | null {
  const { user } = useAuth();
  return user;
}

/**
 * Hook to check if user has a specific role.
 *
 * @example
 * ```tsx
 * "use client";
 *
 * function AdminButton() {
 *   const isAdmin = useHasRole("admin");
 *   if (!isAdmin) return null;
 *   return <button>Admin Panel</button>;
 * }
 * ```
 */
export function useHasRole(role: string): boolean {
  const { roles, realmRoles } = useAuth();
  return roles.includes(role) || realmRoles.includes(role);
}

/**
 * Hook to check if user has any of the specified roles.
 */
export function useHasAnyRole(checkRoles: string[]): boolean {
  const { roles, realmRoles } = useAuth();
  return checkRoles.some((role) => roles.includes(role) || realmRoles.includes(role));
}
