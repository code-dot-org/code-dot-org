import {itImplementsTheMakerBoardInterface} from './MakerBoardTest';
import FakeBoard from '@cdo/apps/lib/kits/maker/boards/FakeBoard';
import {expect} from '../../../../../util/reconfiguredChai';
import {itMakesComponentsAvailableFromInterpreter} from './circuitPlayground/CircuitPlaygroundMakerBoardTest';

describe('FakeBoard', () => {
  itImplementsTheMakerBoardInterface(FakeBoard);

  // Board-specific tests
  // Test that the appropriate components are available on each board
  itMakesComponentsAvailableFromInterpreter(FakeBoard);

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
