import {TestResults} from '@cdo/apps/constants';
import ReactTestUtils from 'react-dom/test-utils';
import {singleton as studioApp} from '@cdo/apps/StudioApp';
import LegacyDialog from '@cdo/apps/code-studio/LegacyDialog';

var reqBlocks = function() {
  // stick this inside a function so that it's only loaded when needed
  return require('@cdo/apps/maze/requiredBlocks.js');
};

module.exports = {
  app: 'maze',
  levelFile: 'levels',
  levelId: '2_1',
  tests: [
    {
      description: 'Verify solution',
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
      missingBlocks: [],
      xml:
        '<xml><block type="when_run"><next><block type="maze_moveForward"><next><block type="maze_moveForward"><next><block type="maze_moveForward" /></next></block></next></block></next></block></xml>',
      runBeforeClick: function(assert) {
        assert(
          studioApp().enableShowCode,
          'expected enableShowCode to be true'
        );
        assert(!studioApp().editCode, 'Expected editCode to be false');
        LegacyDialog.levelTestDontFinishOnShow = true;
        const el = document.getElementById('show-code-header');
        assert(el, 'Expected there to be a show-code-header button');
        try {
          // Clicking the "show code" button shouldn't throw any errors...
          ReactTestUtils.Simulate.click(el);
        } finally {
          LegacyDialog.levelTestDontFinishOnShow = false;
        }
      }
    },
    {
      description: 'Single move forward block',
      expected: {
        result: false,
        testResult: TestResults.TOO_FEW_BLOCKS_FAIL
      },
      missingBlocks: [],
      xml:
        '<xml><block type="when_run"><next><block type="maze_moveForward"></block></next></block></xml>'
    },
    {
      description: 'Single turn right block',
      expected: {
        result: false,
        testResult: TestResults.MISSING_BLOCK_UNFINISHED
      },
      missingBlocks: [reqBlocks().MOVE_FORWARD],
      xml:
        '<xml><block type="when_run"><next><block type="maze_turn"><title name="DIR">turnLeft</title></block></next></block></xml>'
    }
  ]
};
