import React, {PropTypes, Component} from 'react';
import { connect } from 'react-redux';
import color from "../../util/color";
import i18n from '@cdo/locale';
import { ViewType } from '@cdo/apps/code-studio/viewAsRedux';
import Button from '@cdo/apps/templates/Button';
import FeedbacksList from './FeedbacksList';

const styles = {
  container: {
    margin: 20,
    borderWidth: 5,
    borderStyle: 'solid',
    borderColor: color.cyan,
    backgroundColor: color.lightest_cyan,
    borderRadius: 5
  },
  header: {
    color: color.white,
    backgroundColor: color.cyan,
    padding: 5,
    fontSize: 18,
    fontFamily: '"Gotham 7r", sans-serif'
  },
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
  }
};

class TeacherFeedback extends Component {
  static propTypes = {
    //temp prop for which version to display (stable, released 2018-teacher-experience, or internal, developer version)
    withUnreleasedFeatures: PropTypes.bool,

    //Provided by Redux
    viewAs: PropTypes.oneOf(['Teacher', 'Student']),
    serverLevelId: PropTypes.number,
    teacher: PropTypes.number,
  };

  constructor(props) {
    super(props);
    const search = window.location.search;
    const studentId = search.split('&')[1].split("=")[1];

    this.state = {
      comment: "",
      studentId: studentId,
      latestFeedback: [],
    };
  }

  componentDidMount = () => {
    $.ajax({
      url: '/api/v1/teacher_feedbacks/get_feedback_from_teacher?student_id='+this.state.studentId+'&level_id='+this.props.serverLevelId+'&teacher_id='+this.props.teacher,
      method: 'GET',
      contentType: 'application/json;charset=UTF-8',
    }).done(data => {
      this.setState({latestFeedback: [data]});
    });
  };

  onCommentChange = (event) => {
    this.setState({comment: event.target.value});
  };

  onSubmitFeedback = () => {
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
      data: JSON.stringify({teacher_feedback: payload})
    }).done(data => {
      this.setState({latestFeedback: [data]});
    }).fail((jqXhr, status) => {
      console.log(status + "  " + jqXhr.responseJSON);
    });
  };

  render() {
    if (!(this.props.viewAs === ViewType.Teacher)) {
      return null;
    }

    // Placeholder for upcoming feedback input
    return (
      <div style={styles.container}>
        <div style={styles.header}>{i18n.forTeachersOnly()}</div>
        {!this.props.withUnreleasedFeatures &&
          <div style={styles.content}>
            Coming soon: You’ll be able to use this tab to give feedback to your students about their work.
          </div>
        }
        {this.props.withUnreleasedFeatures &&
          <div>
            {this.state.latestFeedback.length > 0 &&
              <FeedbacksList
                feedbacks={this.state.latestFeedback}
              />
            }
            <textarea
              id="ui-test-feedback-input"
              style={styles.textInput}
              onChange={this.onCommentChange}
              type="text"
              placeholder={i18n.feedbackPlaceholder()}
            />
            <Button
              id="ui-test-submit-feedback"
              text={i18n.saveAndShare()}
              onClick={this.onSubmitFeedback}
              color={Button.ButtonColor.blue}
              style={styles.button}
            />
          </div>
        }
      </div>
    );
  }
}

export default connect(state => ({
  viewAs: state.viewAs,
  serverLevelId: state.pageConstants.serverLevelId,
  teacher: state.pageConstants.userId
}))(TeacherFeedback);
