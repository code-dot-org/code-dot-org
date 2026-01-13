import {Components, Theme} from '@mui/material/styles';

/**
 * Style helper functions for NotificationBanner component.
 * NotificationBanner uses component-level styling (sx prop) rather than
 * theme-level variants because it's a composite component (Paper + Stack + Typography).
 */

export const VARIANT_PREFIX_MAP: Record<string, string> = {
  primary: 'brand-purple',
  brand: 'brand-teal',
  info: 'info',
  success: 'success',
  warning: 'warning',
  error: 'error',
  aqua: 'brand-aqua',
  gray: 'neutral',
};

export const getNotificationBannerBackgroundColor = (
  variant: string,
  style: 'subtle' | 'filled',
): string => {
  if (style === 'subtle') {
    return 'var(--background-neutral-primary)';
  }
  const prefix = VARIANT_PREFIX_MAP[variant] || 'neutral';
  return `var(--background-${prefix}-extra-light)`;
};

export const getNotificationBannerBorderColor = (
  variant: string,
  style: 'subtle' | 'filled',
): string => {
  if (style === 'subtle') {
    return 'var(--borders-neutral-primary)';
  }
  const prefix = VARIANT_PREFIX_MAP[variant] || 'neutral';
  return `var(--borders-${prefix}-primary)`;
};

export const getNotificationBannerIconContainerBorderColor = (
  variant: string,
): string => {
  const prefix = VARIANT_PREFIX_MAP[variant] || 'neutral';
  return `var(--borders-${prefix}-primary)`;
};

export const getNotificationBannerIconColor = (variant: string): string => {
  const prefix = VARIANT_PREFIX_MAP[variant] || 'neutral';
  if (variant === 'gray') {
    return 'var(--text-neutral-primary)';
  }
  return `var(--text-${prefix}-primary-fixed)`;
};

export const NOTIFICATION_BANNER_OVERRIDES: Components<Theme>['MuiPaper'] = {
  styleOverrides: {},
};
