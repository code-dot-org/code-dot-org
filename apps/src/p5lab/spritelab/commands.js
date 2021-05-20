import {commands as actionCommands} from './commands/actionCommands';
import {commands as behaviorCommands} from './commands/behaviorCommands';
import {commands as customLessonCommands} from './commands/customLessonCommands';
import {commands as eventCommands} from './commands/eventCommands';
import {commands as locationCommands} from './commands/locationCommands';
import {commands as spriteCommands} from './commands/spriteCommands';
import {commands as worldCommands} from './commands/worldCommands';
import {commands as validationCommands} from './commands/validationCommands';
import * as coreLibrary from './coreLibrary';

function drawBackground() {
  if (typeof coreLibrary.background === 'string') {
    this.background(coreLibrary.background);
  } else {
    this.background('white');
  }
  if (typeof coreLibrary.background === 'object') {
    coreLibrary.background.resize(400, 400);
    this.image(coreLibrary.background);
  }
}

export const commands = {
  executeDrawLoopAndCallbacks() {
    drawBackground.apply(this);
    coreLibrary.runBehaviors();
    coreLibrary.runEvents(this);
    this.drawSprites();
    if (coreLibrary.screenText.title || coreLibrary.screenText.subtitle) {
      worldCommands.drawTitle.apply(this);
    }
    if (coreLibrary.screenText.haiku) {
      customLessonCommands.drawHaiku.apply(this);
    }
  },

  // Action commands
  addTarget(spriteArg, targetArg, targetType) {
    actionCommands.addTarget(spriteArg, targetArg, targetType);
  },

  bounceOff(spriteArg, targetArg) {
    actionCommands.bounceOff(spriteArg, targetArg);
  },
  changePropBy(spriteArg, prop, val) {
    actionCommands.changePropBy(spriteArg, prop, val);
  },

  edgesDisplace(spriteArg) {
    actionCommands.edgesDisplace.apply(this, [spriteArg]);
  },

  isCostumeEqual(spriteArg, costumeName) {
    return actionCommands.isCostumeEqual(spriteArg, costumeName);
  },

  isKeyPressed(key) {
    return actionCommands.isKeyPressed.apply(this, [key]);
  },

  isTouchingEdges(spriteArg) {
    return actionCommands.isTouchingEdges.apply(this, [spriteArg]);
  },

  isTouchingSprite(spriteArg, targetArg) {
    return actionCommands.isTouchingSprite(spriteArg, targetArg);
  },

  jumpTo(spriteArg, location) {
    actionCommands.jumpTo(spriteArg, location);
  },

  mirrorSprite(spriteArg, direction) {
    actionCommands.mirrorSprite(spriteArg, direction);
  },

  moveBackward(spriteArg, distance) {
    actionCommands.moveForward(spriteArg, -1 * distance);
  },

  moveInDirection(spriteArg, distance, direction) {
    actionCommands.moveInDirection(spriteArg, distance, direction);
  },

  moveForward(spriteArg, distance) {
    actionCommands.moveForward(spriteArg, distance);
  },

  moveToward(spriteArg, distance, target) {
    actionCommands.moveToward(spriteArg, distance, target);
  },

  removeTint(spriteArg) {
    actionCommands.setProp(spriteArg, 'tint', null);
  },

  setDefaultSpriteSize(size) {
    actionCommands.setDefaultSpriteSize(size);
  },

  setProp(spriteArg, prop, val) {
    actionCommands.setProp.apply(this, [spriteArg, prop, val]);
  },

  setPrompt(promptText, variableName, callback) {
    worldCommands.setPrompt(promptText, variableName, callback);
  },

  setPromptWithChoices(
    promptText,
    variableName,
    choice1,
    choice2,
    choice3,
    callback
  ) {
    worldCommands.setPromptWithChoices(
      promptText,
      variableName,
      [choice1, choice2, choice3],
      callback
    );
  },

  setTint(spriteArg, color) {
    actionCommands.setProp(spriteArg, 'tint', color);
  },

  turn(spriteArg, n, direction) {
    actionCommands.turn(spriteArg, n, direction);
  },

  // Behavior commands
  addBehaviorSimple(spriteArg, behavior) {
    behaviorCommands.addBehavior(spriteArg, behavior);
  },

  avoidingTargetsFunc(spriteArg) {
    return behaviorCommands.avoidingTargetsFunc(this);
  },

  Behavior(callback) {
    return behaviorCommands.Behavior(callback);
  },

  draggableFunc(spriteArg) {
    return behaviorCommands.draggableFunc(this);
  },

  followingTargetsFunc(spriteArg) {
    return behaviorCommands.followingTargetsFunc(this);
  },

  removeAllBehaviors(spriteArg) {
    behaviorCommands.removeAllBehaviors(spriteArg);
  },

  removeBehaviorSimple(spriteArg, behavior) {
    behaviorCommands.removeBehavior(spriteArg, behavior);
  },

  // Event commands
  atTime(n, unit, callback) {
    eventCommands.atTime(n, unit, callback);
  },

  checkTouching(condition, sprite1, sprite2, callback) {
    eventCommands.checkTouching(condition, sprite1, sprite2, callback);
  },

  collectData(callback) {
    eventCommands.collectData(callback);
  },

  keyPressed(condition, key, callback) {
    eventCommands.keyPressed(condition, key, callback);
  },

  repeatForever(callback) {
    eventCommands.repeatForever(callback);
  },

  stopCollectingData() {
    eventCommands.stopCollectingData();
  },

  spriteClicked(condition, spriteArg, callback) {
    eventCommands.spriteClicked(condition, spriteArg, callback);
  },

  whenAllPromptsAnswered(callback) {
    eventCommands.whenAllPromptsAnswered(callback);
  },

  whenSpriteCreated(spriteArg, callback) {
    eventCommands.whenSpriteCreated(spriteArg, callback);
  },

  whenPromptAnswered(variableName, callback) {
    eventCommands.whenPromptAnswered(variableName, callback);
  },

  // Location commands
  locationAt(x, y) {
    return locationCommands.locationAt(x, y);
  },

  locationModifier(distance, direction, location) {
    return locationCommands.locationModifier(distance, direction, location);
  },

  locationMouse() {
    return locationCommands.locationMouse.apply(this);
  },

  locationOf(spriteArg) {
    return locationCommands.locationOf(spriteArg);
  },

  randomLocation() {
    return locationCommands.randomLocation();
  },

  // Sprite commands
  countByAnimation(spriteArg) {
    return spriteCommands.countByAnimation(spriteArg);
  },

  createNewSprite(name, animation, location) {
    return spriteCommands.makeSprite.apply(this, [
      {name: name.name, animation: animation, location: location}
    ]);
  },

  destroy(spriteArg) {
    spriteCommands.destroy(spriteArg);
  },

  displace(spriteArg, targetSpriteIndex) {
    spriteCommands.displace(spriteArg, targetSpriteIndex);
  },

  getProp(spriteArg, prop) {
    return spriteCommands.getProp(spriteArg, prop);
  },

  getThisSprite(which, extraArgs) {
    return spriteCommands.getThisSprite(which, extraArgs);
  },

  makeNewSpriteAnon(animation, location) {
    spriteCommands.makeSprite.apply(this, [
      {animation: animation, location: location}
    ]);
  },

  makeNumSprites(num, animation) {
    for (let i = 0; i < num; i++) {
      spriteCommands.makeSprite.apply(this, [
        {animation: animation, location: locationCommands.randomLocation()}
      ]);
    }
  },

  setAnimation(spriteArg, animation) {
    spriteCommands.setAnimation(spriteArg, animation);
  },

  // World commands
  comment(text) {
    worldCommands.comment(text);
  },

  getTime(unit) {
    return worldCommands.getTime.apply(this, [unit]);
  },

  hideTitleScreen() {
    worldCommands.hideTitleScreen();
  },

  printText(text) {
    worldCommands.printText(text);
  },

  setBackground(color) {
    worldCommands.setBackground(color);
  },
  setBackgroundImage(img) {
    worldCommands.setBackgroundImage.apply(this, [img]);
  },
  setBackgroundImageAs(img) {
    worldCommands.setBackgroundImageAs.apply(this, [img]);
  },
  showTitleScreen(title, subtitle) {
    worldCommands.showTitleScreen(title, subtitle);
  },

  textJoin(text1, text2) {
    return worldCommands.textJoin(text1, text2);
  },

  textVariableJoin(text1, text2) {
    return worldCommands.textJoin(text1, text2);
  },

  // Validation commands
  getAnimationsInUse() {
    return validationCommands.getAnimationsInUse();
  },

  getBackground() {
    return validationCommands.getBackground();
  },

  getEventLog() {
    return validationCommands.getEventLog();
  },

  getNumBehaviorsForAnimation(animation) {
    return validationCommands.getNumBehaviorsForAnimation(animation);
  },

  getNumBehaviorsForSpriteId(spriteId) {
    return validationCommands.getNumBehaviorsForSpriteId(spriteId);
  },

  getBehaviorsForSpriteId(spriteId) {
    return validationCommands.getBehaviorsForSpriteId(spriteId);
  },

  getPrintLog() {
    return validationCommands.getPrintLog();
  },

  getPromptVars() {
    return validationCommands.getPromptVars();
  },

  getSpriteIdsInUse() {
    return validationCommands.getSpriteIdsInUse();
  },

  getTitle() {
    return validationCommands.getTitle();
  },

  // Custom Lesson Commands
  // These are blocks that are custom built for a particular lesson
  getHaiku() {
    return customLessonCommands.getHaiku();
  },

  hideHaiku() {
    customLessonCommands.hideHaiku();
  },

  printHaiku(title, author, line1, line2, line3) {
    customLessonCommands.printHaiku.apply(this, [
      // default to empty string for any args not provided
      title || '',
      author || '',
      line1 || '',
      line2 || '',
      line3 || ''
    ]);
  }
};
