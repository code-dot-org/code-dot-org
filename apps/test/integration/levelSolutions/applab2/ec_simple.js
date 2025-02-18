import {TestResults} from '@cdo/apps/constants';

import {testApplabConsoleOutput} from '../../util/levelTestHelpers';

module.exports = {
  app: 'applab',
  skinId: 'applab',
  levelFile: 'levels',
  levelId: 'ec_simple',
  tests: [
    {
      description: 'Expected solution.',
      editCode: true,
      xml: '',
      runBeforeClick: function (assert) {
        // room to add tests here

        // add a completion on timeout since this is a freeplay level
        setTimeout(function () {
          Applab.onPuzzleComplete();
        }, 1);
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY,
      },
    },

    {
      description: 'Reset logs milestones.',
      editCode: true,
      xml: '',
      runBeforeClick: function (assert) {
        $('#runButton').click();
        $('#resetButton').click();

        // Add wait for debouncing
        setTimeout(function () {
          $('#runButton').click();
          $('#resetButton').click();
          // Add wait for debouncing
          setTimeout(function () {
            Applab.onPuzzleComplete();
          }, 1100);
        }, 300);
      },
      expected: [
        {
          result: undefined,
          testResult: TestResults.LEVEL_STARTED,
        },
        {
          result: true,
          testResult: TestResults.FREE_PLAY,
        },
      ],
    },

    // These exercise all of the blocks in Control category
    // It does not validate that they behave correctly, just that we don't end
    // up with any errors
    testApplabConsoleOutput({
      testName: 'Control',
      source: `
        var count = 0;
        for (var i = 0; i < 4; i++) {
          count++;
        }
        i = 5;
        while(i > 0) {
          count++;
          i--;
        }
        if (count > 0) {
          count++;
        }
        if (count < 0) {
          count++;
        } else {
          count--;
        }
        getTime();
        var interval = setInterval(function() {
          count++;
        }, 100);
        clearInterval(interval);
        var timeout = setTimeout(function() {
          console.log(count);
          clearTimeout(timeout);
        }, 200);
      `,
      ticks: 200,
      expect: '9',
    }),

    // These exercise all of the blocks in Turtle category
    // It does not validate that they behave correctly, just that we don't end
    // up with any errors
    testApplabConsoleOutput({
      testName: 'Turtle',
      source: `
        moveForward(25);
        moveBackward(25);
        move(25, 25);
        moveTo(0, 0);
        dot(5);
        turnRight(90);
        turnLeft(90);
        turnTo(0);
        arcRight(90, 25);
        arcLeft(90, 25);
        getX();
        getY();
        getDirection();
        penUp();
        penDown();
        penWidth(3);
        penColor("red");
        penRGB(120, 180, 200);
        show();
        hide();
        speed(50);
      `,
      expect: '',
    }),

    // These exercise some simple use cases for the list blocks:
    // insertItem, appendItem, and removeItem
    testApplabConsoleOutput({
      testName: 'List blocks',
      source: `
        var list = ["a", "b", "d"];
        var g = list.length;
        insertItem(list, 2, "c");
        appendItem(list, "f");
        removeItem(list, 0);
        console.log(g + ' ' + list.length + ' ' + list.join(','));
      `,
      expect: '"3 4 b,c,d,f"',
    }),

    {
      description: 'Block palette categories',
      editCode: true,
      xml: '',
      runBeforeClick: function (assert) {
        const expectedCategories = [
          'UI controls',
          'Canvas',
          'Data',
          'Turtle',
          'Control',
          'Math',
          'Variables',
          'Functions',
        ];
        const actualCategories = $('.droplet-palette-group-header')
          .map((i, el) => $(el).text())
          .toArray();
        assert.deepEqual(expectedCategories, actualCategories);

        // add a completion on timeout since this is a freeplay level
        setTimeout(function () {
          Applab.onPuzzleComplete();
        }, 1);
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY,
      },
    },
  ],
};
