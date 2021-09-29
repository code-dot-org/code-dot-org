var extraArgs = {};
var other = [];

function draw() {
  executeDrawLoopAndCallbacks();
  for (var i = 0; i < other.length; i++) {
    other[i]();
  }
}

/**
 * Must run in the interpreter, not natively, so that we can execute valueFn to get its value
 * and be able to use that value within beginCollectingData. If beginCollectingData ran natively,
 * calling valueFn would add a call into the interpreter on the call stack, but wouldn't execute
 * immediately, so we wouldn't be able to use the value from within beginCollectingData.
 */
function beginCollectingData(valueFn, label) {
  collectData(function() {
    printText(['Time: ',getTime("seconds"),' sec. | ', label || '', ': ', valueFn()].join(''));
  });
}


/**
 * Must run in the interpreter, not natively, so that callback executes before withPercentChance() returns,
 * rather than being added to the stack. For example, consider the following program:
 * var i = 10;
 * ifVarEquals(i, 10, function() {
 *   printText("first");
 * });
 * printText("second");
 *
 * If ifVarEquals() executed natively, the print statements would happen out of order.
 */
function ifVarEquals(variableName, value, callback) {
  if (variableName == value) {
    callback();
  }
}

/**
 * Must run in the interpreter, not natively, so that callback executes before withPercentChance() returns,
 * rather than being added to the stack. For example, consider the following program:
 * var i = 0;
 * for (var count = 0; count < 100; count++) {
 *   withPercentChance(50, function () {
 *     i = (typeof i == 'number' ? i : 0) + 1;
 *   });
 * }
 * printText(i)
 *
 * If withPercentChance() executed natively, i would still be 0 because the callbacks wouldn't have executed yet.
 * Instead, if we keep the whole execution within the interpreter, the callbacks will execute before printText(),
 * as expected.
 */

function withPercentChance(num, callback) {
  if (randomNumber(0, 100) < num) {
    callback();
  }
}

function withPercentChanceDropdown(num, callback) {
  withPercentChance(num, callback);
}

/* Legacy code only. Do not add any new code below here */
function clickedOn(spriteId, callback) {
  spriteClicked('when', spriteId, callback);
}

function draggable() {
  return {func: draggableFunc(), name: 'draggable'};
}

function avoidingTargets() {
  return {func: avoidingTargetsFunc(), name: 'avoiding targets'};
}

function followingTargets() {
  return {func: followingTargetsFunc(), name: 'following targets'};
}

function tumbling(spriteId) {
  var behavior = function(spriteId) {
    changePropBy(spriteId, 'rotation', -6);
    changePropBy(spriteId, 'x', -3);
  };
  return {func: behavior, name: 'tumbling'};
}

function patrollingUpDown(spriteId) {
  var behavior = function(spriteId) {
    if (getProp(spriteId, 'patrollingDirection') == undefined) {
      setProp(spriteId, 'patrollingDirection', 'up');
    }
    var patrollingDirection = getProp(spriteId, 'patrollingDirection');
    if (patrollingDirection == 'up') {
      changePropBy(spriteId, 'y', 6);
    }
    if (patrollingDirection == 'down') {
      changePropBy(spriteId, 'y', -6);
    }
    var y = getProp(spriteId, 'y');
    if (y <= 40) {
      setProp(spriteId, 'patrollingDirection', 'up');
    }
    if (y >= 360) {
      setProp(spriteId, 'patrollingDirection', 'down');
    }
  };
  return {func: behavior, name: 'patrollingUpDown'};
}

function pointInDirection(spriteId, direction) {
  if (direction == 'North') {
    setProp(spriteId, 'rotation', 360);
  } else if (direction == 'East') {
    setProp(spriteId, 'rotation', 90);
  } else if (direction == 'South') {
    setProp(spriteId, 'rotation', 180);
  } else if (direction == 'West') {
    setProp(spriteId, 'rotation', 270);
  } else {
    console.error('pointInDirection: invalid direction provided');
    return;
  }
}

function randColor() {
  return color(
    randomNumber(0, 255),
    randomNumber(0, 255),
    randomNumber(0, 255)
  ).toString();
}

function randomColor() {
  return randColor();
}

function mouseLocation() {
  return locationMouse();
}

function setSizes(spriteId, property, val) {
  setProp(spriteId, property, val);
}

function whenDownArrow(callback) {
  keyPressed('when', 'down', callback);
}

function whenKey(key, callback) {
  keyPressed('when', key, callback);
}

function whenLeftArrow(callback) {
  keyPressed('when', 'left', callback);
}

function whenRightArrow(callback) {
  keyPressed('when', 'right', callback);
}

function whenTouching(sprite1, sprite2, callback) {
  checkTouching('when', sprite1, sprite2, callback);
}

function whenUpArrow(callback) {
  keyPressed('when', 'up', callback);
}

function whileDownArrow(callback) {
  keyPressed('while', 'down', callback);
}

function whileKey(key, callback) {
  keyPressed('while', key, callback);
}

function whileLeftArrow(callback) {
  keyPressed('while', 'left', callback);
}

function whileRightArrow(callback) {
  keyPressed('while', 'right', callback);
}

function whileTouching(sprite1, sprite2, callback) {
  checkTouching('while', sprite1, sprite2, callback);
}

function whileUpArrow(callback) {
  keyPressed('while', 'up', callback);
}

function xLocationOf(spriteId) {
  return getProp(spriteId, 'x');
}

function yLocationOf(spriteId) {
  return getProp(spriteId, 'y');
}

//Mike's follow/avoid/glide behavior blocks
function startFollowing(sprites,targets){
  addTarget(sprites, targets, "follow");
  addBehaviorSimple(sprites, followingTargets());
}

function stopFollowing(sprites){
  removeBehaviorSimple(sprites, followingTargets());
}

function startAvoiding(sprites,targets){
  addTarget(sprites, targets, "avoid");
  addBehaviorSimple(sprites, avoidingTargets());
}

function stopFollowing(sprites){
  removeBehaviorSimple(sprites, avoidingTargets());
}

function startGliding(sprites){
  addBehaviorSimple(sprites, glideFunc());
}

function stopGliding(sprites){
  removeBehaviorSimple(sprites, glideFunc());
}


//Mike's Say Block Prototype code below this point
function spriteSayTime(sprite,speech,time){
  setProp(sprite, "speech", speech);
  setProp(sprite, "timeout", time*30);
}

function spriteSay(sprite,speech){
  spriteSayTime(sprite,speech,4);
}

function spriteSayChoices(sprite,speech){
  spriteSay(sprite,speech);
}


function speechBubbles(){
  var spriteIds = getSpriteIdsInUse();

  for (var i = 0; i < spriteIds.length; i++) {
    var spriteX=getProp({id: spriteIds[i]}, "x");
    var spriteY=400-getProp({id: spriteIds[i]}, "y");
    var spriteScale=getProp({id: spriteIds[i]}, "scale");
    var spriteSpeech=getProp({id: spriteIds[i]}, "speech");
    var spriteTimeout=getProp({id: spriteIds[i]}, "timeout");

    if(spriteTimeout&&spriteSpeech!=undefined&&World.frameCount>1){
      push();
      var widthOfText=textWidth(spriteSpeech);
      var textHeight=16;//font size

      if (spriteSpeech.length > 150) {
        spriteSpeech = spriteSpeech.substring(0, 149) + "…";
      }
      if(spriteSpeech.length < 50){
        textHeight=20;
        charCount=20;
      } else if(spriteSpeech.length < 75){
        textHeight=15;
        charCount=25;
      } else if(spriteSpeech.length < 125){
        textHeight=10;
        charCount=30;
      } else {
        textHeight=10;
        charCount=35;
      }
      textSize(textHeight);

      var charCount=Math.sqrt(spriteSpeech.length*10);
      if(charCount < 20) {
        charCount=20;
      }


      spriteSpeech=wordWrap(spriteSpeech,charCount);//16 characters per line
      var lines = spriteSpeech.split(/\r\n|\r|\n/); 
      setProp({id: spriteIds[i]}, "lineCount", lines.length);
      fill(rgb(50,50,50,0.5));
      stroke("gray");


      textAlign(CENTER, TOP);


      var minWidth=15;

      for(var j=0;j<lines.length;j++){
        if(minWidth<textWidth(lines[j])){
          minWidth=textWidth(lines[j]);
        }

      }


      var boxWidth=minWidth+5;
      var boxHeight=((textHeight)+3)*(getProp({id: spriteIds[i]}, "lineCount"))+5;

      var rectX=spriteX-boxWidth/2;
      var rectY=spriteY-(spriteScale/2)-boxHeight-5;

      if(rectX<0){
        rectX=0;
      }
      if(rectX+boxWidth>400){
        rectX=400-boxWidth;
      }
      if(rectX<0){
        rectX=200-boxWidth/2;
      }

      if(rectY<0){rectY=0;}
      if(rectY+boxHeight>400){
        rectY=400-boxHeight;
      }

      strokeWeight(2);
      var bubbleRad=4;
      fill("white");
      noStroke();
      rect(rectX, rectY+bubbleRad, boxWidth, boxHeight-bubbleRad*2);
      rect(rectX+bubbleRad,rectY,boxWidth-bubbleRad*2,boxHeight);
      stroke("gray");
      line(rectX,rectY+bubbleRad,rectX,rectY+boxHeight-bubbleRad);
      line(rectX+boxWidth,rectY+bubbleRad,rectX+boxWidth,rectY+boxHeight-bubbleRad);
      line(rectX+bubbleRad,rectY+boxHeight,rectX+boxWidth-bubbleRad,rectY+boxHeight);
      line(rectX+bubbleRad,rectY,rectX+boxWidth-bubbleRad,rectY);

      arc(rectX+bubbleRad, rectY+bubbleRad, bubbleRad*2, bubbleRad*2, 180, 270);
      arc(rectX+bubbleRad, rectY+boxHeight-bubbleRad, bubbleRad*2, bubbleRad*2, 90, 180);
      arc(rectX+boxWidth-bubbleRad, rectY+bubbleRad, bubbleRad*2, bubbleRad*2, 270, 0);
      arc(rectX+boxWidth-bubbleRad, rectY+boxHeight-bubbleRad, bubbleRad*2, bubbleRad*2, 0, 90);
      var tipX=(rectX+(boxWidth/2)+spriteX)/2;
      var tipY=((spriteY-spriteScale/4)+3*(rectY+boxHeight))/4;
      noStroke();
      shape(rectX+boxWidth*4/10,rectY+boxHeight-1,tipX,tipY,rectX+boxWidth/2,rectY+boxHeight-1);
      stroke("gray");

      line(rectX+boxWidth*4/10,rectY+boxHeight,tipX,tipY);
      line(tipX,tipY,rectX+boxWidth/2,rectY+boxHeight);
      noStroke();
      fill("black");

      text(spriteSpeech,rectX+(boxWidth)/2,rectY+2.5);
      changePropBy({id: spriteIds[i]}, "timeout", -1);
      pop();
    }
  }

}

function wordWrap(str, maxWidth) {
  var newLineStr = "\n"; done = false; res = '';
  while (str.length > maxWidth) {
    found = false;
    // Inserts new line at first whitespace of the line
    for (i = maxWidth - 1; i >= 0; i--) {
      if(str.charAt(i)==" "){
        res = res + [str.slice(0, i), newLineStr].join('');
        str = str.slice(i + 1);
        found = true;
        break;
      }
    }
    // Inserts new line at maxWidth position, the word is too long to wrap
    if (!found) {
      res += [str.slice(0, maxWidth), newLineStr].join('');
      str = str.slice(maxWidth);
    }
  }
  return res + str;
}

other.push(speechBubbles);
