import sinon from 'sinon';
import {expect} from '../../../../util/configuredChai';
import {EventEmitter} from 'events'; // see node-libs-browser
import Playground from 'playground-io';
import CircuitPlaygroundBoard from '@cdo/apps/lib/kits/maker/CircuitPlaygroundBoard';
import {SONG_CHARGE} from '@cdo/apps/lib/kits/maker/PlaygroundConstants';

// Polyfill node process.hrtime for the browser, which gets used by johnny-five
process.hrtime = require('browser-process-hrtime');

describe('CircuitPlaygroundBoard', () => {
  let board, playground;

  beforeEach(() => {
    // We use real playground-io, but our test configuration swaps in mock-firmata
    // for real firmata (see webpack.js) changing Playground's parent class.
    sinon.stub(CircuitPlaygroundBoard, 'makePlaygroundTransport').callsFake(() => {
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
      sinon.spy(playground, 'digitalRead');
      sinon.spy(playground, 'analogWrite');
      sinon.spy(playground, 'analogRead');

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
  });

  afterEach(() => {
    playground = undefined;
    board = undefined;
    CircuitPlaygroundBoard.makePlaygroundTransport.restore();
    EventEmitter.prototype.once.restore();
  });

  it('is an EventEmitter', () => {
    expect(board).to.be.an.instanceOf(EventEmitter);
  });

  describe(`connect()`, () => {
    it('initializes a set of components', () => {
      return board.connect().then(() => {
        // TODO (captouch): Add eight more when we re-enable
        expect(Object.keys(board.prewiredComponents_)).to.have.length(16);
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
        // TODO (captouch): Uncomment when we re-enable
        // expect(board.prewiredComponents_.touchPad0).to.be.a('object');
        // expect(board.prewiredComponents_.touchPad1).to.be.a('object');
        // expect(board.prewiredComponents_.touchPad2).to.be.a('object');
        // expect(board.prewiredComponents_.touchPad3).to.be.a('object');
        // expect(board.prewiredComponents_.touchPad6).to.be.a('object');
        // expect(board.prewiredComponents_.touchPad9).to.be.a('object');
        // expect(board.prewiredComponents_.touchPad10).to.be.a('object');
        // expect(board.prewiredComponents_.touchPad12).to.be.a('object');
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
      expect(() => board.initializeComponents())
          .to.throw(Error, 'Cannot initialize components: Not connected to board firmware.');
    });

    it('initializes a set of components', () => {
      return board.connectToFirmware()
        .then(() => board.initializeComponents())
        .then(() => {
          // TODO (captouch): Add 8 when we re-enable
          expect(Object.keys(board.prewiredComponents_)).to.have.length(16);
        });
    });
  });

  describe(`destroy()`, () => {
    it('sends the board reset signal', () => {
      return board.connect().then(() => {
        board.destroy();
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
        board.destroy();
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

  describe(`installOnInterpreter(jsInterpreter)`, () => {
    let jsInterpreter;

    beforeEach(() => {
      jsInterpreter = {
        createGlobalProperty: sinon.spy(),
        addCustomMarshalObject: sinon.spy(),
      };
      return board.connect().then(() => {
        board.installOnInterpreter(jsInterpreter);
      });
    });

    it('adds component constructors to the customMarshalObjectList', () => {
      expect(jsInterpreter.addCustomMarshalObject.callCount).to.equal(13);
    });

    it('adds component constructors as global properties on the jsInterpreter', () => {
      expect(jsInterpreter.createGlobalProperty).to.have.been.called;
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
      board.connect().then(() => {
        // Mock board components that will be used to celebrate
        const buzzer = sinon.mock(board.prewiredComponents_.buzzer);
        const leds = board.prewiredComponents_.colorLeds.map(led => sinon.mock(led));

        // Right after the first call we'll expect the buzzer to start playing
        // its song.  This method uses a promise chain for animations, so we
        // have to yield the test 'thread' to let the promise chain run until
        // it needs to wait for something.
        buzzer.expects('play').once().calledWith(SONG_CHARGE, 104);
        // Set up no expectations for leds - they don't do anything immediately.

        // Now invoke the method under test and yield to the promise chain once.
        const promiseUnderTest = board.celebrateSuccessfulConnection();
        yieldToPromiseChain(() => {
          // Check expected calls after first invocation and yield.
          buzzer.verify();
          leds.forEach(led => led.verify());

          // The initial invocation set up timers to enable each LED in sequence
          for (let i = 0; i < leds.length; i++) {
            leds[i].expects('color').once().calledWith('blue');
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
      }).catch(done);
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
  });

  describe(`onBoardEvent(component, event, callback)`, () => {
    it('forwards the call to the component', () => {
      const fakeEventEmitter = { on: sinon.spy() };
      const event = 'someEvent';
      const callback = () => {};
      board.onBoardEvent(fakeEventEmitter, event, callback);
      expect(fakeEventEmitter.on).to.have.been.calledWith(event, callback);
    });

    describe(`event aliases`, () => {
      let fakeEventEmitter, callback;

      beforeEach(function () {
        fakeEventEmitter = { on: sinon.spy() };
        callback = () => {};
      });

      it(`aliases 'tap:single' event to 'singleTap'`, function () {
        board.onBoardEvent(fakeEventEmitter, 'singleTap', callback);
        expect(fakeEventEmitter.on).to.have.been.calledWith('tap:single', callback);
      });

      it(`aliases 'tap:double' event to 'doubleTap'`, function () {
        board.onBoardEvent(fakeEventEmitter, 'doubleTap', callback);
        expect(fakeEventEmitter.on).to.have.been.calledWith('tap:double', callback);
      });
    });
  });
});
