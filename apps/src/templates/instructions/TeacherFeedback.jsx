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
  textInput: {
    marginTop: 0,
    marginBottom: 16,
    display: 'block',
    width: '90%'
  },
  textInputStudent: {
    margin: 10,
    display: 'block',
    width: '90%',
    backgroundColor: color.lightest_cyan
  },
  button: {
    margin: 10,
    fontWeight: 'bold'
  },
  errorIcon: {
    color: 'red',
    margin: 10
  },
  time: {
    fontStyle: 'italic',
    display: 'flex',
    alignItems: 'center'
  },
  studentTime: {
    display: 'flex',
    justifyContent: 'space-between'
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
    margin: '8px 16px 20px 16px'
  },
  keyConceptArea: {
    flexGrow: 1,
    marginRight: 28
  },
  keyConcepts: {
    fontSize: 13,
    color: color.charcoal
  },
  rubricArea: {
    flexGrow: 2
  },
  commentArea: {
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
      comment: '',
      performance: null,
      studentId: studentId,
      latestFeedback: [],
      submitting: false,
      errorState: ErrorType.NoError,
      token: null
    };
  }

  componentDidMount = () => {
    const {user, serverLevelId, teacher} = this.props;
    const {studentId} = this.state;

    if (this.props.viewAs === ViewType.Student) {
      $.ajax({
        url: `/api/v1/teacher_feedbacks/get_feedbacks?student_id=${user}&level_id=${serverLevelId}`,
        method: 'GET',
        contentType: 'application/json;charset=UTF-8'
      }).done(data => {
        this.setState({
          latestFeedback: data,
          comment: data[0].comment,
          performance: data[0].performance
        });
      });
    } else if (!this.props.disabledMode) {
      $.ajax({
        url: `/api/v1/teacher_feedbacks/get_feedback_from_teacher?student_id=${studentId}&level_id=${serverLevelId}&teacher_id=${teacher}`,
        method: 'GET',
        contentType: 'application/json;charset=UTF-8'
      })
        .done((data, textStatus, request) => {
          this.setState({
            latestFeedback: request.status === 204 ? [] : [data],
            token: request.getResponseHeader('csrf-token'),
            comment: request.status === 204 ? '' : data.comment,
            performance: request.status === 204 ? null : data.performance
          });
        })
        .fail((jqXhr, status) => {
          this.setState({errorState: ErrorType.Load});
        });
    }
  };

  onCommentChange = value => {
    this.setState({comment: value});
  };

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
      student_id: this.state.studentId,
      level_id: this.props.serverLevelId,
      teacher_id: this.props.teacher,
      performance: this.state.performance
    };

    $.ajax({
      url: '/api/v1/teacher_feedbacks',
      method: 'POST',
      contentType: 'application/json;charset=UTF-8',
      dataType: 'json',
      data: JSON.stringify({teacher_feedback: payload}),
      headers: {'X-CSRF-Token': this.state.token}
    })
      .done(data => {
        this.setState({
          latestFeedback: [data],
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

  render() {
    const latestFeedback =
      this.state.latestFeedback.length > 0
        ? this.state.latestFeedback[0]
        : null;
    const feedbackUnchanged =
      (latestFeedback &&
        (this.state.comment === latestFeedback.comment &&
          this.state.performance === latestFeedback.performance)) ||
      (!latestFeedback &&
        (this.state.comment.length === 0 && this.state.performance === null));

    const buttonDisabled =
      feedbackUnchanged ||
      this.state.submitting ||
      this.state.errorState === ErrorType.Load;
    const buttonText = latestFeedback ? i18n.update() : i18n.saveAndShare();
    const placeholderText = latestFeedback
      ? latestFeedback.comment
      : i18n.feedbackPlaceholder();

    const showFeedbackInputAreas = !(
      this.props.disabledMode && this.props.viewAs === ViewType.Teacher
    );

    const dontShowStudentRubric =
      !this.state.performance && this.props.viewAs === ViewType.Student;

    const dontShowStudentComment =
      !this.state.comment && this.props.viewAs === ViewType.Student;

    return (
      <div>
        {this.state.errorState === ErrorType.Load && (
          <span>
            <i className="fa fa-warning" style={styles.errorIcon} />
            {i18n.feedbackLoadError()}
          </span>
        )}
        {this.props.rubric && !dontShowStudentRubric && (
          <div style={styles.performanceArea}>
            <div style={styles.keyConceptArea}>
              <h1 style={styles.h1}>Key Concepts</h1>
              <p style={styles.keyConcepts}>{this.props.rubric.keyConcept}</p>
            </div>
            <div style={styles.rubricArea}>
              <h1 style={styles.h1}>Evaluation Rubric</h1>
              <form>
                <RubricField
                  showFeedbackInputAreas={showFeedbackInputAreas}
                  rubricLevel={'exceeds'}
                  rubricValue={this.props.rubric.exceeds}
                  disabledMode={this.props.disabledMode}
                  onChange={this.onRubricChange}
                  currentlyChecked={this.state.performance === 'exceeds'}
                />
                <RubricField
                  showFeedbackInputAreas={showFeedbackInputAreas}
                  rubricLevel={'meets'}
                  rubricValue={this.props.rubric.meets}
                  disabledMode={this.props.disabledMode}
                  onChange={this.onRubricChange}
                  currentlyChecked={this.state.performance === 'meets'}
                />
                <RubricField
                  showFeedbackInputAreas={showFeedbackInputAreas}
                  rubricLevel={'approaches'}
                  rubricValue={this.props.rubric.approaches}
                  disabledMode={this.props.disabledMode}
                  onChange={this.onRubricChange}
                  currentlyChecked={this.state.performance === 'approaches'}
                />
                <RubricField
                  showFeedbackInputAreas={showFeedbackInputAreas}
                  rubricLevel={'noEvidence'}
                  rubricValue={this.props.rubric.noEvidence}
                  disabledMode={this.props.disabledMode}
                  onChange={this.onRubricChange}
                  currentlyChecked={this.state.performance === 'noEvidence'}
                />
              </form>
            </div>
          </div>
        )}
        {showFeedbackInputAreas && !dontShowStudentComment && (
          <div style={styles.commentArea}>
            <CommentArea
              disabledMode={this.props.disabledMode}
              comment={this.state.comment}
              placeholderText={placeholderText}
              studentHasFeedback={
                this.props.viewAs === ViewType.Student &&
                this.state.latestFeedback.length > 0
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
              {this.state.latestFeedback.length > 0 && (
                <div style={styles.time} id="ui-test-feedback-time">
                  {i18n.lastUpdated({
                    time: moment
                      .min(moment(), moment(latestFeedback.created_at))
                      .fromNow()
                  })}
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
