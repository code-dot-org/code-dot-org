import {MICROBIT_FIRMWARE_VERSION} from '@cdo/apps/lib/kits/maker/boards/microBit/MicroBitConstants';

export function boardSetupAndStub(board) {
  stubOpenSerialPort(board);
  jest.spyOn(board.boardClient_, 'connectBoard').mockClear().mockImplementation(() => {
    board.boardClient_.myPort = {write: () => {}};
    board.boardClient_.firmwareVersion = `Long String Includes ${MICROBIT_FIRMWARE_VERSION}`;
    jest.spyOn(board.boardClient_.myPort, 'write').mockClear().mockImplementation();
  });
}

export function stubOpenSerialPort(board) {
  jest.spyOn(board, 'openWebSerial').mockClear().mockImplementation(() => {
    return Promise.resolve();
  });
}
