import React, {useState} from 'react';

import Button, {buttonColors} from '@cdo/apps/componentLibrary/button/Button';
import {
  BodyTwoText,
  Heading3,
  StrongText,
} from '@cdo/apps/componentLibrary/typography';
import AccessibleDialog from '@cdo/apps/sharedComponents/AccessibleDialog';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {submitProject, getSubmissionStatus} from './submitProjectApi';
import {
  setShowShareDialog,
  setShowSubmitProjectDialog,
} from './submitProjectRedux';

import moduleStyles from './submit-project-dialog.module.scss';

/**
 * Renders a modal that warns the user to chat responsibly with AI.
 */

export interface SubmitProjectDialogProps {
  onClose: () => void;
}

const SubmitProjectDialog: React.FunctionComponent<
  SubmitProjectDialogProps
> = ({onClose}) => {
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
        const status = getSubmissionStatus();
        console.log('status', status);
      }
    } catch (error) {
      console.error('Publish failed', error);
    }
  };

  const onGoBack = async () => {
    try {
      console.log('on go back');
      setShowSubmitProjectDialog(false);
      setShowShareDialog(true);
    } catch (error) {
      console.error('Publish failed', error);
    }
  };

  return (
    <AccessibleDialog
      onClose={onClose}
      className={moduleStyles.submitProjectdialog}
    >
      <div className={moduleStyles.headerContainer}>
        <Heading3>Submit to be featured</Heading3>
      </div>
      <hr />
      <div className={moduleStyles.submitProjectTextContainer}>
        <BodyTwoText>
          <StrongText>
            If you'd like your project to appear in our Featured Projects
            gallery, please describe the project:
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
        <Button onClick={onGoBack} color={buttonColors.white} text="Go back" />
      </div>
    </AccessibleDialog>
  );
};
export default SubmitProjectDialog;
