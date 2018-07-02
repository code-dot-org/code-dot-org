import {TestResults} from '@cdo/apps/constants';
var blockUtils = require('@cdo/apps/block_utils');
var evalMsg = require('@cdo/apps/eval/locale');

module.exports = {
  app: "eval",
  skinId: 'eval',
  levelDefinition: {
    requiredBlocks: '',
    freePlay: true
  },
  tests: [
    {
      description: "Infinite recursion",
      expected: {
        result: false,
        testResult: TestResults.APP_SPECIFIC_FAIL
      },
      customValidator: function (assert) {
        assert.equal(Eval.message, evalMsg.infiniteRecursionError());
        return true;
      },
      xml: (function () {
        // foo(x) = foo(x)
        // display(foo(1))

        var argList = [{name: 'x', type: 'Number'}];
        var display = blockUtils.mathBlockXml('functional_display',
          {
            'ARG1': blockUtils.functionalCallXml('foo', argList, [
              blockUtils.mathBlockXml('functional_math_number', null, { NUM: 1 } )
              ])
          }
        );

        // recursively call ourselves
        var definition = blockUtils.functionalDefinitionXml('foo', 'Number', argList,
          blockUtils.functionalCallXml('foo', argList, [
            blockUtils.calcBlockGetVar('x')
          ]));
        return display + definition;
      })()
    },

    {
      description: "finite recursion",
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      },
      xml: (function () {
        // foo(x) = cond(x == 1, 1, foo(x-1))
        // display(foo(5))

        var argList = [{name: 'x', type: 'Number'}];
        var display = blockUtils.mathBlockXml('functional_display',
          {
            'ARG1': blockUtils.functionalCallXml('foo', argList, [
              blockUtils.mathBlockXml('functional_math_number', null, { NUM: 5 } )
              ])
          }
        );

        var condBlock = blockUtils.mathBlockXml('functional_cond', {
          'COND0': blockUtils.mathBlockXml('functional_number_equals', {
            'ARG1': blockUtils.calcBlockGetVar('x'),
            'ARG2': blockUtils.mathBlockXml('functional_math_number', null, { NUM: 1 })
          }),
          'VALUE0': blockUtils.mathBlockXml('functional_math_number', null, { NUM: 1 }),
          'DEFAULT': blockUtils.functionalCallXml('foo', argList, [
            blockUtils.mathBlockXml('functional_minus', {
              'ARG1': blockUtils.calcBlockGetVar('x'),
              'ARG2': blockUtils.mathBlockXml('functional_math_number', null, { NUM: 1 })
            })
          ])
        });

        var definition = blockUtils.functionalDefinitionXml('foo', 'Number', argList, condBlock);
        return display + definition;
      })()
    }
  ]
};
