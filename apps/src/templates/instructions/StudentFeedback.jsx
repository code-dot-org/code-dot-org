import React, {PropTypes, Component} from 'react';
import { connect } from 'react-redux';
import i18n from '@cdo/locale';
import { ViewType } from '@cdo/apps/code-studio/viewAsRedux';
import moment from 'moment';

const styles = {
  content: {
    padding: 10
  },
  header: {
    fontWeight: 'bold'
  }
};

class StudentFeedback extends Component {
  static propTypes = {
    viewAs: PropTypes.oneOf(Object.keys(ViewType)),
    serverLevelId: PropTypes.number,
    student: PropTypes.number
  };

  state = {
    feedbacks: []
  };

  componentDidMount = () => {
    $.ajax({
      url: '/api/v1/teacher_feedbacks/get_feedbacks?student_id='+this.props.student+'&level_id='+this.props.serverLevelId,
      method: 'GET',
      contentType: 'application/json;charset=UTF-8',
    }).done(data => {
      this.setState({feedbacks: data});
    });
  };

  render() {
    if (!(this.props.viewAs === ViewType.Student)) {
      return null;
    }

    return (
      <div>
        {this.state.feedbacks.map((feedback, i) => (
          <div style={styles.content} key={i}>
            <div style={styles.header}>{i18n.feedbackFrom({teacher: feedback.teacher_id})}</div>
            <div>{i18n.fromWhen({when: moment(feedback.created_at).fromNow()})}<br/>{feedback.comment}</div>
          </div>
        ))}
      </div>
    );
  }
}

export default connect(state => ({
  viewAs: state.viewAs,
  serverLevelId: state.pageConstants.serverLevelId,
  student: state.pageConstants.userId
}))(StudentFeedback);
