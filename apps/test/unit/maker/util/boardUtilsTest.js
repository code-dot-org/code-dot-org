import {
  detectBoardTypeFromPort,
  BOARD_TYPE,
} from '@cdo/apps/maker/util/boardUtils';

import {
  CIRCUIT_PLAYGROUND_EXPRESS_PORTS,
  CIRCUIT_PLAYGROUND_PORTS,
  FLORA_PORTS,
} from '../sampleSerialPorts';

describe('boardUtils', () => {
  describe(`detectBoardTypeFromPort()`, () => {
    it('sets the type of board detected for Classic boards', () => {
      expect(detectBoardTypeFromPort(CIRCUIT_PLAYGROUND_PORTS[0])).toBe(
        BOARD_TYPE.CLASSIC
      );
    });

    it('sets the type of board detected for Express boards', () => {
      expect(detectBoardTypeFromPort(CIRCUIT_PLAYGROUND_EXPRESS_PORTS[0])).toBe(
        BOARD_TYPE.EXPRESS
      );
    });

    it('sets the type of board detected for other boards', () => {
      expect(detectBoardTypeFromPort(FLORA_PORTS[0])).toBe(BOARD_TYPE.OTHER);
    });
  });
});
