import PropTypes from 'prop-types';
import React, {useState} from 'react';
import Button from './Button';
import i18n from '@cdo/locale';
import BaseDialog from './BaseDialog';
import DialogFooter from './teacherDashboard/DialogFooter';

function EndOfLessonDialog({lessonNumber}) {
  const [isDialogOpen, setIsDialogOpen] = useState(true);

  const handleClose = () => setIsDialogOpen(false);

  return (
    <BaseDialog
      useUpdatedStyles
      isOpen={isDialogOpen}
      handleClose={handleClose}
      style={styles.dialog}
    >
      <h2>{i18n.endOfLessonDialogHeading({lessonNumber})}</h2>
      <div>{i18n.endOfLessonDialogDetails()}</div>
      <DialogFooter>
        <Button
          __useDeprecatedTag
          text={i18n.ok()}
          color={Button.ButtonColor.gray}
          onClick={handleClose}
        />
      </DialogFooter>
    </BaseDialog>
  );
}

EndOfLessonDialog.propTypes = {
  lessonNumber: PropTypes.string.isRequired
};

const styles = {
  dialog: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 20
  },
  instructions: {
    marginTop: 20
  }
};

export default EndOfLessonDialog;
