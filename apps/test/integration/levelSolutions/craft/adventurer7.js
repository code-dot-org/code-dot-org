/* global Craft */
import sinon from 'sinon';
import { TestResults } from '@cdo/apps/constants';

const levelDef = {
  isTestLevel: true,
  groundPlane: ["grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","farmlandWet","water","farmlandWet","grass","grass","dirt","grass","grass","grass","grass","farmlandWet","water","farmlandWet","grass","dirt","grass","grass","grass","grass","grass","farmlandWet","water","farmlandWet","grass","grass","dirt","grass","grass","grass","grass","farmlandWet","water","farmlandWet","grass","grass","grass","grass","grass","grass","grass","farmlandWet","water","farmlandWet","grass","grass","grass","grass","grass","grass","grass","farmlandWet","water","farmlandWet","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass"],
  groundDecorationPlane: ["flowerOxeeye","tallGrass","","","","tallGrass","","","flowerDandelion","tallGrass","tallGrass","tallGrass","flowerDandelion","","","","","","","flowerDandelion","","flowerDandelion","","","","","","","","","","","","","","","","","","tallGrass","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","tallGrass","flowerDandelion","","","","","","tallGrass","","","","","","","","","tallGrass","flowerDandelion","tallGrass","","","","","","","","tallGrass","tallGrass"],
  actionPlane: ["","","grass","grass","","","","","","","","","","grass","","","","","","","","","","","","","","","sheep","","houseRightC","","","","","","","","","","houseRightB","","","","","","","","","","houseRightA","","","","","","","","","","houseBottomD","","sheep","","","","","","","","","","","","","","","","","","","","grass","","","","","","","","","","grass","grass","","","","","",""],
  playerStartPosition: [4, 7],
  playerStartDirection: 0,
  verificationFunction: `
    function (verificationAPI) {
      return verificationAPI.solutionMapMatchesResultMap([
        "", "", "", "", "", "", "", "", "", "",
        "", "", "", "", "", "", "", "", "", "",
        "", "", "", "", "cropWheat", "", "cropWheat", "", "", "",
        "", "", "", "", "cropWheat", "", "cropWheat", "", "", "",
        "", "", "", "", "cropWheat", "", "cropWheat", "", "", "",
        "", "", "", "", "cropWheat", "", "cropWheat", "", "", "",
        "", "", "", "", "cropWheat", "", "cropWheat", "", "", "",
        "", "", "", "", "cropWheat", "", "cropWheat", "", "", "",
        "", "", "", "", "", "", "", "", "", "",
        "", "", "", "", "", "", "", "", "", ""
      ]);
    }`,
};

let spy;

export default {
  app: 'craft',
  skinId: 'craft',
  levelDefinition: levelDef,
  tests: [
    {
      description: 'Craft Adventurer 7 fail',
      xml: `
        <xml>
          <block type="when_run" deletable="false" movable="false">
            <next>
              <block type="craft_turn">
                <title name="DIR">right</title>
                <next>
                  <block type="craft_moveForward"></block>
                </next>
              </block>
            </next>
          </block>
        </xml>`,
      expected: {
        result: false,
        testResult: TestResults.APP_SPECIFIC_FAIL,
      },
      runBeforeClick: () => {
        spy = sinon.spy(Craft.gameController.levelView, 'playDrownFailureAnimation');
      },
      customValidator: () => {
        return spy.called;
      },
    },
    {
      description: 'Craft Adventurer 7 pass',
      xml: `
        <xml>
          <block type="when_run" deletable="false" movable="false">
            <next>
              <block type="controls_repeat_dropdown">
                <title name="TIMES" config="2-10">2</title>
                <statement name="DO">
                  <block type="controls_repeat_dropdown">
                    <title name="TIMES" config="2-10">6</title>
                    <statement name="DO">
                      <block type="craft_plantCrop">
                        <next>
                          <block type="craft_moveForward"></block>
                        </next>
                      </block>
                    </statement>
                    <next>
                      <block type="craft_turn">
                        <title name="DIR">right</title>
                        <next>
                          <block type="craft_moveForward">
                            <next>
                              <block type="craft_moveForward">
                                <next>
                                  <block type="craft_turn">
                                    <title name="DIR">right</title>
                                    <next>
                                      <block type="craft_moveForward"></block>
                                    </next>
                                  </block>
                                </next>
                              </block>
                            </next>
                          </block>
                        </next>
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
