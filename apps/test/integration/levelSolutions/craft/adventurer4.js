import { TestResults } from '@cdo/apps/constants';

const levelDef = {
  isTestLevel: true,
  groundPlane: ["grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","dirt","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","dirt","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","dirt","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","dirt","grass","grass","grass","grass","grass","grass","grass","grass","dirt","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","dirt","dirt","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass"],
  groundDecorationPlane: ["","","","","","","","","","","","","","","","","","","","","","","","","","","","","tallGrass","","","","","","","","","","","flowerOxeeye","","","","","","","","","flowerDandelion","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","tallGrass","","","","","","","","flowerRose","","tallGrass","tallGrass","","","","","","tallGrass","","flowerOxeeye"],
  actionPlane: ["","grass","grass","grass","grass","grass","grass","grass","grass","grass","","","","","grass","grass","grass","grass","grass","grass","","","","","","","","","","","","","","","","","treeSpruce","","","","","","treeOak","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","treeBirch","","","","","","","","","","","","","","","","","","","","","",""],
  playerStartPosition: [3, 7],
  playerStartDirection: 1,
  verificationFunction: `
    function (verificationAPI) {
      return verificationAPI.getInventoryAmount("planksBirch") === 1 &&
        verificationAPI.getInventoryAmount("planksSpruce") === 1 &&
        verificationAPI.getInventoryAmount("planksOak") === 1;
    }`
};

export default {
  app: 'craft',
  skinId: 'craft',
  levelDefinition: levelDef,
  tests: [
    {
      description: 'Craft Adventurer 4',
      xml: `
        <xml>
          <block type="when_run" deletable="false" movable="false">
            <next>
              <block type="craft_moveForward">
                <next>
                  <block type="craft_moveForward">
                    <next>
                      <block type="craft_moveForward">
                        <next>
                          <block type="craft_destroyBlock">
                            <next>
                              <block type="craft_turn">
                                <title name="DIR">left</title>
                                <next>
                                  <block type="craft_moveForward">
                                    <next>
                                      <block type="craft_moveForward">
                                        <next>
                                          <block type="craft_moveForward">
                                            <next>
                                              <block type="craft_destroyBlock">
                                                <next>
                                                  <block type="craft_turn">
                                                    <title name="DIR">left</title>
                                                    <next>
                                                      <block type="craft_moveForward">
                                                        <next>
                                                          <block type="craft_moveForward">
                                                            <next>
                                                              <block type="craft_moveForward">
                                                                <next>
                                                                  <block type="craft_destroyBlock"></block>
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
                        </next>
                      </block>
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
