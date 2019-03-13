import React, {Component} from 'react';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import Button from '@cdo/apps/templates/Button';
import moment from 'moment/moment';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import color from '@cdo/apps/util/color';
import $ from 'jquery';
import RubricField from './RubricField';
import {CommentArea} from './CommentArea';

const styles = {
  button: {
    margin: 10,
    fontWeight: 'bold'
  },
  errorIcon: {
    color: 'red',
    margin: 10
  },
  time: {
    height: 24,
    paddingTop: 6,
    fontStyle: 'italic',
    fontSize: 12,
    color: color.cyan,
    backgroundColor: color.lightest_cyan
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-start'
  },
  h1: {
    color: color.charcoal,
    marginTop: 8,
    marginBottom: 12,
    fontSize: 24,
    fontFamily: '"Gotham 5r", sans-serif',
    fontWeight: 'normal'
  },
  performanceArea: {
    display: 'flex',
    justifyContent: 'flex-start',
    flexDirection: 'row',
    margin: '0px 16px 20px 16px'
  },
  keyConceptArea: {
    marginRight: 28,
    flexBasis: '40%'
  },
  keyConcepts: {
    fontSize: 13,
    color: color.charcoal
  },
  rubricArea: {
    flexBasis: '60%'
  },
  commentAndFooter: {
    margin: '0px 16px 16px 16px'
  }
};

const ErrorType = {
  NoError: 'NoError',
  Load: 'Load',
  Save: 'Save'
};

class TeacherFeedback extends Component {
  static propTypes = {
    user: PropTypes.number,
    disabledMode: PropTypes.bool,
    rubric: PropTypes.shape({
      keyConcept: PropTypes.string,
      exceeds: PropTypes.string,
      meets: PropTypes.string,
      approaches: PropTypes.string,
      noEvidence: PropTypes.string
    }),
    token: PropTypes.string,
    comment: PropTypes.string,
    performance: PropTypes.string,
    latestFeedback: PropTypes.array,
    onTokenChange: PropTypes.func,
    onRubricChange: PropTypes.func,
    onCommentChange: PropTypes.func,
    onLatestFeedbackChange: PropTypes.func,
    //Provided by Redux
    viewAs: PropTypes.oneOf(['Teacher', 'Student']),
    serverLevelId: PropTypes.number,
    teacher: PropTypes.number
  };

  constructor(props) {
    super(props);
    //Pull the student id from the url
    const studentId = queryString.parse(window.location.search).user_id;

    this.onRubricChange = this.onRubricChange.bind(this);

    this.state = {
      studentId: studentId,
      submitting: false,
      errorState: ErrorType.NoError
    };
  }

  componentDidMount = () => {
    const {serverLevelId, teacher} = this.props;
    const {studentId} = this.state;

    window.addEventListener('beforeunload', event => {
      if (!this.feedbackIsUnchanged()) {
        event.preventDefault();
        event.returnValue = i18n.feedbackNotSavedWarning();
      }
    });

    /*
     * Only feedback from teacher if:
     * 1) In edit mode for teacher
     * 2) We are loading the feedback tab for the first time since page load
     */
    if (
      !this.props.disabledMode &&
      this.props.comment === '' &&
      this.props.performance === null
    ) {
      $.ajax({
        url: `/api/v1/teacher_feedbacks/get_feedback_from_teacher?student_id=${studentId}&level_id=${serverLevelId}&teacher_id=${teacher}`,
        method: 'GET',
        contentType: 'application/json;charset=UTF-8'
      })
        .done((data, textStatus, request) => {
          this.props.onTokenChange(request.getResponseHeader('csrf-token'));
          this.props.onCommentChange(
            request.status === 204 ? '' : data.comment
          );
          this.props.onLatestFeedbackChange(
            request.status === 204 ? [] : [data]
          );
          this.props.onRubricChange(
            request.status === 204 ? null : data.performance
          );
        })
        .fail((jqXhr, status) => {
          this.setState({errorState: ErrorType.Load});
        });
    }
  };

  onCommentChange = value => {
    this.props.onCommentChange(value);
  };

  onRubricChange = value => {
    //If you click on the currently selected performance level clear the performance level
    if (value === this.props.performance) {
      this.props.onRubricChange(null);
    } else {
      this.props.onRubricChange(value);
    }
  };

  onSubmitFeedback = () => {
    this.setState({submitting: true});
    const payload = {
      comment: this.props.comment,
      student_id: this.state.studentId,
      level_id: this.props.serverLevelId,
      teacher_id: this.props.teacher,
      performance: this.props.performance
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
          submitting: false,
          errorState: ErrorType.NoError
        });
        this.props.onLatestFeedbackChange([data]);
      })
      .fail((jqXhr, status) => {
        this.setState({
          errorState: ErrorType.Save,
          submitting: false
        });
      });
  };

  latestFeedback = () => {
    const latestFeedback =
      this.props.latestFeedback.length > 0
        ? this.props.latestFeedback[0]
        : null;

    return latestFeedback;
  };

  feedbackIsUnchanged = () => {
    const latestFeedback = this.latestFeedback();
    const feedbackUnchanged =
      (latestFeedback &&
        (this.props.comment === latestFeedback.comment &&
          this.props.performance === latestFeedback.performance)) ||
      (!latestFeedback &&
        (this.props.comment.length === 0 && this.props.performance === null));

    return feedbackUnchanged;
  };

  render() {
    const latestFeedback = this.latestFeedback();
    const feedbackUnchanged = this.feedbackIsUnchanged();

    const buttonDisabled =
      feedbackUnchanged ||
      this.state.submitting ||
      this.state.errorState === ErrorType.Load;
    const buttonText = latestFeedback ? i18n.update() : i18n.saveAndShare();

    const showFeedbackInputAreas = !(
      this.props.disabledMode && this.props.viewAs === ViewType.Teacher
    );
    const placeholderText = latestFeedback
      ? latestFeedback.comment
      : i18n.feedbackPlaceholder();
    const dontShowStudentComment =
      !this.props.comment && this.props.viewAs === ViewType.Student;

    const dontShowStudentRubric =
      !this.props.performance && this.props.viewAs === ViewType.Student;

    const rubricLevels = ['exceeds', 'meets', 'approaches', 'noEvidence'];

    return (
      <div>
        {this.state.errorState === ErrorType.Load && (
          <span>
            <i className="fa fa-warning" style={styles.errorIcon} />
            {i18n.feedbackLoadError()}
          </span>
        )}
        {this.props.latestFeedback.length > 0 && (
          <div style={styles.time} id="ui-test-feedback-time">
            {i18n.lastUpdated({
              time: moment
                .min(moment(), moment(latestFeedback.created_at))
                .fromNow()
            })}
          </div>
        )}
        {this.props.rubric && !dontShowStudentRubric && (
          <div style={styles.performanceArea}>
            <div style={styles.keyConceptArea}>
              <h1 style={styles.h1}> {i18n.rubricKeyConceptHeader()} </h1>
              <p style={styles.keyConcepts}>{this.props.rubric.keyConcept}</p>
            </div>
            <div style={styles.rubricArea}>
              <h1 style={styles.h1}> {i18n.rubricHeader()} </h1>
              <form>
                {rubricLevels.map(level => (
                  <RubricField
                    key={level}
                    showFeedbackInputAreas={showFeedbackInputAreas}
                    rubricLevel={level}
                    rubricValue={this.props.rubric[level]}
                    disabledMode={this.props.disabledMode}
                    onChange={this.onRubricChange}
                    currentlyChecked={this.props.performance === level}
                  />
                ))}
              </form>
            </div>
          </div>
        )}
        {showFeedbackInputAreas && !dontShowStudentComment && (
          <div style={styles.commentAndFooter}>
            <CommentArea
              disabledMode={this.props.disabledMode}
              comment={this.props.comment}
              placeholderText={placeholderText}
              studentHasFeedback={
                this.props.viewAs === ViewType.Student &&
                this.props.latestFeedback.length > 0
              }
              onCommentChange={this.onCommentChange}
            />
            <div style={styles.footer}>
              {this.props.viewAs === ViewType.Teacher && (
                <div style={styles.button}>
                  <Button
                    id="ui-test-submit-feedback"
                    text={buttonText}
                    onClick={this.onSubmitFeedback}
                    color={Button.ButtonColor.blue}
                    disabled={buttonDisabled}
                  />
                  {this.state.errorState === ErrorType.Save && (
                    <span>
                      <i className="fa fa-warning" style={styles.errorIcon} />
                      {i18n.feedbackSaveError()}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default connect(state => ({
  viewAs: state.viewAs,
  serverLevelId: state.pageConstants.serverLevelId,
  teacher: state.pageConstants.userId
}))(TeacherFeedback);
