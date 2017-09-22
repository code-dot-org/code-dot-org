import { TestResults } from '@cdo/apps/constants';

const levelDef = {
  isTestLevel: true,
  groundPlane: ["grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "grass","grass","grass","grass","grass","grass","dirtCoarse", "grass","grass","dirtCoarse", "grass","grass","grass","grass","grass","grass","dirtCoarse", "grass","grass","dirtCoarse", "grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass"],
  groundDecorationPlane: ["","","","","","","","","","","","","","","","","","","","","","","","","","","","","tallGrass","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","tallGrass","","","","","","","","",""],
  actionPlane: ["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","houseBottomA","houseBottomB","houseBottomC","houseBottomD","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""],
  playerStartPosition: [3, 6],
  playerStartDirection: 0,
  verificationFunction: `
    function (verificationAPI) {
      return verificationAPI.solutionMapMatchesResultMap(['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'any', 'any', 'any', 'any', '', '', '', '', '', '', 'any', '', '', 'any', '', '', '', '', '', '', 'any', '', '', 'any', '', '', '', '', '', '', 'any', 'any', 'any', 'any', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']);
    }`,
};

export default {
  app: 'craft',
  skinId: 'craft',
  levelDefinition: levelDef,
  tests: [
    {
      description: 'Craft Adventurer 6',
      xml: `
        <xml>
          <block type="when_run" deletable="false" movable="false">
            <next>
              <block type="controls_repeat_dropdown">
                <title name="TIMES" config="2-10">3</title>
                <statement name="DO">
                  <block type="controls_repeat_dropdown">
                    <title name="TIMES" config="2-10">3</title>
                    <statement name="DO">
                      <block type="craft_moveForward">
                        <next>
                          <block type="craft_placeBlock">
                            <title name="TYPE">planksBirch</title>
                          </block>
                        </next>
                      </block>
                    </statement>
                    <next>
                      <block type="craft_turn">
                        <title name="DIR">right</title>
                      </block>
                    </next>
                  </block>
                </statement>
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
