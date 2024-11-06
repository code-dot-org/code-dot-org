import React, {useState} from 'react';

import Button from '@cdo/apps/componentLibrary/button/Button';
import Link from '@cdo/apps/componentLibrary/link/Link';
import {BodyTwoText, Heading3} from '@cdo/apps/componentLibrary/typography';
import AccessibleDialog from '@cdo/apps/sharedComponents/AccessibleDialog';
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

  const onSubmit = async () => {
    // TODO: call on submitProject once it's implemented in SubmitProjectApi.
    console.log('submit project');
  };

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
            // TODO: Add link once it's available.
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
            text={i18n.submitProjectGallery_goBack()}
          />
          <Button
            onClick={onSubmit}
            type="primary"
            color="white"
            text={i18n.submit()}
            disabled={!projectDescription.trim()}
          />
        </div>
      </div>
    </AccessibleDialog>
  );
};
export default SubmitProjectDialog;
