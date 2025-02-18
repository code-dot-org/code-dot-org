import five from '@code-dot-org/johnny-five';
import Playground from 'playground-io';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

const INITIAL_ANALOG_VALUE = 235;

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
 * @returns {five.Board}
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
    repl: false,
  });

  io.emit('connect');
  io.emit('ready');

  return board;
}

export function stubComponentInitialization(component) {
  // component would be a reference to five.Sensor, etc.
  sinon.stub(component.prototype, 'once');
  component.prototype.once.withArgs('data').callsFake(function (_, callback) {
    // Pretend we got a real analog value back on the component's pin.
    setSensorAnalogValue(this, INITIAL_ANALOG_VALUE);
    callback();
  });
}

export function restoreComponentInitialization(component) {
  component.prototype.once.restore();
}
