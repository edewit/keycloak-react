// Main component exports
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

// Auth provider and hooks
export {
  KeycloakAuthProvider,
  useAuth,
  useUser,
  useKeycloak,
  type KeycloakAuthProviderProps,
  type AuthContextValue,
  type User,
  type SignInOptions,
  type SignOutOptions,
  type SignUpOptions,
} from "./auth";

// Auth control components
export {
  SignedIn,
  SignedOut,
  RedirectToSignIn,
  RedirectToSignUp,
  Protect,
  type SignedInProps,
  type SignedOutProps,
  type RedirectToSignInProps,
  type RedirectToSignUpProps,
  type ProtectProps,
} from "./auth";

// Auth buttons
export {
  SignInButton,
  SignUpButton,
  SignOutButton,
  type SignInButtonProps,
  type SignUpButtonProps,
  type SignOutButtonProps,
} from "./auth";
