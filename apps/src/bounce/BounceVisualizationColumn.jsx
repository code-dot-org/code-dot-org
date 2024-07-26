import React from 'react';

var msg = require('@cdo/locale');

// Disabling import order in order to add require statements first
// Require statements can change behavior based on the order they are called.
// This might be safe to remove but needs investigation whether any behavior is changed by order.
/* eslint-disable import/order */
var GameButtons = require('../templates/GameButtons').default;
var BelowVisualization = require('../templates/BelowVisualization');
var ProtectedStatefulDiv = require('../templates/ProtectedStatefulDiv');

import ArrowButtons from '../templates/ArrowButtons';
import ProtectedVisualizationDiv from '../templates/ProtectedVisualizationDiv';

import SwipePrompt from '@cdo/apps/templates/SwipePrompt';
/* eslint-enable import/order */

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
              <img src="/blockly/media/1x1.gif" alt="" />
              {msg.finish()}
            </button>
          </div>
        </ProtectedStatefulDiv>
      </GameButtons>
      <BelowVisualization />
    </span>
  );
};

module.exports = BounceVisualizationColumn;
