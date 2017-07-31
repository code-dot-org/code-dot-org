import React from 'react';
import BelowVisualization from '@cdo/apps/templates/BelowVisualization';
import ProtectedVisualizationDiv from '@cdo/apps/templates/ProtectedVisualizationDiv';

const styles = {
  scratchStage: {
    width: 480,
    height: 360,
  },
};

export default function ScratchVisualizationColumn() {
  return (
    <span>
      <ProtectedVisualizationDiv isResponsive={true}>
        <canvas
          id="scratch-stage"
          style={styles.scratchStage}
        />
      </ProtectedVisualizationDiv>
      <BelowVisualization />
    </span>
  );
}
