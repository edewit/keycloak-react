import NextAuth from "next-auth";
import Keycloak from "next-auth/providers/keycloak";
import type { NextAuthConfig, Session } from "next-auth";
import type { JWT } from "next-auth/jwt";

/**
 * Extended session type that includes the access token (server-side only).
 * The access token is NEVER exposed to the client.
 */
export interface KeycloakSession extends Session {
  /** Access token - only available on server */
  accessToken?: string;
  /** Token expiry timestamp */
  accessTokenExpires?: number;
  /** Refresh token - only available on server */
  refreshToken?: string;
  /** User's Keycloak roles */
  roles?: string[];
  /** User's realm roles */
  realmRoles?: string[];
  /** Any error that occurred during token refresh */
  error?: string;
}

/**
 * Extended JWT type for internal use
 */
interface KeycloakJWT extends JWT {
  accessToken?: string;
  refreshToken?: string;
  accessTokenExpires?: number;
  roles?: string[];
  realmRoles?: string[];
  error?: string;
}

export interface KeycloakAuthConfig {
  /** Keycloak server URL (e.g., https://keycloak.example.com) */
  keycloakUrl: string;
  /** Keycloak realm name */
  realm: string;
  /** OAuth client ID */
  clientId: string;
  /** OAuth client secret */
  clientSecret: string;
  /** Base path for auth routes (default: /api/auth) */
  basePath?: string;
  /** Additional NextAuth config options */
  options?: Partial<NextAuthConfig>;
}

/**
 * Refresh the access token using the refresh token
 */
async function refreshAccessToken(
  token: KeycloakJWT,
  keycloakUrl: string,
  realm: string,
  clientId: string,
  clientSecret: string
): Promise<KeycloakJWT> {
  try {
    const url = `${keycloakUrl}/realms/${realm}/protocol/openid-connect/token`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "refresh_token",
        refresh_token: token.refreshToken!,
      }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    // Parse the new access token to get roles
    const accessTokenPayload = JSON.parse(
      Buffer.from(refreshedTokens.access_token.split(".")[1], "base64").toString()
    );

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
      roles: accessTokenPayload.resource_access?.[clientId]?.roles ?? [],
      realmRoles: accessTokenPayload.realm_access?.roles ?? [],
    };
  } catch (error) {
    console.error("Error refreshing access token:", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

/**
 * Create Auth.js configuration for Keycloak with SSR support.
 * Tokens are kept server-side only and never exposed to the client.
 *
 * @example
 * ```ts
 * // app/api/auth/[...nextauth]/route.ts
 * import { createKeycloakAuth } from "keycloak-react/server";
 *
 * export const { handlers, auth, signIn, signOut } = createKeycloakAuth({
 *   keycloakUrl: process.env.KEYCLOAK_URL!,
 *   realm: process.env.KEYCLOAK_REALM!,
 *   clientId: process.env.KEYCLOAK_CLIENT_ID!,
 *   clientSecret: process.env.KEYCLOAK_CLIENT_SECRET!,
 * });
 *
 * export const { GET, POST } = handlers;
 * ```
 */
export function createKeycloakAuth(config: KeycloakAuthConfig) {
  const { keycloakUrl, realm, clientId, clientSecret, basePath, options } = config;

  const issuer = `${keycloakUrl}/realms/${realm}`;

  const authConfig: NextAuthConfig = {
    basePath: basePath ?? "/api/auth",
    providers: [
      Keycloak({
        clientId,
        clientSecret,
        issuer,
      }),
    ],
    callbacks: {
      async jwt({ token, account }): Promise<KeycloakJWT> {
        // Initial sign in - store tokens
        if (account) {
          // Parse the access token to extract roles
          let roles: string[] = [];
          let realmRoles: string[] = [];

          if (account.access_token) {
            try {
              const accessTokenPayload = JSON.parse(
                Buffer.from(account.access_token.split(".")[1], "base64").toString()
              );
              roles = accessTokenPayload.resource_access?.[clientId]?.roles ?? [];
              realmRoles = accessTokenPayload.realm_access?.roles ?? [];
            } catch {
              // Ignore parse errors
            }
          }

          return {
            ...token,
            accessToken: account.access_token,
            refreshToken: account.refresh_token,
            accessTokenExpires: account.expires_at ? account.expires_at * 1000 : undefined,
            roles,
            realmRoles,
          };
        }

        const keycloakToken = token as KeycloakJWT;

        // Return previous token if it hasn't expired
        if (keycloakToken.accessTokenExpires && Date.now() < keycloakToken.accessTokenExpires) {
          return keycloakToken;
        }

        // Token has expired, refresh it
        if (keycloakToken.refreshToken) {
          return refreshAccessToken(keycloakToken, keycloakUrl, realm, clientId, clientSecret);
        }

        return keycloakToken;
      },
      async session({ session, token }): Promise<KeycloakSession> {
        const keycloakToken = token as KeycloakJWT;

        // IMPORTANT: We do NOT expose tokens to the client session
        // The session callback runs both on server and client
        // We only add non-sensitive data to the session
        return {
          ...session,
          roles: keycloakToken.roles,
          realmRoles: keycloakToken.realmRoles,
          error: keycloakToken.error,
          // Note: accessToken and refreshToken are intentionally NOT included here
          // They stay in the JWT and are only accessible server-side
        };
      },
    },
    events: {
      async signOut(message) {
        // Revoke the refresh token on Keycloak when user signs out
        // In JWT strategy, message contains { token }
        const token = "token" in message ? message.token : null;
        if (!token) return;

        const keycloakToken = token as KeycloakJWT;
        if (keycloakToken.refreshToken) {
          try {
            const url = `${keycloakUrl}/realms/${realm}/protocol/openid-connect/logout`;
            await fetch(url, {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: new URLSearchParams({
                client_id: clientId,
                client_secret: clientSecret,
                refresh_token: keycloakToken.refreshToken,
              }),
            });
          } catch (error) {
            console.error("Error revoking refresh token:", error);
          }
        }
      },
    },
    ...options,
  };

  return NextAuth(authConfig);
}

/**
 * Get the access token for server-side API calls.
 * This should ONLY be called from server components or API routes.
 *
 * @example
 * ```ts
 * // In a server component or API route
 * import { auth, getAccessToken } from "@/auth";
 *
 * async function fetchProtectedData() {
 *   const token = await getAccessToken(auth);
 *   const res = await fetch("https://api.example.com/data", {
 *     headers: { Authorization: `Bearer ${token}` }
 *   });
 *   return res.json();
 * }
 * ```
 */
export async function getAccessToken(
  _auth: () => Promise<Session | null>
): Promise<string | undefined> {
  // This function is a placeholder - in practice, you need to access the JWT directly
  // Since NextAuth v5 doesn't expose JWT in the session by default for security
  console.warn(
    "getAccessToken: For server-side token access, use the jwt callback or getToken from next-auth/jwt"
  );
  return undefined;
}

export type { Session, JWT };
