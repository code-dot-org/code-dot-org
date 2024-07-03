import VirtualCPBoard from '@cdo/apps/lib/kits/maker/boards/VirtualCPBoard';


import {itImplementsTheMakerBoardInterface} from '../MakerBoardInterfaceTestUtil';

import {itMakesCircuitPlaygroundComponentsAvailable} from './CircuitPlaygroundComponentTestUtil';

describe('VirtualCPBoard', () => {
  // Test coverage for Circuit Playground Maker Board Interface
  itImplementsTheMakerBoardInterface(VirtualCPBoard);
  itMakesCircuitPlaygroundComponentsAvailable(VirtualCPBoard);

  describe(`boardConnected()`, () => {
    it('always returns false', () => {
      const board = new VirtualCPBoard();
      expect(board.boardConnected()).toBe(false);
      return board.connect().then(() => {
        expect(board.boardConnected()).toBe(false);
        board.destroy();
        expect(board.boardConnected()).toBe(false);
      });
    });
  });
});
