import * as spriteUtils from './spriteUtils.js';

export const commands = {
  changePropBy(spriteIndex, prop, val) {
    if (!val) {
      return;
    }
    let sprites = spriteUtils.singleOrGroup(spriteIndex);
    sprites.forEach(sprite => {
      if (prop === 'scale') {
        sprite.scale += val / 100;
      } else if (prop === 'y') {
        sprite.y -= val;
      } else {
        sprite[prop] += val;
      }
    });
  },
  edgesDisplace(spriteIndex) {
    let sprites = spriteUtils.singleOrGroup(spriteIndex);
    sprites.forEach(sprite => this.edges.displace(sprite));
  },
  jumpTo(spriteIndex, location) {
    if (!location) {
      return;
    }
    let sprites = spriteUtils.singleOrGroup(spriteIndex);
    sprites.forEach(sprite => {
      sprite.x = location.x;
      sprite.y = location.y;
    });
  },
  mirrorSprite(spriteIndex, direction) {
    let sprites = spriteUtils.singleOrGroup(spriteIndex);
    sprites.forEach(sprite => {
      if (direction === 'right') {
        sprite.mirrorX(1);
      } else {
        sprite.mirrorX(-1);
      }
    });
  },
  moveForward(sprite, distance) {},
  moveInDirection(spriteIndex, distance, direction) {
    let sprites = spriteUtils.singleOrGroup(spriteIndex);
    let dirs = {
      North: sprite => (sprite.y -= distance),
      East: sprite => (sprite.x += distance),
      South: sprite => (sprite.y += distance),
      West: sprite => (sprite.x -= distance)
    };
    if (!dirs[direction]) {
      console.error('invalid direction: ' + direction);
    }
    sprites.forEach(sprite => {
      dirs[direction](sprite);
    });
  },
  moveToward(spriteIndex, distance, target) {
    let sprites = spriteUtils.singleOrGroup(spriteIndex);
    sprites.forEach(sprite => {
      if (sprite && target) {
        let angle = Math.atan2(target.y - sprite.y, target.x - sprite.x);
        if (angle) {
          let dy = Math.sin(angle) * distance;
          let dx = Math.cos(angle) * distance;
          sprite.x += dx;
          sprite.y += dy;
        }
      }
    });
  },
  pointInDirection(spriteIndex, direction) {
    let sprites = spriteUtils.singleOrGroup(spriteIndex);
    let dirs = {
      East: 90,
      South: 180,
      West: 270,
      North: 360
    };
    if (!dirs[direction]) {
      console.error('invalid direction ' + direction);
      return;
    }
    sprites.forEach(sprite => {
      sprite.rotation = dirs[direction];
    });
  },
  setProp(spriteIndex, prop, val) {
    if (!val) {
      return;
    }
    let sprites = spriteUtils.singleOrGroup(spriteIndex);
    let specialCases = {
      height: sprite =>
        (sprite.height = (sprite.animation.getHeight() * val) / 100),
      scale: sprite => (sprite.scale = val / 100),
      tint: sprite =>
        (sprite.tint = 'hsb(' + (Math.round(val) % 360) + ', 100%, 100%)'),
      width: sprite =>
        (sprite.width = (sprite.animation.getWidth() * val) / 100),
      y: sprite => (sprite.y = 400 - val)
    };
    sprites.forEach(sprite => {
      if (specialCases[prop]) {
        specialCases[prop](sprite);
      } else {
        sprite[prop] = val;
      }
    });
  },
  turn(spriteIndex, n, direction) {
    if (!n) {
      return;
    }
    let sprites = spriteUtils.singleOrGroup(spriteIndex);
    sprites.forEach(sprite => {
      if (direction === 'right') {
        sprite.rotation += n;
      } else {
        sprite.rotation -= n;
      }
    });
  }
};
