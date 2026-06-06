/**
 * Pixel thresholds that drive header element visibility for the codeai brand.
 * Values mirror the max-width rules in application.scss (1060px) and
 * user-menu.scss (1200px) — see those files for the authoritative SCSS source.
 */
export const HEADER_BREAKPOINTS = {
  /** Auth buttons (sign in / create account) appear at this width and above. */
  mobileAuth: 768,
  /** Nav links and help button appear above this width. */
  desktopNav: 1061,
  /** Create menu appears above this width. */
  desktopFull: 1201,
} as const;
