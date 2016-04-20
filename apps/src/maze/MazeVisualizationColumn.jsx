var Visualization = require('./Visualization');
var StepButton = require('./StepButton');
var SpellingControls = require('./SpellingControls');
var GameButtons = require('../templates/GameButtons');
var BelowVisualization = require('../templates/BelowVisualization');

var MazeVisualizationColumn = function (props) {
  return (
    <span>
      <Visualization/>
      <GameButtons hideRunButton={props.hideRunButton}>
        <StepButton showStepButton={props.showStepButton}/>
      </GameButtons>
      {props.searchWord && <SpellingControls searchWord={props.searchWord}/>}
      <BelowVisualization/>
    </span>
  );
};

MazeVisualizationColumn.propTypes = {
  hideRunButton: React.PropTypes.bool.isRequired,
  showStepButton: React.PropTypes.bool.isRequired,
  searchWord: React.PropTypes.string
};

module.exports = MazeVisualizationColumn;
