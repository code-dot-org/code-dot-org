import VirtualMBBoard from '@cdo/apps/lib/kits/maker/boards/VirtualMBBoard';


import {itImplementsTheMakerBoardInterface} from '../MakerBoardInterfaceTestUtil';

import {itMakesMicroBitComponentsAvailable} from './MicroBitComponentTestUtil';

describe('VirtualMBBoard', () => {
  // Test coverage for micro:bit Maker Board Interface
  itImplementsTheMakerBoardInterface(VirtualMBBoard);
  itMakesMicroBitComponentsAvailable(VirtualMBBoard);

  describe(`boardConnected()`, () => {
    it('always returns false', () => {
      const board = new VirtualMBBoard();
      expect(board.boardConnected()).toBe(false);
      return board.connect().then(() => {
        expect(board.boardConnected()).toBe(false);
        board.destroy();
        expect(board.boardConnected()).toBe(false);
      });
    });
  });
});
