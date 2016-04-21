var msg = require('../locale');
var commonStyles = require('../commonStyles');

var GameButtons = require('../templates/GameButtons');
var ArrowButtons = require('../templates/ArrowButtons');
var BelowVisualization = require('../templates/BelowVisualization');

var BounceVisualizationColumn = function (props) {
  return (
    <span>
      <div id="visualization">
        <svg version="1.1" id="svgBounce"/>
        <div id="capacityBubble">
          <div id="capacity"/>
        </div>
      </div>
      <GameButtons hideRunButton={false}>
        <ArrowButtons/>

        {" " /* Explicitly insert whitespace so that this behaves like our ejs file*/}

        <div id="share-cell-wrapper">
          <div id="share-cell" className="share-cell-none">
            <button id="finishButton" className="share">
              <img src="/blockly/media/1x1.gif"/>
              {msg.finish()}
            </button>
          </div>
        </div>
      </GameButtons>
      <BelowVisualization/>
    </span>
  );
};

BounceVisualizationColumn.propTypes = {
};

module.exports = BounceVisualizationColumn;
