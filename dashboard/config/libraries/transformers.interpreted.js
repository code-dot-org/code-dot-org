function getDefaultSpriteScale(costume) {
  var size;
  switch (costume) {
    case 'optimus_prime_3':
      size = 200;
      break;
    default:
      size = 200;
      break;
  }
  return size;
}

function makeNewSpriteAnon(costume, location) {
  createNewSprite({name: 'newTransformersSprite'}, costume, location);
  var size = getDefaultSpriteScale(costume);
  setProp({name: 'newTransformersSprite'}, "scale", size);
}

function makeNumSprites(count, costume) {
  for (var i = 0; i < count; i++) {
    createNewSprite(
      {name: 'newTransformersSprite'},
      costume,
      randomLocation()
    );
    var size = getDefaultSpriteScale(costume);
    setProp({name: 'newTransformersSprite'}, "scale", size);
  }
}

function setTransformersSize(spriteArg, value) {
  if(!value) {
    value = Math.random() * 2;
  }

  var size = getDefaultSpriteScale(spriteArg.costume);
  value = value * size;

  setProp(spriteArg, 'scale', value);
}

function setAllTransformersSize(value) {
  setTransformersSize({costume: 'all'}, value);
}

function playSoundOptions(choice){
  playSound(choice);
}