import PropTypes from 'prop-types';
import React from 'react';

import SwipePrompt from '@cdo/apps/templates/SwipePrompt';

import ArrowButtons from '../../templates/ArrowButtons';
import ProtectedVisualizationDiv from '../../templates/ProtectedVisualizationDiv';

var msg = require('@cdo/locale');

var BelowVisualization = require('../../templates/BelowVisualization');
var GameButtons = require('../../templates/GameButtons').default;

var CraftVisualizationColumn = function (props) {
  return (
    <span>
      <ProtectedVisualizationDiv>
        <div id="minecraft-frame">
          <SwipePrompt useMinecraftStyling />
          <div id="phaser-game" />
        </div>
      </ProtectedVisualizationDiv>
      <GameButtons>
        <ArrowButtons />

        {props.showFinishButton && (
          <div id="right-button-cell">
            <button
              type="button"
              id="finishButton"
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
