import React from 'react';
var msg = require('@cdo/locale');

var GameButtons = require('../templates/GameButtons').default;
var BelowVisualization = require('../templates/BelowVisualization');
import ProtectedVisualizationDiv from '../templates/ProtectedVisualizationDiv';

var FlappyVisualizationColumn = function () {
  return (
    <span>
      <ProtectedVisualizationDiv>
        <svg version="1.1" id="svgFlappy"/>
      </ProtectedVisualizationDiv>
      <GameButtons>
        <div id="right-button-cell">
          <button id="rightButton" className="share">
            <img src="/blockly/media/1x1.gif"/>
            {msg.finish()}
          </button>
        </div>
      </GameButtons>
      <BelowVisualization/>
    </span>
  );
};

module.exports = FlappyVisualizationColumn;
