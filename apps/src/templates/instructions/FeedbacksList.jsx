import PropTypes from 'prop-types';
import React, {Component} from 'react';
import i18n from '@cdo/locale';
import moment from 'moment';
import color from '@cdo/apps/util/color';

const styles = {
  content: {
    padding: 10
  },
  header: {
    fontWeight: 'bold',
    paddingRight: 5
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

export default class FeedbacksList extends Component {
  static propTypes = {
    feedbacks: PropTypes.arrayOf(
      PropTypes.shape({
        teacher_name: PropTypes.string.isRequired,
        created_at: PropTypes.string.isRequired,
        comment: PropTypes.string.isRequired,
        performance: PropTypes.string.isRequired
      })
    ).isRequired,
    rubric: PropTypes.shape({
      keyConcept: PropTypes.string.isRequired,
      exceeds: PropTypes.string.isRequired,
      meets: PropTypes.string.isRequired,
      approaches: PropTypes.string.isRequired,
      noEvidence: PropTypes.string.isRequired
    }).isRequired
  };

  render() {
    return (
      <div>
        {this.props.rubric && this.props.feedbacks[0].performance && (
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
                <td style={styles.rubricTD}>{this.props.rubric.keyConcept}</td>
                <td style={styles.rubricTD} id={'exceeds'}>
                  {this.props.rubric.exceeds}
                </td>
                <td style={styles.rubricTD} id={'meets'}>
                  {this.props.rubric.meets}
                </td>
                <td style={styles.rubricTD} id={'approaches'}>
                  {this.props.rubric.approaches}
                </td>
                <td style={styles.rubricTD} id={'noEvidence'}>
                  {this.props.rubric.noEvidence}
                </td>
              </tr>
            </tbody>
          </table>
        )}
        {this.props.feedbacks.map((feedback, i) => (
          <div style={styles.content} key={i}>
            <div>
              <span style={styles.header}>
                {i18n.feedbackFrom({teacher: feedback.teacher_name})}
              </span>
              {i18n.fromWhen({
                when: moment
                  .min(moment(), moment(feedback.created_at))
                  .fromNow()
              })}
            </div>
            <div>{feedback.comment}</div>
            <div>{feedback.performance}</div>
          </div>
        ))}
      </div>
    );
  }
}
