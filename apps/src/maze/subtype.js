import Cell from './cell';
import DirtDrawer from './dirtDrawer';

//import Bee from './bee';
//import Collector from './collector';
//import WordSearch from './wordsearch';
//import Scrat from './scrat';
//import Farmer from './farmer';

export default class Subtype {
  constructor(maze, studioApp, config) {
    //if (this.constructor === Subtype) {
    //  throw new TypeError("Can not construct abstract class Subtype.");
    //}

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

//Subtype.generateAppropriateSubtype = function (Maze, studioApp, config, level) {
//  if ((/bee(_night)?/).test(config.skinId)) {
//    return new Bee(Maze, studioApp, config);
//  } else if ((/collector(_night)?/).test(config.skinId)) {
//    return new Collector(Maze, studioApp, config);
//  } else if (config.skinId === 'letters') {
//    return new WordSearch(Maze, studioApp, config, level.searchWord, level.map);
//  } else if ((/scrat/).test(config.skinId)) {
//    return new Scrat(Maze, studioApp, config);
//  } else {
//    return new Farmer(Maze, studioApp, config);
//  }
//};
