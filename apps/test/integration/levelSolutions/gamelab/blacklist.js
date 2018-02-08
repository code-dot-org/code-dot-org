import {gamelabLevelDefinition} from '../../gamelabLevelDefinition';
import {testAsyncProgramGameLab} from '../../util/levelTestHelpers';

// These tests try to call blacklisted p5 APIs, and expect them to fail.
module.exports = {
  app: "gamelab",
  skinId: "gamelab",
  levelDefinition: gamelabLevelDefinition,
  tests: [
    testAsyncProgramGameLab(
      'Game Lab blacklisted APIs',
      [
        'httpGet',
        'httpPost',
        'httpDo',
        'loadJSON',
        'loadStrings',
        'loadTable',
        'loadXML',
      ].map(name => `console.log("${name}: " + typeof ${name});`)
        .concat(`console.log('done');`)
        .join('\n'),
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
