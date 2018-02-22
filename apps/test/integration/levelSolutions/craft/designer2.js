import { TestResults } from '@cdo/apps/constants';

const levelDef = {
  isTestLevel: true,
  isEventLevel: true,
  groundPlane: ["grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "dirt", "dirtCoarse", "dirt", "dirtCoarse", "dirt", "grass", "grass", "grass", "grass", "grass", "dirt", "dirt", "dirt", "dirt", "dirt", "dirt", "dirtCoarse", "dirtCoarse", "grass", "grass", "grass", "dirt", "dirt", "dirt", "dirt", "dirt", "dirt", "dirt", "dirt", "dirt", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirt", "dirt", "dirt", "dirt", "dirt", "dirt", "dirt", "dirt", "grass", "grass", "grass", "dirtCoarse", "dirt", "dirtCoarse", "dirtCoarse", "dirt", "dirt", "dirt", "grass", "grass", "grass", "grass", "grass", "grass", "dirtCoarse", "dirtCoarse", "dirt", "dirtCoarse", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "dirt"],
  groundDecorationPlane: ["", "", "tallGrass", "", "", "", "", "", "", "", "", "tallGrass", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "tallGrass", "", "", "", "", "", "", "", "", "", "", "tallGrass", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "flowerDandelion", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "tallGrass", "", "", "", "", "tallGrass", ""],
  actionPlane: ["grass", "grass", "", "", "", "", "", "", "grass", "grass", "grass", "", "", "", "", "", "", "grass", "grass", "grass", "", "", "", "", "", "", "", "", "", "grass", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "grass", "", "", "", "", "", "", "", "", "", "grass", "grass", "grass", "", "", "", "", "", "", "grass"],
  entities: [["chicken", 3, 3, 1], ["chicken", 6, 3, 1], ["chicken", 3, 6, 1], ["chicken", 6, 6, 1]],
  usePlayer: false,
  levelVerificationTimeout: 5000,
  timeoutVerificationFunction: verificationAPI => (
    verificationAPI.getRepeatCommandExecutedCount("moveForward") > 0
  ),
  verificationFunction: () => false,
};

export default {
  app: 'craft',
  skinId: 'craft',
  levelDefinition: levelDef,
  tests: [
    {
      description: 'Craft Designer 2',
      xml: `
        <xml>
          <block type="craft_chickenSpawned" deletable="false">
            <statement name="WHEN_SPAWNED">
              <block type="craft_forever">
                <statement name="DO">
                  <block type="craft_moveForward">
                    <next>
                      <block type="craft_entityTurnLR">
                        <title name="DIR">left</title>
                      </block>
                    </next>
                  </block>
                </statement>
              </block>
            </statement>
          </block>
        </xml>`,
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS,
      },
    },
  ],
};
