import {commands as behaviorCommands} from './behaviorCommands';

function move(coreLibrary, spriteArg, distance) {
  let sprites = coreLibrary.getSpriteArray(spriteArg);
  sprites.forEach(sprite => {
    if (!sprite.direction) {
      sprite.direction = 0;
    }
    let direction = sprite.direction % 360;
    sprite.x += distance * Math.cos((direction * Math.PI) / 180);
    sprite.y += distance * Math.sin((direction * Math.PI) / 180);
  });
}

function addSpriteSpeechBubble(
  coreLibrary,
  spriteArg,
  text,
  seconds,
  bubbleType
) {
  coreLibrary.getSpriteArray(spriteArg)?.forEach(sprite => {
    coreLibrary.addSpeechBubble(sprite, text, seconds, bubbleType);
  });
}

export const commands = {
  addTarget(spriteArg, targetCostume, targetType) {
    if (!['follow', 'avoid'].includes(targetType)) {
      console.warn(`unkknown targetType: ${targetType}`);
      return;
    }
    let sprites = this.getSpriteArray(spriteArg);
    sprites.forEach(sprite => {
      if (!sprite.targetSet) {
        sprite.targetSet = {follow: [], avoid: []};
      }
      if (!sprite.targetSet[targetType].includes(targetCostume)) {
        sprite.targetSet[targetType].push(targetCostume);
      }
    });
  },

  bounceOff(spriteArg, targetArg) {
    let sprites = this.getSpriteArray(spriteArg);
    let targets = this.getSpriteArray(targetArg);
    sprites.forEach(sprite => {
      targets.forEach(target => {
        if (sprite.isTouching(target)) {
          // Reverse the movement direction of the sprite
          sprite.direction = (sprite.direction + 180) % 360;
          // Calculate the angle between x axis and a line between the sprites.
          let angle = Math.atan2(target.y - sprite.y, target.x - sprite.x);
          if (!isNaN(angle)) {
            // Move the sprite back from the target, based on the calculated angle.
            let dy = Math.sin(angle) * -(sprite.speed + 1);
            let dx = Math.cos(angle) * -(sprite.speed + 1);
            sprite.x += dx;
            sprite.y += dy;
          }
        }
      });
    });
  },

  changePropBy(spriteArg, prop, val) {
    if (val === undefined || prop === undefined) {
      return;
    }
    let sprites = this.getSpriteArray(spriteArg);
    let specialCases = {
      direction: sprite => (sprite.direction = (sprite.direction + val) % 360),
      scale: sprite => {
        sprite.setScale(sprite.getScale() + val / 100);
        if (sprite.scale < 0) {
          sprite.scale = 0;
        }
      },
      y: sprite => (sprite.y -= val)
    };
    sprites.forEach(sprite => {
      if (specialCases[prop]) {
        specialCases[prop](sprite);
      } else {
        sprite[prop] += val;
      }
    });
  },

  edgesDisplace(spriteArg) {
    if (!this.p5.edges) {
      this.p5.createEdgeSprites();
    }
    let sprites = this.getSpriteArray(spriteArg);
    sprites.forEach(sprite => this.p5.edges.displace(sprite));
  },

  glideTo(spriteArg, location) {
    if (!location) {
      return;
    }
    let sprites = this.getSpriteArray(spriteArg);
    sprites.forEach(sprite => {
      if (!sprite.glideTargets) {
        sprite.glideTargets = [];
      }
      sprite.glideTargets.push(location);
      this.addBehavior(sprite, {
        func: behaviorCommands.glideFunc.apply(this),
        name: 'glide'
      });
    });
  },

  isCostumeEqual(spriteArg, costumeName) {
    let sprites = this.getSpriteArray(spriteArg);
    if (sprites.length === 0) {
      return false;
    }
    return sprites.every(sprite => sprite.getAnimationLabel() === costumeName);
  },

  /**
   * Given a sprite costume, arrange all sprites of this type in a particular
   * layout. This is likely to change some or all of position/rotation/scale for
   * the sprites in the group.
   * Entirely derived from the logic for similar blocks in our dance party repo here:
   * https://github.com/code-dot-org/dance-party/blob/6672bdb0cffad1cbfda6e7396155f542b6cdcffe/src/p5.dance.js#L637-L911
   */
  layoutSprites(costumeName, layoutName) {
    const group = this.getSpriteArray({costume: costumeName});
    // resize at top?
    const count = group.length;
    const minX = 20;
    const maxX = 400 - minX;
    const minY = 35;
    const maxY = 400 - 40;
    const radiansToDegrees = 180 / Math.PI;
    const maxCircleRadius = 165;

    /**
     * Sets the x & y positions of a group of sprites in order to arrange them
     * in a horizontal row.
     * @param {array<sprite>} group - The group of sprites to arrange
     * @param {int} yLocation - The yLocation to set for all sprites
     */
    function createRow(group, yLocation) {
      let count = group.length;
      for (let i = 0; i < count; i++) {
        const sprite = group[i];
        sprite.x = (i + 1) * (400 / (count + 1));
        sprite.y = yLocation;
        sprite.rotation = 0;
      }
    }

    /**
     * Sets the x & y positions of a group of sprites in order to arrange them
     * in a vertical column.
     * @param {array<sprite>} group - The group of sprites to arrange
     * @param {int} xLocation - The xLocation to set for all sprites
     */
    function createColumn(group, xLocation) {
      let count = group.length;
      for (let i = 0; i < count; i++) {
        const sprite = group[i];
        sprite.x = xLocation;
        sprite.y = (i + 1) * (400 / (count + 1));
        sprite.rotation = 0;
      }
    }

    const adjustSpriteDepth = sprite => {
      if (!spriteExists(sprite)) {
        return;
      }

      // Bias scale heavily (especially since it largely hovers around 1.0) but use
      // Y coordinate as the first tie-breaker and X coordinate as the second.
      // (Both X and Y range from 0-399 pixels.)
      sprite.depth =
        10000 * sprite.scale + (100 * sprite.y) / 400 + (1 * sprite.x) / 400;
    };

    const spriteExists = sprite => {
      return this.p5.allSprites.indexOf(sprite) > -1;
    };

    if (layoutName === 'top') {
      createRow(group, 100);
    } else if (layoutName === 'row') {
      createRow(group, 200);
    } else if (layoutName === 'bottom') {
      createRow(group, 300);
    } else if (layoutName === 'border') {
      // First fill the four corners.
      // Then split remainder into 4 groups. Distribute group one along the top,
      // group 2 along the right, etc.
      if (count > 0) {
        group[0].x = minX;
        group[0].y = minY;
        group[0].rotation = 0;
      }
      if (count > 1) {
        group[1].x = maxX;
        group[1].y = minY;
        group[1].rotation = 0;
      }
      if (count > 2) {
        group[2].x = maxX;
        group[2].y = maxY;
        group[2].rotation = 0;
      }
      if (count > 3) {
        group[3].x = minX;
        group[3].y = maxY;
        group[3].rotation = 0;
      }
      if (count > 4) {
        const topCount = Math.ceil((count - 4 - 0) / 4);
        const rightCount = Math.ceil((count - 4 - 1) / 4);
        const bottomCount = Math.ceil((count - 4 - 2) / 4);
        const leftCount = Math.ceil((count - 4 - 3) / 4);

        for (let i = 0; i < topCount; i++) {
          const sprite = group[4 + i];
          // We want to include the corners in our total count so that the first
          // inner sprite is > 0 and the last inner sprite is < 1 when we lerp.
          sprite.x = this.p5.lerp(minX, maxX, (i + 1) / (topCount + 1));
          sprite.y = minY;
          sprite.rotation = 0;
        }

        for (let i = 0; i < rightCount; i++) {
          const sprite = group[4 + topCount + i];
          sprite.x = maxX;
          sprite.y = this.p5.lerp(minY, maxY, (i + 1) / (rightCount + 1));
          sprite.rotation = 0;
        }

        for (let i = 0; i < bottomCount; i++) {
          const sprite = group[4 + topCount + rightCount + i];
          sprite.x = this.p5.lerp(minX, maxX, (i + 1) / (bottomCount + 1));
          sprite.y = maxY;
          sprite.rotation = 0;
        }

        for (let i = 0; i < leftCount; i++) {
          const sprite = group[4 + topCount + rightCount + bottomCount + i];
          sprite.x = minX;
          sprite.y = this.p5.lerp(minY, maxY, (i + 1) / (leftCount + 1));
          sprite.rotation = 0;
        }
      }
    } else if (layoutName === 'circle') {
      // Adjust radius of circle and size of the sprite according to number of
      // sprites in our group.
      const pct = this.p5.constrain(count / 10, 0, 1);
      const radius = this.p5.lerp(50, maxCircleRadius, pct);
      const scale = this.p5.lerp(0.8, 0.3, pct * pct);
      const startAngle = -Math.PI / 2;
      const deltaAngle = (2 * Math.PI) / count;

      group.forEach((sprite, i) => {
        const angle = deltaAngle * i + startAngle;
        sprite.x = 200 + radius * Math.cos(angle);
        sprite.y = 200 + radius * Math.sin(angle);
        sprite.rotation = (angle - startAngle) * radiansToDegrees;
        sprite.scale = scale;
      });
    } else if (layoutName === 'grid') {
      // Create a grid where the width is the square root of the count, rounded up,
      // and the height is the number of rows needed to fill in count cells.
      // For our last row, we might have empty cells in our grid (but the row
      // structure will be the same).
      const numCols = Math.ceil(Math.sqrt(count));
      const numRows = Math.ceil(count / numCols);
      group.forEach((sprite, i) => {
        const row = Math.floor(i / numCols);
        const col = i % numCols;
        // || 0 so that we recover from div 0.
        sprite.x = this.p5.lerp(minX, maxX, col / (numCols - 1) || 0);
        sprite.y = this.p5.lerp(minY, maxY, row / (numRows - 1) || 0);
        sprite.rotation = 0;
      });
    } else if (layoutName === 'left') {
      createColumn(group, 100);
    } else if (layoutName === 'column') {
      createColumn(group, 200);
    } else if (layoutName === 'right') {
      createColumn(group, 300);
    } else {
      throw new Error('Unexpected layout: ' + layoutName);
    }

    // We want sprites that are lower in the canvas to show up on top of those
    // that are higher.
    // We also add a fractional component based on x to avoid z-fighting (except
    // in cases where we have identical x and y).
    group.forEach(sprite => {
      adjustSpriteDepth(sprite);
    });
  },

  isKeyPressed(key) {
    return this.p5.keyDown(key);
  },

  isTouchingEdges(spriteArg) {
    if (!this.p5.edges) {
      this.p5.createEdgeSprites();
    }
    let sprites = this.getSpriteArray(spriteArg);
    let touching = false;
    sprites.forEach(sprite => {
      if (sprite.isTouching(this.p5.edges)) {
        touching = true;
      }
    });
    return touching;
  },

  isTouchingSprite(spriteArg, targetArg) {
    let sprites = this.getSpriteArray(spriteArg);
    let targets = this.getSpriteArray(targetArg);
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

  jumpTo(spriteArg, location) {
    if (!location) {
      return;
    }
    let sprites = this.getSpriteArray(spriteArg);
    sprites.forEach(sprite => {
      sprite.x = location.x;
      sprite.y = location.y;
    });
  },

  mirrorSprite(spriteArg, direction) {
    let sprites = this.getSpriteArray(spriteArg);
    sprites.forEach(sprite => {
      if (direction === 'right') {
        sprite.mirrorX(1);
      } else {
        sprite.mirrorX(-1);
      }
    });
  },

  moveForward(spriteArg, distance) {
    move(this, spriteArg, distance);
  },

  moveBackward(spriteArg, distance) {
    move(this, spriteArg, -1 * distance);
  },

  moveInDirection(spriteArg, distance, direction) {
    let sprites = this.getSpriteArray(spriteArg);
    let dirs = {
      North: sprite => (sprite.y -= distance),
      East: sprite => (sprite.x += distance),
      South: sprite => (sprite.y += distance),
      West: sprite => (sprite.x -= distance)
    };
    if (!dirs[direction]) {
      console.error('invalid direction: ' + direction);
      return;
    }
    sprites.forEach(sprite => {
      dirs[direction](sprite);
    });
  },

  moveToward(spriteArg, distance, target) {
    let sprites = this.getSpriteArray(spriteArg);
    sprites.forEach(sprite => {
      if (sprite && target) {
        const distanceFromSpriteToTarget = Math.sqrt(
          (sprite.x - target.x) ** 2 + (sprite.y - target.y) ** 2
        );
        if (distanceFromSpriteToTarget < distance) {
          sprite.x = target.x;
          sprite.y = target.y;
          return;
        }
        let angle = Math.atan2(target.y - sprite.y, target.x - sprite.x);
        if (!isNaN(angle)) {
          let dy = Math.sin(angle) * distance;
          let dx = Math.cos(angle) * distance;
          sprite.x += dx;
          sprite.y += dy;
        }
      }
    });
  },

  setDefaultSpriteSize(size) {
    this.defaultSpriteSize = size;
  },

  setProp(spriteArg, prop, val) {
    if (val === undefined) {
      return;
    }
    let sprites = this.getSpriteArray(spriteArg);
    let specialCases = {
      direction: sprite => (sprite.direction = val % 360),
      draggable: sprite => {
        if (val) {
          this.addBehavior(sprite, {
            func: behaviorCommands.draggableFunc.apply(this),
            name: 'draggable'
          });
        } else {
          this.removeBehavior(sprite, {
            func: behaviorCommands.draggableFunc.apply(this),
            name: 'draggable'
          });
        }
      },
      height: sprite =>
        (sprite.height = (sprite.animation.getHeight() * val) / 100),
      scale: sprite => sprite.setScale(val / 100),
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

  spriteSay(spriteArg, text) {
    addSpriteSpeechBubble(this, spriteArg, text, 4 /* seconds */, 'say');
  },

  spriteSayTime(spriteArg, text, seconds) {
    addSpriteSpeechBubble(this, spriteArg, text, seconds, 'say');
  },

  spriteThink(spriteArg, text) {
    addSpriteSpeechBubble(this, spriteArg, text, 4 /* seconds */, 'think');
  },

  spriteThinkTime(spriteArg, text, seconds) {
    addSpriteSpeechBubble(this, spriteArg, text, seconds, 'think');
  },

  removeTint(spriteArg) {
    let sprites = this.getSpriteArray(spriteArg);
    sprites.forEach(sprite => (sprite.tint = null));
  },

  setTint(spriteArg, color) {
    let sprites = this.getSpriteArray(spriteArg);
    sprites.forEach(sprite => (sprite.tint = color));
  },

  turn(spriteArg, degrees, direction) {
    if (!degrees) {
      return;
    }
    let sprites = this.getSpriteArray(spriteArg);
    sprites.forEach(sprite => {
      if (direction === 'right') {
        sprite.rotation += degrees;
        sprite.direction += degrees;
      } else {
        sprite.rotation -= degrees;
        sprite.direction -= degrees;
      }
    });
  }
};
