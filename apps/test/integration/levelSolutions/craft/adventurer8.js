/* global Craft */
import { TestResults } from '@cdo/apps/constants';

const COMMAND_STATE_WORKING = 1;

const levelDef = {
  isTestLevel: true,
  groundPlane: ["grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","houseBottomB","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass"],
  groundDecorationPlane: ["","","","","","","","","","","","","","","","","","","","","","","","","","","","","tallGrass","flowerDandelion","","tallGrass","","","","","","","","","tallGrass","","","","","tallGrass","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","tallGrass","","","","","","","","",""],
  actionPlane: ["","","","houseLeftA","","","houseRightA","","","","","","torch","houseBottomA","","houseBottomC","houseBottomD","","","","","","creeper","","","","","","","","","","","","creeper","torch","","creeper","","","","","","creeper","","","","","","creeper","grass","","","","","creeper","","creeper","","","grass","","","","","","","","","","grass","","","","","","creeper","","","","grass","","","","","","","","","grass","","","","","","","","grass","grass","grass"],
  playerStartPosition: [2, 6],
  playerStartDirection: 1,
  verificationFunction: `
    function (verificationAPI) {
      // temporarily let them be in front of, or in the door
      return verificationAPI.isPlayerAt([4, 1]) || verificationAPI.isPlayerAt([4, 2]) || verificationAPI.isPlayerAt([4, 0]) || verificationAPI.isPlayerAt([5, 0]);
    }`,
};

export default {
  app: 'craft',
  skinId: 'craft',
  levelDefinition: levelDef,
  tests: [
    {
      description: 'Craft Adventurer 8 walk into creeper',
      xml: `
        <xml>
          <block type="when_run" deletable="false" movable="false">
            <next>
              <block type="craft_turn">
                <title name="DIR">left</title>
                <next>
                  <block type="controls_repeat_dropdown">
                    <title name="TIMES" config="2-10">4</title>
                    <statement name="DO">
                      <block type="craft_moveForward"></block>
                    </statement>
                  </block>
                </next>
              </block>
            </next>
          </block>
        </xml>`,
      expected: {
        result: false,
        testResult: TestResults.APP_SPECIFIC_FAIL,
      },
      customValidator: () => {
        return Craft.gameController.levelModel.getEntityAt([2, 2]).queue.state === COMMAND_STATE_WORKING;
      },
    },
    {
      description: 'Craft Adventurer 8 pass',
      xml: `
        <xml>
          <block type="when_run" deletable="false" movable="false">
            <next>
              <block type="controls_repeat_dropdown">
                <title name="TIMES" config="2-10">2</title>
                <statement name="DO">
                  <block type="controls_repeat_dropdown">
                    <title name="TIMES" config="2-10">4</title>
                    <statement name="DO">
                      <block type="craft_moveForward"></block>
                    </statement>
                    <next>
                      <block type="craft_turn">
                        <title name="DIR">left</title>
                      </block>
                    </next>
                  </block>
                </statement>
                <next>
                  <block type="craft_moveForward">
                    <next>
                      <block type="craft_moveForward"></block>
                    </next>
                  </block>
                </next>
              </block>
            </next>
          </block>
        </xml>`,
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS,
      },
    },
  ],
};
