import {itImplementsTheMakerBoardInterface} from './MakerBoardTest';
import FakeCPBoard from '@cdo/apps/lib/kits/maker/boards/FakeCPBoard';
import FakeMBBoard from '@cdo/apps/lib/kits/maker/boards/FakeMBBoard';
import {expect} from '../../../../../util/reconfiguredChai';
import {itMakesCircuitPlaygroundComponentsAvailable} from './circuitPlayground/CircuitPlaygroundBoardTest';
import {itMakesMicroBitComponentsAvailable} from './microBit/MicroBitBoardTest';

describe('FakeCPBoard', () => {
  // Test coverage for Circuit Playground Maker Board Interface
  itImplementsTheMakerBoardInterface(FakeCPBoard);
  itMakesCircuitPlaygroundComponentsAvailable(FakeCPBoard);

  describe(`boardConnected()`, () => {
    it('always returns false', () => {
      const board = new FakeCPBoard();
      expect(board.boardConnected()).to.be.false;
      return board.connect().then(() => {
        expect(board.boardConnected()).to.be.false;
        board.destroy();
        expect(board.boardConnected()).to.be.false;
      });
    });
  });
});

describe('FakeMBBoard', () => {
  // Test coverage for micro:bit Maker Board Interface
  itImplementsTheMakerBoardInterface(FakeMBBoard);
  itMakesMicroBitComponentsAvailable(FakeMBBoard);

  describe(`boardConnected()`, () => {
    it('always returns false', () => {
      const board = new FakeMBBoard();
      expect(board.boardConnected()).to.be.false;
      return board.connect().then(() => {
        expect(board.boardConnected()).to.be.false;
        board.destroy();
        expect(board.boardConnected()).to.be.false;
      });
    });
  });
});
