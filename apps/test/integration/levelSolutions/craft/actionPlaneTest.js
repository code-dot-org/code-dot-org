import { TestResults } from '@cdo/apps/constants';

const levelDef = {
  isTestLevel: true,
  gridWidth: 4,
  gridHeight: 3,
  groundPlane: ["grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass"],
  groundDecorationPlane: ["","","","","","","","","","","",""],
  actionPlane: ["","","","","grass","grass","","grass","","","",""],
  playerStartPosition: [0, 1],
  playerStartDirection: 1,
  verificationFunction: `
    function (verificationAPI) {
      return verificationAPI.solutionMapMatchesResultMap([
        "", "", "", "",
        "grass", "grass", "planksBirch", "grass",
        "", "", "", ""
      ]) && verificationAPI.isPlayerAt([3, 1]);
    }`,
};

export default {
  app: 'craft',
  skinId: 'craft',
  levelDefinition: levelDef,
  tests: [
    {
      description: 'Craft walk above action plane',
      xml: `
        <xml>
          <block type="when_run" deletable="false" movable="false">
            <next>
              <block type="craft_moveForward">
                <next>
                  <block type="craft_moveForward">
                    <next>
                      <block type="craft_placeBlock">
                        <title name="TYPE">planksBirch</title>
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
        </xml>`,
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS,
      },
    },
    {
      description: 'Craft fall into hole',
      xml: `
        <xml>
          <block type="when_run" deletable="false" movable="false">
            <next>
              <block type="craft_moveForward">
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
        result: false,
        testResult: TestResults.APP_SPECIFIC_FAIL,
      },
    },
  ],
};
