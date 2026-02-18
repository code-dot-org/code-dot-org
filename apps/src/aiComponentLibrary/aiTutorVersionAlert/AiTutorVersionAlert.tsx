import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import classnames from 'classnames';
import React, {HTMLAttributes, forwardRef} from 'react';

import {ProjectFile} from '@cdo/apps/lab2/types';

import moduleStyles from './ai-tutor-version-alert.module.scss';

export interface AiTutorVersionAlertProps
  extends HTMLAttributes<HTMLDivElement> {
  /** AI Tutor version files */
  aiTutorVersionFiles: ProjectFile[] | undefined;
  /** Custom className */
  className?: string;
}

/**
 * Worskpace alert when in AI Tutor version and includes Accept/Reject buttons.
 */
const AiTutorVersionAlert = forwardRef<
  HTMLDivElement,
  AiTutorVersionAlertProps
>(({aiTutorVersionFiles, className, ...htmlAttributes}, ref) => {
  const text =
    'AI Tutor generated changes to your project. Accept to apply changes or reject to discard.';

  return (
    <div
      ref={ref}
      className={classnames(moduleStyles.alert, className)}
      role="alert"
      {...htmlAttributes}
    >
      <div className={moduleStyles.alertContent}>
        <div className={moduleStyles.textContainer}>
          <FontAwesomeV6Icon iconFamily="kit" iconName="ai-head-solid" />
          <span className={moduleStyles.alertText}>{text}</span>
        </div>
      </div>
    </div>
  );
});

AiTutorVersionAlert.displayName = 'AiTutorVersionAlert';
export default AiTutorVersionAlert;
