import { createContext } from "react";

/**
 * User information from the session.
 * This is safe to expose to the client - no tokens included.
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
  /** User's resource roles */
  roles?: string[];
  /** User's realm roles */
  realmRoles?: string[];
}

export interface SignInOptions {
  /** URL to redirect to after sign in */
  callbackUrl?: string;
}

export interface SignOutOptions {
  /** URL to redirect to after sign out */
  callbackUrl?: string;
}

/**
 * Authentication context value.
 * Note: Unlike the CSR version, this does NOT expose tokens.
 * Tokens are only available on the server.
 */
export interface AuthContextValue {
  /** Whether the auth state is still being determined */
  isLoading: boolean;
  /** Whether the user is authenticated */
  isAuthenticated: boolean;
  /** The authenticated user, or null if not authenticated */
  user: User | null;
  /** User's resource roles */
  roles: string[];
  /** User's realm roles */
  realmRoles: string[];
  /** Sign in - redirects to Auth.js sign in */
  signIn: (options?: SignInOptions) => Promise<void>;
  /** Sign out - redirects to Auth.js sign out */
  signOut: (options?: SignOutOptions) => Promise<void>;
  /** Any error from the session (e.g., token refresh failed) */
  error?: string;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
