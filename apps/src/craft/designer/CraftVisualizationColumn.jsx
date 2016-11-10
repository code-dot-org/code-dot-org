import React from 'react';
import msg from '@cdo/locale';

import {default as GameButtons} from '../../templates/GameButtons';
import BelowVisualization from '../../templates/BelowVisualization';
import ArrowButtons from '../../templates/ArrowButtons';
import ProtectedVisualizationDiv from '../../templates/ProtectedVisualizationDiv';

export default React.createClass({
  render() {
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
  }
});
