import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  validateLoginConfig,
  getValidatedLoginConfig,
  parseLoginConfig,
  getLoginConfigFromDOM,
  LoginConfigError,
  DEFAULT_CONFIG_ELEMENT_ID,
} from '../config';

describe('validateLoginConfig', () => {
  it('should return true for valid config', () => {
    const config = {
      realm: {
        name: 'test-realm',
        displayName: 'Test Realm',
        registrationAllowed: true,
        resetPasswordAllowed: true,
        rememberMe: true,
        loginWithEmailAllowed: true,
        registrationEmailAsUsername: false,
        password: true,
      },
      urls: {
        login: '/login',
        registration: '/register',
      },
    };

    expect(validateLoginConfig(config)).toBe(true);
  });

  it('should throw for null', () => {
    expect(() => validateLoginConfig(null)).toThrow(LoginConfigError);
    expect(() => validateLoginConfig(null)).toThrow('Login configuration must be an object');
  });

  it('should throw for non-object', () => {
    expect(() => validateLoginConfig('string')).toThrow(LoginConfigError);
    expect(() => validateLoginConfig(123)).toThrow(LoginConfigError);
    expect(() => validateLoginConfig(undefined)).toThrow(LoginConfigError);
  });

  it('should throw for config without realm', () => {
    const config = {
      urls: { login: '/login' },
    };
    expect(() => validateLoginConfig(config)).toThrow(LoginConfigError);
    expect(() => validateLoginConfig(config)).toThrow("must have a 'realm' object");
  });

  it('should throw for config without urls', () => {
    const config = {
      realm: { name: 'test' },
    };
    expect(() => validateLoginConfig(config)).toThrow(LoginConfigError);
    expect(() => validateLoginConfig(config)).toThrow("must have a 'urls' object");
  });

  it('should throw for realm without name', () => {
    const config = {
      realm: { displayName: 'Test' },
      urls: { login: '/login' },
    };
    expect(() => validateLoginConfig(config)).toThrow(LoginConfigError);
    expect(() => validateLoginConfig(config)).toThrow("must have a 'name' string");
  });
});

describe('getValidatedLoginConfig', () => {
  let scriptElement: HTMLScriptElement | null = null;

  beforeEach(() => {
    const existing = document.getElementById(DEFAULT_CONFIG_ELEMENT_ID);
    if (existing) existing.remove();
  });

  afterEach(() => {
    if (scriptElement) {
      scriptElement.remove();
      scriptElement = null;
    }
  });

  it('should return config when valid', () => {
    scriptElement = document.createElement('script');
    scriptElement.id = DEFAULT_CONFIG_ELEMENT_ID;
    scriptElement.type = 'application/json';
    scriptElement.textContent = JSON.stringify({
      realm: { name: 'test' },
      urls: { login: '/login' },
    });
    document.body.appendChild(scriptElement);

    const result = getValidatedLoginConfig();
    expect(result.realm.name).toBe('test');
  });

  it('should throw LoginConfigError when element not found', () => {
    expect(() => getValidatedLoginConfig()).toThrow(LoginConfigError);
  });
});

describe('parseLoginConfig', () => {
  it('should parse valid JSON', () => {
    const json = JSON.stringify({
      realm: { name: 'test' },
      urls: { login: '/login' },
    });

    const result = parseLoginConfig(json);
    expect(result.realm.name).toBe('test');
  });

  it('should throw LoginConfigError for invalid JSON', () => {
    expect(() => parseLoginConfig('not json')).toThrow(LoginConfigError);
    expect(() => parseLoginConfig('not json')).toThrow('Failed to parse');
  });

  it('should parse empty object (no validation in parseLoginConfig)', () => {
    // parseLoginConfig only parses JSON, doesn't validate structure
    const result = parseLoginConfig('{}');
    expect(result).toEqual({});
  });
});

describe('getLoginConfigFromDOM', () => {
  let scriptElement: HTMLScriptElement | null = null;

  beforeEach(() => {
    const existing = document.getElementById(DEFAULT_CONFIG_ELEMENT_ID);
    if (existing) existing.remove();
  });

  afterEach(() => {
    if (scriptElement) {
      scriptElement.remove();
      scriptElement = null;
    }
  });

  it('should throw when element does not exist', () => {
    expect(() => getLoginConfigFromDOM()).toThrow(LoginConfigError);
    expect(() => getLoginConfigFromDOM()).toThrow('not found in DOM');
  });

  it('should parse config from DOM element', () => {
    scriptElement = document.createElement('script');
    scriptElement.id = DEFAULT_CONFIG_ELEMENT_ID;
    scriptElement.type = 'application/json';
    scriptElement.textContent = JSON.stringify({
      realm: { name: 'dom-realm' },
      urls: { login: '/login' },
    });
    document.body.appendChild(scriptElement);

    const result = getLoginConfigFromDOM();
    expect(result.realm.name).toBe('dom-realm');
  });

  it('should use custom element ID', () => {
    scriptElement = document.createElement('script');
    scriptElement.id = 'custom-config';
    scriptElement.type = 'application/json';
    scriptElement.textContent = JSON.stringify({
      realm: { name: 'custom-realm' },
      urls: { login: '/login' },
    });
    document.body.appendChild(scriptElement);

    const result = getLoginConfigFromDOM('custom-config');
    expect(result.realm.name).toBe('custom-realm');
  });

  it('should throw for empty element', () => {
    scriptElement = document.createElement('script');
    scriptElement.id = DEFAULT_CONFIG_ELEMENT_ID;
    scriptElement.textContent = '';
    document.body.appendChild(scriptElement);

    expect(() => getLoginConfigFromDOM()).toThrow(LoginConfigError);
    expect(() => getLoginConfigFromDOM()).toThrow('is empty');
  });

  it('should throw for invalid JSON in DOM element', () => {
    scriptElement = document.createElement('script');
    scriptElement.id = DEFAULT_CONFIG_ELEMENT_ID;
    // Use a proper script type to avoid JSDOM trying to execute it
    scriptElement.type = 'application/json';
    scriptElement.textContent = '{invalid json}';
    document.body.appendChild(scriptElement);

    expect(() => getLoginConfigFromDOM()).toThrow(LoginConfigError);
    expect(() => getLoginConfigFromDOM()).toThrow('Failed to parse');
  });
});

describe('LoginConfigError', () => {
  it('should be an instance of Error', () => {
    const error = new LoginConfigError('test message');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(LoginConfigError);
  });

  it('should have correct message', () => {
    const error = new LoginConfigError('custom error');
    expect(error.message).toBe('custom error');
  });

  it('should have correct name', () => {
    const error = new LoginConfigError('test');
    expect(error.name).toBe('LoginConfigError');
  });
});
