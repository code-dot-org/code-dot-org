/**
 * NotificationBanner style definitions.
 *
 * NotificationBanner uses CSS Modules (notificationBanner.module.scss) for styling
 * rather than MUI theme overrides because it's a composite component built from
 * multiple MUI primitives (Paper, Stack, Typography, IconButton).
 *
 * This file is kept for documentation and potential future use if we need
 * to expose any shared style constants.
 */

// Variant to CSS variable prefix mapping for reference
export const VARIANT_PREFIX_MAP: Record<string, string> = {
  primary: 'brand-purple',
  brand: 'brand-teal',
  info: 'info',
  success: 'success',
  warning: 'warning',
  error: 'error',
  ai: 'brand-aqua',
  gray: 'neutral',
};
