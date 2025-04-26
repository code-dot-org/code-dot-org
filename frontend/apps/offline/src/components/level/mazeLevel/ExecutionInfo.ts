export interface Action {
  command: string;
  blockId: string;
}

/**
 * Stores information about a current Maze execution.  Execution consists of a
 * series of steps, where each step may contain one or more actions.
 */
export class ExecutionInfo {
  terminated_: boolean;
  terminationValue_: number | boolean | null;
  steps_: Action[][];
  ticks: number;
  collection_: Action[] | null;

  constructor(options: {ticks: number}) {
    this.terminated_ = false;
    this.terminationValue_ = null; // See terminateWithValue method.
    this.steps_ = [];
    this.ticks = options.ticks || Infinity;
    this.collection_ = null;
  }

  /**
   * Sets termination value to one of the following:
   * - Infinity: Program timed out.
   * - true: Program succeeded (goal was reached).
   * - false: Program failed for unspecified reason.
   * - Any other value: app-specific failure.
   * @param {object} value the termination value
   */
  terminateWithValue(value: boolean | number) {
    if (!this.terminated_) {
      console.log('wait');
      this.terminationValue_ = value;
    }
    this.terminated_ = true;
  }

  isTerminated(): boolean {
    console.log('hi', this.terminated_);
    return this.terminated_;
  }

  terminationValue(): number | boolean | null {
    return this.terminationValue_;
  }

  queueAction(command: string, blockId: string | null) {
    const action = {command: command, blockId: blockId};
    console.log('QUEUE', this.steps_);
    if (this.collection_) {
      console.log('COLL');
      this.collection_.push(action);
    } else {
      console.log('STEP');
      // single action step (most common case)
      this.steps_.push([action]);
    }
    console.log('QUEUE DONE', this.steps_);
  }

  /**
   * Creates a flat list of actions, which get removed from our queue.  If single
   * step is true, the list will contain the actions for one step, otherwise it
   * will be the entire queue.
   */
  getActions(singleStep) {
    const actions = [];
    if (singleStep && this.stepsRemaining()) {
      actions.push(this.steps_.shift());
      // dont leave queue with just a finish in it
      if (this.onLastStep(this.steps_)) {
        actions.push(this.steps_.splice(0));
      }
    } else {
      actions.push(this.steps_.splice(0));
    }

    // Some steps will contain multiple actions.  For example a K1 North block can
    // consist of a turn and a move. We instead want to return a flat list of
    // all actions, regardless of which step they were in.
    //
    // Therefore, we flatten it twice: once to coalesce the steps with multiple
    // actions, and again to flatten all of the steps to produce just a single depth
    // list of actions.
    return actions.flat().flat();
  }

  stepsRemaining(): boolean {
    return this.steps_.length > 0;
  }

  /**
   * If we have no steps left, or our only remaining step is a single finish action
   * we're done executing, and if we're in step mode won't want to wait around
   * for another step press.
   */
  onLastStep(steps): boolean {
    if (steps.length === 0) {
      return true;
    }

    if (steps.length === 1) {
      const step = steps[0];
      if (step.length === 1 && step[0].command === 'finish') {
        return true;
      }
    }
    return false;
  }

  /**
   * Collect all actions queued up between now and the call to stopCollecting,
   * and put them in a single step
   */
  collectActions() {
    if (this.collection_) {
      throw new Error('Already collecting');
    }
    this.collection_ = [];
  }

  stopCollecting() {
    if (!this.collection_) {
      throw new Error('Not currently collecting');
    }
    this.steps_.push(this.collection_);
    this.collection_ = null;
  }

  /**
   * If the user has executed too many actions, we're probably in an infinite
   * loop.  Set termination value to Infinity
   */
  checkTimeout() {
    console.log('check');
    if (this.ticks-- < 0) {
      console.log('done');
      this.terminateWithValue(Infinity);
    }
  }
}

export default ExecutionInfo;
