import { useState, useCallback, useMemo } from "react";
import type { LoginConfig, IdentityProvider } from "../config";
import { useConfig } from "../context/ConfigProvider";

/**
 * Sign-in form state.
 */
export interface SignInState {
  /** Username or email value */
  username: string;
  /** Password value */
  password: string;
  /** Remember me checkbox state */
  rememberMe: boolean;
  /** Whether the form is currently submitting */
  isSubmitting: boolean;
  /** Validation errors */
  errors: SignInErrors;
  /** Helper text to display (e.g., error message) */
  helperText: string;
  /** Whether to show helper text */
  showHelperText: boolean;
}

/**
 * Validation errors for sign-in form fields.
 */
export interface SignInErrors {
  username?: string;
  password?: string;
  general?: string;
}

/**
 * Actions/setters for sign-in form.
 */
export interface SignInActions {
  /** Set the username value */
  setUsername: (value: string) => void;
  /** Set the password value */
  setPassword: (value: string) => void;
  /** Set the remember me value */
  setRememberMe: (value: boolean) => void;
  /** Set validation errors */
  setErrors: (errors: SignInErrors) => void;
  /** Clear all errors */
  clearErrors: () => void;
  /** Set helper text */
  setHelperText: (text: string, show?: boolean) => void;
  /** Clear helper text */
  clearHelperText: () => void;
  /** Reset form to initial state */
  reset: () => void;
}

/**
 * Form submission utilities.
 */
export interface SignInSubmit {
  /**
   * Submit the form programmatically.
   * @param handler - Optional custom handler. If not provided, submits to loginUrl.
   */
  submit: (handler?: SignInSubmitHandler) => Promise<void>;
  /**
   * Get form data for submission.
   */
  getFormData: () => SignInFormData;
  /**
   * Validate the form and return whether it's valid.
   */
  validate: () => boolean;
}

export type SignInSubmitHandler = (data: SignInFormData) => void | Promise<void>;

export interface SignInFormData {
  username: string;
  password: string;
  rememberMe: boolean;
}

/**
 * Computed/derived values from config.
 */
export interface SignInComputed {
  /** Display name for the realm */
  realmDisplayName: string;
  /** Label for username field */
  usernameLabel: string;
  /** Whether registration is allowed */
  registrationAllowed: boolean;
  /** Whether password reset is allowed */
  resetPasswordAllowed: boolean;
  /** Whether remember me is enabled */
  rememberMeEnabled: boolean;
  /** Registration URL */
  registrationUrl?: string;
  /** Password reset URL */
  resetPasswordUrl?: string;
  /** Login form action URL */
  loginUrl: string;
  /** Available identity providers */
  identityProviders: IdentityProvider[];
  /** Whether there are identity providers */
  hasIdentityProviders: boolean;
  /** Whether password login is enabled */
  passwordEnabled: boolean;
}

/**
 * Return type for useSignIn hook.
 */
export interface UseSignInReturn {
  /** Current form state */
  state: SignInState;
  /** Actions to modify form state */
  actions: SignInActions;
  /** Form submission utilities */
  submit: SignInSubmit;
  /** Computed values from config */
  computed: SignInComputed;
  /** The login configuration */
  config: LoginConfig | null;
  /** Whether config is loading */
  isLoading: boolean;
  /** Config loading error */
  error: Error | null;
}

/**
 * Options for useSignIn hook.
 */
export interface UseSignInOptions {
  /** Initial username value */
  initialUsername?: string;
  /** Initial remember me value */
  initialRememberMe?: boolean;
  /** Login configuration (if not using ConfigProvider) */
  config?: LoginConfig;
  /** Custom validation function */
  validate?: (data: SignInFormData) => SignInErrors | null;
  /** Callback after successful submit */
  onSuccess?: () => void;
  /** Callback on submit error */
  onError?: (error: Error) => void;
}

/**
 * Headless hook for building custom sign-in UIs.
 *
 * Provides all the state management, validation, and submission logic
 * without any UI components. Use this to build your own custom sign-in form.
 *
 * @param options - Hook options
 * @returns Sign-in state, actions, and utilities
 *
 * @example
 * ```tsx
 * function CustomSignIn() {
 *   const { state, actions, submit, computed } = useSignIn();
 *
 *   const handleSubmit = (e: FormEvent) => {
 *     e.preventDefault();
 *     submit.submit();
 *   };
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <input
 *         value={state.username}
 *         onChange={(e) => actions.setUsername(e.target.value)}
 *         placeholder={computed.usernameLabel}
 *       />
 *       <input
 *         type="password"
 *         value={state.password}
 *         onChange={(e) => actions.setPassword(e.target.value)}
 *       />
 *       <button type="submit" disabled={state.isSubmitting}>
 *         Sign In
 *       </button>
 *     </form>
 *   );
 * }
 * ```
 */
export function useSignIn(options: UseSignInOptions = {}): UseSignInReturn {
  // Get config from context or options
  const {
    config: contextConfig,
    isLoading,
    error,
  } = useConfig();
  const config = options.config ?? contextConfig;

  // Form state
  const [username, setUsername] = useState(
    options.initialUsername ?? config?.login?.username ?? ""
  );
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(
    options.initialRememberMe ?? config?.login?.rememberMe ?? false
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<SignInErrors>({});
  const [helperText, setHelperTextValue] = useState("");
  const [showHelperText, setShowHelperText] = useState(false);

  // Computed values
  const computed = useMemo<SignInComputed>(() => {
    const realm = config?.realm;
    const urls = config?.urls;
    const identityProviders = config?.identityProviders ?? [];

    return {
      realmDisplayName: realm?.displayName ?? realm?.name ?? "",
      usernameLabel: realm?.loginWithEmailAllowed
        ? realm.registrationEmailAsUsername
          ? "Email"
          : "Email or username"
        : "Username",
      registrationAllowed: realm?.registrationAllowed ?? false,
      resetPasswordAllowed: realm?.resetPasswordAllowed ?? false,
      rememberMeEnabled: realm?.rememberMe ?? false,
      registrationUrl: urls?.registration,
      resetPasswordUrl: urls?.resetPassword,
      loginUrl: urls?.login ?? "",
      identityProviders,
      hasIdentityProviders: identityProviders.length > 0,
      passwordEnabled: realm?.password ?? true,
    };
  }, [config]);

  // State object
  const state = useMemo<SignInState>(
    () => ({
      username,
      password,
      rememberMe,
      isSubmitting,
      errors,
      helperText,
      showHelperText,
    }),
    [username, password, rememberMe, isSubmitting, errors, helperText, showHelperText]
  );

  // Actions
  const clearErrors = useCallback(() => setErrors({}), []);

  const setHelperText = useCallback((text: string, show = true) => {
    setHelperTextValue(text);
    setShowHelperText(show);
  }, []);

  const clearHelperText = useCallback(() => {
    setHelperTextValue("");
    setShowHelperText(false);
  }, []);

  const reset = useCallback(() => {
    setUsername(options.initialUsername ?? config?.login?.username ?? "");
    setPassword("");
    setRememberMe(options.initialRememberMe ?? config?.login?.rememberMe ?? false);
    setIsSubmitting(false);
    clearErrors();
    clearHelperText();
  }, [options.initialUsername, options.initialRememberMe, config, clearErrors, clearHelperText]);

  const actions = useMemo<SignInActions>(
    () => ({
      setUsername,
      setPassword,
      setRememberMe,
      setErrors,
      clearErrors,
      setHelperText,
      clearHelperText,
      reset,
    }),
    [clearErrors, setHelperText, clearHelperText, reset]
  );

  // Submit utilities
  const getFormData = useCallback(
    (): SignInFormData => ({
      username,
      password,
      rememberMe,
    }),
    [username, password, rememberMe]
  );

  const validate = useCallback((): boolean => {
    const data = getFormData();

    // Custom validation
    if (options.validate) {
      const customErrors = options.validate(data);
      if (customErrors) {
        setErrors(customErrors);
        return false;
      }
    }

    // Default validation
    const newErrors: SignInErrors = {};

    if (!data.username.trim()) {
      newErrors.username = "Username is required";
    }

    if (!data.password) {
      newErrors.password = "Password is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    }

    return true;
  }, [getFormData, options]);

  const submit = useCallback(
    async (handler?: SignInSubmitHandler) => {
      clearErrors();
      clearHelperText();

      if (!validate()) {
        return;
      }

      setIsSubmitting(true);

      try {
        const data = getFormData();

        if (handler) {
          await handler(data);
        } else {
          // Default: submit to loginUrl via form
          const form = document.createElement("form");
          form.method = "POST";
          form.action = computed.loginUrl;

          const usernameInput = document.createElement("input");
          usernameInput.type = "hidden";
          usernameInput.name = "username";
          usernameInput.value = data.username;
          form.appendChild(usernameInput);

          const passwordInput = document.createElement("input");
          passwordInput.type = "hidden";
          passwordInput.name = "password";
          passwordInput.value = data.password;
          form.appendChild(passwordInput);

          if (data.rememberMe) {
            const rememberMeInput = document.createElement("input");
            rememberMeInput.type = "hidden";
            rememberMeInput.name = "rememberMe";
            rememberMeInput.value = "on";
            form.appendChild(rememberMeInput);
          }

          document.body.appendChild(form);
          form.submit();
          return; // Form submission will navigate away
        }

        options.onSuccess?.();
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Sign in failed");
        setHelperText(error.message);
        options.onError?.(error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      validate,
      getFormData,
      computed.loginUrl,
      clearErrors,
      clearHelperText,
      setHelperText,
      options,
    ]
  );

  const submitUtils = useMemo<SignInSubmit>(
    () => ({
      submit,
      getFormData,
      validate,
    }),
    [submit, getFormData, validate]
  );

  return {
    state,
    actions,
    submit: submitUtils,
    computed,
    config,
    isLoading,
    error,
  };
}
