export default class ProgramSequencer {
  constructor() {
    this.stack = [];
  }

  init() {
    this.stack = [];
  }

  getCurrentStackEntry() {
    if (this.stack.length > 0) {
      return this.stack[this.stack.length - 1];
    } else {
      return null;
    }
  }

  playSequential() {
    const measure =
      this.stack.length === 0 ? 1 : this.getCurrentStackEntry().measure;
    this.stack.push({measure: measure, together: false});
  }

  endSequential() {
    const currentStackEntry = this.getCurrentStackEntry();

    const nextMeasure = currentStackEntry.measure;

    this.stack.pop();

    const nextStackEntry = this.getCurrentStackEntry();

    if (nextStackEntry) {
      // now the frame we are returning to has to absorb this information.
      if (nextStackEntry.together) {
        nextStackEntry.lastMeasures.push(nextMeasure);
      } else {
        nextStackEntry.measure = nextMeasure;
      }
    }
  }

  playTogether() {
    var nextMeasure =
      this.stack.length === 0 ? 1 : this.getCurrentStackEntry().measure;
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

    const nextStackEntry = this.getCurrentStackEntry();

    if (nextStackEntry) {
      // now the frame we are returning to has to absorb this information.
      if (nextStackEntry.together) {
        nextStackEntry.lastMeasures.push(nextMeasure);
      } else {
        nextStackEntry.measure = nextMeasure;
      }
    }
  }

  getCurrentMeasure() {
    return this.getCurrentStackEntry().measure;
  }

  updateMeasureForPlayByLength(length) {
    const currentStackEntry = this.getCurrentStackEntry();

    if (currentStackEntry.together) {
      currentStackEntry.lastMeasures.push(currentStackEntry.measure + length);
    } else {
      currentStackEntry.measure += length;
    }
  }
}
