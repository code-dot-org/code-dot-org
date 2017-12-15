import {gamelabLevelDefinition} from '../../gamelabLevelDefinition';
import {testAsyncProgramGameLab} from '../../util/levelTestHelpers';

module.exports = {
  app: "gamelab",
  skinId: "gamelab",
  levelDefinition: gamelabLevelDefinition,
  tests: [
    testAsyncProgramGameLab(
      "Not-overlapping group and target do not collide",
      `
        var one = createSprite(200, 200);
        var two = createSprite(300, 200);
        var three = createSprite(100, 200);
        var target = createSprite(0, 0);
        var group = createGroup();
        group.add(one);
        group.add(two);
        group.add(three);
        if(group.collide(target)){
          console.log("collided");
        }
        console.log("done");
      `,
      function isProgramDone(){
        var debugOutput = document.getElementById('debug-output');
        return debugOutput.textContent.includes('done');
      },
      function validateResult(assert) {
        var debugOutput = document.getElementById('debug-output');
        assert.notInclude(debugOutput.textContent, 'collided');
      }
    ),
    testAsyncProgramGameLab(
      'Overlapping target and first sprite of group causes group collision',
      `
        var one = createSprite(200, 200);
        var two = createSprite(300, 200);
        var three = createSprite(100, 200);
        var target = createSprite(200, 200);
        var group = createGroup();
        group.add(one);
        group.add(two);
        group.add(three);
        if(target.collide(one)){
          console.log("collided");
        }
        console.log("done");
      `,
      function isProgramDone(){
        var debugOutput = document.getElementById('debug-output');
        return debugOutput.textContent.includes('done');
      },
      function validateResult(assert) {
        var debugOutput = document.getElementById('debug-output');
        assert.include(debugOutput.textContent, 'collided');
      }
    ),
    testAsyncProgramGameLab(
      'Overlapping target and middle sprite of group causes group collision',
      `
        var one = createSprite(200, 200);
        var two = createSprite(300, 200);
        var three = createSprite(100, 200);
        var target = createSprite(300, 200);
        var group = createGroup();
        group.add(one);
        group.add(two);
        group.add(three);
        if(target.collide(two)){
          console.log("collided");
        }
        console.log("done");
      `,
      function isProgramDone(){
        var debugOutput = document.getElementById('debug-output');
        return debugOutput.textContent.includes('done');
      },
      function validateResult(assert) {
        var debugOutput = document.getElementById('debug-output');
        assert.include(debugOutput.textContent, 'collided');
      }
    ),
    testAsyncProgramGameLab(
      'Overlapping target and last sprite of group causes group collision',
      `
        var one = createSprite(200, 200);
        var two = createSprite(300, 200);
        var three = createSprite(100, 200);
        var target = createSprite(100, 200);
        var group = createGroup();
        group.add(one);
        group.add(two);
        group.add(three);
        if(target.collide(three)){
          console.log("collided");
        }
        console.log("done");
      `,
      function isProgramDone(){
        var debugOutput = document.getElementById('debug-output');
        return debugOutput.textContent.includes('done');
      },
      function validateResult(assert) {
        var debugOutput = document.getElementById('debug-output');
        assert.include(debugOutput.textContent, 'collided');
      }
    ),
  ]
};
