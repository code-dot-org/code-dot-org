import React from 'react';

import Button, {buttonColors} from '@cdo/apps/componentLibrary/button/Button';
import Link from '@cdo/apps/componentLibrary/link/Link';
import {
  BodyOneText,
  BodyTwoText,
  EmText,
  Heading3,
  StrongText,
} from '@cdo/apps/componentLibrary/typography';
import AccessibleDialog from '@cdo/apps/sharedComponents/AccessibleDialog';
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
> = ({onClose}) => {
  return (
    <AccessibleDialog
      onClose={onClose}
      className={moduleStyles.teacherOnboardingModal}
    >
      <div className={moduleStyles.headerContainer}>
        <Heading3>Welcome to AI Chat Lab</Heading3>
      </div>
      <hr />
      <div className={moduleStyles.contentContainer}>
        <div className={moduleStyles.warning}>
          <BodyTwoText>
            While Code.org's content moderation policy reviews both student
            customizations and chat messages, violations will be flagged
            accordingly. However, because this is a generative AI tool, we
            cannot fully predict or guarantee that the chatbot's output will
            always be free from disruption.
          </BodyTwoText>
        </div>
        <div className={moduleStyles.textContainer}>
          <BodyOneText>AI Chat Components</BodyOneText>
          <ul>
            <li>
              <BodyTwoText>
                <StrongText>Instructions</StrongText>: Clear directions and
                goals for each level.
              </BodyTwoText>
            </li>
            <li>
              <BodyTwoText>
                <StrongText>Model Customizations </StrongText>
                <EmText>(optional)</EmText>: Clear directions and goals for each
                level.
              </BodyTwoText>
            </li>
            <li>
              <BodyTwoText>
                <StrongText>AI Chat</StrongText>: The area where students can
                interact directly with the chatbot they've created.
              </BodyTwoText>
            </li>
            <li>
              <BodyTwoText>
                <StrongText>User View </StrongText>
                <EmText>(optional)</EmText>: Allows students to use their
                chatbot as a user, without the instructions or customization
                visible.
              </BodyTwoText>
            </li>
          </ul>
          <BodyTwoText>
            As a teacher, you have access to all of your students' chat history
            and customizations. <Link href="">[Learn more here]</Link>.
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
