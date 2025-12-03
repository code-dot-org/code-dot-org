import FontAwesomeV6Icon, {
  FontAwesomeV6IconProps,
} from '@code-dot-org/component-library/fontAwesomeV6Icon';
import classnames from 'classnames';
import React, {HTMLAttributes, useMemo, forwardRef} from 'react';

import {ProjectFile} from '@cdo/apps/lab2/types';

import moduleStyles from './ai-tutor-version-action-notification.module.scss';

type NotificationType = 'accept' | 'reject';

export interface AiTutorVersionActionNotificationProps
  extends HTMLAttributes<HTMLDivElement> {
  /** Notification markdown text */
  text: string;
  /** Notification type (success for accept, error for reject) */
  type: NotificationType;
  /** AI Tutor version files */
  files?: ProjectFile[];
}

const getIconFromType = (
  type: NotificationType
): FontAwesomeV6IconProps | undefined => {
  const iconMap: Record<NotificationType, FontAwesomeV6IconProps> = {
    accept: {iconName: 'check-circle'},
    reject: {iconName: 'circle-xmark'},
  };

  return iconMap[type];
};

/**
 * Notification component for AI Tutor version actions (accept/reject).
 * Renders markdown content without close button or timestamp.
 */
const AiTutorVersionActionNotification = forwardRef<
  HTMLDivElement,
  AiTutorVersionActionNotificationProps
>(({text, type, files, className, ...htmlAttributes}, ref) => {
  const icon = useMemo(() => getIconFromType(type), [type]);

  return (
    <div
      ref={ref}
      className={classnames(
        moduleStyles.notification,
        moduleStyles[`notification-${type}`],
        className
      )}
      role="status"
      {...htmlAttributes}
    >
      <div className={moduleStyles.notificationContent}>
        {icon && <FontAwesomeV6Icon {...icon} />}
        <div className={moduleStyles.notificationText}>
          {text}
          {files && (
            <ul>
              {files.map(file => (
                <li key={file.id}>
                  {file.name}{' '}
                  {file.isAiTutorVersionUpdated
                    ? '(File update)'
                    : '(New file)'}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
});

AiTutorVersionActionNotification.displayName =
  'AiTutorVersionActionNotification';
export default AiTutorVersionActionNotification;
