import React, {useCallback, useEffect, useState} from 'react';

import {showShareDialog} from '@cdo/apps/code-studio/components/shareDialogRedux';
import Button from '@cdo/apps/componentLibrary/button/Button';
import Link from '@cdo/apps/componentLibrary/link/Link';
import {BodyTwoText, Heading3} from '@cdo/apps/componentLibrary/typography';
import AccessibleDialog from '@cdo/apps/sharedComponents/AccessibleDialog';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {submitProject} from './submitProjectApi';
import {setShowSubmitProjectDialog} from './submitProjectRedux';

import moduleStyles from './submit-project-dialog.module.scss';

/**
 * Renders a modal that allows a user to submit a project to be considered for the
 * featured project gallery.
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
          If you'd like your project to appear in our Featured Projects gallery,
          please describe the project:
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
        <div className={moduleStyles.bottomSectionLink}>
          <Link
            text="Learn more"
            href=""
            className={moduleStyles.link}
            size="m"
          />
        </div>
        <div className={moduleStyles.bottomSectionButtons}>
          <Button
            iconLeft={{iconName: 'arrow-left'}}
            onClick={onGoBack}
            type="secondary"
            color="white"
            text="Go back"
          />
          <Button
            onClick={onSubmit}
            type="primary"
            color="white"
            text="Submit"
            disabled={!projectDescription.trim()}
          />
        </div>
      </div>
    </AccessibleDialog>
  );
};
export default SubmitProjectDialog;
