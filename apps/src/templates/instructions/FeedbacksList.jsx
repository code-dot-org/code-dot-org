import React, {PropTypes, Component} from 'react';
import i18n from '@cdo/locale';
import { ViewType } from '@cdo/apps/code-studio/viewAsRedux';
import moment from 'moment';

const styles = {
  content: {
    padding: 10
  },
  header: {
    fontWeight: 'bold',
    paddingRight: 5
  }
};

export default class FeedbacksList extends Component {
  static propTypes = {
    viewAs: PropTypes.oneOf(Object.keys(ViewType)),
    serverLevelId: PropTypes.number,
    student: PropTypes.number,
    feedbacks: PropTypes.array,
  };


  render() {
    if (!(this.props.viewAs === ViewType.Student)) {
      return null;
    }

    return (
      <div>
        {this.props.feedbacks.map((feedback, i) => (
          <div style={styles.content} key={i}>
            <div>
              <span style={styles.header}>{i18n.feedbackFrom({teacher: feedback.teacher_name})}</span>
              {i18n.fromWhen({when: moment(feedback.created_at).fromNow()})}
            </div>
            <div>{feedback.comment}</div>
          </div>
        ))}
      </div>
    );
  }
}
