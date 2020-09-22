/** @file MicroBit Component setup tests */
import {expect} from '../../../../../../util/reconfiguredChai';
import {
  createMicroBitComponents,
  cleanupMicroBitComponents,
  enableMicroBitComponents
} from '@cdo/apps/lib/kits/maker/boards/microBit/MicroBitComponents';
import {MicrobitStubBoard} from '../makeStubBoard';
import {EventEmitter} from 'events';
import sinon from 'sinon';
import CapacitiveTouchSensor from '@cdo/apps/lib/kits/maker/boards/microBit/CapacitiveTouchSensor';

const COMPONENTS = [
  'buttonA',
  'buttonB',
  'ledScreen',
  'tempSensor',
  'accelerometer',
  'compass',
  'lightSensor'
];

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
        expect(Object.keys(components)).to.deep.equal(COMPONENTS);
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

    it('creates an EventEmitter', () => {
      expect(buttonA).to.be.an.instanceOf(EventEmitter);
    });

    it('bound to the board controller', () => {
      expect(buttonA.board.mb).to.equal(board);
    });

    it('on pin 1', () => {
      expect(buttonA.board.pin).to.equal(1);
    });
  });

  describe('buttonB', () => {
    let buttonB;

    beforeEach(() => {
      return createMicroBitComponents(board).then(
        components => (buttonB = components.buttonB)
      );
    });

    it('creates an EventEmitter', () => {
      expect(buttonB).to.be.an.instanceOf(EventEmitter);
    });

    it('bound to the board controller', () => {
      expect(buttonB.board.mb).to.equal(board);
    });

    it('on pin 2', () => {
      expect(buttonB.board.pin).to.equal(2);
    });
  });

  describe('ledScreen', () => {
    let ledScreen;

    beforeEach(() => {
      return createMicroBitComponents(board).then(
        components => (ledScreen = components.ledScreen)
      );
    });

    it('bound to the board controller', () => {
      expect(ledScreen.board.mb).to.equal(board);
    });
  });

  describe('tempSensor', () => {
    let tempSensor;

    beforeEach(() => {
      return createMicroBitComponents(board).then(
        components => (tempSensor = components.tempSensor)
      );
    });

    it('bound to the board controller', () => {
      expect(tempSensor.board.mb).to.equal(board);
    });

    it('with non-null values immediately after initialization', () => {
      // This test depends on the fake initial thermometer reading
      // set up in the beforeEach block at the top  of this file.
      expect(tempSensor.F).not.to.be.null;
      expect(tempSensor.F).to.equal(32);
      expect(tempSensor.C).not.to.be.null;
      expect(tempSensor.C).to.equal(0);
    });
  });

  describe('accelerometer', () => {
    let accelerometer;

    beforeEach(() => {
      return createMicroBitComponents(board).then(
        components => (accelerometer = components.accelerometer)
      );
    });

    it('bound to the board controller', () => {
      expect(accelerometer.board.mb).to.equal(board);
    });
  });

  describe('compass', () => {
    let compass;

    beforeEach(() => {
      return createMicroBitComponents(board).then(
        components => (compass = components.compass)
      );
    });

    it('bound to the board controller', () => {
      expect(compass.board.mb).to.equal(board);
    });
  });

  describe('lightSensor', () => {
    let lightSensor;

    beforeEach(() => {
      return createMicroBitComponents(board).then(
        components => (lightSensor = components.lightSensor)
      );
    });

    it('bound to the board controller', () => {
      expect(lightSensor.board.mb).to.equal(board);
    });

    it('with non-null values immediately after initialization', () => {
      // This test depends on the fake initial thermometer reading
      // set up in the beforeEach block at the top  of this file.
      expect(lightSensor.value).not.to.be.null;
      expect(lightSensor.value).to.equal(0);
    });
  });

  describe('cleanupMicroBitComponents()', () => {
    let components;

    beforeEach(() => {
      return createMicroBitComponents(board).then(c => (components = c));
    });

    it('can be safely called on empty object', () => {
      expect(() => {
        cleanupMicroBitComponents({}, []);
      }).not.to.throw;
    });

    it('destroys everything that createMicroBitComponents creates', () => {
      expect(Object.keys(components)).to.have.length(COMPONENTS.length);
      cleanupMicroBitComponents(
        components,
        [],
        true /* shouldDestroyComponents */
      );
      expect(Object.keys(components)).to.have.length(0);
    });

    it('does not destroy components if shouldDestroyComponents is false', () => {
      expect(Object.keys(components)).to.have.length(COMPONENTS.length);
      cleanupMicroBitComponents(
        components,
        [],
        false /* shouldDestroyComponents */
      );
      expect(Object.keys(components)).to.have.length(COMPONENTS.length);
    });

    it('does not destroy components not created by createMicroBitComponents', () => {
      components.someOtherComponent = {};
      expect(Object.keys(components)).to.have.length(COMPONENTS.length + 1);
      cleanupMicroBitComponents(
        components,
        [],
        true /* shouldDestroyComponents */
      );
      expect(Object.keys(components)).to.have.length(1);
      expect(components).to.haveOwnProperty('someOtherComponent');
    });

    it('calls clear for the ledScreen', () => {
      const stopSpy = sinon.spy(components.ledScreen, 'clear');
      cleanupMicroBitComponents(
        components,
        [],
        true /* shouldDestroyComponents */
      );
      expect(stopSpy).to.have.been.calledOnce;
    });

    it('calls disable on the tempSensor and resets the current temp to 0', () => {
      const spy = sinon.spy(components.tempSensor, 'stop');
      cleanupMicroBitComponents(
        components,
        [],
        false /* shouldDestroyComponents */
      );
      expect(spy).to.have.been.calledOnce;
      expect(components.tempSensor.currentTemp).to.equal(0);
    });

    it('calls stop on the accelerometer and clears events', () => {
      const spy = sinon.spy(components.accelerometer, 'stop');
      cleanupMicroBitComponents(
        components,
        [],
        false /* shouldDestroyComponents */
      );
      expect(spy).to.have.been.calledOnce;
      expect(components.accelerometer.state.x).to.equal(0);
      expect(components.accelerometer.state.y).to.equal(0);
      expect(components.accelerometer.state.z).to.equal(0);
    });

    it('calls stop on a capacitive touch sensor and clears events', () => {
      let boardClient = new MicrobitStubBoard();
      let sensor = new CapacitiveTouchSensor({mb: boardClient, pin: 0});
      const spy = sinon.spy(sensor, 'stop');
      cleanupMicroBitComponents(
        components,
        [sensor],
        false /* shouldDestroyComponents */
      );
      expect(spy).to.have.been.calledOnce;
      expect(sensor.connected).to.be.false;
    });
  });

  describe('enableMicroBitComponents()', () => {
    let components;

    beforeEach(() => {
      return createMicroBitComponents(board).then(c => (components = c));
    });

    it('starts components with sensors', () => {
      const tempSpy = sinon.spy(components.tempSensor, 'start');
      const accelSpy = sinon.spy(components.accelerometer, 'start');
      const compassSpy = sinon.spy(components.compass, 'start');
      enableMicroBitComponents(components);
      expect(tempSpy).to.have.been.calledOnce;
      expect(accelSpy).to.have.been.calledOnce;
      expect(compassSpy).to.have.been.calledOnce;
    });
  });
});
