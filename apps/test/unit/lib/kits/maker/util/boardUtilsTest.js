import {expect} from '../../../../../util/deprecatedChai';
import {BOARD_TYPE} from '@cdo/apps/lib/kits/maker/boards/circuitPlayground/CircuitPlaygroundBoard';
import {
  CIRCUIT_PLAYGROUND_EXPRESS_PORTS,
  CIRCUIT_PLAYGROUND_PORTS,
  FLORA_PORTS
} from '../sampleSerialPorts';
import {detectBoardTypeFromPort} from '@cdo/apps/lib/kits/maker/util/boardUtils';

describe('boardUtils', () => {
  describe(`detectBoardTypeFromPort()`, () => {
    it('sets the type of board detected for Classic boards', () => {
      expect(detectBoardTypeFromPort(CIRCUIT_PLAYGROUND_PORTS[0])).to.equal(
        BOARD_TYPE.CLASSIC
      );
    });

    it('sets the type of board detected for Express boards', () => {
      expect(
        detectBoardTypeFromPort(CIRCUIT_PLAYGROUND_EXPRESS_PORTS[0])
      ).to.equal(BOARD_TYPE.EXPRESS);
    });

    it('sets the type of board detected for other boards', () => {
      expect(detectBoardTypeFromPort(FLORA_PORTS[0])).to.equal(
        BOARD_TYPE.OTHER
      );
    });
  });
});
