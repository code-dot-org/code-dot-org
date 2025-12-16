import classnames from 'classnames';
import React, {HTMLAttributes, forwardRef} from 'react';

import AiTutorVersionFileChip from '@cdo/apps/aiComponentLibrary/aiTutorVersionFileChip/AiTutorVersionFileChip';
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

/**
 * Notification component for AI Tutor version actions (accept/reject).
 * Renders markdown content without close button or timestamp.
 */
const AiTutorVersionActionNotification = forwardRef<
  HTMLDivElement,
  AiTutorVersionActionNotificationProps
>(({text, type, files, className, ...htmlAttributes}, ref) => {
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
        <div className={moduleStyles.notificationText}>{text}</div>
        {files && (
          <div className={moduleStyles.fileList}>
            {files.map(file => (
              <AiTutorVersionFileChip
                key={file.id}
                file={file}
                isInReview={false}
                isAccepted={type === 'accept' ? true : false}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

AiTutorVersionActionNotification.displayName =
  'AiTutorVersionActionNotification';
export default AiTutorVersionActionNotification;
