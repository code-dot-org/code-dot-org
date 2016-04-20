var msg = require('../locale');

var GameButtons = require('../templates/GameButtons');
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
        <div id="soft-buttons" className="soft-buttons-none">
          <button id="leftButton" disabled className="arrow">
            <img src="/blockly/media/1x1.gif" className="left-btn icon21"/>
          </button>
          {" " /* Explicitly insert whitespace so that this behaves like our ejs file*/}
          <button id="rightButton" disabled className="arrow">
            <img src="/blockly/media/1x1.gif" className="right-btn icon21"/>
          </button>
          {" " /* Explicitly insert whitespace so that this behaves like our ejs file*/}
          <button id="upButton" disabled className="arrow">
            <img src="/blockly/media/1x1.gif" className="up-btn icon21"/>
          </button>
          {" " /* Explicitly insert whitespace so that this behaves like our ejs file*/}
          <button id="downButton" disabled className="arrow">
            <img src="/blockly/media/1x1.gif" className="down-btn icon21"/>
          </button>
        </div>
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
