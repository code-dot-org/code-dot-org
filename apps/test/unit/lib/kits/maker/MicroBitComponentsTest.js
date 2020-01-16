/** @file MicroBit Component setup tests */
import {expect} from '../../../../util/reconfiguredChai';
import {createMicroBitComponents} from '@cdo/apps/lib/kits/maker/MicroBitComponents';
import {MicrobitStubBoard} from './makeStubBoard';

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
});
