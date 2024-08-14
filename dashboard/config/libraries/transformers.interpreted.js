// ******** COMMAND OVERRIDES FOR EXISTING SPRITE LAB BLOCKS ********
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
function setAnimation(spriteArg, costume) {
  // Only compatible with sprite costumes. Does not work for named sprites.
  if (!spriteArg.costume) {
    return;
  }
  var sprites = World.allSprites;
  var filteredSprites = [];
  // Get all sprites of the selected costume
  for (var i = 0; i < allSprites.length; i++) {
    if (allSprites[i].getAnimationLabel() === spriteArg.costume) {
      filteredSprites.push(allSprites[i]);
    }
  }
  for (var j = 0; j < filteredSprites.length; j++) {
    var sprite = filteredSprites[j];
    var currentSize = sprite.getScale() * 100;
    var currentCostumeDefaultSize = getDefaultSpriteScale(sprite.getAnimationLabel());
    var currentScaleFactor = currentSize / currentCostumeDefaultSize;
    var newCostumeDefaultSize = getDefaultSpriteScale(costume);
    var newSize = newCostumeDefaultSize * currentScaleFactor;
    // Adjust the size of the sprite based on branding guidelines.
    sprite.setScale(newSize / 100);
    // Remaining code follows implementation from p5lab/spritelab/commands/spriteCommands.js
    sprite.setAnimation(costume);
    sprite.scale /= sprite.baseScale;
    sprite.baseScale =
      100 /
      Math.max(
      100,
      sprite.animation.getHeight(),
      sprite.animation.getWidth()
    );
    sprite.scale *= sprite.baseScale;
  }
}

// ******** HELPER CODE FOR CUSTOM BLOCKS ********
// https://levelbuilder-studio.code.org/pools/transformers/blocks
function setTransformersSize(spriteArg, scale) {
  if(!scale) {
    scale = Math.random() * 2;
  }

  var defaultSize = getDefaultSpriteScale(spriteArg.costume);
  var size = scale * defaultSize;

  setProp(spriteArg, 'scale', size);
}
function setAllTransformersSize(scale) {
  // setTransformersSize({costume: 'all'}, value);
  var sprites = World.allSprites;
  for (var i = 0; i < sprites.length; i++) {
    var sprite = sprites[i];
    var defaultSize = getDefaultSpriteScale(sprite.getAnimationLabel());
    var size = (defaultSize / 100) * scale;
    sprite.setScale(size);
  }
}
function playSoundOptions(choice){
  playSound(choice);
}


// ******** CRITERION COMMAND ********
// Level 8 - Check that a sprite was resized.
function validateSpriteScaleChanged(){
  var sprites = World.allSprites;
  for (var i = 0; i < sprites.length; i++) {
    if(sprites[i].getScale() * 100 !== getDefaultSpriteScale(sprites[i])) {
      return true;
    }
  }
  return false;
}

// ******** HELPER FUNCTION TO GET RELATIVE SCALE PER BRANDING GUIDELINES ********
function getDefaultSpriteScale(costume) {
  var size;
  switch (costume) {
    case 'bumblebee_1':
      size = 220;
      break;
    case 'bumblebee_2':
      size = 200;
      break;
    case 'bumblebee_3':
      size = 220;
      break;
    case 'bumblebee_4':
      size = 218;
      break;
    case 'bumblebee_vehicle':
      size = 225;
      break;
    case 'elita_1':
      size = 215;
      break;
    case 'elita_2':
      size = 205;
      break;
    case 'elita_3':
      size = 175;
      break;
    case 'elita_4':
      size = 205;
      break;
    case 'elita_vehicle':
      size = 200;
      break;
    case 'megatron_1':
      size = 295;
      break;
    case 'megatron_2':
      size = 240;
      break;
    case 'megatron_3':
      size = 270;
      break;
    case 'megatron_4':
      size = 295;
      break;
    case 'megatron_vehicle':
      size = 248;
      break;
    case 'optimus_prime_1':
      size = 250;
      break;
    case 'optimus_prime_2':
      size = 207;
      break;
    case 'optimus_prime_3':
      size = 213;
      break;
    case 'optimus_prime_4':
      size = 217;
      break;
    case 'optimus_prime_vehicle':
      size = 205;
      break;
    case 'cog':
      size = 48;
      break;
    default:
      size = 100;
      break;
  }
  return size;
}
