import * as coreLibrary from '../coreLibrary';
import {commands as actionCommands} from './actionCommands';

export const commands = {
  addBehavior(spriteArg, behavior) {
    let sprites = coreLibrary.getSpriteArray(spriteArg);
    sprites.forEach(sprite => coreLibrary.addBehavior(sprite, behavior));
  },

  Behavior(func) {
    return {func: func, name: func.funcName};
  },

  draggableFunc(p5Inst) {
    return spriteArg => {
      let sprite = coreLibrary.getSpriteArray(spriteArg)[0];
      const allSprites = coreLibrary.getSpriteArray({costume: 'all'});
      if (p5Inst.mousePressedOver(sprite) && p5Inst.mouseWentDown()) {
        const topOtherSprite = Math.max(
          ...allSprites
            .filter(s => s !== sprite && p5Inst.mousePressedOver(s))
            .map(s => s.depth)
        );
        if (sprite.depth > topOtherSprite) {
          sprite.dragging = true;
          sprite.xOffset = sprite.x - p5Inst.World.mouseX;
          sprite.yOffset = sprite.y - p5Inst.World.mouseY;
        }
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

  followingTargetsFunc(p5Inst) {
    return spriteArg => {
      const sprite = coreLibrary.getSpriteArray(spriteArg)[0];
      const spritePosition = sprite.position;

      if (!sprite.targetSet) {
        return;
      }

      const targets = sprite.targetSet
        .map(x => coreLibrary.getSpriteArray({costume: x}))
        .flat();

      if (targets.length === 0) {
        return;
      }

      // Find closest target
      let closestTarget;
      let closestDistance = Infinity;
      targets.forEach(target => {
        const distance = spritePosition.dist(target.position);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestTarget = target;
        }
      });
      actionCommands.moveToward(spriteArg, 5, closestTarget.position);
    };
  },

  removeAllBehaviors(spriteArg) {
    let sprites = coreLibrary.getSpriteArray(spriteArg);
    sprites.forEach(sprite => coreLibrary.removeAllBehaviors(sprite));
  },

  removeBehavior(spriteArg, behavior) {
    let sprites = coreLibrary.getSpriteArray(spriteArg);
    sprites.forEach(sprite => coreLibrary.removeBehavior(sprite, behavior));
  }
};
