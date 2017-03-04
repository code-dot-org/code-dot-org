import sinon from 'sinon';
import {expect} from '../../../../util/configuredChai';
import {EventEmitter} from 'events'; // see node-libs-browser
import Playground from 'playground-io';
import CircuitPlaygroundBoard from '@cdo/apps/lib/kits/maker/CircuitPlaygroundBoard';

// Polyfill node process.hrtime for the browser, which gets used by johnny-five
process.hrtime = require('browser-process-hrtime');

describe('CircuitPlaygroundBoard', () => {
  let board, playground;

  beforeEach(() => {
    // We use real playground-io, but our test configuration swaps in mock-firmata
    // for real firmata (see webpack.js) changing Playground's parent class.
    sinon.stub(CircuitPlaygroundBoard, 'makePlaygroundTransport', () => {
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

    // Construct a board to test on
    board = new CircuitPlaygroundBoard();
  });

  afterEach(() => {
    CircuitPlaygroundBoard.makePlaygroundTransport.restore();
  });

  it('is an EventEmitter', () => {
    expect(board).to.be.an.instanceOf(EventEmitter);
  });

  describe(`connect()`, () => {
    it('returns a Promise that resolves when the board is ready to use', () => {
      return board.connect();
    });

    it('initializes a set of components', () => {
      return board.connect().then(() => {
        expect(Object.keys(board.prewiredComponents_)).to.have.length(24);
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
      return board.connectToFirmware().then(() => {
        board.initializeComponents();
        expect(Object.keys(board.prewiredComponents_)).to.have.length(24);
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
  });

  describe(`installOnInterpreter(codegen, jsInterpreter)`, () => {
    it('adds component constructors to the customMarshalObjectList', () => {
      return board.connect().then(() => {
        const codegen = {
          customMarshalObjectList: []
        };
        const interpreter = {
          createGlobalProperty: sinon.spy()
        };
        board.installOnInterpreter(codegen, interpreter);
        expect(codegen.customMarshalObjectList).to.have.length(13);
      });
    });

    it('adds component constructors as global properties on the interpreter', () => {
      return board.connect().then(() => {
        const codegen = {
          customMarshalObjectList: []
        };
        const interpreter = {
          createGlobalProperty: sinon.spy()
        };
        board.installOnInterpreter(codegen, interpreter);
        expect(interpreter.createGlobalProperty).to.have.been.called;
      });
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
