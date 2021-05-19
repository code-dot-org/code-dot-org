import React, {Component} from 'react';
import PropTypes from 'prop-types';

const reviewStates = {
  completed: 'completed',
  keepWorking: 'keepWorking'
};

class TeacherFeedbackKeepWorking extends Component {
  static propTypes = {
    latestFeedback: PropTypes.object,
    reviewState: PropTypes.string,
    setReviewState: PropTypes.func,
    setReviewStateChanged: PropTypes.func
  };

  constructor(props) {
    super(props);

    this.checkbox = null;
  }

  componentDidMount() {
    if (this.awaitingTeacherReview()) {
      this.checkbox.indeterminate = true;
    }
  }

  awaitingTeacherReview() {
    const {
      student_last_updated,
      created_at,
      review_state
    } = this.props.latestFeedback;

    const previouslyMarkedKeepWorking =
      review_state === reviewStates.keepWorking;

    const studentHasUpdated =
      student_last_updated && student_last_updated > created_at;

    return previouslyMarkedKeepWorking && studentHasUpdated;
  }

  handleCheckboxChange = () => {
    const newReviewState = this.getNewReviewState();
    this.props.setReviewState(newReviewState);

    const isDifferentFromInitial = this.isDifferentFromInitial(newReviewState);
    this.props.setReviewStateChanged(isDifferentFromInitial);
  };

  getNewReviewState() {
    let newReviewState;

    if (this.checkbox.checked) {
      newReviewState = reviewStates.keepWorking;
    } else if (this.awaitingTeacherReview()) {
      newReviewState = reviewStates.completed;
    } else {
      newReviewState = null;
    }

    return newReviewState;
  }

  isDifferentFromInitial(newReviewState) {
    const removedIndeterminateState =
      this.awaitingTeacherReview() && !this.checkbox.indeterminate;
    const reviewStateChanged =
      newReviewState !== this.props.latestFeedback.review_state;

    return removedIndeterminateState || reviewStateChanged;
  }

  render() {
    return (
      <div style={styles.keepWorking}>
        <input
          id="keep-working"
          ref={ref => (this.checkbox = ref)}
          type="checkbox"
          checked={this.props.reviewState === reviewStates.keepWorking}
          onChange={this.handleCheckboxChange}
        />
        {/* maureen add to internationalization and check rtl*/}
        <label htmlFor="keep-working" style={styles.keepWorkingText}>
          <span>Keep Working</span>
          {this.awaitingTeacherReview() && (
            <span> - awaiting teacher review</span>
          )}
        </label>
      </div>
    );
  }
}

const styles = {
  keepWorking: {
    display: 'inline-flex',
    margin: '0 15px'
  },
  keepWorkingText: {
    margin: '0 5px'
  }
};

export default TeacherFeedbackKeepWorking;
