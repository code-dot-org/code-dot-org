import React from 'react';
import msg from '@cdo/locale';

import GameButtons from '../templates/GameButtons';
import BelowVisualization from '../templates/BelowVisualization';
import ProtectedStatefulDiv from '../templates/ProtectedStatefulDiv';
import ArrowButtons from '../templates/ArrowButtons';
import ProtectedVisualizationDiv from '../templates/ProtectedVisualizationDiv';
import SwipePrompt from '@cdo/apps/templates/SwipePrompt';

var BounceVisualizationColumn = function () {
  return (
    <span>
      <ProtectedVisualizationDiv>
        <SwipePrompt />
        <svg version="1.1" id="svgBounce" />
      </ProtectedVisualizationDiv>
      <GameButtons>
        <ArrowButtons />

        {
          ' ' /* Explicitly insert whitespace so that this behaves like our ejs file*/
        }

        <ProtectedStatefulDiv id="share-cell-wrapper">
          <div id="share-cell" className="share-cell-none">
            <button type="button" id="finishButton" className="share">
              <img src="/blockly/media/1x1.gif" />
              {msg.finish()}
            </button>
          </div>
        </ProtectedStatefulDiv>
      </GameButtons>
      <BelowVisualization />
    </span>
  );
};

export default BounceVisualizationColumn;
