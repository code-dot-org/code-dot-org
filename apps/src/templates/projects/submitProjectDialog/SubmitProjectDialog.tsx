import React, {useCallback, useEffect, useState} from 'react';

import Button from '@cdo/apps/componentLibrary/button/Button';
import Link from '@cdo/apps/componentLibrary/link/Link';
import {BodyTwoText, Heading3} from '@cdo/apps/componentLibrary/typography';
import AccessibleDialog from '@cdo/apps/sharedComponents/AccessibleDialog';
import {submitProject} from '@cdo/apps/templates/projects/submitProjectDialog/submitProjectApi';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import i18n from '@cdo/locale';

import moduleStyles from './submit-project-dialog.module.scss';

/**
 * Renders a modal that allows a user to submit a project to be considered for the
 * featured project gallery.
 */

export interface SubmitProjectDialogProps {
  onClose: () => void;
  onGoBack: () => void;
}

const SubmitProjectDialog: React.FunctionComponent<
  SubmitProjectDialogProps
> = ({onClose, onGoBack}) => {
  const [projectDescription, setProjectDescription] = useState<string>('');
  const [isSubmitButtonDisabled, setIsSubmitButtonDisabled] =
    useState<boolean>(true);
  const projectType = useAppSelector(state => state.lab.channel?.projectType);
  const channelId = useAppSelector(state => state.lab.channel?.id);

  useEffect(() => {
    setIsSubmitButtonDisabled(!projectDescription.trim());
  }, [projectDescription]);

  const onSubmit = useCallback(async () => {
    if (channelId && projectType) {
      setIsSubmitButtonDisabled(true);
      try {
        await submitProject(channelId, projectType, projectDescription);
        // Close submit project dialog and display the share dialog.
        onGoBack();
      } catch (err) {
        console.error(err);
        // TODO: UI to notify user that submission was not successful.
      }
    }
  }, [channelId, onGoBack, projectDescription, projectType]);

  return (
    <AccessibleDialog
      onClose={onClose}
      className={moduleStyles.submitProjectDialog}
      // Set onDeactivate to null so that onClose is not called on when the focus trap is
      // deactivated. When the 'Go back' button is clicked and the submit project dialog
      // is closed, we do not want onClose callback function to be executed. We only want the
      // goBack function to be executed.
      onDeactivate={null}
    >
      <div className={moduleStyles.headerContainer}>
        <Heading3 className={moduleStyles.heading3}>
          {i18n.submitProjectGallery_header()}
        </Heading3>
      </div>
      <hr />
      <div className={moduleStyles.submitProjectTextContainer}>
        <BodyTwoText className={moduleStyles.bodyTwoText}>
          {i18n.submitProjectGallery_describeProject()}
        </BodyTwoText>
        <textarea
          id="submission-input"
          value={projectDescription}
          onChange={e => setProjectDescription(e.target.value)}
          placeholder={i18n.submitProjectGallery_placeholder()}
          maxLength={150}
        />
        <BodyTwoText className={moduleStyles.bodyTwoText}>
          {i18n.submitProjectGallery_details()}
        </BodyTwoText>
      </div>
      <hr />
      <div className={moduleStyles.bottomSection}>
        <div className={moduleStyles.bottomSectionLink}>
          <Link
            text={i18n.learnMore()}
            href="https://support.code.org/hc/en-us/articles/24931009674893--Featured-Project-Gallery"
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
            text={i18n.submitProjectGallery_goBack()}
          />
          <Button
            onClick={onSubmit}
            type="primary"
            color="white"
            text={i18n.submit()}
            disabled={isSubmitButtonDisabled}
          />
        </div>
      </div>
    </AccessibleDialog>
  );
};
export default SubmitProjectDialog;
