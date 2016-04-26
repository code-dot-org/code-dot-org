var msg = require('../locale');
var connect = require('react-redux').connect;

var GameButtons = require('../templates/GameButtons');
var ArrowButtons = require('../templates/ArrowButtons');
var BelowVisualization = require('../templates/BelowVisualization');
var ProtectedStatefulDiv = require('../templates/ProtectedStatefulDiv');

var GameLabVisualizationColumn = function (props) {
  return (
    <span>
      <ProtectedStatefulDiv id="visualization">
        <div id="divGameLab" tabIndex="1">
        </div>
      </ProtectedStatefulDiv>
      <GameButtons
          hideRunButton={false}
          instructionsInTopPane={props.instructionsInTopPane}>
        <div id="studio-dpad" className="studio-dpad-none">
          <button id="studio-dpad-button" className="arrow">
            <img src="/blockly/media/1x1.gif" className="dpad-btn icon21"/>
          </button>
        </div>

        <ArrowButtons/>

        {props.finishButton && <div id="share-cell" className="share-cell-none">
          <button id="finishButton" className="share">
            <img src="/blockly/media/1x1.gif"/>
            {msg.finish()}
          </button>
        </div>}
      </GameButtons>
      <BelowVisualization instructionsInTopPane={props.instructionsInTopPane}/>
    </span>
  );
};

GameLabVisualizationColumn.propTypes = {
  finishButton: React.PropTypes.bool.isRequired
};

module.exports = connect(function propsFromStore(state) {
  return {
    instructionsInTopPane: state.level.instructionsInTopPane
  };
})(GameLabVisualizationColumn);
