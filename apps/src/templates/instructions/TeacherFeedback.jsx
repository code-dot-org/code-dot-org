import React, {Component} from 'react';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import Button from '@cdo/apps/templates/Button';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import color from '@cdo/apps/util/color';
import $ from 'jquery';
import {CommentArea} from './CommentArea';
import TeacherFeedbackKeepWorking from '@cdo/apps/templates/instructions/TeacherFeedbackKeepWorking';
import TeacherFeedbackStatus from '@cdo/apps/templates/instructions/TeacherFeedbackStatus';
import TeacherFeedbackRubric from '@cdo/apps/templates/instructions/TeacherFeedbackRubric';
import {
  teacherFeedbackShape,
  rubricShape,
  ReviewStates
} from '@cdo/apps/templates/types';
import experiments from '@cdo/apps/util/experiments';
import FeedbackStudentReviewState from '@cdo/apps/templates/instructions/FeedbackStudentReviewState';

const ErrorType = {
  NoError: 'NoError',
  Load: 'Load',
  Save: 'Save'
};

const keepWorkingExperiment = 'teacher-feedback-review-state';

export class TeacherFeedback extends Component {
  static propTypes = {
    user: PropTypes.number,
    disabledMode: PropTypes.bool.isRequired,
    rubric: rubricShape,
    visible: PropTypes.bool.isRequired,
    serverScriptId: PropTypes.number,
    serverLevelId: PropTypes.number,
    teacher: PropTypes.number,
    displayReadonlyRubric: PropTypes.bool,
    latestFeedback: teacherFeedbackShape,
    token: PropTypes.string,
    //Provided by Redux
    viewAs: PropTypes.oneOf(['Teacher', 'Student']).isRequired,
    verifiedTeacher: PropTypes.bool,
    selectedSectionId: PropTypes.string
  };

  constructor(props) {
    super(props);
    //Pull the student id from the url
    this.studentId = queryString.parse(window.location.search).user_id;
    this.onRubricChange = this.onRubricChange.bind(this);

    const {latestFeedback} = this.props;

    this.isAwaitingTeacherReview =
      latestFeedback?.review_state === ReviewStates.keepWorking &&
      latestFeedback?.student_updated_since_feedback;

    this.state = {
      comment: latestFeedback?.comment || '',
      performance: latestFeedback?.performance || null,
      latestFeedback: latestFeedback,
      reviewState: latestFeedback?.review_state || null,
      reviewStateUpdated: false,
      submitting: false,
      errorState: ErrorType.NoError
    };
  }

  componentDidMount = () => {
    window.addEventListener('beforeunload', this.onUnload);
  };

  componentWillUnmount() {
    window.removeEventListener('beforeunload', this.onUnload);
  }

  onUnload = event => {
    if (this.didFeedbackChange()) {
      event.preventDefault();
      event.returnValue = i18n.feedbackNotSavedWarning();
    }
  };

  onCommentChange = value => {
    this.setState({comment: value});
  };

  onReviewStateChange = reviewState =>
    this.setState({
      reviewState: reviewState
    });

  // Review state changes are tracked differently than comment or performance
  // because the teacher could repeatedly leave feedback for the student to
  // keep working, which would have the same review_state value, but should be treated
  // as independent feedbacks.
  onReviewStateUpdated = isChanged =>
    this.setState({reviewStateUpdated: isChanged});

  onRubricChange = value => {
    //If you click on the currently selected performance level clear the performance level
    if (value === this.state.performance) {
      this.setState({performance: null});
    } else {
      this.setState({performance: value});
    }
  };

  onSubmitFeedback = () => {
    this.setState({submitting: true});
    const payload = {
      comment: this.state.comment,
      review_state: this.state.reviewState,
      student_id: this.studentId,
      script_id: this.props.serverScriptId,
      level_id: this.props.serverLevelId,
      teacher_id: this.props.teacher,
      performance: this.state.performance,
      analytics_section_id: this.props.selectedSectionId
    };

    $.ajax({
      url: '/api/v1/teacher_feedbacks',
      method: 'POST',
      contentType: 'application/json;charset=UTF-8',
      dataType: 'json',
      data: JSON.stringify({teacher_feedback: payload}),
      headers: {'X-CSRF-Token': this.props.token}
    })
      .done(data => {
        this.setState({
          latestFeedback: data,
          reviewStateUpdated: false,
          submitting: false,
          errorState: ErrorType.NoError
        });
      })
      .fail((jqXhr, status) => {
        this.setState({
          errorState: ErrorType.Save,
          submitting: false
        });
      });
  };

  didFeedbackChange = () => {
    const {
      latestFeedback,
      comment,
      performance,
      reviewStateUpdated
    } = this.state;

    if (latestFeedback) {
      const commentChanged = comment !== latestFeedback.comment;
      const performanceChanged = performance !== latestFeedback.performance;
      return commentChanged || performanceChanged || reviewStateUpdated;
    } else {
      return !!comment.length || !!performance || reviewStateUpdated;
    }
  };

  renderError(errorText) {
    return (
      <span>
        <i className="fa fa-warning" style={styles.errorIcon} />
        {errorText}
      </span>
    );
  }

  renderFeedbackTeacherHeader() {
    // Pilots which the user is enrolled in (such as keep working experiment) are stored on
    // window.appOptions.experiments, which is queried by experiments.js
    const keepWorkingEnabled = experiments.isEnabled(keepWorkingExperiment);
    const latestFeedback = this.state.latestFeedback;

    return (
      <div style={styles.header}>
        <h1 style={styles.h1}> {i18n.feedbackCommentAreaHeader()} </h1>
        {keepWorkingEnabled && (
          <TeacherFeedbackKeepWorking
            latestReviewState={latestFeedback?.review_state || null}
            isAwaitingTeacherReview={this.isAwaitingTeacherReview}
            setReviewState={this.onReviewStateChange}
            setReviewStateChanged={this.onReviewStateUpdated}
          />
        )}
      </div>
    );
  }

  renderFeedbackStudentHeader() {
    const latestFeedback = this.state.latestFeedback;

    return (
      <div style={styles.header}>
        <h1 style={styles.h1}> {i18n.feedbackCommentAreaHeader()} </h1>
        <FeedbackStudentReviewState
          latestReviewState={latestFeedback?.review_state || null}
          isAwaitingTeacherReview={this.isAwaitingTeacherReview}
        />
      </div>
    );
  }

  renderSubmitFeedbackButton() {
    const {latestFeedback, submitting, errorState} = this.state;
    const {verifiedTeacher} = this.props;

    const buttonText = latestFeedback ? i18n.update() : i18n.saveAndShare();

    const buttonDisabled =
      !this.didFeedbackChange() ||
      submitting ||
      errorState === ErrorType.Load ||
      !verifiedTeacher;

    return (
      <div style={styles.button}>
        <Button
          id="ui-test-submit-feedback"
          text={buttonText}
          onClick={this.onSubmitFeedback}
          color={Button.ButtonColor.blue}
          disabled={buttonDisabled}
        />
        {errorState === ErrorType.Save &&
          this.renderError(i18n.feedbackSaveError())}
      </div>
    );
  }

  render() {
    const {
      verifiedTeacher,
      viewAs,
      rubric,
      visible,
      displayReadonlyRubric,
      disabledMode
    } = this.props;

    const {comment, performance, latestFeedback, errorState} = this.state;

    const placeholderWarning = verifiedTeacher
      ? i18n.feedbackPlaceholder()
      : i18n.feedbackPlaceholderNonVerified();

    const placeholderText = latestFeedback?.comment
      ? latestFeedback.comment
      : placeholderWarning;

    const displayComment = !!comment || viewAs === ViewType.Teacher;

    if (!visible) {
      return null;
    }

    return (
      <div>
        {errorState === ErrorType.Load &&
          this.renderError(i18n.feedbackLoadError())}
        {rubric && (
          <TeacherFeedbackRubric
            rubric={rubric}
            performance={performance}
            isReadonly={displayReadonlyRubric}
            disabledMode={disabledMode}
            onRubricChange={this.onRubricChange}
            viewAs={viewAs}
          />
        )}
        {!displayReadonlyRubric && (
          <div style={styles.commentAndFooter}>
            {viewAs === ViewType.Teacher && this.renderFeedbackTeacherHeader()}
            {viewAs === ViewType.Student && this.renderFeedbackStudentHeader()}
            {displayComment && (
              <CommentArea
                isReadonly={disabledMode}
                comment={comment}
                placeholderText={placeholderText}
                studentHasFeedback={
                  viewAs === ViewType.Student && !!latestFeedback
                }
                onCommentChange={this.onCommentChange}
              />
            )}
            <div style={styles.footer}>
              {viewAs === ViewType.Teacher && this.renderSubmitFeedbackButton()}
              {!!latestFeedback && (
                <TeacherFeedbackStatus
                  viewAs={viewAs}
                  latestFeedback={latestFeedback}
                />
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
}

const styles = {
  button: {
    fontWeight: 'bold'
  },
  errorIcon: {
    color: 'red',
    margin: 10
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-start'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8
  },
  h1: {
    color: color.charcoal,
    fontSize: 18,
    lineHeight: '18px',
    fontFamily: '"Gotham 5r", sans-serif',
    fontWeight: 'normal'
  },
  commentAndFooter: {
    margin: '8px 16px 8px 16px'
  }
};

export const UnconnectedTeacherFeedback = TeacherFeedback;

export default connect(state => ({
  viewAs: state.viewAs,
  verifiedTeacher: state.pageConstants && state.pageConstants.verifiedTeacher,
  selectedSectionId:
    state.teacherSections && state.teacherSections.selectedSectionId
}))(TeacherFeedback);
