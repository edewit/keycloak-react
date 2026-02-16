# Keycloak React

React components for Keycloak authentication, inspired by [Clerk](https://clerk.com/). Provides a complete authentication solution including:

- Drop-in authentication provider wrapping keycloak-js
- Pre-built UI components (sign-in form, user avatar, user menu)
- Conditional rendering components (SignedIn, SignedOut, Protect)
- Headless hooks for custom UI

> **Note:** This library is designed for **client-side rendering only**. It relies on browser APIs (`window`, `document`) and the `keycloak-js` library, which requires browser-based OAuth redirect flows. If you're using an SSR framework like Next.js or Remix, you'll need to ensure these components only render on the client (e.g., using `"use client"` directives or dynamic imports with `ssr: false`).

## Installation

```bash
npm install keycloak-react
```

## Quick Start

```tsx
import {
  KeycloakAuthProvider,
  SignedIn,
  SignedOut,
  UserButton,
  SignInButton,
} from "keycloak-react";
import "keycloak-react/styles.css";

function App() {
  return (
    <KeycloakAuthProvider url="https://keycloak.example.com" realm="myrealm" clientId="my-app">
      <header>
        <SignedIn>
          <UserButton />
        </SignedIn>
        <SignedOut>
          <SignInButton>Sign In</SignInButton>
        </SignedOut>
      </header>
      <main>
        <SignedIn>
          <Dashboard />
        </SignedIn>
        <SignedOut>
          <WelcomePage />
        </SignedOut>
      </main>
    </KeycloakAuthProvider>
  );
}
```

### Account Components (Optional)

For account management features, import from the separate `keycloak-react/account` entry point. This keeps the main bundle small if you don't need account UI.

```tsx
import {
  KeycloakProvider,
  PersonalInfo, // User profile editing
  DeviceActivity, // Active sessions/devices
  LinkedAccounts, // Connected social accounts
  SigningIn, // Authentication methods (passwords, 2FA)
  Applications, // Authorized applications
  Groups, // User's groups
  Organizations, // Organizations (if enabled)
  Page, // Layout wrapper
  PageNav, // Navigation sidebar
} from "keycloak-react/account";

// Provide environment directly
const environment = {
  serverBaseUrl: "http://localhost:8080",
  realm: "master",
  clientId: "my-app",
  resourceUrl: ".",
  logo: "/logo.svg",
  logoUrl: "/",
};

function ProfilePage() {
  return (
    <KeycloakProvider environment={environment}>
      <Page>
        <PersonalInfo />
      </Page>
    </KeycloakProvider>
  );
}
```

Alternatively, if running inside Keycloak (e.g., as a theme), use `getInjectedEnvironment()` to read the environment from a script tag in the DOM:

```tsx
import { getInjectedEnvironment } from "keycloak-react/account";

// Reads from <script id="environment" type="application/json">...</script>
const environment = getInjectedEnvironment();
```

API methods are also available for custom implementations:

```tsx
import {
  getPersonalInfo,
  savePersonalInfo,
  getDevices,
  deleteSession,
  getLinkedAccounts,
  getApplications,
} from "keycloak-react/account";
```

## Configuration

The library needs login configuration to render the sign-in form. There are three ways to provide this configuration:

### Option 1: Pass config directly (no server dependency)

If you already have the configuration available, pass it directly:

```tsx
const myConfig = {
  realm: { displayName: 'My Realm', registrationAllowed: true, ... },
  urls: { login: '/auth/login', ... },
  identityProviders: [...],
  // ... other config
};

<ConfigProvider config={myConfig}>
  <SignIn />
</ConfigProvider>
```

### Option 2: Fetch from Keycloak server

To fetch configuration dynamically from your Keycloak server, you need to install the [keycloak-login-config-provider](https://github.com/edewit/keycloak-login-config-provider) SPI on your Keycloak server. This provider exposes a `/realms/{realm}/login-config` endpoint.

```tsx
<ConfigProvider keycloakUrl="https://keycloak.example.com" realm="myrealm">
  <SignIn />
</ConfigProvider>
```

### Option 3: Load from DOM (for Keycloak themes)

When building custom Keycloak themes, the configuration can be embedded in a script tag in the DOM:

```tsx
// Config is auto-loaded from a <script id="login-config"> element
<ConfigProvider>
  <SignIn />
</ConfigProvider>
```

## Authentication Provider

### KeycloakAuthProvider

The main authentication provider that wraps your app. Handles Keycloak initialization, token management, and provides auth state to all child components.

```tsx
import { KeycloakAuthProvider } from "keycloak-react";

function App() {
  return (
    <KeycloakAuthProvider
      url="https://keycloak.example.com"
      realm="myrealm"
      clientId="my-app"
      initOptions={{ onLoad: "check-sso" }}
      onAuthStateChange={(isAuthenticated, user) => {
        console.log("Auth state changed:", isAuthenticated, user);
      }}
      onError={(error) => console.error("Auth error:", error)}
    >
      <App />
    </KeycloakAuthProvider>
  );
}
```

Props:

- `url` - Keycloak server URL
- `realm` - Realm name
- `clientId` - Client ID
- `initOptions` - Keycloak init options (default: `{ pkceMethod: 'S256' }`)
- `onAuthStateChange` - Callback when auth state changes
- `onTokenExpired` - Callback when token expires (user will need to re-authenticate)
- `onError` - Callback when an error occurs

**Notes:**

- By default, no automatic SSO check is performed. Use `initOptions={{ onLoad: 'check-sso' }}` if you want to automatically check for an existing session.
- Tokens are not automatically refreshed. When a token expires, the user is marked as unauthenticated.

### useAuth Hook

Access authentication state and methods anywhere in your app.

```tsx
import { useAuth } from "keycloak-react";

function MyComponent() {
  const {
    isLoading, // true while checking auth state
    isAuthenticated, // true if user is signed in
    user, // User object with id, email, name, etc.
    signIn, // Function to trigger sign in
    signOut, // Function to trigger sign out
    signUp, // Function to trigger registration
    getToken, // Get a fresh access token
    idToken, // Raw ID token string
    accessToken, // Raw access token string
    keycloak, // Raw keycloak-js instance (for advanced usage)
  } = useAuth();

  if (isLoading) return <Spinner />;
  if (!isAuthenticated) return <button onClick={() => signIn()}>Sign In</button>;

  return (
    <div>
      <p>Welcome, {user.name}!</p>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  );
}
```

### useUser Hook

Convenience hook to get just the current user.

```tsx
import { useUser } from "keycloak-react";

function Profile() {
  const user = useUser();
  if (!user) return null;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
      <img src={user.imageUrl} alt="Avatar" />
    </div>
  );
}
```

User object properties:

- `id` - Unique user ID (sub claim)
- `email` - Email address
- `emailVerified` - Whether email is verified
- `name` - Full name
- `firstName` - First/given name
- `lastName` - Last/family name
- `username` - Preferred username
- `imageUrl` - Profile picture URL
- `claims` - Raw token claims

## Control Components

Components for conditional rendering based on authentication state.

### SignedIn / SignedOut

Render content conditionally based on authentication state.

```tsx
import { SignedIn, SignedOut } from "keycloak-react";

function Header() {
  return (
    <header>
      <SignedIn>
        <UserButton />
        <span>Welcome back!</span>
      </SignedIn>
      <SignedOut>
        <SignInButton />
        <SignUpButton />
      </SignedOut>
    </header>
  );
}
```

### Protect

Protect content with optional role requirements.

```tsx
import { Protect } from 'keycloak-react';

// Basic protection - redirects to sign in if not authenticated
<Protect>
  <Dashboard />
</Protect>

// With custom fallback
<Protect fallback={<SignIn />}>
  <Dashboard />
</Protect>

// With loading state
<Protect loading={<Spinner />} fallback={<SignIn />}>
  <Dashboard />
</Protect>

// Require specific roles (Keycloak resource roles)
<Protect roles={['admin', 'moderator']}>
  <AdminPanel />
</Protect>

// Require realm roles
<Protect realmRoles={['offline_access']}>
  <OfflineContent />
</Protect>

// With render prop fallback
<Protect fallback={(signIn) => (
  <div>
    <p>Please sign in to continue</p>
    <button onClick={signIn}>Sign In</button>
  </div>
)}>
  <ProtectedContent />
</Protect>
```

### RedirectToSignIn / RedirectToSignUp

Programmatically redirect to sign in or registration.

```tsx
import { RedirectToSignIn } from "keycloak-react";

function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <Spinner />;
  if (!isAuthenticated) return <RedirectToSignIn returnUrl="/dashboard" />;

  return <Dashboard />;
}
```

## Button Components

Pre-styled buttons for common auth actions.

### SignInButton / SignUpButton / SignOutButton

```tsx
import { SignInButton, SignUpButton, SignOutButton } from 'keycloak-react';

// Default styling
<SignInButton />
<SignUpButton />
<SignOutButton />

// Custom text
<SignInButton>Log in to continue</SignInButton>
<SignUpButton>Create an account</SignUpButton>

// With custom redirect
<SignInButton redirectUri="/dashboard">Sign In</SignInButton>
<SignOutButton redirectUri="/">Log Out</SignOutButton>

// Custom styling (passes through to button element)
<SignInButton className="my-button" style={{ padding: '12px 24px' }}>
  Sign In
</SignInButton>
```

## UI Components

### ConfigProvider

Provides login configuration to child components. Used for the `SignIn` form component.

```tsx
// Fetch from Keycloak server (requires keycloak-login-config-provider)
<ConfigProvider keycloakUrl="https://keycloak.example.com" realm="myrealm">
  <SignIn />
</ConfigProvider>

// Pass config directly (no server dependency)
<ConfigProvider config={myConfig}>
  <SignIn />
</ConfigProvider>

// Auto-load from DOM (for Keycloak themes)
<ConfigProvider>
  <SignIn />
</ConfigProvider>
```

### SignIn

A complete sign-in form with social login support.

```tsx
<SignIn
  appearance={{
    variables: { colorPrimary: "#6366f1" },
    baseTheme: "dark",
  }}
  brandImgSrc="/logo.png"
  loginTitle="Welcome Back"
/>
```

### SocialButtons

Renders social login buttons for identity providers.

```tsx
<SocialButtons providers={config.identityProviders} />
```

### UserAvatar

Displays a user's profile image with automatic fallback to colored initials. When used inside `KeycloakAuthProvider`, it automatically uses the authenticated user's info.

```tsx
// Automatic - uses auth context (simplest when inside KeycloakAuthProvider)
<UserAvatar />

// From Keycloak token (if not using KeycloakAuthProvider)
<UserAvatar token={keycloak.idToken} />

// With profile image
<UserAvatar
  imageUrl="https://example.com/avatar.jpg"
  name="John Doe"
  size="md"
/>

// Initials fallback (auto-generated color based on name)
<UserAvatar
  firstName="John"
  lastName="Doe"
  size="lg"
/>

// Custom styling
<UserAvatar
  name="Jane Smith"
  customSize={100}
  backgroundColor="#6366f1"
  showBorder
/>

// Token with prop overrides (props take priority)
<UserAvatar
  token={keycloak.idToken}
  imageUrl="/custom-avatar.jpg"  // Overrides token's picture claim
  size="xl"
/>
```

Props:

- `token` - JWT token (ID or access token) from Keycloak to extract user info
- `imageUrl` - URL to the user's profile image (overrides token's `picture` claim)
- `firstName` / `lastName` - Used for generating initials (overrides token claims)
- `name` - Full name (alternative to firstName/lastName)
- `initials` - Custom initials (overrides auto-generated)
- `size` - `"sm"` | `"md"` | `"lg"` | `"xl"` (default: `"md"`)
- `customSize` - Custom size in pixels
- `showBorder` - Show a border around the avatar
- `backgroundColor` - Custom background for initials
- `onClick` - Click handler (makes avatar interactive)

Token claims used: `picture`, `name`, `given_name`, `family_name`, `preferred_username`, `email`

### UserButton

A complete user menu button that shows the user's avatar and opens a dropdown with user info, account management, and sign out options. When used inside `KeycloakAuthProvider`, it automatically uses the authenticated user's info and sign out method.

```tsx
// Automatic - uses auth context (simplest when inside KeycloakAuthProvider)
<UserButton manageAccountUrl="/account" />

// With token (if not using KeycloakAuthProvider)
<UserButton
  token={keycloak.idToken}
  signOutUrl="/logout"
  manageAccountUrl="/account"
/>

// With sign out callback
<UserButton
  token={keycloak.idToken}
  onSignOut={() => keycloak.logout()}
  manageAccountUrl={`${keycloak.authServerUrl}/realms/${realm}/account`}
/>

// With custom menu items
<UserButton
  token={keycloak.idToken}
  onSignOut={handleSignOut}
  menuItems={[
    { key: 'profile', label: 'Profile', onClick: () => navigate('/profile') },
    { key: 'settings', label: 'Settings', href: '/settings' },
  ]}
  menuItemsAfter={[
    { key: 'help', label: 'Help & Support', href: '/help' },
  ]}
/>

// Manual user info (without token)
<UserButton
  name="John Doe"
  email="john@example.com"
  imageUrl="/avatar.jpg"
  onSignOut={handleSignOut}
/>
```

Props:

- `token` - JWT token from Keycloak to extract user info
- `imageUrl` / `name` / `firstName` / `lastName` / `email` - Manual user info (overrides token)
- `avatarSize` - Size of the avatar (`"sm"` | `"md"` | `"lg"` | `"xl"`)
- `manageAccountUrl` - URL for "Manage account" link
- `signOutUrl` - URL to navigate to for sign out
- `onSignOut` - Callback when sign out is clicked (alternative to signOutUrl)
- `afterSignOutUrl` - URL to redirect to after onSignOut completes
- `menuItems` - Custom menu items before default items
- `menuItemsAfter` - Custom menu items after default items
- `showUserInfo` - Show user name/email in dropdown header (default: true)
- `showSignOut` - Show sign out option (default: true)

### useSignIn (Headless Hook)

Build your own custom sign-in UI with full state management.

```tsx
function CustomSignIn() {
  const { state, actions, submit, computed } = useSignIn();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit.submit();
      }}
    >
      <input
        value={state.username}
        onChange={(e) => actions.setUsername(e.target.value)}
        placeholder={computed.usernameLabel}
      />
      <input
        type="password"
        value={state.password}
        onChange={(e) => actions.setPassword(e.target.value)}
      />
      <button type="submit" disabled={state.isSubmitting}>
        Sign In
      </button>
    </form>
  );
}
```

## Theming

Customize appearance using the `appearance` prop:

```tsx
<SignIn
  appearance={{
    baseTheme: "dark", // or 'light'
    variables: {
      colorPrimary: "#6366f1",
      colorPrimaryHover: "#4f46e5",
      borderRadius: "8px",
      fontFamily: "Inter, sans-serif",
    },
  }}
/>
```

Available variables:

- `colorPrimary` - Primary brand color
- `colorPrimaryHover` - Primary hover state
- `colorBackground` - Page background
- `colorBackgroundCard` - Card background
- `colorText` - Primary text color
- `colorTextSecondary` - Secondary text
- `colorDanger` - Error/danger color
- `colorSuccess` - Success color
- `colorBorder` - Border color
- `borderRadius` - Corner radius
- `fontFamily` - Font family

## Demo

The package includes a demo application that showcases all components and features. To run it:

```bash
# Install dependencies
npm install

# Run the demo
npm run demo
```

This will start a development server at `http://localhost:5173` with:

- **Auth State** - Live authentication state display
- **Components** - UserAvatar and UserButton demos
- **Sign In Form** - Customizable sign-in form with theme presets
- **Account UI** - Full account management interface

The demo connects to a Keycloak server at `http://localhost:8080` with realm `master` and client `demo`. Adjust these settings in `demo/App.tsx` as needed.

## Development

```bash
# Install dependencies
npm install

# Run the demo (development mode)
npm run dev

# Build the library
npm run build

# Lint
npm run lint
```

## License

Apache License 2.0
