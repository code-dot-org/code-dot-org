import { TestResults } from '@cdo/apps/constants';

const levelDef = {
  isTestLevel: true,
  groundPlane: ["stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","lava","stone","lava","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","lava","stone","stone","stone","stone","lava","lava","lava","lava","stone","stone","stone","stone","stone","stone","lava","lava","lava","lava","stone","lava","stone","stone","stone","stone","lava","stone","stone","stone","lava","stone","stone","stone","stone","lava","lava","stone","stone","stone","stone","lava","stone","stone","lava","lava","stone","stone","stone","stone","stone","stone","stone","stone","lava","lava","stone","stone","stone","stone","stone","stone","stone","stone","lava","lava","stone","stone","stone","stone","stone","stone","stone","stone"],
  groundDecorationPlane: ["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","lavaPop","","","","","","","","","","","","","","","","","","","","","","","","","","","lavaPop","","","","","","","","lavaPop","","","","","","","","","","","","","","","","","","","","","lavaPop","","","","","","","",""],
  actionPlane: ["stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","","stone","oreRedstone","oreDiamond","stone","oreRedstone","stone","stone","stone","","","oreRedstone","","","oreRedstone","oreRedstone","stone","stone","stone","","","","","","","oreDiamond","stone","stone","","","","","","","","stone","stone","stone","","","","","","","oreRedstone","stone","stone","stone","","","","stone","stone","stone","oreRedstone","stone","stone","stone","","","","","","","","","stone","stone","","","","","","","","","stone","stone","","","stone","stone","stone","stone","stone","stone","stone","stone"],
  playerStartPosition: [3, 5],
  playerStartDirection: 1,
  verificationFunction: `
    function (verificationAPI) {
      return verificationAPI.getInventoryAmount("oreRedstone") >= 3;
    }`,
};

export default {
  app: 'craft',
  skinId: 'craft',
  levelDefinition: levelDef,
  tests: [
    {
      description: 'Craft Adventurer 12',
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
                      <block type="craft_destroyBlock">
                        <next>
                          <block type="craft_ifLavaAhead">
                            <statement name="DO">
                              <block type="craft_placeBlockAhead">
                                <title name="TYPE">cobblestone</title>
                              </block>
                            </statement>
                            <next>
                              <block type="craft_moveForward"></block>
                            </next>
                          </block>
                        </next>
                      </block>
                    </statement>
                    <next>
                      <block type="craft_turn">
                        <title name="DIR">left</title>
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
