import React, {useState} from 'react';

import AbuseExclamation from '@cdo/apps/code-studio/components/AbuseExclamation';
import Alert, {alertTypes} from '@cdo/apps/componentLibrary/alert/Alert';
import i18n from '@cdo/locale';

import Lab2Registry from '../Lab2Registry';

import moduleStyles from './Lab2Wrapper.module.scss';

export const ProjectBlockedPage: React.FunctionComponent<{
  isProjectValidator: boolean;
}> = ({isProjectValidator}) => {
  const [showAlert, setShowAlert] = useState(true);
  const projectManager = Lab2Registry.getInstance().getProjectManager();
  const shareUrl = projectManager ? projectManager.getShareUrl() : null;

  if (isProjectValidator) {
    return (
      <div
        id="blocked-project-page-container-pv"
        className={moduleStyles.blockedProjectPageContainerPV}
      >
        {showAlert && (
          <Alert
            text={i18n.tosLong({url: 'http://code.org/tos'})}
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
        id="blocked-project-page-container"
        className={moduleStyles.blockedProjectPageContainer}
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
          isOwner={false}
        />
      </div>
    );
  }
};
