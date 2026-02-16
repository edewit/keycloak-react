import type { IdentityProvider } from "../config";
import { ProviderIcon } from "./ProviderIcon";

export interface SocialButtonsProps {
  /**
   * List of identity providers to display.
   */
  providers: IdentityProvider[];
  /**
   * Whether to show as a grid (icon-only) when there are many providers.
   * Defaults to true when there are more than 3 providers.
   */
  showAsGrid?: boolean;
  /**
   * Custom className for the container.
   */
  className?: string;
}

/**
 * Renders social login buttons for identity providers.
 * 
 * @example
 * ```tsx
 * <SocialButtons
 *   providers={[
 *     { alias: 'google', displayName: 'Google', providerId: 'google', loginUrl: '/auth/google' },
 *     { alias: 'github', displayName: 'GitHub', providerId: 'github', loginUrl: '/auth/github' },
 *   ]}
 * />
 * ```
 */
export function SocialButtons({
  providers,
  showAsGrid,
  className,
}: SocialButtonsProps) {
  // Default to grid layout if more than 3 providers
  const useGrid = showAsGrid ?? providers.length > 3;

  if (providers.length === 0) {
    return null;
  }

  return (
    <div
      className={`kc-social-buttons ${useGrid ? "kc-social-buttons--grid" : ""} ${className ?? ""}`}
    >
      {providers.map((provider) => (
        <SocialButton key={provider.alias} provider={provider} />
      ))}
    </div>
  );
}

SocialButtons.displayName = "SocialButtons";

interface SocialButtonProps {
  provider: IdentityProvider;
}

function SocialButton({ provider }: SocialButtonProps) {
  return (
    <a
      href={provider.loginUrl}
      className="kc-social-button"
      id={`social-${provider.alias}`}
      aria-label={`Sign in with ${provider.displayName}`}
    >
      <span className="kc-social-button-icon">
        <ProviderIcon providerId={provider.providerId} iconClasses={provider.iconClasses} />
      </span>
      <span className="kc-social-button-text">{provider.displayName}</span>
    </a>
  );
}
