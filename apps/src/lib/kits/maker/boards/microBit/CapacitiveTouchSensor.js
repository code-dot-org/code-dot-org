import {EventEmitter} from 'events';
import {EXTERNAL_PINS as MB_EXTERNAL_PINS, roundToHundredth, sensor_channels} from './MicroBitConstants';

export default class CapacitiveTouchSensor extends EventEmitter {
  constructor(board) {
    super();
    this.board = board;

    // Flag to only trigger event on first of type
    this.connect = false;
    this.releaseReading = 200;
    this.readSensorTimer = null;
    console.log("Got this far");
    this.board.mb.setPinMode(this.board.pin, 2);
    this.board.mb.clearChannelData();
    this.board.mb.addFirmataUpdateListener(() => {
      this.emit('data');

      // If the temp value has changed, update the local value and
      // trigger a change event
      if (
        this.currentTemp !==
        this.board.mb.analogChannel[sensor_channels.tempSensor]
      ) {
        this.currentTemp = this.board.mb.analogChannel[
          sensor_channels.tempSensor
          ];
        this.emit('change');
      }
    });

    // this.readSensor = function () {
    //   let currentValue = this.board.mb.analogChannel[this.board.pin];
    //   if ((currentValue > this.releaseReading + 100) && !this.connect) {
    //     this.emit('down');
    //     this.connect = true;
    //   }
    //   if ((currentValue < this.releaseReading + 100) && this.connect) {
    //     this.emit('up');
    //     this.connect = false;
    //   }
    // }

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
    console.log("Alpha");
    //this.board.mb.streamAnalogChannel(this.board.pin); // enable temp sensor
    console.log("Gamma");
    //this.readSensorTimer = setInterval(this.readSensor, 50);
  }

  stop() {
    this.board.mb.stopStreamingAnalogChannel(this.board.pin); // disable temp sensor
    //clearInterval(this.readSensorTimer);
    //this.readSensorTimer = null;

  }
}
