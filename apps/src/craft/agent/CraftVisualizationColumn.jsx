import PropTypes from 'prop-types';
import React from 'react';
import msg from '@cdo/locale';

import GameButtons from '../../templates/GameButtons';
import ArrowButtons from '../../templates/ArrowButtons';
import BelowVisualization from '../../templates/BelowVisualization';
import ProtectedVisualizationDiv from '../../templates/ProtectedVisualizationDiv';
import SwipePrompt from '@cdo/apps/templates/SwipePrompt';

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

export default CraftVisualizationColumn;
