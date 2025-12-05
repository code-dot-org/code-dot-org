import Button from '@code-dot-org/component-library/button';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import classnames from 'classnames';
import React, {HTMLAttributes, useCallback, forwardRef} from 'react';

import {ProjectFile} from '@cdo/apps/lab2/types';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
import {
  acceptAiTutorVersion,
  rejectAiTutorVersion,
} from '@cdo/apps/weblab2/weblab2ReduxThunks';

import moduleStyles from './ai-tutor-version-alert.module.scss';

export interface AiTutorVersionAlertProps
  extends HTMLAttributes<HTMLDivElement> {
  /** Alert text */
  text: string;
  /** AI Tutor version files */
  aiTutorVersionFiles: ProjectFile[] | undefined;
  /** Custom className */
  className?: string;
}

/**
 * Alert component for AI Tutor version actions.
 * Displays an alert with file chips and Accept/Reject buttons.
 */
const AiTutorVersionAlert = forwardRef<
  HTMLDivElement,
  AiTutorVersionAlertProps
>(({text, aiTutorVersionFiles, className, ...htmlAttributes}, ref) => {
  const dispatch = useAppDispatch();

  const handleAccept = useCallback(() => {
    if (!aiTutorVersionFiles) return;
    dispatch(acceptAiTutorVersion(aiTutorVersionFiles));
  }, [dispatch, aiTutorVersionFiles]);

  const handleReject = useCallback(() => {
    if (!aiTutorVersionFiles) return;
    dispatch(rejectAiTutorVersion(aiTutorVersionFiles));
  }, [dispatch, aiTutorVersionFiles]);

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
        <div className={moduleStyles.buttonContainer}>
          <Button
            text="Reject"
            size="xs"
            color="gray"
            type="secondary"
            iconLeft={{
              iconStyle: 'solid',
              iconName: 'close',
              title: 'Reject',
            }}
            onClick={handleReject}
            className={moduleStyles.actionButton}
          />
          <Button
            text="Accept"
            size="xs"
            type="primary"
            color="purple"
            iconLeft={{
              iconStyle: 'solid',
              iconName: 'check',
              title: 'Accept',
            }}
            onClick={handleAccept}
            className={moduleStyles.actionButton}
          />
        </div>
      </div>
    </div>
  );
});

AiTutorVersionAlert.displayName = 'AiTutorVersionAlert';
export default AiTutorVersionAlert;
