var spriteId = 0;
var nativeSpriteMap = {};
var inputEvents = [];
var behaviors = [];

export var background;
export var title = '';
export var subtitle = '';

export function reset() {
  spriteId = 0;
  nativeSpriteMap = {};
  inputEvents = [];
  behaviors = [];
  background = 'white';
  title = subtitle = '';
}

/**
 * Returns a list of all sprites that have the specified animation.
 * Called on each tick of the draw loop because animations can change throughout runtime.
 * @param {string} animation - animation name
 */
function allSpritesWithAnimation(animation) {
  let group = [];
  Object.keys(nativeSpriteMap).forEach(spriteId => {
    if (nativeSpriteMap[spriteId].getAnimationLabel() === animation) {
      let sprite = nativeSpriteMap[spriteId];
      if (sprite) {
        group.push(sprite);
      }
    }
  });
  return group;
}

/**
 * Returns a list of sprites, specified either by id or animation name.
 * @param {(string|number)} spriteOrGroup - Either the id or the animation name
 * @return {[Sprite]} List of sprites that match the parameter. Either a list containing the one sprite
 * the specified id, or a list containing all sprites with the specified animation.
 */
export function singleOrGroup(spriteOrGroup) {
  if (typeof spriteOrGroup === 'number') {
    const sprite = nativeSpriteMap[spriteOrGroup];
    if (sprite) {
      return [sprite];
    }
  }
  if (typeof spriteOrGroup === 'string') {
    return allSpritesWithAnimation(spriteOrGroup);
  }
  return [];
}

export function getAnimationsInUse() {
  let animations = new Set();
  Object.keys(nativeSpriteMap).forEach(spriteId => {
    animations.add(nativeSpriteMap[spriteId].getAnimationLabel());
  });
  return Array.from(animations);
}

export function getBehaviorsForAnimation(animation) {
  let numBehaviors = 0;
  behaviors.forEach(behavior => {
    if (behavior.sprite.getAnimationLabel() === animation) {
      numBehaviors++;
    }
  });
  return numBehaviors;
}

export function getSpriteIdsInUse() {
  let spriteIds = [];
  Object.keys(nativeSpriteMap).forEach(spriteId =>
    spriteIds.push(parseInt(spriteId))
  );
  return spriteIds;
}

/**
 * Adds the specified sprite to the native sprite map
 * @param {Sprite} sprite
 * @returns {Number} A unique id to reference the sprite.
 */
export function addSprite(sprite) {
  nativeSpriteMap[spriteId] = sprite;
  sprite.id = spriteId;
  spriteId++;
  return sprite.id;
}

/**
 * Removes a sprite from the native sprite map
 * @param {Number} spriteId
 */
export function deleteSprite(spriteId) {
  delete nativeSpriteMap[spriteId];
}

export function addEvent(type, args, callback) {
  inputEvents.push({type: type, args: args, callback: callback});
}

function checkEvent(inputEvent, p5Inst) {
  let shouldEventFire = false;
  let extraArgs = {};
  switch (inputEvent.type) {
    case 'whenpress':
      shouldEventFire = p5Inst.keyWentDown(inputEvent.args.key);
      return {shouldEventFire: shouldEventFire, extraArgs: extraArgs};
    case 'whilepress':
      shouldEventFire = p5Inst.keyDown(inputEvent.args.key);
      return {shouldEventFire: shouldEventFire, extraArgs: extraArgs};
    case 'whentouch': {
      let sprites = singleOrGroup(inputEvent.args.sprite1);
      let targets = singleOrGroup(inputEvent.args.sprite2);
      let overlap = false;
      sprites.forEach(sprite => {
        targets.forEach(target => {
          if (sprite.overlap(target)) {
            extraArgs.sprite = sprite.id;
            extraArgs.target = target.id;
            overlap = true;
          }
        });
      });
      if (overlap && !inputEvent.firedOnce) {
        shouldEventFire = true;
        inputEvent.firedOnce = true;
      }
      if (!overlap) {
        inputEvent.firedOnce = false;
      }
      return {shouldEventFire: shouldEventFire, extraArgs: extraArgs};
    }
    case 'whiletouch': {
      let sprites = singleOrGroup(inputEvent.args.sprite1);
      let targets = singleOrGroup(inputEvent.args.sprite2);
      sprites.forEach(sprite => {
        targets.forEach(target => {
          if (sprite.overlap(target)) {
            extraArgs.sprite = sprite.id;
            extraArgs.target = target.id;
            shouldEventFire = true;
          }
        });
      });
      return {shouldEventFire: shouldEventFire, extraArgs: extraArgs};
    }
    case 'whenclick': {
      if (p5Inst.mouseWentDown('leftButton')) {
        let sprites = singleOrGroup(inputEvent.args.sprite);
        sprites.forEach(sprite => {
          if (p5Inst.mouseIsOver(sprite)) {
            extraArgs.sprite = sprite.id;
            shouldEventFire = true;
          }
        });
      }
      return {shouldEventFire: shouldEventFire, extraArgs: extraArgs};
    }
    case 'whileclick': {
      let sprites = singleOrGroup(inputEvent.args.sprite);
      sprites.forEach(sprite => {
        if (p5Inst.mousePressedOver(sprite)) {
          extraArgs.sprite = sprite.id;
          shouldEventFire = true;
        }
      });
      return {shouldEventFire: shouldEventFire, extraArgs: extraArgs};
    }
  }
}

export function runEvents(p5Inst) {
  inputEvents.forEach(inputEvent => {
    let check = checkEvent(inputEvent, p5Inst);
    if (check && check.shouldEventFire) {
      inputEvent.callback(check.extraArgs);
    }
  });
}

export function addBehavior(sprite, behavior) {
  if (sprite && behavior) {
    let existing = behaviors.find(
      b => b.sprite === sprite && b.name === behavior.name
    );
    if (!existing) {
      behaviors.push({
        func: behavior.func,
        name: behavior.name,
        sprite: sprite
      });
    }
  }
}

export function removeAllBehaviors(sprite) {
  behaviors = behaviors.filter(behavior => behavior.sprite !== sprite);
}

export function removeBehavior(sprite, behavior) {
  if (sprite && behavior) {
    let index = behaviors.findIndex(
      b => b.sprite === sprite && b.name === behavior.name
    );
    if (index !== -1) {
      behaviors.splice(index, 1);
    }
  }
}

export function runBehaviors() {
  behaviors.forEach(behavior => behavior.func(behavior.sprite.id));
}
