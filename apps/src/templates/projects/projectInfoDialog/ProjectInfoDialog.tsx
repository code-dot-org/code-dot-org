import React, {useCallback} from 'react';
import {useSelector} from 'react-redux';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import DialogFooter from '@cdo/apps/templates/teacherDashboard/DialogFooter';
import Button from '@cdo/apps/templates/Button';
import {
  ProjectInfoDialogState,
  hideProjectInfoDialog,
} from './projectInfoDialogRedux';
import Typography from '@cdo/apps/componentLibrary/typography/Typography';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import i18n from '@cdo/locale';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';

const ProjectInfoDialog: React.FunctionComponent = () => {
  const dispatch = useAppDispatch();
  const isOpen = useSelector(
    (state: {projectInfoDialog: ProjectInfoDialogState}) =>
      state.projectInfoDialog.isOpen
  );
  const onClose = useCallback(
    () => dispatch(hideProjectInfoDialog()),
    [dispatch]
  );

  return (
    <BaseDialog
      isOpen={isOpen}
      handleClose={onClose}
      useUpdatedStyles
      style={styles.dialog}
    >
      <Typography semanticTag="h2" visualAppearance="heading-lg">
        {i18n.projectInfo()}
      </Typography>
      <p>{i18n.congratsProjectSelected()}</p>
      <p>{i18n.projectFrozenNotice()}</p>
      <SafeMarkdown
        markdown={i18n.requestProjectUnfeatured({
          url: 'https://studio.code.org/projects/public',
        })}
      />
      <DialogFooter>
        <Button
          text={i18n.closeDialog()}
          onClick={onClose}
          color={Button.ButtonColor.gray}
          style={{margin: 0}}
        />
      </DialogFooter>
    </BaseDialog>
  );
};

export default ProjectInfoDialog;

const styles = {
  dialog: {
    padding: 25,
  },
};
