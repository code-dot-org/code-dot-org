import { TestResults } from '@cdo/apps/constants';

const levelDef = {
  isTestLevel: true,
  specialLevelType: 'minecart',
  groundPlane: ["grass","grass","houseLeftA","grass","grass","houseRightA","grass","grass","grass","grass","grass","grass","houseBottomA","houseBottomB","houseBottomC","houseBottomD","grass","grass","grass","grass","grass","grass","grass","dirt","grass","grass","grass","grass","grass","grass","grass","grass","grass","dirt","grass","grass","grass","grass","grass","grass","grass","grass","water","dirt","water","water","grass","grass","grass","grass","grass","grass","water","dirt","water","water","water","grass","grass","grass","grass","grass","grass","dirt","grass","grass","grass","grass","grass","grass","grass","grass","grass","dirt","dirt","dirt","dirt","dirt","dirt","dirt","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass"],
  groundDecorationPlane: ["tallGrass","tallGrass","","","","","","tallGrass","","","","flowerOxeeye","","","","","tallGrass","","","","","","","","","","","","tallGrass","flowerDandelion","","tallGrass","","","","","","","","","tallGrass","","","","","","tallGrass","","","","","","","","","","","","","","","","tallGrass","","","tallGrass","","","","","","","","","","","","","","","","","","","","","tallGrass","","","tallGrass","","","","","","","","","tallGrass","flowerRose"],
  actionPlane: ["","","houseLeftA","","","houseRightA","","","","","","","houseBottomA","","houseBottomC","houseBottomD","","","","","","","railsRedstoneTorch","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","treeOak","","","","","","","","","","","","","","","","","","","","","","treeBirch","","","","","","","","","","","","","","","","","","",""],
  playerStartPosition: [9, 7],
  playerStartDirection: 2,
  verificationFunction: `
    function (verificationAPI) {
      return verificationAPI.solutionMapMatchesResultMap([
        "", "", "", "", "", "", "", "", "", "",
        "", "", "", "", "", "", "", "", "", "",
        "", "", "", "any", "", "", "", "", "", "",
        "", "", "", "any", "", "", "", "", "", "",
        "", "", "", "any", "", "", "", "", "", "",
        "", "", "", "any", "", "", "", "", "", "",
        "", "", "", "any", "", "", "", "", "", "",
        "", "", "", "any", "any", "any", "any", "any", "any", "any",
        "", "", "", "", "", "", "", "", "", "",
        "", "", "", "", "", "", "", "", "", ""
      ]);
    }`,
};

export default {
  app: 'craft',
  skinId: 'craft',
  levelDefinition: levelDef,
  tests: [
    {
      description: 'Craft Adventurer 13',
      xml: `
        <xml>
          <block type="when_run" deletable="false" movable="false">
            <next>
              <block type="controls_repeat_dropdown">
                <title name="TIMES" config="2-10">2</title>
                <statement name="DO">
                  <block type="craft_turn">
                    <title name="DIR">right</title>
                    <next>
                      <block type="controls_repeat_dropdown">
                        <title name="TIMES" config="2-10">6</title>
                        <statement name="DO">
                          <block type="craft_placeBlock">
                            <title name="TYPE">rail</title>
                            <next>
                              <block type="craft_moveForward"></block>
                            </next>
                          </block>
                        </statement>
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
