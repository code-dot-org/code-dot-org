var spriteId = 0;
var nativeSpriteMap = {};
var inputEvents = [];
var behaviors = [];
export var background;
export var title = '';
export var subtitle = '';

function allSpritesWithAnimation(animation) {
  let group = [];
  Object.keys(nativeSpriteMap).forEach(spriteId => {
    if (nativeSpriteMap[spriteId].getAnimationLabel() === animation) {
      group.push(nativeSpriteMap[spriteId]);
    }
  });
  return group;
}

export function singleOrGroup(spriteOrGroup) {
  if (typeof spriteOrGroup === 'number') {
    const sprite = nativeSpriteMap[spriteOrGroup];
    return [sprite];
  }
  if (typeof spriteOrGroup === 'string') {
    return allSpritesWithAnimation(spriteOrGroup);
  }
  return [];
}

export function addSprite(sprite) {
  nativeSpriteMap[spriteId] = sprite;
  sprite.id = spriteId;
  spriteId++;
  return sprite.id;
}

export function deleteSprite(spriteId) {
  delete nativeSpriteMap[spriteId];
}

export function resetSpriteMap() {
  nativeSpriteMap = {};
  spriteId = 0;
  inputEvents = [];
  behaviors = [];
}

export function addEvent(type, args, callback) {
  inputEvents.push({type: type, args: args, callback: callback});
}

function checkEvent(inputEvent, p5Inst) {
  let shouldEventFire = false;
  let sprites;
  let targets;
  switch (inputEvent.type) {
    case 'whenpress':
      return p5Inst.keyWentDown(inputEvent.args.key);
    case 'whilepress':
      return p5Inst.keyDown(inputEvent.args.key);
    case 'whentouch': {
      sprites = singleOrGroup(inputEvent.args.sprite1);
      targets = singleOrGroup(inputEvent.args.sprite2);
      let anyOverlap = false;
      sprites.forEach(sprite => {
        targets.forEach(target => {
          if (sprite.overlap(target)) {
            anyOverlap = true;
          }
        });
      });
      if (anyOverlap && !inputEvent.firedOnce) {
        shouldEventFire = true;
        inputEvent.firedOnce = true;
      }
      if (!anyOverlap) {
        inputEvent.firedOnce = false;
      }
      return shouldEventFire;
    }
    case 'whiletouch':
      sprites = singleOrGroup(inputEvent.args.sprite1);
      targets = singleOrGroup(inputEvent.args.sprite2);
      sprites.forEach(sprite => {
        targets.forEach(target => {
          if (sprite.overlap(target)) {
            shouldEventFire = true;
          }
        });
      });
      return shouldEventFire;
    case 'whenclick':
      if (p5Inst.mouseWentDown('leftButton')) {
        sprites = singleOrGroup(inputEvent.args.sprite);
        sprites.forEach(sprite => {
          if (p5Inst.mouseIsOver(sprite)) {
            shouldEventFire = true;
          }
        });
      }
      return shouldEventFire;
    case 'whileclick':
      sprites = singleOrGroup(inputEvent.args.sprite);
      sprites.forEach(sprite => {
        if (p5Inst.mousePressedOver(sprite)) {
          shouldEventFire = true;
        }
      });
      return shouldEventFire;
  }
}

export function runEvents() {
  inputEvents.forEach(inputEvent => {
    if (checkEvent(inputEvent, this)) {
      inputEvent.callback();
    }
  });
}

export function addBehavior(sprite, behavior) {
  if (sprite && behavior) {
    if (
      !behaviors.find(
        b => b.sprite === sprite && b.intFunc === behavior.intFunc
      )
    ) {
      behaviors.push({
        intFunc: behavior.intFunc,
        sprite: sprite,
        func: behavior.func
      });
    }
  }
}

export function removeAllBehaviors(sprite) {
  let newBehaviors = [];
  behaviors.forEach(behavior => {
    if (behavior.sprite !== sprite) {
      newBehaviors.push(behavior);
    }
  });
  behaviors = newBehaviors;
}

export function removeBehavior(sprite, behavior) {
  if (sprite && behavior) {
    let index = behaviors.findIndex(
      b => b.sprite === sprite && b.intFunc === behavior.intFunc
    );
    if (index !== -1) {
      behaviors.splice(index, 1);
    }
  }
}

export function runBehaviors() {
  behaviors.forEach(behavior => {
    behavior.func(behavior.sprite.id);
  });
}
