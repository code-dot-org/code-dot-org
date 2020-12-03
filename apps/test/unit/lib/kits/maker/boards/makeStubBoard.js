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
    this.updateListeners = [];
    this.analogChannel = new Array(16).fill(0);
    this.myPort = null;
  }

  connect() {
    this.myPort = true;
  }

  setPinMode(pinNum, mode) {}

  digitalWrite(pinNum, value) {}

  digitalRead(pinNum, callback) {
    callback();
  }

  analogWrite(pinNum, value) {}

  analogRead(pinNum, callback) {
    callback();
  }

  displayShow() {}

  displayPlot() {}

  displayClear() {}

  scrollString() {}

  scrollInteger() {}

  receivedEvent(sourceID, eventID) {
    for (let listener of this.eventListeners) {
      listener.call(null, sourceID, eventID);
    }
  }

  receivedAnalogUpdate() {
    for (let listener of this.updateListeners) {
      listener.call();
    }
  }

  trackDigitalPin() {}

  addFirmataEventListener(eventListenerFunction) {
    this.eventListeners.push(eventListenerFunction);
  }

  addFirmataUpdateListener(updateListenerFunction) {
    this.updateListeners.push(updateListenerFunction);
  }

  streamAnalogChannel(channel) {}

  stopStreamingAnalogChannel(channel) {}

  setDigitalOutput(pin, value) {}

  disconnect() {}

  reset() {}

  trackDigitalComponent() {}

  enableLightSensor() {}

  connectBoard() {
    this.connect();
  }

  clearChannelData() {}
}
