import Alert, {alertTypes} from '@code-dot-org/component-library/alert';
import Modal from '@code-dot-org/component-library/modal';
import {Typography} from '@mui/material';
import React from 'react';

import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import i18n from '@cdo/locale';

import moduleStyles from './onboarding-modal.module.scss';

/**
 * Renders a modal that warns the user to chat responsibly with AI.
 */

export interface TeacherOnboardingModalProps {
  onClose: () => void;
}

const TeacherOnboardingModal: React.FunctionComponent<
  TeacherOnboardingModalProps
> = ({onClose}) => (
  <Modal
    className={moduleStyles.teacherOnboardingModal}
    title="Welcome to AI Chat Lab"
    onClose={onClose}
    closeLabel={i18n.closeDialog()}
    customContent={
      <div
        id="dsco-dialog-description"
        className={moduleStyles.onboardingContent}
      >
        <Alert
          type={alertTypes.danger}
          showIcon={false}
          isImmediateImportance={false}
          text={
            "While Code.org's content moderation policy reviews both student customizations and chat messages, violations will be flagged accordingly. However, because this is a generative AI tool, we cannot fully predict or guarantee that the chatbot's output will always be free from disruption."
          }
        />
        <div className={moduleStyles.textContainer}>
          <Typography
            className={moduleStyles.sectionHeading}
            variant="body1"
            gutterBottom
          >
            AI Chat Components
          </Typography>
          <ul className={moduleStyles.componentsList}>
            <li>
              <Typography variant="body2" gutterBottom>
                <SafeMarkdown markdown="**Instructions**: Clear directions and goals for each level." />
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <SafeMarkdown markdown="**Model Customizations** *(optional)*:  Clear directions and goals for each level." />
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <SafeMarkdown markdown="**AI Chat**: The area where students can interact directly with the chatbot they've created." />
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <SafeMarkdown markdown="**User View** *(optional)*: Allows students to use the chatbot as a user, without the instructions or customization visible." />
              </Typography>
            </li>
          </ul>
          <Typography variant="body2" gutterBottom>
            {
              "As a teacher, you have access to all of your students' chat customizations and history (retained for 90 days)."
            }
          </Typography>
        </div>
      </div>
    }
    primaryButtonProps={{
      children: 'Ok',
      onClick: onClose,
    }}
    secondaryButtonProps={{
      children: i18n.learnMore(),
      href: 'https://support.code.org/hc/en-us/articles/30681531276045-Viewing-Student-AI-Chat-History-as-a-Teacher',
      target: '_blank',
      rel: 'noopener noreferrer',
    }}
  />
);

export default TeacherOnboardingModal;
