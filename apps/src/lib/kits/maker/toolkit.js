/*
 * @file Static interface to Maker Toolkit, to simplify App Lab code interfacing
 * with maker and provide clean setup/cancel/reset patterns.
 */
import {getStore} from '../../../redux';
import trackEvent from '../../../util/trackEvent';
import CircuitPlaygroundBoard from './boards/circuitPlayground/CircuitPlaygroundBoard';
import FakeBoard from './boards/FakeBoard';
import * as commands from './commands';
import dropletConfig, {
  configMicrobit,
  configCircuitPlayground
} from './dropletConfig';
import MakerError, {
  ConnectionCanceledError,
  UnsupportedBrowserError,
  wrapKnownMakerErrors
} from './MakerError';
import {findPortWithViableDevice} from './portScanning';
import * as redux from './redux';
import {isChrome, gtChrome33, isCodeOrgBrowser} from './util/browserChecks';
import MicroBitBoard from './boards/microBit/MicroBitBoard';
import project from '../../../code-studio/initApp/project';
import {MB_API} from './boards/microBit/MicroBitConstants';

// Re-export some modules so consumers only need this 'toolkit' module
export {dropletConfig, configMicrobit, configCircuitPlayground, MakerError};

/**
 * @type {CircuitPlaygroundBoard} The current board controller, populated when
 * connected, null when not connected.  There can be only one at any time.
 */
let currentBoard = null;

/**
 * Enable Maker Toolkit for the current level.
 */
export function enable() {
  if (!redux.isAvailable(getStore().getState())) {
    throw new MakerError(
      'Maker cannot be enabled: Its reducer was not registered.'
    );
  }
  getStore().dispatch(redux.enable());
}

/**
 * Called when starting execution of the student app.
 * Looks for a connected board, sets up an appropriate board controller,
 * and injects needed references into the interpreter and its commands.
 * @param {JSInterpreter} interpreter
 * @param {function} onDisconnect
 * @return {Promise}
 *   Resolves (with no value) when connection is successful and the board
 *   controller is ready to use.
 *   Rejects with a MakerError when the connection process is cancelled or
 *   fails in an expected way that we handle gracefully (for example, no board
 *   plugged in).
 *   Rejects with another error type if something unexpected happens.
 */
export function connect({interpreter, onDisconnect}) {
  if (!redux.isEnabled(getStore().getState())) {
    return Promise.reject(
      new Error(
        'Attempted to connect to a maker board, ' +
          'but Maker Toolkit is not enabled.'
      )
    );
  }

  if (currentBoard) {
    commands.injectBoardController(currentBoard);
    currentBoard.installOnInterpreter(interpreter);
    // When the board is reset, the components are disabled. Re-enable now.
    currentBoard.enableComponents();
    return Promise.resolve();
  }

  const store = getStore();
  const dispatch = store.dispatch.bind(store);
  dispatch(redux.startConnecting());

  return confirmSupportedBrowser()
    .then(getBoard)
    .then(board => {
      if (!isConnecting()) {
        // Must've called reset() - exit the promise chain.
        return Promise.reject(new ConnectionCanceledError());
      }
      currentBoard = board;
      return currentBoard.connect();
    })
    .then(() => {
      if (!isConnecting()) {
        // Must've called reset() - exit the promise chain.
        return Promise.reject(new ConnectionCanceledError());
      }
      commands.injectBoardController(currentBoard);
      currentBoard.installOnInterpreter(interpreter);
      if (typeof onDisconnect === 'function') {
        currentBoard.once('disconnect', () => {
          onDisconnect();
          disconnect();
        });
      }
      dispatch(redux.reportConnected());
      trackEvent('Maker', 'ConnectionSuccess');
    })
    .catch(error => {
      if (error instanceof ConnectionCanceledError) {
        // This was intentional, and we don't need an error screen.
        return Promise.reject(error);
      } else {
        // Something went wrong, so show the error screen.
        error = wrapKnownMakerErrors(error);
        dispatch(redux.reportConnectionError(error));
        trackEvent('Maker', 'ConnectionError');
        return Promise.reject(error);
      }
    });
}

/**
 * Called when the board disconnects
 * Throw away reference to the currentBoard, so that next time we run
 * we make a new board.
 */
function disconnect() {
  if (!redux.isEnabled(getStore().getState())) {
    return;
  }

  const setDisconnected = () => {
    currentBoard = null;
    getStore().dispatch(redux.disconnect);
  };
  if (currentBoard) {
    currentBoard.destroy().then(setDisconnected);
  } else {
    setDisconnected();
  }
}

/**
 * Check that we are using a supported browser
 * @returns {Promise}
 */
function confirmSupportedBrowser() {
  if (isCodeOrgBrowser() || (isChrome() && gtChrome33())) {
    return Promise.resolve();
  } else {
    return Promise.reject(new UnsupportedBrowserError('Unsupported browser'));
  }
}

/**
 * Create a board controller attached to an available board (or Fake board, if
 * appropriate).
 * @returns {Promise.<MakerBoard>}
 */
function getBoard() {
  if (shouldRunWithFakeBoard()) {
    return Promise.resolve(new FakeBoard());
  } else {
    if (project.getMakerAPIs() === MB_API) {
      return findPortWithViableDevice().then(port => new MicroBitBoard(port));
    } else {
      return findPortWithViableDevice().then(
        port => new CircuitPlaygroundBoard(port)
      );
    }
  }
}

function isConnecting() {
  return redux.isConnecting(getStore().getState());
}

function shouldRunWithFakeBoard() {
  return redux.shouldRunWithFakeBoard(getStore().getState());
}

/**
 * Called when execution of the student app ends.
 * Resets the board state and puts maker UI back in a default state.
 */
export function reset() {
  if (currentBoard) {
    currentBoard.reset();
  }
}
