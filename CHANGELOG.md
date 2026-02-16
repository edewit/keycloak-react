# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-02-16

### Added

- Initial release of keycloak-react
- **Authentication Provider**
  - `KeycloakAuthProvider` - Main context provider wrapping keycloak-js
  - `useAuth` hook for accessing auth state and methods
  - `useUser` hook for getting current user info
  - `useKeycloak` hook for direct keycloak-js access
- **Control Components**
  - `SignedIn` - Render content only when authenticated
  - `SignedOut` - Render content only when not authenticated
  - `Protect` - Protect content with optional role requirements
  - `RedirectToSignIn` - Programmatic redirect to sign in
  - `RedirectToSignUp` - Programmatic redirect to registration
- **Button Components**
  - `SignInButton` - Pre-styled sign in button
  - `SignUpButton` - Pre-styled registration button
  - `SignOutButton` - Pre-styled sign out button
- **UI Components**
  - `SignIn` - Complete sign-in form with social login support
  - `SocialButtons` - Social identity provider buttons
  - `ProviderIcon` - Identity provider icons
  - `UserAvatar` - User avatar with initials fallback
  - `UserButton` - User menu dropdown
- **Configuration**
  - `ConfigProvider` - Login configuration context
  - `useConfig` hook for accessing login config
  - Support for fetching config from Keycloak server
  - Support for reading config from DOM (for themes)
- **Theming**
  - Customizable appearance via CSS variables
  - Dark/light theme support
- **Account UI** (separate entry point)
  - Re-exports from `@keycloak/keycloak-account-ui`
  - `PersonalInfo`, `DeviceActivity`, `LinkedAccounts`, etc.
- **Headless Hooks**
  - `useSignIn` - Build custom sign-in UI with full state management

### Security

- PKCE enabled by default for all authentication flows
- No automatic token refresh (user re-authentication on expiry)

[unreleased]: https://github.com/keycloak/keycloak-react/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/keycloak/keycloak-react/releases/tag/v0.1.0
