import React, {useState} from 'react';

import AbuseExclamation from '@cdo/apps/code-studio/components/AbuseExclamation';
import Alert, {alertTypes} from '@cdo/apps/componentLibrary/alert/Alert';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import i18n from '@cdo/locale';

import Lab2Registry from '../Lab2Registry';

import moduleStyles from './Lab2Wrapper.module.scss';

export const ProjectBlockedUI: React.FunctionComponent<{
  isProjectValidator: boolean;
}> = ({isProjectValidator}) => {
  const [showAlert, setShowAlert] = useState(true);
  const projectManager = Lab2Registry.getInstance().getProjectManager();
  const shareUrl = projectManager ? projectManager.getShareUrl() : null;
  const isOwner = useAppSelector(state => state.lab.channel?.isOwner || false);

  if (isProjectValidator) {
    return (
      <div
        id="blocked-project-ui-container-project-validator"
        className={moduleStyles.blockedProjectUIContainerProjectValidator}
      >
        {showAlert && (
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
  } else {
    return (
      <div
        id="blocked-project-ui-container"
        className={moduleStyles.blockedProjectUIContainer}
      >
        <AbuseExclamation
          i18n={{
            tos: i18n.tosLong({url: 'http://code.org/tos'}),
            contact_us: i18n.contactUs({
              url: `https://support.code.org/hc/en-us/requests/new?&description=${encodeURIComponent(
                `Abuse error for project at url: ${shareUrl}`
              )}`,
            }),
            edit_project: i18n.editProject(),
            go_to_code_studio: i18n.goToCodeStudio(),
          }}
          isOwner={isOwner}
        />
      </div>
    );
  }
};
