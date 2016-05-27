var React = require('react');
var Visualization = require('./Visualization');
var StepButton = require('./StepButton');
var SpellingControls = require('./SpellingControls');
var GameButtons = require('../templates/GameButtons').default;
var BelowVisualization = require('../templates/BelowVisualization');

var MazeVisualizationColumn = function (props) {
  return (
    <span>
      <Visualization/>
      <GameButtons>
        <StepButton showStepButton={props.showStepButton}/>
      </GameButtons>
      {props.searchWord && <SpellingControls searchWord={props.searchWord}/>}
      <BelowVisualization/>
    </span>
  );
};

MazeVisualizationColumn.propTypes = {
  showStepButton: React.PropTypes.bool.isRequired,
  searchWord: React.PropTypes.string
};

module.exports = MazeVisualizationColumn;
