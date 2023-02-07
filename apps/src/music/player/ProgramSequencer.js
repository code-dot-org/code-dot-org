// The ProgramSequencer supports the play_together and play_sequential blocks
// in the Simple2 programming model.  It maintains a stack with context for
// each play_together or play_sequential grouping, can return the current
// measure whenever we want to play, and can update the playhead whenever a
// sound has been played.  It is intended to be called by the generator functions
// in the block model, in the order that blocks are encountered when the code
// to be run is generated.

export default class ProgramSequencer {
  constructor() {
    this.stack = [];
  }

  init() {
    this.stack = [];
  }

  // Internal helper to get the entry at the top of the stack, or null
  // if the stack is empty.
  getCurrentStackEntry() {
    if (this.stack.length > 0) {
      return this.stack[this.stack.length - 1];
    } else {
      return null;
    }
  }

  // Beginning of a play_sequential block.
  playSequential() {
    const measure =
      this.stack.length === 0 ? 1 : this.getCurrentStackEntry().measure;
    this.stack.push({measure: measure, together: false});
  }

  // End of a play_sequential block.
  endSequential() {
    const currentStackEntry = this.getCurrentStackEntry();

    const nextMeasure = currentStackEntry.measure;

    // We are returning to the previous stack frame.
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

  // Beginning of a play_together block.
  playTogether() {
    var nextMeasure =
      this.stack.length === 0 ? 1 : this.getCurrentStackEntry().measure;
    this.stack.push({
      measure: nextMeasure,
      together: true,
      lastMeasures: [nextMeasure]
    });
  }

  // End of an play_together block.
  endTogether() {
    const currentStackEntry = this.getCurrentStackEntry();

    var nextMeasure = Math.max.apply(Math, currentStackEntry.lastMeasures);

    // We are returning to the previous stack frame.
    this.stack.pop();

    const nextStackEntry = this.getCurrentStackEntry();

    if (nextStackEntry) {
      // Now the frame we are returning to has to absorb this information.
      if (nextStackEntry.together) {
        nextStackEntry.lastMeasures.push(nextMeasure);
      } else {
        nextStackEntry.measure = nextMeasure;
      }
    }
  }

  // When the caller wants to play a sound, it calls this to determine at
  // which measure it should be placed.
  getCurrentMeasure() {
    return this.getCurrentStackEntry().measure;
  }

  // When the caller has played a sound, it calls this so that the system
  // can update the playhead for the length of sound that was played at
  // what was the current measure.
  updateMeasureForPlayByLength(length) {
    const currentStackEntry = this.getCurrentStackEntry();

    if (currentStackEntry.together) {
      currentStackEntry.lastMeasures.push(currentStackEntry.measure + length);
    } else {
      currentStackEntry.measure += length;
    }
  }
}
