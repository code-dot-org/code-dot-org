var msg = require('../locale');
var commonStyles = require('../commonStyles');

var GameButtons = require('../templates/GameButtons').default;
var ArrowButtons = require('../templates/ArrowButtons');
var BelowVisualization = require('../templates/BelowVisualization');
var ProtectedStatefulDiv = require('../templates/ProtectedStatefulDiv');

var BounceVisualizationColumn = function () {
  return (
    <span>
      <ProtectedStatefulDiv id="visualization">
        <svg version="1.1" id="svgBounce"/>
      </ProtectedStatefulDiv>
      <GameButtons>
        <ArrowButtons/>

        {" " /* Explicitly insert whitespace so that this behaves like our ejs file*/}

        <ProtectedStatefulDiv id="share-cell-wrapper">
          <div id="share-cell" className="share-cell-none">
            <button id="finishButton" className="share">
              <img src="/blockly/media/1x1.gif"/>
              {msg.finish()}
            </button>
          </div>
        </ProtectedStatefulDiv>
      </GameButtons>
      <BelowVisualization/>
    </span>
  );
};

module.exports = BounceVisualizationColumn;
