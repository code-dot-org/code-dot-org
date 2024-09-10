import $ from 'jquery';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';

import {navigateToLevelId} from '@cdo/apps/code-studio/progressRedux';
import {
  lessonExtrasUrl,
  getCurrentLevel,
  getCurrentLevels,
} from '@cdo/apps/code-studio/progressReduxSelectors';
import LessonExtrasProgressBubble from '@cdo/apps/templates/progress/LessonExtrasProgressBubble';
import ProgressBubble from '@cdo/apps/templates/progress/ProgressBubble';
import {levelWithProgressType} from '@cdo/apps/templates/progress/progressTypes';
import {LevelKind, LevelStatus} from '@cdo/generated-scripts/sharedConstants';

import color from '../../../util/color';
import {canChangeLevelInPage} from '../../browserNavigation';

/**
 * Lesson progress component used in level header and course overview.
 */
class LessonProgress extends Component {
  static propTypes = {
    levels: PropTypes.arrayOf(levelWithProgressType).isRequired,
    lessonName: PropTypes.string,
    lessonExtrasUrl: PropTypes.string,
    isLessonExtras: PropTypes.bool,
    width: PropTypes.number,
    setDesiredWidth: PropTypes.func,
    currentPageNumber: PropTypes.number,
    currentLevelId: PropTypes.string,
    navigateToLevelId: PropTypes.func,
    currentLevel: PropTypes.object,
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

  shouldComponentUpdate(nextProps) {
    for (
      let levelIndex = 0;
      levelIndex < this.props.levels.length;
      levelIndex++
    ) {
      const currentLevelChanged =
        this.props.currentLevelId !== nextProps.currentLevelId;

      const statusChanged =
        this.props.levels[levelIndex].status !==
        nextProps.levels[levelIndex].status;

      const badgeChanged =
        this.props.levels[levelIndex].teacherFeedbackReviewState !==
        nextProps.levels[levelIndex].teacherFeedbackReviewState;

      if (currentLevelChanged || statusChanged || badgeChanged) {
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
          vignetteStyle: {...styles.headerVignette, ...vignetteStyle},
        };
      }
    }

    return {headerFullProgressOffset: 0, vignetteStyle: null};
  }

  isBonusComplete() {
    return this.props.levels.some(
      level => level.bonus && level.status === LevelStatus.perfect
    );
  }

  /**
   * Determines if we're on a bonus level page, in which case we want to pass
   * `isSelected=true` into our `LessonExtrasProgressBubble` component.
   * `isLessonExtras` indicates whether we're on the bonus level selection
   * page, and `currentLevel.bonus` indicates whether we're on an actual
   * bonus level page.
   */
  isOnBonusLevel() {
    const {isLessonExtras, levels, currentLevelId} = this.props;
    return (
      isLessonExtras ||
      levels.some(level => level.id === currentLevelId && level.bonus)
    );
  }

  render() {
    const {
      currentPageNumber,
      lessonExtrasUrl,
      lessonName,
      navigateToLevelId,
      currentLevel,
    } = this.props;
    let levels = this.props.levels;

    // Bonus levels should not count towards mastery.
    levels = levels.filter(level => !level.bonus);

    const {headerFullProgressOffset, vignetteStyle} =
      this.getFullProgressOffset();

    const onBonusLevel = this.isOnBonusLevel();

    return (
      <div className="react_stage" style={styles.container}>
        <div
          className="full_progress_outer"
          style={{...styles.outer, left: headerFullProgressOffset}}
        >
          <div
            className="full_progress_inner"
            ref="fullProgressInner"
            style={styles.inner}
          >
            {levels.map((level, index) => {
              let isCurrent =
                level.isCurrentLevel ||
                level.sublevels?.some(sublevel => sublevel.isCurrentLevel);
              if (isCurrent && level.kind === LevelKind.assessment) {
                isCurrent = currentPageNumber === level.pageNumber;
              }

              // When the user clicks on a level bubble for which we support changing to
              // that level without reloading the page, we use a click handler which
              // calls through to the progress redux store to change to that level
              // immediately.
              const onBubbleClick = canChangeLevelInPage(currentLevel, level)
                ? () => navigateToLevelId(level.id)
                : undefined;

              return (
                <div
                  key={index}
                  ref={isCurrent ? 'currentLevel' : null}
                  style={{
                    ...styles.inner,
                    ...(level.isUnplugged && isCurrent && styles.pillContainer),
                  }}
                >
                  <ProgressBubble
                    level={level}
                    disabled={false}
                    smallBubble={!isCurrent}
                    lessonName={lessonName}
                    onClick={onBubbleClick}
                  />
                </div>
              );
            })}
            {lessonExtrasUrl && (
              <div ref={onBonusLevel ? 'currentLevel' : null}>
                <LessonExtrasProgressBubble
                  lessonExtrasUrl={lessonExtrasUrl}
                  isPerfect={this.isBonusComplete()}
                  isSelected={onBonusLevel}
                />
              </div>
            )}
          </div>
        </div>
        <div className="vignette" style={vignetteStyle} />
      </div>
    );
  }
}

const styles = {
  container: {
    backgroundColor: color.lightest_gray,
    border: `1px solid ${color.lighter_gray}`,
    borderRadius: 5,
    height: 40,
    position: 'relative',
    overflow: 'hidden',
  },
  outer: {
    position: 'absolute',
    paddingLeft: 4,
    paddingRight: 4,
    height: '100%',
    whiteSpace: 'nowrap',
  },
  inner: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  headerVignette: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
  },
  headerVignetteLeftRight: {
    background:
      'linear-gradient(to right, rgba(231, 232, 234, 1) 0%, rgba(231, 232, 234, 0) 20px, rgba(231, 232, 234, 0) calc(100% - 20px), rgba(231, 232, 234, 1) 100%)',
  },
  headerVignetteLeft: {
    background:
      'linear-gradient(to right, rgba(231, 232, 234, 1) 0%, rgba(231, 232, 234, 0) 20px',
  },
  headerVignetteRight: {
    background:
      'linear-gradient(to right, rgba(231, 232, 234, 0) calc(100% - 20px), rgba(231, 232, 234, 1) 100%)',
  },
  spacer: {
    marginRight: 'auto',
  },
  lessonTrophyContainer: {
    border: 0,
    borderRadius: 20,
    paddingLeft: 8,
    paddingRight: 0,
    minWidth: 350,
    marginLeft: 48,
  },
  pillContainer: {
    // Vertical padding is so that this lines up with other bubbles
    paddingTop: 4,
    paddingBottom: 4,
  },
};

export const UnconnectedLessonProgress = LessonProgress;

export default connect(
  state => ({
    levels: getCurrentLevels(state),
    currentLevel: getCurrentLevel(state),
    lessonExtrasUrl: lessonExtrasUrl(
      state.progress,
      state.progress.currentLessonId
    ),
    isLessonExtras: state.progress.isLessonExtras,
    currentPageNumber: state.progress.currentPageNumber,
    currentLevelId: state.progress.currentLevelId,
  }),
  dispatch => ({
    navigateToLevelId(levelId) {
      dispatch(navigateToLevelId(levelId));
    },
  })
)(LessonProgress);
