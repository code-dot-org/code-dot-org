import {EventEmitter} from 'events';

export default class LightSensor extends EventEmitter {
  constructor(board) {
    super();
    this.board = board;
    //ToDo
    this.board.mb.addFirmataUpdateListener(() => {});
    this.start();

    Object.defineProperties(this, {
      value: {
        get: function() {
          //ToDo
          return 0;
        }
      },
      threshold: {
        get: function() {
          //ToDo
          return 0;
        }
      }
    });
  }

  start() {
    this.board.mb.enableLightSensor(); // enable light sensor
  }

  //ToDo
  stop() {}

  //TODO
  getAveragedValue() {}

  //ToDo
  setThreshold() {}
}
