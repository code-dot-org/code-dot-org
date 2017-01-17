import BaseCommand from "./BaseCommand.js";

export default class TurnCommand extends BaseCommand {
  constructor(gameController, highlightCallback, direction, targetEntity) {
    super(gameController, highlightCallback, targetEntity);

    this.Direction = direction;
  }

  tick() {
    // do stuff??
  }

  begin() {
    super.begin();
    if (this.GameController.DEBUG) {
      console.log(`TURN command: BEGIN turning ${this.Direction}  `);
    }
    this.GameController.turn(this, this.Direction);
  }
}
