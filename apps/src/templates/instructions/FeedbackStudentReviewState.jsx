import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import {KeepWorkingBadge} from '@cdo/apps/templates/progress/BubbleBadge';
import {ReviewStates} from '@cdo/apps/templates/types';
import color from '@cdo/apps/util/color';

class FeedbackStudentReviewState extends React.Component {
  static propTypes = {
    latestReviewState: PropTypes.oneOf(ReviewStates),
    isAwaitingTeacherReview: PropTypes.bool
  };

  renderCompleted() {
    return (
      <div style={styles.studentReviewState}>{i18n.reviewedComplete()}</div>
    );
  }

  renderKeepWorking() {
    return (
      <div style={styles.studentReviewState}>
        <KeepWorkingBadge style={styles.keepWorkingBadge} />
        <span style={styles.keepWorking}>{i18n.keepWorking()}</span>
      </div>
    );
  }

  renderAwaitingReview() {
    return (
      <div style={styles.studentReviewState}>
        <KeepWorkingBadge style={styles.keepWorkingBadge} />
        <span>{i18n.waitingForTeacherReview()}</span>
      </div>
    );
  }

  render() {
    const {latestReviewState, isAwaitingTeacherReview} = this.props;

    if (latestReviewState === ReviewStates.completed) {
      return this.renderCompleted();
    } else if (isAwaitingTeacherReview) {
      return this.renderAwaitingReview();
    } else if (latestReviewState === ReviewStates.keepWorking) {
      return this.renderKeepWorking();
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
