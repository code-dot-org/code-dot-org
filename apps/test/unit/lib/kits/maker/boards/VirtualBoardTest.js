import {itImplementsTheMakerBoardInterface} from './MakerBoardTest';
import VirtualCPBoard from '@cdo/apps/lib/kits/maker/boards/VirtualCPBoard';
import VirtualMBBoard from '@cdo/apps/lib/kits/maker/boards/VirtualMBBoard';
import {expect} from '../../../../../util/reconfiguredChai';
import {itMakesCircuitPlaygroundComponentsAvailable} from './circuitPlayground/CircuitPlaygroundBoardTest';
import {itMakesMicroBitComponentsAvailable} from './microBit/MicroBitBoardTest';

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
