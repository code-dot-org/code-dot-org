import React, {Component} from 'react';
import i18n from '@cdo/locale';
import color from '@cdo/apps/util/color';
import {levelFeedbackType} from './types';
import LevelFeedbackEntry from '@cdo/apps/templates/feedback/LevelFeedbackEntry';
import Button from '@cdo/apps/templates/Button';

export default class LevelFeedback extends Component {
  static propTypes = levelFeedbackType;

  state = {
    showingOlderComments: false
  };

  toggleshowOlderComments = () => {
    this.setState({showingOlderComments: !this.state.showingOlderComments});
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

    const {showingOlderComments} = this.state;

    const displayedFeedbacks = showingOlderComments
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
              showingOlderComments
                ? i18n.hideOlderComments()
                : i18n.showOlderComments()
            }
            onClick={this.toggleshowOlderComments}
            styleAsText={true}
            style={styles.showOlderComments}
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
    marginTop: 4,
    fontFamily: '"Gotham 5r", sans-serif'
  },
  showOlderComments: {
    float: 'right',
    fontFamily: '"Gotham 5r", sans-serif',
    fontSize: 16
  }
};
