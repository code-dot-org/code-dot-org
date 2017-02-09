/** @file Playground Component setup tests */
import five from 'johnny-five';
import Playground from 'playground-io';
import {expect} from '../../../../util/configuredChai';
import sinon from 'sinon';
import {
  initializeButton,
  initializeColorLeds,
  initializeSoundSensor
} from '@cdo/apps/lib/kits/maker/PlaygroundComponents';

// Polyfill node's process.hrtime for the browser, gets used by johnny-five.
process.hrtime = require('browser-process-hrtime');

describe('initializeColorLeds()', () => {
  it('initializes all ten LEDs', function () {
    const board = newBoard();
    const components = initializeColorLeds(board);

    // Return ten controllers
    expect(Object.keys(components)).to.deep.equal([
      '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'
    ]);

    // Every returned controller is a five.Led.RGB
    Object.keys(components).forEach(key => {
      expect(components[key]).to.be.an.instanceOf(five.Led.RGB);
    });

    // 20 sysex calls during initialization, two per LED.
    for (let i = 0; i < 10; i++) {
      expect(board.io.sysexCommand.getCall(i*2)).to.have.been.calledWith([0x40, 0x10, i, 0, 0, 0, 0]);
      expect(board.io.sysexCommand.getCall(i*2+1)).to.have.been.calledWith([0x40, 0x11]);
    }
  });

  it('can initialize a second set of leds with a second board', function () {
    // Checks a necessary condition for a true johnny-five level reset.
    const boardOne = newBoard();
    const controllers = initializeColorLeds(boardOne);
    expect(controllers[0].board === boardOne);
    expect(boardOne.io.sysexCommand.callCount).to.equal(20);

    const boardTwo = newBoard();
    const newControllers = initializeColorLeds(boardTwo);
    expect(newControllers[0].board === boardTwo);
    expect(boardTwo.io.sysexCommand.callCount).to.equal(20);
  });
});

describe('initializeSoundSensor()', () => {
  it('initializes one sensor', function () {
    const board = newBoard();
    const sensor = initializeSoundSensor(board);
    expect(sensor).to.be.an.instanceOf(five.Sensor);
    // Doesn't use sysex at first
    expect(board.io.sysexCommand.callCount).to.equal(0);
  });
});

describe('initializeButton()', () => {
  it('initializes one button', function () {
    const board = newBoard();
    const button = initializeButton(board, '4');
    expect(button).to.be.an.instanceOf(five.Button);
    expect(button).to.haveOwnProperty('isPressed');
    // Doesn't use sysex at first
    expect(board.io.sysexCommand.callCount).to.equal(0);
  });
});

/**
 * Generate a test board object.
 * From rwaldrong/johnny-five's newBoard() test helper:
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
