import { useState, useMemo, useContext, type CSSProperties } from "react";
import { AuthContext } from "../auth/AuthContext";
import "./UserAvatar.css";

export type UserAvatarSize = "sm" | "md" | "lg" | "xl";

/**
 * Standard OIDC/Keycloak token claims relevant to user profile.
 */
export interface UserTokenClaims {
  /** URL to user's profile picture */
  picture?: string;
  /** Full name */
  name?: string;
  /** First/given name */
  given_name?: string;
  /** Last/family name */
  family_name?: string;
  /** Preferred username */
  preferred_username?: string;
  /** Email address */
  email?: string;
  /** Subject (user ID) */
  sub?: string;
}

export interface UserAvatarProps {
  /**
   * JWT token (ID token or access token) from Keycloak.
   * When provided, user info (picture, name) will be extracted from the token.
   * Token claims have lower priority than explicit props.
   */
  token?: string;
  /**
   * URL to the user's profile image.
   * Overrides the `picture` claim from token.
   */
  imageUrl?: string;
  /**
   * User's first name (used for generating initials).
   * Overrides the `given_name` claim from token.
   */
  firstName?: string;
  /**
   * User's last name (used for generating initials).
   * Overrides the `family_name` claim from token.
   */
  lastName?: string;
  /**
   * User's full name (alternative to firstName/lastName).
   * Will be parsed to extract initials.
   * Overrides the `name` claim from token.
   */
  name?: string;
  /**
   * Custom initials to display (overrides generated initials).
   */
  initials?: string;
  /**
   * Size of the avatar.
   * @default "md"
   */
  size?: UserAvatarSize;
  /**
   * Custom size in pixels (overrides size prop).
   */
  customSize?: number;
  /**
   * Whether to show a border around the avatar.
   * @default false
   */
  showBorder?: boolean;
  /**
   * Background color for initials fallback.
   * If not provided, a color will be generated based on the name.
   */
  backgroundColor?: string;
  /**
   * Text color for initials.
   * @default "white"
   */
  textColor?: string;
  /**
   * Alt text for the image.
   */
  alt?: string;
  /**
   * Additional CSS class name.
   */
  className?: string;
  /**
   * Inline styles to apply to the avatar.
   */
  style?: CSSProperties;
  /**
   * Callback when the avatar is clicked.
   */
  onClick?: () => void;
}

/**
 * Decodes a JWT token and extracts the payload.
 * Note: This does NOT verify the token signature - that should be done server-side.
 */
export function decodeToken(token: string): UserTokenClaims | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }
    // Decode the payload (second part)
    const payload = parts[1];
    // Handle base64url encoding (replace - with + and _ with /)
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/**
 * Extracts user profile information from a JWT token.
 */
export function getUserFromToken(token: string): UserTokenClaims | null {
  return decodeToken(token);
}

/**
 * Size values in pixels for each size variant.
 */
const SIZE_MAP: Record<UserAvatarSize, number> = {
  sm: 24,
  md: 32,
  lg: 48,
  xl: 64,
};

/**
 * Font size ratios relative to avatar size.
 */
const FONT_SIZE_RATIO = 0.4;

/**
 * Generates initials from a name string.
 */
function getInitialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "";
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Generates a consistent color based on a string (name).
 * Uses a simple hash function to generate a hue value.
 */
function generateColorFromString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 65%, 45%)`;
}

/**
 * A user avatar component that displays a profile image or falls back to initials.
 *
 * Similar to Clerk's UserAvatar, this component:
 * - Shows the user's profile picture when available
 * - Falls back to colored initials when no image is provided
 * - Supports multiple sizes and custom sizing
 * - Generates consistent colors based on the user's name
 * - Can extract user info from a Keycloak JWT token
 *
 * @example
 * ```tsx
 * // With JWT token from Keycloak
 * <UserAvatar token={keycloak.idToken} />
 *
 * // With image
 * <UserAvatar
 *   imageUrl="https://example.com/avatar.jpg"
 *   name="John Doe"
 * />
 *
 * // With initials fallback
 * <UserAvatar
 *   firstName="John"
 *   lastName="Doe"
 *   size="lg"
 * />
 *
 * // Custom size
 * <UserAvatar
 *   name="Jane Smith"
 *   customSize={100}
 * />
 * ```
 */
export function UserAvatar({
  token,
  imageUrl,
  firstName,
  lastName,
  name,
  initials: customInitials,
  size = "md",
  customSize,
  showBorder = false,
  backgroundColor,
  textColor = "white",
  alt,
  className,
  style,
  onClick,
}: UserAvatarProps) {
  const [imageError, setImageError] = useState(false);
  
  // Try to get user from auth context (if available)
  const authContext = useContext(AuthContext);
  const contextUser = authContext?.user;

  // Extract claims from token if provided
  const tokenClaims = useMemo(() => {
    if (!token) return null;
    return decodeToken(token);
  }, [token]);

  // Resolve values: explicit props > token claims > context user
  const resolvedImageUrl = imageUrl ?? tokenClaims?.picture ?? contextUser?.imageUrl;
  const resolvedFirstName = firstName ?? tokenClaims?.given_name ?? contextUser?.firstName;
  const resolvedLastName = lastName ?? tokenClaims?.family_name ?? contextUser?.lastName;
  const resolvedName = name ?? tokenClaims?.name ?? contextUser?.name;
  
  // Fallback to username or email for display if no name available
  const fallbackName = tokenClaims?.preferred_username ?? tokenClaims?.email ?? contextUser?.username ?? contextUser?.email;

  // Compute the display name
  const displayName = useMemo(() => {
    if (resolvedName) return resolvedName;
    if (resolvedFirstName && resolvedLastName) return `${resolvedFirstName} ${resolvedLastName}`;
    if (resolvedFirstName) return resolvedFirstName;
    if (resolvedLastName) return resolvedLastName;
    if (fallbackName) return fallbackName;
    return "";
  }, [resolvedName, resolvedFirstName, resolvedLastName, fallbackName]);

  // Compute initials
  const initials = useMemo(() => {
    if (customInitials) return customInitials;
    if (resolvedFirstName && resolvedLastName) {
      return (resolvedFirstName.charAt(0) + resolvedLastName.charAt(0)).toUpperCase();
    }
    if (resolvedFirstName) return resolvedFirstName.charAt(0).toUpperCase();
    if (resolvedLastName) return resolvedLastName.charAt(0).toUpperCase();
    if (resolvedName) return getInitialsFromName(resolvedName);
    if (fallbackName) return fallbackName.charAt(0).toUpperCase();
    return "?";
  }, [customInitials, resolvedFirstName, resolvedLastName, resolvedName, fallbackName]);

  // Compute background color for initials
  const bgColor = useMemo(() => {
    if (backgroundColor) return backgroundColor;
    return generateColorFromString(displayName || "user");
  }, [backgroundColor, displayName]);

  // Compute sizes
  const avatarSize = customSize ?? SIZE_MAP[size];
  const fontSize = Math.round(avatarSize * FONT_SIZE_RATIO);

  // Should show image or initials?
  const showImage = resolvedImageUrl && !imageError;

  // Build style object
  const avatarStyle: CSSProperties = {
    width: avatarSize,
    height: avatarSize,
    fontSize: showImage ? undefined : fontSize,
    backgroundColor: showImage ? undefined : bgColor,
    color: showImage ? undefined : textColor,
    ...style,
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleClick = onClick
    ? (e: React.MouseEvent) => {
        e.preventDefault();
        onClick();
      }
    : undefined;

  const altText = alt ?? displayName ?? "User avatar";

  const classNames = [
    "kc-user-avatar",
    `kc-user-avatar--${size}`,
    showBorder && "kc-user-avatar--bordered",
    onClick && "kc-user-avatar--clickable",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={classNames}
      style={avatarStyle}
      onClick={handleClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      aria-label={onClick ? altText : undefined}
    >
      {showImage ? (
        <img
          src={resolvedImageUrl}
          alt={altText}
          className="kc-user-avatar__image"
          onError={handleImageError}
        />
      ) : (
        <span className="kc-user-avatar__initials" aria-hidden="true">
          {initials}
        </span>
      )}
    </div>
  );
}

UserAvatar.displayName = "UserAvatar";
