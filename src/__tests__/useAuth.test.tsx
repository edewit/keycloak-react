import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAuth, useUser, useKeycloak } from '../auth/KeycloakAuthProvider';
import { AuthContext, type AuthContextValue, type User } from '../auth/AuthContext';
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
function createWrapper(value: AuthContextValue) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
  };
}

describe('useAuth', () => {
  it('should throw error when used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within a KeycloakAuthProvider');

    consoleSpy.mockRestore();
  });

  it('should return auth context value', () => {
    const mockValue = createMockAuthContext({
      isAuthenticated: true,
      user: {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        claims: {},
      },
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(mockValue),
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.id).toBe('user-123');
    expect(result.current.user?.email).toBe('test@example.com');
  });

  it('should return loading state', () => {
    const mockValue = createMockAuthContext({ isLoading: true });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(mockValue),
    });

    expect(result.current.isLoading).toBe(true);
  });

  it('should provide signIn function', () => {
    const signIn = vi.fn();
    const mockValue = createMockAuthContext({ signIn });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(mockValue),
    });

    result.current.signIn({ redirectUri: '/dashboard' });
    expect(signIn).toHaveBeenCalledWith({ redirectUri: '/dashboard' });
  });

  it('should provide signOut function', () => {
    const signOut = vi.fn();
    const mockValue = createMockAuthContext({ signOut });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(mockValue),
    });

    result.current.signOut({ redirectUri: '/' });
    expect(signOut).toHaveBeenCalledWith({ redirectUri: '/' });
  });

  it('should provide signUp function', () => {
    const signUp = vi.fn();
    const mockValue = createMockAuthContext({ signUp });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(mockValue),
    });

    result.current.signUp({ redirectUri: '/welcome' });
    expect(signUp).toHaveBeenCalledWith({ redirectUri: '/welcome' });
  });

  it('should provide getToken function', async () => {
    const getToken = vi.fn().mockResolvedValue('mock-token');
    const mockValue = createMockAuthContext({ getToken });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(mockValue),
    });

    const token = await result.current.getToken();
    expect(token).toBe('mock-token');
  });

  it('should expose tokens', () => {
    const mockValue = createMockAuthContext({
      idToken: 'id-token-123',
      accessToken: 'access-token-456',
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(mockValue),
    });

    expect(result.current.idToken).toBe('id-token-123');
    expect(result.current.accessToken).toBe('access-token-456');
  });
});

describe('useUser', () => {
  it('should return null when not authenticated', () => {
    const mockValue = createMockAuthContext({ user: null });

    const { result } = renderHook(() => useUser(), {
      wrapper: createWrapper(mockValue),
    });

    expect(result.current).toBeNull();
  });

  it('should return user when authenticated', () => {
    const user: User = {
      id: 'user-789',
      email: 'user@example.com',
      name: 'Jane Doe',
      firstName: 'Jane',
      lastName: 'Doe',
      username: 'janedoe',
      emailVerified: true,
      claims: { custom: 'claim' },
    };
    const mockValue = createMockAuthContext({ user });

    const { result } = renderHook(() => useUser(), {
      wrapper: createWrapper(mockValue),
    });

    expect(result.current).toEqual(user);
    expect(result.current?.id).toBe('user-789');
    expect(result.current?.firstName).toBe('Jane');
  });
});

describe('useKeycloak', () => {
  it('should return null when no keycloak instance', () => {
    const mockValue = createMockAuthContext({ keycloak: null });

    const { result } = renderHook(() => useKeycloak(), {
      wrapper: createWrapper(mockValue),
    });

    expect(result.current).toBeNull();
  });

  it('should return keycloak instance when available', () => {
    const mockKeycloak = { authenticated: true } as any;
    const mockValue = createMockAuthContext({ keycloak: mockKeycloak });

    const { result } = renderHook(() => useKeycloak(), {
      wrapper: createWrapper(mockValue),
    });

    expect(result.current).toBe(mockKeycloak);
  });
});
