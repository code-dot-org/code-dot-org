import * as utils from './utils';

function getSprite(spriteArg) {
  const sprites = this.getSpriteArray(spriteArg);
  if (sprites.length === 0) {
    // This happens if the sprite was deleted within the same frame, so we
    // should just no-op
    return;
  } else if (sprites.length > 1) {
    // This shouldn't happen because we call behaviors by sprite id so there
    // should only be one sprite.
    console.warn('Multiple sprites for behavior');
    return;
  } else {
    return sprites[0];
  }
}

// These functions are duplicated from https://levelbuilder-studio.code.org/functions
// In Sprite Lab, behaviors are defined using blockly so that students can edit
// the behavior functions. In Poetry, we just need the function definitions, we don't
// need them to be editable by students.
export const commands = {
  fluttering(spriteArg) {
    const sprite = getSprite.call(this, spriteArg);
    if (!sprite) {
      return;
    }
    sprite.y += utils.randomInt(-1, 1);
  },

  growing(spriteArg) {
    const sprite = getSprite.call(this, spriteArg);
    if (!sprite) {
      return;
    }
    sprite.setScale(sprite.getScale() + 1 / 100);
  },

  jittering(spriteArg) {
    const sprite = getSprite.call(this, spriteArg);
    if (!sprite) {
      return;
    }
    sprite.setScale(sprite.getScale() + utils.randomInt(-1, 1) / 100);
  },

  moving_north_and_looping(spriteArg) {
    const sprite = getSprite.call(this, spriteArg);
    if (!sprite) {
      return;
    }
    sprite.y -= sprite.speed;
    if (sprite.y < -50) {
      sprite.y = 450;
    }
  },

  moving_south_and_looping(spriteArg) {
    const sprite = getSprite.call(this, spriteArg);
    if (!sprite) {
      return;
    }
    sprite.y += sprite.speed;
    if (sprite.y > 450) {
      sprite.y = -50;
    }
  },

  moving_east_and_looping(spriteArg) {
    const sprite = getSprite.call(this, spriteArg);
    if (!sprite) {
      return;
    }
    sprite.mirrorX(1);

    sprite.x += sprite.speed;
    if (sprite.x > 450) {
      sprite.x = -50;
    }
  },

  moving_west_and_looping(spriteArg) {
    const sprite = getSprite.call(this, spriteArg);
    if (!sprite) {
      return;
    }
    sprite.mirrorX(-1);

    sprite.x -= sprite.speed;
    if (sprite.x < -50) {
      sprite.x = 450;
    }
  },

  shrinking(spriteArg) {
    const sprite = getSprite.call(this, spriteArg);
    if (!sprite) {
      return;
    }
    sprite.setScale(sprite.getScale() - 1 / 100);
    if (sprite.scale < 0) {
      sprite.scale = 0;
    }
  },

  spinning_left(spriteArg) {
    const sprite = getSprite.call(this, spriteArg);
    if (!sprite) {
      return;
    }
    sprite.rotation -= 6;
  },

  spinning_right(spriteArg) {
    const sprite = getSprite.call(this, spriteArg);
    if (!sprite) {
      return;
    }
    sprite.rotation += 6;
  },

  swimming_left_and_right(spriteArg) {
    const sprite = getSprite.call(this, spriteArg);
    if (!sprite) {
      return;
    }
    if (!this.p5.edges) {
      this.p5.createEdgeSprites();
    }

    if (sprite.direction === 0) {
      sprite.mirrorX(1);
    } else if (sprite.direction === 180) {
      sprite.mirrorX(-1);
    }
    let direction = sprite.direction % 360;
    sprite.x += sprite.speed * Math.cos((direction * Math.PI) / 180);
    sprite.y += sprite.speed * Math.sin((direction * Math.PI) / 180);

    if (sprite.isTouching(this.p5.edges)) {
      this.p5.edges.displace(sprite);
      sprite.direction = (sprite.direction + 180) % 360;
    }
  },

  wandering(spriteArg) {
    const sprite = getSprite.call(this, spriteArg);
    if (!sprite) {
      return;
    }
    if (!this.p5.edges) {
      this.p5.createEdgeSprites();
    }

    if (utils.randomInt(0, 100) < 20) {
      sprite.direction = (sprite.direction + utils.randomInt(-25, 25)) % 360;
    }

    let direction = sprite.direction % 360;
    sprite.x += sprite.speed * Math.cos((direction * Math.PI) / 180);
    sprite.y += sprite.speed * Math.sin((direction * Math.PI) / 180);

    if (sprite.isTouching(this.p5.edges)) {
      this.p5.edges.displace(sprite);
      sprite.direction = (sprite.direction + utils.randomInt(135, 225)) % 360;
    }
    if (sprite.direction > 270 || sprite.direction < 90) {
      sprite.mirrorX(1);
    } else {
      sprite.mirrorX(-1);
    }
  },

  wobbling(spriteArg) {
    const sprite = getSprite.call(this, spriteArg);
    if (!sprite) {
      return;
    }
    if (utils.randomInt(0, 100) < 50) {
      sprite.rotation = utils.randomInt(-1, 1);
    }
  }
};
