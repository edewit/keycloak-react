/**
 * Main configuration object for the Keycloak login UI.
 * This configuration drives the rendering of login components.
 */
export interface LoginConfig {
  /** Realm configuration */
  realm: RealmConfig;
  /** Available identity providers for social login */
  identityProviders: IdentityProvider[];
  /** URLs for various login actions */
  urls: LoginUrls;
  /** Optional branding configuration */
  branding?: BrandingConfig;
  /** Current login state/context */
  login?: LoginState;
  /** Localized messages */
  messages?: Record<string, string>;
}

/**
 * Realm-level configuration that affects login behavior.
 */
export interface RealmConfig {
  /** Internal realm name */
  name: string;
  /** Display name shown to users */
  displayName?: string;
  /** HTML-formatted display name */
  displayNameHtml?: string;
  /** Whether user registration is allowed */
  registrationAllowed: boolean;
  /** Whether password reset is allowed */
  resetPasswordAllowed: boolean;
  /** Whether "remember me" checkbox is shown */
  rememberMe: boolean;
  /** Whether users can log in with email address */
  loginWithEmailAllowed: boolean;
  /** Whether email is used as username during registration */
  registrationEmailAsUsername: boolean;
  /** Whether password authentication is enabled */
  password: boolean;
  /** Whether internationalization is enabled */
  internationalizationEnabled?: boolean;
  /** Whether editing username is allowed */
  editUsernameAllowed?: boolean;
}

/**
 * Identity provider configuration for social login buttons.
 */
export interface IdentityProvider {
  /** Unique identifier/alias for the provider */
  alias: string;
  /** Display name shown on the button */
  displayName: string;
  /** Provider type (e.g., google, github, facebook) */
  providerId: string;
  /** URL to initiate login with this provider */
  loginUrl: string;
  /** CSS classes for the provider icon */
  iconClasses?: string;
  /** GUI ordering priority */
  guiOrder?: string;
}

/**
 * URLs for various login-related actions.
 */
export interface LoginUrls {
  /** URL for the login form action */
  login: string;
  /** URL for registration page */
  registration?: string;
  /** URL for password reset */
  resetPassword?: string;
  /** Base URL for the realm */
  realmBase?: string;
}

/**
 * Branding configuration for customizing the login UI appearance.
 */
export interface BrandingConfig {
  /** URL to the logo image */
  logoUrl?: string;
  /** Alt text for the logo */
  logoAlt?: string;
  /** Primary brand color */
  primaryColor?: string;
  /** Background image URL */
  backgroundUrl?: string;
  /** Favicon URL */
  faviconUrl?: string;
}

/**
 * Current login state/context.
 */
export interface LoginState {
  /** Pre-filled username value */
  username?: string;
  /** Whether "remember me" is checked */
  rememberMe?: boolean;
  /** Selected credential ID for WebAuthn */
  selectedCredential?: string;
}

/**
 * Error information for form fields.
 */
export interface FormError {
  /** Field name with the error */
  field: string;
  /** Error message */
  message: string;
}

/**
 * Page-level message (info, warning, error, success).
 */
export interface PageMessage {
  /** Message type */
  type: "info" | "warning" | "error" | "success";
  /** Message content */
  summary: string;
}
