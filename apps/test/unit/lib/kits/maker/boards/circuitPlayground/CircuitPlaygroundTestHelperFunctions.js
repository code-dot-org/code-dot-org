import five from '@code-dot-org/johnny-five';
import Playground from 'playground-io';
import sinon from 'sinon';

/**
 * Simulate a raw value coming back from the board on the given component's pin.
 * @param {five.Sensor|five.Thermometer} component
 * @param {number} rawValue - usually in range 0-1023.
 * @throws if nothing is monitoring the given analog pin
 */
export function setSensorAnalogValue(component, rawValue) {
  const {board, pin} = component;
  const readCallback = board.io.analogRead.args.find(
    callArgs => callArgs[0] === pin
  )[1];
  readCallback(rawValue);
}

/**
 * Generate a test board object.
 * From rwaldron/johnny-five's newBoard() test helper:
 * https://github.com/rwaldron/johnny-five/blob/dd47719/test/common/bootstrap.js#L83
 * @returns {*}
 */
export function newBoard() {
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

  io.emit('connect');
  io.emit('ready');

  return board;
}
