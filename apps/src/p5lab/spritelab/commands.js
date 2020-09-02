import {commands as actionCommands} from './commands/actionCommands';
import {commands as behaviorCommands} from './commands/behaviorCommands';
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

function updateTitle() {
  this.fill('black');
  this.stroke('white');
  this.strokeWeight(3);
  this.textAlign(this.CENTER, this.CENTER);
  this.textSize(50);
  this.text(coreLibrary.title, 0, 0, 400, 200);
  this.textSize(35);
  this.text(coreLibrary.subtitle, 0, 200, 400, 200);
}

export const commands = {
  executeDrawLoopAndCallbacks() {
    drawBackground.apply(this);
    coreLibrary.runBehaviors();
    coreLibrary.runEvents(this);
    this.drawSprites();
    updateTitle.apply(this);
  },

  // Action commands
  bounceOff(spriteArg, targetArg) {
    actionCommands.bounceOff(spriteArg, targetArg);
  },
  changePropBy(spriteArg, prop, val) {
    actionCommands.changePropBy(spriteArg, prop, val);
  },

  edgesDisplace(spriteArg) {
    actionCommands.edgesDisplace.apply(this, [spriteArg]);
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

  setProp(spriteArg, prop, val) {
    actionCommands.setProp.apply(this, [spriteArg, prop, val]);
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

  Behavior(callback) {
    return behaviorCommands.Behavior(callback);
  },

  draggableFunc(spriteArg) {
    return behaviorCommands.draggableFunc(this);
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

  keyPressed(condition, key, callback) {
    eventCommands.keyPressed(condition, key, callback);
  },

  spriteClicked(condition, spriteArg, callback) {
    eventCommands.spriteClicked(condition, spriteArg, callback);
  },

  // Location commands
  locationAt(x, y) {
    return locationCommands.locationAt(x, y);
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
    if (spriteArg.costume) {
      return spriteCommands.countByAnimation(spriteArg.costume);
    }
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

  // Validation commands
  getAnimationsInUse() {
    return validationCommands.getAnimationsInUse();
  },

  getBackground() {
    return validationCommands.getBackground();
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

  getSpriteIdsInUse() {
    return validationCommands.getSpriteIdsInUse();
  }
};
