import {gamelabLevelDefinition} from '../../gamelabLevelDefinition';
import {testAsyncProgramGameLab} from '../../util/levelTestHelpers';

// These tests force us to custom marshal p5 objects properly, and are
// written to fail if they are improperly marshaled.
module.exports = {
  app: "gamelab",
  skinId: "gamelab",
  levelDefinition: gamelabLevelDefinition,
  tests: [
    testAsyncProgramGameLab(
      'Game Lab custom marshal SpriteSheet returned from loadSpriteSheet()',
      `
        // create empty SpriteSheet with no images or frames
        var spriteSheet = loadSpriteSheet();
        // loadAnimation() will error out if we try to pass in an improperly
        // marshaled SpriteSheet object.
        var animation = loadAnimation(spriteSheet);
        console.log('done');
      `,
      function isProgramDone() {
        const debugOutput = document.getElementById('debug-output').textContent;
        return debugOutput.includes('done');
      },
      function validateResult(assert) {
        const debugOutput = document.getElementById('debug-output').textContent;
        assert.notInclude(debugOutput, 'function');
      }
    ),
  ]
};
