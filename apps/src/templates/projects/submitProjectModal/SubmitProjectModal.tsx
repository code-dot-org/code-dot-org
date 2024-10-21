import React, {useState} from 'react';

import Button, {buttonColors} from '@cdo/apps/componentLibrary/button/Button';
import {
  BodyTwoText,
  Heading3,
  StrongText,
} from '@cdo/apps/componentLibrary/typography';
import AccessibleDialog from '@cdo/apps/sharedComponents/AccessibleDialog';

import moduleStyles from './submit-project-modal.module.scss';

/**
 * Renders a modal that warns the user to chat responsibly with AI.
 */

export interface SubmitProjectModalProps {
  onClose: () => void;
}

const SubmitProjectModal: React.FunctionComponent<SubmitProjectModalProps> = ({
  onClose,
}) => {
  const [projectDescription, setProjectDescription] = useState<string>('');
  return (
    <AccessibleDialog
      onClose={onClose}
      className={moduleStyles.submitProjectModal}
    >
      <div className={moduleStyles.headerContainer}>
        <Heading3>Want to show the world what you made?</Heading3>
      </div>
      <hr />
      <div className={moduleStyles.submitProjectTextContainer}>
        <BodyTwoText>
          <StrongText>
            Tell us about your project! (150 character max)
          </StrongText>
        </BodyTwoText>
        <textarea
          id="submission-input"
          value={projectDescription}
          onChange={e => setProjectDescription(e.target.value)}
        />
        <BodyTwoText>
          *Submitting a project does not guarantee that it will be featured and
          once submitted, this project cannot be submitted again.
        </BodyTwoText>
      </div>
      <hr />
      <div className={moduleStyles.bottomSection}>
        <Button onClick={onClose} color={buttonColors.purple} text="Submit" />
      </div>
    </AccessibleDialog>
  );
};
export default SubmitProjectModal;
