import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import experiments from '@cdo/apps/util/experiments';
import color from "../../../util/color";
import StageExtrasProgressBubble from '@cdo/apps/templates/progress/StageExtrasProgressBubble';
import { levelsForLessonId, stageExtrasUrl } from '@cdo/apps/code-studio/progressRedux';
import NewProgressBubble from '@cdo/apps/templates/progress/NewProgressBubble';
import { levelType } from '@cdo/apps/templates/progress/progressTypes';

const styles = {
  headerContainer: {
    // With our new bubble we don't want any padding above/below
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 5,
    paddingRight: 5,
    backgroundColor: color.lightest_gray,
    border: `1px solid ${color.lighter_gray}`,
    borderRadius: 5,
    height: 40,
  },
  pillContainer: {
    // Vertical padding is so that this lines up with other bubbles
    paddingTop: 4,
    paddingBottom: 4,
  }
};

/**
 * Stage progress component used in level header and course overview.
 */
const StageProgress = React.createClass({
  propTypes: {
    // redux provided
    levels: PropTypes.arrayOf(levelType).isRequired,
    stageExtrasUrl: PropTypes.string,
    onStageExtras: PropTypes.bool,
  },

  render() {
    const { levels, stageExtrasUrl, onStageExtras } = this.props;

    return (
      <div className="react_stage" style={styles.headerContainer}>
        {levels.map((level, index) =>
          <div
            key={index}
            style={{
              display: 'inline-block',
              ...(level.isUnplugged && level.isCurrentLevel && styles.pillContainer)
            }}
          >
            <NewProgressBubble
              level={level}
              disabled={false}
              smallBubble={!level.isCurrentLevel}
            />
          </div>
        )}
        {stageExtrasUrl && experiments.isEnabled('stageExtras') &&
          <StageExtrasProgressBubble
            stageExtrasUrl={stageExtrasUrl}
            onStageExtras={onStageExtras}
          />
        }
      </div>
    );
  }
});

export const UnconnectedStageProgress = StageProgress;

export default connect(state => ({
  levels: levelsForLessonId(state.progress, state.progress.currentStageId),
  stageExtrasUrl: stageExtrasUrl(state.progress, state.progress.currentStageId),
  onStageExtras: state.progress.currentLevelId === 'stage_extras'
}))(StageProgress);
