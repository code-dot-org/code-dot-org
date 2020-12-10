import {EventEmitter} from 'events';

export default class CapacitiveTouchSensor extends EventEmitter {
  constructor(board) {
    super();
    this.board = board;

    // The sensor continuously samples the value, so this flag tracks the changes
    // in state so we only emit the 'up' and 'down' event once per state change
    this.connected = false;

    // When unconnected, the sensor reads values in the low 200s
    this.releaseReading = 200;

    // When connected, the sensor reads values over 400
    this.connectedDelta = 200;

    // Allowance for triggering a change event
    this.allowanceDelta = 100;

    this.readSensorTimer = null;
    this.board.mb.setPinMode(this.board.pin, 2);
    this.board.mb.clearChannelData();
    this.start();

    Object.defineProperties(this, {
      isPressed: {
        get: function() {
          return this.connected;
        }
      }
    });
  }

  start() {
    this.board.mb.streamAnalogChannel(this.board.pin); // enable cap touch sensor
    this.readSensorTimer = setInterval(() => {
      let currentValue = this.board.mb.analogChannel[this.board.pin];
      if (this.board.mb.analogChannel[this.board.pin] !== 255) {
        if (
          currentValue > this.releaseReading + this.connectedDelta &&
          !this.connected
        ) {
          this.emit('down');
          this.connected = true;
        } else if (
          currentValue < this.releaseReading + this.allowanceDelta &&
          this.connected
        ) {
          this.emit('up');
          this.connected = false;
        }
      }
    }, 50);
  }

  stop() {
    this.board.mb.stopStreamingAnalogChannel(this.board.pin); // disable cap touch sensor
    clearInterval(this.readSensorTimer);
    this.readSensorTimer = null;
  }
}
