import React, {PropTypes} from 'react';
var msg = require('@cdo/locale');

var GameButtons = require('../templates/GameButtons').default;
var ArrowButtons = require('../templates/ArrowButtons');
var BelowVisualization = require('../templates/BelowVisualization');
import ProtectedVisualizationDiv from '../templates/ProtectedVisualizationDiv';
import VisualizationOverlay from '../templates/VisualizationOverlay';
import CrosshairOverlay from '../templates/CrosshairOverlay';
import TooltipOverlay, {coordinatesProvider} from '../templates/TooltipOverlay';

var StudioVisualizationColumn = function (props) {
  return (
    <span>
      <ProtectedVisualizationDiv>
        <svg version="1.1" id="svgStudio"/>
        <VisualizationOverlay
          width={400}
          height={400}
        >
          <CrosshairOverlay/>
          <TooltipOverlay providers={[coordinatesProvider()]}/>
        </VisualizationOverlay>
      </ProtectedVisualizationDiv>
      <GameButtons>
        <ArrowButtons/>

        {props.finishButton && <div id="share-cell" className="share-cell-none">
          <button id="finishButton" className="share">
            <img src="/blockly/media/1x1.gif"/>
            {msg.finish()}
          </button>
        </div>}
      </GameButtons>
      <BelowVisualization/>
    </span>
  );
};

StudioVisualizationColumn.propTypes = {
  finishButton: PropTypes.bool.isRequired
};

module.exports = StudioVisualizationColumn;
