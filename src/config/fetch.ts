import type { LoginConfig } from "./types";
import { LoginConfigError, validateLoginConfig } from "./parse";

/**
 * Options for fetching login configuration from the Keycloak server.
 */
export interface FetchLoginConfigOptions {
  /**
   * Base URL of the Keycloak server (e.g., "https://keycloak.example.com").
   */
  keycloakUrl: string;
  /**
   * Name of the realm to fetch configuration for.
   */
  realm: string;
  /**
   * Optional AbortSignal for cancelling the request.
   */
  signal?: AbortSignal;
}

/**
 * Fetch login configuration from the Keycloak server's login-config endpoint.
 *
 * This retrieves all the information needed to render a login UI, including:
 * - Realm settings (registration allowed, password reset, etc.)
 * - Available identity providers with their login URLs
 * - URLs for login, registration, and password reset
 * - Branding configuration
 *
 * @param options - Configuration options including Keycloak URL and realm name
 * @returns Promise resolving to the LoginConfig object
 * @throws LoginConfigError if the request fails or returns invalid data
 *
 * @example
 * ```typescript
 * const config = await fetchLoginConfig({
 *   keycloakUrl: 'https://keycloak.example.com',
 *   realm: 'myrealm'
 * });
 *
 * console.log(config.realm.displayName);
 * console.log(config.identityProviders);
 * ```
 */
export async function fetchLoginConfig(
  options: FetchLoginConfigOptions
): Promise<LoginConfig> {
  const { keycloakUrl, realm, signal } = options;

  // Normalize URL (remove trailing slash if present)
  const baseUrl = keycloakUrl.replace(/\/$/, "");
  const url = `${baseUrl}/realms/${encodeURIComponent(realm)}/login-config`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw error;
    }
    throw new LoginConfigError(
      `Failed to fetch login configuration: ${error instanceof Error ? error.message : "Network error"}`
    );
  }

  if (!response.ok) {
    throw new LoginConfigError(
      `Failed to fetch login configuration: ${response.status} ${response.statusText}`
    );
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new LoginConfigError(
      "Failed to parse login configuration: Invalid JSON response"
    );
  }

  // Validate the response structure
  try {
    validateLoginConfig(data);
  } catch (error) {
    throw new LoginConfigError(
      `Invalid login configuration received: ${error instanceof Error ? error.message : "Validation failed"}`
    );
  }

  return data as LoginConfig;
}

/**
 * Build the login-config endpoint URL for a given Keycloak server and realm.
 *
 * @param keycloakUrl - Base URL of the Keycloak server
 * @param realm - Name of the realm
 * @returns The full URL to the login-config endpoint
 *
 * @example
 * ```typescript
 * const url = getLoginConfigUrl('https://keycloak.example.com', 'myrealm');
 * // Returns: 'https://keycloak.example.com/realms/myrealm/login-config'
 * ```
 */
export function getLoginConfigUrl(keycloakUrl: string, realm: string): string {
  const baseUrl = keycloakUrl.replace(/\/$/, "");
  return `${baseUrl}/realms/${encodeURIComponent(realm)}/login-config`;
}
