import React, {useState} from 'react';

import Button, {buttonColors} from '@cdo/apps/componentLibrary/button/Button';
import {
  BodyTwoText,
  Heading3,
  StrongText,
} from '@cdo/apps/componentLibrary/typography';
import AccessibleDialog from '@cdo/apps/sharedComponents/AccessibleDialog';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {submitProject} from './submitProjectApi';

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
  const channelId = useAppSelector(state => state.lab.channel?.id);
  const projectType = useAppSelector(
    state => state.lab.channel?.projectType
  ) as string;
  console.log('channelId projectType', channelId, projectType);

  const onSubmit = async () => {
    try {
      console.log('onsubmit');
      if (channelId && projectType) {
        submitProject(projectDescription);
      }
    } catch (error) {
      console.error('Publish failed', error);
    }
  };

  return (
    <AccessibleDialog
      onClose={onClose}
      className={moduleStyles.submitProjectModal}
    >
      <div className={moduleStyles.headerContainer}>
        <Heading3>Submit to be featured</Heading3>
      </div>
      <hr />
      <div className={moduleStyles.submitProjectTextContainer}>
        <BodyTwoText>
          <StrongText>
            You can submit your project to be considered for our Featured
            Projects gallery. If you're interested, please describe the project:
          </StrongText>
        </BodyTwoText>
        <textarea
          id="submission-input"
          value={projectDescription}
          onChange={e => setProjectDescription(e.target.value)}
        />
        <BodyTwoText>
          Submitting your project does not guarantee that it will be featured. A
          project can only be submitted once.
        </BodyTwoText>
      </div>
      <hr />
      <div className={moduleStyles.bottomSection}>
        <Button onClick={onSubmit} color={buttonColors.purple} text="Submit" />
      </div>
    </AccessibleDialog>
  );
};
export default SubmitProjectModal;
