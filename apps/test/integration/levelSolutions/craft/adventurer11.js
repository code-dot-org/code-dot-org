import { TestResults } from '@cdo/apps/constants';

const levelDef = {
  isTestLevel: true,
  groundPlane: ["stone","stone","stone","stone","stone","stone","stone","lava","stone","stone","stone","stone","stone","stone","stone","stone","lava","lava","stone","stone","stone","stone","stone","stone","stone","stone","lava","lava","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","lava","stone","lava","lava","stone","stone","lava","stone","stone","lava","stone","lava","stone","stone","lava","lava","stone","lava","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone"],
  groundDecorationPlane: ["","","","","","","","","","","","","","","","","","lavaPop","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","lavaPop","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""],
  actionPlane: ["stone","stone","stone","stone","stone","stone","stone","","stone","stone","stone","stone","","","","","","","stone","stone","stone","","","","","","","","stone","stone","stone","","","","","","","","stone","stone","stone","","stone","stone","oreCoal","oreCoal","stone","oreIron","oreIron","stone","stone","","","","","","","","","","stone","","","","","","stone","","stone","stone","stone","stone","","","stone","","","","stone","stone","stone","stone","","","stone","stone","","","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone"],
  playerStartPosition: [1, 4],
  playerStartDirection: 1,
  verificationFunction: `
    function (verificationAPI) {
      return verificationAPI.countOfTypeOnMap("oreIron") == 0 && verificationAPI.countOfTypeOnMap("oreCoal") == 0;
    }`,
};

export default {
  app: 'craft',
  skinId: 'craft',
  levelDefinition: levelDef,
  tests: [
    {
      description: 'Craft Adventurer 11',
      xml: `
        <xml>
          <block type="when_run" deletable="false" movable="false">
            <next>
              <block type="controls_repeat_dropdown">
                <title name="TIMES" config="2-10">7</title>
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
