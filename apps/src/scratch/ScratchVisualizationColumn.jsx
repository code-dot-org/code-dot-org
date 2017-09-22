import React from 'react';
import BelowVisualization from '@cdo/apps/templates/BelowVisualization';
import ProtectedVisualizationDiv from '@cdo/apps/templates/ProtectedVisualizationDiv';
import assetUrl from '@cdo/apps/code-studio/assetUrl';

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
      <button id="green-flag">
        <img
          src={assetUrl('media/scratch-blocks/icons/event_whenflagclicked.svg')}
          width={30}
        />
      </button>
      <button id="stop-all">
        <img
          src={assetUrl('media/scratch-blocks/icons/control_stop.svg')}
          width={30}
        />
      </button>
      <BelowVisualization />
    </span>
  );
}
