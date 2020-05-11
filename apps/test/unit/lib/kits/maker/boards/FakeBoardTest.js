import {itImplementsTheMakerBoardInterface} from './MakerBoardTest';
import FakeBoard from '@cdo/apps/lib/kits/maker/boards/FakeBoard';
import {expect} from '../../../../../util/reconfiguredChai';
import {itMakesCircuitPlaygroundComponentsAvailable} from './circuitPlayground/CircuitPlaygroundBoardTest';

describe('FakeBoard', () => {
  describe('Maker Board Interface', () => {
    describe('implements shared Maker Board Interface', () => {
      itImplementsTheMakerBoardInterface(FakeBoard);
    });

    describe('Circuit Playground components accessible from interpreter', () => {
      itMakesCircuitPlaygroundComponentsAvailable(FakeBoard);
    });
  });

  describe(`boardConnected()`, () => {
    it('always returns false', () => {
      const board = new FakeBoard();
      expect(board.boardConnected()).to.be.false;
      return board.connect().then(() => {
        expect(board.boardConnected()).to.be.false;
        board.destroy();
        expect(board.boardConnected()).to.be.false;
      });
    });
  });
});
