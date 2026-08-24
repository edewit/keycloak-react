import { useState } from 'react';
import {
  // Auth provider and hooks (from client module)
  KeycloakAuthProvider,
  useAuth,
  useUser,
  useHasRole,
  // Control components
  SignedIn,
  SignedOut,
  Protect,
  // Buttons
  SignInButton,
  SignOutButton,
  // UI Components
  ConfigProvider,
  SignIn,
  useConfig,
  UserAvatar,
  UserButton,
  type Appearance,
  type LoginConfig,
} from '../src';

// Note: This is a simplified demo that shows the client-side components.
// In a real Next.js app, you would:
// 1. Create auth.ts with createKeycloakAuth()
// 2. Set up /api/auth/[...nextauth]/route.ts
// 3. Pass session from server to KeycloakAuthProvider

// Fallback config for sign-in form demo (no server connection)
const FALLBACK_CONFIG: LoginConfig = {
  realm: {
    name: 'demo',
    displayName: 'Demo Realm',
    registrationAllowed: true,
    resetPasswordAllowed: true,
    rememberMe: true,
    loginWithEmailAllowed: true,
    registrationEmailAsUsername: false,
    password: true,
  },
  identityProviders: [
    {
      alias: 'google',
      displayName: 'Google',
      providerId: 'google',
      loginUrl: '#',
    },
    {
      alias: 'github',
      displayName: 'GitHub', 
      providerId: 'github',
      loginUrl: '#',
    },
  ],
  urls: {
    login: '#',
    registration: '#',
    resetPassword: '#',
  },
};

// Theme presets
const themes: Record<string, Appearance> = {
  default: {},
  dark: {
    baseTheme: 'dark',
  },
  purple: {
    variables: {
      colorPrimary: '#6366f1',
      colorPrimaryHover: '#4f46e5',
      borderRadius: '12px',
    },
  },
};

// Auth status component - shows current auth state from context
function AuthStatus() {
  const { isLoading, isAuthenticated, user, roles } = useAuth();

  if (isLoading) {
    return (
      <div className="auth-status loading">
        <span className="spinner"></span>
        Checking authentication...
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="auth-status authenticated">
        <span className="status-icon">✓</span>
        Signed in as <strong>{user.name || user.username || user.email}</strong>
        {roles.length > 0 && (
          <small> (roles: {roles.join(', ')})</small>
        )}
      </div>
    );
  }

  return (
    <div className="auth-status unauthenticated">
      <span className="status-icon">○</span>
      Not signed in
    </div>
  );
}

// Demo header with UserButton when authenticated
function DemoHeader() {
  return (
    <header className="demo-header">
      <div className="header-left">
        <h1>Keycloak React Demo (SSR)</h1>
        <small>Using Auth.js with Keycloak provider</small>
      </div>
      <div className="header-right">
        <SignedIn>
          <UserButton avatarSize="md" />
        </SignedIn>
        <SignedOut>
          <div className="auth-buttons">
            <SignInButton className="btn btn-primary">Sign In</SignInButton>
          </div>
        </SignedOut>
      </div>
    </header>
  );
}

// Demo section showing auth state
function AuthStateDemo() {
  const { isLoading, isAuthenticated, user, roles, realmRoles, error } = useAuth();
  
  return (
    <div className="demo-section">
      <h3>Authentication State (useAuth)</h3>
      <p className="demo-description">
        Live authentication state from KeycloakAuthProvider context.
        <br />
        <strong>Note:</strong> Tokens are NOT exposed to the client. They're only available server-side.
      </p>
      <div className="auth-state-display">
        <div className="state-row">
          <span className="state-label">isLoading:</span>
          <span className={`state-value ${isLoading ? 'true' : 'false'}`}>
            {String(isLoading)}
          </span>
        </div>
        <div className="state-row">
          <span className="state-label">isAuthenticated:</span>
          <span className={`state-value ${isAuthenticated ? 'true' : 'false'}`}>
            {String(isAuthenticated)}
          </span>
        </div>
        <div className="state-row">
          <span className="state-label">user.id:</span>
          <span className="state-value">{user?.id || 'null'}</span>
        </div>
        <div className="state-row">
          <span className="state-label">user.name:</span>
          <span className="state-value">{user?.name || 'null'}</span>
        </div>
        <div className="state-row">
          <span className="state-label">user.email:</span>
          <span className="state-value">{user?.email || 'null'}</span>
        </div>
        <div className="state-row">
          <span className="state-label">roles:</span>
          <span className="state-value">{roles.length > 0 ? roles.join(', ') : '[]'}</span>
        </div>
        <div className="state-row">
          <span className="state-label">realmRoles:</span>
          <span className="state-value">{realmRoles.length > 0 ? realmRoles.join(', ') : '[]'}</span>
        </div>
        <div className="state-row">
          <span className="state-label">error:</span>
          <span className="state-value">{error || 'null'}</span>
        </div>
        <div className="state-row highlight">
          <span className="state-label">accessToken:</span>
          <span className="state-value info">Server-side only (use getServerSession)</span>
        </div>
      </div>
    </div>
  );
}

// Demo for useHasRole hook
function RoleCheckDemo() {
  const isAdmin = useHasRole('admin');
  const isUser = useHasRole('user');
  
  return (
    <div className="demo-section">
      <h3>Role Checks (useHasRole)</h3>
      <p className="demo-description">
        Check if the user has specific roles.
      </p>
      <div className="auth-state-display">
        <div className="state-row">
          <span className="state-label">useHasRole('admin'):</span>
          <span className={`state-value ${isAdmin ? 'true' : 'false'}`}>
            {String(isAdmin)}
          </span>
        </div>
        <div className="state-row">
          <span className="state-label">useHasRole('user'):</span>
          <span className={`state-value ${isUser ? 'true' : 'false'}`}>
            {String(isUser)}
          </span>
        </div>
      </div>
    </div>
  );
}

// Demo section for control components
function ControlComponentsDemo() {
  return (
    <div className="demo-section">
      <h3>Control Components</h3>
      <p className="demo-description">
        Conditional rendering based on auth state.
      </p>
      
      <div className="control-demo">
        <div className="control-item">
          <h4>SignedIn</h4>
          <div className="control-result">
            <SignedIn fallback={<span className="fallback">Loading...</span>}>
              <span className="visible">✓ You are signed in!</span>
            </SignedIn>
            <SignedOut>
              <span className="hidden">○ Content hidden (sign in to see)</span>
            </SignedOut>
          </div>
        </div>
        
        <div className="control-item">
          <h4>SignedOut</h4>
          <div className="control-result">
            <SignedOut fallback={<span className="fallback">Loading...</span>}>
              <span className="visible">○ You are signed out</span>
            </SignedOut>
            <SignedIn>
              <span className="hidden">✓ Content hidden (sign out to see)</span>
            </SignedIn>
          </div>
        </div>

        <div className="control-item">
          <h4>Protect (with role requirement)</h4>
          <div className="control-result">
            <Protect 
              roles={['admin']}
              fallback={<span className="protected-fallback">🔒 Sign in required</span>}
              unauthorizedFallback={<span className="unauthorized">⛔ Admin role required</span>}
              loading={<span className="fallback">Checking access...</span>}
            >
              <span className="visible">🔓 Admin content visible!</span>
            </Protect>
          </div>
        </div>
      </div>
    </div>
  );
}

// Demo section for UserAvatar
function UserAvatarDemo() {
  const user = useUser();
  
  return (
    <div className="demo-section">
      <h3>UserAvatar</h3>
      <p className="demo-description">
        Displays user profile picture with initials fallback.
      </p>
      <div className="avatar-demo">
        <div className="avatar-item">
          <UserAvatar name="John Doe" size="sm" />
          <span>Small</span>
        </div>
        <div className="avatar-item">
          <UserAvatar firstName="Jane" lastName="Smith" size="md" />
          <span>Medium</span>
        </div>
        <div className="avatar-item">
          <UserAvatar name="Alice Johnson" size="lg" />
          <span>Large</span>
        </div>
        <div className="avatar-item">
          <UserAvatar 
            name="Bob Wilson" 
            size="xl" 
            imageUrl="https://design.jboss.org/keycloak/logo/images/keycloak_icon_128px.png"
          />
          <span>XL with image</span>
        </div>
        {user && (
          <div className="avatar-item highlight">
            <UserAvatar size="lg" showBorder />
            <span>From Context</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Demo section for auth buttons
function AuthButtonsDemo() {
  return (
    <div className="demo-section">
      <h3>Auth Buttons</h3>
      <p className="demo-description">
        Pre-built buttons for common auth actions.
      </p>
      <div className="buttons-demo">
        <SignedOut>
          <SignInButton className="btn btn-primary">
            Sign In
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <SignOutButton className="btn btn-danger">
            Sign Out
          </SignOutButton>
        </SignedIn>
      </div>
    </div>
  );
}

type DemoView = 'signin' | 'auth' | 'components';

// Component to show config status for SignIn form
function ConfigStatus() {
  const { config, isLoading, error } = useConfig();

  if (isLoading) {
    return <p className="config-status loading">Loading configuration...</p>;
  }

  if (error) {
    return <p className="config-status error">Error: {error.message}</p>;
  }

  if (config) {
    return (
      <p className="config-status success">
        Config loaded: <strong>{config.realm.displayName || config.realm.name}</strong>
      </p>
    );
  }

  return null;
}

function AppContent() {
  const [selectedTheme, setSelectedTheme] = useState<string>('default');
  const [view, setView] = useState<DemoView>('auth');

  const handleSubmit = async (data: { username: string; password: string; rememberMe: boolean }) => {
    console.log('Sign in submitted:', data);
    alert(`Sign in attempted with:\nUsername: ${data.username}\nRemember Me: ${data.rememberMe}`);
  };

  return (
    <div className="demo-container">
      <DemoHeader />
      
      <div className="demo-notice">
        <strong>SSR Demo Notice:</strong> This is a client-side demo. In production with Next.js, 
        you would configure Auth.js with <code>createKeycloakAuth()</code> and pass the session 
        from your server component. See the README for full setup instructions.
      </div>
      
      <div className="demo-nav">
        <button
          className={`nav-button ${view === 'auth' ? 'active' : ''}`}
          onClick={() => setView('auth')}
        >
          Auth State
        </button>
        <button
          className={`nav-button ${view === 'components' ? 'active' : ''}`}
          onClick={() => setView('components')}
        >
          Components
        </button>
        <button
          className={`nav-button ${view === 'signin' ? 'active' : ''}`}
          onClick={() => setView('signin')}
        >
          Sign In Form
        </button>
      </div>

      <AuthStatus />

      {view === 'auth' && (
        <div className="components-container">
          <AuthStateDemo />
          <RoleCheckDemo />
          <ControlComponentsDemo />
          <AuthButtonsDemo />
        </div>
      )}

      {view === 'components' && (
        <div className="components-container">
          <UserAvatarDemo />
        </div>
      )}

      {view === 'signin' && (
        <ConfigProvider config={FALLBACK_CONFIG}>
          <div className="demo-controls">
            <h2>Sign In Form Demo</h2>
            <p>This shows the customizable sign-in form component (uses fallback config).</p>
            
            <h3>Theme</h3>
            <div className="theme-buttons">
              {Object.keys(themes).map((theme) => (
                <button
                  key={theme}
                  className={`theme-button ${selectedTheme === theme ? 'active' : ''}`}
                  onClick={() => setSelectedTheme(theme)}
                >
                  {theme.charAt(0).toUpperCase() + theme.slice(1)}
                </button>
              ))}
            </div>
            
            <ConfigStatus />
          </div>

          <div className="signin-container">
            <SignIn
              appearance={themes[selectedTheme]}
              onSubmit={handleSubmit}
              loginTitle="Welcome Back"
              loginSubtitle="Sign in to your account"
              brandImgSrc="https://design.jboss.org/keycloak/logo/images/keycloak_icon_128px.png"
              brandImgAlt="Keycloak"
            />
          </div>
        </ConfigProvider>
      )}
    </div>
  );
}

function App() {
  // In a real Next.js app, you would pass the session from a server component:
  // const session = await auth();
  // <KeycloakAuthProvider session={session}>
  
  return (
    <KeycloakAuthProvider>
      <AppContent />
    </KeycloakAuthProvider>
  );
}

export default App;
