import React, {Component} from 'react';
import PropTypes from 'prop-types';
import LevelFeedbackEntry from '@cdo/apps/templates/feedback/LevelFeedbackEntry';
import i18n from '@cdo/locale';
import {feedbackShape} from './types';

export default class AllFeedback extends Component {
  static propTypes = {
    feedbacks: PropTypes.arrayOf(feedbackShape)
  };

  render() {
    const {feedbacks} = this.props;
    const noFeedback = feedbacks.length === 0;

    return (
      <div>
        <h1>{i18n.feedbackAll()}</h1>
        {noFeedback && <div>{i18n.feedbackNoneYet()}</div>}
        {feedbacks.map((feedback, i) => {
          return <LevelFeedbackEntry key={i} feedback={feedback} />;
        })}
      </div>
    );
  }
}
