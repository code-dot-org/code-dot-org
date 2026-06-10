/**
 * Pixel thresholds that drive header element visibility, matching the legacy
 * header's own collapse points (application.scss @1060, user-menu.scss @1200).
 * Header-specific and intentionally distinct from the MUI theme breakpoints
 * (sm/md/lg) — do not fold these into `theme.breakpoints`.
 */
export const HEADER_BREAKPOINTS = {
  /** Signed-out Sign in / Create account sit on the bar at this width and up; below it they move into the hamburger. */
  mobileAuth: 768,
  /** Nav links and help button appear above this width. */
  desktopNav: 1061,
  /** Create menu appears above this width. */
  desktopFull: 1201,
} as const;
