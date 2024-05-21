import PropTypes from 'prop-types';
import React, {Component} from 'react';
import ReactTooltip from 'react-tooltip';

import fontConstants from '@cdo/apps/fontConstants';
import {ReviewStates} from '@cdo/apps/templates/feedback/types';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';

// EditableReviewState displays a checkbox which can be in one of 3 states:
// 1. Checked - meaning the teacher has requested the student to keep working
// 2. Unchecked - meaning the teacher has not requested the student to keep working, or has removed the previous request
// 3. Indeterminate - meaning the level is awaiting teacher review (the teacher requested
// the student to keep working and the student has made progress since that feedback was given)
// This checkbox is displayed to and controlled by the teacher.
class EditableReviewState extends Component {
  static propTypes = {
    latestReviewState: PropTypes.oneOf(Object.keys(ReviewStates)),
    onReviewStateChange: PropTypes.func,
  };

  checkbox = null;

  constructor(props) {
    super(props);

    this.state = {
      reviewState: props.latestReviewState,
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
    this.props.onReviewStateChange(newReviewState);
  };

  getNextReviewState() {
    if (this.state.reviewState === ReviewStates.awaitingReview) {
      return ReviewStates.completed;
    } else if (this.state.reviewState === ReviewStates.keepWorking) {
      return this.props.latestReviewState ? ReviewStates.completed : null;
    } else {
      return ReviewStates.keepWorking;
    }
  }

  getTooltipText() {
    if (this.props.latestReviewState === ReviewStates.awaitingReview) {
      return i18n.teacherFeedbackAwaitingReviewTooltip();
    } else {
      return i18n.teacherFeedbackKeepWorkingTooltip();
    }
  }

  render() {
    return (
      <div
        style={styles.keepWorking}
        data-tip
        data-place="bottom"
        data-for="keep-working-tooltip"
      >
        <input
          id="keep-working"
          ref={ref => (this.checkbox = ref)}
          type="checkbox"
          style={styles.checkbox}
          onChange={this.onCheckboxChange}
        />
        <label htmlFor="keep-working" style={styles.label}>
          <span style={styles.keepWorkingText}>{i18n.keepWorking()}</span>
          {this.props.latestReviewState === ReviewStates.awaitingReview && (
            <span style={styles.awaitingReviewText}>
              {i18n.waitingForTeacherReviewLabel()}
            </span>
          )}
        </label>
        <ReactTooltip id="keep-working-tooltip" role="tooltip" effect="solid">
          <div style={styles.tooltipContent}>{this.getTooltipText()}</div>
        </ReactTooltip>
      </div>
    );
  }
}

const styles = {
  keepWorking: {
    display: 'inline-flex',
    margin: '0 20px',
  },
  checkbox: {
    width: '16px',
    height: '16px',
    marginTop: '2px',
  },
  label: {
    fontSize: '13px',
    color: color.charcoal,
    margin: '0 8px',
  },
  keepWorkingText: {
    ...fontConstants['main-font-semi-bold'],
  },
  awaitingReviewText: {
    fontStyle: 'italic',
    margin: '0 3px',
  },
  tooltipContent: {
    maxWidth: '250px',
  },
};

export default EditableReviewState;
