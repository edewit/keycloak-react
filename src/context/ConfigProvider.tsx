import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { LoginConfig } from "../config";
import {
  getLoginConfigFromDOM,
  fetchLoginConfig,
  LoginConfigError,
} from "../config";

export interface ConfigContextValue {
  /** The login configuration */
  config: LoginConfig | null;
  /** Whether the configuration is loading */
  isLoading: boolean;
  /** Error if configuration loading failed */
  error: Error | null;
}

const ConfigContext = createContext<ConfigContextValue | undefined>(undefined);

export interface ConfigProviderProps {
  /** Child components */
  children: ReactNode;
  /** 
   * Login configuration. If not provided, will attempt to load from Keycloak server
   * (if keycloakUrl and realm are provided) or from DOM.
   * Pass this directly if you already have the config available.
   */
  config?: LoginConfig;
  /**
   * Base URL of the Keycloak server (e.g., "https://keycloak.example.com").
   * When provided along with `realm`, the config will be fetched from the server.
   */
  keycloakUrl?: string;
  /**
   * Name of the realm to fetch configuration for.
   * Required when `keycloakUrl` is provided.
   */
  realm?: string;
  /**
   * ID of the script element containing the config in the DOM.
   * Only used if config prop and keycloakUrl are not provided.
   */
  configElementId?: string;
}

/**
 * Provider component that makes login configuration available to child components.
 * 
 * Can be used in three ways:
 * 1. Pass config directly via the `config` prop
 * 2. Fetch from Keycloak server by providing `keycloakUrl` and `realm`
 * 3. Let it auto-load from a script tag in the DOM (default behavior)
 * 
 * @example
 * ```tsx
 * // Fetch from Keycloak server (recommended for standalone apps)
 * <ConfigProvider keycloakUrl="https://keycloak.example.com" realm="myrealm">
 *   <SignIn />
 * </ConfigProvider>
 * 
 * // Pass config directly
 * <ConfigProvider config={myConfig}>
 *   <SignIn />
 * </ConfigProvider>
 * 
 * // Auto-load from DOM (for use in Keycloak themes)
 * <ConfigProvider>
 *   <SignIn />
 * </ConfigProvider>
 * ```
 */
export function ConfigProvider({
  children,
  config: configProp,
  keycloakUrl,
  realm,
  configElementId,
}: ConfigProviderProps) {
  const [config, setConfig] = useState<LoginConfig | null>(configProp ?? null);
  const [isLoading, setIsLoading] = useState(!configProp);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // If config was provided as prop, use it directly
    if (configProp) {
      setConfig(configProp);
      setIsLoading(false);
      return;
    }

    // If keycloakUrl and realm are provided, fetch from server
    if (keycloakUrl && realm) {
      const abortController = new AbortController();
      
      setIsLoading(true);
      setError(null);
      
      fetchLoginConfig({
        keycloakUrl,
        realm,
        signal: abortController.signal,
      })
        .then((loadedConfig) => {
          setConfig(loadedConfig);
          setError(null);
        })
        .catch((err) => {
          // Ignore abort errors
          if (err instanceof Error && err.name === "AbortError") {
            return;
          }
          setError(
            err instanceof LoginConfigError
              ? err
              : new Error("Failed to fetch login configuration")
          );
        })
        .finally(() => {
          setIsLoading(false);
        });

      return () => {
        abortController.abort();
      };
    }

    // Fall back to loading from DOM
    try {
      const loadedConfig = getLoginConfigFromDOM(configElementId);
      setConfig(loadedConfig);
      setError(null);
    } catch (err) {
      setError(
        err instanceof LoginConfigError
          ? err
          : new Error("Failed to load login configuration")
      );
    } finally {
      setIsLoading(false);
    }
  }, [configProp, keycloakUrl, realm, configElementId]);

  return (
    <ConfigContext.Provider value={{ config, isLoading, error }}>
      {children}
    </ConfigContext.Provider>
  );
}

/**
 * Hook to access the login configuration from context.
 * 
 * @returns The configuration context value
 * @throws Error if used outside of ConfigProvider
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { config, isLoading, error } = useConfig();
 *   
 *   if (isLoading) return <Spinner />;
 *   if (error) return <Error message={error.message} />;
 *   if (!config) return null;
 *   
 *   return <div>{config.realm.displayName}</div>;
 * }
 * ```
 */
export function useConfig(): ConfigContextValue {
  const context = useContext(ConfigContext);

  if (context === undefined) {
    throw new Error("useConfig must be used within a ConfigProvider");
  }

  return context;
}

/**
 * Hook to access the login configuration, throwing if not available.
 * Use this when you're sure the config is loaded.
 * 
 * @returns The login configuration
 * @throws Error if config is not loaded or if used outside of ConfigProvider
 */
export function useRequiredConfig(): LoginConfig {
  const { config, isLoading, error } = useConfig();

  if (isLoading) {
    throw new Error("Login configuration is still loading");
  }

  if (error) {
    throw error;
  }

  if (!config) {
    throw new Error("Login configuration is not available");
  }

  return config;
}
