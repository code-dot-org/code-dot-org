var React = require('react');
var connect = require('react-redux').connect;

var GameButtons = require('../templates/GameButtons').default;
var ArrowButtons = require('../templates/ArrowButtons');
var BelowVisualization = require('../templates/BelowVisualization');
var gameLabConstants = require('./constants');
import CompletionButton from '../templates/CompletionButton';
import ProtectedVisualizationDiv from '../templates/ProtectedVisualizationDiv';
import VisualizationOverlay from '../templates/VisualizationOverlay';
import CrosshairOverlay from '../templates/CrosshairOverlay';
import TooltipOverlay, {coordinatesProvider} from '../templates/TooltipOverlay';
import i18n from '@cdo/locale';
import {toggleGridOverlay} from './actions';
import GridOverlay from './GridOverlay';

var GAME_WIDTH = gameLabConstants.GAME_WIDTH;
var GAME_HEIGHT = gameLabConstants.GAME_HEIGHT;

const styles = {
  containedInstructions: {
    marginTop: 10
  }
};

var GameLabVisualizationColumn = React.createClass({
  propTypes: {
    finishButton: React.PropTypes.bool.isRequired,
    isShareView: React.PropTypes.bool.isRequired,
    awaitingContainedResponse: React.PropTypes.bool.isRequired,
    showGrid: React.PropTypes.bool.isRequired,
    toggleShowGrid: React.PropTypes.func.isRequired
  },

  getInitialState() {
    // Cache app-space mouse coordinates, which we get from the
    // VisualizationOverlay when they change.
    return {
      mouseX: -1,
      mouseY: -1
    };
  },

  componentWillReceiveProps(nextProps) {
    // Use jQuery to turn on and off the grid since it lives in a protected div
    if (nextProps.showGrid !== this.props.showGrid) {
      if (nextProps.showGrid) {
        $("#grid-checkbox")[0].className = "fa fa-check-square-o";
        $("#grid-overlay")[0].style.display = '';
      } else {
        $("#grid-checkbox")[0].className = "fa fa-square-o";
        $("#grid-overlay")[0].style.display = 'none';
      }
    }
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
        <span style={{display: 'inline-block', minWidth: '3.5em'}}>
          x: {Math.floor(mouseX)},
        </span>
        <span>
          y: {Math.floor(mouseY)}
        </span>
      </div>
    );
  },

  renderGridCheckbox() {
    return (
      <div onClick={() => this.props.toggleShowGrid(!this.props.showGrid)}>
        <i id="grid-checkbox" className="fa fa-square-o" style={{width: 14}} />
        <span style={{marginLeft: 5}}>
          Show grid
        </span>
      </div>
    );
  },

  render() {
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
            <GridOverlay show={this.props.showGrid} showWhileRunning={true} />
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

          <CompletionButton />

          {this.renderGridCheckbox()}
        </GameButtons>
        {this.renderAppSpaceCoordinates()}
        {this.props.awaitingContainedResponse && (
          <div style={styles.containedInstructions}>
            {i18n.predictionInstructions()}
          </div>
        )}
        <BelowVisualization />
      </span>
    );
  }
});

module.exports = connect(state => ({
  isShareView: state.pageConstants.isShareView,
  awaitingContainedResponse: state.runState.awaitingContainedResponse,
  showGrid: state.gridOverlay
}), dispatch => ({
  toggleShowGrid: mode => dispatch(toggleGridOverlay(mode))
}))(GameLabVisualizationColumn);
