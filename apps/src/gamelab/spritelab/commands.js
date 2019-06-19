import {commands as actionCommands} from './actionCommands';
import {commands as behaviorCommands} from './behaviorCommands';
import {commands as eventCommands} from './eventCommands';
import {commands as locationCommands} from './locationCommands';
import {commands as spriteCommands} from './spriteCommands';
import {commands as worldCommands} from './worldCommands';
import {commands as validationCommands} from './validationCommands';
import * as spriteUtils from './spriteUtils';

function drawBackground() {
  if (typeof spriteUtils.background === 'string') {
    this.background(spriteUtils.background);
  } else {
    this.background('white');
  }
  if (typeof spriteUtils.background === 'object') {
    spriteUtils.background.resize(400, 400);
    this.image(spriteUtils.background);
  }
}

function updateTitle() {
  this.fill('black');
  this.textAlign(this.CENTER, this.CENTER);
  this.textSize(50);
  this.text(spriteUtils.title, 0, 0, 400, 200);
  this.textSize(35);
  this.text(spriteUtils.subtitle, 0, 200, 400, 200);
}

export const commands = {
  executeDrawLoopAndCallbacks() {
    this.createEdgeSprites();
    drawBackground.apply(this);
    spriteUtils.runBehaviors();
    spriteUtils.runEvents(this);
    this.drawSprites();
    updateTitle.apply(this);
  },

  // Action commands
  changePropBy(spriteId, prop, val) {
    actionCommands.changePropBy(spriteId, prop, val);
  },

  edgesDisplace(spriteId) {
    actionCommands.edgesDisplace.apply(this, [spriteId]);
  },

  isTouchingEdges(spriteId) {
    return actionCommands.isTouchingEdges.apply(this, [spriteId]);
  },

  jumpTo(spriteId, location) {
    actionCommands.jumpTo(spriteId, location);
  },

  mirrorSprite(spriteId, direction) {
    actionCommands.mirrorSprite(spriteId, direction);
  },

  moveInDirection(spriteId, distance, direction) {
    actionCommands.moveInDirection(spriteId, distance, direction);
  },

  moveForward(spriteId, distance) {
    actionCommands.moveForward(spriteId, distance);
  },

  moveToward(spriteId, distance, target) {
    actionCommands.moveToward(spriteId, distance, target);
  },

  removeTint(spriteId) {
    actionCommands.setProp(spriteId, 'tint', null);
  },

  setProp(spriteId, prop, val) {
    actionCommands.setProp.apply(this, [spriteId, prop, val]);
  },

  setTint(spriteId, color) {
    actionCommands.setProp(spriteId, 'tint', color);
  },

  turn(spriteId, n, direction) {
    actionCommands.turn(spriteId, n, direction);
  },

  // Behavior commands
  addBehaviorSimple(spriteId, behavior) {
    behaviorCommands.addBehavior(spriteId, behavior);
  },

  Behavior(callback) {
    return behaviorCommands.Behavior(callback);
  },

  draggableFunc(spriteId) {
    return behaviorCommands.draggableFunc(this);
  },

  removeAllBehaviors(spriteId) {
    behaviorCommands.removeAllBehaviors(spriteId);
  },

  removeBehaviorSimple(spriteId, behavior) {
    behaviorCommands.removeBehavior(spriteId, behavior);
  },

  // Event commands
  checkTouching(condition, sprite1, sprite2, callback) {
    eventCommands.checkTouching(condition, sprite1, sprite2, callback);
  },

  keyPressed(condition, key, callback) {
    eventCommands.keyPressed(condition, key, callback);
  },

  spriteClicked(condition, spriteId, callback) {
    eventCommands.spriteClicked(condition, spriteId, callback);
  },

  // Location commands
  locationAt(x, y) {
    return locationCommands.locationAt(x, y);
  },

  locationMouse() {
    return locationCommands.locationMouse.apply(this);
  },

  locationOf(spriteId) {
    return locationCommands.locationOf(spriteId);
  },

  randomLocation() {
    return locationCommands.randomLocation();
  },

  // Sprite commands
  countByAnimation(animation) {
    return spriteCommands.countByAnimation(animation);
  },

  /**
   * name parameter is unused but needs to be here because the generated code
   * calls createNewSprite() with name as an argument.
   * TODO (ajpal): change generated code to not pass assignment arguments
   * to the generated function.
   */
  createNewSprite(name, animation, location) {
    return spriteCommands.makeSprite.apply(this, [animation, location]);
  },

  destroy(spriteId) {
    spriteCommands.destroy(spriteId);
  },

  displace(spriteId, targetSpriteIndex) {
    spriteCommands.displace(spriteId, targetSpriteIndex);
  },

  getProp(spriteId, prop) {
    return spriteCommands.getProp(spriteId, prop);
  },

  getThisSprite(which, extraArgs) {
    return spriteCommands.getThisSprite(which, extraArgs);
  },

  makeNewSpriteAnon(animation, location) {
    spriteCommands.makeSprite.apply(this, [animation, location]);
  },

  setAnimation(spriteId, animation) {
    spriteCommands.setAnimation(spriteId, animation);
  },

  // World commands
  comment(text) {
    worldCommands.comment(text);
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

  getSpriteIdsInUse() {
    return validationCommands.getSpriteIdsInUse();
  }
};
