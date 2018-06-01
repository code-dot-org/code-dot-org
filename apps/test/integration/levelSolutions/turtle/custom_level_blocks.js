var testUtils = require('../../../util/testUtils');
import {TestResults} from '@cdo/apps/constants';
var blockUtils = require('@cdo/apps/block_utils.js');

module.exports = {
  app: "turtle",
  skinId: 'elsa',

  tests: [
    {
      description: "fractal snowflake",
      delayLoadLevelDefinition: function () {
        return {
          permittedErrors: 0,
          instant: true,
          answer: testUtils.generateArtistAnswer(function (api) {
            api.drawSnowflake('fractal');
          })
        };
      },
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
      xml: blockUtils.blockOfType('create_snowflake_dropdown', { TYPE: 'fractal' })
    },

    {
      description: "flower snowflake",
      delayLoadLevelDefinition: function () {
        return {
          permittedErrors: 0,
          instant: true,
          answer: testUtils.generateArtistAnswer(function (api) {
            api.drawSnowflake('flower');
          })
        };
      },
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
      xml: blockUtils.blockOfType('create_snowflake_dropdown', { TYPE: 'flower' })
    },

    {
      description: "spiral snowflake",
      delayLoadLevelDefinition: function () {
        return {
          permittedErrors: 0,
          instant: true,
          answer: testUtils.generateArtistAnswer(function (api) {
            api.drawSnowflake('spiral');
          })
        };
      },
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
      xml: blockUtils.blockOfType('create_snowflake_dropdown', { TYPE: 'spiral' })
    },

    {
      description: "line snowflake",
      delayLoadLevelDefinition: function () {
        return {
          permittedErrors: 0,
          instant: true,
          answer: testUtils.generateArtistAnswer(function (api) {
            api.drawSnowflake('line');
          })
        };
      },
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
      xml: blockUtils.blockOfType('create_snowflake_dropdown', { TYPE: 'line' })
    },

    {
      description: "parallelogram snowflake",
      delayLoadLevelDefinition: function () {
        return {
          permittedErrors: 0,
          instant: true,
          answer: testUtils.generateArtistAnswer(function (api) {
            api.drawSnowflake('parallelogram');
          })
        };
      },
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
      xml: blockUtils.blockOfType('create_snowflake_dropdown', { TYPE: 'parallelogram' })
    },

    {
      description: "square snowflake",
      delayLoadLevelDefinition: function () {
        return {
          permittedErrors: 0,
          instant: true,
          answer: testUtils.generateArtistAnswer(function (api) {
            api.drawSnowflake('square');
          })
        };
      },
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
      xml: blockUtils.blockOfType('create_snowflake_dropdown', { TYPE: 'square' })
    },

    {
      // Freeplay level that just uses a bunch of our blocks to get us some
      // better code coverage
      description: "other blocks",
      delayLoadLevelDefinition: function () {
        return {
          permittedErrors: 0,
          sliderSpeed: 1,
          answer: [],
          freePlay: true
        };
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      },
      runBeforeClick: function () {
        // This is a free-play level: click Finish when drawing is done.
        addEventListener('artistDrawingComplete', () => $('#finishButton').click());
      },
      xml: blockUtils.blocksFromList([
        'when_run',
        'create_a_snowflake_branch',
        'draw_a_snowflake',
        'draw_a_robot'
      ])

       // NOTE: there a bunch of other custom blocks that are still untested
    }
  ]
};
