import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAuth, useUser, useHasRole, useHasAnyRole } from '../client/AuthProvider';
import { AuthContext, type AuthContextValue, type User } from '../client/AuthContext';
import type { ReactNode } from 'react';

// Helper to create mock auth context
function createMockAuthContext(overrides: Partial<AuthContextValue> = {}): AuthContextValue {
  return {
    isLoading: false,
    isAuthenticated: false,
    user: null,
    roles: [],
    realmRoles: [],
    signIn: vi.fn(),
    signOut: vi.fn(),
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

    result.current.signIn({ callbackUrl: '/dashboard' });
    expect(signIn).toHaveBeenCalledWith({ callbackUrl: '/dashboard' });
  });

  it('should provide signOut function', () => {
    const signOut = vi.fn();
    const mockValue = createMockAuthContext({ signOut });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(mockValue),
    });

    result.current.signOut({ callbackUrl: '/' });
    expect(signOut).toHaveBeenCalledWith({ callbackUrl: '/' });
  });

  it('should return roles', () => {
    const mockValue = createMockAuthContext({
      isAuthenticated: true,
      roles: ['admin', 'editor'],
      realmRoles: ['offline_access'],
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(mockValue),
    });

    expect(result.current.roles).toEqual(['admin', 'editor']);
    expect(result.current.realmRoles).toEqual(['offline_access']);
  });

  it('should NOT expose tokens (tokens are server-side only)', () => {
    const mockValue = createMockAuthContext({
      isAuthenticated: true,
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(mockValue),
    });

    // Tokens should not be present in the client context
    expect((result.current as any).accessToken).toBeUndefined();
    expect((result.current as any).idToken).toBeUndefined();
    expect((result.current as any).getToken).toBeUndefined();
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
      roles: ['user'],
      realmRoles: [],
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

describe('useHasRole', () => {
  it('should return false when user does not have role', () => {
    const mockValue = createMockAuthContext({
      isAuthenticated: true,
      roles: ['user'],
      realmRoles: [],
    });

    const { result } = renderHook(() => useHasRole('admin'), {
      wrapper: createWrapper(mockValue),
    });

    expect(result.current).toBe(false);
  });

  it('should return true when user has resource role', () => {
    const mockValue = createMockAuthContext({
      isAuthenticated: true,
      roles: ['admin', 'user'],
      realmRoles: [],
    });

    const { result } = renderHook(() => useHasRole('admin'), {
      wrapper: createWrapper(mockValue),
    });

    expect(result.current).toBe(true);
  });

  it('should return true when user has realm role', () => {
    const mockValue = createMockAuthContext({
      isAuthenticated: true,
      roles: [],
      realmRoles: ['offline_access'],
    });

    const { result } = renderHook(() => useHasRole('offline_access'), {
      wrapper: createWrapper(mockValue),
    });

    expect(result.current).toBe(true);
  });
});

describe('useHasAnyRole', () => {
  it('should return false when user has none of the roles', () => {
    const mockValue = createMockAuthContext({
      isAuthenticated: true,
      roles: ['user'],
      realmRoles: [],
    });

    const { result } = renderHook(() => useHasAnyRole(['admin', 'editor']), {
      wrapper: createWrapper(mockValue),
    });

    expect(result.current).toBe(false);
  });

  it('should return true when user has one of the roles', () => {
    const mockValue = createMockAuthContext({
      isAuthenticated: true,
      roles: ['editor'],
      realmRoles: [],
    });

    const { result } = renderHook(() => useHasAnyRole(['admin', 'editor']), {
      wrapper: createWrapper(mockValue),
    });

    expect(result.current).toBe(true);
  });

  it('should check realm roles too', () => {
    const mockValue = createMockAuthContext({
      isAuthenticated: true,
      roles: [],
      realmRoles: ['offline_access'],
    });

    const { result } = renderHook(() => useHasAnyRole(['admin', 'offline_access']), {
      wrapper: createWrapper(mockValue),
    });

    expect(result.current).toBe(true);
  });
});
