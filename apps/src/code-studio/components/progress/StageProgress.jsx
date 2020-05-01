import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import color from '../../../util/color';
import StageExtrasProgressBubble from '@cdo/apps/templates/progress/StageExtrasProgressBubble';
import StageTrophyProgressBubble from '@cdo/apps/templates/progress/StageTrophyProgressBubble';
import {
  levelsForLessonId,
  stageExtrasUrl,
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
    marginLeft: 4,
    marginRight: 4,
    overflow: 'hidden',
    display: 'inline-block'
  },
  innerContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },
  spacer: {
    marginRight: 'auto'
  },
  stageTrophyContainer: {
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
 * Stage progress component used in level header and course overview.
 */
class StageProgress extends Component {
  static propTypes = {
    // redux provided
    levels: PropTypes.arrayOf(levelType).isRequired,
    stageExtrasUrl: PropTypes.string,
    onStageExtras: PropTypes.bool,
    stageTrophyEnabled: PropTypes.bool
  };

  render() {
    const {stageExtrasUrl, onStageExtras, stageTrophyEnabled} = this.props;
    let levels = this.props.levels;

    // Only puzzle levels (non-concept levels) should count towards mastery.
    if (stageTrophyEnabled) {
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

    var offsetX = 0;

    var currentLevelX = currentLevelIndex * 17;
    var currentInnerContainerWidth = 0.6 * (window.innerWidth - 260); //this.innerContainerRef.offsetWidth;

    // do we need to pull our dots to the left to see the current level?
    if (currentLevelX > currentInnerContainerWidth - 6 * 17) {
      offsetX = currentLevelX - currentInnerContainerWidth + 6 * 17;
    }

    return (
      <div
        className="react_stage"
        style={{
          ...styles.headerContainer,
          ...(stageTrophyEnabled && styles.stageTrophyContainer),
          marginLeft: -offsetX
        }}
      >
        <div
          style={styles.innerContainer}
          ref={ref => (this.innerContainerRef = ref)}
        >
          {stageTrophyEnabled && <div style={styles.spacer} />}
          {levels.map((level, index) => (
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
                stageTrophyEnabled={stageTrophyEnabled}
              />
            </div>
          ))}
          {stageExtrasUrl && !stageTrophyEnabled && (
            <StageExtrasProgressBubble
              stageExtrasUrl={stageExtrasUrl}
              onStageExtras={onStageExtras}
            />
          )}
          {stageTrophyEnabled && (
            <StageTrophyProgressBubble
              percentPerfect={getPercentPerfect(levels)}
            />
          )}
        </div>
      </div>
    );
  }
}

export const UnconnectedStageProgress = StageProgress;

export default connect(state => ({
  levels: levelsForLessonId(state.progress, state.progress.currentStageId),
  stageExtrasUrl: stageExtrasUrl(state.progress, state.progress.currentStageId),
  onStageExtras: state.progress.currentLevelId === 'stage_extras'
}))(StageProgress);
