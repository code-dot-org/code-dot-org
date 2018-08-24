import React, {PropTypes, Component} from 'react';
import i18n from '@cdo/locale';
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
    feedbacks: PropTypes.arrayOf(PropTypes.shape({
      teacher_name: PropTypes.string.isRequired,
      created_at: PropTypes.string.isRequired,
      comment: PropTypes.string.isRequired
    })).isRequired
  };

  render() {
    return (
      <div>
        {this.props.feedbacks.map((feedback, i) => (
          <div style={styles.content} key={i}>
            <div>
              <span style={styles.header}>{i18n.feedbackFrom({teacher: feedback.teacher_name})}</span>
              {i18n.fromWhen({when: moment.min(moment(), moment(feedback.created_at)).fromNow()})}
            </div>
            <div>{feedback.comment}</div>
          </div>
        ))}
      </div>
    );
  }
}
