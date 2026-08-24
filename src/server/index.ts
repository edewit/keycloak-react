// Server-side authentication with Auth.js (NextAuth v5)
// Tokens are kept server-side only - never exposed to client

export {
  createKeycloakAuth,
  type KeycloakAuthConfig,
  type KeycloakSession,
} from "./auth";

export {
  getServerSession,
  getUser,
  hasRole,
  hasAnyRole,
  hasAllRoles,
  type User,
  type ServerSession,
  type GetServerSessionOptions,
} from "./session";

// Re-export commonly used types from next-auth
export type { Session } from "next-auth";
export type { JWT } from "next-auth/jwt";
