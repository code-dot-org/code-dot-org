import React, {PropTypes} from 'react';

import GameButtons from '../../templates/GameButtons';
import BelowVisualization from '../../templates/BelowVisualization';
import ProtectedVisualizationDiv from '../../templates/ProtectedVisualizationDiv';

export default class CraftVisualizationColumn extends React.Component {
  static propTypes = {
    showScore: PropTypes.bool.isRequired
  };

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
}
