var msg = require('../locale');

var GameButtons = require('../templates/GameButtons');
var BelowVisualization = require('../templates/BelowVisualization');
var ProtectedStatefulDiv = require('../templates/ProtectedStatefulDiv');

var FlappyVisualizationColumn = function () {
  return (
    <span>
      <ProtectedStatefulDiv id="visualization">
        <svg version="1.1" id="svgFlappy"/>
      </ProtectedStatefulDiv>
      <GameButtons hideRunButton={false}>
        <div id="right-button-cell">
          <button id="rightButton" className="share">
            <img src="/blockly/media/1x1.gif"/>
            {msg.finish()}
          </button>
        </div>
      </GameButtons>
      <BelowVisualization/>
    </span>
  );
};

module.exports = FlappyVisualizationColumn;
