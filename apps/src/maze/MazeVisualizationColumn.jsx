import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

import BelowVisualization from '../templates/BelowVisualization';
import GameButtons from '../templates/GameButtons';

import CollectorGemCounter from './CollectorGemCounter';
import mazeMsg from './locale';
import SpellingControls from './SpellingControls';
import Visualization from './Visualization';

const MazeVisualizationColumn = function (props) {
  return (
    <span>
      <Visualization />
      <GameButtons showFinishButton={props.showFinishButton}>
        <MuiButton
          id="stepButton"
          variant="outlined"
          color="secondary"
          size="medium"
          className={props.showStepButton ? undefined : 'hide'}
          startIcon={<FontAwesomeV6Icon iconName="forward-step" />}
        >
          {mazeMsg.step()}
        </MuiButton>
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
