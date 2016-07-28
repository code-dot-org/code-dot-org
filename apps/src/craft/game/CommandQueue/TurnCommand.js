import CommandState from "./CommandState.js";
import BaseCommand from "./BaseCommand.js";

export default class TurnCommand extends BaseCommand {
  constructor(gameController, highlightCallback, direction) {
    super(gameController, highlightCallback);

    this.Direction = direction;
  }

  tick() {
    // do stuff??
  }

  begin() {
    super.begin();
    if (this.gameController.DEBUG) {
      console.log(`TURN command: BEGIN turning ${this.Direction}  `);
    }
    this.gameController.turn(this, this.Direction);
  }
}
