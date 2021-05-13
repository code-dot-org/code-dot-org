import PropTypes from 'prop-types';
import React from 'react';
import Visualization from './Visualization';
import StepButton from './StepButton';
import SpellingControls from './SpellingControls';
import CollectorGemCounter from './CollectorGemCounter';
import GameButtons from '../templates/GameButtons';
import BelowVisualization from '../templates/BelowVisualization';

const MazeVisualizationColumn = function(props) {
  return (
    <span>
      <Visualization />
      <GameButtons showFinishButton={props.showFinishButton}>
        <StepButton showStepButton={props.showStepButton} />
        {props.showCollectorGemCounter && <CollectorGemCounter />}
        {props.showSpeedSlider && (
          <svg id="slider" version="1.1" width="150" height="50">
            {/* Slow icon. */}
            <clipPath id="slowClipPath">
              <rect width="26" height="12" x="5" y="14" />
            </clipPath>
            <image
              xlinkHref={props.iconPath}
              height="42"
              width="84"
              x="-21"
              y="-10"
              clipPath="url(#slowClipPath)"
            />
            {/* Fast icon. */}
            <clipPath id="fastClipPath">
              <rect width="26" height="16" x="120" y="10" />
            </clipPath>
            <image
              xlinkHref={props.iconPath}
              height="42"
              width="84"
              x="120"
              y="-11"
              clipPath="url(#fastClipPath)"
            />
          </svg>
        )}
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
  showSpeedSlider: PropTypes.bool.isRequired,
  iconPath: PropTypes.string.isRequired
};

export default MazeVisualizationColumn;
