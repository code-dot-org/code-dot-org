import React, {PropTypes} from 'react';
import msg from '@cdo/locale';
import craftMsg from './locale';

import {default as GameButtons} from '../../templates/GameButtons';
import BelowVisualization from '../../templates/BelowVisualization';
import ArrowButtons from '../../templates/ArrowButtons';
import ProtectedVisualizationDiv from '../../templates/ProtectedVisualizationDiv';

export default class CraftVisualizationColumn extends React.Component {
  static propTypes = {
    showFinishButton: PropTypes.bool.isRequired,
    showScore: PropTypes.bool.isRequired
  };

  render() {
    return (
      <span>
        <ProtectedVisualizationDiv>
          <div id="minecraft-frame">
            <div id="phaser-game">
            </div>
            {this.props.showScore &&
              <div id="score-container">
                <div id="score-inner">
                  <span>{craftMsg.score()}: </span>
                  <span id="score-number">0</span>
                </div>
              </div>
            }
          </div>
        </ProtectedVisualizationDiv>
        <GameButtons>
          <ArrowButtons/>

          {this.props.showFinishButton && <div id="right-button-cell">
            <button id="rightButton" className="share mc-share-button">
              <div>{msg.finish()}</div>
            </button>
          </div>}
        </GameButtons>
        <BelowVisualization/>
      </span>
    );
  }
}
