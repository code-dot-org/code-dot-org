import {EventEmitter} from 'events';
import '../../../../../utils'; // For Function.prototype.inherits

export default function ExternalButton(board) {
  // There are six button events, ['', 'down', 'up', 'click', 'long-click', 'hold']
  this.buttonEvents = new Array(6).fill(0);
  this.board = board;
  this.board.mb.trackDigitalPin(this.board.pin, 0);
  // Flag to only trigger event on first of type
  this.connect = false;

  this.board.mb.trackDigitalComponent(this.board.pin, (sourceID, eventID) => {
    if (this.board.pin === sourceID) {
      this.buttonEvents[eventID]++;
      if (eventID === 1 && !this.connect) {
        this.emit('down');
        this.connect = true;
      } else if (eventID === 2 && this.connect) {
        this.emit('up');
        this.connect = false;
      }
    }
  });

  // Add a read-only `isPressed` property
  Object.defineProperties(this, {
    isPressed: {
      // More 'down' events than 'up' indicates we are in a pressed state
      get: function() {
        return !this.board.mb.digitalInput[this.board.pin];
      }
    }
  });
}
ExternalButton.inherits(EventEmitter);
