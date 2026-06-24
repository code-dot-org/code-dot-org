import Alert from '@code-dot-org/component-library/alert';
import classNames from 'classnames';
import React from 'react';

import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import moduleStyles from './pairingNavigatorAlert.module.scss';

type PairingNavigatorAlertProps = {
  /** Is alert displayed within the workspace area */
  inWorkspaceContainer?: boolean;
  /** Optional custom className */
  className?: string;
  /** Alert copy variant for teacher view */
  isTeacherViewingStudent?: boolean;
};

const PairingNavigatorAlert: React.FC<PairingNavigatorAlertProps> = ({
  inWorkspaceContainer,
  className,
  isTeacherViewingStudent,
}) => {
  const levelProperties = useAppSelector(state => state.lab.levelProperties);

  if (!levelProperties?.isNavigator) {
    return null;
  }

  const projectViewPath = levelProperties.pairingChannelId
    ? `/projects/${levelProperties.appName}/${levelProperties.pairingChannelId}/view`
    : undefined;
  const pairingLink = levelProperties.pairingAttempt || projectViewPath;
  if (
    isTeacherViewingStudent &&
    (!levelProperties.pairingDriver || !pairingLink)
  ) {
    return null;
  }
  const linkText = isTeacherViewingStudent
    ? 'Click here to view the solution created as a team.'
    : 'Click here to view the solution you created as a team.';

  const alertText = levelProperties.pairingDriver ? (
    <>
      This level was completed while pairing with{' '}
      <strong>{levelProperties.pairingDriver}</strong>.{' '}
      {pairingLink && (
        <a className={moduleStyles.projectLink} href={pairingLink}>
          {linkText}
        </a>
      )}
    </>
  ) : (
    <>
      You completed this level while pair programming, but your partner's
      project is no longer available.
    </>
  );

  return (
    <Alert
      className={classNames(
        inWorkspaceContainer && moduleStyles.inWorkspaceContainer,
        className
      )}
      text={alertText}
      type="warning"
      size="xs"
    />
  );
};

export default PairingNavigatorAlert;
