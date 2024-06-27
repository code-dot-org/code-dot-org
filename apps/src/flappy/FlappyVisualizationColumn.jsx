import PropTypes from 'prop-types';
import React from 'react';

import ProtectedVisualizationDiv from '../templates/ProtectedVisualizationDiv';

var msg = require('@cdo/locale');

var BelowVisualization = require('../templates/BelowVisualization');
var GameButtons = require('../templates/GameButtons').default;

const FlappyVisualizationColumn = ({showFinishButton}) => {
  return (
    <span>
      <ProtectedVisualizationDiv>
        <svg version="1.1" id="svgFlappy" />
      </ProtectedVisualizationDiv>
      <GameButtons>
        {showFinishButton && (
          <div id="right-button-cell">
            <button type="button" id="rightButton" className="share">
              <img src="/blockly/media/1x1.gif" alt="" />
              {msg.finish()}
            </button>
          </div>
        )}
      </GameButtons>
      <BelowVisualization />
    </span>
  );
};
FlappyVisualizationColumn.propTypes = {
  showFinishButton: PropTypes.bool.isRequired,
};

module.exports = FlappyVisualizationColumn;
