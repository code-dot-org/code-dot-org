import PropTypes from 'prop-types';
import React from 'react';

import GameButtons from '../../templates/GameButtons';
import BelowVisualization from '../../templates/BelowVisualization';
import ProtectedVisualizationDiv from '../../templates/ProtectedVisualizationDiv';
import SwipePrompt from '@cdo/apps/templates/SwipePrompt';

export default class CraftVisualizationColumn extends React.Component {
  static propTypes = {
    showScore: PropTypes.bool.isRequired
  };

  render() {
    return (
      <span>
        <ProtectedVisualizationDiv>
          <div id="minecraft-frame">
            <SwipePrompt useMinecraftStyling />
            <div id="code-connection-log" />
          </div>
        </ProtectedVisualizationDiv>
        <GameButtons />
        <BelowVisualization />
      </span>
    );
  }
}
