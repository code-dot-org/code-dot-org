import React from 'react';
var msg = require('@cdo/locale');

var GameButtons = require('../templates/GameButtons').default;
var BelowVisualization = require('../templates/BelowVisualization');
var ArrowButtons = require('../templates/ArrowButtons');
import ProtectedVisualizationDiv from '../templates/ProtectedVisualizationDiv';

var CraftVisualizationColumn = function () {
  return (
    <span>
      <ProtectedVisualizationDiv>
        <div id="minecraft-frame">
          <div id="phaser-game">
          </div>
        </div>
      </ProtectedVisualizationDiv>
      <GameButtons>
        <ArrowButtons/>

        <div id="right-button-cell">
          <button id="rightButton" className="share mc-share-button">
            <div>{msg.finish()}</div>
          </button>
        </div>
      </GameButtons>
      <BelowVisualization/>
    </span>
  );
};

module.exports = CraftVisualizationColumn;
