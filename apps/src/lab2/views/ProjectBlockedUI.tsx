import Alert, {alertTypes} from '@code-dot-org/component-library/alert';
import React, {useState} from 'react';

import AbuseExclamation from '@cdo/apps/code-studio/components/AbuseExclamation';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import i18n from '@cdo/locale';

import Lab2Registry from '../Lab2Registry';

import moduleStyles from './Lab2Wrapper.module.scss';

type BlockedType = 'projectAbuse' | 'projectSharingDisabled';

export const ProjectBlockedUI: React.FunctionComponent<{
  blockedType: BlockedType;
  isProjectValidator: boolean;
}> = ({blockedType, isProjectValidator}) => {
  const [showAlert, setShowAlert] = useState(true);
  const projectManager = Lab2Registry.getInstance().getProjectManager();
  const shareUrl = projectManager ? projectManager.getShareUrl() : null;
  const isOwner = useAppSelector(state => state.lab.channel?.isOwner || false);
  const abuseExclamationProps = {
    isOwner,
    i18n:
      blockedType === 'projectAbuse'
        ? {
            tos: i18n.tosLong({url: 'http://code.org/tos'}),
            contact_us: i18n.contactUs({
              url: `https://support.code.org/hc/en-us/requests/new?&description=${encodeURIComponent(
                `Abuse error for project at url: ${shareUrl}`
              )}`,
            }),
            edit_project: i18n.editProject(),
            go_to_code_studio: i18n.goToCodeStudio(),
          }
        : {
            tos: i18n.sharingDisabled({
              sign_in_url: 'https://studio.code.org/users/sign_in',
            }),
            contact_us: i18n.contactUs({
              url: 'https://support.code.org/hc/en-us/requests/new',
            }),
            edit_project: i18n.editProject(),
            go_to_code_studio: i18n.goToCodeStudio(),
          },
  };

  if (isProjectValidator) {
    return (
      <div
        id="blocked-project-ui-container-project-validator"
        className={moduleStyles.blockedProjectUIContainerProjectValidator}
      >
        {showAlert && blockedType === 'projectAbuse' && (
          <Alert
            text={i18n.tosWithoutLink()}
            type={alertTypes.danger}
            onClose={() => {
              setShowAlert(false);
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div
      id="blocked-project-ui-container"
      className={moduleStyles.blockedProjectUIContainer}
    >
      <AbuseExclamation {...abuseExclamationProps} />
    </div>
  );
};
