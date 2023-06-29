import {itImplementsTheMakerBoardInterface} from '../MakerBoardInterfaceTestUtil';
import VirtualMBBoard from '@cdo/apps/lib/kits/maker/boards/VirtualMBBoard';
import {expect} from '../../../../../../util/reconfiguredChai';
import {itMakesMicroBitComponentsAvailable} from './MicroBitComponentTestUtil';

describe('VirtualMBBoard', () => {
  // Test coverage for micro:bit Maker Board Interface
  itImplementsTheMakerBoardInterface(VirtualMBBoard);
  itMakesMicroBitComponentsAvailable(VirtualMBBoard);

  describe(`boardConnected()`, () => {
    it('always returns false', () => {
      const board = new VirtualMBBoard();
      expect(board.boardConnected()).to.be.false;
      return board.connect().then(() => {
        expect(board.boardConnected()).to.be.false;
        board.destroy();
        expect(board.boardConnected()).to.be.false;
      });
    });
  });
});
