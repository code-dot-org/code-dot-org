import React, {useState} from 'react';

import Alert, {alertTypes} from '@code-dot-org/component-library/alert';
import Markdown from '@code-dot-org/markdown';

import LabRegistry from '@lab-base/LabRegistry';
import {useAppSelector} from '@lab-base/redux/store';

import moduleStyles from './projectBlockedUI.module.scss';

type BlockedType = 'projectAbuse' | 'projectSharingDisabled';

export interface ProjectBlockedUIProps {
  blockedType: BlockedType;
  isProjectValidator: boolean;
}

const ProjectBlockedUI: React.FunctionComponent<ProjectBlockedUIProps> = ({blockedType, isProjectValidator}) => {
  const [showAlert, setShowAlert] = useState(true);
  const projectManager = LabRegistry.projectManager;
  const shareUrl = projectManager ? projectManager.getShareUrl() : null;
  const isOwner = useAppSelector(state => state.lab.channel?.isOwner || false);
  const abuseExclamationProps = {
    isOwner,
    i18n:
      blockedType === 'projectAbuse'
        ? {
            tos: "This project has been reported for violating Code.org's [Terms of Service](http://code.org/tos) and cannot be shared with others.",
            contact_us: `If you believe this to be an error, please [contact us](https://support.code.org/hc/en-us/requests/new?&description=${encodeURIComponent(
                `Abuse error for project at url: ${shareUrl}`
              )}).`,
            edit_project: "Edit Project",
            go_to_code_studio: "Go to Code Studio",
          }
        : {
            tos: "Sorry, this project is not available for sharing. If this is your project or the project of one of your students, please [sign in](https://studio.code.org/users/sign_in) to your account to view the project.",
            contact_us: 'If you believe this to be an error, please [contact us](https://support.code.org/hc/en-us/requests/new).',
            edit_project: "Edit Project",
            go_to_code_studio: "Go to Code Studio",
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
            text="This project has been reported for violating Code.org's Terms of Service and cannot be shared with others."
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
      {showAlert && (
        <Alert
          text={
            <Markdown>{abuseExclamationProps.i18n.tos + '\n\n' + abuseExclamationProps.i18n.contact_us}</Markdown>
          }
          type={alertTypes.danger}
          onClose={() => setShowAlert(false)}
        />
      )}
    </div>
  );
};

export default ProjectBlockedUI;
