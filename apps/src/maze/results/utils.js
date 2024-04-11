const subtypes = require('@code-dot-org/maze').subtypes;

const BeeHandler = require('./bee');
const CollectorHandler = require('./collector');
const FarmerHandler = require('./farmer');
const HarvesterHandler = require('./harvester');
const PlanterHandler = require('./planter');
const ResultsHandler = require('./resultsHandler');
const WordsearchHandler = require('./wordsearch');

export function createResultsHandlerForSubtype(controller, config) {
  let handler = ResultsHandler;

  if (controller.subtype instanceof subtypes.Farmer) {
    handler = FarmerHandler;
  } else if (controller.subtype instanceof subtypes.Bee) {
    handler = BeeHandler;
  } else if (controller.subtype instanceof subtypes.Collector) {
    handler = CollectorHandler;
  } else if (controller.subtype instanceof subtypes.Wordsearch) {
    handler = WordsearchHandler;
  } else if (controller.subtype instanceof subtypes.Harvester) {
    handler = HarvesterHandler;
  } else if (controller.subtype instanceof subtypes.Planter) {
    handler = PlanterHandler;
  }

  return new handler(controller, config);
}
