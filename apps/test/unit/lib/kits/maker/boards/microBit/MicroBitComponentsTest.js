/** @file MicroBit Component setup tests */
import {EventEmitter} from 'events';

import CapacitiveTouchSensor from '@cdo/apps/lib/kits/maker/boards/microBit/CapacitiveTouchSensor';
import {
  createMicroBitComponents,
  cleanupMicroBitComponents,
  enableMicroBitComponents,
} from '@cdo/apps/lib/kits/maker/boards/microBit/MicroBitComponents';
import {MBFirmataClientStub} from '@cdo/apps/lib/kits/maker/util/makeStubBoard';



const COMPONENTS = [
  'buttonA',
  'buttonB',
  'ledScreen',
  'tempSensor',
  'accelerometer',
  'compass',
  'lightSensor',
];

describe('MicroBit Components', () => {
  let boardClient;

  beforeEach(() => {
    boardClient = new MBFirmataClientStub();
  });

  describe(`createMicroBitComponents()`, () => {
    it(`returns an exact set of expected components`, () => {
      // This test is here to warn us if we add a new component but
      // don't cover it with new tests.  If that happens, make sure you
      // add matching tests below!
      return createMicroBitComponents(boardClient).then(components => {
        expect(Object.keys(components)).toEqual(COMPONENTS);
      });
    });
  });

  describe('buttonA', () => {
    let buttonA;

    beforeEach(() => {
      return createMicroBitComponents(boardClient).then(
        components => (buttonA = components.buttonA)
      );
    });

    it('creates an EventEmitter', () => {
      expect(buttonA).toBeInstanceOf(EventEmitter);
    });

    it('bound to the board controller', () => {
      expect(buttonA.board.mb).toBe(boardClient);
    });

    it('on pin 1', () => {
      expect(buttonA.board.pin).toBe(1);
    });
  });

  describe('buttonB', () => {
    let buttonB;

    beforeEach(() => {
      return createMicroBitComponents(boardClient).then(
        components => (buttonB = components.buttonB)
      );
    });

    it('creates an EventEmitter', () => {
      expect(buttonB).toBeInstanceOf(EventEmitter);
    });

    it('bound to the board controller', () => {
      expect(buttonB.board.mb).toBe(boardClient);
    });

    it('on pin 2', () => {
      expect(buttonB.board.pin).toBe(2);
    });
  });

  describe('ledScreen', () => {
    let ledScreen;

    beforeEach(() => {
      return createMicroBitComponents(boardClient).then(
        components => (ledScreen = components.ledScreen)
      );
    });

    it('bound to the board controller', () => {
      expect(ledScreen.board.mb).toBe(boardClient);
    });
  });

  describe('tempSensor', () => {
    let tempSensor;

    beforeEach(() => {
      return createMicroBitComponents(boardClient).then(
        components => (tempSensor = components.tempSensor)
      );
    });

    it('bound to the board controller', () => {
      expect(tempSensor.board.mb).toBe(boardClient);
    });

    it('with non-null values immediately after initialization', () => {
      // This test depends on the fake initial thermometer reading
      // set up in the beforeEach block at the top  of this file.
      expect(tempSensor.F).not.toBeNull();
      expect(tempSensor.F).toBe(32);
      expect(tempSensor.C).not.toBeNull();
      expect(tempSensor.C).toBe(0);
    });
  });

  describe('accelerometer', () => {
    let accelerometer;

    beforeEach(() => {
      return createMicroBitComponents(boardClient).then(
        components => (accelerometer = components.accelerometer)
      );
    });

    it('bound to the board controller', () => {
      expect(accelerometer.board.mb).toBe(boardClient);
    });
  });

  describe('compass', () => {
    let compass;

    beforeEach(() => {
      return createMicroBitComponents(boardClient).then(
        components => (compass = components.compass)
      );
    });

    it('bound to the board controller', () => {
      expect(compass.board.mb).toBe(boardClient);
    });
  });

  describe('lightSensor', () => {
    let lightSensor;

    beforeEach(() => {
      return createMicroBitComponents(boardClient).then(
        components => (lightSensor = components.lightSensor)
      );
    });

    it('bound to the board controller', () => {
      expect(lightSensor.board.mb).toBe(boardClient);
    });

    it('with non-null values immediately after initialization', () => {
      // This test depends on the fake initial thermometer reading
      // set up in the beforeEach block at the top  of this file.
      expect(lightSensor.value).not.toBeNull();
      expect(lightSensor.value).toBe(0);
    });
  });

  describe('cleanupMicroBitComponents()', () => {
    let components;

    beforeEach(() => {
      return createMicroBitComponents(boardClient).then(c => (components = c));
    });
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('can be safely called on empty object', () => {
      expect(() => {
        cleanupMicroBitComponents({}, []);
      }).to.not.throw;
    });

    it('destroys everything that createMicroBitComponents creates', () => {
      expect(Object.keys(components)).toHaveLength(COMPONENTS.length);
      cleanupMicroBitComponents(
        components,
        [],
        true /* shouldDestroyComponents */
      );
      expect(Object.keys(components)).toHaveLength(0);
    });

    it('does not destroy components if shouldDestroyComponents is false', () => {
      expect(Object.keys(components)).toHaveLength(COMPONENTS.length);
      cleanupMicroBitComponents(
        components,
        [],
        false /* shouldDestroyComponents */
      );
      expect(Object.keys(components)).toHaveLength(COMPONENTS.length);
    });

    it('does not destroy components not created by createMicroBitComponents', () => {
      components.someOtherComponent = {};
      expect(Object.keys(components)).toHaveLength(COMPONENTS.length + 1);
      cleanupMicroBitComponents(
        components,
        [],
        true /* shouldDestroyComponents */
      );
      expect(Object.keys(components)).toHaveLength(1);
      expect(components).to.haveOwnProperty('someOtherComponent');
    });

    it('calls clear for the ledScreen', () => {
      const stopSpy = jest.spyOn(components.ledScreen, 'clear').mockClear();
      cleanupMicroBitComponents(
        components,
        [],
        true /* shouldDestroyComponents */
      );
      expect(stopSpy).toHaveBeenCalledTimes(1);
    });

    it('calls disable on the tempSensor and resets the current temp to 0', () => {
      const spy = jest.spyOn(components.tempSensor, 'stop').mockClear();
      cleanupMicroBitComponents(
        components,
        [],
        false /* shouldDestroyComponents */
      );
      expect(spy).toHaveBeenCalledTimes(1);
      expect(components.tempSensor.currentTemp).toBe(0);
    });

    it('calls stop on the accelerometer and clears events', () => {
      const spy = jest.spyOn(components.accelerometer, 'stop').mockClear();
      cleanupMicroBitComponents(
        components,
        [],
        false /* shouldDestroyComponents */
      );
      expect(spy).toHaveBeenCalledTimes(1);
      expect(components.accelerometer.state.x).toBe(0);
      expect(components.accelerometer.state.y).toBe(0);
      expect(components.accelerometer.state.z).toBe(0);
    });

    it('calls stop on a capacitive touch sensor and clears events', () => {
      let boardClient = new MBFirmataClientStub();
      let sensor = new CapacitiveTouchSensor({mb: boardClient, pin: 0});
      const spy = jest.spyOn(sensor, 'stop').mockClear();
      cleanupMicroBitComponents(
        components,
        [sensor],
        false /* shouldDestroyComponents */
      );
      expect(spy).toHaveBeenCalledTimes(1);
      expect(sensor.connected).toBe(false);
    });
  });

  describe('enableMicroBitComponents()', () => {
    let components;

    beforeEach(() => {
      return createMicroBitComponents(boardClient).then(c => (components = c));
    });

    it('starts components with sensors', () => {
      const tempSpy = jest.spyOn(components.tempSensor, 'start').mockClear();
      const accelSpy = jest.spyOn(components.accelerometer, 'start').mockClear();
      const compassSpy = jest.spyOn(components.compass, 'start').mockClear();
      enableMicroBitComponents(components);
      expect(tempSpy).toHaveBeenCalledTimes(1);
      expect(accelSpy).toHaveBeenCalledTimes(1);
      expect(compassSpy).toHaveBeenCalledTimes(1);
    });
  });
});
