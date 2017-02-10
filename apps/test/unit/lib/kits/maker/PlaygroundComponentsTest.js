/** @file Playground Component setup tests */
import five from 'johnny-five';
import Playground from 'playground-io';
import {expect} from '../../../../util/configuredChai';
import sinon from 'sinon';
import {
  initializeAccelerometer,
  initializeButton,
  initializeColorLeds,
  initializeLightSensor,
  initializeSoundSensor,
  initializeTouchPads,
} from '@cdo/apps/lib/kits/maker/PlaygroundComponents';
import TouchSensor from '@cdo/apps/lib/kits/maker/TouchSensor';

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
      // TODO (bbuchanan): Record what these calls mean.
      expect(board.io.sysexCommand.getCall(i*2)).to.have.been.calledWith([0x40, 0x10, i, 0, 0, 0, 0]);
      expect(board.io.sysexCommand.getCall(i*2+1)).to.have.been.calledWith([0x40, 0x11]);
    }
  });

  it('can initialize a second set of leds with a second board', function () {
    // Checks a necessary condition for a true johnny-five level reset.
    const boardOne = newBoard();
    const controllers = initializeColorLeds(boardOne);
    expect(controllers[0].board === boardOne).to.be.true;
    expect(boardOne.io.sysexCommand.callCount).to.equal(20);

    const boardTwo = newBoard();
    const newControllers = initializeColorLeds(boardTwo);
    expect(newControllers[0].board === boardTwo).to.be.true;
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

describe('initializeLightSensor()', () => {
  it('initializes one sensor', function () {
    const board = newBoard();
    const sensor = initializeLightSensor(board);
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

describe('initializeAccelerometer()', () => {
  it('initializes accelerometer', function () {
    const board = newBoard();
    const sensor = initializeAccelerometer(board);
    expect(sensor).to.be.an.instanceOf(five.Accelerometer);
    expect(sensor).to.haveOwnProperty('getOrientation');
    expect(sensor).to.haveOwnProperty('getAcceleration');
    // Doesn't use sysex at first
    expect(board.io.sysexCommand.callCount).to.equal(0);
  });
});

describe('initializeTouchPads()', () => {
  it('initializes all touch pads', function () {
    const board = newBoard();
    const pads = initializeTouchPads(board);
    expect(Object.keys(pads)).to.have.length(8);
    for (const key in pads) {
      if (!pads.hasOwnProperty(key)) continue;
      const pad = pads[key];
      expect(/touchPad\d+/.test(key)).to.be.true;
      expect(pad).to.be.an.instanceOf(TouchSensor);
      expect(pad.touchpadsController_).to.be.an.instanceOf(five.Touchpad);
    }

    // Check exact sysex calls
    expect(board.io.sysexCommand.callCount).to.equal(8);
    // TODO (bbuchanan): Record what these calls mean.
    expect(board.io.sysexCommand.getCall(0)).to.have.been.calledWith([0x40, 0x41, 0]);
    expect(board.io.sysexCommand.getCall(1)).to.have.been.calledWith([0x40, 0x41, 1]);
    expect(board.io.sysexCommand.getCall(2)).to.have.been.calledWith([0x40, 0x41, 2]);
    expect(board.io.sysexCommand.getCall(3)).to.have.been.calledWith([0x40, 0x41, 3]);
    expect(board.io.sysexCommand.getCall(4)).to.have.been.calledWith([0x40, 0x41, 6]);
    expect(board.io.sysexCommand.getCall(5)).to.have.been.calledWith([0x40, 0x41, 9]);
    expect(board.io.sysexCommand.getCall(6)).to.have.been.calledWith([0x40, 0x41, 10]);
    expect(board.io.sysexCommand.getCall(7)).to.have.been.calledWith([0x40, 0x41, 12]);
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
