var React = require('react');
var msg = require('../locale');

var GameButtons = require('../templates/GameButtons').default;
var ArrowButtons = require('../templates/ArrowButtons');
var BelowVisualization = require('../templates/BelowVisualization');
import ProtectedVisualizationDiv from '../templates/ProtectedVisualizationDiv';

var StudioVisualizationColumn = function (props) {
  return (
    <span>
      <ProtectedVisualizationDiv>
        <svg version="1.1" id="svgStudio"/>
      </ProtectedVisualizationDiv>
      <GameButtons>
        <ArrowButtons/>

        {props.finishButton && <div id="share-cell" className="share-cell-none">
          <button id="finishButton" className="share">
            <img src="/blockly/media/1x1.gif"/>
            {msg.finish()}
          </button>
        </div>}
      </GameButtons>
      <BelowVisualization inputOutputTable={props.inputOutputTable}/>
    </span>
  );
};

StudioVisualizationColumn.propTypes = {
  finishButton: React.PropTypes.bool.isRequired,
  inputOutputTable: React.PropTypes.arrayOf(
    React.PropTypes.arrayOf(React.PropTypes.number)
  )
};

module.exports = StudioVisualizationColumn;
