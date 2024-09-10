import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import Pointable from 'react-pointable';
import {connect} from 'react-redux';

import ArrowButtons from '@cdo/apps/templates/ArrowButtons';
import BelowVisualization from '@cdo/apps/templates/BelowVisualization';
import CompletionButton from '@cdo/apps/templates/CompletionButton';
import CrosshairOverlay from '@cdo/apps/templates/CrosshairOverlay';
import GameButtons from '@cdo/apps/templates/GameButtons';
import PauseButton from '@cdo/apps/templates/PauseButton';
import ProtectedStatefulDiv from '@cdo/apps/templates/ProtectedStatefulDiv';
import ProtectedVisualizationDiv from '@cdo/apps/templates/ProtectedVisualizationDiv';
import TooltipOverlay, {
  coordinatesProvider,
} from '@cdo/apps/templates/TooltipOverlay';
import VisualizationOverlay from '@cdo/apps/templates/VisualizationOverlay';
import {isMobileDevice} from '@cdo/apps/util/browser-detector';
import {calculateOffsetCoordinates} from '@cdo/apps/utils';
import i18n from '@cdo/locale';

import {toggleGridOverlay} from './actions';
import {APP_HEIGHT, APP_WIDTH} from './constants';
import {GAMELAB_DPAD_CONTAINER_ID} from './gamelab/constants';
import GridOverlay from './gamelab/GridOverlay';
import {
  cancelLocationSelection,
  selectLocation,
  updateLocation,
  isPickingLocation,
} from './redux/locationPicker';
import SpritelabInput from './spritelab/SpritelabInput';
import TextConsole from './spritelab/TextConsole';

const MODAL_Z_INDEX = 1050;
const LOCATION_PICKER_CANCEL_THRESHOLD_MS = 250;

class P5LabVisualizationColumn extends React.Component {
  static propTypes = {
    finishButton: PropTypes.bool.isRequired,
    pauseHandler: PropTypes.func.isRequired,
    hidePauseButton: PropTypes.bool.isRequired,
    onPromptAnswer: PropTypes.func,

    // From redux
    isResponsive: PropTypes.bool.isRequired,
    isShareView: PropTypes.bool.isRequired,
    isProjectLevel: PropTypes.bool.isRequired,
    spriteLab: PropTypes.bool.isRequired,
    awaitingContainedResponse: PropTypes.bool.isRequired,
    pickingLocation: PropTypes.bool.isRequired,
    requestTime: PropTypes.number,
    showGrid: PropTypes.bool.isRequired,
    toggleShowGrid: PropTypes.func.isRequired,
    cancelPicker: PropTypes.func.isRequired,
    selectPicker: PropTypes.func.isRequired,
    updatePicker: PropTypes.func.isRequired,
    consoleMessages: PropTypes.array.isRequired,
    isRtl: PropTypes.bool,
  };

  // Cache app-space mouse coordinates, which we get from the
  // VisualizationOverlay when they change.
  state = {
    mouseX: -1,
    mouseY: -1,
  };

  pickerPointerMove = e => {
    if (this.props.pickingLocation) {
      this.props.updatePicker(
        calculateOffsetCoordinates(
          this.divGameLab,
          Math.floor(e.clientX),
          Math.floor(e.clientY)
        )
      );
    }
  };

  pickerPointerUp = e => {
    if (this.props.pickingLocation) {
      // Workaround to make sure location picker works for iOS tablets. These devices are not triggering onPointerMove
      // events, so the location was never getting updated.
      if (isMobileDevice()) {
        this.props.updatePicker(
          calculateOffsetCoordinates(this.divGameLab, e.clientX, e.clientY)
        );
      }
      this.props.selectPicker(
        calculateOffsetCoordinates(this.divGameLab, e.clientX, e.clientY)
      );
    }
  };

  UNSAFE_componentWillReceiveProps(nextProps) {
    // Use jQuery to turn on and off the grid since it lives in a protected div
    if (nextProps.showGrid !== this.props.showGrid) {
      if (nextProps.showGrid) {
        $('#grid-overlay')[0].style.display = '';
      } else {
        $('#grid-overlay')[0].style.display = 'none';
      }
    }
    // Also manually raise/lower the zIndex of the playspace when selecting a
    // location because of the protected div
    const zIndex = nextProps.pickingLocation ? MODAL_Z_INDEX : 0;
    const visualizationOverlay = document.getElementById(
      'visualizationOverlay'
    );
    this.divGameLab.style.zIndex = zIndex;
    visualizationOverlay.style.zIndex = zIndex;
  }

  onMouseMove = (mouseX, mouseY) => this.setState({mouseX, mouseY});

  renderAppSpaceCoordinates() {
    const {mouseX, mouseY} = this.state;
    if (this.props.isShareView) {
      return null;
    } else if (
      mouseX < 0 ||
      mouseY < 0 ||
      mouseX > APP_WIDTH ||
      mouseY > APP_HEIGHT
    ) {
      // Render placeholder space so layout is stable.
      return <div>&nbsp;</div>;
    }
    return (
      <div>
        <span style={{display: 'inline-block', minWidth: '3.5em'}}>
          x: {Math.floor(mouseX)},
        </span>
        <span>y: {Math.floor(mouseY)}</span>
      </div>
    );
  }

  renderGridCheckbox() {
    return (
      <div>
        <label style={styles.checkboxLabel}>
          <input
            id="grid-checkbox"
            type="checkbox"
            onChange={() => this.props.toggleShowGrid(!this.props.showGrid)}
            style={styles.checkbox}
          />
          {i18n.showGrid()}
        </label>
      </div>
    );
  }
  render() {
    const {isResponsive, isShareView, isRtl} = this.props;
    const divGameLabStyle = {
      touchAction: 'none',
      width: APP_WIDTH,
      height: APP_HEIGHT,
    };
    if (this.props.pickingLocation) {
      divGameLabStyle.zIndex = MODAL_Z_INDEX;
    }
    const isSpritelab = this.props.spriteLab;
    const showPauseButton = isSpritelab && !this.props.hidePauseButton;

    return (
      <div>
        <div style={{position: 'relative'}}>
          <ProtectedVisualizationDiv>
            <Pointable
              id="divGameLab"
              style={divGameLabStyle}
              tabIndex="1"
              onPointerMove={this.pickerPointerMove}
              onPointerUp={this.pickerPointerUp}
              elementRef={el => (this.divGameLab = el)}
              onMouseUp={this.pickerPointerUp}
            />
            <VisualizationOverlay
              width={APP_WIDTH}
              height={APP_HEIGHT}
              onMouseMove={this.onMouseMove}
            >
              <GridOverlay show={this.props.showGrid} showWhileRunning={true} />
              <CrosshairOverlay flip={isSpritelab} />
              <TooltipOverlay
                providers={[coordinatesProvider(isSpritelab, isRtl)]}
              />
            </VisualizationOverlay>
          </ProtectedVisualizationDiv>
          <TextConsole consoleMessages={this.props.consoleMessages} />
          {isSpritelab && (
            <SpritelabInput onPromptAnswer={this.props.onPromptAnswer} />
          )}
        </div>

        <GameButtons>
          {showPauseButton && (
            <PauseButton
              pauseHandler={this.props.pauseHandler}
              marginRight={isShareView ? 10 : 0}
            />
          )}
          <ArrowButtons />

          <CompletionButton />

          {!isSpritelab && !isShareView && this.renderGridCheckbox()}
        </GameButtons>
        {!isSpritelab && this.renderAppSpaceCoordinates()}
        <ProtectedStatefulDiv
          id={GAMELAB_DPAD_CONTAINER_ID}
          className={classNames({responsive: isResponsive})}
        />
        {this.props.awaitingContainedResponse && (
          <div style={styles.containedInstructions}>
            {i18n.predictionInstructions()}
          </div>
        )}
        <BelowVisualization />
        {this.props.pickingLocation && (
          <div
            className={'modal-backdrop'}
            onClick={() => {
              // On some mobile devices, we get a duplicate click event that
              // would cancel the location picker immediately. Throttle canceling
              // with a time threshold to avoid this issue.
              if (
                Date.now() - this.props.requestTime <
                LOCATION_PICKER_CANCEL_THRESHOLD_MS
              ) {
                return;
              }
              this.props.cancelPicker();
            }}
          />
        )}
      </div>
    );
  }
}

const styles = {
  containedInstructions: {
    marginTop: 10,
  },
  selectStyle: {
    width: APP_WIDTH,
  },
  checkbox: {
    flex: 'none',
    marginBottom: 3,
    marginRight: 4,
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    fontSize: 13,
  },
};

export default connect(
  state => ({
    isResponsive: state.pageConstants.isResponsive,
    isShareView: state.pageConstants.isShareView,
    isProjectLevel: state.pageConstants.isProjectLevel,
    spriteLab: state.pageConstants.isBlockly,
    awaitingContainedResponse: state.runState.awaitingContainedResponse,
    showGrid: state.gridOverlay,
    pickingLocation: isPickingLocation(state.locationPicker),
    requestTime: state.locationPicker.requestTime,
    consoleMessages: state.textConsole,
    isRtl: state.isRtl,
  }),
  dispatch => ({
    toggleShowGrid: mode => dispatch(toggleGridOverlay(mode)),
    cancelPicker: () => dispatch(cancelLocationSelection()),
    updatePicker: loc => dispatch(updateLocation(loc)),
    selectPicker: loc => dispatch(selectLocation(loc)),
  })
)(P5LabVisualizationColumn);
