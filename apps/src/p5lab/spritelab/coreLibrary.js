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
 * Returns a list of sprites, specified either by id, name, or animation name.
 * @param {Object} spriteArg - Specifies a sprite or group of sprites by id, name, or animation name.
 * @return {[Sprite]} List of sprites that match the parameter. Either a list containing the one sprite
 * the specified id/name, or a list containing all sprites with the specified animation.
 */
export function getSpriteArray(spriteArg) {
  if (!spriteArg) {
    return [];
  }
  if (spriteArg.hasOwnProperty('id')) {
    let sprite = nativeSpriteMap[spriteArg.id];
    if (sprite) {
      return [sprite];
    }
  }
  if (spriteArg.name) {
    let sprite = Object.values(nativeSpriteMap).find(
      sprite => sprite.name === spriteArg.name
    );
    if (sprite) {
      return [sprite];
    }
  }
  if (spriteArg.costume) {
    if (spriteArg.costume === 'all') {
      return Object.values(nativeSpriteMap);
    } else {
      return Object.values(nativeSpriteMap).filter(
        sprite => sprite.getAnimationLabel() === spriteArg.costume
      );
    }
  }
  return [];
}

export function getAnimationsInUse() {
  let animations = new Set();
  Object.values(nativeSpriteMap).filter(sprite =>
    animations.add(sprite.getAnimationLabel())
  );

  return Array.from(animations);
}

/**
 * @param {string} animation
 * @return {number} Number of behaviors associated with the specified animation.
 */
export function getNumBehaviorsForAnimation(animation) {
  let numBehaviors = 0;
  behaviors.forEach(behavior => {
    if (behavior.sprite.getAnimationLabel() === animation) {
      numBehaviors++;
    }
  });
  return numBehaviors;
}

/**
 * @param {number} spriteId
 * @return {number} Number of behaviors associated with the specified sprite
 */
export function getNumBehaviorsForSpriteId(spriteId) {
  let numBehaviors = 0;
  behaviors.forEach(behavior => {
    if (behavior.sprite.id === spriteId) {
      numBehaviors++;
    }
  });
  return numBehaviors;
}

/**
 * @param {number} spriteId
 * @return {[String]} List containing the names of the behaviors associated
 * with the specified sprite
 */
export function getBehaviorsForSpriteId(spriteId) {
  let spriteBehaviors = [];
  behaviors.forEach(behavior => {
    if (behavior.sprite.id === spriteId) {
      spriteBehaviors.push(behavior.name);
    }
  });
  return spriteBehaviors;
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
export function addSprite(sprite, name) {
  nativeSpriteMap[spriteId] = sprite;
  sprite.id = spriteId;
  if (name) {
    enforceUniqueSpriteName(name);
    sprite.name = name;
  }
  spriteId++;
  return sprite.id;
}

/**
 * Enforces that two sprites cannot have the same name. This is enforced by clearing
 * the name from any existing sprites when a new sprite is created with that name.
 * @param {String} name
 */
function enforceUniqueSpriteName(name) {
  Object.values(nativeSpriteMap).forEach(sprite => {
    if (sprite.name === name) {
      sprite.name = undefined;
    }
  });
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

function atTimeEvent(inputEvent, p5Inst) {
  if (inputEvent.args.unit === 'seconds') {
    const previousTime = inputEvent.previousTime || 0;
    inputEvent.previousTime = p5Inst.World.seconds;
    // There are many ticks per second, but we only want to fire the event once (on the first tick where
    // World.seconds matches the event argument)
    if (
      p5Inst.World.seconds === inputEvent.args.n &&
      previousTime !== inputEvent.args.n
    ) {
      // Call callback with no extra args
      return [{}];
    }
  } else if (inputEvent.args.unit === 'frames') {
    if (p5Inst.frameCount === inputEvent.args.n) {
      // Call callback with no extra args
      return [{}];
    }
  }
  // Don't call callback
  return [];
}

function whenPressEvent(inputEvent, p5Inst) {
  if (p5Inst.keyWentDown(inputEvent.args.key)) {
    // Call callback with no extra args
    return [{}];
  } else {
    // Don't call callback
    return [];
  }
}

function whilePressEvent(inputEvent, p5Inst) {
  if (p5Inst.keyDown(inputEvent.args.key)) {
    // Call callback with no extra args
    return [{}];
  } else {
    // Don't call callback
    return [];
  }
}

function whenTouchEvent(inputEvent) {
  let getFired = function(map, spriteId, targetId) {
    if (map && map[spriteId] && map[spriteId][targetId]) {
      return map[spriteId][targetId].firedOnce;
    }
  };
  let setFired = function(map, spriteId, targetId, fired) {
    if (!map) {
      map = {};
    }
    if (!map[spriteId]) {
      map[spriteId] = {};
    }
    if (!map[spriteId][targetId]) {
      map[spriteId][targetId] = {};
    }
    map[spriteId][targetId].firedOnce = fired;
  };
  let sprites = getSpriteArray(inputEvent.args.sprite1);
  let targets = getSpriteArray(inputEvent.args.sprite2);
  let callbackArgList = [];
  let previousCollisions = inputEvent.previous;

  // We need to clear out previous, so that events get re-triggered when sprite animations change
  inputEvent.previous = {};
  sprites.forEach(sprite => {
    targets.forEach(target => {
      let firedOnce = getFired(previousCollisions, sprite.id, target.id);
      if (sprite.overlap(target)) {
        if (!firedOnce) {
          // Sprites are overlapping, and we haven't fired yet for this collision,
          // so we should fire the callback
          callbackArgList.push({
            subjectSprite: sprite.id,
            objectSprite: target.id
          });
          firedOnce = true;
        }
      } else {
        // Sprites are not overlapping (anymore), so we should make sure firedOnce is
        // set to false, so that if the sprites overlap again, we will fire the callback.
        // This is required to handle the case where sprites start touching, stop touching, and start
        // touching again- we want the callback to fire two times.
        firedOnce = false;
      }
      setFired(inputEvent.previous, sprite.id, target.id, firedOnce);
    });
  });
  return callbackArgList;
}

function whileTouchEvent(inputEvent) {
  let callbackArgList = [];
  let sprites = getSpriteArray(inputEvent.args.sprite1);
  let targets = getSpriteArray(inputEvent.args.sprite2);
  sprites.forEach(sprite => {
    targets.forEach(target => {
      if (sprite.overlap(target)) {
        callbackArgList.push({
          subjectSprite: sprite.id,
          objectSprite: target.id
        });
      }
    });
  });
  return callbackArgList;
}

function whenClickEvent(inputEvent, p5Inst) {
  let callbackArgList = [];
  if (p5Inst.mouseWentDown('leftButton')) {
    let sprites = getSpriteArray(inputEvent.args.sprite);
    sprites.forEach(sprite => {
      if (p5Inst.mouseIsOver(sprite)) {
        callbackArgList.push({clickedSprite: sprite.id});
      }
    });
  }
  return callbackArgList;
}

function whileClickEvent(inputEvent, p5Inst) {
  let callbackArgList = [];
  let sprites = getSpriteArray(inputEvent.args.sprite);
  sprites.forEach(sprite => {
    if (p5Inst.mousePressedOver(sprite)) {
      callbackArgList.push({clickedSprite: sprite.id});
    }
  });
  return callbackArgList;
}

function checkEvent(inputEvent, p5Inst) {
  switch (inputEvent.type) {
    case 'atTime':
      return atTimeEvent(inputEvent, p5Inst);
    case 'whenpress':
      return whenPressEvent(inputEvent, p5Inst);
    case 'whilepress':
      return whilePressEvent(inputEvent, p5Inst);
    case 'whentouch':
      return whenTouchEvent(inputEvent);
    case 'whiletouch':
      return whileTouchEvent(inputEvent);
    case 'whenclick':
      return whenClickEvent(inputEvent, p5Inst);
    case 'whileclick':
      return whileClickEvent(inputEvent, p5Inst);
  }
}

export function runEvents(p5Inst) {
  inputEvents.forEach(inputEvent => {
    let callbackArgList = checkEvent(inputEvent, p5Inst);
    callbackArgList.forEach(args => {
      inputEvent.callback(args);
    });
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
  behaviors.forEach(behavior => behavior.func({id: behavior.sprite.id}));
}
