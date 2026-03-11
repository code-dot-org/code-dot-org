import Link from '@code-dot-org/component-library/link';
import {Typography, Button as MuiButton} from '@mui/material';
import React from 'react';

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
        <Typography variant="h3" gutterBottom>
          {aichatI18n.welcomeToAichatLab()}
        </Typography>
      </div>
      <hr />
      <div className={moduleStyles.contentContainer}>
        <div className={moduleStyles.warning}>
          <Typography variant="body2" gutterBottom>
            {aichatI18n.teacherOnboardingModal_warning()}
          </Typography>
        </div>
        <div className={moduleStyles.textContainer}>
          <Typography variant="body1" gutterBottom>
            {aichatI18n.chatComponentsHeader()}
          </Typography>
          <ul>
            <li>
              <Typography variant="body2" gutterBottom>
                <SafeMarkdown
                  markdown={aichatI18n.teacherOnboardingModal_instructionsBullet()}
                />
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <SafeMarkdown
                  markdown={aichatI18n.teacherOnboardingModal_modelCustomizationBullet()}
                />
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <SafeMarkdown
                  markdown={aichatI18n.teacherOnboardingModal_aiChatBullet()}
                />
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <SafeMarkdown
                  markdown={aichatI18n.teacherOnboardingModal_userViewBullet()}
                />
              </Typography>
            </li>
          </ul>
          <Typography variant="body2" gutterBottom>
            {aichatI18n.teacherOnboardingModal_chatHistoryAccess()}
            <Link href="https://support.code.org/hc/en-us/articles/30681531276045-Viewing-Student-AI-Chat-History-as-a-Teacher">
              {aichatI18n.learnMoreHereInBrackets()}
            </Link>
          </Typography>
        </div>
      </div>
      <hr />
      <div className={moduleStyles.bottomSection}>
        <MuiButton
          variant="contained"
          color="primary"
          size="medium"
          onClick={onClose}
          type="button"
        >
          {i18n.aiWarningModalOk()}
        </MuiButton>
      </div>
    </AccessibleDialog>
  );
};
export default TeacherOnboardingModal;
