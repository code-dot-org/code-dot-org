import React, {Component} from 'react';
import i18n from '@cdo/locale';
import color from '@cdo/apps/util/color';
import {levelFeedbackShape} from './types';
import SingleFeedback from '@cdo/apps/templates/feedback/SingleFeedback';
import Button from '@cdo/apps/templates/Button';

export default class LevelFeedbackEntry extends Component {
  static propTypes = levelFeedbackShape;

  state = {
    showPastComments: false
  };

  toggleshowPastComments = () => {
    this.setState({showPastComments: !this.state.showPastComments});
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

    const {showPastComments} = this.state;

    const displayedFeedbacks = showPastComments
      ? feedbacks
      : feedbacks.slice(0, 1);

    const hasMultipleFeedbacks = feedbacks.length > 1;

    const marginBottom = hasMultipleFeedbacks ? 8 : 24;

    return (
      <div style={{...styles.levelEntry, marginBottom}}>
        <div style={styles.lessonDetails}>
          <a href={linkToLevel}>
            <div style={styles.lessonLevel}>
              {i18n.feedbackNotificationLesson({
                lessonNum,
                lessonName,
                levelNum
              })}
            </div>
          </a>
          <div style={styles.unit}>
            {i18n.feedbackNotificationUnit({unitName})}
          </div>
        </div>
        {displayedFeedbacks.map(feedback => (
          <SingleFeedback feedback={feedback} />
        ))}
        {hasMultipleFeedbacks && (
          <Button
            text={
              showPastComments ? 'Hide past comments' : 'Show past comments'
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
    marginBottom: 4,
    color: color.teal,
    fontFamily: '"Gotham 5r", sans-serif'
  },
  unit: {
    color: color.dark_charcoal,
    fontSize: 14,
    lineHeight: '17px',
    marginBottom: 8
  },
  showPastComments: {
    float: 'right',
    color: color.teal,
    fontFamily: '"Gotham 5r", sans-serif',
    fontSize: 16
  }
};
