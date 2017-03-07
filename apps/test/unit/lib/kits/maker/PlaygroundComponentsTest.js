/** @file Playground Component setup tests */
import five from 'johnny-five';
import Playground from 'playground-io';
import {expect} from '../../../../util/configuredChai';
import sinon from 'sinon';
import {
  initializeCircuitPlaygroundComponents,
  deinitializeCircuitPlaygroundComponents,
  initializeAccelerometer,
  initializeButton,
  initializeColorLeds,
  initializeLightSensor,
  initializeSoundSensor,
  initializeThermometer,
  initializeTouchPads,
} from '@cdo/apps/lib/kits/maker/PlaygroundComponents';
import Piezo from '@cdo/apps/lib/kits/maker/Piezo';
import TouchSensor from '@cdo/apps/lib/kits/maker/TouchSensor';
import {TOUCH_PINS} from '@cdo/apps/lib/kits/maker/PlaygroundConstants';

// Polyfill node's process.hrtime for the browser, gets used by johnny-five.
process.hrtime = require('browser-process-hrtime');

describe('Circuit Playground Components', () => {
  let board;

  beforeEach(() => {
    board = newBoard();
  });

  describe(`initializeCircuitPlaygroundComponents()`, () => {
    it(`returns an exact set of expected components`, () => {
      // This test is here to warn us if we add a new component but
      // don't cover it with new tests.  If that happens, make sure you
      // add matching tests below!
      const components = initializeCircuitPlaygroundComponents(board);
      expect(Object.keys(components)).to.deep.equal([
         'colorLeds',
          'led',
          'toggleSwitch',
          'buzzer',
          'soundSensor',
          'tempSensor',
          'lightSensor',
          'accelerometer',
          'buttonL',
          'buttonR',
          'touchPad0',
          'touchPad1',
          'touchPad2',
          'touchPad3',
          'touchPad6',
          'touchPad9',
          'touchPad10',
          'touchPad12',
      ]);
    });

    it('can initialize a second set of components with a second board', () => {
      // Checks a necessary condition for a true johnny-five level reset.
      const boardOne = newBoard();
      const componentsOne = initializeCircuitPlaygroundComponents(boardOne);
      expect(componentsOne.led.board === boardOne).to.be.true;

      const boardTwo = newBoard();
      const componentsTwo = initializeCircuitPlaygroundComponents(boardTwo);
      expect(componentsTwo.led.board === boardTwo).to.be.true;
    });

    describe('colorLeds', () => {
      it('creates an array of controllers', () => {
        const {colorLeds} = initializeCircuitPlaygroundComponents(board);
        expect(colorLeds).to.be.an.instanceOf(Array);
        expect(colorLeds).to.have.length(10);
      });

      // Describe each Led by key/pin
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(pin => {
        describe(`colorLeds[${pin}]`, () => {
          let led;

          beforeEach(() => {
            led = initializeCircuitPlaygroundComponents(board).colorLeds[pin];
          });

          it('creates a five.Led.RGB', () => {
            expect(led).to.be.an.instanceOf(five.Led.RGB);
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
        led = initializeCircuitPlaygroundComponents(board).led;
      });

      it('creates a five.Led', () => {
        expect(led).to.be.an.instanceOf(five.Led);
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
        toggleSwitch = initializeCircuitPlaygroundComponents(board).toggleSwitch;
      });

      it('creates a five.Switch', () => {
        expect(toggleSwitch).to.be.an.instanceOf(five.Switch);
      });

      it('bound to the board controller', () => {
        expect(toggleSwitch.board).to.equal(board);
      });

      it('on pin 21', () => {
        expect(toggleSwitch.pin).to.equal(21);
      });

      // Note to self: Possible bug with toggleswitch.close event when it was
      // open on app start?
    });

    describe('buzzer', () => {
      let buzzer;

      beforeEach(() => {
        buzzer = initializeCircuitPlaygroundComponents(board).buzzer;
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
        soundSensor = initializeCircuitPlaygroundComponents(board).soundSensor;
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
    });

    describe('tempSensor', () => {
      let tempSensor;

      beforeEach(() => {
        tempSensor = initializeCircuitPlaygroundComponents(board).tempSensor;
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

      it('with sensor methods', () => {
        expect(tempSensor).to.haveOwnProperty('start');
        expect(tempSensor).to.haveOwnProperty('getAveragedValue');
        expect(tempSensor).to.haveOwnProperty('setScale');
      });
    });

    describe('lightSensor', () => {
      let lightSensor;

      beforeEach(() => {
        lightSensor = initializeCircuitPlaygroundComponents(board).lightSensor;
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
    });

    describe('buttonL', () => {
      let buttonL;

      beforeEach(() => {
        buttonL = initializeCircuitPlaygroundComponents(board).buttonL;
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
        buttonR = initializeCircuitPlaygroundComponents(board).buttonR;
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
        accelerometer = initializeCircuitPlaygroundComponents(board).accelerometer;
      });

      it('creates a five.Accelerometer', () => {
        expect(accelerometer).to.be.an.instanceOf(five.Accelerometer);
      });

      it('bound to the board controller', () => {
        expect(accelerometer.board).to.equal(board);
      });

      // No pin?  Doesn't report one.

      it('with a getOrientation method', () => {
        expect(accelerometer).to.haveOwnProperty('getOrientation');
        expect(accelerometer.getOrientation('x')).to.equal(0);
        expect(accelerometer.getOrientation('y')).to.equal(0);
        expect(accelerometer.getOrientation('z')).to.equal(0);
      });

      it('and a getAcceleration method', () => {
        expect(accelerometer).to.haveOwnProperty('getAcceleration');
        expect(accelerometer.getAcceleration('x')).to.equal(0);
        expect(accelerometer.getAcceleration('y')).to.equal(0);
        expect(accelerometer.getAcceleration('z')).to.equal(0);
        expect(accelerometer.getAcceleration('total')).to.equal(0);
      });
    });

    describe('touchPads', () => {
      it('only creates one five.Touchpad for all the TouchSensors', () => {
        const components = initializeCircuitPlaygroundComponents(board);
        const theOnlyTouchpadController = components.touchPad0.touchpadsController_;
        expect(theOnlyTouchpadController.board).to.equal(board);
        TOUCH_PINS.forEach(pin => {
          expect(components[`touchPad${pin}`].touchpadsController_).to.equal(theOnlyTouchpadController);
        });
      });

      TOUCH_PINS.forEach(pin => {
        describe(`touchPin${pin}`, () => {
          let touchPad;

          beforeEach(() => {
            touchPad = initializeCircuitPlaygroundComponents(board)[`touchPad${pin}`];
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

  describe('deinitializeCircuitPlaygroundComponents()', () => {
    it('calls stop on every color LED', () => {
      const components = {
        colorLeds: initializeColorLeds(board)
      };

      components.colorLeds.forEach(led => sinon.spy(led, 'stop'));

      deinitializeCircuitPlaygroundComponents(components);

      for (let i = 0; i < 10; i++) {
        expect(components.colorLeds[i].stop).to.have.been.calledOnce;
      }
    });

    it('calls stop on the red LED', () => {
      const components = {
        led: new five.Led({board, pin: 13})
      };

      sinon.spy(components.led, 'stop');

      deinitializeCircuitPlaygroundComponents(components);

      expect(components.led.stop).to.have.been.calledOnce;
    });

    it('calls stop on the buzzer', () => {
      const components = {
        buzzer: {stop: sinon.spy()}
      };

      deinitializeCircuitPlaygroundComponents(components);

      expect(components.buzzer.stop).to.have.been.calledOnce;
    });

    it('calls disable on the soundSensor', () => {
      const components = {
        soundSensor: initializeSoundSensor(board)
      };

      sinon.spy(components.soundSensor, 'disable');

      deinitializeCircuitPlaygroundComponents(components);

      expect(components.soundSensor.disable).to.have.been.calledOnce;
    });

    it('calls disable on the lightSensor', () => {
      const components = {
        lightSensor: initializeLightSensor(board)
      };

      sinon.spy(components.lightSensor, 'disable');

      deinitializeCircuitPlaygroundComponents(components);

      expect(components.lightSensor.disable).to.have.been.calledOnce;
    });

    it('calls stop on the accelerometer', () => {
      // Spy on the controller template, because stop() ends up readonly on
      // the returned component.
      const spy = sinon.spy(Playground.Accelerometer.stop, 'value');

      let err;
      try {
        const components = {
          accelerometer: initializeAccelerometer(board)
        };

        deinitializeCircuitPlaygroundComponents(components);

        expect(spy).to.have.been.calledOnce;
      } catch (e) {
        err = e;
      }

      // Finally - make sure we restore the spied method and rethrow any
      // exception (which could be a failed assertion)
      spy.restore();
      if (err) {
        throw err;
      }
    });
  });
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

  const board = new five.Board({
    io: io,
    debug: false,
    repl: false
  });

  io.emit("connect");
  io.emit("ready");

  return board;
}
