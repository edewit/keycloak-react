import {
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import Keycloak, { type KeycloakConfig, type KeycloakInitOptions } from "keycloak-js";
import {
  AuthContext,
  type User,
  type AuthContextValue,
  type SignInOptions,
  type SignOutOptions,
  type SignUpOptions,
} from "./AuthContext";

// Re-export types from AuthContext
export type { User, AuthContextValue, SignInOptions, SignOutOptions, SignUpOptions };

export interface KeycloakAuthProviderProps {
  /** Keycloak server URL */
  url: string;
  /** Realm name */
  realm: string;
  /** Client ID */
  clientId: string;
  /** 
   * Keycloak init options.
   * By default, no automatic SSO check is performed.
   * Use `{ onLoad: 'check-sso' }` to check for existing sessions.
   * @default { pkceMethod: 'S256' }
   */
  initOptions?: KeycloakInitOptions;
  /** 
   * Called when authentication state changes.
   */
  onAuthStateChange?: (isAuthenticated: boolean, user: User | null) => void;
  /**
   * Called when the token expires.
   * You can use this to prompt the user to re-authenticate.
   */
  onTokenExpired?: () => void;
  /**
   * Called when an error occurs during initialization.
   */
  onError?: (error: Error) => void;
  /** Child components */
  children: ReactNode;
}

/**
 * Extract user information from Keycloak token.
 */
function extractUser(keycloak: Keycloak): User | null {
  const tokenParsed = keycloak.idTokenParsed || keycloak.tokenParsed;
  if (!tokenParsed) return null;

  return {
    id: tokenParsed.sub as string,
    email: tokenParsed.email as string | undefined,
    emailVerified: tokenParsed.email_verified as boolean | undefined,
    name: tokenParsed.name as string | undefined,
    firstName: tokenParsed.given_name as string | undefined,
    lastName: tokenParsed.family_name as string | undefined,
    username: tokenParsed.preferred_username as string | undefined,
    imageUrl: tokenParsed.picture as string | undefined,
    claims: tokenParsed as Record<string, unknown>,
  };
}

/**
 * Provides Keycloak authentication context to your application.
 * Similar to Clerk's ClerkProvider, this wraps your app and provides
 * authentication state and methods to all child components.
 *
 * @example
 * ```tsx
 * import { KeycloakAuthProvider } from 'keycloak-react';
 *
 * function App() {
 *   return (
 *     <KeycloakAuthProvider
 *       url="https://keycloak.example.com"
 *       realm="myrealm"
 *       clientId="my-app"
 *     >
 *       <MyApp />
 *     </KeycloakAuthProvider>
 *   );
 * }
 * ```
 */
export function KeycloakAuthProvider({
  url,
  realm,
  clientId,
  initOptions,
  onAuthStateChange,
  onTokenExpired,
  onError,
  children,
}: KeycloakAuthProviderProps) {
  const [keycloak, setKeycloak] = useState<Keycloak | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  
  // Track initialization to prevent double init in React strict mode
  const initializingRef = useRef(false);
  const initializedRef = useRef(false);
  
  // Store callbacks in refs to avoid re-running effect when they change
  const onAuthStateChangeRef = useRef(onAuthStateChange);
  const onTokenExpiredRef = useRef(onTokenExpired);
  const onErrorRef = useRef(onError);
  
  // Update refs when callbacks change
  useEffect(() => {
    onAuthStateChangeRef.current = onAuthStateChange;
    onTokenExpiredRef.current = onTokenExpired;
    onErrorRef.current = onError;
  }, [onAuthStateChange, onTokenExpired, onError]);

  // Initialize Keycloak - only once
  useEffect(() => {
    // Skip if already initializing or initialized
    if (initializingRef.current || initializedRef.current) {
      return;
    }
    
    initializingRef.current = true;
    
    const config: KeycloakConfig = { url, realm, clientId };
    const kc = new Keycloak(config);

    const defaultInitOptions: KeycloakInitOptions = {
      pkceMethod: "S256",
      ...initOptions,
    };

    // Handle token expiration - notify but don't auto-refresh
    kc.onTokenExpired = () => {
      setIsAuthenticated(false);
      setUser(null);
      onAuthStateChangeRef.current?.(false, null);
      onTokenExpiredRef.current?.();
    };

    // Handle auth state changes
    kc.onAuthSuccess = () => {
      setIsAuthenticated(true);
      const extractedUser = extractUser(kc);
      setUser(extractedUser);
      onAuthStateChangeRef.current?.(true, extractedUser);
    };

    kc.onAuthLogout = () => {
      setIsAuthenticated(false);
      setUser(null);
      onAuthStateChangeRef.current?.(false, null);
    };

    kc.init(defaultInitOptions)
      .then((authenticated) => {
        initializedRef.current = true;
        initializingRef.current = false;
        setKeycloak(kc);
        setIsAuthenticated(authenticated);
        const extractedUser = authenticated ? extractUser(kc) : null;
        setUser(extractedUser);
        setIsLoading(false);
        onAuthStateChangeRef.current?.(authenticated, extractedUser);
      })
      .catch((error) => {
        initializingRef.current = false;
        console.error("Keycloak init error:", error);
        setIsLoading(false);
        onErrorRef.current?.(error instanceof Error ? error : new Error(String(error)));
      });
  }, [url, realm, clientId, initOptions]);

  const signIn = useCallback(async (options?: SignInOptions) => {
    if (!keycloak) return;
    await keycloak.login({
      redirectUri: options?.redirectUri || window.location.href,
    });
  }, [keycloak]);

  const signOut = useCallback(async (options?: SignOutOptions) => {
    if (!keycloak) return;
    await keycloak.logout({
      redirectUri: options?.redirectUri || window.location.origin,
    });
  }, [keycloak]);

  const signUp = useCallback(async (options?: SignUpOptions) => {
    if (!keycloak) return;
    await keycloak.register({
      redirectUri: options?.redirectUri || window.location.href,
    });
  }, [keycloak]);

  const getToken = useCallback(async () => {
    if (!keycloak) return undefined;
    try {
      await keycloak.updateToken(30);
      return keycloak.token;
    } catch {
      return undefined;
    }
  }, [keycloak]);

  const value = useMemo<AuthContextValue>(() => ({
    isLoading,
    isAuthenticated,
    user,
    idToken: keycloak?.idToken,
    accessToken: keycloak?.token,
    signIn,
    signOut,
    signUp,
    getToken,
    keycloak,
  }), [isLoading, isAuthenticated, user, keycloak, signIn, signOut, signUp, getToken]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access the authentication context.
 * Must be used within a KeycloakAuthProvider.
 *
 * @example
 * ```tsx
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
 * Hook to get the Keycloak instance.
 * For advanced usage when you need direct access to keycloak-js.
 */
export function useKeycloak(): Keycloak | null {
  const { keycloak } = useAuth();
  return keycloak;
}

KeycloakAuthProvider.displayName = "KeycloakAuthProvider";
