import VirtualCPBoard from '@cdo/apps/maker/boards/VirtualCPBoard';

import {expect} from '../../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports
import {itImplementsTheMakerBoardInterface} from '../MakerBoardInterfaceTestUtil';

import {itMakesCircuitPlaygroundComponentsAvailable} from './CircuitPlaygroundComponentTestUtil';

describe('VirtualCPBoard', () => {
  // Test coverage for Circuit Playground Maker Board Interface
  itImplementsTheMakerBoardInterface(VirtualCPBoard);
  itMakesCircuitPlaygroundComponentsAvailable(VirtualCPBoard);

  describe(`boardConnected()`, () => {
    it('always returns false', () => {
      const board = new VirtualCPBoard();
      expect(board.boardConnected()).to.be.false;
      return board.connect().then(() => {
        expect(board.boardConnected()).to.be.false;
        board.destroy();
        expect(board.boardConnected()).to.be.false;
      });
    });
  });
});
