import sinon from 'sinon';
import {MICROBIT_FIRMWARE_VERSION} from '@cdo/apps/lib/kits/maker/boards/microBit/MicroBitConstants';

export function boardSetupAndStub(board) {
  stubOpenSerialPort(board);
  sinon.stub(board.boardClient_, 'connectBoard').callsFake(() => {
    board.boardClient_.myPort = {write: () => {}};
    board.boardClient_.firmwareVersion = `Long String Includes ${MICROBIT_FIRMWARE_VERSION}`;
    sinon.stub(board.boardClient_.myPort, 'write');
  });
}

export function stubOpenSerialPort(board) {
  sinon.stub(board, 'openSerialPort').callsFake(() => {
    return Promise.resolve();
  });
}
