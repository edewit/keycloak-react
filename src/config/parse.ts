import type { LoginConfig } from "./types";

/**
 * Default ID for the script tag containing the Keycloak configuration.
 */
export const DEFAULT_CONFIG_ELEMENT_ID = "keycloak-login-config";

/**
 * Error thrown when login configuration cannot be found or parsed.
 */
export class LoginConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LoginConfigError";
  }
}

/**
 * Parse login configuration from a script tag in the DOM.
 *
 * This is the pattern used by Keycloak themes where the server renders
 * the configuration as a JSON object inside a script tag.
 *
 * @param elementId - ID of the script element containing the config (default: "keycloak-login-config")
 * @returns The parsed LoginConfig object
 * @throws LoginConfigError if the element is not found or contains invalid JSON
 *
 * @example
 * ```html
 * <script id="keycloak-login-config" type="application/json">
 *   {"realm": {"name": "myrealm", ...}, ...}
 * </script>
 * ```
 *
 * ```typescript
 * const config = getLoginConfigFromDOM();
 * ```
 */
export function getLoginConfigFromDOM(
  elementId: string = DEFAULT_CONFIG_ELEMENT_ID
): LoginConfig {
  const element = document.getElementById(elementId);

  if (!element) {
    throw new LoginConfigError(
      `Login configuration element with id "${elementId}" not found in DOM`
    );
  }

  const content = element.textContent;

  if (!content || content.trim() === "") {
    throw new LoginConfigError(
      `Login configuration element "${elementId}" is empty`
    );
  }

  try {
    return JSON.parse(content) as LoginConfig;
  } catch (error) {
    throw new LoginConfigError(
      `Failed to parse login configuration: ${error instanceof Error ? error.message : "Invalid JSON"}`
    );
  }
}

/**
 * Parse login configuration from a JSON string.
 *
 * @param json - JSON string containing the login configuration
 * @returns The parsed LoginConfig object
 * @throws LoginConfigError if the JSON is invalid
 */
export function parseLoginConfig(json: string): LoginConfig {
  try {
    return JSON.parse(json) as LoginConfig;
  } catch (error) {
    throw new LoginConfigError(
      `Failed to parse login configuration: ${error instanceof Error ? error.message : "Invalid JSON"}`
    );
  }
}

/**
 * Validate that a configuration object has the required fields.
 *
 * @param config - Configuration object to validate
 * @returns true if valid
 * @throws LoginConfigError if required fields are missing
 */
export function validateLoginConfig(config: unknown): config is LoginConfig {
  if (!config || typeof config !== "object") {
    throw new LoginConfigError("Login configuration must be an object");
  }

  const cfg = config as Record<string, unknown>;

  if (!cfg.realm || typeof cfg.realm !== "object") {
    throw new LoginConfigError("Login configuration must have a 'realm' object");
  }

  if (!cfg.urls || typeof cfg.urls !== "object") {
    throw new LoginConfigError("Login configuration must have a 'urls' object");
  }

  const realm = cfg.realm as Record<string, unknown>;

  if (typeof realm.name !== "string") {
    throw new LoginConfigError("Realm configuration must have a 'name' string");
  }

  return true;
}

/**
 * Safely get login configuration from DOM with validation.
 *
 * @param elementId - ID of the script element containing the config
 * @returns The parsed and validated LoginConfig object
 */
export function getValidatedLoginConfig(
  elementId: string = DEFAULT_CONFIG_ELEMENT_ID
): LoginConfig {
  const config = getLoginConfigFromDOM(elementId);
  validateLoginConfig(config);
  return config;
}
