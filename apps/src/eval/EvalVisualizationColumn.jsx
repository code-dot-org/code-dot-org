import React from 'react';
var msg = require('@cdo/locale');

var GameButtons = require('../templates/GameButtons').default;
var BelowVisualization = require('../templates/BelowVisualization');
import ProtectedVisualizationDiv from '../templates/ProtectedVisualizationDiv';

var EvalVisualizationColumn = function () {
  return (
    <span>
      <ProtectedVisualizationDiv>
        <svg version="1.1" id="svgEval">
          <image id="background" height="400" width="400" x="0" y="0"/>
          <g id="answer"/>
          <g id="user"/>
          <g id="test-call"/>
          <g id="test-result"/>
        </svg>
      </ProtectedVisualizationDiv>
      <GameButtons>
        <button id="continueButton" className="launch hide float-right">
          <img src="/blockly/media/1x1.gif"/>
          {msg.continue()}
        </button>
      </GameButtons>
      <BelowVisualization/>
    </span>
  );
};

module.exports = EvalVisualizationColumn;
