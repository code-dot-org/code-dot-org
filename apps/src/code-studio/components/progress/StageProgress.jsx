import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';

import experiments from '@cdo/apps/util/experiments';
import { stageProgressShape } from './types';
import StatusProgressDot from './StatusProgressDot.jsx';
import color from "../../../util/color";
import StageExtrasProgressDot from '@cdo/apps/templates/progress/StageExtrasProgressDot';
import { levelsForLessonId, stageExtrasUrl } from '@cdo/apps/code-studio/progressRedux';
import NewProgressBubble from '@cdo/apps/templates/progress/NewProgressBubble';
import { levelType } from '@cdo/apps/templates/progress/progressTypes';

const styles = {
  headerContainer: {
    // With our new bubble we don't want any padding above/below
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 5,
    paddingRight: 5,
    backgroundColor: color.lightest_gray,
    border: `1px solid ${color.lighter_gray}`,
    borderRadius: 5,
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
    levels: (...args) => {
      const fn = experiments.isEnabled('progressBubbles') ?
        PropTypes.arrayOf(levelType).isRequired : stageProgressShape.isRequired;
      return fn(...args);
    },
    stageId: PropTypes.number.isRequired,
    stageExtrasUrl: PropTypes.string,
    onStageExtras: PropTypes.bool,
  },

  render() {
    const { levels, stageId, stageExtrasUrl, onStageExtras } = this.props;
    const experimentEnabled = experiments.isEnabled('progressBubbles');

    const headerStyle = {
      ...styles.headerContainer,
      ...(experimentEnabled && {
        paddingTop: 0,
        paddingBottom: 0,
        height: 40,
      })
    };

    return (
      <div className="react_stage" style={headerStyle}>
        {!experimentEnabled && levels.map((level, index) =>
          <StatusProgressDot
            key={index}
            stageId={stageId}
            level={level}
          />
        )}
        {experimentEnabled && levels.map((level, index) =>
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
          <StageExtrasProgressDot
            stageExtrasUrl={stageExtrasUrl}
            onStageExtras={onStageExtras}
          />
        }
      </div>
    );
  }
});

export const UnconnectedStageProgress = StageProgress;

export default connect(state => {
  const stageId = state.progress.currentStageId;

  // Extract levels by finding the current stageId
  const currentStage = _.find(state.progress.stages, stage => stage.id === stageId);

  const experimentEnabled = experiments.isEnabled('progressBubbles');

  return {
    // Without the experiment, we use StatusProgressDots, which expect levels in
    // the format provided by the server (and in our store as state.progress.stages.levels)
    // With the experiment, we use ProgressBubbles we expect our data in a
    // different form, the biggest difference being this level includes a status
    levels: experimentEnabled ? levelsForLessonId(state.progress, stageId) :
      currentStage.levels,
    stageId,
    stageExtrasUrl: stageExtrasUrl(state.progress, state.progress.currentStageId),
    onStageExtras: state.progress.currentLevelId === 'stage_extras'
  };
})(StageProgress);
