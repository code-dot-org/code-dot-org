import React, {Component} from 'react';
import i18n from '@cdo/locale';
import color from '@cdo/apps/util/color';
import {levelFeedbackShape} from './types';
import LevelFeedbackEntry from '@cdo/apps/templates/feedback/LevelFeedbackEntry';
import Button from '@cdo/apps/templates/Button';

export default class LevelFeedback extends Component {
  static propTypes = levelFeedbackShape;

  state = {
    showingPastComments: false
  };

  toggleshowPastComments = () => {
    this.setState({showingPastComments: !this.state.showingPastComments});
  };

  render() {
    const {
      lessonName,
      lessonNum,
      levelNum,
      linkToLevel,
      unitName,
      feedbacks
    } = this.props;

    const {showingPastComments} = this.state;

    const displayedFeedbacks = showingPastComments
      ? feedbacks
      : feedbacks.slice(0, 1);

    const hasMultipleFeedbacks = feedbacks.length > 1;
    const marginBottom = hasMultipleFeedbacks ? 8 : 24;

    return (
      <div style={{...styles.levelEntry, marginBottom}}>
        <div style={styles.lessonDetails}>
          <a href={linkToLevel} style={styles.lessonLevel}>
            {i18n.feedbackNotificationLesson({
              lessonNum,
              lessonName,
              levelNum
            })}
          </a>
          <div style={styles.unit}>
            {i18n.feedbackNotificationUnit({unitName})}
          </div>
        </div>
        {displayedFeedbacks.map(feedback => (
          <LevelFeedbackEntry feedback={feedback} key={feedback.id} />
        ))}
        {hasMultipleFeedbacks && (
          <Button
            text={
              showingPastComments
                ? i18n.hidePastComments()
                : i18n.showPastComments()
            }
            onClick={this.toggleshowPastComments}
            displayAsText={true}
            style={styles.showPastComments}
          />
        )}
      </div>
    );
  }
}

const styles = {
  levelEntry: {
    overflow: 'hidden'
  },
  lessonDetails: {
    marginBottom: 4
  },
  lessonLevel: {
    fontSize: 18,
    lineHeight: '24px',
    color: color.teal,
    fontFamily: '"Gotham 5r", sans-serif'
  },
  unit: {
    color: color.dark_charcoal,
    fontSize: 14,
    lineHeight: '17px',
    marginBottom: 8,
    marginTop: 4
  },
  showPastComments: {
    float: 'right',
    color: color.teal,
    fontFamily: '"Gotham 5r", sans-serif',
    fontSize: 16
  }
};
