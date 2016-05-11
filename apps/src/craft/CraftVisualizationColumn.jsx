var msg = require('../locale');

var GameButtons = require('../templates/GameButtons').default;
var BelowVisualization = require('../templates/BelowVisualization');
var ProtectedStatefulDiv = require('../templates/ProtectedStatefulDiv');

var CraftVisualizationColumn = function () {
  return (
    <span>
      <ProtectedStatefulDiv id="visualization">
        <div id="minecraft-frame">
          <div id="phaser-game">
          </div>
        </div>
      </ProtectedStatefulDiv>
      <GameButtons>
        <div id="right-button-cell">
          <button id="rightButton" className="share mc-share-button">
            <div>{msg.finish()}</div>
          </button>
        </div>
      </GameButtons>
      <BelowVisualization/>
    </span>
  );
};

module.exports = CraftVisualizationColumn;
