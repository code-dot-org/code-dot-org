import {EventEmitter} from 'events';

export default class CapacitiveTouchSensor extends EventEmitter {
  constructor(board) {
    super();
    this.board = board;

    // Flag to only trigger event on first of type
    this.connect = false;
    this.releaseReading = 200;
    this.readSensorTimer = null;
    this.board.mb.setPinMode(this.board.pin, 2);
    this.board.mb.clearChannelData();
    this.start();

    Object.defineProperties(this, {
      isPressed: {
        get: function() {
          return this.connect;
        }
      }
    });
  }

  start() {
    this.board.mb.streamAnalogChannel(this.board.pin); // enable temp sensor
    this.readSensorTimer = setInterval(() => {
      let currentValue = this.board.mb.analogChannel[this.board.pin];
      console.log(this.board.mb.analogChannel[this.board.pin]);
      if (this.board.mb.analogChannel[this.board.pin] !== 255) {
        if (currentValue > this.releaseReading + 200 && !this.connect) {
          this.emit('down');
          this.connect = true;
        } else if (currentValue < this.releaseReading + 100 && this.connect) {
          this.emit('up');
          this.connect = false;
        }
      }
    }, 50);
  }

  stop() {
    this.board.mb.stopStreamingAnalogChannel(this.board.pin); // disable temp sensor
    clearInterval(this.readSensorTimer);
    this.readSensorTimer = null;
  }
}
