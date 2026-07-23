import Alert, {alertTypes} from '@code-dot-org/component-library/alert';
import React, {useState} from 'react';

import AbuseExclamation from '@cdo/apps/code-studio/components/AbuseExclamation';
import {getLabViewPageAction} from '@cdo/apps/lab2/utils';
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
  const isTeacherOfProjectOwner = useAppSelector(
    state => state.lab.isTeacherOfProjectOwner
  );
  const canViewFlaggedProject = isTeacherOfProjectOwner || isProjectValidator;
  const pageAction = getLabViewPageAction() || '';
  const hasViewOrEditAccess =
    isProjectValidator || isOwner || isTeacherOfProjectOwner;

  const alertText =
    blockedType === 'projectAbuse'
      ? i18n.tosWithoutLink()
      : i18n.sharingDisabledAlert(); // This will be displayed in /view for project validators if project sharing is disabled for owner.

  const abuseExclamationProps = {
    canViewFlaggedProject,
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
            view_project: i18n.viewProject(),
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
            view_project: i18n.viewProject(),
            go_to_code_studio: i18n.goToCodeStudio(),
          },
  };

  // If sharing is disabled and user is project owner or project owner's teacher, no need to render any project blocked UI.
  if (
    blockedType === 'projectSharingDisabled' &&
    (isOwner || isTeacherOfProjectOwner)
  ) {
    return null;
  }

  // If page action is view/edit/level, project is flagged for abuse, and user has view or edit access,
  // render workspace alert with warning about flagged project.
  if (['view', 'edit', 'level'].includes(pageAction) && hasViewOrEditAccess) {
    return (
      <div
        id="blocked-project-ui-container-project-validator"
        className={moduleStyles.blockedProjectUIContainerProjectValidator}
      >
        {showAlert && (
          <Alert
            text={alertText}
            type={alertTypes.danger}
            onClose={() => {
              setShowAlert(false);
            }}
          />
        )}
      </div>
    );
  }
  /* Excluding two cases above, render blocked UI.
      - If in project edit/view mode and user is without view/edit access, render blocked UI.
          (Note that only the user and user's teacher can access a user's activity level.)
      - In share mode (excluding when project sharing is disabled and user is owner or owner's teacher),
          render blocked UI which includes customized link depending on user's role.
  */
  return (
    <div
      id="blocked-project-ui-container"
      className={moduleStyles.blockedProjectUIContainer}
    >
      <AbuseExclamation {...abuseExclamationProps} />
    </div>
  );
};
