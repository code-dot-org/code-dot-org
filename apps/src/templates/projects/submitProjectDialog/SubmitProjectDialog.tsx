import React, {useState} from 'react';

import Button from '@cdo/apps/componentLibrary/button/Button';
import Link from '@cdo/apps/componentLibrary/link/Link';
import {BodyTwoText, Heading3} from '@cdo/apps/componentLibrary/typography';
import AccessibleDialog from '@cdo/apps/sharedComponents/AccessibleDialog';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import i18n from '@cdo/locale';

import {submitProject} from './submitProjectApi';

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
  const channelId = useAppSelector(state => state.lab.channel?.id);
  const projectType = useAppSelector(
    state => state.lab.channel?.projectType
  ) as string;

  const onSubmit = async () => {
    try {
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
      className={moduleStyles.submitProjectDialog}
    >
      <div className={moduleStyles.headerContainer}>
        <Heading3>{i18n.submitProjectGallery_header()}</Heading3>
      </div>
      <hr />
      <div className={moduleStyles.submitProjectTextContainer}>
        <BodyTwoText>{i18n.submitProjectGallery_describeProject()}</BodyTwoText>
        <textarea
          id="submission-input"
          value={projectDescription}
          onChange={e => setProjectDescription(e.target.value)}
        />
        <BodyTwoText>{i18n.submitProjectGallery_details()}</BodyTwoText>
      </div>
      <hr />
      <div className={moduleStyles.bottomSection}>
        <div className={moduleStyles.bottomSectionLink}>
          <Link
            text={i18n.learnMore()}
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
