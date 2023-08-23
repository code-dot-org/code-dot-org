import React, {Component} from 'react';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import Button from '@cdo/apps/templates/Button';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import Comment from '@cdo/apps/templates/instructions/teacherFeedback/Comment';
import EditableReviewState from '@cdo/apps/templates/instructions/teacherFeedback/EditableReviewState';
import EditableFeedbackStatus from '@cdo/apps/templates/instructions/teacherFeedback/EditableFeedbackStatus';
import Rubric from '@cdo/apps/templates/instructions/teacherFeedback/Rubric';
import {
  teacherFeedbackShape,
  rubricShape,
} from '@cdo/apps/templates/instructions/teacherFeedback/types';
import {ReviewStates} from '@cdo/apps/templates/feedback/types';
import firehoseClient from '@cdo/apps/lib/util/firehose';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
import {queryUserProgress} from '@cdo/apps/code-studio/progressRedux';
import {loadLevelsWithProgress} from '@cdo/apps/code-studio/teacherPanelRedux';
import {updateTeacherFeedback} from '@cdo/apps/templates/instructions/teacherFeedback/teacherFeedbackDataApi';
import teacherFeedbackStyles from '@cdo/apps/templates/instructions/teacherFeedback/teacherFeedbackStyles';
import * as utils from '@cdo/apps/utils';

const ErrorType = {
  NoError: 'NoError',
  Load: 'Load',
  Save: 'Save',
  Profanity: 'Profanity',
};

export class EditableTeacherFeedback extends Component {
  static propTypes = {
    rubric: rubricShape,
    visible: PropTypes.bool.isRequired,
    serverScriptId: PropTypes.number,
    serverLevelId: PropTypes.number,
    teacher: PropTypes.number,
    latestFeedback: teacherFeedbackShape,
    token: PropTypes.string,
    //Provided by Redux
    verifiedInstructor: PropTypes.bool,
    selectedSectionId: PropTypes.number,
    updateUserProgress: PropTypes.func.isRequired,
    canHaveFeedbackReviewState: PropTypes.bool,
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
      errorState: ErrorType.NoError,
    };
  }

  componentDidMount = () => {
    window.addEventListener('beforeunload', this.onUnload);
    if (this.props.rubric) {
      analyticsReporter.sendEvent(EVENTS.RUBRIC_LEVEL_VIEWED_EVENT, {
        sectionId: this.props.selectedSectionId,
        unitId: this.props.serverScriptId,
        levelId: this.props.serverLevelId,
      });
    }
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
      reviewStateUpdated: oldState !== newState,
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
          section_id: this.props.selectedSectionId,
        }),
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
    //if (verifiedInstructor) {
    //  this.performFeedbackSubmission();
    // } else {
    // User is not a verified instructor, perform the profanity check before submitting feedback
    utils
      .findProfanity(
        this.state.comment,
        appOptions.locale,
        appOptions.authenticityToken
      )
      .done(profaneWords => {
        if (profaneWords?.length > 0) {
          // Handle case where profanity is found in the comment
          this.setState({
            errorState: ErrorType.Profanity,
            submitting: false,
          });
        } else {
          // Proceed with feedback submission after profanity check
          this.performFeedbackSubmission();
        }
      })
      .fail(() => {
        // Don't block the user in the case of a server error.
        this.performFeedbackSubmission();
      });
    //}
  };

  performFeedbackSubmission = () => {
    const payload = {
      comment: this.state.comment,
      review_state: this.state.reviewState,
      student_id: this.studentId,
      script_id: this.props.serverScriptId,
      level_id: this.props.serverLevelId,
      teacher_id: this.props.teacher,
      performance: this.state.performance,
      analytics_section_id: this.props.selectedSectionId,
    };

    updateTeacherFeedback(payload, this.props.token)
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
          errorState: ErrorType.NoError,
        });
      })
      .fail(() => {
        this.setState({
          errorState: ErrorType.Save,
          submitting: false,
        });
      });
    analyticsReporter.sendEvent(EVENTS.FEEDBACK_SUBMITTED, {
      sectionId: this.props.selectedSectionId,
      unitId: this.props.serverScriptId,
      levelId: this.props.serverLevelId,
      isRubric: this.props.rubric,
    });
  };

  didFeedbackChange = () => {
    const {latestFeedback, comment, performance, reviewStateUpdated} =
      this.state;

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

  renderSubmitFeedbackButton() {
    const {latestFeedback, submitting, errorState} = this.state;
    const {verifiedInstructor} = this.props;

    const buttonText = latestFeedback ? i18n.update() : i18n.saveAndShare();

    const buttonDisabled =
      !this.didFeedbackChange() ||
      submitting ||
      errorState === ErrorType.Load ||
      !verifiedInstructor ||
      errorState === ErrorType.Profanity;

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
        {errorState === ErrorType.Profanity &&
          this.renderError(i18n.feedbackProfanityError())}
      </div>
    );
  }

  render() {
    const {verifiedInstructor, rubric, visible} = this.props;

    const {comment, performance, latestFeedback, errorState} = this.state;

    const placeholderWarning = verifiedInstructor
      ? i18n.feedbackPlaceholder()
      : i18n.feedbackPlaceholderNonVerified();

    const placeholderText = latestFeedback?.comment
      ? latestFeedback.comment
      : placeholderWarning;

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
            isEditable={true}
            onRubricChange={this.onRubricChange}
          />
        )}
        <div style={teacherFeedbackStyles.commentAndFooter}>
          <div style={teacherFeedbackStyles.header}>
            <h1 style={teacherFeedbackStyles.h1}>
              {' '}
              {i18n.feedbackCommentAreaHeader()}{' '}
            </h1>
            {this.props.canHaveFeedbackReviewState && (
              <EditableReviewState
                latestReviewState={this.getLatestReviewState()}
                onReviewStateChange={this.onReviewStateChange}
              />
            )}
          </div>
          <Comment
            isEditable={true}
            comment={comment}
            placeholderText={placeholderText}
            onCommentChange={this.onCommentChange}
          />
          <div style={teacherFeedbackStyles.footer}>
            {this.renderSubmitFeedbackButton()}
            {!!latestFeedback && (
              <EditableFeedbackStatus latestFeedback={latestFeedback} />
            )}
          </div>
        </div>
      </div>
    );
  }
}

const styles = {
  button: {
    fontWeight: 'bold',
  },
  errorIcon: {
    color: 'red',
    margin: 10,
  },
};

export const UnconnectedEditableTeacherFeedback = EditableTeacherFeedback;

export default connect(
  state => ({
    verifiedInstructor:
      state.verifiedInstructor && state.verifiedInstructor.isVerified,
    selectedSectionId: state.teacherSections?.selectedSectionId,
    canHaveFeedbackReviewState:
      state.pageConstants && state.pageConstants.canHaveFeedbackReviewState,
  }),
  dispatch => ({
    updateUserProgress(userId) {
      dispatch(queryUserProgress(userId));
      dispatch(loadLevelsWithProgress());
    },
  }),
  null,
  {forwardRef: true}
)(EditableTeacherFeedback);
