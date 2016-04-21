var msg = require('../locale');

var GameButtons = require('../templates/GameButtons');
var ArrowButtons = require('../templates/ArrowButtons');
var BelowVisualization = require('../templates/BelowVisualization');
var ProtectedStatefulDiv = require('../templates/ProtectedStatefulDiv');

var StudioVisualizationColumn = function (props) {
  return (
    <span>
      <ProtectedStatefulDiv id="visualization">
        <svg version="1.1" id="svgStudio"/>
        <div id="capacityBubble">
          <div id="capacity"/>
        </div>
      </ProtectedStatefulDiv>
      <GameButtons hideRunButton={false}>
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
