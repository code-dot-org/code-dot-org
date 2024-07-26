import PropTypes from 'prop-types';
import React, {useState} from 'react';
import {connect} from 'react-redux';

import Button from '@cdo/apps/legacySharedComponents/Button';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import DialogFooter from '@cdo/apps/templates/teacherDashboard/DialogFooter';
import i18n from '@cdo/locale';

function EndOfLessonDialog({lessonNumber, isSummaryView}) {
  const [isDialogOpen, setIsDialogOpen] = useState(true);

  const handleClose = () => {
    scrollToCompletedLesson();
    setIsDialogOpen(false);
  };

  const scrollToCompletedLesson = () => {
    const completedLessonElementId = isSummaryView
      ? `summary-progress-row-${lessonNumber}`
      : `progress-lesson-${lessonNumber}`;

    document.getElementById(completedLessonElementId)?.scrollIntoView();
  };

  return (
    <BaseDialog
      useUpdatedStyles
      isOpen={isDialogOpen}
      handleClose={handleClose}
      style={styles.dialog}
    >
      <h2 className="uitest-end-of-lesson-header">
        {i18n.endOfLessonDialogHeading({lessonNumber})}
      </h2>
      <div>{i18n.endOfLessonDialogDetails()}</div>
      <DialogFooter rightAlign={true}>
        <Button
          __useDeprecatedTag
          text={i18n.ok()}
          color={Button.ButtonColor.brandSecondaryDefault}
          onClick={handleClose}
        />
      </DialogFooter>
    </BaseDialog>
  );
}

EndOfLessonDialog.propTypes = {
  lessonNumber: PropTypes.string.isRequired,
  isSummaryView: PropTypes.bool.isRequired,
};

const styles = {
  dialog: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 20,
  },
  instructions: {
    marginTop: 20,
  },
};

export const UnconnectedEndOfLessonDialog = EndOfLessonDialog;

export default connect(state => ({
  isSummaryView: state.progress.isSummaryView,
}))(EndOfLessonDialog);
