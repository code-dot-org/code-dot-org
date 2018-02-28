/** @file Playground Component setup tests */
import five from '@code-dot-org/johnny-five';
import Playground from 'playground-io';
import {EventEmitter} from 'events'; // provided by webpack's node-libs-browser
import {expect} from '../../../../util/configuredChai';
import sinon from 'sinon';
import {
  createCircuitPlaygroundComponents,
  destroyCircuitPlaygroundComponents,
  componentConstructors,
} from '@cdo/apps/lib/kits/maker/PlaygroundComponents';
import Piezo from '@cdo/apps/lib/kits/maker/Piezo';
import TouchSensor from '@cdo/apps/lib/kits/maker/TouchSensor';
import NeoPixel from '@cdo/apps/lib/kits/maker/NeoPixel';
import Led from '@cdo/apps/lib/kits/maker/Led';
import Switch from '@cdo/apps/lib/kits/maker/Switch';
import {
  CP_ACCEL_STREAM_ON,
  CP_COMMAND,
  TOUCH_PINS
} from '@cdo/apps/lib/kits/maker/PlaygroundConstants';
import experiments from '@cdo/apps/util/experiments';

// Polyfill node's process.hrtime for the browser, gets used by johnny-five.
process.hrtime = require('browser-process-hrtime');

describe('Circuit Playground Components', () => {
  let board, clock;

  // Use this value as the fake initial value for all analog sensors in unit tests.
  // 235 raw sensor value = 0C = 32F for the thermometer
  const INITIAL_ANALOG_VALUE = 235;

  beforeEach(() => {
    // Fake timers to avoid memory leaks in tests from components that don't
    // clean up their setInterval calls properly.
    clock = sinon.useFakeTimers();

    board = newBoard();

    // Our sensors and thermometer block initialization until they receive data
    // over the wire.  That's not great for unit tests, so here we stub waiting
    // for data to resolve immediately.
    sinon.stub(EventEmitter.prototype, 'once');
    EventEmitter.prototype.once.withArgs('data').callsFake(function (_, callback) {
      // Pretend we got a real analog value back on the component's pin.
      setSensorAnalogValue(this, INITIAL_ANALOG_VALUE);
      callback();
    });
    EventEmitter.prototype.once.callThrough();
  });

  afterEach(() => {
    EventEmitter.prototype.once.restore();
    clock.restore();
  });

  describe(`createCircuitPlaygroundComponents()`, () => {
    it(`returns an exact set of expected components`, () => {
      // This test is here to warn us if we add a new component but
      // don't cover it with new tests.  If that happens, make sure you
      // add matching tests below!
      return createCircuitPlaygroundComponents(board).then(components => {
        expect(Object.keys(components)).to.deep.equal([
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

    // TODO (bbuchanan): Remove this whole describe block when maker-captouch is on by default.
    describe('with capTouch enabled', () => {
      before(() => experiments.setEnabled('maker-captouch', true));
      after(() => experiments.setEnabled('maker-captouch', false));

      it(`returns an exact set of expected components`, () => {
        return createCircuitPlaygroundComponents(board).then(components => {
          expect(Object.keys(components)).to.deep.equal([
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
            'touchPad0',
            'touchPad2',
            'touchPad3',
            'touchPad6',
            'touchPad9',
            'touchPad10',
            'touchPad12',
          ]);
        });
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
        expect(componentsOne.led.board === boardOne).to.be.true;
        expect(componentsTwo.led.board === boardTwo).to.be.true;
      });
    });

    describe('colorLeds', () => {
      it('creates an array of controllers', () => {
        return createCircuitPlaygroundComponents(board).then(({colorLeds}) => {
          expect(colorLeds).to.be.an.instanceOf(Array);
          expect(colorLeds).to.have.length(10);
        });
      });

      // Describe each Led by key/pin
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(pin => {
        describe(`colorLeds[${pin}]`, () => {
          let led;

          beforeEach(() => {
            return createCircuitPlaygroundComponents(board)
              .then(({colorLeds}) => led = colorLeds[pin]);
          });

          it('creates a NeoPixel', () => {
            expect(led).to.be.an.instanceOf(NeoPixel);
          });

          it('bound to the board controller', () => {
            expect(led.board).to.equal(board);
          });

          it(`on pin ${pin}`, () => {
            expect(led.pin).to.equal(pin);
          });
        });
      });
    });

    describe('led', () => {
      let led;

      beforeEach(() => {
        return createCircuitPlaygroundComponents(board)
          .then((components) => led = components.led);
      });

      it('creates a Led', () => {
        expect(led).to.be.an.instanceOf(Led);
      });

      it('bound to the board controller', () => {
        expect(led.board).to.equal(board);
      });

      it('on pin 13', () => {
        expect(led.pin).to.equal(13);
      });
    });

    describe('toggleSwitch', () => {
      let toggleSwitch;

      beforeEach(() => {
        return createCircuitPlaygroundComponents(board)
          .then((components) => toggleSwitch = components.toggleSwitch);
      });

      it('creates a Switch', () => {
        expect(toggleSwitch).to.be.an.instanceOf(Switch);
      });

      it('bound to the board controller', () => {
        expect(toggleSwitch.board).to.equal(board);
      });

      it('on pin 21', () => {
        expect(toggleSwitch.pin).to.equal(21);
      });
    });

    describe('buzzer', () => {
      let buzzer;

      beforeEach(() => {
        return createCircuitPlaygroundComponents(board)
          .then((components) => buzzer = components.buzzer);
      });

      it('creates a Piezo (our own wrapper around five.Piezo)', () => {
        expect(buzzer).to.be.an.instanceOf(Piezo);
        expect(buzzer).to.be.an.instanceOf(five.Piezo);
      });

      it('bound to the board controller', () => {
        expect(buzzer.board).to.equal(board);
      });

      it('on pin 5', () => {
        expect(buzzer.pin).to.equal(5);
      });

      // See PiezoTest.js for more on our Piezo wrapper
    });

    describe('soundSensor', () => {
      let soundSensor;

      beforeEach(() => {
        return createCircuitPlaygroundComponents(board).then((components) => {
          soundSensor = components.soundSensor;
        });
      });

      it('creates a five.Sensor', () => {
        expect(soundSensor).to.be.an.instanceOf(five.Sensor);
      });

      it('bound to the board controller', () => {
        expect(soundSensor.board).to.equal(board);
      });

      it('on pin 4', () => {
        expect(soundSensor.pin).to.equal(4);
      });

      it('with sensor methods', () => {
        expect(soundSensor).to.haveOwnProperty('start');
        expect(soundSensor).to.haveOwnProperty('getAveragedValue');
        expect(soundSensor).to.haveOwnProperty('setScale');
      });

      it('with a non-null value immediately after initialization', () => {
        expect(soundSensor.value).not.to.be.null;
        expect(soundSensor.value).to.equal(INITIAL_ANALOG_VALUE);
      });

      describe('setScale', () => {
        it('adjusts the range of values provided by .value', () => {
          // Before setting scale, raw values are passed through to .value
          setSensorAnalogValue(soundSensor, 0);
          expect(soundSensor.value).to.equal(0);
          setSensorAnalogValue(soundSensor, 500);
          expect(soundSensor.value).to.equal(500);
          setSensorAnalogValue(soundSensor, 1023);
          expect(soundSensor.value).to.equal(1023);

          soundSensor.setScale(0, 100);

          // After setting scale, raw values are mapped to the new range
          setSensorAnalogValue(soundSensor, 0);
          expect(soundSensor.value).to.equal(0);
          setSensorAnalogValue(soundSensor, 512);
          expect(soundSensor.value).to.equal(50);
          setSensorAnalogValue(soundSensor, 1023);
          expect(soundSensor.value).to.equal(100);
        });

        it('clamps values provided by .value to the given range', () => {
          // Before setting scale, values are not clamped
          // (although this should not be necessary)
          setSensorAnalogValue(soundSensor, -1);
          expect(soundSensor.value).to.equal(-1);
          setSensorAnalogValue(soundSensor, 1024);
          expect(soundSensor.value).to.equal(1024);

          soundSensor.setScale(0, 100);

          // Afterward, values ARE clamped
          setSensorAnalogValue(soundSensor, -1);
          expect(soundSensor.value).to.equal(0);
          setSensorAnalogValue(soundSensor, 1024);
          expect(soundSensor.value).to.equal(100);
        });

        it('rounds values provided by .value to integers', () => {
          // Before setting scale, raw values are not rounded
          // (although this should not be necessary)
          setSensorAnalogValue(soundSensor, Math.PI);
          expect(soundSensor.value).to.equal(Math.PI);
          setSensorAnalogValue(soundSensor, 543.21);
          expect(soundSensor.value).to.equal(543.21);

          soundSensor.setScale(0, 100);

          // Afterward, only integer values are returned
          for (let i = 0; i < 1024; i++) {
            setSensorAnalogValue(soundSensor, i);
            expect(soundSensor.value % 1).to.equal(0);
          }
        });
      });
    });

    describe('tempSensor', () => {
      let tempSensor;

      beforeEach(() => {
        return createCircuitPlaygroundComponents(board)
          .then((components) => tempSensor = components.tempSensor);
      });

      it('creates a five.Thermometer', () => {
        expect(tempSensor).to.be.an.instanceOf(five.Thermometer);
      });

      it('bound to the board controller', () => {
        expect(tempSensor.board).to.equal(board);
      });

      it('on pin 0', () => {
        expect(tempSensor.pin).to.equal(0);
      });

      it('with a F (farenheit) property', () => {
        expect(tempSensor).to.have.ownProperty('F');
      });

      it('and a C (celsius) property', () => {
        expect(tempSensor).to.have.ownProperty('C');
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

    describe('lightSensor', () => {
      let lightSensor;

      beforeEach(() => {
        return createCircuitPlaygroundComponents(board).then((components) => {
          lightSensor = components.lightSensor;
        });
      });

      it('creates a five.Sensor', () => {
        expect(lightSensor).to.be.an.instanceOf(five.Sensor);
      });

      it('bound to the board controller', () => {
        expect(lightSensor.board).to.equal(board);
      });

      it('on pin 5', () => {
        expect(lightSensor.pin).to.equal(5);
      });

      it('with sensor methods', () => {
        expect(lightSensor).to.haveOwnProperty('start');
        expect(lightSensor).to.haveOwnProperty('getAveragedValue');
        expect(lightSensor).to.haveOwnProperty('setScale');
      });

      it('with a non-null value immediately after initialization', () => {
        expect(lightSensor.value).not.to.be.null;
        expect(lightSensor.value).to.equal(INITIAL_ANALOG_VALUE);
      });

      describe('setScale', () => {
        it('adjusts the range of values provided by .value', () => {
          // Before setting scale, raw values are passed through to .value
          setSensorAnalogValue(lightSensor, 0);
          expect(lightSensor.value).to.equal(0);
          setSensorAnalogValue(lightSensor, 500);
          expect(lightSensor.value).to.equal(500);
          setSensorAnalogValue(lightSensor, 1023);
          expect(lightSensor.value).to.equal(1023);

          lightSensor.setScale(0, 100);

          // After setting scale, raw values are mapped to the new range
          setSensorAnalogValue(lightSensor, 0);
          expect(lightSensor.value).to.equal(0);
          setSensorAnalogValue(lightSensor, 512);
          expect(lightSensor.value).to.equal(50);
          setSensorAnalogValue(lightSensor, 1023);
          expect(lightSensor.value).to.equal(100);
        });

        it('clamps values provided by .value to the given range', () => {
          // Before setting scale, values are not clamped
          // (although this should not be necessary)
          setSensorAnalogValue(lightSensor, -1);
          expect(lightSensor.value).to.equal(-1);
          setSensorAnalogValue(lightSensor, 1024);
          expect(lightSensor.value).to.equal(1024);

          lightSensor.setScale(0, 100);

          // Afterward, values ARE clamped
          setSensorAnalogValue(lightSensor, -1);
          expect(lightSensor.value).to.equal(0);
          setSensorAnalogValue(lightSensor, 1024);
          expect(lightSensor.value).to.equal(100);
        });

        it('rounds values provided by .value to integers', () => {
          // Before setting scale, raw values are not rounded
          // (although this should not be necessary)
          setSensorAnalogValue(lightSensor, Math.PI);
          expect(lightSensor.value).to.equal(Math.PI);
          setSensorAnalogValue(lightSensor, 543.21);
          expect(lightSensor.value).to.equal(543.21);

          lightSensor.setScale(0, 100);

          // Afterward, only integer values are returned
          for (let i = 0; i < 1024; i++) {
            setSensorAnalogValue(lightSensor, i);
            expect(lightSensor.value % 1).to.equal(0);
          }
        });
      });
    });

    describe('buttonL', () => {
      let buttonL;

      beforeEach(() => {
        return createCircuitPlaygroundComponents(board)
          .then(components => buttonL = components.buttonL);
      });

      it('creates a five.Button', () => {
        expect(buttonL).to.be.an.instanceOf(five.Button);
      });

      it('bound to the board controller', () => {
        expect(buttonL.board).to.equal(board);
      });

      it('on pin 4', () => {
        expect(buttonL.pin).to.equal(4);
      });

      it('with an isPressed property', () => {
        expect(buttonL).to.haveOwnProperty('isPressed');
        expect(buttonL.isPressed).to.be.false;
      });
    });

    describe('buttonR', () => {
      let buttonR;

      beforeEach(() => {
        return createCircuitPlaygroundComponents(board)
          .then(components => buttonR = components.buttonR);
      });

      it('creates a five.Button', () => {
        expect(buttonR).to.be.an.instanceOf(five.Button);
      });

      it('bound to the board controller', () => {
        expect(buttonR.board).to.equal(board);
      });

      it('on pin 19', () => {
        expect(buttonR.pin).to.equal(19);
      });

      it('with an isPressed property', () => {
        expect(buttonR).to.haveOwnProperty('isPressed');
        expect(buttonR.isPressed).to.be.false;
      });
    });

    describe('accelerometer', () => {
      let accelerometer;

      beforeEach(() => {
        return createCircuitPlaygroundComponents(board)
          .then(components => accelerometer = components.accelerometer);
      });

      it('creates a five.Accelerometer', () => {
        expect(accelerometer).to.be.an.instanceOf(five.Accelerometer);
      });

      it('bound to the board controller', () => {
        expect(accelerometer.board).to.equal(board);
      });

      // No pin?  Doesn't report one.

      it('with a start() method', () => {
        accelerometer.io.sysexCommand.reset(); // Reset spy
        expect(accelerometer).to.haveOwnProperty('start');
        expect(accelerometer.io.sysexCommand).not.to.have.been.called;

        accelerometer.start();
        expect(accelerometer.io.sysexCommand).to.have.been.calledOnce
            .and.calledWith([CP_COMMAND, CP_ACCEL_STREAM_ON]);
      });

      it('and a getOrientation method', () => {
        expect(accelerometer).to.haveOwnProperty('getOrientation');
        expect(accelerometer.getOrientation('x')).to.equal(0);
        expect(accelerometer.getOrientation('y')).to.equal(0);
        expect(accelerometer.getOrientation('z')).to.equal(0);
      });

      it('getOrientation returns an array if called without any arguments', () => {
        const stub = sinon.stub(accelerometer, 'getOrientation');
        stub.withArgs('x').returns(1);
        stub.withArgs('y').returns(2);
        stub.withArgs('z').returns(3);
        stub.callThrough(); // Call original method if none of the above matched.

        expect(accelerometer.getOrientation()).to.deep.equal([
          accelerometer.getOrientation('x'),
          accelerometer.getOrientation('y'),
          accelerometer.getOrientation('z'),
        ]);

        stub.restore();
      });

      it('and a getAcceleration method', () => {
        expect(accelerometer).to.haveOwnProperty('getAcceleration');
        expect(accelerometer.getAcceleration('x')).to.equal(0);
        expect(accelerometer.getAcceleration('y')).to.equal(0);
        expect(accelerometer.getAcceleration('z')).to.equal(0);
        expect(accelerometer.getAcceleration('total')).to.equal(0);
      });

      it('getAcceleration returns an array if called without any arguments', () => {
        const stub = sinon.stub(accelerometer, 'getAcceleration');
        stub.withArgs('x').returns(1);
        stub.withArgs('y').returns(2);
        stub.withArgs('z').returns(3);
        stub.callThrough(); // Call original method if none of the above matched.

        expect(accelerometer.getAcceleration()).to.deep.equal([
          accelerometer.getAcceleration('x'),
          accelerometer.getAcceleration('y'),
          accelerometer.getAcceleration('z'),
        ]);

        stub.restore();
      });
    });

    describe('touchPads', () => {
      // TODO (bbuchanan): Remove when maker-captouch is on by default.
      before(() => experiments.setEnabled('maker-captouch', true));
      after(() => experiments.setEnabled('maker-captouch', false));

      it('only creates one five.Touchpad for all the TouchSensors', () => {
        return createCircuitPlaygroundComponents(board).then(components => {
          const theOnlyTouchpadController = components.touchPad0.touchpadsController_;
          expect(theOnlyTouchpadController.board).to.equal(board);
          TOUCH_PINS.forEach(pin => {
            expect(components[`touchPad${pin}`].touchpadsController_).to.equal(theOnlyTouchpadController);
          });
        });
      });

      TOUCH_PINS.forEach(pin => {
        describe(`touchPin${pin}`, () => {
          let touchPad;

          beforeEach(() => {
            return createCircuitPlaygroundComponents(board).then(components => {
              touchPad = components[`touchPad${pin}`];
            });
          });

          it('creates a TouchSensor', () => {
            expect(touchPad).to.be.an.instanceOf(TouchSensor);
          });

          it(`on pin ${pin}`, () => {
            expect(touchPad.pinIndex_).to.equal(pin);
          });

          // See TouchSensorTest.js for more details on TouchSensors.
        });
      });
    });
  });

  // TODO (bbuchanan): Remove this whole describe block when maker-captouch is on by default.
  describe('destroyCircuitPlaygroundComponents() with capTouch enabled', () => {
    let components;

    before(() => experiments.setEnabled('maker-captouch', true));
    after(() => experiments.setEnabled('maker-captouch', false));

    beforeEach(() => {
      return createCircuitPlaygroundComponents(board)
          .then(c => components = c);
    });

    it('destroys everything that createCircuitPlaygroundComponents creates', () => {
      expect(Object.keys(components)).to.have.length(17);
      destroyCircuitPlaygroundComponents(components);
      expect(Object.keys(components)).to.have.length(0);
    });

    it('does not destroy components not created by createCircuitPlaygroundComponents', () => {
      components.someOtherComponent = {};
      expect(Object.keys(components)).to.have.length(18);
      destroyCircuitPlaygroundComponents(components);
      expect(Object.keys(components)).to.have.length(1);
      expect(components).to.haveOwnProperty('someOtherComponent');
    });
  });

  describe('destroyCircuitPlaygroundComponents()', () => {
    let components;

    beforeEach(() => {
      return createCircuitPlaygroundComponents(board)
        .then(c => components = c);
    });

    it('can be safely called on empty object', () => {
      expect(() => {
        destroyCircuitPlaygroundComponents({});
      }).not.to.throw;
    });

    it('destroys everything that createCircuitPlaygroundComponents creates', () => {
      expect(Object.keys(components)).to.have.length(10);
      destroyCircuitPlaygroundComponents(components);
      expect(Object.keys(components)).to.have.length(0);
    });

    it('does not destroy components not created by createCircuitPlaygroundComponents', () => {
      components.someOtherComponent = {};
      expect(Object.keys(components)).to.have.length(11);
      destroyCircuitPlaygroundComponents(components);
      expect(Object.keys(components)).to.have.length(1);
      expect(components).to.haveOwnProperty('someOtherComponent');
    });

    it('calls stop on every color LED', () => {
      const spies = components.colorLeds.map(led => sinon.spy(led, 'stop'));
      destroyCircuitPlaygroundComponents(components);
      spies.forEach(spy => expect(spy).to.have.been.calledOnce);
    });

    it('stops Led.RGB.blink()', () => {
      // Spy on 'toggle' which blink calls internally.
      const spy = sinon.spy(components.colorLeds[0], 'toggle');

      // Set up a blink behavior
      components.colorLeds[0].blink(50);
      expect(spy).not.to.have.been.called;

      // Make sure the blink has started
      clock.tick(50);
      expect(spy).to.have.been.calledOnce;
      clock.tick(50);
      expect(spy).to.have.been.calledTwice;

      // Now destroy the component
      destroyCircuitPlaygroundComponents(components);

      // Blink should no longer be calling toggle().
      clock.tick(50);
      expect(spy).to.have.been.calledTwice;
      clock.tick(50);
      expect(spy).to.have.been.calledTwice;
    });

    it('calls stop on the red LED', () => {
      const spy = sinon.spy(components.led, 'stop');
      destroyCircuitPlaygroundComponents(components);
      expect(spy).to.have.been.calledOnce;
    });

    it('stops Led.blink()', () => {
      // Spy on 'toggle' which blink calls internally.
      const spy = sinon.spy(components.led, 'toggle');

      // Set up a blink behavior
      components.led.blink(50);
      expect(spy).not.to.have.been.called;

      // Make sure the blink has started
      clock.tick(50);
      expect(spy).to.have.been.calledOnce;
      clock.tick(50);
      expect(spy).to.have.been.calledTwice;

      // Now destroy the component
      destroyCircuitPlaygroundComponents(components);

      // Blink should no longer be calling toggle().
      clock.tick(50);
      expect(spy).to.have.been.calledTwice;
      clock.tick(50);
      expect(spy).to.have.been.calledTwice;
    });

    it('calls stop on the buzzer', () => {
      const spy = sinon.spy(components.buzzer, 'stop');
      destroyCircuitPlaygroundComponents(components);
      expect(spy).to.have.been.calledOnce;
    });

    ['play', 'playSong', 'playNotes'].forEach(methodUnderTest => {
      describe(`stops Piezo.${methodUnderTest}()`, () => {
        let frequencySpy;

        beforeEach(() => {
          // Spy on 'frequency' which play calls internally.
          frequencySpy = sinon.spy(Playground.Piezo.frequency, 'value');
        });

        afterEach(() => {
          frequencySpy.restore();
        });

        it('stops Piezo.play()', function () {
          // Make a new one since we're spying on a 'prototype'
          return createCircuitPlaygroundComponents(board).then(({buzzer}) => {
          // Set up a song
          const tempoBPM = 120;
          buzzer[methodUnderTest](['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'], tempoBPM);
          expect(frequencySpy).to.have.been.calledOnce;

          // Make sure the song is playing
          const msPerBeat = 15000 / tempoBPM;
          clock.tick(msPerBeat);
          expect(frequencySpy).to.have.been.calledTwice;
          clock.tick(msPerBeat);
          expect(frequencySpy).to.have.been.calledThrice;

          // Now destroy the component(s)
          destroyCircuitPlaygroundComponents({buzzer});

          // And ensure the song has stopped
          clock.tick(msPerBeat);
          expect(frequencySpy).to.have.been.calledThrice;
          clock.tick(msPerBeat);
          expect(frequencySpy).to.have.been.calledThrice;
        });
      });
     });
    });

    it('calls disable on the soundSensor', () => {
      const spy = sinon.spy(components.soundSensor, 'disable');
      destroyCircuitPlaygroundComponents(components);
      expect(spy).to.have.been.calledOnce;
    });

    it('calls disable on the lightSensor', () => {
      const spy = sinon.spy(components.lightSensor, 'disable');
      destroyCircuitPlaygroundComponents(components);
      expect(spy).to.have.been.calledOnce;
    });

    it('calls disable on the tempSensor', () => {
      const spy = sinon.spy(components.tempSensor, 'disable');
      destroyCircuitPlaygroundComponents(components);
      expect(spy).to.have.been.calledOnce;
    });

    it('calls stop on the accelerometer', () => {
      // Spy on the controller template, because stop() ends up readonly on
      // the returned component.
      const spy = sinon.spy(Playground.Accelerometer.stop, 'value');
      return createCircuitPlaygroundComponents(board).then(components => {
        destroyCircuitPlaygroundComponents(components);

        let assertionError;
        try {
          expect(spy).to.have.been.calledOnce;
        } catch (e) {
          assertionError = e;
        }

        spy.restore();
        if (assertionError) {
          throw assertionError;
        }
      });
    });
  });

  describe(`componentConstructors`, () => {
    it('contains a five.Board constructor', () => {
      expect(Object.values(componentConstructors)).to.contain(five.Board);
    });

    it('contains a constructor for every created component', () => {
      const constructors = Object.values(componentConstructors);

      function isPlainObject(obj) {
        // Check whether the constructor is native object
        return obj.constructor === ({}).constructor;
      }

      // Recursively walk component map to check all components
      function hasNeededConstructors(x) {
        if (Array.isArray(x)) {
          x.forEach(hasNeededConstructors);
        } else if (isPlainObject(x)) {
          Object.values(x).forEach(hasNeededConstructors);
        } else {
          expect(constructors).to.contain(x.constructor);
        }
      }

      return createCircuitPlaygroundComponents(board).then(components => {
        hasNeededConstructors(components);
      });
    });

    it('uses the constructor name', () => {
      Object.keys(componentConstructors).forEach(key => {
        expect(key).to.equal(componentConstructors[key].name);
      });
    });
  });

  /**
   * Simulate a raw value coming back from the board on the given component's pin.
   * @param {five.Sensor|five.Thermometer} component
   * @param {number} rawValue - usually in range 0-1023.
   * @throws if nothing is monitoring the given analog pin
   */
  function setSensorAnalogValue(component, rawValue) {
    const {board, pin} = component;
    const readCallback = board.io.analogRead.args.find(callArgs => callArgs[0] === pin)[1];
    readCallback(rawValue);
  }
});

/**
 * Generate a test board object.
 * From rwaldron/johnny-five's newBoard() test helper:
 * https://github.com/rwaldron/johnny-five/blob/dd47719/test/common/bootstrap.js#L83
 * @returns {*}
 */
function newBoard() {
  // We use real playground-io, but our test configuration swaps in mock-firmata
  // for real firmata (see webpack.js) changing Playground's parent class.
  const io = new Playground({});

  io.SERIAL_PORT_IDs.DEFAULT = 0x08;

  // mock-firmata doesn't implement these (yet) - and we want to monitor how
  // they get called.
  io.sysexCommand = sinon.spy();
  io.sysexResponse = sinon.spy();

  // Spy on this so we can retrieve and use the registered callbacks if needed
  sinon.spy(io, 'analogRead');

  const board = new five.Board({
    io: io,
    debug: false,
    repl: false
  });

  io.emit("connect");
  io.emit("ready");

  return board;
}
