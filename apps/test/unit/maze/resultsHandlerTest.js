import {MazeController} from '@code-dot-org/maze';

const BeeHandler = require('@cdo/apps/maze/results/bee');
const CollectorHandler = require('@cdo/apps/maze/results/collector');
const FarmerHandler = require('@cdo/apps/maze/results/farmer');
const HarvesterHandler = require('@cdo/apps/maze/results/harvester');
const PlanterHandler = require('@cdo/apps/maze/results/planter');
const ResultsHandler = require('@cdo/apps/maze/results/resultsHandler');
const createResultsHandlerForSubtype =
  require('@cdo/apps/maze/results/utils').createResultsHandlerForSubtype;
const WordsearchHandler = require('@cdo/apps/maze/results/wordsearch');

describe('ResultsHandlers', function () {
  describe('createResultsHandlerForSubtype util', function () {
    it('can select the correct subtype handler for a given controller', function () {
      const skinToExpected = {
        farmer: FarmerHandler,
        farmer_night: FarmerHandler,
        bee: BeeHandler,
        bee_night: BeeHandler,
        collector: CollectorHandler,
        scrat: ResultsHandler,
        planter: PlanterHandler,
        harvester: HarvesterHandler,
        letters: WordsearchHandler,
        "unimplemented skin that doesn't exist": ResultsHandler,
      };

      Object.entries(skinToExpected).forEach(([key, value]) => {
        const mazeController = new MazeController(
          {
            serializedMaze: [[{tileType: 0}]],
          },
          {},
          {
            skinId: key,
            level: {
              flowerType: 'redWithNectar',
            },
          }
        );

        const handler = createResultsHandlerForSubtype(mazeController, {
          level: {},
        });
        expect(handler).toBeInstanceOf(value);
      });
    });
  });
});
