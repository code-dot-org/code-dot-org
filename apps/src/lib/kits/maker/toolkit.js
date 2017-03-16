/*
 * @file Static interface to Maker Toolkit, to simplify App Lab code interfacing
 * with maker and provide clean setup/cancel/reset patterns.
 */
import codegen from '../../../codegen';
import {getStore} from '../../../redux';
import CircuitPlaygroundBoard from './CircuitPlaygroundBoard';
import * as commands from './commands';
import {findPortWithViableDevice} from './portScanning';
import * as redux from './redux';

/**
 * @type {CircuitPlaygroundBoard} The current board controller, populated when
 * connected, null when not connected.  There can be only one at any time.
 */
let currentBoard = null;

/**
 * Enable Maker Toolkit for the current level.
 */
export function enable() {
  getStore().dispatch(redux.enable());
}

/**
 * @returns {boolean} whether Maker Toolkit is enabled for the current level
 */
export function isEnabled() {
  return redux.isEnabled(getStore().getState());
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
 *   Resolves immediately if maker toolkit is disabled.
 *   Rejects...
 * TODO Describe this better
 */
export function connect({interpreter, onDisconnect}) {
  if (!isEnabled()) {
    return Promise.resolve();
  }

  if (currentBoard) {
    return Promise.reject(new Error('Attempted to connect Maker Toolkit when ' +
        'an existing board is already connected.'));
  }

  const store = getStore();
  const dispatch = store.dispatch.bind(store);
  dispatch(redux.startConnecting());

  return findPortWithViableDevice()
      .then(port => {
        // TODO: Reject if trying to cancel.
        currentBoard = new CircuitPlaygroundBoard(port);
        return currentBoard.connect();
      })
      .then(() => {
        // TODO: Reject if trying to cancel.
        commands.injectBoardController(currentBoard);
        currentBoard.installOnInterpreter(codegen, interpreter);
        if (typeof onDisconnect === 'function') {
          currentBoard.once('disconnect', onDisconnect);
        }
        dispatch(redux.reportConnected());
      })
      .catch(() => {
        // TODO: Handle cancellation differently from other errors.
        // Still reject in both cases though, so the resulting code
        // doesn't continue to the next step (running the interpreter)
        dispatch(redux.reportConnectionError());
        return Promise.reject(new Error('Maker Toolkit was unable to connect to a board.'));
      });
}

/**
 * Called when execution of the student app ends.
 * Resets the board state, disconnects and destroys the current board controller,
 * and puts maker UI back in a default state.
 */
export function reset() {
  if (!isEnabled()) {
    return;
  }

  if (currentBoard) {
    currentBoard.destroy();
    currentBoard = null;
  }
  getStore().dispatch(redux.disconnect());
}
