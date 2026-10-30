import {Paper, Stack, Typography, IconButton, Box} from '@mui/material';
import classNames from 'classnames';
import {forwardRef, ReactNode} from 'react';

import FontAwesomeV6Icon, {FontAwesomeV6IconProps} from '@/fontAwesomeV6Icon';

import {NotificationBannerVariant, NotificationBannerStyle} from './types';

import styles from './notificationBanner.module.scss';

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
    const ariaLive = role === 'alert' ? 'assertive' : 'polite';

    const bannerClassName = classNames(
      styles.banner,
      styles[style],
      styles[variant],
      fullWidth && styles.fullWidth,
      className,
    );

    const iconContainerClassName = classNames(
      styles.iconContainer,
      styles[variant],
    );

    return (
      <Paper
        ref={ref}
        component="div"
        role={role}
        aria-live={ariaLive}
        className={bannerClassName}
        id={id}
        elevation={0}
        {...rest}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Box className={iconContainerClassName}>
            <FontAwesomeV6Icon {...icon} />
          </Box>

          <Stack direction="column" spacing={0.5} className={styles.content}>
            <Typography variant="h6" component="h3" className={styles.title}>
              {title}
            </Typography>

            {bodyContent && (
              <Typography variant="body3" component="div">
                {bodyContent}
              </Typography>
            )}
          </Stack>

          {(actions || onClose) && (
            <Stack direction="row" spacing={0.5} className={styles.actions}>
              {actions}
              {onClose && (
                <IconButton
                  size="small"
                  onClick={onClose}
                  aria-label="Close notification"
                  className={styles.closeButton}
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
