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
import $ from 'jquery';

const styles = {
  container: {
    backgroundColor: color.lightest_gray,
    border: `1px solid ${color.lighter_gray}`,
    borderRadius: 5,
    height: 40,
    position: 'relative',
    overflow: 'hidden'
  },
  outer: {
    position: 'absolute',
    paddingLeft: 4,
    paddingRight: 4,
    height: '100%',
    whiteSpace: 'nowrap'
  },
  inner: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%'
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
    setDesiredWidth: PropTypes.func
  };

  getFullWidth() {
    const component = $(this.refs.fullProgressInner);
    return component.length > 0 ? component.width() : 0;
  }

  setDesiredWidth() {
    if (this.props.setDesiredWidth) {
      this.props.setDesiredWidth(this.getFullWidth());
    }
  }

  componentDidMount() {
    this.setDesiredWidth();
  }

  componentDidUpdate() {
    this.setDesiredWidth();
  }

  shouldComponentUpdate(nextProps, nextState) {
    for (
      let levelIndex = 0;
      levelIndex < this.props.levels.length;
      levelIndex++
    ) {
      if (
        this.props.levels[levelIndex].status !==
        nextProps.levels[levelIndex].status
      ) {
        return true;
      }
    }

    return this.props.width !== nextProps.width;
  }

  getFullProgressOffset() {
    // We want to set the offset so that the current level is in the middle
    // of the available width.

    if (this.refs.currentLevel && this.props.width) {
      const fullWidth = this.getFullWidth();
      const actualWidth = this.props.width;
      const currentLevelOffset = $(this.refs.currentLevel).position().left;

      if (fullWidth > actualWidth) {
        // A regular highlighted bubble is 34 pixels wide.
        const currentLevelBubbleWidth = 34;
        let desiredOffset =
          actualWidth / 2 - currentLevelOffset - currentLevelBubbleWidth / 2;

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
          ...styles.container,
          ...(lessonTrophyEnabled && styles.lessonTrophyContainer)
        }}
      >
        <div
          className="full_progress_outer"
          style={{...styles.outer, left: headerFullProgressOffset}}
        >
          <div
            className="full_progress_inner"
            ref="fullProgressInner"
            style={styles.inner}
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
              <div ref={onLessonExtras ? 'currentLevel' : null}>
                <LessonExtrasProgressBubble
                  lessonExtrasUrl={lessonExtrasUrl}
                  perfect={onLessonExtras}
                />
              </div>
            )}
            {lessonTrophyEnabled && (
              <LessonTrophyProgressBubble
                percentPerfect={getPercentPerfect(levels)}
              />
            )}
          </div>
        </div>
        <div className="vignette" style={vignetteStyle} />
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
