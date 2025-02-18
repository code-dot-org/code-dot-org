import PropTypes from 'prop-types';
import React from 'react';

import BelowVisualization from '../templates/BelowVisualization';
import GameButtons from '../templates/GameButtons';

import CollectorGemCounter from './CollectorGemCounter';
import SpellingControls from './SpellingControls';
import StepButton from './StepButton';
import Visualization from './Visualization';

const MazeVisualizationColumn = function (props) {
  return (
    <span>
      <Visualization />
      <GameButtons showFinishButton={props.showFinishButton}>
        <StepButton showStepButton={props.showStepButton} />
        {props.showCollectorGemCounter && <CollectorGemCounter />}
      </GameButtons>
      {props.searchWord && <SpellingControls searchWord={props.searchWord} />}
      <BelowVisualization />
    </span>
  );
};

MazeVisualizationColumn.propTypes = {
  searchWord: PropTypes.string,
  showCollectorGemCounter: PropTypes.bool,
  showFinishButton: PropTypes.bool,
  showStepButton: PropTypes.bool.isRequired,
};

export default MazeVisualizationColumn;
