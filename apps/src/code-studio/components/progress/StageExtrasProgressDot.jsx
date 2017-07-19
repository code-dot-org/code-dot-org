import React from 'react';
import { connect } from 'react-redux';
import ProgressDot from './ProgressDot';
import { LevelStatus } from '@cdo/apps/util/sharedConstants';

function StageExtrasProgressDot(props) {
  return (
    <ProgressDot
      level={props.level}
      stageId={props.stageId}
      status={LevelStatus.not_tried}
    />
  );
}

StageExtrasProgressDot.propTypes = {
  // Regular props
  stageId: React.PropTypes.number.isRequired,

  // Redux props
  level: React.PropTypes.object.isRequired
};

export default connect((state, ownProps) => {
  const stageId = ownProps.stageId || state.progress.currentStageId;
  const currentStage = state.progress.stages.find(stage => stage.id === stageId);

  return {
    level: currentStage.stage_extras_level,
  };
})(StageExtrasProgressDot);
