import { TestResults } from '@cdo/apps/constants';

const levelDef = {
  isTestLevel: true,
  gridWidth: 20,
  gridHeight: 20,
  groundPlane: ["grass","grass","grass","grass","dirt","dirt","grass","grass","grass","water","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","water","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","water","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","water","water","water","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","water","grass","water","water","water","water","grass","grass","water","water","water","water","water","grass","grass","grass","grass","grass","grass","water","water","grass","grass","grass","grass","water","water","water","water","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","water","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","dirt","water","water","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","dirt","grass","water","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","dirt","grass","grass","grass","dirt","water","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","dirt","dirt","dirt","dirt","grass","grass","grass","grass","grass","water","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","dirt","dirt","dirt","dirt","grass","dirt","grass","grass","grass","water","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","dirt","dirt","dirt","dirt","grass","grass","grass","grass","grass","water","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","dirt","dirt","dirt","dirt","grass","dirt","dirt","grass","grass","water","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","water","water","water","water","water","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","dirt","dirt","grass","dirt","grass","water","grass","grass","grass","water","water","water","water","water","water","water","stone","lava","lava","lava","grass","grass","grass","grass","grass","water","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","lava","grass","grass","grass","grass","grass","dirt","grass","grass","water","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","lava","grass","grass","grass","dirt","grass","grass","grass","grass","water","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","lava","grass","grass","grass","grass","grass","grass","grass","grass","water","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","lava","grass","grass","grass"],
  groundDecorationPlane: ["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""],
  actionPlane: ["oreLapis","oreLapis","stone","stone","stone","stone","stone","oreIron","oreIron","","oreRedstone","oreRedstone","oreRedstone","stone","","stone","stone","oreIron","oreGold","oreGold","oreLapis","oreCoal","","stone","oreIron","oreIron","","stone","","","stone","oreRedstone","stone","stone","","","","stone","stone","oreGold","oreCoal","stone","","","","","","","","","","stone","","stone","","","","","","","stone","","","","","","treeOak","","","","","","","","","","treeOak","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","treeBirch","","","","","","","","","","treeBirch","","","","","","","","","","","","","","","","treeSpruce","","","","","","","","","","treeSpruce","","","","","","","","","oreIron","","","","","","","","","","","","","","treeOak","","","","","","stone","oreIron","","","","","","","","","","","","","","","treeSpruce","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","treeOak","","","","","","treeBirch","","","","","","","","","sheep","","","","","","","","","","","","","","","","","","","","","","sheep","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","sheep","","","","","","","","","treeBirch","","","","","","","","oreDiamond","sheep","","","","sheep","","","treeSpruce","","","","","","","","","","","oreDiamond","oreDiamond","","","","","","","","","","","","","","","","","","","oreEmerald","oreLapis"],
  playerStartPosition: [10, 10],
  playerStartDirection: 0,
  verificationFunction: `
    function (verificationAPI) {
      return true;
    }`,
};

export default {
  app: 'craft',
  skinId: 'craft',
  levelDefinition: levelDef,
  tests: [
    {
      description: 'Craft Adventurer 14',
      xml: `
        <xml>
          <block type="when_run" deletable="false" movable="false">
            <next>
              <block type="craft_moveForward">
                <next>
                  <block type="craft_moveForward"></block>
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
