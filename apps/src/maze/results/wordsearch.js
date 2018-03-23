import ResultsHandler from './resultsHandler';

export default class WordSearchHandler extends ResultsHandler {
  constructor(maze, config) {
    super(maze, config);
    this.goal_ = config.level.searchWord;
  }

  /**
   * Returns true if we've spelled the right word.
   * @override
   */
  succeeded() {
    return this.maze_.subtype.getVisited() === this.goal_;
  }

  /**
   * @override
   */
  shouldCheckSuccessOnMove() {
    return false;
  }
}
