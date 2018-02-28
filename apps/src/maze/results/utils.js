const FarmerHandler = require('./farmer');
const BeeHandler = require('./bee');
const CollectorHandler = require('./collector');
const WordsearchHandler = require('./wordsearch');
const HarvesterHandler = require('./harvester');
const PlanterHandler = require('./planter');
const ResultsHandler = require('./resultsHandler');

const handlersBySubtypeName = {
  "Farmer": FarmerHandler,
  "Bee": BeeHandler,
  "Collector": CollectorHandler,
  "WordSearch": WordsearchHandler,
  "Harvester": HarvesterHandler,
  "Planter": PlanterHandler,
};

export function createResultsHandlerForSubtype(controller, config) {
  const subtypeName = controller.subtype.constructor.name;
  const handler = handlersBySubtypeName[subtypeName] || ResultsHandler;

  return new handler(controller, config);
}
