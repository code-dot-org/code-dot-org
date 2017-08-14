import { TestResults } from '@cdo/apps/constants.js';

const levelDef = {
  isTestLevel: true,
  groundPlane: ["stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","lava","stone","stone","stone","stone","stone","lava","stone","stone","lava","lava","lava","lava","lava","lava","lava","lava","lava","lava","stone","stone","stone","stone","stone","stone","stone","lava","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone"],
  groundDecorationPlane: ["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","lavaPop","","","torch","","","","","","","","","","lavaPop","","","","lavaPop","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""],
  actionPlane: ["stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","oreIron","oreIron","oreIron","stone","stone","stone","stone","stone","stone","stone","oreIron","oreIron","oreIron","stone","stone","stone","stone","stone","","","","","","","","","stone","","","","","","","","","","","stone","stone","stone","","","","","","stone","stone","","","","","","stone","stone","","stone","stone","stone","","","","","","","","stone","stone","stone","stone","","","","","","","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone"],
  playerStartPosition: [3, 6],
  playerStartDirection: 0,
  verificationFunction: `
    function (verificationAPI) {
      // the player has collected at least 2 iron
      return verificationAPI.getInventoryAmount("oreIron") >= 2;
    }`,
};

export default {
  app: 'craft',
  skinId: 'craft',
  levelDefinition: levelDef,
  tests: [
    {
      description: 'Craft Adventurer 10',
      xml: `
        <xml>
          <block type="when_run" deletable="false" movable="false">
            <next>
              <block type="craft_moveForward">
                <next>
                  <block type="craft_placeBlockAhead">
                    <title name="TYPE">cobblestone</title>
                    <next>
                      <block type="controls_repeat_dropdown">
                        <title name="TIMES" config="2-10">3</title>
                        <statement name="DO">
                          <block type="craft_moveForward">
                            <next>
                              <block type="craft_destroyBlock"></block>
                            </next>
                          </block>
                        </statement>
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
