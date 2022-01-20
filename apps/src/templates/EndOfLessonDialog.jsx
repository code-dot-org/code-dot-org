import $ from 'jquery';
import PropTypes from 'prop-types';
import React, {useState} from 'react';
import {connect} from 'react-redux';
import Button from './Button';
import i18n from '@cdo/locale';
import BaseDialog from './BaseDialog';
import DialogFooter from './teacherDashboard/DialogFooter';

function EndOfLessonDialog({lessonNumber, isSummaryView}) {
  const [isDialogOpen, setIsDialogOpen] = useState(true);

  const handleClose = () => {
    scrollToCompletedLesson();
    setIsDialogOpen(false);
  };

  const scrollToCompletedLesson = () => {
    const completedLessonElementId = isSummaryView
      ? `#summary-progress-row-${lessonNumber}`
      : `#progress-lesson-${lessonNumber}`;

    $(completedLessonElementId)[0].scrollIntoView();
  };

  return (
    <BaseDialog
      useUpdatedStyles
      isOpen={isDialogOpen}
      handleClose={handleClose}
      style={styles.dialog}
    >
      <h2>{i18n.endOfLessonDialogHeading({lessonNumber})}</h2>
      <div>{i18n.endOfLessonDialogDetails()}</div>
      <DialogFooter rightAlign={true}>
        <Button
          __useDeprecatedTag
          text={i18n.ok()}
          color={Button.ButtonColor.orange}
          onClick={handleClose}
        />
      </DialogFooter>
    </BaseDialog>
  );
}

EndOfLessonDialog.propTypes = {
  lessonNumber: PropTypes.string.isRequired,
  isSummaryView: PropTypes.bool.isRequired
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

export default connect(state => ({
  isSummaryView: state.progress.isSummaryView
}))(EndOfLessonDialog);
