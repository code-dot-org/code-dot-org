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
  let handler = ResultsHandler;

  if (controller.subtype instanceof Farmer) {
    handler = FarmerHandler;
  } else if (controller.subtype instanceof Bee) {
    handler = BeeHandler;
  } else if (controller.subtype instanceof Collector) {
    handler = CollectorHandler;
  } else if (controller.subtype instanceof Wordsearch) {
    handler = WordsearchHandler;
  } else if (controller.subtype instanceof Harvester) {
    handler = HarvesterHandler;
  } else if (controller.subtype instanceof Planter) {
    handler = PlanterHandler;
  }

  return new handler(controller, config);
}
