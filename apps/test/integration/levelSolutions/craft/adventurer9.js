import { TestResults } from '@cdo/apps/constants';

const levelDef = {
  isTestLevel: true,
  groundPlane: ["stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone"],
  groundDecorationPlane: ["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""],
  actionPlane: ["stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","","","oreCoal","oreCoal","oreCoal","stone","oreCoal","stone","stone","stone","","","","","","","stone","stone","stone","stone","","","","","","","oreCoal","stone","stone","stone","","stone","","","","","oreCoal","stone","stone","stone","stone","stone","oreCoal","oreCoal","","","stone","","","stone","stone","stone","stone","stone","","","stone","stone","stone","stone","stone","stone","stone","stone","","stone","stone","stone","stone","stone","stone","stone","stone","stone","","stone","stone","stone","stone"],
  playerStartPosition: [5, 6],
  playerStartDirection: 0,
  verificationFunction: `
    function (verificationAPI) {
      // the player has collected at least 2 wool
      return verificationAPI.getInventoryAmount("oreCoal") >= 2 && verificationAPI.countOfTypeOnMap("torch") >= 2;
    }`,
};

export default {
  app: 'craft',
  skinId: 'craft',
  levelDefinition: levelDef,
  tests: [
    {
      description: 'Craft Adventurer 9',
      xml: `
        <xml>
          <block type="when_run" deletable="false" movable="false">
            <next>
              <block type="craft_turn">
                <title name="DIR">left</title>
                <next>
                  <block type="controls_repeat_dropdown">
                    <title name="TIMES" config="2-10">3</title>
                    <statement name="DO">
                      <block type="craft_placeTorch">
                        <next>
                          <block type="craft_destroyBlock">
                            <next>
                              <block type="craft_moveForward"></block>
                            </next>
                          </block>
                        </next>
                      </block>
                    </statement>
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
