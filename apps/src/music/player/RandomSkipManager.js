// The RandomSkipManager supports the play_random block in the Simple2
// programming model.  It maintains a stack with context for each play_random
// grouping, can return the current context whenever we want to play.
// It is intended to be called by the generator functions in the block model,
// in the order that blocks are encountered when the code to be run is
// generated.
export default class RandomSkipSequencer {
  constructor() {
    this.init();
  }

  init() {
    this.stack = [];
  }

  // Gets the current context for playing a sound, specifically whether
  // we are somewhere inside any play_random block, and whether we should
  // play this specific sound.
  getSkipContext() {
    if (this.stack.length > 0) {
      const currentEntry = this.stack[this.stack.length - 1];
      return {
        maybeSkipSound: true,
        skipSound:
          currentEntry.skipSound ||
          currentEntry.randomIndex !== currentEntry.currentIndex
      };
    } else {
      return {maybeSkipSound: false, skipSound: false};
    }
  }

  // Begining of a play_random block.
  beginRandomContext(length, forceRandomIndex = null) {
    this.stack.push({
      skipSound: this.getSkipContext().skipSound,
      currentIndex: 0,
      randomIndex:
        forceRandomIndex !== null
          ? forceRandomIndex
          : Math.floor(Math.random() * length)
    });
  }

  // End of a play_random block.
  endRandomContext() {
    this.stack.pop();
  }

  // Move to the next child of a play_random block.
  next() {
    const currentEntry = this.stack[this.stack.length - 1];
    currentEntry.currentIndex++;
  }
}
