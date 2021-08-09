export default class ResultsHandler {
  constructor(maze, config) {
    this.maze_ = maze;
    this.skin_ = config.skin;
    this.level_ = config.level;

    /**
     * ExecutionInfo instance, assigned at runtime
     * @see Maze.prepareForExecution_
     */
    this.executionInfo = undefined;
  }

  /**
   * Did the user successfully complete this level?
   * @returns {Boolean} success
   */
  succeeded() {
    if (this.maze_.subtype.finish) {
      return (
        this.maze_.getPegmanX() === this.maze_.subtype.finish.x &&
        this.maze_.getPegmanY() === this.maze_.subtype.finish.y
      );
    }
  }

  shouldCheckSuccessOnMove() {
    return true;
  }

  hasMessage(testResults) {
    return false;
  }

  /**
   * Get any app-specific message, based on the termination value, or return
   * null if none applies.
   * @param {Number} terminationValue - from Maze.executionInfo
   * @returns {(String|null)} message
   */
  getMessage(terminationValue) {
    return null;
  }

  /**
   * Get the test results based on the termination value.  If there is no
   * app-specific failure, this returns StudioApp.getTestResults().
   * @param {Number} terminationValue - from Maze.executionInfo
   * @returns {Number} testResult
   */
  getTestResults(terminationValue) {
    return this.maze_.getTestResults(false);
  }

  /**
   * Set the termination results to something app-specific, so that getMessage
   * and getTestResults can return custom values based on the specifc way in
   * which we terminated
   * @modifies Maze.executionInfo.terminationValue
   */
  terminateWithAppSpecificValue() {
    // noop; overridable
  }

  /**
   * Called after user's code has finished executing. Gives us a chance to
   * terminate with app-specific values, such as unchecked cloud/purple flowers.
   * @see terminateWithAppSpecificValue
   */
  onExecutionFinish() {
    const executionInfo = this.executionInfo;
    if (executionInfo.isTerminated()) {
      return;
    }
    if (this.succeeded()) {
      return;
    }

    this.terminateWithAppSpecificValue();
  }

  /**
   * Used by StudioApp.displayFeedback to allow subtypes to conditionally
   * prevent the feedback dialog from showing up and the page from automatically
   * advancing to the next level.
   *
   * @param {Number} feedbackType
   * @return {boolean}
   */
  shouldPreventFeedbackDialog(feedbackType) {
    return false;
  }
}
