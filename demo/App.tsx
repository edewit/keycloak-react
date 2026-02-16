import { useState } from 'react';
import {
  // Auth provider and hooks
  KeycloakAuthProvider,
  useAuth,
  useUser,
  useKeycloak,
  // Control components
  SignedIn,
  SignedOut,
  Protect,
  // Buttons
  SignInButton,
  SignUpButton,
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
import {
  // Account UI provider and components
  KeycloakProvider,
  PersonalInfo,
  DeviceActivity,
  LinkedAccounts,
  SigningIn,
  Applications,
  type AccountEnvironment,
} from '../src/account';

// Keycloak server configuration
const KEYCLOAK_URL = 'http://localhost:8080';
const REALM = 'master';
const CLIENT_ID = 'demo'; // Use an existing public client

// Fallback config when keycloak-login-config-provider is not available
const FALLBACK_CONFIG: LoginConfig = {
  realm: {
    name: REALM,
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
  green: {
    variables: {
      colorPrimary: '#10b981',
      colorPrimaryHover: '#059669',
      colorBackground: '#f8fafc',
      colorBackgroundCard: '#ffffff',
      borderRadius: '8px',
    },
  },
};

// Auth status component - shows current auth state from context
function AuthStatus() {
  const { isLoading, isAuthenticated, user } = useAuth();

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
        <h1>Keycloak React Demo</h1>
      </div>
      <div className="header-right">
        <SignedIn>
          <UserButton 
            manageAccountUrl={`${KEYCLOAK_URL}/realms/${REALM}/account`}
            avatarSize="md"
          />
        </SignedIn>
        <SignedOut>
          <div className="auth-buttons">
            <SignInButton className="btn btn-primary">Sign In</SignInButton>
            <SignUpButton className="btn btn-secondary">Sign Up</SignUpButton>
          </div>
        </SignedOut>
      </div>
    </header>
  );
}

// Component to show config status for SignIn form
function ConfigStatus({ useFallback }: { useFallback: boolean }) {
  const { config, isLoading, error } = useConfig();

  if (useFallback) {
    return (
      <p className="config-status info">
        Using fallback configuration (no server connection)
        <br />
        <small>Social providers are for demo only</small>
      </p>
    );
  }

  if (isLoading) {
    return <p className="config-status loading">Loading configuration from Keycloak...</p>;
  }

  if (error) {
    return (
      <p className="config-status error">
        Error loading config: {error.message}
        <br />
        <small>
          Make sure Keycloak is running on {KEYCLOAK_URL} with the{' '}
          <a 
            href="https://github.com/keycloak/keycloak-login-config-provider" 
            target="_blank"
            rel="noopener noreferrer"
          >
            keycloak-login-config-provider
          </a>{' '}
          installed
        </small>
      </p>
    );
  }

  if (config) {
    return (
      <p className="config-status success">
        Connected to realm: <strong>{config.realm.displayName || config.realm.name}</strong>
        <br />
        <small>
          Identity providers: {config.identityProviders?.length || 0} | 
          via keycloak-login-config-provider
        </small>
      </p>
    );
  }

  return null;
}

// Demo section showing auth state
function AuthStateDemo() {
  const { isLoading, isAuthenticated, user, idToken, accessToken } = useAuth();
  
  return (
    <div className="demo-section">
      <h3>Authentication State (useAuth)</h3>
      <p className="demo-description">
        Live authentication state from KeycloakAuthProvider context.
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
          <span className="state-label">idToken:</span>
          <span className="state-value token">{idToken ? `${idToken.substring(0, 20)}...` : 'null'}</span>
        </div>
        <div className="state-row">
          <span className="state-label">accessToken:</span>
          <span className="state-value token">{accessToken ? `${accessToken.substring(0, 20)}...` : 'null'}</span>
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
          <h4>Protect (with fallback)</h4>
          <div className="control-result">
            <Protect 
              fallback={<span className="protected-fallback">🔒 Protected content - please sign in</span>}
              loading={<span className="fallback">Checking access...</span>}
            >
              <span className="visible">🔓 Protected content visible!</span>
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
        Displays user profile picture with initials fallback. Auto-detects user from context.
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

// Demo section for UserButton
function UserButtonDemo() {
  return (
    <div className="demo-section">
      <h3>UserButton</h3>
      <p className="demo-description">
        Dropdown menu with user info, account management, and sign out. Auto-detects user from context.
      </p>
      <div className="user-button-demo">
        <SignedIn>
          <UserButton
            manageAccountUrl={`${KEYCLOAK_URL}/realms/${REALM}/account`}
            menuItems={[
              { key: 'profile', label: 'View Profile', onClick: () => alert('Profile clicked') },
              { key: 'settings', label: 'Settings', onClick: () => alert('Settings clicked') },
            ]}
            avatarSize="lg"
          />
          <span className="demo-label">Click to open menu (uses auth context)</span>
        </SignedIn>
        <SignedOut>
          <UserButton
            name="Demo User"
            email="demo@example.com"
            firstName="Demo"
            lastName="User"
            manageAccountUrl="#account"
            onSignOut={() => alert('Sign out clicked!')}
            avatarSize="lg"
          />
          <span className="demo-label">Click to open menu (manual props)</span>
        </SignedOut>
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
          <SignUpButton className="btn btn-secondary">
            Create Account
          </SignUpButton>
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

type DemoView = 'signin' | 'auth' | 'components' | 'account';
type ConfigMode = 'server' | 'fallback';
type AccountTab = 'personal-info' | 'device-activity' | 'linked-accounts' | 'signing-in' | 'applications' | 'groups';

// Account UI Demo - shows embedded account management components
function AccountDemo() {
  const { isAuthenticated } = useAuth();
  const keycloak = useKeycloak();
  const [activeTab, setActiveTab] = useState<AccountTab>('personal-info');

  // Account environment configuration
  const environment: AccountEnvironment = {
    serverBaseUrl: KEYCLOAK_URL,
    realm: REALM,
    clientId: CLIENT_ID,
    resourceUrl: '.',
    logo: 'https://design.jboss.org/keycloak/logo/images/keycloak_icon_128px.png',
    logoUrl: '/',
    baseUrl: `${KEYCLOAK_URL}/realms/${REALM}/account`,
    locale: 'en',
    features: {
      isRegistrationEmailAsUsername: false,
      isEditUserNameAllowed: true,
      isViewGroupsEnabled: true,
      isLinkedAccountsEnabled: true,
      deleteAccountAllowed: false,
      updateEmailFeatureEnabled: true,
      updateEmailActionEnabled: true,
      isViewOrganizationsEnabled: false,
      isMyResourcesEnabled: false,
      isOid4VciEnabled: false,
    },
  };

  const tabs: { key: AccountTab; label: string; requiresAuth?: boolean }[] = [
    { key: 'personal-info', label: 'Personal Info', requiresAuth: true },
    { key: 'device-activity', label: 'Device Activity', requiresAuth: true },
    { key: 'linked-accounts', label: 'Linked Accounts', requiresAuth: true },
    { key: 'signing-in', label: 'Signing In', requiresAuth: true },
    { key: 'applications', label: 'Applications', requiresAuth: true },
    { key: 'groups', label: 'Groups', requiresAuth: true },
  ];

  if (!isAuthenticated) {
    return (
      <div className="components-container">
        <div className="demo-section">
          <h3>Account Management</h3>
          <p className="demo-description">
            The Account UI components allow users to manage their profile, security settings, 
            linked accounts, and more. Please sign in to access account management features.
          </p>
          <div className="account-signin-prompt">
            <span className="lock-icon">🔒</span>
            <p>Sign in to access your account settings</p>
            <SignInButton className="btn btn-primary">Sign In</SignInButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="account-demo-container">
      <div className="account-sidebar">
        <h3>Account Settings</h3>
        <nav className="account-nav">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`account-nav-item ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="account-content">
        <KeycloakProvider environment={environment} keycloak={keycloak!}>
          {activeTab === 'personal-info' && (
            <div className="account-panel">
              <PersonalInfo />
            </div>
          )}
          {activeTab === 'device-activity' && (
            <div className="account-panel">
              <DeviceActivity />
            </div>
          )}
          {activeTab === 'linked-accounts' && (
            <div className="account-panel">
              <LinkedAccounts />
            </div>
          )}
          {activeTab === 'signing-in' && (
            <div className="account-panel">
              <SigningIn />
            </div>
          )}
          {activeTab === 'applications' && (
            <div className="account-panel">
              <Applications />
            </div>
          )}
        </KeycloakProvider>
      </div>
    </div>
  );
}

function AppContent() {
  const [selectedTheme, setSelectedTheme] = useState<string>('default');
  const [view, setView] = useState<DemoView>('auth');
  const [configMode, setConfigMode] = useState<ConfigMode>('fallback');

  const handleSubmit = async (data: { username: string; password: string; rememberMe: boolean }) => {
    console.log('Sign in submitted:', data);
    alert(`Sign in attempted with:\nUsername: ${data.username}\nRemember Me: ${data.rememberMe}`);
  };

  // Choose config source based on mode
  const configProviderProps = configMode === 'server' 
    ? { keycloakUrl: KEYCLOAK_URL, realm: REALM }
    : { config: FALLBACK_CONFIG };

  return (
    <div className="demo-container">
      <DemoHeader />
      
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
        <button
          className={`nav-button ${view === 'account' ? 'active' : ''}`}
          onClick={() => setView('account')}
        >
          Account UI
        </button>
      </div>

      <AuthStatus />

      {view === 'auth' && (
        <div className="components-container">
          <AuthStateDemo />
          <ControlComponentsDemo />
          <AuthButtonsDemo />
        </div>
      )}

      {view === 'components' && (
        <div className="components-container">
          <UserAvatarDemo />
          <UserButtonDemo />
        </div>
      )}

      {view === 'signin' && (
        <ConfigProvider {...configProviderProps}>
          <div className="demo-controls">
            <h2>Sign In Form Configuration</h2>
            <div className="config-toggle">
              <label className="toggle-label">
                <input
                  type="radio"
                  name="configMode"
                  checked={configMode === 'server'}
                  onChange={() => setConfigMode('server')}
                />
                <span>Fetch from Server</span>
                <small>(requires keycloak-login-config-provider)</small>
              </label>
              <label className="toggle-label">
                <input
                  type="radio"
                  name="configMode"
                  checked={configMode === 'fallback'}
                  onChange={() => setConfigMode('fallback')}
                />
                <span>Use Fallback Config</span>
                <small>(no server required)</small>
              </label>
            </div>
            
            <h2>Theme</h2>
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
            
            <ConfigStatus useFallback={configMode === 'fallback'} />
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

      {view === 'account' && <AccountDemo />}
    </div>
  );
}

function App() {
  return (
    <KeycloakAuthProvider
      url={KEYCLOAK_URL}
      realm={REALM}
      clientId={CLIENT_ID}
      onAuthStateChange={(isAuthenticated, user) => {
        console.log('Auth state changed:', isAuthenticated, user);
      }}
      onError={(error) => {
        console.error('Auth error:', error);
      }}
    >
      <AppContent />
    </KeycloakAuthProvider>
  );
}

export default App;
