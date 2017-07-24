import React from 'react';
import Visualization from './Visualization';
import StepButton from './StepButton';
import SpellingControls from './SpellingControls';
import CollectorGemCounter from './CollectorGemCounter';
import GameButtons from '../templates/GameButtons';
import BelowVisualization from '../templates/BelowVisualization';

const MazeVisualizationColumn = function (props) {
  return (
    <span>
      <Visualization />
      <GameButtons>
        {props.showCollectorGemCounter && <CollectorGemCounter />}
        <StepButton showStepButton={props.showStepButton} />
      </GameButtons>
      {props.searchWord && <SpellingControls searchWord={props.searchWord} />}
      <BelowVisualization />
    </span>
  );
};

MazeVisualizationColumn.propTypes = {
  showCollectorGemCounter: React.PropTypes.bool,
  showStepButton: React.PropTypes.bool.isRequired,
  searchWord: React.PropTypes.string
};

export default MazeVisualizationColumn;
