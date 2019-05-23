var spriteId = 0;
var nativeSpriteMap = {};
var inputEvents = [];
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
}

export function addEvent(type, args, callback) {
  console.log('before');
  inputEvents.push({type: type, args: args, callback: callback});
  console.log('after');
  return;
}

function checkEvent(inputEvent, p5Inst) {
  let shouldEventFire = false;
  let sprites;
  switch (inputEvent.type) {
    case 'whenkey':
      return p5Inst.keyWentDown(inputEvent.args.key);
    case 'whilekey':
      return p5Inst.keyDown(inputEvent.args.key);
    case 'whentouch':
      console.log(3);
      return;
    case 'whiletouch':
      console.log(4);
      return;
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
