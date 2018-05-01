import {TestResults} from '@cdo/apps/constants';
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
    isTestLevel: true,
    playerStartPosition: [3, 4],
    playerStartDirection: 1,
    groundPlane: _.range(100).map(() => { return "grass"; }),
    groundDecorationPlane: blankPlane,
    actionPlane: actionPlane,
    fluffPlane: blankPlane,
    verificationFunction: (verificationAPI => {
      return verificationAPI.isPlayerNextTo("sheep");
    }).toString(),
    requiredBlocks: '',
    ideal: 3,
    freePlay: false
  },
  tests: [
    {
      description: "walk forward next to sheep",
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
      xml: '<xml>' + blockUtils.blocksFromList([
        'craft_moveForward',
        'craft_moveForward'
      ]) + "</xml>"
    },
    {
      description: "walk forward turn right",
      expected: {
        result: false,
        testResult: TestResults.APP_SPECIFIC_FAIL
      },
      xml: '<xml><block type="craft_moveForward"><next><block type="craft_turn"><title name="DIR">right</title></block></next></block></xml>'
    },
    {
      description: "walk forward with too few blocks to reach sheep",
      expected: {
        result: false,
        testResult: TestResults.TOO_FEW_BLOCKS_FAIL
      },
      xml: '<xml>' + blockUtils.blocksFromList([
        'craft_moveForward'
      ]) + '</xml>'
    },
  ]
};
