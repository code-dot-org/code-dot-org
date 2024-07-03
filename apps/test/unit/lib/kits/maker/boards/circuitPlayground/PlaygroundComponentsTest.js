/** @file Playground Component setup tests */
import five from '@code-dot-org/johnny-five';
import Playground from 'playground-io';

import Led from '@cdo/apps/lib/kits/maker/boards/circuitPlayground/Led';
import NeoPixel from '@cdo/apps/lib/kits/maker/boards/circuitPlayground/NeoPixel';
import Piezo from '@cdo/apps/lib/kits/maker/boards/circuitPlayground/Piezo';
import {
  createCircuitPlaygroundComponents,
  cleanupCircuitPlaygroundComponents,
  componentConstructors,
} from '@cdo/apps/lib/kits/maker/boards/circuitPlayground/PlaygroundComponents';
import {
  CP_ACCEL_STREAM_ON,
  CP_COMMAND,
} from '@cdo/apps/lib/kits/maker/boards/circuitPlayground/PlaygroundConstants';
import Switch from '@cdo/apps/lib/kits/maker/boards/circuitPlayground/Switch';



import {
  newBoard,
  setSensorAnalogValue,
  stubComponentInitialization,
  restoreComponentInitialization,
} from './CircuitPlaygroundTestHelperFunctions';

// Polyfill node's process.hrtime for the browser, gets used by johnny-five.
process.hrtime = require('browser-process-hrtime');

describe('Circuit Playground Components', () => {
  // Use this value as the fake initial value for all analog sensors in unit tests.
  // 235 raw sensor value = 0C = 32F for the thermometer
  const INITIAL_ANALOG_VALUE = 235;

  beforeEach(() => {
    // Fake timers to avoid memory leaks in tests from components that don't
    // clean up their setInterval calls properly.
    jest.useFakeTimers();

    board = newBoard();

    // Our sensors and thermometer block initialization until they receive data
    // over the wire.  That's not great for unit tests, so here we stub waiting
    // for data to resolve immediately.
    stubComponentInitialization(five.Sensor);
    stubComponentInitialization(five.Thermometer);
  });

  afterEach(() => {
    jest.useRealTimers();
    restoreComponentInitialization(five.Sensor);
    restoreComponentInitialization(five.Thermometer);
  });

  describe(`createCircuitPlaygroundComponents()`, () => {
    it(`returns an exact set of expected components`, () => {
      // This test is here to warn us if we add a new component but
      // don't cover it with new tests.  If that happens, make sure you
      // add matching tests below!
      return createCircuitPlaygroundComponents(board).then(components => {
        expect(Object.keys(components)).toEqual([
          'colorLeds',
          'led',
          'toggleSwitch',
          'buzzer',
          'soundSensor',
          'lightSensor',
          'tempSensor',
          'accelerometer',
          'buttonL',
          'buttonR',
        ]);
      });
    });

    it('can initialize a second set of components with a second board', () => {
      // Checks a necessary condition for a true johnny-five level reset.
      const boardOne = newBoard();
      const boardTwo = newBoard();
      return Promise.all([
        createCircuitPlaygroundComponents(boardOne),
        createCircuitPlaygroundComponents(boardTwo),
      ]).then(([componentsOne, componentsTwo]) => {
        expect(componentsOne.led.board === boardOne).toBe(true);
        expect(componentsTwo.led.board === boardTwo).toBe(true);
      });
    });

    describe('colorLeds', () => {
      it('creates an array of controllers', () => {
        return createCircuitPlaygroundComponents(board).then(({colorLeds}) => {
          expect(colorLeds).toBeInstanceOf(Array);
          expect(colorLeds).toHaveLength(10);
        });
      });

      // Describe each Led by key/pin
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(pin => {
        describe(`colorLeds[${pin}]`, () => {
          let led;

          beforeEach(() => {
            return createCircuitPlaygroundComponents(board).then(
              ({colorLeds}) => (led = colorLeds[pin])
            );
          });

          it('creates a NeoPixel', () => {
            expect(led).toBeInstanceOf(NeoPixel);
          });

          it('bound to the board controller', () => {
            expect(led.board).toBe(board);
          });

          it(`on pin ${pin}`, () => {
            expect(led.pin).toBe(pin);
          });
        });
      });
    });

    describe('led', () => {
      let led;

      beforeEach(() => {
        return createCircuitPlaygroundComponents(board).then(
          components => (led = components.led)
        );
      });

      it('creates a Led', () => {
        expect(led).toBeInstanceOf(Led);
      });

      it('bound to the board controller', () => {
        expect(led.board).toBe(board);
      });

      it('on pin 13', () => {
        expect(led.pin).toBe(13);
      });
    });

    describe('toggleSwitch', () => {
      let toggleSwitch;

      beforeEach(() => {
        return createCircuitPlaygroundComponents(board).then(
          components => (toggleSwitch = components.toggleSwitch)
        );
      });

      it('creates a Switch', () => {
        expect(toggleSwitch).toBeInstanceOf(Switch);
      });

      it('bound to the board controller', () => {
        expect(toggleSwitch.board).toBe(board);
      });

      it('on pin 21', () => {
        expect(toggleSwitch.pin).toBe(21);
      });
    });

    describe('buzzer', () => {
      let buzzer;

      beforeEach(() => {
        return createCircuitPlaygroundComponents(board).then(
          components => (buzzer = components.buzzer)
        );
      });

      it('creates a Piezo (our own wrapper around five.Piezo)', () => {
        expect(buzzer).toBeInstanceOf(Piezo);
        expect(buzzer).toBeInstanceOf(five.Piezo);
      });

      it('bound to the board controller', () => {
        expect(buzzer.board).toBe(board);
      });

      it('on pin 5', () => {
        expect(buzzer.pin).toBe(5);
      });

      // See PiezoTest.js for more on our Piezo wrapper
    });

    describe('soundSensor', () => {
      let soundSensor;

      beforeEach(() => {
        return createCircuitPlaygroundComponents(board).then(components => {
          soundSensor = components.soundSensor;
        });
      });

      it('creates a five.Sensor', () => {
        expect(soundSensor).toBeInstanceOf(five.Sensor);
      });

      it('bound to the board controller', () => {
        expect(soundSensor.board).toBe(board);
      });

      it('on pin 4', () => {
        expect(soundSensor.pin).toBe(4);
      });

      it('with sensor methods', () => {
        expect(soundSensor).to.haveOwnProperty('setScale');
      });

      it('with a non-null value immediately after initialization', () => {
        expect(soundSensor.value).not.toBeNull();
        expect(soundSensor.value).toBe(INITIAL_ANALOG_VALUE);
      });

      describe('setScale', () => {
        it('adjusts the range of values provided by .value', () => {
          // Before setting scale, raw values are passed through to .value
          setSensorAnalogValue(soundSensor, 0);
          expect(soundSensor.value).toBe(0);
          setSensorAnalogValue(soundSensor, 500);
          expect(soundSensor.value).toBe(500);
          setSensorAnalogValue(soundSensor, 1023);
          expect(soundSensor.value).toBe(1023);

          soundSensor.setScale(0, 100);

          // After setting scale, raw values are mapped to the new range
          setSensorAnalogValue(soundSensor, 0);
          expect(soundSensor.value).toBe(0);
          setSensorAnalogValue(soundSensor, 512);
          expect(soundSensor.value).toBe(50);
          setSensorAnalogValue(soundSensor, 1023);
          expect(soundSensor.value).toBe(100);
        });

        it('clamps values provided by .value to the given range', () => {
          // Before setting scale, values are not clamped
          // (although this should not be necessary)
          setSensorAnalogValue(soundSensor, -1);
          expect(soundSensor.value).toBe(-1);
          setSensorAnalogValue(soundSensor, 1024);
          expect(soundSensor.value).toBe(1024);

          soundSensor.setScale(0, 100);

          // Afterward, values ARE clamped
          setSensorAnalogValue(soundSensor, -1);
          expect(soundSensor.value).toBe(0);
          setSensorAnalogValue(soundSensor, 1024);
          expect(soundSensor.value).toBe(100);
        });

        it('rounds values provided by .value to integers', () => {
          // Before setting scale, raw values are not rounded
          // (although this should not be necessary)
          setSensorAnalogValue(soundSensor, Math.PI);
          expect(soundSensor.value).toBe(Math.PI);
          setSensorAnalogValue(soundSensor, 543.21);
          expect(soundSensor.value).toBe(543.21);

          soundSensor.setScale(0, 100);

          // Afterward, only integer values are returned
          for (let i = 0; i < 1024; i++) {
            setSensorAnalogValue(soundSensor, i);
            expect(soundSensor.value % 1).toBe(0);
          }
        });
      });
    });

    describe('tempSensor', () => {
      let tempSensor;

      beforeEach(() => {
        return createCircuitPlaygroundComponents(board).then(
          components => (tempSensor = components.tempSensor)
        );
      });

      it('creates a five.Thermometer', () => {
        expect(tempSensor).toBeInstanceOf(five.Thermometer);
      });

      it('bound to the board controller', () => {
        expect(tempSensor.board).toBe(board);
      });

      it('on pin 0', () => {
        expect(tempSensor.pin).toBe(0);
      });

      it('with a F (farenheit) property', () => {
        expect(tempSensor.hasOwnProperty('F')).toBeTruthy();
      });

      it('and a C (celsius) property', () => {
        expect(tempSensor.hasOwnProperty('C')).toBeTruthy();
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

    describe('lightSensor', () => {
      let lightSensor;

      beforeEach(() => {
        return createCircuitPlaygroundComponents(board).then(components => {
          lightSensor = components.lightSensor;
        });
      });

      it('creates a five.Sensor', () => {
        expect(lightSensor).toBeInstanceOf(five.Sensor);
      });

      it('bound to the board controller', () => {
        expect(lightSensor.board).toBe(board);
      });

      it('on pin 5', () => {
        expect(lightSensor.pin).toBe(5);
      });

      it('with sensor methods', () => {
        expect(lightSensor).to.haveOwnProperty('setScale');
      });

      it('with a non-null value immediately after initialization', () => {
        expect(lightSensor.value).not.toBeNull();
        expect(lightSensor.value).toBe(INITIAL_ANALOG_VALUE);
      });

      describe('setScale', () => {
        it('adjusts the range of values provided by .value', () => {
          // Before setting scale, raw values are passed through to .value
          setSensorAnalogValue(lightSensor, 0);
          expect(lightSensor.value).toBe(0);
          setSensorAnalogValue(lightSensor, 500);
          expect(lightSensor.value).toBe(500);
          setSensorAnalogValue(lightSensor, 1023);
          expect(lightSensor.value).toBe(1023);

          lightSensor.setScale(0, 100);

          // After setting scale, raw values are mapped to the new range
          setSensorAnalogValue(lightSensor, 0);
          expect(lightSensor.value).toBe(0);
          setSensorAnalogValue(lightSensor, 512);
          expect(lightSensor.value).toBe(50);
          setSensorAnalogValue(lightSensor, 1023);
          expect(lightSensor.value).toBe(100);
        });

        it('clamps values provided by .value to the given range', () => {
          // Before setting scale, values are not clamped
          // (although this should not be necessary)
          setSensorAnalogValue(lightSensor, -1);
          expect(lightSensor.value).toBe(-1);
          setSensorAnalogValue(lightSensor, 1024);
          expect(lightSensor.value).toBe(1024);

          lightSensor.setScale(0, 100);

          // Afterward, values ARE clamped
          setSensorAnalogValue(lightSensor, -1);
          expect(lightSensor.value).toBe(0);
          setSensorAnalogValue(lightSensor, 1024);
          expect(lightSensor.value).toBe(100);
        });

        it('rounds values provided by .value to integers', () => {
          // Before setting scale, raw values are not rounded
          // (although this should not be necessary)
          setSensorAnalogValue(lightSensor, Math.PI);
          expect(lightSensor.value).toBe(Math.PI);
          setSensorAnalogValue(lightSensor, 543.21);
          expect(lightSensor.value).toBe(543.21);

          lightSensor.setScale(0, 100);

          // Afterward, only integer values are returned
          for (let i = 0; i < 1024; i++) {
            setSensorAnalogValue(lightSensor, i);
            expect(lightSensor.value % 1).toBe(0);
          }
        });
      });
    });

    describe('buttonL', () => {
      let buttonL;

      beforeEach(() => {
        return createCircuitPlaygroundComponents(board).then(
          components => (buttonL = components.buttonL)
        );
      });

      it('creates a five.Button', () => {
        expect(buttonL).toBeInstanceOf(five.Button);
      });

      it('bound to the board controller', () => {
        expect(buttonL.board).toBe(board);
      });

      it('on pin 4', () => {
        expect(buttonL.pin).toBe(4);
      });

      it('with an isPressed property', () => {
        expect(buttonL).to.haveOwnProperty('isPressed');
        expect(buttonL.isPressed).toBe(false);
      });
    });

    describe('buttonR', () => {
      let buttonR;

      beforeEach(() => {
        return createCircuitPlaygroundComponents(board).then(
          components => (buttonR = components.buttonR)
        );
      });

      it('creates a five.Button', () => {
        expect(buttonR).toBeInstanceOf(five.Button);
      });

      it('bound to the board controller', () => {
        expect(buttonR.board).toBe(board);
      });

      it('on pin 19', () => {
        expect(buttonR.pin).toBe(19);
      });

      it('with an isPressed property', () => {
        expect(buttonR).to.haveOwnProperty('isPressed');
        expect(buttonR.isPressed).toBe(false);
      });
    });

    describe('accelerometer', () => {
      let accelerometer;

      beforeEach(() => {
        return createCircuitPlaygroundComponents(board).then(
          components => (accelerometer = components.accelerometer)
        );
      });

      it('creates a five.Accelerometer', () => {
        expect(accelerometer).toBeInstanceOf(five.Accelerometer);
      });

      it('bound to the board controller', () => {
        expect(accelerometer.board).toBe(board);
      });

      // No pin?  Doesn't report one.

      it('with a start() method', () => {
        accelerometer.io.sysexCommand.mockReset(); // Reset spy
        expect(accelerometer).to.haveOwnProperty('start');
        expect(accelerometer.io.sysexCommand).not.toHaveBeenCalled();

        accelerometer.start();
        expect(
          accelerometer.io.sysexCommand
        ).toHaveBeenCalledWith([
          CP_COMMAND,
          CP_ACCEL_STREAM_ON,
        ]);
      });

      it('and a getOrientation method', () => {
        expect(accelerometer).to.haveOwnProperty('getOrientation');
        expect(accelerometer.getOrientation('x')).toBe(0);
        expect(accelerometer.getOrientation('y')).toBe(0);
        expect(accelerometer.getOrientation('z')).toBe(0);
      });

      it('getOrientation returns an array if called without any arguments', () => {
        const stub = jest.spyOn(accelerometer, 'getOrientation').mockClear().mockImplementation();
        stub.mockImplementation((...args) => {
          if (args[0] === 'x') {
            return 1;
          }
        });
        stub.mockImplementation((...args) => {
          if (args[0] === 'y') {
            return 2;
          }
        });
        stub.mockImplementation((...args) => {
          if (args[0] === 'z') {
            return 3;
          }
        });
        stub.callThrough(); // Call original method if none of the above matched.

        expect(accelerometer.getOrientation()).toEqual([
          accelerometer.getOrientation('x'),
          accelerometer.getOrientation('y'),
          accelerometer.getOrientation('z'),
        ]);

        stub.mockRestore();
      });

      it('and a getAcceleration method', () => {
        expect(accelerometer).to.haveOwnProperty('getAcceleration');
        expect(accelerometer.getAcceleration('x')).toBe(0);
        expect(accelerometer.getAcceleration('y')).toBe(0);
        expect(accelerometer.getAcceleration('z')).toBe(0);
        expect(accelerometer.getAcceleration('total')).toBe(0);
      });

      it('getAcceleration returns an array if called without any arguments', () => {
        const stub = jest.spyOn(accelerometer, 'getAcceleration').mockClear().mockImplementation();
        stub.mockImplementation((...args) => {
          if (args[0] === 'x') {
            return 1;
          }
        });
        stub.mockImplementation((...args) => {
          if (args[0] === 'y') {
            return 2;
          }
        });
        stub.mockImplementation((...args) => {
          if (args[0] === 'z') {
            return 3;
          }
        });
        stub.callThrough(); // Call original method if none of the above matched.

        expect(accelerometer.getAcceleration()).toEqual([
          accelerometer.getAcceleration('x'),
          accelerometer.getAcceleration('y'),
          accelerometer.getAcceleration('z'),
        ]);

        stub.mockRestore();
      });
    });
  });

  describe('cleanupCircuitPlaygroundComponents()', () => {
    let components;

    beforeEach(() => {
      return createCircuitPlaygroundComponents(board).then(
        c => (components = c)
      );
    });

    it('can be safely called on empty object', () => {
      expect(() => {
        cleanupCircuitPlaygroundComponents({});
      }).to.not.throw;
    });

    it('destroys everything that createCircuitPlaygroundComponents creates', () => {
      expect(Object.keys(components)).toHaveLength(10);
      cleanupCircuitPlaygroundComponents(
        components,
        true /* shouldDestroyComponents */
      );
      expect(Object.keys(components)).toHaveLength(0);
    });

    it('does not destroy components if shouldDestroyComponents is false', () => {
      expect(Object.keys(components)).toHaveLength(10);
      cleanupCircuitPlaygroundComponents(
        components,
        false /* shouldDestroyComponents */
      );
      expect(Object.keys(components)).toHaveLength(10);
    });

    it('does not destroy components not created by createCircuitPlaygroundComponents', () => {
      components.someOtherComponent = {};
      expect(Object.keys(components)).toHaveLength(11);
      cleanupCircuitPlaygroundComponents(
        components,
        true /* shouldDestroyComponents */
      );
      expect(Object.keys(components)).toHaveLength(1);
      expect(components).to.haveOwnProperty('someOtherComponent');
    });

    it('calls off and stop on every color LED', () => {
      const stopSpies = components.colorLeds.map(led => jest.spyOn(led, 'stop').mockClear());
      const offSpies = components.colorLeds.map(led => jest.spyOn(led, 'off').mockClear());
      cleanupCircuitPlaygroundComponents(
        components,
        true /* shouldDestroyComponents */
      );
      stopSpies.forEach(spy => expect(spy).toHaveBeenCalledTimes(1));
      offSpies.forEach(spy => expect(spy).toHaveBeenCalledTimes(1));
    });

    it('stops Led.RGB.blink()', () => {
      // Spy on 'toggle' which blink calls internally.
      const spy = jest.spyOn(components.colorLeds[0], 'toggle').mockClear();

      // Set up a blink behavior
      components.colorLeds[0].blink(50);
      expect(spy).not.toHaveBeenCalled();

      // Make sure the blink has started
      jest.advanceTimersByTime(50);
      expect(spy).toHaveBeenCalledTimes(1);
      jest.advanceTimersByTime(50);
      expect(spy).toHaveBeenCalledTimes(2);

      // Now destroy the component
      cleanupCircuitPlaygroundComponents(
        components,
        true /* shouldDestroyComponents */
      );

      // Blink should no longer be calling toggle().
      jest.advanceTimersByTime(50);
      expect(spy).toHaveBeenCalledTimes(2);
      jest.advanceTimersByTime(50);
      expect(spy).toHaveBeenCalledTimes(2);
    });

    it('calls off and stop on the red LED', () => {
      const stopSpy = jest.spyOn(components.led, 'stop').mockClear();
      const offSpy = jest.spyOn(components.led, 'off').mockClear();
      cleanupCircuitPlaygroundComponents(
        components,
        true /* shouldDestroyComponents */
      );
      expect(stopSpy).toHaveBeenCalledTimes(1);
      expect(offSpy).toHaveBeenCalledTimes(1);
    });

    it('stops Led.blink()', () => {
      // Spy on 'toggle' which blink calls internally.
      const spy = jest.spyOn(components.led, 'toggle').mockClear();

      // Set up a blink behavior
      components.led.blink(50);
      expect(spy).not.toHaveBeenCalled();

      // Make sure the blink has started
      jest.advanceTimersByTime(50);
      expect(spy).toHaveBeenCalledTimes(1);
      jest.advanceTimersByTime(50);
      expect(spy).toHaveBeenCalledTimes(2);

      // Now destroy the component
      cleanupCircuitPlaygroundComponents(
        components,
        true /* shouldDestroyComponents */
      );

      // Blink should no longer be calling toggle().
      jest.advanceTimersByTime(50);
      expect(spy).toHaveBeenCalledTimes(2);
      jest.advanceTimersByTime(50);
      expect(spy).toHaveBeenCalledTimes(2);
    });

    it('calls off and stop on the buzzer', () => {
      const stopSpy = jest.spyOn(components.buzzer, 'stop').mockClear();
      const offSpy = jest.spyOn(components.buzzer, 'off').mockClear();
      cleanupCircuitPlaygroundComponents(
        components,
        true /* shouldDestroyComponents */
      );
      expect(stopSpy).toHaveBeenCalledTimes(1);
      expect(offSpy).toHaveBeenCalledTimes(1);
    });

    ['play', 'playSong', 'playNotes'].forEach(methodUnderTest => {
      describe(`stops Piezo.${methodUnderTest}()`, () => {
        let frequencySpy;

        beforeEach(() => {
          // Spy on 'frequency' which play calls internally.
          frequencySpy = jest.spyOn(Playground.Piezo.frequency, 'value').mockClear();
        });

        afterEach(() => {
          frequencySpy.mockRestore();
        });

        it('stops Piezo.play()', function () {
          // Make a new one since we're spying on a 'prototype'
          return createCircuitPlaygroundComponents(board).then(({buzzer}) => {
            // Set up a song
            const tempoBPM = 120;
            buzzer[methodUnderTest](
              ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'],
              tempoBPM
            );
            expect(frequencySpy).toHaveBeenCalledTimes(1);

            // Make sure the song is playing
            const msPerBeat = 15000 / tempoBPM;
            jest.advanceTimersByTime(msPerBeat);
            expect(frequencySpy).toHaveBeenCalledTimes(2);
            jest.advanceTimersByTime(msPerBeat);
            expect(frequencySpy).toHaveBeenCalledTimes(3);

            // Now destroy the component(s)
            cleanupCircuitPlaygroundComponents(
              {buzzer},
              true /* shouldDestroyComponents */
            );

            // And ensure the song has stopped
            jest.advanceTimersByTime(msPerBeat);
            expect(frequencySpy).toHaveBeenCalledTimes(3);
            jest.advanceTimersByTime(msPerBeat);
            expect(frequencySpy).toHaveBeenCalledTimes(3);
          });
        });
      });
    });

    it('calls disable on the soundSensor and clears events', () => {
      const spy = jest.spyOn(components.soundSensor, 'disable').mockClear();
      cleanupCircuitPlaygroundComponents(
        components,
        false /* shouldDestroyComponents */
      );
      console.log(components.soundSensor._events);
      expect(spy).toHaveBeenCalledTimes(1);
      expect(components.soundSensor._events).toHaveLength(0);
    });

    it('calls disable on the lightSensor and clears events', () => {
      const spy = jest.spyOn(components.lightSensor, 'disable').mockClear();
      cleanupCircuitPlaygroundComponents(
        components,
        false /* shouldDestroyComponents */
      );
      expect(spy).toHaveBeenCalledTimes(1);
      expect(components.lightSensor._events).toHaveLength(0);
    });

    it('calls disable on the tempSensor and clears events', () => {
      const spy = jest.spyOn(components.tempSensor, 'disable').mockClear();
      cleanupCircuitPlaygroundComponents(
        components,
        false /* shouldDestroyComponents */
      );
      expect(spy).toHaveBeenCalledTimes(1);
      expect(components.tempSensor._events).toHaveLength(0);
    });

    it('calls stop on the accelerometer and clears events', () => {
      // Spy on the controller template, because stop() ends up readonly on
      // the returned component.
      const spy = jest.spyOn(Playground.Accelerometer.stop, 'value').mockClear();
      return createCircuitPlaygroundComponents(board).then(components => {
        cleanupCircuitPlaygroundComponents(
          components,
          false /* shouldDestroyComponents */
        );

        let assertionError;
        try {
          expect(spy).toHaveBeenCalledTimes(1);
        } catch (e) {
          assertionError = e;
        }

        expect(components.accelerometer._events).toHaveLength(0);

        spy.mockRestore();
        if (assertionError) {
          throw assertionError;
        }
      });
    });
  });

  describe(`componentConstructors`, () => {
    it('contains a five.Board constructor', () => {
      expect(Object.values(componentConstructors)).toContain(five.Board);
    });

    it('contains a constructor for every created component', () => {
      const constructors = Object.values(componentConstructors);

      function isPlainObject(obj) {
        // Check whether the constructor is native object
        return obj.constructor === {}.constructor;
      }

      // Recursively walk component map to check all components
      function hasNeededConstructors(x) {
        if (Array.isArray(x)) {
          x.forEach(hasNeededConstructors);
        } else if (isPlainObject(x)) {
          Object.values(x).forEach(hasNeededConstructors);
        } else {
          expect(constructors).toEqual(expect.arrayContaining([x.constructor]));
        }
      }

      return createCircuitPlaygroundComponents(board).then(components => {
        hasNeededConstructors(components);
      });
    });

    it('uses the constructor name', () => {
      Object.keys(componentConstructors).forEach(key => {
        expect(key).toBe(componentConstructors[key].name);
      });
    });
  });
});
