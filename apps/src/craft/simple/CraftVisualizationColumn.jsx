import PropTypes from 'prop-types';
import React from 'react';

import ProtectedVisualizationDiv from '../../templates/ProtectedVisualizationDiv';

var msg = require('@cdo/locale');

var BelowVisualization = require('../../templates/BelowVisualization');
var GameButtons = require('../../templates/GameButtons').default;

var CraftVisualizationColumn = function (props) {
  return (
    <span>
      <ProtectedVisualizationDiv>
        <div id="minecraft-frame">
          <div id="phaser-game" />
        </div>
      </ProtectedVisualizationDiv>
      <GameButtons>
        {props.showFinishButton && (
          <div id="right-button-cell">
            <button
              type="button"
              id="rightButton"
              className="share mc-share-button"
            >
              <div>{msg.finish()}</div>
            </button>
          </div>
        )}
      </GameButtons>
      <BelowVisualization />
    </span>
  );
};

CraftVisualizationColumn.propTypes = {
  showFinishButton: PropTypes.bool.isRequired,
};

module.exports = CraftVisualizationColumn;
