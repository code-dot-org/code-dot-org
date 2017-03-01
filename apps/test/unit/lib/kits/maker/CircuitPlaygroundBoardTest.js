import sinon from 'sinon';
import {expect} from '../../../../util/configuredChai';
import {EventEmitter} from 'events'; // see node-libs-browser
import Playground from 'playground-io';
import CircuitPlaygroundBoard from '@cdo/apps/lib/kits/maker/CircuitPlaygroundBoard';

// Polyfilll node process.hrtime for the browser, which gets used by johnny-five
process.hrtime = require('browser-process-hrtime');

describe('CircuitPlaygroundBoard', () => {
  let board;

  beforeEach(() => {
    // Don't use real Serial Port
    sinon.stub(CircuitPlaygroundBoard, 'openSerialPort');

    // We use real playground-io, but our test configuration swaps in mock-firmata
    // for real firmata (see webpack.js) changing Playground's parent class.
    sinon.stub(CircuitPlaygroundBoard, 'makePlaygroundTransport', () => {
      const playground = new Playground({});
      playground.SERIAL_PORT_IDs.DEFAULT = 0x08;

      // mock-firmata doesn't implement these (yet) - and we want to monitor how
      // they are called.
      playground.sysexCommand = sinon.spy();
      playground.sysexResponse = sinon.spy();

      // Pretend to be totally ready
      playground.emit('connect');
      playground.emit('ready');

      return playground;
    });

    // Construct a board to test on
    board = new CircuitPlaygroundBoard();
  });

  afterEach(() => {
    CircuitPlaygroundBoard.openSerialPort.restore();
    CircuitPlaygroundBoard.makePlaygroundTransport.restore();
  });

  it('is an EventEmitter', () => {
    expect(board).to.be.an.instanceOf(EventEmitter);
  });

  describe(`connect()`, () => {
    it('exists', () => {
      expect(board.connect).to.be.a('function');
    });

    it('returns a Promise that resolves when the board is ready to use', done => {
      board.connect().then(done);
    });
  });
});
