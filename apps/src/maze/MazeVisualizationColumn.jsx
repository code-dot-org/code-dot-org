import React, {PropTypes} from 'react';
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
        <StepButton showStepButton={props.showStepButton} />
        {props.showCollectorGemCounter && <CollectorGemCounter />}
      </GameButtons>
      {props.searchWord && <SpellingControls searchWord={props.searchWord} />}
      <BelowVisualization />
    </span>
  );
};

MazeVisualizationColumn.propTypes = {
  showCollectorGemCounter: PropTypes.bool,
  showStepButton: PropTypes.bool.isRequired,
  searchWord: PropTypes.string
};

export default MazeVisualizationColumn;
