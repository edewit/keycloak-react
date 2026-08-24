/// <reference types="vite/client" />

/**
 * Environment variables for Keycloak React SSR configuration.
 * These are used by the server module with Auth.js.
 */
declare namespace NodeJS {
  interface ProcessEnv {
    /** Keycloak server URL (e.g., http://localhost:8080) */
    KEYCLOAK_URL?: string;
    /** Keycloak realm name */
    KEYCLOAK_REALM?: string;
    /** OAuth client ID */
    KEYCLOAK_CLIENT_ID?: string;
    /** OAuth client secret */
    KEYCLOAK_CLIENT_SECRET?: string;
    /** Auth.js secret for JWT encryption */
    NEXTAUTH_SECRET?: string;
    /** Alternative name for Auth.js secret */
    AUTH_SECRET?: string;
    /** Application URL for OAuth callbacks */
    NEXTAUTH_URL?: string;
    /** Enable Auth.js debug logging */
    AUTH_DEBUG?: string;
    /** Node environment */
    NODE_ENV?: "development" | "production" | "test";
  }
}
