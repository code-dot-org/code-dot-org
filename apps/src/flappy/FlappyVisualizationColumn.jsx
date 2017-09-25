import React, {PropTypes} from 'react';
var msg = require('@cdo/locale');

var GameButtons = require('../templates/GameButtons').default;
var BelowVisualization = require('../templates/BelowVisualization');
import ProtectedVisualizationDiv from '../templates/ProtectedVisualizationDiv';

const FlappyVisualizationColumn = ({showFinishButton}) => {
  return (
    <span>
      <ProtectedVisualizationDiv>
        <svg version="1.1" id="svgFlappy"/>
      </ProtectedVisualizationDiv>
      <GameButtons>
        {showFinishButton && <div id="right-button-cell">
          <button id="rightButton" className="share">
            <img src="/blockly/media/1x1.gif"/>
            {msg.finish()}
          </button>
        </div>}
      </GameButtons>
      <BelowVisualization/>
    </span>
  );
};
FlappyVisualizationColumn.propTypes = {
  showFinishButton: PropTypes.bool.isRequired,
};

module.exports = FlappyVisualizationColumn;
