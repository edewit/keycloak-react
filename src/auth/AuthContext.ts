import { createContext } from "react";
import type Keycloak from "keycloak-js";

/**
 * User information extracted from the Keycloak token.
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
  /** Raw token claims */
  claims: Record<string, unknown>;
}

export interface SignInOptions {
  /** URL to redirect to after sign in */
  redirectUri?: string;
}

export interface SignOutOptions {
  /** URL to redirect to after sign out */
  redirectUri?: string;
}

export interface SignUpOptions {
  /** URL to redirect to after sign up */
  redirectUri?: string;
}

/**
 * Authentication state and methods provided by KeycloakAuthProvider.
 */
export interface AuthContextValue {
  /** Whether the auth state is still being determined */
  isLoading: boolean;
  /** Whether the user is authenticated */
  isAuthenticated: boolean;
  /** The authenticated user, or null if not authenticated */
  user: User | null;
  /** The raw ID token string */
  idToken: string | undefined;
  /** The raw access token string */
  accessToken: string | undefined;
  /** Sign in - redirects to Keycloak login */
  signIn: (options?: SignInOptions) => Promise<void>;
  /** Sign out - redirects to Keycloak logout */
  signOut: (options?: SignOutOptions) => Promise<void>;
  /** Sign up - redirects to Keycloak registration */
  signUp: (options?: SignUpOptions) => Promise<void>;
  /** Get a fresh access token */
  getToken: () => Promise<string | undefined>;
  /** The underlying Keycloak instance (for advanced usage) */
  keycloak: Keycloak | null;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
