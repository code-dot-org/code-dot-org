var React = require('react');
var msg = require('../locale');
var connect = require('react-redux').connect;

var GameButtons = require('../templates/GameButtons').default;
var ArrowButtons = require('../templates/ArrowButtons');
var BelowVisualization = require('../templates/BelowVisualization');
var gameLabConstants = require('./constants');
import ProtectedVisualizationDiv from '../templates/ProtectedVisualizationDiv';
import VisualizationOverlay from '../templates/VisualizationOverlay';
import CrosshairOverlay from '../templates/CrosshairOverlay';
import TooltipOverlay, {coordinatesProvider} from '../templates/TooltipOverlay';

var GAME_WIDTH = gameLabConstants.GAME_WIDTH;
var GAME_HEIGHT = gameLabConstants.GAME_HEIGHT;

var GameLabVisualizationColumn = function (props) {
  var divGameLabStyle = {
    width: GAME_WIDTH,
    height: GAME_HEIGHT
  };
  return (
    <span>
      <ProtectedVisualizationDiv>
        <div id="divGameLab" style={divGameLabStyle} tabIndex="1">
        </div>
        <VisualizationOverlay width={GAME_WIDTH} height={GAME_HEIGHT}>
          <CrosshairOverlay/>
          <TooltipOverlay providers={[coordinatesProvider()]}/>
        </VisualizationOverlay>
      </ProtectedVisualizationDiv>
      <GameButtons>
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
    instructionsInTopPane: state.pageConstants.instructionsInTopPane
  };
})(GameLabVisualizationColumn);
