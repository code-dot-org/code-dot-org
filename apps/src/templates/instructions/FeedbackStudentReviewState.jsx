import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import {KeepWorkingBadge} from '@cdo/apps/templates/progress/BubbleBadge';
import {ReviewStates} from '@cdo/apps/templates/types';
import color from '@cdo/apps/util/color';

class FeedbackStudentReviewState extends React.Component {
  static propTypes = {
    latestReviewState: PropTypes.oneOf(Object.keys(ReviewStates)),
    isAwaitingTeacherReview: PropTypes.bool
  };

  renderReviewState(text, includeBage = true, textStyle) {
    return (
      <div style={styles.studentReviewState}>
        {includeBage && <KeepWorkingBadge style={styles.keepWorkingBadge} />}
        <span style={textStyle}>{text}</span>
      </div>
    );
  }

  render() {
    const {latestReviewState, isAwaitingTeacherReview} = this.props;

    if (latestReviewState === ReviewStates.completed) {
      return this.renderReviewState(i18n.reviewedComplete(), false);
    } else if (isAwaitingTeacherReview) {
      return this.renderReviewState(i18n.waitingForTeacherReview());
    } else if (latestReviewState === ReviewStates.keepWorking) {
      return this.renderReviewState(
        i18n.keepWorking(),
        true,
        styles.keepWorking
      );
    } else {
      return null;
    }
  }
}

const styles = {
  studentReviewState: {
    margin: '0 15px',
    display: 'flex',
    alignItems: 'center',
    color: color.dimgray,
    fontSize: 12,
    fontFamily: '"Gotham 5r", sans-serif',
    fontWeight: 'bold'
  },
  keepWorkingBadge: {
    fontSize: 8,
    marginRight: 5
  },
  keepWorking: {
    color: color.red
  }
};

export default FeedbackStudentReviewState;
