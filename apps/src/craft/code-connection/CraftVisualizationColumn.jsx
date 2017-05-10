import React from 'react';

import {default as GameButtons} from '../../templates/GameButtons';
import BelowVisualization from '../../templates/BelowVisualization';
import ProtectedVisualizationDiv from '../../templates/ProtectedVisualizationDiv';

export default React.createClass({
  propTypes: {
    showScore: React.PropTypes.bool.isRequired
  },

  render() {
    return (
      <span>
        <ProtectedVisualizationDiv>
          <div id="minecraft-frame">
            <div id="code-connection-log">
            </div>
          </div>
        </ProtectedVisualizationDiv>
        <GameButtons/>
        <BelowVisualization/>
      </span>
    );
  }
});
