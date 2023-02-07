import Globals from '../globals';

export default class ProgramSequencer {
  constructor() {
    this.stack = [];
  }

  init() {
    this.stack = [];
  }

  getCurrentStackEntry() {
    return this.stack[this.stack.length - 1];
  }

  playSequential() {
    const measure =
      this.stack.length == 0 ? 1 : this.getCurrentStackEntry().measure;
    this.stack.push({measure: measure, together: false});
  }

  endSequential() {
    const currentStackEntry = this.getCurrentStackEntry();

    const nextMeasure = currentStackEntry.measure;
    this.stack.pop();

    //if (this.stack.length > 0) {
    // now the frame we are returning to has to absorb this information.
    if (currentStackEntry.together) {
      currentStackEntry.lastMeasures.push(nextMeasure);
    } else {
      currentStackEntry.measure = nextMeasure;
    }
    //} else {
    //  console.log('done');
    //}
  }

  playTogether() {
    var nextMeasure =
      this.stack.length == 0 ? 1 : this.getCurrentStackEntry().measure;
    this.stack.push({
      measure: nextMeasure,
      together: true,
      lastMeasures: [nextMeasure]
    });
  }

  endTogether() {
    const currentStackEntry = this.getCurrentStackEntry();

    var nextMeasure = Math.max.apply(Math, currentStackEntry.lastMeasures);

    // we are returning to the previous stack frame.
    this.stack.pop();

    // now the frame we are returning to has to absorb this information.
    if (currentStackEntry.together) {
      currentStackEntry.lastMeasures.push(nextMeasure);
    } else {
      currentStackEntry.measure = nextMeasure;
    }
  }

  playSoundById(id, isBlockInsideWhenRun) {
    const currentStackEntry = this.getCurrentStackEntry();

    const player = Globals.getPlayer();
    const soundLength = Globals.getPlayer().getLengthForId(id);

    player.playSoundAtMeasureById(
      id,
      currentStackEntry.measure,
      isBlockInsideWhenRun
    );

    if (currentStackEntry.together) {
      currentStackEntry.lastMeasures.push(
        currentStackEntry.measure + soundLength
      );
    } else {
      currentStackEntry.measure += soundLength;
    }
  }
}
