import React from 'react';
var msg = require('@cdo/locale');

var GameButtons = require('../templates/GameButtons').default;
var ArrowButtons = require('../templates/ArrowButtons');
var BelowVisualization = require('../templates/BelowVisualization');
var ProtectedStatefulDiv = require('../templates/ProtectedStatefulDiv');
import ProtectedVisualizationDiv from '../templates/ProtectedVisualizationDiv';

var BounceVisualizationColumn = function () {
  return (
    <span>
      <ProtectedVisualizationDiv>
        <svg version="1.1" id="svgBounce"/>
      </ProtectedVisualizationDiv>
      <GameButtons>
        <ArrowButtons/>

        {" "/* Explicitly insert whitespace so that this behaves like our ejs file*/}

        <ProtectedStatefulDiv id="share-cell-wrapper">
          <div id="share-cell" className="share-cell-none">
            <button id="finishButton" className="share">
              <img src="/blockly/media/1x1.gif"/>
              {msg.finish()}
            </button>
          </div>
        </ProtectedStatefulDiv>
      </GameButtons>
      <BelowVisualization/>
    </span>
  );
};

module.exports = BounceVisualizationColumn;
