import {EventEmitter} from 'events';

export default function MicroBitButton(board) {
  // There are six button events, ['', 'down', 'up', 'click', 'long-click', 'hold']
  this.buttonEvents = new Array(6).fill(0);
  this.board = board;
  this.board.mb.addFirmataEventListener((sourceID, eventID) => {
    if (this.board.pin === sourceID) {
      this.buttonEvents[eventID]++;
      if (eventID === 1) {
        this.emit('down');
      } else if (eventID === 2) {
        this.emit('up');
      }
    }
  });

  // Add a read-only `isPressed` property
  Object.defineProperty(this, 'isPressed', {
    get: () => this.buttonEvents[1] > this.buttonEvents[2]
  });
}
MicroBitButton.inherits(EventEmitter);
