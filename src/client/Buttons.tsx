"use client";

import { type ReactNode, type ButtonHTMLAttributes } from "react";
import { useAuth } from "./AuthProvider";

export interface SignInButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> {
  /**
   * Button content. Defaults to "Sign in".
   */
  children?: ReactNode;
  /**
   * URL to redirect to after sign in.
   */
  callbackUrl?: string;
}

/**
 * A button that triggers sign in when clicked.
 *
 * @example
 * ```tsx
 * "use client";
 *
 * // Default button
 * <SignInButton />
 *
 * // Custom text
 * <SignInButton>Log in to continue</SignInButton>
 *
 * // With redirect
 * <SignInButton callbackUrl="/dashboard">Sign In</SignInButton>
 * ```
 */
export function SignInButton({
  children = "Sign in",
  callbackUrl,
  ...props
}: SignInButtonProps) {
  const { signIn } = useAuth();

  const handleClick = () => {
    signIn({ callbackUrl });
  };

  return (
    <button type="button" onClick={handleClick} {...props}>
      {children}
    </button>
  );
}

SignInButton.displayName = "SignInButton";

export interface SignOutButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> {
  /**
   * Button content. Defaults to "Sign out".
   */
  children?: ReactNode;
  /**
   * URL to redirect to after sign out.
   */
  callbackUrl?: string;
}

/**
 * A button that triggers sign out when clicked.
 *
 * @example
 * ```tsx
 * "use client";
 *
 * <SignOutButton>Log out</SignOutButton>
 * ```
 */
export function SignOutButton({
  children = "Sign out",
  callbackUrl,
  ...props
}: SignOutButtonProps) {
  const { signOut } = useAuth();

  const handleClick = () => {
    signOut({ callbackUrl });
  };

  return (
    <button type="button" onClick={handleClick} {...props}>
      {children}
    </button>
  );
}

SignOutButton.displayName = "SignOutButton";
