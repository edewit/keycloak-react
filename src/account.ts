/**
 * Account UI components from @keycloak/keycloak-account-ui.
 * 
 * IMPORTANT: These components require the Keycloak environment to be injected
 * into the document as a script tag with id="environment".
 * 
 * @example
 * ```html
 * <script id="environment" type="application/json">
 *   {
 *     "serverBaseUrl": "http://localhost:8080",
 *     "realm": "master",
 *     "clientId": "my-app",
 *     "resourceUrl": ".",
 *     "logo": "/logo.svg",
 *     "logoUrl": "/"
 *   }
 * </script>
 * ```
 */

// Re-export Keycloak context
export { KeycloakProvider, useEnvironment } from "@keycloak/keycloak-account-ui";

// Re-export environment utilities and types
export {
  getInjectedEnvironment,
  type BaseEnvironment,
  type KeycloakContext,
} from "@keycloak/keycloak-ui-shared";

// Account UI components
export {
  // User profile
  PersonalInfo,
  // Security
  DeviceActivity,
  LinkedAccounts,
  SigningIn,
  // Applications & resources
  Applications,
  Groups,
  Resources,
  Organizations,
  // Layout
  Page,
  PageNav,
  Header,
  // API methods
  getPersonalInfo,
  savePersonalInfo,
  getDevices,
  deleteSession,
  getLinkedAccounts,
  unLinkAccount,
  getCredentials,
  getApplications,
  deleteConsent,
  getGroups,
  // Utilities
  useAccountAlerts,
  usePromise,
  routes,
  // Types
  type AccountEnvironment,
  type UserRepresentation,
  type SessionRepresentation,
  type LinkedAccountRepresentation,
  type CredentialContainer,
  type ClientRepresentation,
  type Group,
} from "@keycloak/keycloak-account-ui";
