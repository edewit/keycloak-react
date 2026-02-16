import { useState, useCallback, useEffect, useMemo, type FormEvent } from "react";
import {
  LoginPage,
  LoginForm,
  ListVariant,
  LoginMainFooterBandItem,
} from "@patternfly/react-core";
import type { LoginConfig } from "../config";
import { SocialButtons } from "./SocialButtons";
import { useConfig } from "../context/ConfigProvider";
import { applyAppearance, clearAppearance, type Appearance } from "../theme/appearance";
import "./SignIn.css";

export interface SignInProps {
  /**
   * Login configuration. If not provided, will use config from ConfigProvider context.
   */
  config?: LoginConfig;
  /**
   * Appearance/theming configuration.
   */
  appearance?: Appearance;
  /**
   * URL to redirect to after successful sign in.
   */
  afterSignInUrl?: string;
  /**
   * URL for the sign up page. Overrides config.urls.registration.
   */
  signUpUrl?: string;
  /**
   * Brand logo image source URL. Overrides config.branding.logoUrl.
   */
  brandImgSrc?: string;
  /**
   * Alt text for brand logo.
   */
  brandImgAlt?: string;
  /**
   * Background image source URL. Overrides config.branding.backgroundUrl.
   */
  backgroundImgSrc?: string;
  /**
   * Title text for the login page.
   */
  loginTitle?: string;
  /**
   * Subtitle text for the login page.
   */
  loginSubtitle?: string;
  /**
   * Text content for the footer.
   */
  footerText?: string;
  /**
   * Callback when form is submitted.
   * If provided, prevents default form submission and calls this instead.
   */
  onSubmit?: (data: SignInFormData) => void | Promise<void>;
  /**
   * Custom className for the component.
   */
  className?: string;
}

export interface SignInFormData {
  username: string;
  password: string;
  rememberMe: boolean;
}

/**
 * A complete sign-in component that renders a login form with social login options.
 *
 * Uses PatternFly's LoginPage and LoginForm components with Keycloak configuration.
 *
 * @example
 * ```tsx
 * // Basic usage with ConfigProvider
 * <ConfigProvider config={loginConfig}>
 *   <SignIn />
 * </ConfigProvider>
 *
 * // With appearance customization
 * <SignIn
 *   config={loginConfig}
 *   appearance={{
 *     variables: { colorPrimary: '#6366f1' },
 *     elements: { card: 'my-custom-card' }
 *   }}
 *   afterSignInUrl="/dashboard"
 * />
 * ```
 */
export function SignIn({
  config: configProp,
  appearance,
  afterSignInUrl,
  signUpUrl,
  brandImgSrc,
  brandImgAlt = "Keycloak",
  backgroundImgSrc,
  loginTitle,
  loginSubtitle,
  footerText,
  onSubmit,
  className,
}: SignInProps) {
  // Get config from props or context
  const { config: contextConfig } = useConfig();
  const config = configProp ?? contextConfig;

  // Form state
  const [username, setUsername] = useState(config?.login?.username ?? "");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(config?.login?.rememberMe ?? false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHelperText, setShowHelperText] = useState(false);
  const [helperText, setHelperText] = useState("");

  // Serialize appearance for stable dependency comparison
  const appearanceKey = useMemo(
    () => JSON.stringify(appearance ?? {}),
    [appearance]
  );

  // Apply appearance styles when appearance prop changes
  useEffect(() => {
    // Always clear first, then apply new appearance
    clearAppearance();
    if (appearance) {
      applyAppearance(appearance);
    }
    // Cleanup on unmount
    return () => {
      clearAppearance();
    };
  }, [appearanceKey, appearance]);

  // Derived values from config
  const realm = config?.realm;
  const identityProviders = config?.identityProviders ?? [];
  const urls = config?.urls;

  // Resolve URLs
  const registrationUrl = signUpUrl ?? urls?.registration;
  const resetPasswordUrl = urls?.resetPassword;
  const loginActionUrl = urls?.login ?? "";

  // Resolve branding
  const logoUrl = brandImgSrc ?? config?.branding?.logoUrl;
  const logoAlt = brandImgAlt ?? config?.branding?.logoAlt ?? "Logo";
  const bgUrl = backgroundImgSrc ?? config?.branding?.backgroundUrl;

  // Resolve labels
  const title = loginTitle ?? realm?.displayName ?? "Sign in to your account";
  const subtitle = loginSubtitle;
  const usernameLabel = realm?.loginWithEmailAllowed
    ? realm.registrationEmailAsUsername
      ? "Email"
      : "Email or username"
    : "Username";

  // Handlers
  const handleUsernameChange = useCallback(
    (_event: FormEvent<HTMLInputElement>, value: string) => {
      setUsername(value);
    },
    []
  );

  const handlePasswordChange = useCallback(
    (_event: FormEvent<HTMLInputElement>, value: string) => {
      setPassword(value);
    },
    []
  );

  const handleRememberMeChange = useCallback(
    (_event: FormEvent<HTMLInputElement>, checked: boolean) => {
      setRememberMe(checked);
    },
    []
  );

  const handleSubmit = useCallback(
    async (event: React.MouseEvent<HTMLButtonElement>) => {
      // If onSubmit callback is provided, handle it ourselves
      if (onSubmit) {
        event.preventDefault();
        setIsSubmitting(true);
        setShowHelperText(false);

        try {
          await onSubmit({ username, password, rememberMe });
          // If afterSignInUrl is provided, redirect
          if (afterSignInUrl) {
            window.location.href = afterSignInUrl;
          }
        } catch (error) {
          setShowHelperText(true);
          setHelperText(
            error instanceof Error ? error.message : "Sign in failed"
          );
        } finally {
          setIsSubmitting(false);
        }
      }
      // Otherwise, let the form submit naturally to loginActionUrl
    },
    [onSubmit, username, password, rememberMe, afterSignInUrl]
  );

  // Build social login content
  const socialMediaLoginContent =
    identityProviders.length > 0 ? (
      <SocialButtons providers={identityProviders} />
    ) : undefined;

  // Build forgot credentials link
  const forgotCredentials =
    realm?.resetPasswordAllowed && resetPasswordUrl ? (
      <LoginMainFooterBandItem>
        <a href={resetPasswordUrl}>Forgot password?</a>
      </LoginMainFooterBandItem>
    ) : undefined;

  // Build sign up message
  const signUpForAccountMessage =
    realm?.registrationAllowed && registrationUrl ? (
      <LoginMainFooterBandItem>
        Don&apos;t have an account? <a href={registrationUrl}>Sign up</a>
      </LoginMainFooterBandItem>
    ) : undefined;

  // Build the login form
  const loginForm = (
    <LoginForm
      className="kc-login-form"
      action={loginActionUrl}
      method="post"
      showHelperText={showHelperText}
      helperText={helperText}
      usernameLabel={usernameLabel}
      usernameValue={username}
      onChangeUsername={handleUsernameChange}
      passwordLabel="Password"
      passwordValue={password}
      onChangePassword={handlePasswordChange}
      isShowPasswordEnabled
      rememberMeLabel={realm?.rememberMe ? "Remember me" : ""}
      isRememberMeChecked={rememberMe}
      onChangeRememberMe={handleRememberMeChange}
      loginButtonLabel="Sign In"
      isLoginButtonDisabled={isSubmitting}
      onLoginButtonClick={handleSubmit}
    >
      {/* Hidden inputs for native form submission */}
      {config?.login?.selectedCredential && (
        <input
          type="hidden"
          name="credentialId"
          value={config.login.selectedCredential}
        />
      )}
    </LoginForm>
  );

  return (
    <div className={`kc-sign-in ${className ?? ""}`}>
      <LoginPage
        brandImgSrc={logoUrl}
        brandImgAlt={logoAlt}
        backgroundImgSrc={bgUrl}
        loginTitle={title}
        loginSubtitle={subtitle}
        socialMediaLoginContent={socialMediaLoginContent}
        socialMediaLoginAriaLabel="Social login options"
        forgotCredentials={forgotCredentials}
        signUpForAccountMessage={signUpForAccountMessage}
        textContent={footerText}
        footerListVariants={ListVariant.inline}
      >
        {loginForm}
      </LoginPage>
    </div>
  );
}

SignIn.displayName = "SignIn";
