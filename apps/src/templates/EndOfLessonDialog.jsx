import Modal from '@code-dot-org/component-library/modal';
import PropTypes from 'prop-types';
import React, {useState} from 'react';
import {connect} from 'react-redux';

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

  if (!isDialogOpen) {
    return null;
  }

  return (
    <Modal
      className="uitest-end-of-lesson-header"
      onClose={handleClose}
      title={i18n.endOfLessonDialogHeading({lessonNumber})}
      description={i18n.endOfLessonDialogDetails()}
      primaryButtonProps={{
        onClick: handleClose,
        children: i18n.ok(),
        size: 'medium',
        color: 'primary',
        variant: 'contained',
      }}
    />
  );
}

EndOfLessonDialog.propTypes = {
  lessonNumber: PropTypes.string.isRequired,
  isSummaryView: PropTypes.bool.isRequired,
};

export const UnconnectedEndOfLessonDialog = EndOfLessonDialog;

export default connect(state => ({
  isSummaryView: state.progress.isSummaryView,
}))(EndOfLessonDialog);
