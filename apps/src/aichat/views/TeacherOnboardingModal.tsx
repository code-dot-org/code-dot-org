import React from 'react';

import Button, {buttonColors} from '@cdo/apps/componentLibrary/button/Button';
import Link from '@cdo/apps/componentLibrary/link/Link';
import {
  BodyOneText,
  BodyTwoText,
  Heading3,
} from '@cdo/apps/componentLibrary/typography';
import AccessibleDialog from '@cdo/apps/sharedComponents/AccessibleDialog';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import i18n from '@cdo/locale';

import aichatI18n from '../locale';

import moduleStyles from './onboarding-modal.module.scss';

/**
 * Renders a modal that warns the user to chat responsibly with AI.
 */

export interface TeacherOnboardingModalProps {
  onClose: () => void;
}

const TeacherOnboardingModal: React.FunctionComponent<
  TeacherOnboardingModalProps
> = ({onClose}) => {
  return (
    <AccessibleDialog
      onClose={onClose}
      className={moduleStyles.teacherOnboardingModal}
    >
      <div className={moduleStyles.headerContainer}>
        <Heading3>{aichatI18n.welcomeToAichatLab()}</Heading3>
      </div>
      <hr />
      <div className={moduleStyles.contentContainer}>
        <div className={moduleStyles.warning}>
          <BodyTwoText>
            {aichatI18n.teacherOnboardingModal_warning()}
          </BodyTwoText>
        </div>
        <div className={moduleStyles.textContainer}>
          <BodyOneText>{aichatI18n.chatComponentsHeader()}</BodyOneText>
          <ul>
            <li>
              <SafeMarkdown markdown={aichatI18n.instructionsDescription()} />
            </li>
            <li>
              <SafeMarkdown
                markdown={aichatI18n.modelCustomizationsDescription()}
              />
            </li>
            <li>
              <SafeMarkdown
                markdown={aichatI18n.aichatWorkspaceDescription()}
              />
            </li>
            <li>
              <SafeMarkdown markdown={aichatI18n.userViewDescription()} />
            </li>
          </ul>
          <BodyTwoText>
            {aichatI18n.teacherOnboardingModal_chatHistoryAccess()}
            <Link href="https://support.code.org/hc/en-us/articles/30681531276045-Viewing-Student-AI-Chat-History-as-a-Teacher">
              {aichatI18n.learnMoreHereInBrackets()}
            </Link>
          </BodyTwoText>
        </div>
      </div>
      <hr />
      <div className={moduleStyles.bottomSection}>
        <Button
          onClick={onClose}
          color={buttonColors.purple}
          text={i18n.aiWarningModalOk()}
        />
      </div>
    </AccessibleDialog>
  );
};
export default TeacherOnboardingModal;
