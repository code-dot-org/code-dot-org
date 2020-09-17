import {EventEmitter} from 'events';
import '../../../../../utils'; // For Function.prototype.inherits

export default function MicroBitButton(board) {
  // There are six button events, ['', 'down', 'up', 'click', 'long-click', 'hold']
  this.buttonEvents = new Array(6).fill(0);
  this.board = board;
  // Length of millisecond before triggering 'hold' event.
  // Default from Johnny-Five Button implementation.
  this.holdThreshold = 500;
  this.holdTimer = null;
  this.board.mb.addFirmataEventListener((sourceID, eventID) => {
    if (this.board.pin === sourceID) {
      this.buttonEvents[eventID]++;
      if (eventID === 1) {
        this.emit('down');
        this.holdTimer = setInterval(() => {
          this.emit('hold');
        }, this.holdThreshold);
      } else if (eventID === 2) {
        this.emit('up');
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
MicroBitButton.inherits(EventEmitter);
