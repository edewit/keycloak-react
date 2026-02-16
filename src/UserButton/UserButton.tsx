import { useState, useMemo, useRef, useContext, type ReactNode } from "react";
import {
  Dropdown,
  DropdownList,
  DropdownItem,
  DropdownGroup,
  MenuToggle,
  Divider,
} from "@patternfly/react-core";
import { UserAvatar, decodeToken, type UserAvatarSize, type UserTokenClaims } from "../UserAvatar";
import { AuthContext } from "../auth/AuthContext";
import "./UserButton.css";

export interface UserButtonMenuItem {
  /**
   * Unique key for the menu item.
   */
  key: string;
  /**
   * Label text for the menu item.
   */
  label: string;
  /**
   * Optional icon to display before the label.
   */
  icon?: ReactNode;
  /**
   * Click handler for the menu item.
   */
  onClick?: () => void;
  /**
   * URL to navigate to when clicked (alternative to onClick).
   */
  href?: string;
  /**
   * Whether the item is disabled.
   */
  isDisabled?: boolean;
  /**
   * Whether this is a danger/destructive action (styled in red).
   */
  isDanger?: boolean;
}

export interface UserButtonProps {
  /**
   * JWT token (ID token or access token) from Keycloak.
   * When provided, user info will be extracted from the token.
   */
  token?: string;
  /**
   * URL to the user's profile image.
   * Overrides the `picture` claim from token.
   */
  imageUrl?: string;
  /**
   * User's first name.
   * Overrides the `given_name` claim from token.
   */
  firstName?: string;
  /**
   * User's last name.
   * Overrides the `family_name` claim from token.
   */
  lastName?: string;
  /**
   * User's full name.
   * Overrides the `name` claim from token.
   */
  name?: string;
  /**
   * User's email address.
   * Overrides the `email` claim from token.
   */
  email?: string;
  /**
   * Size of the avatar.
   * @default "md"
   */
  avatarSize?: UserAvatarSize;
  /**
   * URL for the "Manage account" link.
   * If not provided, the manage account option won't be shown.
   */
  manageAccountUrl?: string;
  /**
   * Label for the manage account menu item.
   * @default "Manage account"
   */
  manageAccountLabel?: string;
  /**
   * URL to redirect to after sign out.
   */
  afterSignOutUrl?: string;
  /**
   * Callback when sign out is clicked.
   * If provided, this will be called instead of navigating to signOutUrl.
   */
  onSignOut?: () => void | Promise<void>;
  /**
   * URL for the sign out action.
   * Required if onSignOut is not provided.
   */
  signOutUrl?: string;
  /**
   * Label for the sign out menu item.
   * @default "Sign out"
   */
  signOutLabel?: string;
  /**
   * Whether to show the sign out option.
   * @default true
   */
  showSignOut?: boolean;
  /**
   * Custom menu items to display before the default items.
   */
  menuItems?: UserButtonMenuItem[];
  /**
   * Custom menu items to display after the default items (before sign out).
   */
  menuItemsAfter?: UserButtonMenuItem[];
  /**
   * Whether to show user info (name/email) in the dropdown header.
   * @default true
   */
  showUserInfo?: boolean;
  /**
   * Additional CSS class name.
   */
  className?: string;
}

/**
 * A user button component that displays the user's avatar and opens a dropdown menu
 * with user info, account management, and sign out options.
 *
 * Similar to Clerk's UserButton, this component:
 * - Shows the user's avatar as a clickable button
 * - Opens a dropdown with user information
 * - Provides sign out and account management options
 * - Supports custom menu items
 * - Can extract user info from a Keycloak JWT token
 *
 * @example
 * ```tsx
 * // Basic usage with token
 * <UserButton
 *   token={keycloak.idToken}
 *   signOutUrl="/logout"
 *   manageAccountUrl="/account"
 * />
 *
 * // With custom menu items
 * <UserButton
 *   token={keycloak.idToken}
 *   onSignOut={() => keycloak.logout()}
 *   menuItems={[
 *     { key: 'profile', label: 'Profile', onClick: () => navigate('/profile') },
 *     { key: 'settings', label: 'Settings', href: '/settings' },
 *   ]}
 * />
 *
 * // Manual user info
 * <UserButton
 *   name="John Doe"
 *   email="john@example.com"
 *   imageUrl="/avatar.jpg"
 *   onSignOut={handleSignOut}
 * />
 * ```
 */
export function UserButton({
  token,
  imageUrl,
  firstName,
  lastName,
  name,
  email,
  avatarSize = "md",
  manageAccountUrl,
  manageAccountLabel = "Manage account",
  afterSignOutUrl,
  onSignOut,
  signOutUrl,
  signOutLabel = "Sign out",
  showSignOut = true,
  menuItems = [],
  menuItemsAfter = [],
  showUserInfo = true,
  className,
}: UserButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Try to get user and auth methods from context (if available)
  const authContext = useContext(AuthContext);
  const contextUser = authContext?.user;
  const contextSignOut = authContext?.signOut;

  // Extract claims from token if provided
  const tokenClaims = useMemo((): UserTokenClaims | null => {
    if (!token) return null;
    return decodeToken(token);
  }, [token]);

  // Resolve values: explicit props > token claims > context user
  const resolvedImageUrl = imageUrl ?? tokenClaims?.picture ?? contextUser?.imageUrl;
  const resolvedFirstName = firstName ?? tokenClaims?.given_name ?? contextUser?.firstName;
  const resolvedLastName = lastName ?? tokenClaims?.family_name ?? contextUser?.lastName;
  const resolvedName = name ?? tokenClaims?.name ?? contextUser?.name;
  const resolvedEmail = email ?? tokenClaims?.email ?? contextUser?.email;
  const resolvedUsername = tokenClaims?.preferred_username ?? contextUser?.username;

  // Compute display name
  const displayName = useMemo(() => {
    if (resolvedName) return resolvedName;
    if (resolvedFirstName && resolvedLastName) return `${resolvedFirstName} ${resolvedLastName}`;
    if (resolvedFirstName) return resolvedFirstName;
    if (resolvedLastName) return resolvedLastName;
    return resolvedUsername ?? "";
  }, [resolvedName, resolvedFirstName, resolvedLastName, resolvedUsername]);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const handleSelect = () => {
    setIsOpen(false);
  };

  const handleSignOutClick = async () => {
    setIsOpen(false);
    if (onSignOut) {
      await onSignOut();
      if (afterSignOutUrl) {
        window.location.href = afterSignOutUrl;
      }
    } else if (contextSignOut) {
      // Use context sign out if available
      await contextSignOut({ redirectUri: afterSignOutUrl });
    } else if (signOutUrl) {
      window.location.href = signOutUrl;
    }
  };

  const handleMenuItemClick = (item: UserButtonMenuItem) => {
    setIsOpen(false);
    if (item.onClick) {
      item.onClick();
    } else if (item.href) {
      window.location.href = item.href;
    }
  };

  const renderMenuItem = (item: UserButtonMenuItem) => (
    <DropdownItem
      key={item.key}
      onClick={() => handleMenuItemClick(item)}
      isDisabled={item.isDisabled}
      isDanger={item.isDanger}
      icon={item.icon}
    >
      {item.label}
    </DropdownItem>
  );

  return (
    <div className={`kc-user-button ${className ?? ""}`}>
      <Dropdown
        isOpen={isOpen}
        onSelect={handleSelect}
        onOpenChange={setIsOpen}
        toggle={(toggleRef) => (
          <MenuToggle
            ref={toggleRef}
            onClick={handleToggle}
            isExpanded={isOpen}
            variant="plain"
            className="kc-user-button__toggle"
            aria-label="User menu"
          >
            <UserAvatar
              imageUrl={resolvedImageUrl}
              firstName={resolvedFirstName}
              lastName={resolvedLastName}
              name={resolvedName}
              size={avatarSize}
            />
          </MenuToggle>
        )}
        ref={menuRef}
        popperProps={{ position: "right" }}
      >
        <DropdownList>
          {/* User info header */}
          {showUserInfo && (displayName || resolvedEmail) && (
            <DropdownGroup>
              <div className="kc-user-button__user-info">
                <UserAvatar
                  imageUrl={resolvedImageUrl}
                  firstName={resolvedFirstName}
                  lastName={resolvedLastName}
                  name={resolvedName}
                  size="lg"
                />
                <div className="kc-user-button__user-details">
                  {displayName && (
                    <span className="kc-user-button__user-name">{displayName}</span>
                  )}
                  {resolvedEmail && (
                    <span className="kc-user-button__user-email">{resolvedEmail}</span>
                  )}
                </div>
              </div>
            </DropdownGroup>
          )}

          {showUserInfo && (displayName || resolvedEmail) && <Divider />}

          {/* Custom menu items (before) */}
          {menuItems.length > 0 && (
            <>
              {menuItems.map(renderMenuItem)}
              <Divider />
            </>
          )}

          {/* Manage account */}
          {manageAccountUrl && (
            <DropdownItem
              key="manage-account"
              onClick={() => {
                setIsOpen(false);
                window.location.href = manageAccountUrl;
              }}
            >
              {manageAccountLabel}
            </DropdownItem>
          )}

          {/* Custom menu items (after) */}
          {menuItemsAfter.length > 0 && (
            <>
              {menuItemsAfter.map(renderMenuItem)}
            </>
          )}

          {/* Sign out */}
          {showSignOut && (onSignOut || contextSignOut || signOutUrl) && (
            <>
              {(manageAccountUrl || menuItemsAfter.length > 0) && <Divider />}
              <DropdownItem
                key="sign-out"
                onClick={handleSignOutClick}
                isDanger
              >
                {signOutLabel}
              </DropdownItem>
            </>
          )}
        </DropdownList>
      </Dropdown>
    </div>
  );
}

UserButton.displayName = "UserButton";
