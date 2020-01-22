import {expect} from '../../../../util/deprecatedChai';
import MicroBitBoard from '@cdo/apps/lib/kits/maker/MicroBitBoard';
import {MicrobitStubBoard} from './makeStubBoard';
import sinon from 'sinon';

describe('MicroBitBoard', () => {
  let board;

  beforeEach(() => {
    // Construct a board to test on
    window.SerialPort = {};
    board = new MicroBitBoard();
    board.boardClient_ = new MicrobitStubBoard();
  });

  afterEach(() => {
    board = undefined;
  });

  describe(`connect()`, () => {
    it('initializes a set of components', () => {
      return board.connect().then(() => {
        expect(Object.keys(board.prewiredComponents_)).to.have.length(6);
        expect(board.prewiredComponents_.board).to.be.a('object');
        expect(board.prewiredComponents_.ledMatrix).to.be.a('object');
        expect(board.prewiredComponents_.tempSensor).to.be.a('object');
        expect(board.prewiredComponents_.accelerometer).to.be.a('object');
        expect(board.prewiredComponents_.buttonA).to.be.a('object');
        expect(board.prewiredComponents_.buttonB).to.be.a('object');
      });
    });
  });

  describe(`enableComponents())`, () => {
    it('triggers a component start call if there are prewired components', () => {
      return board.connect().then(() => {
        // Spy on the accelerometer to see if enableComponents called
        // enableMicroBitComponents which then starts the accelerometer.
        let accelerometerSpy = sinon.spy(
          board.prewiredComponents_.accelerometer,
          'start'
        );
        board.enableComponents();
        expect(accelerometerSpy).to.have.been.calledOnce;
      });
    });
  });

  describe(`boardConnected()`, () => {
    it('returns false at first', () => {
      expect(board.boardConnected()).to.be.false;
    });

    it('returns true after connecting', () => {
      return board.connect().then(() => {
        expect(board.boardConnected()).to.be.true;
      });
    });
  });

  describe(`reset()`, () => {
    it('triggers a component cleanup', () => {
      return board.connect().then(() => {
        let ledMatrixSpy = sinon.spy(
          board.prewiredComponents_.ledMatrix,
          'allOff'
        );
        board.reset();
        expect(ledMatrixSpy).to.have.been.calledOnce;
      });
    });
  });
});
