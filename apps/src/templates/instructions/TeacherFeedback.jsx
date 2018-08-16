import React, {PropTypes, Component} from 'react';
import { connect } from 'react-redux';
import i18n from '@cdo/locale';
import { ViewType } from '@cdo/apps/code-studio/viewAsRedux';
import Button from '@cdo/apps/templates/Button';
import moment from "moment/moment";
import queryString from 'query-string';

const styles = {
  content: {
    padding: 10
  },
  textInput: {
    margin: 10,
    display: 'block',
    width: '90%',
  },
  button: {
    margin: 10,
    fontWeight: 'bold'
  },
  errorIcon: {
    color: 'red',
    margin: 10
  },
  time:{
    margin: 10,
    fontStyle: 'italic',
    display: 'flex',
    alignItems: 'center'
  },
  footer:{
    display: 'flex',
    justifyContent: 'flex-start'
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
    teacher: PropTypes.number,
  };

  constructor(props) {
    super(props);
    //Pull the student id from the url
    const studentId = queryString.parse(window.location.search).user_id;

    this.state = {
      comment: "",
      studentId: studentId,
      latestFeedback: [],
      submitting: false,
      errorState: ErrorType.NoError,
      token: null
    };
  }

  componentDidMount = () => {
    $.ajax({
      url: `/api/v1/teacher_feedbacks/get_feedback_from_teacher?student_id=${this.state.studentId}&level_id=${this.props.serverLevelId}&teacher_id=${this.props.teacher}`,
      method: 'GET',
      contentType: 'application/json;charset=UTF-8',
    }).done((data, textStatus, request) => {
      this.setState({
        latestFeedback: request.status === 204 ? [] : [data],
        token: request.getResponseHeader('csrf-token'),
        comment: request.status === 204 ? "" : data.comment
      });
    }).fail((jqXhr, status) => {
      this.setState({errorState: ErrorType.Load});
    });
  };

  onCommentChange = (event) => {
    this.setState({comment: event.target.value});
  };

  onSubmitFeedback = () => {
    this.setState({submitting: true});
    const payload = {
      comment: this.state.comment,
      student_id: this.state.studentId,
      level_id: this.props.serverLevelId,
      teacher_id: this.props.teacher
    };

    $.ajax({
      url: '/api/v1/teacher_feedbacks',
      method: 'POST',
      contentType: 'application/json;charset=UTF-8',
      dataType: 'json',
      data: JSON.stringify({teacher_feedback: payload}),
      headers: {"X-CSRF-Token": this.state.token}
    }).done(data => {
      this.setState({
        latestFeedback: [data],
        submitting: false,
        errorState: ErrorType.NoError
      });
    }).fail((jqXhr, status) => {
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

    const latestFeedback = this.state.latestFeedback.length > 0 ? this.state.latestFeedback[0] : null;
    const feedbackUnchanged = (latestFeedback && this.state.comment === latestFeedback.comment) ||
      (!latestFeedback && this.state.comment.length === 0);

    const buttonDisabled = feedbackUnchanged || this.state.submitting || this.state.errorState === ErrorType.Load;
    const buttonText = latestFeedback ? i18n.update() : i18n.saveAndShare();
    const placeholderText = latestFeedback ? latestFeedback.comment : i18n.feedbackPlaceholder();

    return (
      <div>
        {this.state.errorState === ErrorType.Load &&
          <span>
            <i className="fa fa-warning" style={styles.errorIcon}/>
            {i18n.feedbackLoadError()}
          </span>
        }
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
            {this.state.errorState === ErrorType.Save &&
              <span>
                <i className="fa fa-warning" style={styles.errorIcon}/>
                {i18n.feedbackSaveError()}
              </span>
            }
          </div>
          {this.state.latestFeedback.length > 0 &&
            <div style={styles.time} id="ui-test-feedback-time">
              {i18n.lastUpdated({time: moment.min(moment(), moment(latestFeedback.created_at)).fromNow()})}
            </div>
          }
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
