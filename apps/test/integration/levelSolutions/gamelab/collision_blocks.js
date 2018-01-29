import {gamelabLevelDefinition} from '../../gamelabLevelDefinition';
import {testAsyncProgramGameLab} from '../../util/levelTestHelpers';

module.exports = {
  app: "gamelab",
  skinId: "gamelab",
  levelDefinition: gamelabLevelDefinition,
  tests: [
    testAsyncProgramGameLab(
      "Not-overlapping sprites do not collide",
      `
        var sprite1 = createSprite(0, 0);
        var sprite2 = createSprite(300, 300);
        if(sprite1.collide(sprite2)){
          console.log("collided");
        }
        console.log("done");
      `,
      function isProgramDone(){
        var debugOutput = document.getElementById('debug-output').textContent;
        return debugOutput.includes('done');
      },
      function validateResult(assert){
        var debugOutput = document.getElementById('debug-output');
        assert.notInclude(debugOutput.textContent, 'collided');
      },
    ),
    testAsyncProgramGameLab(
      'Overlapping Sprites collide',
      `
        var sprite1 = createSprite(200, 200);
        var sprite2 = createSprite(200, 200);
        if(sprite1.collide(sprite2)){
          console.log("collided");
        }
        console.log("done");
      `,
      function isProgramDone(){
          var debugOutput = document.getElementById('debug-output');
          return debugOutput.textContent.includes('done');
      },
      function validateResult(assert){
        var debugOutput = document.getElementById('debug-output');
        assert.include(debugOutput.textContent, 'collided');
      },
    ),
    testAsyncProgramGameLab(
      "Not-overlapping sprites do not bounce",
      `
        var sprite1 = createSprite(0, 0);
        var sprite2 = createSprite(300, 300);
        if(sprite1.bounce(sprite2)){
          console.log("bounced");
        }
        console.log("done");
      `,
      function isProgramDone(){
          var debugOutput = document.getElementById('debug-output');
          return debugOutput.textContent.includes('done');
      },
      function validateResult(assert){
        var debugOutput = document.getElementById('debug-output');
        assert.notInclude(debugOutput.textContent, 'bounced');
      },
    ),
    testAsyncProgramGameLab(
      'Overlapping Sprites bounce',
      `
        var sprite1 = createSprite(200, 200);
        var sprite2 = createSprite(200, 200);
        if(sprite1.bounce(sprite2)){
          console.log("bounced");
        }
        console.log("done");
      `,
      function isProgramDone(){
        var debugOutput = document.getElementById('debug-output');
        return debugOutput.textContent.includes('done');
      },
      function validateResult(assert){
        var debugOutput = document.getElementById('debug-output');
        assert.include(debugOutput.textContent, 'bounced');
      },
    ),
    testAsyncProgramGameLab(
      "Not-overlapping sprites do not bounce off",
      `
        var sprite1 = createSprite(0, 0);
        var sprite2 = createSprite(300, 300);
        if(sprite1.bounceOff(sprite2)){
          console.log("bounced off");
        }
        console.log("done");
      `,
      function isProgramDone(){
        var debugOutput = document.getElementById('debug-output');
        return debugOutput.textContent.includes('done');
      },
      function validateResult(assert){
        var debugOutput = document.getElementById('debug-output');
        assert.notInclude(debugOutput.textContent, 'bounced off');
      },
    ),
    testAsyncProgramGameLab(
      'Overlapping Sprites bounce off',
      `
        var sprite1 = createSprite(200, 200);
        var sprite2 = createSprite(200, 200);
        if(sprite1.bounceOff(sprite2)){
          console.log("bounced off");
        }
        console.log("done");
      `,
      function isProgramDone(){
        var debugOutput = document.getElementById('debug-output');
        return debugOutput.textContent.includes('done');
      },
      function validateResults(assert){
        var debugOutput = document.getElementById('debug-output');
        assert.include(debugOutput.textContent, 'bounced off');
      },
    ),
    testAsyncProgramGameLab(
      "Not-overlapping sprites do not displace",
      `
        var sprite1 = createSprite(0, 0);
        var sprite2 = createSprite(300, 300);
        if(sprite1.displace(sprite2)){
          console.log("displaced");
        }
        console.log("done");
      `,
      function isProgramDone(){
        var debugOutput = document.getElementById('debug-output');
        return debugOutput.textContent.includes('done');
      },
      function validateResults(assert){
        var debugOutput = document.getElementById('debug-output');
        assert.notInclude(debugOutput.textContent, 'displaced');
      },
    ),
    testAsyncProgramGameLab(
      'Overlapping Sprites displaced',
      `
        var sprite1 = createSprite(200, 200);
        var sprite2 = createSprite(200, 200);
        if(sprite1.displace(sprite2)){
          console.log("displaced");
        }
        console.log("done");
      `,
      function isProgramDone(){
        var debugOutput = document.getElementById('debug-output');
        return debugOutput.textContent.includes('done');
      },
      function validateResults(assert){
        var debugOutput = document.getElementById('debug-output');
        assert.include(debugOutput.textContent, 'displaced');
      },
    ),
    testAsyncProgramGameLab(
      "Not-overlapping sprites do not overlap",
      `
        var sprite1 = createSprite(0, 0);
        var sprite2 = createSprite(300, 300);
        if(sprite1.overlap(sprite2)){
          console.log("overlapped");
        }
        console.log("done");
      `,
      function isProgramDone(){
        var debugOutput = document.getElementById('debug-output');
        return debugOutput.textContent.includes('done');
      },
      function validateResults(assert){
        var debugOutput = document.getElementById('debug-output');
        assert.notInclude(debugOutput.textContent, 'overlapped');
      },
    ),
    testAsyncProgramGameLab(
      'Overlapping Sprites overlap',
      `
        var sprite1 = createSprite(200, 200);
        var sprite2 = createSprite(200, 200);
        if(sprite1.overlap(sprite2)){
          console.log("overlapped");
        }
        console.log("done");
      `,
      function isProgramDone(){
        var debugOutput = document.getElementById('debug-output');
        return debugOutput.textContent.includes('done');
      },
      function validateResults(assert){
        var debugOutput = document.getElementById('debug-output');
        assert.include(debugOutput.textContent, 'overlapped');
      },
    ),
    testAsyncProgramGameLab(
      "Not-overlapping sprites are not touching",
      `
        var sprite1 = createSprite(0, 0);
        var sprite2 = createSprite(300, 300);
        if(sprite1.isTouching(sprite2)){
          console.log("touched");
        }
        console.log("done");
      `,
      function isProgramDone(){
        var debugOutput = document.getElementById('debug-output');
        return debugOutput.textContent.includes('done');
      },
      function validateResults(assert){
        var debugOutput = document.getElementById('debug-output');
        assert.notInclude(debugOutput.textContent, 'touched');
      },
    ),
    testAsyncProgramGameLab(
      'Overlapping Sprites are touching',
      `
        var sprite1 = createSprite(200, 200);
        var sprite2 = createSprite(200, 200);
        if(sprite1.isTouching(sprite2)){
          console.log("touched");
        }
        console.log("done");
      `,
      function isProgramDone(){
        var debugOutput = document.getElementById('debug-output');
        return debugOutput.textContent.includes('done');
      },
      function validateResults(assert){
        var debugOutput = document.getElementById('debug-output');
        assert.include(debugOutput.textContent, 'touched');
      },
    ),
    testAsyncProgramGameLab(
      "A collider larger than the sprite collides with target",
      `
        var sprite = createSprite(0, 0, 200, 200);
        sprite.setCollider("rectangle", 200, 200, 300, 300);
        var target = createSprite(300, 300, 100, 100);
        if (target.collide(sprite)){
          console.log('collided');
        }

        console.log('done');
      `,
      function isProgramDone(){
        var debugOutput = document.getElementById('debug-output');
        return debugOutput.textContent.includes('done');
      },
      function validateResults(assert){
        var debugOutput = document.getElementById('debug-output');
        assert.include(debugOutput.textContent, 'collided');
      },
    ),
    testAsyncProgramGameLab(
      'A collider smaller than the sprite does not collide when target touches the sprite, but not collider',
      `
        var sprite = createSprite(100, 100, 200, 200);
        sprite.setCollider("rectangle", -50, -50, 100, 100);
        var target = createSprite(170, 170, 120, 120);
        if (target.collide(sprite)){
          console.log('collided');
        }

        console.log('done');
      `,
      function isProgramDone(){
        var debugOutput = document.getElementById('debug-output');
        return debugOutput.textContent.includes('done');
      },
      function validateResults(assert){
        var debugOutput = document.getElementById('debug-output');
        assert.notInclude(debugOutput.textContent, 'collided');
      },
    ),
  ]
};
