import {itImplementsTheMakerBoardInterface} from '../MakerBoardInterfaceTestUtil';
import VirtualCPBoard from '@cdo/apps/lib/kits/maker/boards/VirtualCPBoard';
import {expect} from '../../../../../../util/reconfiguredChai';
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
