import React, {useCallback, useState} from 'react';

import {showShareDialog} from '@cdo/apps/code-studio/components/shareDialogRedux';
import Button, {buttonColors} from '@cdo/apps/componentLibrary/button/Button';
import {
  BodyTwoText,
  Heading3,
  StrongText,
} from '@cdo/apps/componentLibrary/typography';
import AccessibleDialog from '@cdo/apps/sharedComponents/AccessibleDialog';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {submitProject} from './submitProjectApi';
import {
  setShowSubmitProjectDialog,
  fetchSubmissionStatus,
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
  const dispatch = useAppDispatch();
  dispatch(fetchSubmissionStatus());

  const onSubmit = async () => {
    try {
      if (channelId && projectType) {
        submitProject(projectDescription);
      }
    } catch (error) {
      console.error('Publish failed', error);
    }
  };

  const onGoBack = useCallback(() => {
    dispatch(setShowSubmitProjectDialog(false));
    dispatch(showShareDialog());
  }, [dispatch]);

  return (
    <AccessibleDialog
      onClose={onClose}
      className={moduleStyles.submitProjectDialog}
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
        <Button onClick={onGoBack} color={buttonColors.white} text="Go back" />
        <Button onClick={onSubmit} type="tertiary" text="Submit" />
      </div>
    </AccessibleDialog>
  );
};
export default SubmitProjectDialog;
