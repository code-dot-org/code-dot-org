import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import GameButtons from '../templates/GameButtons';
import ArrowButtons from '../templates/ArrowButtons';
import BelowVisualization from '../templates/BelowVisualization';
import * as gameLabConstants from './constants';
import CompletionButton from '../templates/CompletionButton';
import ProtectedVisualizationDiv from '../templates/ProtectedVisualizationDiv';
import VisualizationOverlay from '../templates/VisualizationOverlay';
import CrosshairOverlay from '../templates/CrosshairOverlay';
import TooltipOverlay, {coordinatesProvider} from '../templates/TooltipOverlay';
import i18n from '@cdo/locale';
import {toggleGridOverlay} from './actions';
import GridOverlay from './GridOverlay';
import {isPickingLocation} from './locationPickerModule';

const GAME_WIDTH = gameLabConstants.GAME_WIDTH;
const GAME_HEIGHT = gameLabConstants.GAME_HEIGHT;
const MODAL_Z_INDEX = 1050;

const styles = {
  containedInstructions: {
    marginTop: 10
  }
};

class GameLabVisualizationColumn extends React.Component {
  static propTypes = {
    finishButton: PropTypes.bool.isRequired,
    isShareView: PropTypes.bool.isRequired,
    awaitingContainedResponse: PropTypes.bool.isRequired,
    pickingLocation: PropTypes.bool.isRequired,
    showGrid: PropTypes.bool.isRequired,
    toggleShowGrid: PropTypes.func.isRequired
  };

  // Cache app-space mouse coordinates, which we get from the
  // VisualizationOverlay when they change.
  state = {
    mouseX: -1,
    mouseY: -1
  };

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
  }

  onMouseMove = (mouseX, mouseY) => this.setState({mouseX, mouseY});

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
  }

  renderGridCheckbox() {
    return (
      <div style={{textAlign: 'left'}} onClick={() => this.props.toggleShowGrid(!this.props.showGrid)}>
        <i id="grid-checkbox" className="fa fa-square-o" style={{width: 14}} />
        <span style={{marginLeft: 5}}>
          Show grid
        </span>
      </div>
    );
  }

  render() {
    const divGameLabStyle = {
      width: GAME_WIDTH,
      height: GAME_HEIGHT
    };
    if (this.props.pickingLocation) {
      divGameLabStyle.zIndex = MODAL_Z_INDEX;
    }
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

          {!this.props.isShareView && this.renderGridCheckbox()}
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
}

export default connect(state => ({
  isShareView: state.pageConstants.isShareView,
  awaitingContainedResponse: state.runState.awaitingContainedResponse,
  showGrid: state.gridOverlay,
  pickingLocation: isPickingLocation(state.locationPicker),
}), dispatch => ({
  toggleShowGrid: mode => dispatch(toggleGridOverlay(mode))
}))(GameLabVisualizationColumn);
