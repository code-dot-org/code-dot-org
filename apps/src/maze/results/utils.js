const Farmer = require('../farmer');
const Bee = require('../bee');
const Collector = require('../collector');
const Wordsearch = require('../wordsearch');
const Harvester = require('../harvester');
const Planter = require('../planter');

const FarmerHandler = require('./farmer');
const BeeHandler = require('./bee');
const CollectorHandler = require('./collector');
const WordsearchHandler = require('./wordsearch');
const HarvesterHandler = require('./harvester');
const PlanterHandler = require('./planter');
const ResultsHandler = require('./resultsHandler');

export function createResultsHandlerForSubtype(controller, config) {
  let handler;

  switch (controller.subtype) {
    case Farmer:
      handler = FarmerHandler;
      break;
    case Bee:
      handler = BeeHandler;
      break;
    case Collector:
      handler = CollectorHandler;
      break;
    case Wordsearch:
      handler = WordsearchHandler;
      break;
    case Harvester:
      handler = HarvesterHandler;
      break;
    case Planter:
      handler = PlanterHandler;
      break;
    default:
      handler = ResultsHandler;
  }

  return new handler(controller, config);
}
