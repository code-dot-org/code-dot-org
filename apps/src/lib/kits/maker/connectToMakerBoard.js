/**
 * @file Serialport scanning and board controller creation for Maker Toolkit.
 */
import {getStore} from '../../../redux';
import {findPortWithViableDevice} from './portScanning';
import CircuitPlaygroundBoard from './CircuitPlaygroundBoard';
import {
  startConnecting,
  reportConnected,
  reportConnectionError,
} from './redux';

/**
 * Establish a connection to a maker board and return a controller for it.
 * @returns {Promise.<CircuitPlaygroundBoard>}}
 */
export default function connectToMakerBoard() {
  const store = getStore();
  const dispatch = store.dispatch.bind(store);
  let board;
  return Promise.resolve()
      .then(() => dispatch(startConnecting()))
      .then(findPortWithViableDevice)
      .then(foundPort => new CircuitPlaygroundBoard(foundPort))
      .then(newBoard => board = newBoard)
      .then(() => board.connect())
      .then(() => dispatch(reportConnected()))
      .then(() => board)
      .catch(() => {
        dispatch(reportConnectionError());
        throw new Error('Maker Toolkit was unable to connect to a board.');
      });
}

