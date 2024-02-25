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
// import i18n from '@cdo/locale';

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
      <h3>Project Info</h3>
      <p>
        Congratulations! This project was selected to be a featured project or
        an exemplar project!
      </p>
      <DialogFooter>
        <Button
          text={'Close'}
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
    paddingLeft: 25,
    paddingRight: 25,
    paddingBottom: 25,
    paddingTop: 25,
  },
};
