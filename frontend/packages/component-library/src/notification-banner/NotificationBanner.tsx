import {Paper, Stack, Typography, IconButton, Box} from '@mui/material';
import {forwardRef, ReactNode} from 'react';

import FontAwesomeV6Icon, {FontAwesomeV6IconProps} from '@/fontAwesomeV6Icon';
import {
  getNotificationBannerBackgroundColor,
  getNotificationBannerBorderColor,
  getNotificationBannerIconContainerBorderColor,
  getNotificationBannerIconColor,
} from '@/themes/code.org/styleOverrides/notificationBanner';

import {NotificationBannerVariant, NotificationBannerStyle} from './types';

export interface NotificationBannerProps {
  /** Variant color/sentiment */
  variant: NotificationBannerVariant;
  /** Style option: subtle (primary bg) or filled (tinted bg/color border) */
  style?: NotificationBannerStyle;
  /** Banner title */
  title: ReactNode;
  /** Banner description/body content */
  description?: ReactNode;
  /** Banner children (alternative to description) */
  children?: ReactNode;
  /** FontAwesome icon props (required) */
  icon: FontAwesomeV6IconProps;
  /** Action buttons (typically 1-2 buttons in a horizontal Stack) */
  actions?: ReactNode;
  /** Close handler - if provided, renders close IconButton */
  onClose?: () => void;
  /** ARIA role - 'status' for advisory info, 'alert' for urgent */
  role?: 'status' | 'alert';
  /** Full width container (default: true) */
  fullWidth?: boolean;
  /** Custom className */
  className?: string;
  /** HTML id */
  id?: string;
}

/**
 * Notification Banner component built on MUI Paper/Stack.
 * Displays inline notifications with variant colors, optional actions, and accessibility support.
 */
const NotificationBanner = forwardRef<HTMLDivElement, NotificationBannerProps>(
  (
    {
      variant,
      style = 'subtle',
      title,
      description,
      children,
      icon,
      actions,
      onClose,
      role = 'status',
      fullWidth = true,
      className,
      id,
      ...rest
    },
    ref,
  ) => {
    const bodyContent = description || children;

    const paperStyles = {
      elevation: 0,
      borderRadius: '0.25rem',
      border: `1px solid ${getNotificationBannerBorderColor(variant, style)}`,
      backgroundColor: getNotificationBannerBackgroundColor(variant, style),
      width: fullWidth ? '100%' : 'auto',
      p: 2,
      position: 'relative' as const,
      boxShadow: 'none',
    };

    const iconContainerStyles = {
      width: '3rem',
      height: '3rem',
      borderRadius: '50%',
      border: `3px solid ${getNotificationBannerIconContainerBorderColor(variant)}`,
      backgroundColor: 'var(--background-neutral-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      '& i': {
        color: getNotificationBannerIconColor(variant),
        fontSize: '1.375rem',
      },
    };

    const ariaLive = role === 'alert' ? 'assertive' : 'polite';

    return (
      <Paper
        ref={ref}
        component="div"
        role={role}
        aria-live={ariaLive}
        sx={paperStyles}
        className={className}
        id={id}
        {...rest}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Box sx={iconContainerStyles}>
            <FontAwesomeV6Icon {...icon} />
          </Box>

          <Stack direction="column" spacing={0.5} flex={1} minWidth={0}>
            <Typography variant="h6" component="h3" sx={{fontWeight: 600}}>
              {title}
            </Typography>

            {bodyContent && (
              <Typography variant="body3" component="div">
                {bodyContent}
              </Typography>
            )}
          </Stack>

          {(actions || onClose) && (
            <Stack
              direction="row"
              spacing={0.5}
              sx={{flexWrap: 'wrap', gap: 0.5, flexShrink: 0}}
            >
              {actions}
              {onClose && (
                <IconButton
                  size="small"
                  onClick={onClose}
                  aria-label="Close notification"
                  sx={{flexShrink: 0}}
                >
                  <FontAwesomeV6Icon
                    iconName="xmark"
                    iconStyle="solid"
                    aria-hidden="true"
                  />
                </IconButton>
              )}
            </Stack>
          )}
        </Stack>
      </Paper>
    );
  },
);

NotificationBanner.displayName = 'NotificationBanner';

export default NotificationBanner;
