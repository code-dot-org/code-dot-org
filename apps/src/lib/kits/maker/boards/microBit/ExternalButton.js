import {EXTERNAL_PINS as MB_EXTERNAL_PINS} from './MicroBitConstants';
import {EventEmitter} from 'events';
import '../../../../../utils'; // For Function.prototype.inherits

export default function ExternalButton(board) {
  // There are six button events, ['', 'down', 'up', 'click', 'long-click', 'hold']
  this.buttonEvents = new Array(6).fill(0);
  this.board = board;
  this.pullup = MB_EXTERNAL_PINS.includes(this.board.pin);
  if (this.pullup) {
    this.board.mb.trackDigitalPin(this.board.pin, 1);
  }
  // Flag to only trigger event on first of type
  this.connect = false;
  // Length of millisecond before triggering 'hold' event.
  // Default from Johnny-Five Button implementation.
  this.holdThreshold = 500;
  this.holdTimer = null;

  this.board.mb.trackDigitalComponent(this.board.pin, (sourceID, eventID) => {
    if (this.board.pin === sourceID) {
      this.buttonEvents[eventID]++;
      if (eventID === 1 && !this.connect) {
        this.emit('down');
        this.connect = true;
        this.holdTimer = setInterval(() => {
          this.emit('hold');
        }, this.holdThreshold);
      } else if (eventID === 2 && this.connect) {
        this.emit('up');
        this.connect = false;
        if (this.holdTimer) {
          clearInterval(this.holdTimer);
          this.holdTimer = null;
        }
      }
    }
  });

  // Add a read-only `isPressed` property
  Object.defineProperties(this, {
    isPressed: {
      // More 'down' events than 'up' indicates we are in a pressed state
      get: function() {
        return this.buttonEvents[1] > this.buttonEvents[2];
      }
    },
    holdtime: {
      get: function() {
        return this.holdThreshold;
      }
    }
  });
}
ExternalButton.inherits(EventEmitter);
