import React, {Component} from 'react';
import PropTypes from 'prop-types';
import LevelFeedbackEntry from '@cdo/apps/templates/feedback/LevelFeedbackEntry';
import i18n from '@cdo/locale';
import shapes from './shapes';

export default class AllFeedback extends Component {
  static propTypes = {
    feedbacks: PropTypes.arrayOf(shapes.feedback)
  };

  render() {
    const {feedbacks} = this.props;

    return (
      <div>
        <h1>{i18n.feedbackAll()}</h1>
        {feedbacks.map((feedback, i) => {
          return <LevelFeedbackEntry key={i} feedback={feedback} />;
        })}
      </div>
    );
  }
}
