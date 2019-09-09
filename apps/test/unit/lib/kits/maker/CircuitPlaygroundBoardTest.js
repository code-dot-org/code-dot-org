import _ from 'lodash';
import sinon from 'sinon';
import {expect} from '../../../../util/configuredChai';
import {EventEmitter} from 'events'; // see node-libs-browser
import Playground from 'playground-io';
import five from '@code-dot-org/johnny-five';
import CircuitPlaygroundBoard, {
  BOARD_TYPE
} from '@cdo/apps/lib/kits/maker/CircuitPlaygroundBoard';
import {
  SONG_CHARGE,
  EXTERNAL_PINS
} from '@cdo/apps/lib/kits/maker/PlaygroundConstants';
import Led from '@cdo/apps/lib/kits/maker/Led';
import {itImplementsTheMakerBoardInterface} from './MakerBoardTest';
import experiments from '@cdo/apps/util/experiments';
import ChromeSerialPort from 'chrome-serialport';
import {
  CIRCUIT_PLAYGROUND_EXPRESS_PORTS,
  CIRCUIT_PLAYGROUND_PORTS,
  FLORA_PORTS
} from './sampleSerialPorts';

// Polyfill node process.hrtime for the browser, which gets used by johnny-five
process.hrtime = require('browser-process-hrtime');

const xPins = ['A0', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7'];
const classicPins = [12, 6, 9, 10, 3, 2, 0, 1];

describe('CircuitPlaygroundBoard', () => {
  let board, playground;

  beforeEach(() => {
    // We use real playground-io, but our test configuration swaps in mock-firmata
    // for real firmata (see webpack.js) changing Playground's parent class.
    sinon
      .stub(CircuitPlaygroundBoard, 'makePlaygroundTransport')
      .callsFake(() => {
        playground = new Playground({});
        playground.SERIAL_PORT_IDs.DEFAULT = 0x08;

        // mock-firmata doesn't implement these (yet) - and we want to monitor how
        // they are called.
        playground.sysexCommand = sinon.spy();
        playground.sysexResponse = sinon.spy();

        // Also spy on these
        sinon.spy(playground, 'reset');
        sinon.spy(playground, 'pinMode');
        sinon.spy(playground, 'digitalWrite');
        sinon.stub(playground, 'digitalRead').callsArgWith(1, 0);
        sinon.spy(playground, 'analogWrite');
        sinon.stub(playground, 'analogRead').callsArgWith(1, 0);

        // Pretend to be totally ready
        playground.emit('connect');
        playground.emit('ready');

        return playground;
      });

    // Our sensors and thermometer block initialization until they receive data
    // over the wire.  That's not great for unit tests, so here we stub waiting
    // for data to resolve immediately.
    sinon.stub(EventEmitter.prototype, 'once');
    EventEmitter.prototype.once.withArgs('data').callsArg(1);
    EventEmitter.prototype.once.callThrough();

    // Construct a board to test on
    board = new CircuitPlaygroundBoard();
    ChromeSerialPort.stub.setDeviceList(CIRCUIT_PLAYGROUND_PORTS);
  });

  afterEach(() => {
    playground = undefined;
    board = undefined;
    CircuitPlaygroundBoard.makePlaygroundTransport.restore();
    EventEmitter.prototype.once.restore();
    ChromeSerialPort.stub.reset();
  });

  itImplementsTheMakerBoardInterface(CircuitPlaygroundBoard);

  describe(`connect()`, () => {
    // TODO (bbuchanan): Remove when maker-captouch is on by default.
    before(() => experiments.setEnabled('maker-captouch', true));
    after(() => experiments.setEnabled('maker-captouch', false));

    it('initializes a set of components', () => {
      return board.connect().then(() => {
        expect(Object.keys(board.prewiredComponents_)).to.have.length(23);
        expect(board.prewiredComponents_.board).to.be.a('object');
        expect(board.prewiredComponents_.colorLeds).to.be.a('array');
        expect(board.prewiredComponents_.led).to.be.a('object');
        expect(board.prewiredComponents_.toggleSwitch).to.be.a('object');
        expect(board.prewiredComponents_.buzzer).to.be.a('object');
        expect(board.prewiredComponents_.soundSensor).to.be.a('object');
        expect(board.prewiredComponents_.tempSensor).to.be.a('object');
        expect(board.prewiredComponents_.lightSensor).to.be.a('object');
        expect(board.prewiredComponents_.accelerometer).to.be.a('object');
        expect(board.prewiredComponents_.buttonL).to.be.a('object');
        expect(board.prewiredComponents_.buttonR).to.be.a('object');
        expect(board.prewiredComponents_.touchPad0).to.be.a('object');
        expect(board.prewiredComponents_.touchPad2).to.be.a('object');
        expect(board.prewiredComponents_.touchPad3).to.be.a('object');
        expect(board.prewiredComponents_.touchPad6).to.be.a('object');
        expect(board.prewiredComponents_.touchPad9).to.be.a('object');
        expect(board.prewiredComponents_.touchPad10).to.be.a('object');
        expect(board.prewiredComponents_.touchPad12).to.be.a('object');
        expect(board.prewiredComponents_.INPUT).to.be.a('number');
        expect(board.prewiredComponents_.OUTPUT).to.be.a('number');
        expect(board.prewiredComponents_.ANALOG).to.be.a('number');
        expect(board.prewiredComponents_.PWM).to.be.a('number');
        expect(board.prewiredComponents_.SERVO).to.be.a('number');
      });
    });

    it(`establishes forwarding for the 'disconnect' event`, () => {
      return board.connect().then(() => {
        const spy = sinon.spy();
        board.on('disconnect', spy);
        expect(spy).not.to.have.been.called;
        playground.emit('disconnect');
        expect(spy).to.have.been.calledOnce;
      });
    });
  });

  describe(`connectToFirmware()`, () => {
    it('returns a Promise that resolves when the firmware is connected', () => {
      return board.connectToFirmware();
    });

    it('does not initialize components', () => {
      return board.connectToFirmware().then(() => {
        expect(board.prewiredComponents_).to.be.null;
      });
    });
  });

  describe(`initializeComponents()`, () => {
    it('throws if called before connecting to firmware', () => {
      expect(() => board.initializeComponents()).to.throw(
        Error,
        'Cannot initialize components: Not connected to board firmware.'
      );
    });

    it('initializes a set of components', () => {
      return board
        .connectToFirmware()
        .then(() => board.initializeComponents())
        .then(() => {
          expect(Object.keys(board.prewiredComponents_)).to.have.length(16);
        });
    });
  });

  describe(`destroy()`, () => {
    it('sends the board reset signal', () => {
      return board
        .connect()
        .then(() => board.destroy())
        .then(() => {
          expect(playground.reset).to.have.been.calledOnce;
        });
    });

    it('lets playground-io register its sysex response handler each time', () => {
      // This test covers a fix for a known accelerometer issue, where the
      // handler for accelerometer data is from the first Playground object
      // created on the page.
      // This is a fragile approach to testing this fix, but reproducing the
      // real problem in tests is going to be near-impossible since we stub
      // Firmata at the webpack layer in our tests.
      expect(Playground.hasRegisteredSysexResponse).to.be.undefined;
      return board.connect().then(() => {
        expect(playground.sysexResponse).to.have.been.calledTwice;
        expect(Playground.hasRegisteredSysexResponse).to.be.true;
        return board.destroy().then(() => {
          expect(Playground.hasRegisteredSysexResponse).to.be.undefined;

          const newBoard = new CircuitPlaygroundBoard();
          expect(Playground.hasRegisteredSysexResponse).to.be.undefined;
          return newBoard.connect().then(() => {
            // Connecting creates new a new playground transport, and a new spy
            expect(playground.sysexResponse).to.have.been.calledTwice;
            expect(Playground.hasRegisteredSysexResponse).to.be.true;
          });
        });
      });
    });

    it('stops any created Leds', () => {
      return board.connect().then(() => {
        const led1 = board.createLed(0);
        const led2 = board.createLed(1);
        sinon.spy(led1, 'stop');
        sinon.spy(led2, 'stop');

        expect(led1.stop).not.to.have.been.called;
        expect(led2.stop).not.to.have.been.called;

        return board.destroy().then(() => {
          expect(led1.stop).to.have.been.calledOnce;
          expect(led2.stop).to.have.been.calledOnce;
        });
      });
    });

    it('does not require special cleanup for created buttons', () => {
      return board.connect().then(() => {
        board.createButton(0);
        board.createButton(1);
        return board.destroy();
      });
    });
  });

  describe(`celebrateSuccessfulConnection()`, () => {
    let clock, yieldToPromiseChain;

    beforeEach(() => {
      // Promise chains and fake timers don't work together so well, so we
      // give ourselves a real `setTimeout(cb, 0)` function that will let any
      // promise chains run as far as they can before entering the callback.
      const realSetTimeout = window.setTimeout;
      yieldToPromiseChain = cb => realSetTimeout(cb, 0);

      // Now use fake timers so we can test exactly when the different commands
      // are sent to the board
      clock = sinon.useFakeTimers();
    });

    afterEach(() => {
      clock.restore();
    });

    it('plays a song and animates lights', done => {
      board
        .connect()
        .then(() => {
          // Mock board components that will be used to celebrate
          const buzzer = sinon.mock(board.prewiredComponents_.buzzer);
          const leds = board.prewiredComponents_.colorLeds.map(led =>
            sinon.mock(led)
          );

          // Right after the first call we'll expect the buzzer to start playing
          // its song.  This method uses a promise chain for animations, so we
          // have to yield the test 'thread' to let the promise chain run until
          // it needs to wait for something.
          buzzer
            .expects('play')
            .once()
            .calledWith(SONG_CHARGE, 104);
          // Set up no expectations for leds - they don't do anything immediately.

          // Now invoke the method under test and yield to the promise chain once.
          const promiseUnderTest = board.celebrateSuccessfulConnection();
          yieldToPromiseChain(() => {
            // Check expected calls after first invocation and yield.
            buzzer.verify();
            leds.forEach(led => led.verify());

            // The initial invocation set up timers to enable each LED in sequence
            for (let i = 0; i < leds.length; i++) {
              leds[i]
                .expects('color')
                .once()
                .calledWith('blue');
              clock.tick(80);
              leds[i].verify();
            }
            // No new buzzer commands
            buzzer.verify();

            // Yield to the promise chain again now that the initial
            // forEachLedInSequence promise has resolved.
            yieldToPromiseChain(() => {
              // The next 'from' set up timers to disable each LED in sequence
              for (let i = 0; i < leds.length; i++) {
                leds[i].expects('off').once();
                clock.tick(80);
                leds[i].verify();
              }
              // No new buzzer commands
              buzzer.verify();

              // Don't end the test unless the main promise resolves.
              // It should be resolved at this point, because enough time passed
              // while the LEDs were animating.
              promiseUnderTest.then(done);
            });
          });
        })
        .catch(done);
    });
  });

  describe(`pinMode(pin, modeConstant)`, () => {
    it('forwards the call to firmata', () => {
      return board.connect().then(() => {
        const pin = 11;
        const arg2 = 1023;
        board.pinMode(pin, arg2);
        expect(playground.pinMode).to.have.been.calledWith(pin, arg2);
      });
    });

    it('forwards the call to firmata with the modified CPX value', () => {
      return board.connect().then(() => {
        const pin = xPins[0];
        const arg2 = 1023;
        board.pinMode(pin, arg2);
        expect(playground.pinMode).to.have.been.calledWith(
          classicPins[0],
          arg2
        );
      });
    });
  });

  describe(`digitalWrite(pin, value)`, () => {
    it('forwards the call to firmata', () => {
      return board.connect().then(() => {
        const pin = 11;
        const arg2 = 1023;
        board.digitalWrite(pin, arg2);
        expect(playground.digitalWrite).to.have.been.calledWith(pin, arg2);
      });
    });

    it('forwards the call to firmata with the modified CPX value', () => {
      return board.connect().then(() => {
        const pin = xPins[1];
        const arg2 = 1023;
        board.digitalWrite(pin, arg2);
        expect(playground.digitalWrite).to.have.been.calledWith(
          classicPins[1],
          arg2
        );
      });
    });
  });

  describe(`digitalRead(pin, callback)`, () => {
    it('forwards the call to firmata', () => {
      return board.connect().then(() => {
        const pin = 11;
        const arg2 = () => {};
        board.digitalRead(pin, arg2);
        expect(playground.digitalRead).to.have.been.calledWith(pin, arg2);
      });
    });

    it('forwards the call to firmata with the modified CPX value', () => {
      return board.connect().then(() => {
        const pin = xPins[2];
        const arg2 = () => {};
        board.digitalRead(pin, arg2);
        expect(playground.digitalRead).to.have.been.calledWith(
          classicPins[2],
          arg2
        );
      });
    });
  });

  describe(`analogWrite(pin, value)`, () => {
    it('forwards the call to firmata', () => {
      return board.connect().then(() => {
        const pin = 11;
        const arg2 = 1023;
        board.analogWrite(pin, arg2);
        expect(playground.analogWrite).to.have.been.calledWith(pin, arg2);
      });
    });

    it('forwards the call to firmata with the modified CPX value', () => {
      return board.connect().then(() => {
        const pin = xPins[3];
        const arg2 = 1023;
        board.analogWrite(pin, arg2);
        expect(playground.analogWrite).to.have.been.calledWith(
          classicPins[3],
          arg2
        );
      });
    });
  });

  describe(`analogRead(pin, callback)`, () => {
    it('forwards the call to firmata', () => {
      return board.connect().then(() => {
        const pin = 11;
        const arg2 = () => {};
        board.analogRead(pin, arg2);
        expect(playground.analogRead).to.have.been.calledWith(pin, arg2);
      });
    });

    it('forwards the call to firmata with the modified CPX value', () => {
      return board.connect().then(() => {
        const pin = xPins[4];
        const arg2 = () => {};
        board.analogRead(pin, arg2);
        expect(playground.analogRead).to.have.been.calledWith(
          classicPins[4],
          arg2
        );
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

    it('returns false after destroying the board', () => {
      return board
        .connect()
        .then(() => board.destroy())
        .then(() => {
          expect(board.boardConnected()).to.be.false;
        });
    });
  });

  describe(`createLed(pin)`, () => {
    it('makes an LED controller', () => {
      return board.connect().then(() => {
        const pin = 13;
        const newLed = board.createLed(pin);
        expect(newLed).to.be.an.instanceOf(Led);
      });
    });

    it('uses the express pin value to make an LED controller with the classic pin value', () => {
      return board.connect().then(() => {
        const pin = xPins[5];
        const newLed = board.createLed(pin);
        expect(newLed.pin).to.equal(classicPins[5]);
      });
    });
  });

  describe(`createButton(pin)`, () => {
    it('makes a button controller', () => {
      return board.connect().then(() => {
        const pin = 13;
        const newButton = board.createButton(pin);
        expect(newButton).to.be.an.instanceOf(five.Button);
      });
    });

    it('uses the express pin value to make a button controller with the classic pin value', () => {
      return board.connect().then(() => {
        const pin = xPins[6];
        const newLed = board.createButton(pin);
        expect(newLed.pin).to.equal(classicPins[6]);
      });
    });

    it('configures the controller as a pullup if passed an external pin', () => {
      return board.connect().then(() => {
        EXTERNAL_PINS.forEach(pin => {
          const newButton = board.createButton(pin);
          expect(newButton.pullup).to.be.true;
        });
      });
    });

    it('does not configure the controller as a pullup if passed a non-external pin', () => {
      return board.connect().then(() => {
        _.range(21)
          .filter(pin => !EXTERNAL_PINS.includes(pin))
          .forEach(pin => {
            const newButton = board.createButton(pin);
            expect(newButton.pullup).to.be.false;
          });
      });
    });
  });

  describe(`mappedPin(pin)`, () => {
    it(`returns the Classic pin value of the provided Express pin value`, () => {
      for (let i = 0; i < xPins.length; i++) {
        expect(board.mappedPin(xPins[i])).to.equal(classicPins[i]);
      }
    });
  });

  describe(`detectBoardType()`, () => {
    it('sets the type of board detected for Classic boards', () => {
      board = new CircuitPlaygroundBoard(CIRCUIT_PLAYGROUND_PORTS[0]);
      expect(board.detectBoardType()).to.equal(BOARD_TYPE.CLASSIC);
    });

    it('sets the type of board detected for Express boards', () => {
      board = new CircuitPlaygroundBoard(CIRCUIT_PLAYGROUND_EXPRESS_PORTS[0]);
      expect(board.detectBoardType()).to.equal(BOARD_TYPE.EXPRESS);
    });

    it('sets the type of board detected for other boards', () => {
      board = new CircuitPlaygroundBoard(FLORA_PORTS[0]);
      expect(board.detectBoardType()).to.equal(BOARD_TYPE.OTHER);
    });
  });
});
