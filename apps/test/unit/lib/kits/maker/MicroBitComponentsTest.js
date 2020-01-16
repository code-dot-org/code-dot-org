/** @file MicroBit Component setup tests */
import {expect} from '../../../../util/reconfiguredChai';
import {createMicroBitComponents} from '@cdo/apps/lib/kits/maker/MicroBitComponents';
import {MicrobitStubBoard} from './makeStubBoard';
import five from '@code-dot-org/johnny-five';

describe('MicroBit Components', () => {
  let board;

  beforeEach(() => {
    board = new MicrobitStubBoard();
  });

  describe(`createMicroBitComponents()`, () => {
    it(`returns an exact set of expected components`, () => {
      // This test is here to warn us if we add a new component but
      // don't cover it with new tests.  If that happens, make sure you
      // add matching tests below!
      return createMicroBitComponents(board).then(components => {
        expect(Object.keys(components)).to.deep.equal([
          'buttonA',
          'buttonB',
          'ledMatrix',
          'tempSensor',
          'accelerometer'
        ]);
      });
    });
  });

  describe('buttonA', () => {
    let buttonA;

    beforeEach(() => {
      return createMicroBitComponents(board).then(
        components => (buttonA = components.buttonA)
      );
    });

    it('creates a five.Button', () => {
      expect(buttonA).to.be.an.instanceOf(five.Button);
    });

    it('bound to the board controller', () => {
      expect(buttonA.board.mb).to.equal(board);
    });

    it('on pin 1', () => {
      expect(buttonA.board.pin).to.equal(1);
    });

    it('with an isPressed property', () => {
      expect(buttonA).to.haveOwnProperty('isPressed');
      expect(buttonA.isPressed).to.be.false;
    });
  });

  describe('buttonB', () => {
    let buttonB;

    beforeEach(() => {
      return createMicroBitComponents(board).then(
        components => (buttonB = components.buttonB)
      );
    });

    it('creates a five.Button', () => {
      expect(buttonB).to.be.an.instanceOf(five.Button);
    });

    it('bound to the board controller', () => {
      expect(buttonB.board.mb).to.equal(board);
    });

    it('on pin 2', () => {
      expect(buttonB.board.pin).to.equal(2);
    });

    it('with an isPressed property', () => {
      expect(buttonB).to.haveOwnProperty('isPressed');
      expect(buttonB.isPressed).to.be.false;
    });
  });
});
