import Cell from './cell';
import DirtDrawer from './dirtDrawer';

export default class Subtype {
  constructor(maze, studioApp, config) {
    this.maze_ = maze;
    this.studioApp_ = studioApp;
    this.skin_ = config.skin;
  }

  finished() {
    return true;
  }

  getCellClass() {
    return Cell;
  }

  createGridItemDrawer() {
    return new DirtDrawer(this.maze_.map, this.skin_.dirt);
  }

  shouldCheckSuccessOnMove() {
    return true;
  }

  reset() {
    // noop; overridable
  }

  hasMessage(testResults) {
    return false;
  }

  getMessage(terminationValue) {
    // noop; overridable
  }

  getTestResults(terminationValue) {
    // noop; overridable
  }

  onExecutionFinish() {
    // noop; overridable
  }

  isFarmer() {
    return false;
  }

  isCollector() {
    return false;
  }

  isScrat() {
    return false;
  }

  isWordSearch() {
    return false;
  }

  isBee() {
    return false;
  }
}
