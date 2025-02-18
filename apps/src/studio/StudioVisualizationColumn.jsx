import PropTypes from 'prop-types';
import React from 'react';

import SwipePrompt from '@cdo/apps/templates/SwipePrompt';

import ArrowButtons from '../templates/ArrowButtons';
import CrosshairOverlay from '../templates/CrosshairOverlay';
import ProtectedVisualizationDiv from '../templates/ProtectedVisualizationDiv';
import TooltipOverlay, {coordinatesProvider} from '../templates/TooltipOverlay';
import VisualizationOverlay from '../templates/VisualizationOverlay';

var msg = require('@cdo/locale');

var BelowVisualization = require('../templates/BelowVisualization');
var GameButtons = require('../templates/GameButtons').default;

var StudioVisualizationColumn = function (props) {
  return (
    <span>
      <ProtectedVisualizationDiv>
        <SwipePrompt />
        <svg version="1.1" id="svgStudio" />
        <VisualizationOverlay width={400} height={400}>
          <CrosshairOverlay />
          <TooltipOverlay
            providers={[coordinatesProvider(false, !!props.isRtl)]}
          />
        </VisualizationOverlay>
      </ProtectedVisualizationDiv>
      <GameButtons>
        <ArrowButtons />

        {props.finishButton && (
          <div id="share-cell" className="share-cell-none">
            <button type="button" id="finishButton" className="share">
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

StudioVisualizationColumn.propTypes = {
  finishButton: PropTypes.bool.isRequired,
  isRtl: PropTypes.bool,
};

module.exports = StudioVisualizationColumn;
