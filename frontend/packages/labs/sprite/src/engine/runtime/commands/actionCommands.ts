import type CoreLibrary from '../CoreLibrary';
import {APP_HEIGHT} from '../p5lab/constants';
import {layoutSpriteGroup} from '../p5lab/layoutUtils';
import {createSpriteCollider} from '../p5lab/utils';
import type {
  BubbleType,
  Location,
  RuntimeSprite,
  SpriteArg,
  TargetSet,
} from '../types';

import {commands as behaviorCommands} from './behaviorCommands';
import {defineCommands} from './defineCommands';

type CollisionMethodName =
  | 'overlap'
  | 'isTouching'
  | 'collide'
  | 'displace'
  | 'bounce'
  | 'bounceOff';

/** A sprite's own property by a name that came from a block. */
function props(sprite: RuntimeSprite): Record<string, unknown> {
  return sprite;
}

function move(
  coreLibrary: CoreLibrary,
  spriteArg: SpriteArg,
  distance: number,
) {
  const sprites = coreLibrary.getSpriteArray(spriteArg);
  sprites.forEach(sprite => {
    if (!sprite.direction) {
      sprite.direction = 0;
    }
    const direction = sprite.direction % 360;
    sprite.x += distance * Math.cos((direction * Math.PI) / 180);
    sprite.y += distance * Math.sin((direction * Math.PI) / 180);
  });
}

function addSpriteSpeechBubble(
  coreLibrary: CoreLibrary,
  spriteArg: SpriteArg,
  text: unknown,
  seconds: number,
  bubbleType: BubbleType,
) {
  coreLibrary.getSpriteArray(spriteArg)?.forEach(sprite => {
    coreLibrary.addSpeechBubble(sprite, text, seconds, bubbleType);
  });
}

export const commands = defineCommands({
  addTarget(spriteArg: SpriteArg, targetCostume: string, targetType: string) {
    if (!['follow', 'avoid'].includes(targetType)) {
      console.warn(`unkknown targetType: ${targetType}`);
      return;
    }
    const type = targetType as keyof TargetSet;
    const sprites = this.getSpriteArray(spriteArg);
    sprites.forEach(sprite => {
      if (!sprite.targetSet) {
        sprite.targetSet = {follow: [], avoid: []};
      }
      if (!sprite.targetSet[type].includes(targetCostume)) {
        sprite.targetSet[type].push(targetCostume);
      }
    });
  },

  bounceOff(spriteArg: SpriteArg, targetArg: SpriteArg) {
    const sprites = this.getSpriteArray(spriteArg);
    const targets = this.getSpriteArray(targetArg);
    sprites.forEach(sprite => {
      targets.forEach(target => {
        if (sprite.isTouching(target)) {
          // Reverse the movement direction of the sprite
          sprite.direction = (sprite.direction + 180) % 360;
          // Calculate the angle between x axis and a line between the sprites.
          const angle = Math.atan2(target.y - sprite.y, target.x - sprite.x);
          if (!isNaN(angle)) {
            // Move the sprite back from the target, based on the calculated angle.
            const dy = Math.sin(angle) * -(sprite.speed + 1);
            const dx = Math.cos(angle) * -(sprite.speed + 1);
            sprite.x += dx;
            sprite.y += dy;
          }
        }
      });
    });
  },

  changePropBy(spriteArg: SpriteArg, prop: string, val: number) {
    if (val === undefined || prop === undefined) {
      return;
    }
    const sprites = this.getSpriteArray(spriteArg);
    const specialCases: Record<string, (sprite: RuntimeSprite) => void> = {
      direction: sprite => (sprite.direction = (sprite.direction + val) % 360),
      scale: sprite => {
        sprite.setScale(sprite.getScale() + val / 100);
        if (sprite.scale < 0) {
          sprite.scale = 0;
        }
      },
      y: sprite => (sprite.y -= val),
      velocityY: sprite => {
        sprite.velocityY -= val;
      },
    };
    sprites.forEach(sprite => {
      if (specialCases[prop]) {
        specialCases[prop](sprite);
      } else {
        props(sprite)[prop] = (props(sprite)[prop] as number) + val;
      }
    });
  },

  collide(
    collisionType: CollisionMethodName,
    spriteArg: SpriteArg,
    targetArg: SpriteArg,
  ) {
    const sprites = this.getSpriteArray(spriteArg);
    const targets = this.getSpriteArray(targetArg);

    sprites.forEach(sprite => {
      targets.forEach(target => sprite[collisionType](target));
    });
  },

  edgesDisplace(spriteArg: SpriteArg) {
    const edges = this.p5.createEdgeSprites();
    const sprites = this.getSpriteArray(spriteArg);
    sprites.forEach(sprite => edges.displace(sprite));
  },

  // Causes the sprite to stop moving when it hits an edge sprite.
  edgesCollide(spriteArg: SpriteArg) {
    const edges = this.p5.createEdgeSprites();
    const sprites = this.getSpriteArray(spriteArg);
    sprites.forEach(sprite => sprite.collide(edges));
  },

  glideTo(spriteArg: SpriteArg, location: Location | undefined) {
    if (!location) {
      return;
    }
    const sprites = this.getSpriteArray(spriteArg);
    sprites.forEach(sprite => {
      if (!sprite.glideTargets) {
        sprite.glideTargets = [];
      }
      sprite.glideTargets.push(location);
      this.addBehavior(sprite, {
        func: behaviorCommands.glideFunc.apply(this),
        name: 'glide',
      });
    });
  },

  isCostumeEqual(spriteArg: SpriteArg, costumeName: string) {
    const sprites = this.getSpriteArray(spriteArg);
    if (sprites.length === 0) {
      return false;
    }
    return sprites.every(sprite => sprite.getAnimationLabel() === costumeName);
  },

  layoutSprites(costume: string, layout: string) {
    const group = this.getSpriteArray({costume});
    layoutSpriteGroup(group, layout, this.p5);
  },

  isKeyPressed(key: string) {
    return this.p5.keyDown(key);
  },

  isTouchingEdges(spriteArg: SpriteArg) {
    const edges = this.p5.createEdgeSprites();
    const sprites = this.getSpriteArray(spriteArg);
    let touching = false;
    sprites.forEach(sprite => {
      if (sprite.isTouching(edges)) {
        touching = true;
      }
    });
    return touching;
  },

  isTouchingSprite(spriteArg: SpriteArg, targetArg: SpriteArg) {
    const sprites = this.getSpriteArray(spriteArg);
    const targets = this.getSpriteArray(targetArg);
    let touching = false;
    sprites.forEach(sprite => {
      targets.forEach(target => {
        if (sprite.isTouching(target)) {
          touching = true;
        }
      });
    });
    return touching;
  },

  isDirectlyAbove(spriteArg: SpriteArg, targetArg: SpriteArg) {
    const sprites = this.getSpriteArray(spriteArg);
    const targets = this.getSpriteArray(targetArg);
    // Resting contact is an exact equality in classic Sprite Lab; a lab
    // whose physics leaves sub-pixel noise on landings sets a tolerance.
    const epsilon = this.contactEpsilon || 0;
    let touching = false;
    sprites.forEach(sprite => {
      const spriteCollider = createSpriteCollider(sprite);
      if (spriteCollider.bottom >= APP_HEIGHT - epsilon) {
        touching = true;
      } else {
        for (const target of targets) {
          const targetCollider = createSpriteCollider(target);

          if (
            Math.abs(spriteCollider.bottom - targetCollider.top) <= epsilon &&
            spriteCollider.left <= targetCollider.right &&
            spriteCollider.right >= targetCollider.left
          ) {
            touching = true;
            break;
          }
        }
      }
    });
    return touching;
  },

  jumpTo(spriteArg: SpriteArg, location: Location | undefined) {
    if (!location) {
      return;
    }
    const sprites = this.getSpriteArray(spriteArg);
    sprites.forEach(sprite => {
      sprite.x = location.x;
      sprite.y = location.y;
    });
  },

  mirrorSprite(spriteArg: SpriteArg, direction: string) {
    const sprites = this.getSpriteArray(spriteArg);
    sprites.forEach(sprite => {
      if (direction === 'right') {
        sprite.mirrorX(1);
      } else {
        sprite.mirrorX(-1);
      }
    });
  },

  moveForward(spriteArg: SpriteArg, distance: number) {
    move(this, spriteArg, distance);
  },

  moveBackward(spriteArg: SpriteArg, distance: number) {
    move(this, spriteArg, -1 * distance);
  },

  moveInDirection(spriteArg: SpriteArg, distance: number, direction: string) {
    const sprites = this.getSpriteArray(spriteArg);
    const dirs: Record<string, (sprite: RuntimeSprite) => void> = {
      North: sprite => (sprite.y -= distance),
      East: sprite => (sprite.x += distance),
      South: sprite => (sprite.y += distance),
      West: sprite => (sprite.x -= distance),
    };
    if (!dirs[direction]) {
      console.error('invalid direction: ' + direction);
      return;
    }
    sprites.forEach(sprite => {
      dirs[direction](sprite);
    });
  },

  moveToward(
    spriteArg: SpriteArg,
    distance: number,
    target: Location | undefined,
  ) {
    const sprites = this.getSpriteArray(spriteArg);
    sprites.forEach(sprite => {
      if (sprite && target) {
        const distanceFromSpriteToTarget = Math.sqrt(
          (sprite.x - target.x) ** 2 + (sprite.y - target.y) ** 2,
        );
        if (distanceFromSpriteToTarget < distance) {
          sprite.x = target.x;
          sprite.y = target.y;
          return;
        }
        const angle = Math.atan2(target.y - sprite.y, target.x - sprite.x);
        if (!isNaN(angle)) {
          const dy = Math.sin(angle) * distance;
          const dx = Math.cos(angle) * distance;
          sprite.x += dx;
          sprite.y += dy;
        }
      }
    });
  },

  setDefaultSpriteSize(size: number) {
    this.defaultSpriteSize = size;
  },

  setProp(spriteArg: SpriteArg, prop: string, val: unknown) {
    if (val === undefined) {
      return;
    }
    const sprites = this.getSpriteArray(spriteArg);
    const num = val as number;
    const specialCases: Record<string, (sprite: RuntimeSprite) => void> = {
      direction: sprite => (sprite.direction = num % 360),
      draggable: sprite => {
        if (val) {
          this.addBehavior(sprite, {
            func: behaviorCommands.draggableFunc.apply(this),
            name: 'draggable',
          });
        } else {
          this.removeBehavior(sprite, {
            func: behaviorCommands.draggableFunc.apply(this),
            name: 'draggable',
          });
        }
      },
      height: sprite =>
        (sprite.height = ((sprite.animation?.getHeight() ?? NaN) * num) / 100),
      scale: sprite => sprite.setScale(num / 100),
      width: sprite =>
        (sprite.width = ((sprite.animation?.getWidth() ?? NaN) * num) / 100),
      y: sprite => (sprite.y = 400 - num),
      velocityY: sprite => (sprite.velocityY = -num),
    };
    sprites.forEach(sprite => {
      if (specialCases[prop]) {
        specialCases[prop](sprite);
      } else {
        props(sprite)[prop] = val;
      }
    });
  },

  spriteSay(spriteArg: SpriteArg, text: unknown) {
    addSpriteSpeechBubble(this, spriteArg, text, 4 /* seconds */, 'say');
  },

  spriteSayTime(spriteArg: SpriteArg, text: unknown, seconds: number) {
    addSpriteSpeechBubble(this, spriteArg, text, seconds, 'say');
  },

  spriteThink(spriteArg: SpriteArg, text: unknown) {
    addSpriteSpeechBubble(this, spriteArg, text, 4 /* seconds */, 'think');
  },

  spriteThinkTime(spriteArg: SpriteArg, text: unknown, seconds: number) {
    addSpriteSpeechBubble(this, spriteArg, text, seconds, 'think');
  },

  removeTint(spriteArg: SpriteArg) {
    const sprites = this.getSpriteArray(spriteArg);
    sprites.forEach(sprite => (sprite.tint = null));
  },

  setTint(spriteArg: SpriteArg, color: unknown) {
    const sprites = this.getSpriteArray(spriteArg);
    sprites.forEach(sprite => (sprite.tint = color));
  },

  turn(spriteArg: SpriteArg, degrees: number, direction: string) {
    if (!degrees) {
      return;
    }
    const sprites = this.getSpriteArray(spriteArg);
    sprites.forEach(sprite => {
      if (direction === 'right') {
        sprite.rotation += degrees;
        sprite.direction += degrees;
      } else {
        sprite.rotation -= degrees;
        sprite.direction -= degrees;
      }
    });
  },
});
