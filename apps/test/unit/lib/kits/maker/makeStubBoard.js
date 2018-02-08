import five from '@code-dot-org/johnny-five';
import Playground from 'playground-io';

export default function makeStubBoard() {
  // We use real playground-io, but our test configuration swaps in mock-firmata
  // for real firmata (see webpack.js) changing Playground's parent class.
  return new five.Board({
    io: new Playground({}),
    debug: false,
    repl: false
  });
}
