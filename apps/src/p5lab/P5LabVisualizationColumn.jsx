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
const KEYBOARD_PICKER_STEP = 10;
const KEYBOARD_PICKER_BIG_STEP = 50;
const KEYBOARD_PICKER_INSTRUCTIONS =
  'Location picker. Arrow keys to move (hold Shift for larger steps), Enter or Space to select, Escape to cancel.';
const PICKER_FOCUS_OUTLINE = '3px solid #0094ca';

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
    pickerLocation: PropTypes.shape({
      x: PropTypes.number,
      y: PropTypes.number,
    }),
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

  componentWillUnmount() {
    // Leaking ephemeral focus locks Blockly's FocusManager page-wide.
    if (this.releaseEphemeralFocus) {
      this.releaseEphemeralFocus();
      this.releaseEphemeralFocus = null;
    }
  }

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

  moveKeyboardCursorTo = (x, y) => {
    // Round so the field stores whole pixels and the next arrow press isn't
    // computed against a round-tripped float from VisualizationOverlay's
    // screen→app-space transform.
    const clampedX = Math.round(Math.max(0, Math.min(APP_WIDTH, x)));
    const clampedY = Math.round(Math.max(0, Math.min(APP_HEIGHT, y)));
    this.props.updatePicker({x: clampedX, y: clampedY});
    // syncCrosshairTo also feeds VisualizationOverlay's mousemove handler,
    // which updates this.state.mouseX/mouseY — that's where the next arrow
    // press reads its starting position from.
    this.syncCrosshairTo(clampedX, clampedY);
  };

  // Synthetic mousemove drives the existing CrosshairOverlay so it tracks the
  // keyboard cursor without needing its own overlay.
  syncCrosshairTo = (x, y) => {
    if (!this.divGameLab) {
      return;
    }
    const rect = this.divGameLab.getBoundingClientRect();
    if (!rect.width || !rect.height) {
      return;
    }
    this.divGameLab.dispatchEvent(
      new MouseEvent('mousemove', {
        clientX: rect.left + (x / APP_WIDTH) * rect.width,
        clientY: rect.top + (y / APP_HEIGHT) * rect.height,
        bubbles: true,
      })
    );
  };

  confirmKeyboardPick = () => {
    // The field subscribes to UPDATE_LOCATION, not SELECT_LOCATION, so we
    // must update before selecting.
    const loc = {
      x: Math.round(this.state.mouseX),
      y: Math.round(this.state.mouseY),
    };
    this.props.updatePicker(loc);
    this.props.selectPicker(loc);
  };

  pickerKeyDown = e => {
    if (!this.props.pickingLocation) {
      return;
    }
    const step = e.shiftKey ? KEYBOARD_PICKER_BIG_STEP : KEYBOARD_PICKER_STEP;
    // Start from the current crosshair position so keyboard and mouse share
    // one source of truth. Round to discard sub-pixel drift from the
    // screen→app-space transform.
    const x = Math.round(this.state.mouseX);
    const y = Math.round(this.state.mouseY);
    let action = null;
    switch (e.key) {
      case 'ArrowUp':
        action = () => this.moveKeyboardCursorTo(x, y - step);
        break;
      case 'ArrowDown':
        action = () => this.moveKeyboardCursorTo(x, y + step);
        break;
      case 'ArrowLeft':
        action = () => this.moveKeyboardCursorTo(x - step, y);
        break;
      case 'ArrowRight':
        action = () => this.moveKeyboardCursorTo(x + step, y);
        break;
      case 'Tab':
        // Trap Tab — the picker is modal, so Escape is the way out.
        action = () => {};
        break;
      case 'Escape':
        action = this.props.cancelPicker;
        break;
      case 'Enter':
      case ' ':
        // Swallow Enter key-repeat from the keystroke that opened the picker.
        if (
          Date.now() - this.props.requestTime <
          LOCATION_PICKER_CANCEL_THRESHOLD_MS
        ) {
          action = () => {};
        } else {
          action = this.confirmKeyboardPick;
        }
        break;
      default:
        return;
    }
    e.preventDefault();
    e.stopPropagation();
    action();
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
    if (nextProps.pickingLocation !== this.props.pickingLocation) {
      this.applyPickerAttributes(nextProps.pickingLocation);
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.pickingLocation && !prevProps.pickingLocation) {
      this.releaseEphemeralFocus = this.acquireEphemeralFocus(this.divGameLab);
      // Pick a starting point in priority order:
      //   1. The block's current coordinates (passed in via redux).
      //   2. The crosshair's current position if it's already valid.
      //   3. Center, as a last-resort fallback for keyboard-only sessions.
      const {pickerLocation} = this.props;
      const {mouseX, mouseY} = this.state;
      if (
        pickerLocation &&
        Number.isFinite(pickerLocation.x) &&
        Number.isFinite(pickerLocation.y)
      ) {
        this.syncCrosshairTo(pickerLocation.x, pickerLocation.y);
      } else if (
        mouseX < 0 ||
        mouseY < 0 ||
        mouseX > APP_WIDTH ||
        mouseY > APP_HEIGHT
      ) {
        this.syncCrosshairTo(APP_WIDTH / 2, APP_HEIGHT / 2);
      }
    } else if (!this.props.pickingLocation && prevProps.pickingLocation) {
      if (this.releaseEphemeralFocus) {
        this.releaseEphemeralFocus();
        this.releaseEphemeralFocus = null;
      }
    }
  }

  // ProtectedStatefulDiv blocks prop updates on the Pointable, so picker-mode
  // attributes/styles are applied imperatively.
  applyPickerAttributes = picking => {
    const visualizationOverlay = document.getElementById(
      'visualizationOverlay'
    );
    const zIndex = picking ? MODAL_Z_INDEX : 0;
    if (this.divGameLab) {
      this.divGameLab.style.zIndex = zIndex;
      if (picking) {
        this.divGameLab.setAttribute('tabindex', '0');
        this.divGameLab.setAttribute('role', 'application');
        this.divGameLab.setAttribute(
          'aria-label',
          KEYBOARD_PICKER_INSTRUCTIONS
        );
        // WCAG 2.4.7: divs have no native focus indicator.
        this.divGameLab.style.outline = PICKER_FOCUS_OUTLINE;
        this.divGameLab.style.outlineOffset = '-3px';
      } else {
        this.divGameLab.removeAttribute('tabindex');
        this.divGameLab.removeAttribute('role');
        this.divGameLab.removeAttribute('aria-label');
        this.divGameLab.style.outline = '';
        this.divGameLab.style.outlineOffset = '';
      }
    }
    if (visualizationOverlay) {
      visualizationOverlay.style.zIndex = zIndex;
    }
  };

  // takeEphemeralFocus stops Blockly's FocusManager from pulling focus back
  // to its workspace tree; the returned lambda restores focus on release.
  acquireEphemeralFocus = element => {
    const focusManager =
      typeof Blockly !== 'undefined' &&
      Blockly.FocusManager &&
      Blockly.FocusManager.getFocusManager &&
      Blockly.FocusManager.getFocusManager();
    if (focusManager && !focusManager.ephemeralFocusTaken()) {
      return focusManager.takeEphemeralFocus(element);
    }
    const previousFocus = document.activeElement;
    element.focus();
    return () => {
      if (previousFocus && typeof previousFocus.focus === 'function') {
        previousFocus.focus();
      }
    };
  };

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
    // Picker-mode attributes are set by applyPickerAttributes — see there.
    const divGameLabStyle = {
      touchAction: 'none',
      width: APP_WIDTH,
      height: APP_HEIGHT,
    };
    const isSpritelab = this.props.spriteLab;
    const showPauseButton = isSpritelab && !this.props.hidePauseButton;

    return (
      <div>
        <div style={{position: 'relative'}}>
          <ProtectedVisualizationDiv>
            <Pointable
              id="divGameLab"
              style={divGameLabStyle}
              onPointerMove={this.pickerPointerMove}
              onPointerUp={this.pickerPointerUp}
              elementRef={el => (this.divGameLab = el)}
              onMouseUp={this.pickerPointerUp}
              onKeyDown={this.pickerKeyDown}
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
        {this.props.pickingLocation && this.props.pickerLocation && (
          <div aria-live="polite" aria-atomic="true" style={styles.srOnly}>
            {`x ${this.props.pickerLocation.x}, y ${
              APP_HEIGHT - this.props.pickerLocation.y
            }`}
          </div>
        )}
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
  // Visually hidden but still announced by screen readers.
  srOnly: {
    position: 'absolute',
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    border: 0,
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
    pickerLocation: state.locationPicker.lastSelection,
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
