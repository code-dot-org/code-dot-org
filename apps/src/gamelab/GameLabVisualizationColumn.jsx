var React = require('react');
var msg = require('@cdo/locale');
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

var GameLabVisualizationColumn = React.createClass({
  propTypes: {
    finishButton: React.PropTypes.bool.isRequired,
    instructionsInTopPane: React.PropTypes.bool.isRequired,
    isShareView: React.PropTypes.bool.isRequired
  },

  getInitialState() {
    // Cache mouse coordinates in app-space, which we get from the
    // VisualizationOverlay when they change.
    return {
      mouseX: -1,
      mouseY: -1
    };
  },

  onMouseMove(mouseX, mouseY) {
    this.setState({mouseX, mouseY});
  },

  renderAppSpaceCoordinates() {
    const {mouseX, mouseY} = this.state;
    if (this.props.isShareView) {
      return null;
    } else if (mouseX < 0 || mouseY < 0 || mouseX > GAME_WIDTH || mouseY > GAME_HEIGHT) {
      // Render placeholder space so layout is stable.
      return <div>&nbsp;</div>;
    }
    return (
      <div>
        x: {Math.floor(mouseX)}, y: {Math.floor(mouseY)}
      </div>
    );
  },

  render() {
    const props = this.props;
    var divGameLabStyle = {
      width: GAME_WIDTH,
      height: GAME_HEIGHT
    };
    return (
      <span>
        <ProtectedVisualizationDiv>
          <div id="divGameLab" style={divGameLabStyle} tabIndex="1">
          </div>
          <VisualizationOverlay
            width={GAME_WIDTH}
            height={GAME_HEIGHT}
            onMouseMove={this.onMouseMove}
          >
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
        {this.renderAppSpaceCoordinates()}
        <BelowVisualization instructionsInTopPane={props.instructionsInTopPane}/>
      </span>
    );
  }
});

module.exports = connect(function propsFromStore(state) {
  return {
    instructionsInTopPane: state.pageConstants.instructionsInTopPane,
    isShareView: state.pageConstants.isShareView
  };
})(GameLabVisualizationColumn);
