import { type ReactNode, type ButtonHTMLAttributes } from "react";
import { useAuth } from "./KeycloakAuthProvider";

export interface SignInButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  /** 
   * Button content. Defaults to "Sign in".
   */
  children?: ReactNode;
  /**
   * URL to redirect to after sign in.
   */
  redirectUri?: string;
  /**
   * Render as a different element (render prop pattern).
   */
  asChild?: boolean;
}

/**
 * A button that triggers sign in when clicked.
 *
 * @example
 * ```tsx
 * // Default button
 * <SignInButton />
 *
 * // Custom text
 * <SignInButton>Log in to continue</SignInButton>
 *
 * // With redirect
 * <SignInButton redirectUri="/dashboard">Sign In</SignInButton>
 * ```
 */
export function SignInButton({ 
  children = "Sign in", 
  redirectUri,
  ...props 
}: SignInButtonProps) {
  const { signIn } = useAuth();

  const handleClick = () => {
    signIn({ redirectUri });
  };

  return (
    <button type="button" onClick={handleClick} {...props}>
      {children}
    </button>
  );
}

SignInButton.displayName = "SignInButton";

export interface SignUpButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  /** 
   * Button content. Defaults to "Sign up".
   */
  children?: ReactNode;
  /**
   * URL to redirect to after sign up.
   */
  redirectUri?: string;
}

/**
 * A button that triggers sign up (registration) when clicked.
 *
 * @example
 * ```tsx
 * <SignUpButton>Create an account</SignUpButton>
 * ```
 */
export function SignUpButton({ 
  children = "Sign up", 
  redirectUri,
  ...props 
}: SignUpButtonProps) {
  const { signUp } = useAuth();

  const handleClick = () => {
    signUp({ redirectUri });
  };

  return (
    <button type="button" onClick={handleClick} {...props}>
      {children}
    </button>
  );
}

SignUpButton.displayName = "SignUpButton";

export interface SignOutButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  /** 
   * Button content. Defaults to "Sign out".
   */
  children?: ReactNode;
  /**
   * URL to redirect to after sign out.
   */
  redirectUri?: string;
}

/**
 * A button that triggers sign out when clicked.
 *
 * @example
 * ```tsx
 * <SignOutButton>Log out</SignOutButton>
 * ```
 */
export function SignOutButton({ 
  children = "Sign out", 
  redirectUri,
  ...props 
}: SignOutButtonProps) {
  const { signOut } = useAuth();

  const handleClick = () => {
    signOut({ redirectUri });
  };

  return (
    <button type="button" onClick={handleClick} {...props}>
      {children}
    </button>
  );
}

SignOutButton.displayName = "SignOutButton";
