import React, {Component} from 'react';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import Button from '@cdo/apps/templates/Button';
import moment from 'moment/moment';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import color from '@cdo/apps/util/color';

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
    fontWeight: 'bold',
    color: color.charcoal,
    textAlign: 'center'
  },
  rubricTH: {
    backgroundColor: color.lightest_gray,
    color: color.charcoal,
    border: `1px solid ${color.lightest_gray}`,
    fontFamily: '"Gotham 4r", sans-serif',
    fontSize: 10,
    textAlign: 'center',
    padding: 5
  },
  rubricTD: {
    border: `1px solid ${color.lightest_gray}`,
    padding: 5
  }
};

const ErrorType = {
  NoError: 'NoError',
  Load: 'Load',
  Save: 'Save'
};

class TeacherFeedback extends Component {
  static propTypes = {
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
    $.ajax({
      url: `/api/v1/teacher_feedbacks/get_feedback_from_teacher?student_id=${
        this.state.studentId
      }&level_id=${this.props.serverLevelId}&teacher_id=${this.props.teacher}`,
      method: 'GET',
      contentType: 'application/json;charset=UTF-8'
    })
      .done((data, textStatus, request) => {
        this.setState({
          latestFeedback: request.status === 204 ? [] : [data],
          token: request.getResponseHeader('csrf-token'),
          comment: request.status === 204 ? '' : data.comment
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
  };

  onCommentChange = event => {
    this.setState({comment: event.target.value});
  };

  onRubricChange = event => {
    console.log('You picked something new in rubric');
    this.setState({performance: event.target.id});
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
        console.log(data);
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
    if (!(this.props.viewAs === ViewType.Teacher)) {
      return null;
    }

    const latestFeedback =
      this.state.latestFeedback.length > 0
        ? this.state.latestFeedback[0]
        : null;
    const feedbackUnchanged =
      (latestFeedback && this.state.comment === latestFeedback.comment) ||
      (!latestFeedback && this.state.comment.length === 0) ||
      (latestFeedback &&
        this.state.performance === latestFeedback.performance) ||
      (!latestFeedback && this.state.performance === null);

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
        {this.state.rubric &&(
          <table>
            <thead>
              <tr>
                <th style={styles.rubricTH}>
                  <h4 style={styles.rubricHeader}>Key Concept</h4>
                </th>
                <th style={styles.rubricTH}>
                  <h4 style={styles.rubricHeader}>Exceeds</h4>
                </th>
                <th style={styles.rubricTH}>
                  <h4 style={styles.rubricHeader}>Meets</h4>
                </th>
                <th style={styles.rubricTH}>
                  <h4 style={styles.rubricHeader}>Approaches</h4>
                </th>
                <th style={styles.rubricTH}>
                  <h4 style={styles.rubricHeader}>No Evidence</h4>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={styles.rubricTD}>{this.state.rubric.keyConcept}</td>
                <td
                  style={styles.rubricTD}
                  onClick={this.onRubricChange}
                  id={'exceeds'}
                >
                  {this.state.rubric.exceeds}
                </td>
                <td
                  style={styles.rubricTD}
                  onClick={this.onRubricChange}
                  id={'meets'}
                >
                  {this.state.rubric.meets}
                </td>
                <td
                  style={styles.rubricTD}
                  onClick={this.onRubricChange}
                  id={'approaches'}
                >
                  {this.state.rubric.approaches}
                </td>
                <td
                  style={styles.rubricTD}
                  onClick={this.onRubricChange}
                  id={'noEvidence'}
                >
                  {this.state.rubric.noEvidence}
                </td>
              </tr>
            </tbody>
          </table>
        )}
        <textarea
          id="ui-test-feedback-input"
          style={styles.textInput}
          onChange={this.onCommentChange}
          placeholder={placeholderText}
          value={this.state.comment}
        />
        <div style={styles.footer}>
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
