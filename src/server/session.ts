import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import type { GetServerSidePropsContext } from "next";

/**
 * User information from the session (safe to expose to client).
 */
export interface User {
  /** User's unique ID (sub claim) */
  id: string;
  /** User's email address */
  email?: string;
  /** Whether the email is verified */
  emailVerified?: boolean;
  /** User's full name */
  name?: string;
  /** User's first/given name */
  firstName?: string;
  /** User's last/family name */
  lastName?: string;
  /** User's preferred username */
  username?: string;
  /** URL to user's profile picture */
  imageUrl?: string;
  /** User's resource roles (from Keycloak client) */
  roles?: string[];
  /** User's realm roles */
  realmRoles?: string[];
}

/**
 * Server-side session data with access to tokens.
 * This should ONLY be used in server components, API routes, or server actions.
 */
export interface ServerSession {
  /** The user information */
  user: User | null;
  /** Whether the user is authenticated */
  isAuthenticated: boolean;
  /** Access token for API calls (server-only) */
  accessToken?: string;
  /** Refresh token (server-only) */
  refreshToken?: string;
  /** When the access token expires */
  accessTokenExpires?: number;
  /** Any error from token refresh */
  error?: string;
}

/**
 * Options for getting the server session
 */
export interface GetServerSessionOptions {
  /** The secret used for JWT encryption (defaults to NEXTAUTH_SECRET env var) */
  secret?: string;
}

/**
 * Get the full server session including tokens.
 * This should ONLY be called from server components, API routes, or server actions.
 *
 * @example
 * ```ts
 * // In a Server Component
 * import { getServerSession } from "keycloak-react/server";
 * import { headers, cookies } from "next/headers";
 *
 * export default async function ProtectedPage() {
 *   const session = await getServerSession({ headers, cookies });
 *
 *   if (!session.isAuthenticated) {
 *     redirect("/api/auth/signin");
 *   }
 *
 *   // Use session.accessToken for API calls
 *   const data = await fetchWithToken(session.accessToken);
 *
 *   return <div>Welcome {session.user?.name}</div>;
 * }
 * ```
 */
export async function getServerSession(
  req: NextRequest | GetServerSidePropsContext["req"] | { headers: Headers; cookies: any },
  options?: GetServerSessionOptions
): Promise<ServerSession> {
  const secret = options?.secret ?? process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error(
      "No secret configured. Set NEXTAUTH_SECRET or AUTH_SECRET environment variable."
    );
  }

  try {
    const token = await getToken({
      req: req as any,
      secret,
    });

    if (!token) {
      return {
        user: null,
        isAuthenticated: false,
      };
    }

    const user: User = {
      id: token.sub!,
      email: token.email as string | undefined,
      emailVerified: token.email_verified as boolean | undefined,
      name: token.name as string | undefined,
      firstName: token.given_name as string | undefined,
      lastName: token.family_name as string | undefined,
      username: token.preferred_username as string | undefined,
      imageUrl: token.picture as string | undefined,
      roles: (token as any).roles,
      realmRoles: (token as any).realmRoles,
    };

    return {
      user,
      isAuthenticated: true,
      accessToken: (token as any).accessToken,
      refreshToken: (token as any).refreshToken,
      accessTokenExpires: (token as any).accessTokenExpires,
      error: (token as any).error,
    };
  } catch (error) {
    console.error("Error getting server session:", error);
    return {
      user: null,
      isAuthenticated: false,
    };
  }
}

/**
 * Get just the user from the session (without tokens).
 * Safe to use anywhere on the server.
 *
 * @example
 * ```ts
 * import { getUser } from "keycloak-react/server";
 *
 * export default async function Header() {
 *   const user = await getUser(req);
 *   return user ? <span>Hello {user.name}</span> : <SignInButton />;
 * }
 * ```
 */
export async function getUser(
  req: NextRequest | GetServerSidePropsContext["req"] | { headers: Headers; cookies: any },
  options?: GetServerSessionOptions
): Promise<User | null> {
  const session = await getServerSession(req, options);
  return session.user;
}

/**
 * Check if the user has a specific role.
 * Checks both resource roles and realm roles.
 *
 * @example
 * ```ts
 * import { hasRole } from "keycloak-react/server";
 *
 * export default async function AdminPage() {
 *   const isAdmin = await hasRole(req, "admin");
 *   if (!isAdmin) {
 *     return <AccessDenied />;
 *   }
 *   return <AdminDashboard />;
 * }
 * ```
 */
export async function hasRole(
  req: NextRequest | GetServerSidePropsContext["req"] | { headers: Headers; cookies: any },
  role: string,
  options?: GetServerSessionOptions
): Promise<boolean> {
  const session = await getServerSession(req, options);

  if (!session.isAuthenticated || !session.user) {
    return false;
  }

  const { roles = [], realmRoles = [] } = session.user;
  return roles.includes(role) || realmRoles.includes(role);
}

/**
 * Check if the user has any of the specified roles.
 *
 * @example
 * ```ts
 * import { hasAnyRole } from "keycloak-react/server";
 *
 * const canEdit = await hasAnyRole(req, ["admin", "editor"]);
 * ```
 */
export async function hasAnyRole(
  req: NextRequest | GetServerSidePropsContext["req"] | { headers: Headers; cookies: any },
  roles: string[],
  options?: GetServerSessionOptions
): Promise<boolean> {
  const session = await getServerSession(req, options);

  if (!session.isAuthenticated || !session.user) {
    return false;
  }

  const { roles: userRoles = [], realmRoles = [] } = session.user;
  return roles.some((role) => userRoles.includes(role) || realmRoles.includes(role));
}

/**
 * Check if the user has all of the specified roles.
 *
 * @example
 * ```ts
 * import { hasAllRoles } from "keycloak-react/server";
 *
 * const isSuperAdmin = await hasAllRoles(req, ["admin", "super"]);
 * ```
 */
export async function hasAllRoles(
  req: NextRequest | GetServerSidePropsContext["req"] | { headers: Headers; cookies: any },
  roles: string[],
  options?: GetServerSessionOptions
): Promise<boolean> {
  const session = await getServerSession(req, options);

  if (!session.isAuthenticated || !session.user) {
    return false;
  }

  const { roles: userRoles = [], realmRoles = [] } = session.user;
  const allUserRoles = [...userRoles, ...realmRoles];
  return roles.every((role) => allUserRoles.includes(role));
}
