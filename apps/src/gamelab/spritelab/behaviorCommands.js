import * as spriteUtils from './spriteUtils';

export const commands = {
  addBehavior(spriteId, behavior) {
    let sprites = spriteUtils.getSpriteArray(spriteId);
    sprites.forEach(sprite => spriteUtils.addBehavior(sprite, behavior));
  },

  Behavior(func) {
    return {func: func, name: func.funcName};
  },

  draggableFunc(p5Inst) {
    return spriteId => {
      let sprite = spriteUtils.getSpriteArray(spriteId)[0];
      if (p5Inst.mousePressedOver(sprite) && !sprite.dragging) {
        sprite.dragging = true;
        sprite.xOffset = sprite.x - p5Inst.World.mouseX;
        sprite.yOffset = sprite.y - p5Inst.World.mouseY;
      }
      if (sprite.dragging) {
        sprite.x = p5Inst.World.mouseX + sprite.xOffset;
        sprite.y = p5Inst.World.mouseY + sprite.yOffset;
      }
      if (p5Inst.mouseWentUp()) {
        sprite.dragging = false;
      }
    };
  },

  removeAllBehaviors(spriteId) {
    let sprites = spriteUtils.getSpriteArray(spriteId);
    sprites.forEach(sprite => spriteUtils.removeAllBehaviors(sprite));
  },

  removeBehavior(spriteId, behavior) {
    let sprites = spriteUtils.getSpriteArray(spriteId);
    sprites.forEach(sprite => spriteUtils.removeBehavior(sprite, behavior));
  }
};
