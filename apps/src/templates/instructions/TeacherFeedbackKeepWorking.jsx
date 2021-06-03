import React, {Component} from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import color from '@cdo/apps/util/color';
import ReactTooltip from 'react-tooltip';
import {makeEnum} from '@cdo/apps/utils';

const ReviewStates = makeEnum('completed', 'keepWorking', 'awaitingReview');

// TeacherFeedbackKeepWorking displays a checkbox which can be in one of 3 states:
// 1. Checked - meaning the teacher has requested the student to keep working
// 2. Unchecked - meaning the teacher has not requested the student to keep working, or has removed the previous request
// 3. Indeterminate - meaning the level is awaiting teacher review (the teacher requested
// the student to keep working and the student has made progress since that feedback was given)
// This checkbox is displayed to and controlled by the teacher.
class TeacherFeedbackKeepWorking extends Component {
  static propTypes = {
    latestFeedback: PropTypes.object,
    setReviewState: PropTypes.func,
    setReviewStateChanged: PropTypes.func
  };

  checkbox = null;

  isAwaitingTeacherReview =
    this.props.latestFeedback &&
    this.props.latestFeedback.review_state === ReviewStates.keepWorking &&
    this.props.latestFeedback.student_updated_since_feedback;

  initialReviewState = this.isAwaitingTeacherReview
    ? ReviewStates.awaitingReview
    : this.props.latestFeedback?.review_state || null;

  constructor(props) {
    super(props);

    this.state = {
      reviewState: this.initialReviewState
    };
  }

  componentDidMount() {
    this.setCheckboxState();
  }

  setCheckboxState = () => {
    if (this.state.reviewState === ReviewStates.awaitingReview) {
      this.checkbox.indeterminate = true;
    } else {
      this.checkbox.checked =
        this.state.reviewState === ReviewStates.keepWorking;
    }
  };

  onCheckboxChange = () => {
    const newReviewState = this.getNextReviewState();
    this.setState({reviewState: newReviewState}, this.setCheckboxState);

    this.props.setReviewState(newReviewState);
    this.props.setReviewStateChanged(
      newReviewState !== this.initialReviewState
    );
  };

  getNextReviewState() {
    if (this.state.reviewState === ReviewStates.awaitingReview) {
      return ReviewStates.completed;
    } else if (this.state.reviewState === ReviewStates.keepWorking) {
      return this.initialReviewState ? ReviewStates.completed : null;
    } else {
      return ReviewStates.keepWorking;
    }
  }

  getTooltipText() {
    if (this.initialReviewState === ReviewStates.awaitingReview) {
      return i18n.teacherFeedbackAwaitingReviewTooltip();
    } else {
      return i18n.teacherFeedbackKeepWorkingTooltip();
    }
  }

  render() {
    return (
      <div style={styles.keepWorking}>
        <input
          id="keep-working"
          ref={ref => (this.checkbox = ref)}
          type="checkbox"
          style={styles.checkbox}
          onChange={this.onCheckboxChange}
        />
        <div data-tip data-place="bottom" data-for="keep-working-tooltip">
          <label htmlFor="keep-working" style={styles.label}>
            <span style={styles.keepWorkingText}>{i18n.keepWorking()}</span>
            {this.initialReviewState === ReviewStates.awaitingReview && (
              <span style={styles.awaitingReviewText}>
                &nbsp;-&nbsp;{i18n.awaitingTeacherReview()}
              </span>
            )}
          </label>
          <ReactTooltip id="keep-working-tooltip" role="tooltip" effect="solid">
            <div style={styles.tooltipContent}>{this.getTooltipText()}</div>
          </ReactTooltip>
        </div>
      </div>
    );
  }
}

const styles = {
  keepWorking: {
    display: 'inline-flex',
    margin: '0 20px'
  },
  checkbox: {
    width: '16px',
    height: '16px',
    marginTop: '2px'
  },
  label: {
    fontSize: '13px',
    color: color.charcoal,
    margin: '0 8px'
  },
  keepWorkingText: {
    fontFamily: '"Gotham 5r", sans-serif',
    fontWeight: 'bold'
  },
  awaitingReviewText: {
    fontStyle: 'italic'
  },
  tooltipContent: {
    maxWidth: '250px'
  }
};

export default TeacherFeedbackKeepWorking;
