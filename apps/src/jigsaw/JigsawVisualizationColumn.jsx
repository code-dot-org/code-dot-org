var GameButtons = require('../templates/GameButtons').default;
var BelowVisualization = require('../templates/BelowVisualization');

/**
 * For jigsaw, this all ends up being hidden, but StudioApp still has expectation
 * about certain elements existing
 */
var JigsawVisualizationColumn = function () {
  return (
    <span>
      <div id="visualization">
      </div>
      <GameButtons/>
      <BelowVisualization/>
    </span>
  );
};

module.exports = JigsawVisualizationColumn;
