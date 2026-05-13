import Link from '@code-dot-org/component-library/link';
import {Typography, Button as MuiButton} from '@mui/material';
import React from 'react';

import AccessibleDialog from '@cdo/apps/sharedComponents/AccessibleDialog';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';

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
          {'Welcome to AI Chat Lab'}
        </Typography>
      </div>
      <hr />
      <div className={moduleStyles.contentContainer}>
        <div className={moduleStyles.warning}>
          <Typography variant="body2" gutterBottom>
            {
              "While Code.org's content moderation policy reviews both student customizations and chat messages, violations will be flagged accordingly. However, because this is a generative AI tool, we cannot fully predict or guarantee that the chatbot's output will always be free from disruption."
            }
          </Typography>
        </div>
        <div className={moduleStyles.textContainer}>
          <Typography variant="body1" gutterBottom>
            {'AI Chat Components'}
          </Typography>
          <ul>
            <li>
              <Typography variant="body2" gutterBottom>
                <SafeMarkdown
                  markdown={
                    '**Instructions**: Clear directions and goals for each level.'
                  }
                />
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <SafeMarkdown
                  markdown={
                    '**Model Customizations** *(optional)*:  Clear directions and goals for each level.'
                  }
                />
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <SafeMarkdown
                  markdown={
                    "**AI Chat**: The area where students can interact directly with the chatbot they've created."
                  }
                />
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <SafeMarkdown
                  markdown={
                    '**User View** *(optional)*: Allows students to use the chatbot as a user, without the instructions or customization visible.'
                  }
                />
              </Typography>
            </li>
          </ul>
          <Typography variant="body2" gutterBottom>
            {
              "As a teacher, you have access to all of your students' chat customizations and history (retained for 90 days). "
            }
            <Link href="https://support.code.org/hc/en-us/articles/30681531276045-Viewing-Student-AI-Chat-History-as-a-Teacher">
              {'[Learn more here.]'}
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
          {'Ok'}
        </MuiButton>
      </div>
    </AccessibleDialog>
  );
};
export default TeacherOnboardingModal;
