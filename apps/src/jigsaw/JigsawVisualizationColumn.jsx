var GameButtons = require('../templates/GameButtons');
var BelowVisualization = require('../templates/BelowVisualization');

/**
 * For jigsaw, this all ends up being hidden, but StudioApp still has expectation
 * about certain elements existing
 */
var JigsawVisualizationColumn = function (props) {
  return (
    <span>
      <div id="visualization">
      </div>
      <GameButtons hideRunButton={false}/>
      <BelowVisualization/>
    </span>
  );
};

JigsawVisualizationColumn.propTypes = {
};

module.exports = JigsawVisualizationColumn;
