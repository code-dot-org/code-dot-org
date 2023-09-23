import {expect} from '../../util/reconfiguredChai';

import FarmerHandler from '@cdo/apps/maze/results/farmer';
import BeeHandler from '@cdo/apps/maze/results/bee';
import CollectorHandler from '@cdo/apps/maze/results/collector';
import WordsearchHandler from '@cdo/apps/maze/results/wordsearch';
import HarvesterHandler from '@cdo/apps/maze/results/harvester';
import PlanterHandler from '@cdo/apps/maze/results/planter';
import ResultsHandler from '@cdo/apps/maze/results/resultsHandler';

import {MazeController} from '@code-dot-org/maze';

import {createResultsHandlerForSubtype} from '@cdo/apps/maze/results/utils';

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
        expect(handler).to.be.an.instanceof(value);
      });
    });
  });
});
