import five from '@code-dot-org/johnny-five';
import Playground from 'playground-io';

export function makeStubBoard() {
  // We use real playground-io, but our test configuration swaps in mock-firmata
  // for real firmata (see webpack.js) changing Playground's parent class.
  return new five.Board({
    io: new Playground({}),
    debug: false,
    repl: false
  });
}

export class MicrobitStubBoard {
  constructor() {
    this.eventListeners = [];
  }

  displayPlot() {}

  displayClear() {}

  scrollString() {}

  scrollInteger() {}

  receivedEvent(sourceID, eventID) {
    for (let f of this.eventListeners) {
      f.call(null, sourceID, eventID);
    }
  }

  addFirmataEventListener(eventListenerFunction) {
    this.eventListeners.push(eventListenerFunction);
  }

  addFirmataUpdateListener(updateListenerFunction) {}
}
