import Alert from '@code-dot-org/component-library/alert';
import classNames from 'classnames';
import React, {useEffect, useState} from 'react';

import {getUserAppOptionsPath} from '@cdo/apps/code-studio/progressReduxSelectors';
import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import moduleStyles from './pairingNavigatorAlert.module.scss';

type PairingNavigatorAlertProps = {
  /** Is alert displayed within the workspace area */
  inWorkspaceContainer?: boolean;
  /** Optional custom className */
  className?: string;
  /** Is driver's project viewable, i.e., does the app type displaying the alert have a standalone project level? */
  doesAppTypeHaveStandaloneProjectLevel?: boolean;
  /** Alert copy variant for teacher view */
  isTeacherViewingStudent?: boolean;
};

type PairingProperties = {
  isNavigator?: boolean;
  pairingDriver?: string;
  pairingChannelId?: string;
};

const PairingNavigatorAlert: React.FC<PairingNavigatorAlertProps> = ({
  inWorkspaceContainer,
  className,
  isTeacherViewingStudent,
  doesAppTypeHaveStandaloneProjectLevel = true,
}) => {
  const levelProperties = useAppSelector(state => state.lab.levelProperties);
  const userAppOptionsPath = useAppSelector(getUserAppOptionsPath);
  const viewAsUserId = useAppSelector(state => state.progress.viewAsUserId);
  const [userPairingProperties, setUserPairingProperties] =
    useState<PairingProperties>();

  useEffect(() => {
    if (!userAppOptionsPath) {
      setUserPairingProperties(undefined);
      return;
    }
    if (isTeacherViewingStudent && !viewAsUserId) {
      setUserPairingProperties({});
      return;
    }

    const userIdQuery = isTeacherViewingStudent
      ? `?user_id=${viewAsUserId}`
      : '';
    const userAppOptionsUrl = `${userAppOptionsPath}${userIdQuery}`;
    let isCancelled = false;

    HttpClient.fetchJson<PairingProperties>(
      userAppOptionsUrl,
      undefined,
      response => response as PairingProperties
    )
      .then(({value}) => {
        if (isCancelled) {
          return;
        }
        setUserPairingProperties({
          isNavigator: value.isNavigator,
          pairingDriver: value.pairingDriver,
          pairingChannelId: value.pairingChannelId,
        });
      })
      .catch(() => {
        if (isCancelled) {
          return;
        }
        setUserPairingProperties({});
      });

    return () => {
      isCancelled = true;
    };
  }, [isTeacherViewingStudent, userAppOptionsPath, viewAsUserId]);

  if (!levelProperties) {
    return null;
  }

  if (!userPairingProperties?.isNavigator) {
    return null;
  }

  const projectViewPath =
    doesAppTypeHaveStandaloneProjectLevel &&
    Boolean(userPairingProperties.pairingChannelId)
      ? `/projects/${levelProperties.appName}/${userPairingProperties.pairingChannelId}/view`
      : undefined;
  if (
    isTeacherViewingStudent &&
    (!userPairingProperties.pairingDriver || !projectViewPath)
  ) {
    return null;
  }
  const linkText = isTeacherViewingStudent
    ? 'Click here to view the solution created as a team.'
    : 'Click here to view the solution you created as a team.';

  const additionalInfo = projectViewPath ? (
    <a className={moduleStyles.projectLink} href={projectViewPath}>
      {linkText}
    </a>
  ) : (
    <>
      The solution is not available for viewing. Refer to{' '}
      {userPairingProperties.pairingDriver}'s work for the solution.
    </>
  );
  const alertText = userPairingProperties.pairingDriver ? (
    <>
      This level was completed while pairing with{' '}
      <strong>{userPairingProperties.pairingDriver}</strong>. {additionalInfo}
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
