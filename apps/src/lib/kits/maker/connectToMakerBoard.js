/**
 * @file Serialport scanning and board controller creation for Maker Toolkit.
 */
import {findPortWithViableDevice} from './portScanning';
import CircuitPlaygroundBoard from './CircuitPlaygroundBoard';

/**
 * Establish a connection to a maker board and return a controller for it.
 * @returns {Promise.<CircuitPlaygroundBoard>}}
 */
export default function connectToMakerBoard() {
  return Promise.resolve()
      .then(findPortWithViableDevice)
      .then(port => new CircuitPlaygroundBoard(port))
      .then(board => board.connect().then(() => board));
}
