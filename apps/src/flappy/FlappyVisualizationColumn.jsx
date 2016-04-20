var msg = require('../locale');

var GameButtons = require('../templates/GameButtons');
var BelowVisualization = require('../templates/BelowVisualization');
var ProtectedStatefulDiv = require('../templates/ProtectedStatefulDiv');

var FlappyVisualizationColumn = function (props) {
  // TODO - might be able to get rid of capacityBubble from this and every
  // other place that uses it
  return (
    <span>
      <ProtectedStatefulDiv id="visualization">
        <svg version="1.1" id="svgFlappy"/>
        <div id="capacityBubble">
          <div id="capacity"/>
        </div>
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

FlappyVisualizationColumn.propTypes = {
};

module.exports = FlappyVisualizationColumn;
