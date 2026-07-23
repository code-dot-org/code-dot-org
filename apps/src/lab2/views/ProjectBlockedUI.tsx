import Alert, {alertTypes} from '@code-dot-org/component-library/alert';
import React, {useState} from 'react';

import AbuseExclamation from '@cdo/apps/code-studio/components/AbuseExclamation';
import {getLabViewPageAction} from '@cdo/apps/lab2/utils';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import i18n from '@cdo/locale';

import Lab2Registry from '../Lab2Registry';

import moduleStyles from './Lab2Wrapper.module.scss';

export type BlockedType =
  | 'projectAbuse'
  | 'privacyProfanity'
  | 'projectSharingDisabled';

// Shown to the owner (or their teacher) inside the lab when the server's
// share filter blocked the project.
export const PRIVACY_PROFANITY_OWNER_ALERT =
  "This project contains content that can't be shared, such as profanity " +
  "or personal information. Others won't be able to view it until that " +
  'content is removed.';

// Shown to non-owners in place of the blocked project.
export const PRIVACY_PROFANITY_BLOCKED_MESSAGE =
  "This project contains content that can't be shared with others, such " +
  'as profanity or personal information. Please contact the project owner ' +
  'to remove it.';

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
      : blockedType === 'privacyProfanity'
      ? PRIVACY_PROFANITY_OWNER_ALERT
      : i18n.sharingDisabledAlert(); // This will be displayed in /view for project validators if project sharing is disabled for owner.

  const blockedMessage =
    blockedType === 'projectAbuse'
      ? i18n.tosLong({url: 'http://code.org/tos'})
      : blockedType === 'privacyProfanity'
      ? PRIVACY_PROFANITY_BLOCKED_MESSAGE
      : i18n.sharingDisabled({
          sign_in_url: 'https://studio.code.org/users/sign_in',
        });

  const abuseExclamationProps = {
    canViewFlaggedProject,
    isOwner,
    i18n: {
      tos: blockedMessage,
      contact_us: i18n.contactUs({
        url:
          blockedType === 'projectAbuse'
            ? `https://support.code.org/hc/en-us/requests/new?&description=${encodeURIComponent(
                `Abuse error for project at url: ${shareUrl}`
              )}`
            : 'https://support.code.org/hc/en-us/requests/new',
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

  // A share-filtered project stays fully usable for its owner (and their
  // teacher); outside the lab pages there is nothing to overlay. The lab
  // pages get the warning alert below instead.
  if (
    blockedType === 'privacyProfanity' &&
    (isOwner || isTeacherOfProjectOwner) &&
    !['view', 'edit', 'level'].includes(pageAction)
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
