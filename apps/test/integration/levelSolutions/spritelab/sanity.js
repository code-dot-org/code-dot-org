import GameLabJr from '@cdo/interpreted/GameLabJr.interpreted.js';
import ValidationSetup from '@cdo/interpreted/ValidationSetup.interpreted.js';
import {TestResults} from '@cdo/apps/constants';

const levelDef = {
  helperLibraries: ['GameLabJr'],
  sharedBlocks: [{
    name: "gamelab_setBackground",
    config: {
      color: [
        240,
        0.45,
        0.65,
      ],
      func: "setBackground",
      blockText: "set background color {COLOR}",
      args: [
        {
          name: "COLOR",
          type: "Colour",
        }
      ]
    }
  }],
  validationCode: 'if (World.background_color === "#ff0000") { levelSuccess(); } else { levelSuccess(3); }',
};

export default {
  app: 'gamelab',
  skinId: 'gamelab',
  levelDefinition: levelDef,
  tests: [
    {
      libraries: {GameLabJr, ValidationSetup},
      description: 'Sprite Lab fail',
      xml: `
        <xml>
          <block type="when_run" deletable="false" movable="false"/>
        </xml>`,
      expected: {
        result: true,
        testResult: TestResults.LEVEL_INCOMPLETE_FAIL,
      },
    },
    {
      libraries: {GameLabJr, ValidationSetup},
      description: 'Sprite Lab pass',
      xml: `
        <xml>
          <block type="when_run" deletable="false" movable="false">
            <next>
              <block type="gamelab_setBackground">
                <value name="COLOR">
                  <block type="colour_picker">
                    <title name="COLOUR">#ff0000</title>
                  </block>
                </value>
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
