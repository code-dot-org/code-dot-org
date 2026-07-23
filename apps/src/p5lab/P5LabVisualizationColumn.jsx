import Checkbox from '@code-dot-org/component-library/checkbox';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import Pointable from 'react-pointable';
import {connect} from 'react-redux';

import {takeEphemeralBlocklyFocus} from '@cdo/apps/blockly/utils';
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
    // If we don't release this, Blockly won't let anything else borrow focus
    // for the rest of the session.
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

  // The current crosshair position, rounded to whole pixels. The raw values
  // pick up floating-point noise from the screen-to-app-space conversion;
  // rounding here means everything downstream gets clean integers.
  currentCursor = () => ({
    x: Math.round(this.state.mouseX),
    y: Math.round(this.state.mouseY),
  });

  moveKeyboardCursorTo = (x, y) => {
    const clampedX = Math.max(0, Math.min(APP_WIDTH, x));
    const clampedY = Math.max(0, Math.min(APP_HEIGHT, y));
    this.props.updatePicker({x: clampedX, y: clampedY});
    // The synthetic mousemove inside syncCrosshairTo also updates
    // state.mouseX/mouseY, which is where the next arrow press reads from.
    this.syncCrosshairTo(clampedX, clampedY);
  };

  // Fakes a mousemove so the existing crosshair follows the keyboard cursor.
  // Saves us from building a second overlay just for keyboard mode.
  syncCrosshairTo = (x, y) => {
    if (!this.divGameLab) {
      return;
    }
    const rect = this.divGameLab.getBoundingClientRect();
    if (!rect.width || !rect.height) {
      return;
    }
    // Clamp here so a saved-but-out-of-range field value can't park the
    // crosshair off the playspace.
    const inBoundsX = Math.max(0, Math.min(APP_WIDTH, x));
    const inBoundsY = Math.max(0, Math.min(APP_HEIGHT, y));
    this.divGameLab.dispatchEvent(
      new MouseEvent('mousemove', {
        clientX: rect.left + (inBoundsX / APP_WIDTH) * rect.width,
        clientY: rect.top + (inBoundsY / APP_HEIGHT) * rect.height,
        bubbles: true,
      })
    );
  };

  confirmKeyboardPick = () => {
    // The field reads its value from UPDATE_LOCATION (not SELECT_LOCATION),
    // so we have to update first or the field won't change.
    const loc = this.currentCursor();
    this.props.updatePicker(loc);
    this.props.selectPicker(loc);
  };

  pickerKeyDown = e => {
    if (!this.props.pickingLocation) {
      return;
    }
    const step = e.shiftKey ? KEYBOARD_PICKER_BIG_STEP : KEYBOARD_PICKER_STEP;
    // Start from the current crosshair so the keyboard and the mouse always
    // agree on where the cursor is.
    const {x, y} = this.currentCursor();
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
        // The picker is a modal, so block Tab. Escape is the way out.
        action = () => {};
        break;
      case 'Escape':
        action = this.props.cancelPicker;
        break;
      case 'Enter':
      case ' ':
        // Ignore Enter for a moment after opening so the same keypress that
        // opened the picker doesn't immediately confirm it.
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
      // The grid checkbox also lives in a protected div (see GameButtons'
      // ProtectedStatefulDiv), so it never re-renders after mount. Sync its
      // checked state directly instead of relying on the checked prop.
      const gridCheckbox = document.getElementById('grid-checkbox');
      if (gridCheckbox) {
        gridCheckbox.checked = nextProps.showGrid;
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
    if (nextProps.pickingLocation !== this.props.pickingLocation) {
      this.applyPickerAttributes(nextProps.pickingLocation);
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.pickingLocation && !prevProps.pickingLocation) {
      this.releaseEphemeralFocus = takeEphemeralBlocklyFocus(this.divGameLab);
      if (!this.releaseEphemeralFocus && this.divGameLab) {
        this.divGameLab.focus();
      }
      this.seedCrosshairForPickerOpen();
    } else if (!this.props.pickingLocation && prevProps.pickingLocation) {
      if (this.releaseEphemeralFocus) {
        this.releaseEphemeralFocus();
        this.releaseEphemeralFocus = null;
      }
    }
  }

  // Where to place the crosshair when the picker opens, in priority order:
  //   1. The block's existing coordinates.
  //   2. Wherever the crosshair already is, if it's on the playspace.
  //   3. The center of the playspace.
  seedCrosshairForPickerOpen = () => {
    const {pickerLocation} = this.props;
    if (
      pickerLocation &&
      Number.isFinite(pickerLocation.x) &&
      Number.isFinite(pickerLocation.y)
    ) {
      this.syncCrosshairTo(pickerLocation.x, pickerLocation.y);
      return;
    }
    const {mouseX, mouseY} = this.state;
    const crosshairInBounds =
      mouseX >= 0 && mouseY >= 0 && mouseX <= APP_WIDTH && mouseY <= APP_HEIGHT;
    if (!crosshairInBounds) {
      this.syncCrosshairTo(APP_WIDTH / 2, APP_HEIGHT / 2);
    }
  };

  // Pointable lives inside a ProtectedStatefulDiv that never re-renders, so
  // we change its attributes and styles directly on the DOM node.
  applyPickerAttributes = picking => {
    if (this.divGameLab) {
      if (picking) {
        this.divGameLab.setAttribute('tabindex', '0');
        this.divGameLab.setAttribute('role', 'application');
        this.divGameLab.setAttribute(
          'aria-label',
          KEYBOARD_PICKER_INSTRUCTIONS
        );
        // A focused div has no visible outline by default — add one so
        // keyboard users can see where focus is.
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
      <Checkbox
        id="grid-checkbox"
        name="grid-checkbox"
        defaultChecked={this.props.showGrid}
        onChange={() => this.props.toggleShowGrid(!this.props.showGrid)}
        label={i18n.showGrid()}
      />
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
