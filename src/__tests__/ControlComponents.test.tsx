import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SignedIn, SignedOut, Protect } from '../auth/ControlComponents';
import { AuthContext, type AuthContextValue } from '../auth/AuthContext';
import type { ReactNode } from 'react';

// Helper to create mock auth context
function createMockAuthContext(overrides: Partial<AuthContextValue> = {}): AuthContextValue {
  return {
    isLoading: false,
    isAuthenticated: false,
    user: null,
    idToken: undefined,
    accessToken: undefined,
    signIn: vi.fn(),
    signOut: vi.fn(),
    signUp: vi.fn(),
    getToken: vi.fn(),
    keycloak: null,
    ...overrides,
  };
}

// Wrapper component for providing auth context
function AuthWrapper({ children, value }: { children: ReactNode; value: AuthContextValue }) {
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

describe('SignedIn', () => {
  it('should render children when authenticated', () => {
    const authValue = createMockAuthContext({ isAuthenticated: true });

    render(
      <AuthWrapper value={authValue}>
        <SignedIn>
          <div>Authenticated content</div>
        </SignedIn>
      </AuthWrapper>
    );

    expect(screen.getByText('Authenticated content')).toBeInTheDocument();
  });

  it('should not render children when not authenticated', () => {
    const authValue = createMockAuthContext({ isAuthenticated: false });

    render(
      <AuthWrapper value={authValue}>
        <SignedIn>
          <div>Authenticated content</div>
        </SignedIn>
      </AuthWrapper>
    );

    expect(screen.queryByText('Authenticated content')).not.toBeInTheDocument();
  });

  it('should render fallback while loading', () => {
    const authValue = createMockAuthContext({ isLoading: true });

    render(
      <AuthWrapper value={authValue}>
        <SignedIn fallback={<div>Loading...</div>}>
          <div>Authenticated content</div>
        </SignedIn>
      </AuthWrapper>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByText('Authenticated content')).not.toBeInTheDocument();
  });

  it('should render nothing while loading without fallback', () => {
    const authValue = createMockAuthContext({ isLoading: true });

    const { container } = render(
      <AuthWrapper value={authValue}>
        <SignedIn>
          <div>Authenticated content</div>
        </SignedIn>
      </AuthWrapper>
    );

    expect(container).toBeEmptyDOMElement();
  });
});

describe('SignedOut', () => {
  it('should render children when not authenticated', () => {
    const authValue = createMockAuthContext({ isAuthenticated: false });

    render(
      <AuthWrapper value={authValue}>
        <SignedOut>
          <div>Signed out content</div>
        </SignedOut>
      </AuthWrapper>
    );

    expect(screen.getByText('Signed out content')).toBeInTheDocument();
  });

  it('should not render children when authenticated', () => {
    const authValue = createMockAuthContext({ isAuthenticated: true });

    render(
      <AuthWrapper value={authValue}>
        <SignedOut>
          <div>Signed out content</div>
        </SignedOut>
      </AuthWrapper>
    );

    expect(screen.queryByText('Signed out content')).not.toBeInTheDocument();
  });

  it('should render fallback while loading', () => {
    const authValue = createMockAuthContext({ isLoading: true });

    render(
      <AuthWrapper value={authValue}>
        <SignedOut fallback={<div>Loading...</div>}>
          <div>Signed out content</div>
        </SignedOut>
      </AuthWrapper>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});

describe('Protect', () => {
  it('should render children when authenticated', () => {
    const authValue = createMockAuthContext({ isAuthenticated: true });

    render(
      <AuthWrapper value={authValue}>
        <Protect>
          <div>Protected content</div>
        </Protect>
      </AuthWrapper>
    );

    expect(screen.getByText('Protected content')).toBeInTheDocument();
  });

  it('should call signIn when not authenticated and no fallback', () => {
    const signIn = vi.fn();
    const authValue = createMockAuthContext({ isAuthenticated: false, signIn });

    render(
      <AuthWrapper value={authValue}>
        <Protect>
          <div>Protected content</div>
        </Protect>
      </AuthWrapper>
    );

    expect(signIn).toHaveBeenCalled();
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
  });

  it('should render fallback when not authenticated', () => {
    const authValue = createMockAuthContext({ isAuthenticated: false });

    render(
      <AuthWrapper value={authValue}>
        <Protect fallback={<div>Please sign in</div>}>
          <div>Protected content</div>
        </Protect>
      </AuthWrapper>
    );

    expect(screen.getByText('Please sign in')).toBeInTheDocument();
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
  });

  it('should render function fallback with signIn', () => {
    const signIn = vi.fn();
    const authValue = createMockAuthContext({ isAuthenticated: false, signIn });

    render(
      <AuthWrapper value={authValue}>
        <Protect fallback={(triggerSignIn) => (
          <button onClick={triggerSignIn}>Click to sign in</button>
        )}>
          <div>Protected content</div>
        </Protect>
      </AuthWrapper>
    );

    const button = screen.getByText('Click to sign in');
    button.click();

    expect(signIn).toHaveBeenCalled();
  });

  it('should render loading state', () => {
    const authValue = createMockAuthContext({ isLoading: true });

    render(
      <AuthWrapper value={authValue}>
        <Protect loading={<div>Checking access...</div>}>
          <div>Protected content</div>
        </Protect>
      </AuthWrapper>
    );

    expect(screen.getByText('Checking access...')).toBeInTheDocument();
  });

  it('should check resource roles when specified', () => {
    const mockKeycloak = {
      hasResourceRole: vi.fn((role: string) => role === 'admin'),
      hasRealmRole: vi.fn(() => false),
    };
    const authValue = createMockAuthContext({
      isAuthenticated: true,
      keycloak: mockKeycloak as any,
    });

    render(
      <AuthWrapper value={authValue}>
        <Protect roles={['admin']}>
          <div>Admin content</div>
        </Protect>
      </AuthWrapper>
    );

    expect(mockKeycloak.hasResourceRole).toHaveBeenCalledWith('admin');
    expect(screen.getByText('Admin content')).toBeInTheDocument();
  });

  it('should hide content when user lacks required role', () => {
    const mockKeycloak = {
      hasResourceRole: vi.fn(() => false),
      hasRealmRole: vi.fn(() => false),
    };
    const authValue = createMockAuthContext({
      isAuthenticated: true,
      keycloak: mockKeycloak as any,
    });

    render(
      <AuthWrapper value={authValue}>
        <Protect roles={['admin']}>
          <div>Admin content</div>
        </Protect>
      </AuthWrapper>
    );

    expect(screen.queryByText('Admin content')).not.toBeInTheDocument();
  });

  it('should check realm roles when specified', () => {
    const mockKeycloak = {
      hasResourceRole: vi.fn(() => false),
      hasRealmRole: vi.fn((role: string) => role === 'offline_access'),
    };
    const authValue = createMockAuthContext({
      isAuthenticated: true,
      keycloak: mockKeycloak as any,
    });

    render(
      <AuthWrapper value={authValue}>
        <Protect realmRoles={['offline_access']}>
          <div>Offline content</div>
        </Protect>
      </AuthWrapper>
    );

    expect(mockKeycloak.hasRealmRole).toHaveBeenCalledWith('offline_access');
    expect(screen.getByText('Offline content')).toBeInTheDocument();
  });
});
