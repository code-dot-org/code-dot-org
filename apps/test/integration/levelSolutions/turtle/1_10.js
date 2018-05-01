import {TestResults} from '@cdo/apps/constants';

var studioApp = require('@cdo/apps/StudioApp').singleton;

module.exports = {
  app: "turtle",
  levelFile: "levels",
  levelId: "1_10",
  tests: [
    {
      description: "Some random code for the freeplay level",
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      },
      runBeforeClick: function () {
        // This is a free-play level: click Finish when drawing is done.
        addEventListener('artistDrawingComplete', () => $('#finishButton').click());
      },
      customValidator: function () {
        // don't show block count because our ideal is Infinity
        return studioApp().enableShowCode === true && studioApp().enableShowBlockCount === false;
      },
      missingBlocks: [],
      xml: '<xml><block type="when_run"><next><block type="controls_repeat" deletable="false"><title name="TIMES">10</title><statement name="DO"><block type="draw_move" inline="true" deletable="false" editable="false"><title name="DIR">moveForward</title><value name="VALUE"><block type="math_number" deletable="false" editable="false"><title name="NUM">1</title></block></value><next><block type="draw_turn" inline="true" deletable="false" editable="false"><title name="DIR">turnRight</title><value name="VALUE"><block type="math_number" deletable="false" editable="false"><title name="NUM">1</title></block></value></block></next></block></statement></block></next></block></xml>'
    }
  ]
};
