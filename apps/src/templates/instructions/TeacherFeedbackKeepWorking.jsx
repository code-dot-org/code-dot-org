import React, {Component} from 'react';
import PropTypes from 'prop-types';

const reviewStates = {
  completed: 'Completed',
  keepWorking: 'KeepWorking'
};

class TeacherFeedbackKeepWorking extends Component {
  static propTypes = {
    latestFeedback: PropTypes.object,
    newReviewState: PropTypes.string,
    setReviewState: PropTypes.func
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

  currentReviewState() {
    const {newReviewState, latestFeedback} = this.props;
    return newReviewState || latestFeedback.review_state;
  }

  handleCheckboxChange = () => {
    let newReviewState;

    if (this.checkbox.checked) {
      newReviewState = reviewStates.keepWorking;
    } else if (this.awaitingTeacherReview()) {
      newReviewState = reviewStates.completed;
    } else {
      newReviewState = null;
    }

    this.props.setReviewState(newReviewState);
  };

  render() {
    return (
      <div style={styles.keepWorking}>
        <input
          id="keep-working"
          ref={ref => (this.checkbox = ref)}
          type="checkbox"
          checked={this.currentReviewState() === reviewStates.keepWorking}
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
