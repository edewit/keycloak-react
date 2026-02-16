/**
 * Appearance configuration for Keycloak React components.
 * Inspired by Clerk's appearance API for easy theming.
 * 
 * Under the hood, this maps to PatternFly CSS variables for consistency
 * with Keycloak's quick theme feature.
 */
export interface Appearance {
  /**
   * CSS variables that control the visual appearance of components.
   * These are mapped to PatternFly CSS variables.
   */
  variables?: AppearanceVariables;
  /**
   * CSS class names to apply to specific elements.
   * Allows for granular customization using your own CSS classes.
   */
  elements?: AppearanceElements;
  /**
   * Base theme to extend. Can be 'light' or 'dark'.
   */
  baseTheme?: "light" | "dark";
}

/**
 * CSS variables for theming components.
 * All values should be valid CSS values (colors, sizes, etc.)
 */
export interface AppearanceVariables {
  /** Primary brand color (buttons, links, focus states) */
  colorPrimary?: string;
  /** Primary color hover state */
  colorPrimaryHover?: string;
  /** Background color for the page */
  colorBackground?: string;
  /** Background color for cards and elevated surfaces */
  colorBackgroundCard?: string;
  /** Primary text color */
  colorText?: string;
  /** Secondary/muted text color */
  colorTextSecondary?: string;
  /** Danger/error color */
  colorDanger?: string;
  /** Success color */
  colorSuccess?: string;
  /** Warning color */
  colorWarning?: string;
  /** Border color */
  colorBorder?: string;
  /** Input field background */
  colorInputBackground?: string;
  /** Border radius for cards, buttons, inputs */
  borderRadius?: string;
  /** Font family for all text */
  fontFamily?: string;
}

/**
 * Element-specific class names for granular customization.
 */
export interface AppearanceElements {
  /** The root container element */
  root?: string;
  /** The login card container */
  card?: string;
  /** Card header section */
  header?: string;
  /** Page title/heading */
  title?: string;
  /** Page subtitle */
  subtitle?: string;
  /** Social login buttons container */
  socialButtons?: string;
  /** Individual social login button */
  socialButton?: string;
  /** Divider between social buttons and form */
  divider?: string;
  /** The login form */
  form?: string;
  /** Form field containers */
  formField?: string;
  /** Form labels */
  formLabel?: string;
  /** Form input fields */
  formInput?: string;
  /** Form helper/error text */
  formHelperText?: string;
  /** Primary action button */
  primaryButton?: string;
  /** Secondary/text buttons */
  secondaryButton?: string;
  /** Footer section */
  footer?: string;
  /** Footer links */
  footerLink?: string;
  /** Remember me checkbox container */
  rememberMe?: string;
}

/**
 * Mapping from our simple variable names to PatternFly CSS variables.
 * This ensures compatibility with quick theme and PatternFly components.
 * 
 * PatternFly uses a dark/light palette system:
 * - "dark" colors are used on light backgrounds (dark text/buttons on light bg)
 * - "light" colors are used on dark backgrounds (light text/buttons on dark bg)
 */
const PATTERNFLY_VARIABLE_MAP: Record<keyof AppearanceVariables, string | string[]> = {
  colorPrimary: [
    "--pf-v5-global--primary-color--100",
    "--pf-v5-global--primary-color--dark-100",
    "--pf-v5-global--link--Color",
    "--pf-v5-global--active-color--100",
  ],
  colorPrimaryHover: [
    "--pf-v5-global--primary-color--200",
    "--pf-v5-global--primary-color--dark-200",
    "--pf-v5-global--link--Color--hover",
  ],
  colorBackground: "--pf-v5-global--BackgroundColor--200",
  colorBackgroundCard: "--pf-v5-global--BackgroundColor--100",
  colorText: "--pf-v5-global--Color--100",
  colorTextSecondary: "--pf-v5-global--Color--200",
  colorDanger: [
    "--pf-v5-global--danger-color--100",
    "--pf-v5-global--danger-color--dark-100",
  ],
  colorSuccess: [
    "--pf-v5-global--success-color--100",
    "--pf-v5-global--success-color--dark-100",
  ],
  colorWarning: [
    "--pf-v5-global--warning-color--100",
    "--pf-v5-global--warning-color--dark-100",
  ],
  colorBorder: "--pf-v5-global--BorderColor--100",
  colorInputBackground: "--pf-v5-global--BackgroundColor--100",
  borderRadius: "--pf-v5-global--BorderRadius--sm",
  fontFamily: "--pf-v5-global--FontFamily--text",
};

/**
 * Dark theme PatternFly variable overrides
 */
const DARK_THEME_VARIABLES: Record<string, string> = {
  "--pf-v5-global--BackgroundColor--100": "#212427",
  "--pf-v5-global--BackgroundColor--200": "#1b1d21",
  "--pf-v5-global--Color--100": "#f0f0f0",
  "--pf-v5-global--Color--200": "#a3a6a9",
  "--pf-v5-global--BorderColor--100": "#444548",
  // Primary colors - both regular and dark/light palette variants
  "--pf-v5-global--primary-color--100": "#73bcf7",
  "--pf-v5-global--primary-color--200": "#2b9af3",
  "--pf-v5-global--primary-color--dark-100": "#73bcf7",
  "--pf-v5-global--primary-color--dark-200": "#2b9af3",
  "--pf-v5-global--link--Color": "#73bcf7",
  "--pf-v5-global--link--Color--hover": "#2b9af3",
};

/**
 * Apply appearance configuration by setting PatternFly CSS variables.
 * 
 * @param appearance - The appearance configuration to apply
 * @param target - Optional target element (defaults to document.documentElement)
 * 
 * @example
 * ```tsx
 * applyAppearance({
 *   variables: {
 *     colorPrimary: '#6366f1',
 *     borderRadius: '8px',
 *   },
 * });
 * ```
 */
export function applyAppearance(
  appearance: Appearance,
  target: HTMLElement = document.documentElement
): void {
  // Apply base theme first
  if (appearance.baseTheme === "dark") {
    Object.entries(DARK_THEME_VARIABLES).forEach(([cssVar, value]) => {
      target.style.setProperty(cssVar, value);
    });
    target.setAttribute("data-pf-theme", "dark");
  }

  // Apply custom CSS variables
  if (appearance.variables) {
    Object.entries(appearance.variables).forEach(([key, value]) => {
      if (value !== undefined) {
        const pfVars = PATTERNFLY_VARIABLE_MAP[key as keyof AppearanceVariables];
        if (pfVars) {
          const vars = Array.isArray(pfVars) ? pfVars : [pfVars];
          vars.forEach((cssVar) => {
            target.style.setProperty(cssVar, value);
          });
        }
      }
    });
  }
}

/**
 * Remove all applied appearance CSS variables.
 * 
 * @param target - Optional target element (defaults to document.documentElement)
 */
export function clearAppearance(
  target: HTMLElement = document.documentElement
): void {
  // Clear all PatternFly variables we might have set
  const allVars = new Set<string>();
  
  // Collect all variable names from the map
  Object.values(PATTERNFLY_VARIABLE_MAP).forEach((vars) => {
    if (Array.isArray(vars)) {
      vars.forEach((v) => allVars.add(v));
    } else {
      allVars.add(vars);
    }
  });

  // Also clear dark theme variables
  Object.keys(DARK_THEME_VARIABLES).forEach((v) => allVars.add(v));

  // Remove all variables
  allVars.forEach((cssVar) => {
    target.style.removeProperty(cssVar);
  });

  // Remove theme attribute
  target.removeAttribute("data-pf-theme");
}

/**
 * Create a merged appearance configuration.
 * Later values override earlier ones.
 * 
 * @param appearances - Appearance configurations to merge
 * @returns Merged appearance configuration
 */
export function mergeAppearance(...appearances: (Appearance | undefined)[]): Appearance {
  const result: Appearance = {};

  for (const appearance of appearances) {
    if (!appearance) continue;

    if (appearance.baseTheme) {
      result.baseTheme = appearance.baseTheme;
    }

    if (appearance.variables) {
      result.variables = {
        ...result.variables,
        ...appearance.variables,
      };
    }

    if (appearance.elements) {
      result.elements = {
        ...result.elements,
        ...appearance.elements,
      };
    }
  }

  return result;
}

/**
 * Get the PatternFly CSS variable name(s) for a given appearance variable key.
 * 
 * @param key - The appearance variable key
 * @returns The PatternFly CSS variable name(s)
 */
export function getPatternFlyVariables(key: keyof AppearanceVariables): string[] {
  const vars = PATTERNFLY_VARIABLE_MAP[key];
  return Array.isArray(vars) ? vars : [vars];
}

/**
 * Get element class name from appearance configuration.
 * Combines the default class with any custom classes.
 * 
 * @param elements - The elements configuration
 * @param key - The element key
 * @param defaultClass - Default class name
 * @returns Combined class name string
 */
export function getElementClassName(
  elements: AppearanceElements | undefined,
  key: keyof AppearanceElements,
  defaultClass: string = ""
): string {
  const customClass = elements?.[key];
  return customClass ? `${defaultClass} ${customClass}`.trim() : defaultClass;
}
