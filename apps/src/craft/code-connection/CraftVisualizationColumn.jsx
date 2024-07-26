import PropTypes from 'prop-types';
import React from 'react';

import BelowVisualization from '../../templates/BelowVisualization';
import GameButtons from '../../templates/GameButtons';
import ProtectedVisualizationDiv from '../../templates/ProtectedVisualizationDiv';

export default class CraftVisualizationColumn extends React.Component {
  static propTypes = {
    showScore: PropTypes.bool.isRequired,
  };

  render() {
    return (
      <span>
        <ProtectedVisualizationDiv>
          <div id="minecraft-frame">
            <div id="code-connection-log" />
          </div>
        </ProtectedVisualizationDiv>
        <GameButtons />
        <BelowVisualization />
      </span>
    );
  }
}
