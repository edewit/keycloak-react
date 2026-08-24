# Keycloak React

React components for Keycloak authentication with SSR support, inspired by [Clerk](https://clerk.com/). Built on [Auth.js](https://authjs.dev/) (NextAuth v5) for secure server-side token management.

**Key Feature:** Tokens are kept server-side only. The client never has access to access tokens or refresh tokens, making this approach more secure than traditional client-side OAuth.

## Features

- SSR-first authentication using Auth.js with Keycloak provider
- Pre-built UI components (user avatar, user menu)
- Conditional rendering components (SignedIn, SignedOut, Protect)
- Server-side session and token management
- Automatic token refresh (server-side)
- Role-based access control

## Installation

```bash
npm install keycloak-react next-auth
```

## Quick Start (Next.js App Router)

### 1. Create Auth Configuration

```ts
// auth.ts (at project root)
import { createKeycloakAuth } from "keycloak-react/server";

export const { handlers, auth, signIn, signOut } = createKeycloakAuth({
  keycloakUrl: process.env.KEYCLOAK_URL!,
  realm: process.env.KEYCLOAK_REALM!,
  clientId: process.env.KEYCLOAK_CLIENT_ID!,
  clientSecret: process.env.KEYCLOAK_CLIENT_SECRET!,
});
```

### 2. Create API Route

```ts
// app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/auth";

export const { GET, POST } = handlers;
```

### 3. Add Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Required variables:

```env
# Keycloak Configuration
KEYCLOAK_URL=https://keycloak.example.com
KEYCLOAK_REALM=myrealm
KEYCLOAK_CLIENT_ID=my-app
KEYCLOAK_CLIENT_SECRET=your-client-secret

# Auth.js Configuration
# Generate secret with: openssl rand -base64 32
NEXTAUTH_SECRET=your-random-secret
NEXTAUTH_URL=http://localhost:3000
```

### 4. Wrap Your App with Provider

```tsx
// app/layout.tsx
import { KeycloakAuthProvider } from "keycloak-react/client";
import { auth } from "@/auth";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="en">
      <body>
        <KeycloakAuthProvider session={session}>
          {children}
        </KeycloakAuthProvider>
      </body>
    </html>
  );
}
```

### 5. Use Components

```tsx
// app/page.tsx
"use client";

import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
  useAuth,
} from "keycloak-react/client";

export default function Home() {
  return (
    <div>
      <SignedOut>
        <h1>Welcome!</h1>
        <SignInButton>Sign In with Keycloak</SignInButton>
      </SignedOut>

      <SignedIn>
        <UserGreeting />
        <SignOutButton>Sign Out</SignOutButton>
      </SignedIn>
    </div>
  );
}

function UserGreeting() {
  const { user } = useAuth();
  return <h1>Hello, {user?.name}!</h1>;
}
```

## Server-Side Usage

### Accessing Tokens (Server Only)

Tokens are only available on the server. Use them for API calls:

```tsx
// app/api/data/route.ts
import { getServerSession } from "keycloak-react/server";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const session = await getServerSession(req);

  if (!session.isAuthenticated) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Use the access token for backend API calls
  const response = await fetch("https://api.example.com/data", {
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  });

  return Response.json(await response.json());
}
```

### Server Component Protection

```tsx
// app/dashboard/page.tsx
import { getServerSession } from "keycloak-react/server";
import { redirect } from "next/navigation";
import { headers, cookies } from "next/headers";

export default async function DashboardPage() {
  const session = await getServerSession({ headers: headers(), cookies: cookies() });

  if (!session.isAuthenticated) {
    redirect("/api/auth/signin");
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {session.user?.name}</p>
    </div>
  );
}
```

### Role-Based Access

```tsx
// Server-side role check
import { hasRole, hasAnyRole } from "keycloak-react/server";

export default async function AdminPage() {
  const isAdmin = await hasRole(req, "admin");

  if (!isAdmin) {
    return <AccessDenied />;
  }

  return <AdminDashboard />;
}
```

```tsx
// Client-side role check
"use client";

import { useHasRole, Protect } from "keycloak-react/client";

function AdminButton() {
  const isAdmin = useHasRole("admin");
  if (!isAdmin) return null;
  return <button>Admin Panel</button>;
}

// Or use Protect component
function AdminSection() {
  return (
    <Protect
      roles={["admin"]}
      unauthorizedFallback={<p>You don't have access to this section.</p>}
    >
      <AdminDashboard />
    </Protect>
  );
}
```

## API Reference

### Server Exports (`keycloak-react/server`)

#### `createKeycloakAuth(config)`

Creates Auth.js configuration for Keycloak:

```ts
const { handlers, auth, signIn, signOut } = createKeycloakAuth({
  keycloakUrl: string;     // Keycloak server URL
  realm: string;           // Realm name
  clientId: string;        // Client ID
  clientSecret: string;    // Client secret
  basePath?: string;       // Auth route base path (default: /api/auth)
  options?: NextAuthConfig; // Additional Auth.js options
});
```

#### `getServerSession(req, options?)`

Get the full session including access token (server-only):

```ts
const session = await getServerSession(req);
// session.user - User info
// session.accessToken - Access token for API calls
// session.isAuthenticated - Boolean
```

#### `getUser(req, options?)`

Get just the user (without tokens):

```ts
const user = await getUser(req);
```

#### `hasRole(req, role, options?)`

Check if user has a specific role:

```ts
const isAdmin = await hasRole(req, "admin");
```

#### `hasAnyRole(req, roles, options?)`

Check if user has any of the specified roles:

```ts
const canEdit = await hasAnyRole(req, ["admin", "editor"]);
```

### Client Exports (`keycloak-react/client`)

#### `KeycloakAuthProvider`

Wraps your app to provide auth context:

```tsx
<KeycloakAuthProvider
  session={session}        // Initial session from server
  basePath="/api/auth"     // Auth route base path
  refetchInterval={0}      // Session refresh interval (seconds)
  refetchOnWindowFocus={true}
>
  {children}
</KeycloakAuthProvider>
```

#### `useAuth()`

Hook to access auth state:

```tsx
const {
  isLoading,        // Loading state
  isAuthenticated,  // Boolean
  user,             // User object (no tokens!)
  roles,            // User's resource roles
  realmRoles,       // User's realm roles
  signIn,           // Sign in function
  signOut,          // Sign out function
  error,            // Any session error
} = useAuth();
```

#### `useUser()`

Get just the current user:

```tsx
const user = useUser();
```

#### `useHasRole(role)`

Check if user has a role:

```tsx
const isAdmin = useHasRole("admin");
```

#### Control Components

- `<SignedIn>` - Render children only when signed in
- `<SignedOut>` - Render children only when signed out
- `<Protect>` - Protect content with optional role requirements
- `<RedirectToSignIn>` - Redirect to sign in page

#### Button Components

- `<SignInButton>` - Triggers sign in
- `<SignOutButton>` - Triggers sign out

## Security Model

This library follows a secure-by-default approach:

1. **Tokens stay server-side**: Access tokens and refresh tokens are stored in HTTP-only cookies and the JWT. They are never exposed to client-side JavaScript.

2. **Automatic refresh**: Token refresh happens automatically on the server when tokens expire.

3. **Keycloak logout**: When signing out, the library also revokes the refresh token on Keycloak.

4. **Session only on client**: The client only receives session information (user data, roles) - never the actual tokens.

## Keycloak Configuration

Make sure your Keycloak client is configured correctly:

1. **Access Type**: `confidential` (to use client secret)
2. **Valid Redirect URIs**: `http://localhost:3000/*` (your app URL)
3. **Web Origins**: `http://localhost:3000`
4. **Client Authentication**: Enabled

For local testing, this repository also includes an importable client export at
`demo/keycloak-client-demo.json` (client ID `demo`). You can import it from the
Keycloak Admin Console and then set `KEYCLOAK_CLIENT_SECRET=demo-secret-change-me`
in your local env file.

## Migration from CSR Version

If migrating from the previous client-side-only version:

1. Replace `KeycloakAuthProvider` props:
   ```tsx
   // Before (CSR)
   <KeycloakAuthProvider url="..." realm="..." clientId="...">

   // After (SSR)
   <KeycloakAuthProvider session={session}>
   ```

2. Remove `keycloak-js` references:
   - `useKeycloak()` is no longer available
   - `getToken()` is no longer available on client
   - Use server-side `getServerSession()` for token access

3. Update imports:
   ```tsx
   // Before
   import { ... } from "keycloak-react";

   // After - Client components
   import { ... } from "keycloak-react/client";

   // After - Server utilities
   import { ... } from "keycloak-react/server";
   ```

4. Add `"use client"` directive to client components.

## License

Apache License 2.0
