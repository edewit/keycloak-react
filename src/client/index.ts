// Client-side components for SSR apps (Next.js App Router)
// These components work with Auth.js sessions
// Tokens are NOT exposed to the client - they stay server-side only

export {
  KeycloakAuthProvider,
  useAuth,
  useUser,
  useHasRole,
  useHasAnyRole,
  type KeycloakAuthProviderProps,
  type AuthContextValue,
  type User,
  type SignInOptions,
  type SignOutOptions,
} from "./AuthProvider";

export { AuthContext } from "./AuthContext";

export {
  SignedIn,
  SignedOut,
  RedirectToSignIn,
  Protect,
  type SignedInProps,
  type SignedOutProps,
  type RedirectToSignInProps,
  type ProtectProps,
} from "./ControlComponents";

export {
  SignInButton,
  SignOutButton,
  type SignInButtonProps,
  type SignOutButtonProps,
} from "./Buttons";

// Re-export from next-auth/react for convenience
export { signIn, signOut, useSession } from "next-auth/react";
