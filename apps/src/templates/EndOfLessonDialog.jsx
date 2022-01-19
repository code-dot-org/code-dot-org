import PropTypes from 'prop-types';
import React, {useState} from 'react';
import Button from './Button';
import i18n from '@cdo/locale';
import BaseDialog from './BaseDialog';
import DialogFooter from './teacherDashboard/DialogFooter';

function EndOfLessonDialog(props) {
  const [isDialogOpen, setIsDialogOpen] = useState(props.isDialogOpen);

  return (
    <BaseDialog useUpdatedStyles isOpen={isDialogOpen} style={styles.dialog}>
      <h2>
        {i18n.endOfLessonDialogHeading({lessonNumber: props.lessonNumber})}
      </h2>
      <div>{i18n.endOfLessonDialogDetails()}</div>
      <DialogFooter>
        <Button
          __useDeprecatedTag
          text={i18n.ok()}
          color={Button.ButtonColor.gray}
          onClick={() => setIsDialogOpen(false)}
        />
      </DialogFooter>
    </BaseDialog>
  );
}

EndOfLessonDialog.propTypes = {
  isDialogOpen: PropTypes.bool.isRequired,
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
