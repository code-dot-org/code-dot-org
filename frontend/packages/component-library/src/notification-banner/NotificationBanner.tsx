import {Paper, Typography, IconButton} from '@mui/material';
import classNames from 'classnames';
import {forwardRef, ReactNode} from 'react';

import FontAwesomeV6Icon, {FontAwesomeV6IconProps} from '@/fontAwesomeV6Icon';

import {
  NotificationBannerFillStyle,
  NotificationBannerSentiment,
} from './types';

import styles from './notificationBanner.module.scss';

export interface NotificationBannerProps {
  /** Sentiment color. Matches the Figma Sentiment axis. */
  sentiment: NotificationBannerSentiment;
  /** Fill. `none` is a neutral surface; `color` tints the surface with the sentiment. */
  fillStyle?: NotificationBannerFillStyle;
  /** Banner title */
  title: ReactNode;
  /** Banner description */
  description?: ReactNode;
  /** Banner children, used when description is omitted */
  children?: ReactNode;
  /** Font Awesome icon. Figma's Icon Name is `iconName`; the library icon also needs a style. */
  icon: FontAwesomeV6IconProps;
  /**
   * Action buttons. Figma's Has Actions boolean shows a fixed pair of buttons;
   * callers pass the real buttons instead.
   */
  actions?: ReactNode;
  /**
   * Close handler. Figma's Is Dismissible boolean only shows the control;
   * passing a handler shows it and handles the click.
   */
  onClose?: () => void;
  /** ARIA role. `status` for advisory info, `alert` for urgent. */
  role?: 'status' | 'alert';
  /** Stretch to the container width. Default true. */
  fullWidth?: boolean;
  /** Custom className */
  className?: string;
  /** HTML id */
  id?: string;
}

/**
 * Inline page-level banner. Built on MUI Paper, Typography, and IconButton.
 */
const NotificationBanner = forwardRef<HTMLDivElement, NotificationBannerProps>(
  (
    {
      sentiment,
      fillStyle = 'none',
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

    return (
      <Paper
        ref={ref}
        component="div"
        role={role}
        aria-live={ariaLive}
        elevation={0}
        id={id}
        className={classNames(
          styles.banner,
          styles[fillStyle],
          styles[sentiment],
          fullWidth && styles.fullWidth,
          className,
        )}
        {...rest}
      >
        <div className={styles.row}>
          <div className={styles.iconWrap}>
            <div
              className={classNames(styles.iconContainer, styles[sentiment])}
            >
              <FontAwesomeV6Icon {...icon} />
            </div>
          </div>

          <div className={styles.main}>
            <div className={styles.text}>
              <Typography
                variant="body1"
                component="h3"
                className={styles.title}
              >
                {title}
              </Typography>

              {bodyContent && (
                <Typography
                  variant="body3"
                  component="div"
                  className={styles.description}
                >
                  {bodyContent}
                </Typography>
              )}
            </div>

            {actions && <div className={styles.actions}>{actions}</div>}
          </div>
        </div>

        {onClose && (
          <IconButton
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
      </Paper>
    );
  },
);

NotificationBanner.displayName = 'NotificationBanner';

export default NotificationBanner;
