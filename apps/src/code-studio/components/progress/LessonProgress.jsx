import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import color from '../../../util/color';
import LessonExtrasProgressBubble from '@cdo/apps/templates/progress/LessonExtrasProgressBubble';
import LessonTrophyProgressBubble from '@cdo/apps/templates/progress/LessonTrophyProgressBubble';
import {
  levelsForLessonId,
  lessonExtrasUrl,
  getPercentPerfect
} from '@cdo/apps/code-studio/progressRedux';
import ProgressBubble from '@cdo/apps/templates/progress/ProgressBubble';
import {levelType} from '@cdo/apps/templates/progress/progressTypes';

const styles = {
  headerContainer: {
    // With our new bubble we don't want any padding above/below
    paddingLeft: 5,
    paddingRight: 5,
    backgroundColor: color.lightest_gray,
    border: `1px solid ${color.lighter_gray}`,
    borderRadius: 5,
    height: 40,
    width: '100%',
    display: 'flex'
  },
  spacer: {
    marginRight: 'auto'
  },
  lessonTrophyContainer: {
    border: 0,
    borderRadius: 20,
    paddingLeft: 8,
    paddingRight: 0,
    minWidth: 350,
    marginLeft: 48
  },
  pillContainer: {
    // Vertical padding is so that this lines up with other bubbles
    paddingTop: 4,
    paddingBottom: 4
  }
};

/**
 * Lesson progress component used in level header and course overview.
 */
class LessonProgress extends Component {
  static propTypes = {
    // redux provided
    levels: PropTypes.arrayOf(levelType).isRequired,
    lessonExtrasUrl: PropTypes.string,
    onLessonExtras: PropTypes.bool,
    lessonTrophyEnabled: PropTypes.bool,
    width: PropTypes.number
  };

  render() {
    const {lessonExtrasUrl, onLessonExtras, lessonTrophyEnabled} = this.props;
    let levels = this.props.levels;

    // Only puzzle levels (non-concept levels) should count towards mastery.
    if (lessonTrophyEnabled) {
      levels = levels.filter(level => !level.isConceptLevel);
    }

    // Bonus levels should not count towards mastery.
    levels = levels.filter(level => !level.bonus);

    // which dot is current level?
    var currentLevelIndex = 0;
    for (const [i, l] of levels.entries()) {
      if (l.isCurrentLevel) {
        currentLevelIndex = i;
        break;
      }
    }

    const numLevels = levels.length;

    const numAvailableElements = Math.min(
      Math.floor((this.props.width - 40) / 18) + 1,
      numLevels
    );

    let firstElement, numElements;

    if (numAvailableElements >= numLevels) {
      // If there is enough room for all dots, just show them all.
      firstElement = 0;
    } else {
      // If there isn't enough room, show the current level in the middle
      // of the dots we can show.
      var numSurroundingElements = Math.ceil(numAvailableElements / 2);

      firstElement = currentLevelIndex - numSurroundingElements;
      var lastElement = currentLevelIndex + numSurroundingElements;

      // Adjust beginning and ending so they don't go off the ends of the range.
      if (firstElement < 0) {
        lastElement += 0 - firstElement;
        firstElement = 0;
      }

      if (lastElement >= numLevels) {
        firstElement = Math.max(0, firstElement - (lastElement - numLevels));
        lastElement -= lastElement - numLevels;
      }

      numElements = lastElement - firstElement;
    }

    const showLevels = levels.slice(firstElement, firstElement + numElements);

    return (
      <div
        className="react_stage"
        style={{
          ...styles.headerContainer,
          ...(lessonTrophyEnabled && styles.lessonTrophyContainer)
        }}
      >
        {lessonTrophyEnabled && <div style={styles.spacer} />}
        {showLevels.map((level, index) => (
          <div
            key={index}
            style={{
              ...(level.isUnplugged &&
                level.isCurrentLevel &&
                styles.pillContainer)
            }}
          >
            <ProgressBubble
              level={level}
              disabled={false}
              smallBubble={!level.isCurrentLevel}
              lessonTrophyEnabled={lessonTrophyEnabled}
            />
          </div>
        ))}
        {lessonExtrasUrl && !lessonTrophyEnabled && (
          <LessonExtrasProgressBubble
            lessonExtrasUrl={lessonExtrasUrl}
            perfect={onLessonExtras}
          />
        )}
        {lessonTrophyEnabled && (
          <LessonTrophyProgressBubble
            percentPerfect={getPercentPerfect(levels)}
          />
        )}
      </div>
    );
  }
}

export const UnconnectedLessonProgress = LessonProgress;

export default connect(state => ({
  levels: levelsForLessonId(state.progress, state.progress.currentStageId),
  lessonExtrasUrl: lessonExtrasUrl(
    state.progress,
    state.progress.currentStageId
  ),
  onLessonExtras: state.progress.currentLevelId === 'stage_extras'
}))(LessonProgress);
