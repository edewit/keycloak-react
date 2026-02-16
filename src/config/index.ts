// Types
export type {
  LoginConfig,
  RealmConfig,
  IdentityProvider,
  LoginUrls,
  BrandingConfig,
  LoginState,
  FormError,
  PageMessage,
} from "./types";

// Parsing utilities
export {
  getLoginConfigFromDOM,
  parseLoginConfig,
  validateLoginConfig,
  getValidatedLoginConfig,
  LoginConfigError,
  DEFAULT_CONFIG_ELEMENT_ID,
} from "./parse";

// Fetch utilities
export {
  fetchLoginConfig,
  getLoginConfigUrl,
  type FetchLoginConfigOptions,
} from "./fetch";
