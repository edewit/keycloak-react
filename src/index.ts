/**
 * Keycloak React - SSR Authentication Components
 *
 * This library provides two entry points:
 *
 * - `keycloak-react/server` - Server-side utilities (Auth.js config, session helpers)
 * - `keycloak-react/client` - Client components (React hooks and components)
 *
 * For SSR apps (recommended), import from the specific entry points.
 * This main entry re-exports client components for convenience.
 */

// Re-export client components from main entry for convenience
export {
  KeycloakAuthProvider,
  useAuth,
  useUser,
  useHasRole,
  useHasAnyRole,
  SignedIn,
  SignedOut,
  RedirectToSignIn,
  Protect,
  SignInButton,
  SignOutButton,
  type KeycloakAuthProviderProps,
  type AuthContextValue,
  type User,
  type SignInOptions,
  type SignOutOptions,
  type SignedInProps,
  type SignedOutProps,
  type RedirectToSignInProps,
  type ProtectProps,
  type SignInButtonProps,
  type SignOutButtonProps,
} from "./client";

// Main component exports (UI components that work with both CSR and SSR)
export {
  SignIn,
  type SignInProps,
  type SignInFormData,
} from "./SignIn";

// Social buttons
export {
  SocialButtons,
  type SocialButtonsProps,
} from "./SignIn";

// Provider icon
export {
  ProviderIcon,
  type ProviderIconProps,
} from "./SignIn";

// User avatar
export {
  UserAvatar,
  decodeToken,
  getUserFromToken,
  type UserAvatarProps,
  type UserAvatarSize,
  type UserTokenClaims,
} from "./UserAvatar";

// User button
export {
  UserButton,
  type UserButtonProps,
  type UserButtonMenuItem,
} from "./UserButton";

// Headless sign-in hook
export {
  useSignIn,
  type UseSignInReturn,
  type UseSignInOptions,
  type SignInState,
  type SignInActions,
  type SignInSubmit,
  type SignInErrors,
  type SignInComputed,
  type SignInSubmitHandler,
} from "./SignIn";

// Context provider
export {
  ConfigProvider,
  useConfig,
  useRequiredConfig,
  type ConfigProviderProps,
  type ConfigContextValue,
} from "./context";

// Theming/appearance
export {
  applyAppearance,
  clearAppearance,
  mergeAppearance,
  getPatternFlyVariables,
  getElementClassName,
  type Appearance,
  type AppearanceVariables,
  type AppearanceElements,
} from "./theme";

// Re-export types from config for convenience
export type {
  LoginConfig,
  RealmConfig,
  IdentityProvider,
  LoginUrls,
  BrandingConfig,
  LoginState,
  FormError,
  PageMessage,
} from "./config";

// Re-export config utilities
export {
  getLoginConfigFromDOM,
  parseLoginConfig,
  validateLoginConfig,
  getValidatedLoginConfig,
  fetchLoginConfig,
  getLoginConfigUrl,
  LoginConfigError,
  DEFAULT_CONFIG_ELEMENT_ID,
  type FetchLoginConfigOptions,
} from "./config";
