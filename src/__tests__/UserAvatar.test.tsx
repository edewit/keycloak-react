import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UserAvatar, decodeToken, getUserFromToken } from '../UserAvatar';

describe('decodeToken', () => {
  it('should decode a valid JWT token', () => {
    // Create a test token with known payload
    const payload = {
      sub: 'user-123',
      name: 'John Doe',
      given_name: 'John',
      family_name: 'Doe',
      email: 'john@example.com',
      picture: 'https://example.com/avatar.jpg',
    };
    const encodedPayload = btoa(JSON.stringify(payload));
    const token = `header.${encodedPayload}.signature`;

    const result = decodeToken(token);

    expect(result).toEqual(payload);
  });

  it('should return null for invalid token format', () => {
    expect(decodeToken('invalid')).toBeNull();
    expect(decodeToken('only.two')).toBeNull();
    expect(decodeToken('')).toBeNull();
  });

  it('should return null for malformed payload', () => {
    const token = 'header.not-valid-base64!@#.signature';
    expect(decodeToken(token)).toBeNull();
  });
});

describe('getUserFromToken', () => {
  it('should extract user info from token', () => {
    const payload = {
      sub: 'user-456',
      preferred_username: 'johndoe',
    };
    const encodedPayload = btoa(JSON.stringify(payload));
    const token = `header.${encodedPayload}.signature`;

    const result = getUserFromToken(token);

    expect(result?.sub).toBe('user-456');
    expect(result?.preferred_username).toBe('johndoe');
  });
});

describe('UserAvatar', () => {
  it('should render initials when no image is provided', () => {
    render(<UserAvatar firstName="John" lastName="Doe" />);

    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('should render single initial for first name only', () => {
    render(<UserAvatar firstName="John" />);

    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('should render initials from full name', () => {
    render(<UserAvatar name="Alice Johnson" />);

    expect(screen.getByText('AJ')).toBeInTheDocument();
  });

  it('should render custom initials when provided', () => {
    render(<UserAvatar initials="XY" firstName="John" lastName="Doe" />);

    expect(screen.getByText('XY')).toBeInTheDocument();
  });

  it('should render image when imageUrl is provided', () => {
    render(<UserAvatar imageUrl="https://example.com/avatar.jpg" name="John Doe" />);

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg');
    expect(img).toHaveAttribute('alt', 'John Doe');
  });

  it('should fall back to initials on image error', () => {
    render(<UserAvatar imageUrl="https://example.com/broken.jpg" name="John Doe" />);

    const img = screen.getByRole('img');
    fireEvent.error(img);

    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('should apply correct size class', () => {
    const { container } = render(<UserAvatar name="John" size="lg" />);

    expect(container.firstChild).toHaveClass('kc-user-avatar--lg');
  });

  it('should apply border class when showBorder is true', () => {
    const { container } = render(<UserAvatar name="John" showBorder />);

    expect(container.firstChild).toHaveClass('kc-user-avatar--bordered');
  });

  it('should be clickable when onClick is provided', () => {
    const handleClick = vi.fn();
    render(<UserAvatar name="John" onClick={handleClick} />);

    const avatar = screen.getByRole('button');
    fireEvent.click(avatar);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should handle keyboard interaction when clickable', () => {
    const handleClick = vi.fn();
    render(<UserAvatar name="John" onClick={handleClick} />);

    const avatar = screen.getByRole('button');
    fireEvent.keyDown(avatar, { key: 'Enter' });
    fireEvent.keyDown(avatar, { key: ' ' });

    expect(handleClick).toHaveBeenCalledTimes(2);
  });

  it('should extract user info from token', () => {
    const payload = {
      name: 'Token User',
      picture: 'https://example.com/token-avatar.jpg',
    };
    const encodedPayload = btoa(JSON.stringify(payload));
    const token = `header.${encodedPayload}.signature`;

    render(<UserAvatar token={token} />);

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'https://example.com/token-avatar.jpg');
  });

  it('should prefer explicit props over token claims', () => {
    const payload = {
      name: 'Token User',
      picture: 'https://example.com/token-avatar.jpg',
    };
    const encodedPayload = btoa(JSON.stringify(payload));
    const token = `header.${encodedPayload}.signature`;

    render(<UserAvatar token={token} name="Explicit Name" />);

    // The avatar should use "Explicit Name" for alt text
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('alt', 'Explicit Name');
  });

  it('should render ? when no name info is available', () => {
    render(<UserAvatar />);

    expect(screen.getByText('?')).toBeInTheDocument();
  });
});
