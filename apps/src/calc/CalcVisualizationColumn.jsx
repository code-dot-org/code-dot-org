import React from 'react';
import GameButtons from '../templates/GameButtons';
import BelowVisualization from '../templates/BelowVisualization';
import ProtectedVisualizationDiv from '../templates/ProtectedVisualizationDiv';

var CalcVisualizationColumn = function (props) {
  return (
    <span>
      <ProtectedVisualizationDiv>
        <svg version="1.1" id="svgCalc">
          <image
            id="background"
            height="400"
            width="400"
            x="0"
            y="0"
            xlinkHref="/blockly/media/skins/calc/background.png"
          />
          <g
            id="userExpression"
            className="expr"
            transform="translate(0, 100)"
          />
          <g
            id="answerExpression"
            className="expr"
            transform="translate(0, 350)"
          />
        </svg>
      </ProtectedVisualizationDiv>
      <GameButtons />
      <BelowVisualization />
    </span>
  );
};

export default CalcVisualizationColumn;
