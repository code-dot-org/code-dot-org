import maze from '@code-dot-org/maze';
const subtypes = maze.subtypes;

import FarmerHandler from './farmer';
import BeeHandler from './bee';
import CollectorHandler from './collector';
import WordsearchHandler from './wordsearch';
import HarvesterHandler from './harvester';
import PlanterHandler from './planter';
import ResultsHandler from './resultsHandler';

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
