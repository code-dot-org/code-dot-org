import CommandState from "./CommandState.js";
import BaseCommand from "./BaseCommand.js";

export default class CallbackCommand extends BaseCommand {
  constructor(gameController, highlightCallback, actionCallback, targetEntity) {
    super(gameController, highlightCallback, targetEntity);
    this.actionCallback = actionCallback;
  }

  tick() {
    // do stuff
  }

  begin() {
    super.begin();
    this.actionCallback();
  }
}

