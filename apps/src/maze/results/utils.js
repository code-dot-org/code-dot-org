const Farmer = require('@code-dot-org/maze/src/farmer');
const Bee = require('@code-dot-org/maze/src/bee');
const Collector = require('@code-dot-org/maze/src/collector');
const Wordsearch = require('@code-dot-org/maze/src/wordsearch');
const Harvester = require('@code-dot-org/maze/src/harvester');
const Planter = require('@code-dot-org/maze/src/planter');

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
