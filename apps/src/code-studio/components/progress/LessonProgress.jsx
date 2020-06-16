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
    //paddingLeft: 5,
    //paddingRight: 5,
    backgroundColor: color.lightest_gray,
    border: `1px solid ${color.lighter_gray}`,
    borderRadius: 5,
    height: 40,
    position: 'relative',
    //marginLeft: 4,
    //marginRight: 4,
    overflow: 'hidden'
  },
  headerFullProgress: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    paddingLeft: 4,
    paddingRight: 4
  },
  headerVignette: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none'
  },
  headerVignetteLeftRight: {
    background:
      'linear-gradient(to right, rgba(231, 232, 234, 1) 0%, rgba(231, 232, 234, 0) 20px, rgba(231, 232, 234, 0) calc(100% - 20px), rgba(231, 232, 234, 1) 100%)'
  },
  headerVignetteLeft: {
    background:
      'linear-gradient(to right, rgba(231, 232, 234, 1) 0%, rgba(231, 232, 234, 0) 20px'
  },
  headerVignetteRight: {
    background:
      'linear-gradient(to right, rgba(231, 232, 234, 0) calc(100% - 20px), rgba(231, 232, 234, 1) 100%)'
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
    levels: PropTypes.arrayOf(levelType).isRequired,
    lessonExtrasUrl: PropTypes.string,
    onLessonExtras: PropTypes.bool,
    lessonTrophyEnabled: PropTypes.bool,
    width: PropTypes.number,
    onSize: PropTypes.func.isRequired
  };

  componentDidUpdate() {
    // Report back to our parent how wide we would like to be.
    const fullWidth = $('.full_progress').width();
    this.props.onSize(fullWidth);
  }

  getFullProgressOffset() {
    // We want to set the offset so that the current level is in the middle
    // of the available width.

    if (this.refs.currentLevel && this.props.width) {
      const fullWidth = $('.full_progress').width();
      const actualWidth = this.props.width - 10;
      const currentLevelOffset = $(this.refs.currentLevel).position().left;

      if (fullWidth > actualWidth) {
        let desiredOffset = actualWidth / 2 - currentLevelOffset - 34 / 2;

        let vignetteStyle = styles.headerVignetteLeftRight;

        // don't go too far to the left
        if (desiredOffset + fullWidth < actualWidth) {
          desiredOffset = actualWidth - fullWidth;
          vignetteStyle = styles.headerVignetteLeft;
        }

        // don't go too far to the right
        if (desiredOffset > 0) {
          desiredOffset = 0;
          vignetteStyle = styles.headerVignetteRight;
        }

        return {
          headerFullProgressOffset: desiredOffset,
          vignetteStyle: {...styles.headerVignette, ...vignetteStyle}
        };
      }
    }

    return {headerFullProgressOffset: 0, vignetteStyle: null};
  }

  render() {
    const {lessonExtrasUrl, onLessonExtras, lessonTrophyEnabled} = this.props;
    let levels = this.props.levels;

    // Only puzzle levels (non-concept levels) should count towards mastery.
    if (lessonTrophyEnabled) {
      levels = levels.filter(level => !level.isConceptLevel);
    }

    // Bonus levels should not count towards mastery.
    levels = levels.filter(level => !level.bonus);

    const {
      headerFullProgressOffset,
      vignetteStyle
    } = this.getFullProgressOffset();

    return (
      <div
        className="react_stage"
        style={{
          ...styles.headerContainer,
          ...(lessonTrophyEnabled && styles.lessonTrophyContainer)
        }}
      >
        <div
          className="full_progress"
          style={{...styles.headerFullProgress, left: headerFullProgressOffset}}
        >
          {lessonTrophyEnabled && <div style={styles.spacer} />}
          {levels.map((level, index) => (
            <div
              key={index}
              ref={level.isCurrentLevel ? 'currentLevel' : null}
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
        <div id="vignette" style={vignetteStyle} />
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
