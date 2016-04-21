var msg = require('../locale');

var GameButtons = require('../templates/GameButtons');
var BelowVisualization = require('../templates/BelowVisualization');
var ProtectedStatefulDiv = require('../templates/ProtectedStatefulDiv');

var styles = {
  invisible: {
    visibility: 'hidden'
  }
};

var EvalVisualizationColumn = function (props) {
  return (
    <span>
      <ProtectedStatefulDiv id="visualization">
        <svg version="1.1" id="svgEval">
          <image id="background" visibility="hidden" height="400" width="400" x="0" y="0"/>
          <g id="answer"/>
          <g id="user"/>
          <g id="test-call"/>
          <g id="test-result"/>
        </svg>
      </ProtectedStatefulDiv>
      <GameButtons hideRunButton={false}>
        <button id="continueButton" className="launch hide float-right">
          <img src="/blockly/media/1x1.gif"/>
          {msg.continue()}
        </button>
      </GameButtons>
      <BelowVisualization/>
    </span>
  );
};

EvalVisualizationColumn.propTypes = {
};

module.exports = EvalVisualizationColumn;
