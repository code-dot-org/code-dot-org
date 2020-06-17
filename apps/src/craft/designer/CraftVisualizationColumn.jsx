import PropTypes from 'prop-types';
import React from 'react';
import msg from '@cdo/locale';
import craftMsg from '../locale';

import {default as GameButtons} from '../../templates/GameButtons';
import BelowVisualization from '../../templates/BelowVisualization';
import ArrowButtons from '../../templates/ArrowButtons';
import ProtectedVisualizationDiv from '../../templates/ProtectedVisualizationDiv';
import SwipePrompt from '@cdo/apps/templates/SwipePrompt';

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
            <SwipePrompt useMinecraftStyling />
            <div id="phaser-game" />
            {this.props.showScore && (
              <div id="score-container">
                <div id="score-inner">
                  <span>{craftMsg.score()}: </span>
                  <span id="score-number">0</span>
                </div>
              </div>
            )}
          </div>
        </ProtectedVisualizationDiv>
        <GameButtons>
          <ArrowButtons />

          {this.props.showFinishButton && (
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
  }
}
