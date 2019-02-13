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
  content: {
    padding: 10
  },
  textInput: {
    margin: 10,
    display: 'block',
    width: '90%'
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
    margin: 10,
    fontStyle: 'italic',
    display: 'flex',
    alignItems: 'center'
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-start'
  },
  rubricHeader: {
    fontWeight: 'bold'
  },
  boxSelected: {
    border: `5px solid ${color.lightest_gray}`,
    backgroundColor: color.cyan
  },
  performanceArea: {
    display: 'flex',
    justifyContent: 'flex-start',
    flexDirection: 'row'
  },
  keyConceptArea: {
    padding: 10
  },
  rubricArea: {
    padding: 10
  },
  performanceLevelHeader: {
    display: 'flex',
    justifyContent: 'flex-start',
    flexDirection: 'row'
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
      token: null,
      rubric: null
    };
  }

  componentDidMount = () => {
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
      this.setState({
        rubric: {
          keyConcept: 'Apples',
          exceeds: 'Oranges',
          meets: 'Bananas',
          approaches: 'Grapes',
          noEvidence: 'Pineapple'
        }
      });
    } else {
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
      $.ajax({
        url: `/levels/${this.props.serverLevelId}/get_rubric/`,
        method: 'GET',
        contentType: 'application/json;charset=UTF-8'
      }).done(data => {
        this.setState({rubric: data});
      });
    }
  };

  onCommentChange = event => {
    this.setState({comment: event.target.value});
  };

  onRubricChange = event => {
    if (event.target.value === this.state.performance) {
      event.target.checked = false;
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
        {this.state.rubric && (
          <div style={styles.performanceArea}>
            <div style={styles.keyConceptArea}>
              <h1>Key Concept</h1>
              <p>{this.state.rubric.keyConcept}</p>
            </div>
            <div style={styles.rubricArea}>
              <h1>Evaluation Rubric</h1>
              <form>
                <div style={styles.performanceLevelHeader}>
                  <input
                    type={'radio'}
                    id={'exceedsButton'}
                    name={'rubric'}
                    value={'exceeds'}
                    defaultChecked={this.state.performance === 'exceeds'}
                    onClick={this.onRubricChange}
                  />
                  <details>
                    <summary style={styles.rubricHeader}>Exceeds</summary>
                    <p>{this.state.rubric.exceeds}</p>
                  </details>
                </div>
                <div style={styles.performanceLevelHeader}>
                  <input
                    type={'radio'}
                    id={'meetsButton'}
                    name={'rubric'}
                    value={'meets'}
                    defaultChecked={this.state.performance === 'meets'}
                    onClick={this.onRubricChange}
                  />
                  <details>
                    <summary style={styles.rubricHeader}>Meets</summary>
                    <p>{this.state.rubric.meets}</p>
                  </details>
                </div>
                <div style={styles.performanceLevelHeader}>
                  <input
                    type={'radio'}
                    id={'approachesButton'}
                    name={'rubric'}
                    value={'approaches'}
                    defaultChecked={this.state.performance === 'approaches'}
                    onClick={this.onRubricChange}
                  />
                  <details>
                    <summary style={styles.rubricHeader}>Approaches</summary>
                    <p>{this.state.rubric.approaches}</p>
                  </details>
                </div>
                <div style={styles.performanceLevelHeader}>
                  <input
                    type={'radio'}
                    id={'noEvidenceButton'}
                    name={'rubric'}
                    value={'noEvidence'}
                    defaultChecked={this.state.performance === 'noEvidence'}
                    onClick={this.onRubricChange}
                  />
                  <details>
                    <summary style={styles.rubricHeader}>No Evidence</summary>
                    <p>{this.state.rubric.noEvidence}</p>
                  </details>
                </div>
              </form>
            </div>
          </div>
        )}
        <textarea
          id="ui-test-feedback-input"
          style={styles.textInput}
          onChange={this.onCommentChange}
          placeholder={placeholderText}
          value={this.state.comment}
          readOnly={this.props.viewAs === ViewType.Student}
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
    );
  }
}

export default connect(state => ({
  viewAs: state.viewAs,
  serverLevelId: state.pageConstants.serverLevelId,
  teacher: state.pageConstants.userId
}))(TeacherFeedback);
