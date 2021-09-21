import React, {Component} from 'react';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import Button from '@cdo/apps/templates/Button';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import color from '@cdo/apps/util/color';
import $ from 'jquery';
import Comment from '@cdo/apps/templates/instructions/teacherFeedback/Comment';
import EditableReviewState from '@cdo/apps/templates/instructions/teacherFeedback/EditableReviewState';
import FeedbackStatus from '@cdo/apps/templates/instructions/teacherFeedback/FeedbackStatus';
import Rubric from '@cdo/apps/templates/instructions/teacherFeedback/Rubric';
import {
  teacherFeedbackShape,
  rubricShape
} from '@cdo/apps/templates/instructions/teacherFeedback/types';
import {ReviewStates} from '@cdo/apps/templates/feedback/types';
import ReadOnlyReviewState from '@cdo/apps/templates/instructions/teacherFeedback/ReadOnlyReviewState';
import firehoseClient from '@cdo/apps/lib/util/firehose';
import {queryUserProgress} from '@cdo/apps/code-studio/progressRedux';
import {loadLevelsWithProgress} from '@cdo/apps/code-studio/teacherPanelRedux';

const ErrorType = {
  NoError: 'NoError',
  Load: 'Load',
  Save: 'Save'
};

export class TeacherFeedback extends Component {
  static propTypes = {
    isEditable: PropTypes.bool.isRequired,
    rubric: rubricShape,
    visible: PropTypes.bool.isRequired,
    serverScriptId: PropTypes.number,
    serverLevelId: PropTypes.number,
    teacher: PropTypes.number,
    latestFeedback: teacherFeedbackShape,
    token: PropTypes.string,
    //Provided by Redux
    viewAs: PropTypes.oneOf(['Teacher', 'Student']).isRequired,
    verifiedTeacher: PropTypes.bool,
    selectedSectionId: PropTypes.string,
    updateUserProgress: PropTypes.func.isRequired,
    canHaveFeedbackReviewState: PropTypes.bool
  };

  constructor(props) {
    super(props);
    //Pull the student id from the url
    this.studentId = queryString.parse(window.location.search).user_id;
    this.onRubricChange = this.onRubricChange.bind(this);

    const {latestFeedback} = this.props;

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

  // Review state changes are tracked differently than comment or performance
  // because the teacher could repeatedly leave feedback for the student to
  // keep working, which would have the same review_state value, but should be treated
  // as independent feedbacks.
  onReviewStateChange = newState => {
    const oldState = this.getLatestReviewState();

    this.setState({
      reviewState: newState,
      reviewStateUpdated: oldState !== newState
    });
  };

  recordReviewStateUpdated() {
    firehoseClient.putRecord(
      {
        study: 'teacher_feedback',
        study_group: 'V0',
        event: 'keep_working',
        data_json: JSON.stringify({
          student_id: this.studentId,
          script_id: this.props.serverScriptId,
          level_id: this.props.serverLevelId,
          old_state: this.getLatestReviewState(),
          new_state: this.state.reviewState,
          section_id: this.props.selectedSectionId
        })
      },
      {includeUserId: true}
    );
  }

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
        if (this.state.reviewStateUpdated) {
          this.recordReviewStateUpdated();
          // The review state effects the state of the progress bubbles,
          // we re-fetch user progress after the review state has changed
          // so that the progress bubbles reflect the latest feedback
          this.props.updateUserProgress(this.studentId);
        }
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

  getLatestReviewState() {
    const {latestFeedback} = this.state;
    const reviewState = latestFeedback?.is_awaiting_teacher_review
      ? ReviewStates.awaitingReview
      : latestFeedback?.review_state;
    return reviewState || null;
  }

  renderCommentAreaHeaderForTeacher() {
    return (
      <div style={styles.header}>
        <h1 style={styles.h1}> {i18n.feedbackCommentAreaHeader()} </h1>
        {this.props.canHaveFeedbackReviewState && (
          <EditableReviewState
            latestReviewState={this.getLatestReviewState()}
            onReviewStateChange={this.onReviewStateChange}
          />
        )}
      </div>
    );
  }

  renderCommentAreaHeaderForStudent() {
    return (
      <div style={styles.header}>
        <h1 style={styles.h1}> {i18n.feedbackCommentAreaHeader()} </h1>
        <ReadOnlyReviewState latestReviewState={this.getLatestReviewState()} />
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
    const {verifiedTeacher, viewAs, rubric, visible, isEditable} = this.props;

    const {comment, performance, latestFeedback, errorState} = this.state;

    const placeholderWarning = verifiedTeacher
      ? i18n.feedbackPlaceholder()
      : i18n.feedbackPlaceholderNonVerified();

    const placeholderText = latestFeedback?.comment
      ? latestFeedback.comment
      : placeholderWarning;

    // The comment section (reivew state, comment and status) is only displayed
    // if it's editable or if the student is viewing their feedback.
    const displayCommentSection =
      isEditable || (viewAs === ViewType.Student && !!latestFeedback);

    const displayComment = !!comment || viewAs === ViewType.Teacher;

    if (!visible) {
      return null;
    }

    return (
      <div>
        {errorState === ErrorType.Load &&
          this.renderError(i18n.feedbackLoadError())}
        {rubric && (
          <Rubric
            rubric={rubric}
            performance={performance}
            isEditable={isEditable}
            onRubricChange={this.onRubricChange}
            viewAs={viewAs}
          />
        )}
        {displayCommentSection && (
          <div style={styles.commentAndFooter}>
            {viewAs === ViewType.Teacher &&
              this.renderCommentAreaHeaderForTeacher()}
            {viewAs === ViewType.Student &&
              this.renderCommentAreaHeaderForStudent()}
            {displayComment && (
              <Comment
                isEditable={isEditable}
                comment={comment}
                placeholderText={placeholderText}
                onCommentChange={this.onCommentChange}
              />
            )}
            <div style={styles.footer}>
              {viewAs === ViewType.Teacher && this.renderSubmitFeedbackButton()}
              {!!latestFeedback && (
                <FeedbackStatus
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
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    paddingBottom: 8
  },
  h1: {
    color: color.charcoal,
    fontSize: 18,
    lineHeight: '18px',
    fontFamily: '"Gotham 5r", sans-serif',
    fontWeight: 'normal'
  },
  commentAndFooter: {
    padding: '8px 16px'
  }
};

export const UnconnectedTeacherFeedback = TeacherFeedback;

export default connect(
  state => ({
    viewAs: state.viewAs,
    verifiedTeacher: state.pageConstants && state.pageConstants.verifiedTeacher,
    selectedSectionId:
      state.teacherSections && state.teacherSections.selectedSectionId,
    canHaveFeedbackReviewState: state.pageConstants.canHaveFeedbackReviewState
  }),
  dispatch => ({
    updateUserProgress(userId) {
      dispatch(queryUserProgress(userId));
      dispatch(loadLevelsWithProgress());
    }
  })
)(TeacherFeedback);
