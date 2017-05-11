var TestResults = require('@cdo/apps/constants.js').TestResults;
import blockUtils from '@cdo/apps/block_utils';

let _ = require('lodash');

let blankPlane = _.range(100).map(function () {
  return "";
});
let actionPlane = _.clone(blankPlane);
actionPlane[(4 * 10) + 6] = "sheep";

module.exports = {
  app: "craft",
  skinId: 'craft',
  levelDefinition: {
    isConectionLevel: true,
    freePlay: false
  },
  tests: [
    {
      description: "code connection",
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
      xml: '<xml>'+ "</xml>"
    },
  ]
};
