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
    backgroundColor: '#d9eff7'
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
    //margin: 10,
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
  rubricHeader: {
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 10
  },
  boxSelected: {
    border: `5px solid ${color.lightest_gray}`,
    backgroundColor: color.cyan
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
    fontSize: 14
  },
  rubricArea: {
    flexGrow: 2
  },
  performanceLevelHeader: {
    display: 'flex',
    justifyContent: 'flex-start',
    flexDirection: 'row',
    padding: '2px 10px'
  },
  performanceLevelHeaderOnHover: {
    display: 'flex',
    justifyContent: 'flex-start',
    flexDirection: 'row',
    border: '1px solid #d9eff7',
    borderRadius: 10,
    padding: '2px 10px'
  },
  performanceLevelHeaderSelected: {
    display: 'flex',
    justifyContent: 'flex-start',
    flexDirection: 'row',
    backgroundColor: '#d9eff7',
    borderRadius: 10,
    padding: '2px 10px'
  },
  h1: {
    color: color.cyan,
    marginTop: 8,
    marginBottom: 12
  },
  checkbox: {},
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
    console.log();
    if (this.props.viewAs === ViewType.Student) {
      $.ajax({
        url:
          '/api/v1/teacher_feedbacks/get_feedbacks?student_id=' +
          this.props.user +
          '&level_id=' +
          this.props.serverLevelId,
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
        url: `/api/v1/teacher_feedbacks/get_feedback_from_teacher?student_id=${
          this.state.studentId
        }&level_id=${this.props.serverLevelId}&teacher_id=${
          this.props.teacher
        }`,
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

  onCommentChange = event => {
    this.setState({comment: event.target.value});
  };

  onRubricChange = event => {
    if (event.target.value === this.state.performance) {
      this.setState({performance: null});
    } else {
      this.setState({performance: event.target.value});
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

    return (
      <div>
        {this.state.errorState === ErrorType.Load && (
          <span>
            <i className="fa fa-warning" style={styles.errorIcon} />
            {i18n.feedbackLoadError()}
          </span>
        )}
        {this.props.rubric && (
          <div style={styles.performanceArea}>
            <div style={styles.keyConceptArea}>
              <h1 style={styles.h1}>Key Concepts</h1>
              <p style={styles.keyConcepts}>{this.props.rubric.keyConcept}</p>
            </div>
            <div style={styles.rubricArea}>
              <h1 style={styles.h1}>Evaluation Rubric</h1>
              <form>
                <div
                  style={
                    this.state.performance === 'exceeds'
                      ? styles.performanceLevelHeaderSelected
                      : styles.performanceLevelHeader
                  }
                >
                  {!(
                    this.props.disabledMode &&
                    this.props.viewAs === ViewType.Teacher
                  ) && (
                    <input
                      type={'checkbox'}
                      id={'exceedsButton'}
                      name={'rubric'}
                      value={'exceeds'}
                      checked={this.state.performance === 'exceeds'}
                      onChange={this.onRubricChange}
                      disabled={this.props.disabledMode}
                      style={styles.checkbox}
                    />
                  )}
                  <details>
                    <summary style={styles.rubricHeader}>Exceeds</summary>
                    <p>{this.props.rubric.exceeds}</p>
                  </details>
                </div>
                <div
                  style={
                    this.state.performance === 'meets'
                      ? styles.performanceLevelHeaderSelected
                      : styles.performanceLevelHeader
                  }
                >
                  {!(
                    this.props.disabledMode &&
                    this.props.viewAs === ViewType.Teacher
                  ) && (
                    <input
                      type={'checkbox'}
                      id={'meetsButton'}
                      name={'rubric'}
                      value={'meets'}
                      checked={this.state.performance === 'meets'}
                      onChange={this.onRubricChange}
                      disabled={this.props.disabledMode}
                      style={styles.checkbox}
                    />
                  )}
                  <details>
                    <summary style={styles.rubricHeader}>Meets</summary>
                    <p>{this.props.rubric.meets}</p>
                  </details>
                </div>
                <div
                  style={
                    this.state.performance === 'approaches'
                      ? styles.performanceLevelHeaderSelected
                      : styles.performanceLevelHeader
                  }
                >
                  {!(
                    this.props.disabledMode &&
                    this.props.viewAs === ViewType.Teacher
                  ) && (
                    <input
                      type={'checkbox'}
                      id={'approachesButton'}
                      name={'rubric'}
                      value={'approaches'}
                      checked={this.state.performance === 'approaches'}
                      onChange={this.onRubricChange}
                      disabled={this.props.disabledMode}
                      style={styles.checkbox}
                    />
                  )}
                  <details>
                    <summary style={styles.rubricHeader}>Approaches</summary>
                    <p>{this.props.rubric.approaches}</p>
                  </details>
                </div>
                <div
                  style={
                    this.state.performance === 'noEvidence'
                      ? styles.performanceLevelHeaderSelected
                      : styles.performanceLevelHeader
                  }
                >
                  {!(
                    this.props.disabledMode &&
                    this.props.viewAs === ViewType.Teacher
                  ) && (
                    <input
                      type={'checkbox'}
                      id={'noEvidenceButton'}
                      name={'rubric'}
                      value={'noEvidence'}
                      checked={this.state.performance === 'noEvidence'}
                      onChange={this.onRubricChange}
                      disabled={this.props.disabledMode}
                      style={styles.checkbox}
                    />
                  )}
                  <details>
                    <summary style={styles.rubricHeader}>No Evidence</summary>
                    <p>{this.props.rubric.noEvidence}</p>
                  </details>
                </div>
              </form>
            </div>
          </div>
        )}
        {!(
          this.props.disabledMode && this.props.viewAs === ViewType.Teacher
        ) && (
          <div style={styles.commentArea}>
            <div>
              <div style={styles.studentTime}>
                <h1 style={styles.h1}>Teacher Feedback</h1>
                {this.props.viewAs === ViewType.Student &&
                  this.state.latestFeedback.length > 0 && (
                    <div style={styles.time} id="ui-test-feedback-time">
                      {i18n.lastUpdated({
                        time: moment
                          .min(moment(), moment(latestFeedback.created_at))
                          .fromNow()
                      })}
                    </div>
                  )}
              </div>
              <textarea
                id="ui-test-feedback-input"
                style={
                  this.props.disabledMode
                    ? styles.textInputStudent
                    : styles.textInput
                }
                onChange={this.onCommentChange}
                placeholder={placeholderText}
                value={this.state.comment}
                readOnly={this.props.disabledMode}
              />
            </div>
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
              {this.props.viewAs === ViewType.Teacher &&
                this.state.latestFeedback.length > 0 && (
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
